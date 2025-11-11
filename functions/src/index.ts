import { onRequest } from "firebase-functions/v2/https";
import { onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import type { Request, Response } from "express";
import { defineString } from "firebase-functions/params";
import * as nodemailer from "nodemailer";
import { google } from "googleapis";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

admin.initializeApp();
setGlobalOptions({ region: "southamerica-east1", maxInstances: 10 });

const isLocal = process.env.FUNCTIONS_EMULATOR === "true";
const MP_ACCESS_TOKEN = isLocal
  ? process.env.MERCADOPAGO_TOKEN_TEST
  : process.env.MERCADOPAGO_TOKEN_PROD;

// ENV Gmail / reCAPTCHA
const gmailClientId = defineString("GMAIL_CLIENT_ID");
const gmailClientSecret = defineString("GMAIL_CLIENT_SECRET");
const gmailRefreshToken = defineString("GMAIL_REFRESH_TOKEN");
const gmailEmail = defineString("GMAIL_EMAIL");
const recaptchaSecret = defineString("RECAPTCHA_SECRET");

// ───────────────────────────────────────────────────────────────────────────────
// Helpers mínimos (sin reglas nuevas)
function sanitize(text: string | null, maxLength: number): string | null {
  if (!text) return null;
  return text.replace(/[<>]/g, "").trim().slice(0, maxLength);
}

// Test endpoint
export const ping = onRequest((req: Request, res: Response): void => {
  res.set("Access-Control-Allow-Origin", "*");
  res.status(200).send("ok");
});

// Crear preferencia Mercado Pago
export const createPreference = onRequest(async (req: Request, res: Response): Promise<void> => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido" }); return; }

  try {
    const { items, orderId } = req.body || {};
    if (!items || !Array.isArray(items) || items.length === 0 || !orderId) {
      res.status(400).json({ error: "Faltan parámetros" });
      return;
    }
    const token = MP_ACCESS_TOKEN;
    if (!token) { res.status(500).json({ error: "Token de MercadoPago no configurado" }); return; }

    const preference = {
      items: items.map((item: any) => ({
        title: `${item.nombre}${item.variantLabel ? ` (${item.variantLabel})` : ""}`,
        unit_price: Number(item.precioUnitario),
        quantity: Number(item.cantidad),
      })),
      back_urls: {
        success: `https://epikuscake.web.app/payment-success?orderId=${orderId}`,
        failure: "https://epikuscake.web.app/confirm-order",
      },
      auto_return: "approved",
      external_reference: orderId,
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(preference),
    });
    const data = await response.json();

    res.status(200).json({ preferenceId: data?.id ?? null, initPoint: data?.init_point ?? null });
  } catch (err: any) {
    console.error("Error en createPreference:", err);
    res.status(500).json({ error: err?.message ?? "Error interno" });
  }
});

// Webhook MP (firma + idempotencia + update pedido)
export const mercadopagoWebhook = onRequest(async (req: Request, res: Response): Promise<void> => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido" }); return; }

  try {
    const signature = req.header("x-signature") || "";
    const requestId = req.header("x-request-id") || "";
    const secret = process.env.MP_WEBHOOK_SECRET || "";
    if (!signature || !requestId || !secret) { res.status(401).send("missing-signature"); return; }

    const [tsPart, v1Part] = signature.split(",");
    const ts = (tsPart || "").replace("ts=", "");
    const v1 = (v1Part || "").replace("v1=", "");

    const { type, data } = req.body || {};
    const paymentId = String(data?.id || "");
    if (!paymentId) { res.status(400).json({ error: "Payment ID no encontrado" }); return; }

    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
    const calc = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
    if (calc !== v1) { res.status(401).send("invalid-signature"); return; }

    // Idempotencia
    const idemRef = admin.firestore().collection("mp_payments").doc(paymentId);
    if ((await idemRef.get()).exists) { res.status(200).send("ok"); return; }
    await idemRef.set({ requestId, ts, receivedAt: admin.firestore.FieldValue.serverTimestamp() });

    if (type !== "payment") { res.status(200).send("ok"); return; }

    const resp = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
    });
    if (!resp.ok) { res.status(502).json({ error: "MP fetch error" }); return; }

    const payment = await resp.json();
    const orderId = payment.external_reference;
    const status = payment.status;
    if (!orderId) { console.error("Pago sin external_reference:", paymentId); res.status(200).send("ok"); return; }

    const orderRef = admin.firestore().collection("pedidos").doc(orderId);

    if (status === "approved") {
      await orderRef.update({
        status: "en_proceso",
        "pago.acreditado": true,
        "pago.mercadopago": {
          paymentId: payment.id,
          status: payment.status,
          statusDetail: payment.status_detail,
          transactionAmount: payment.transaction_amount,
          paymentMethodId: payment.payment_method_id,
          paymentTypeId: payment.payment_type_id,
          dateApproved: payment.date_approved,
          installments: payment.installments || 1,
          cardLastFourDigits: payment.card?.last_four_digits || null,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else if (status === "rejected") {
      await orderRef.update({
        status: "cancelado",
        "pago.mercadopago": {
          paymentId: payment.id,
          status: payment.status,
          statusDetail: payment.status_detail,
          transactionAmount: payment.transaction_amount,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log(`Webhook OK - Order:${orderId} Payment:${paymentId} Status:${status}`);
    res.status(200).send("ok");
  } catch (err: any) {
    console.error("webhook error:", err);
    res.status(500).json({ error: err?.message ?? "Error interno" });
  }
});

// Nodemailer (OAuth2)
async function createTransporter() {
  const OAuth2 = google.auth.OAuth2;
  const oauth2Client = new OAuth2(
    gmailClientId.value(),
    gmailClientSecret.value(),
    "https://developers.google.com/oauthplayground"
  );
  oauth2Client.setCredentials({ refresh_token: gmailRefreshToken.value() });
  const accessToken = await oauth2Client.getAccessToken();

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: gmailEmail.value(),
      clientId: gmailClientId.value(),
      clientSecret: gmailClientSecret.value(),
      refreshToken: gmailRefreshToken.value(),
      accessToken: accessToken.token || "",
    },
  });
}

// sendEmail (callable)
export const sendEmail = onCall(async (request) => {
  const { to, subject, text, html } = request.data || {};
  if (!to || !subject) throw new Error("Faltan parámetros requeridos: to, subject");

  const transporter = await createTransporter();
  const result = await transporter.sendMail({
    from: `Epikus Cake <${gmailEmail.value()}>`,
    to, subject, text, html,
  });

  console.log("Email enviado:", result.messageId);
  return { success: true, messageId: result.messageId };
});

// reCAPTCHA verify
export const verifyRecaptcha = onRequest(async (req: Request, res: Response): Promise<void> => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ ok: false, error: "method-not-allowed" }); return; }

  try {
    const token = req.body?.token as string | undefined;
    if (!token) { res.status(400).json({ ok: false, error: "missing-token" }); return; }

    const secret = recaptchaSecret.value();
    const verifyResp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = await verifyResp.json();
    const score = typeof data.score === "number" ? data.score : 0;
    const ok = !!data.success && score >= 0.5;
    res.status(200).json({ ok, score });
  } catch (err: any) {
    console.error("reCAPTCHA error:", err);
    res.status(500).json({ ok: false, error: err?.message ?? "internal-error" });
  }
});

// validateCart (callable) — igual que antes
export const validateCart = onCall(async (request) => {
  const { items } = request.data || {};
  if (!Array.isArray(items) || items.length === 0) throw new Error("Carrito vacío o inválido");

  try {
    const validatedItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, variantId, quantity } = item;
      const realProductId = productId.includes("-") ? productId.split("-")[0] : productId;

      const productSnap = await admin.firestore().collection("productos").doc(realProductId).get();
      if (!productSnap.exists) throw new Error(`Producto no encontrado: ${realProductId}`);

      const producto = productSnap.data() as any;
      if (!producto.activo) throw new Error(`El producto "${producto.nombre}" ya no está disponible`);

      let precioReal = 0;
      let stockDisponible = 0;
      let variantLabel: string | null = null;

      if (producto.tieneVariantes && Array.isArray(producto.variantes)) {
        if (!variantId) throw new Error(`Debes seleccionar un tamaño para "${producto.nombre}"`);
        const variant = producto.variantes.find((v: any) => v.id === variantId);
        if (!variant) throw new Error(`Variante no encontrada para "${producto.nombre}"`);
        precioReal = Number(variant.precio ?? 0);
        stockDisponible = Number(variant.stock ?? 0);
        variantLabel = variant.label;
      } else {
        precioReal = Number(producto.precio ?? 0);
        stockDisponible = Number(producto.stock ?? 0);
      }

      if (stockDisponible < quantity) {
        throw new Error(`Stock insuficiente para "${producto.nombre}"${variantLabel ? ` (${variantLabel})` : ""}. Disponible: ${stockDisponible}, solicitado: ${quantity}`);
      }
      if (precioReal <= 0) throw new Error(`Precio inválido para "${producto.nombre}"`);

      const subtotalItem = precioReal * quantity;
      subtotal += subtotalItem;

      validatedItems.push({
        productId,
        realProductId,
        variantId: variantId || null,
        variantLabel,
        nombre: producto.nombre,
        precioUnitario: precioReal,
        cantidad: quantity,
        stockDisponible,
        subtotalItem,
      });
    }

    return { ok: true, items: validatedItems, subtotal, timestamp: Date.now() };
  } catch (error: any) {
    console.error("validateCart error:", error);
    throw new Error(error.message || "Error al validar el carrito");
  }
});

// createOrder (callable) — SIN validación de anticipación / timezone extra
export const createOrder = onCall(async (request) => {
  if (!request.auth) throw new Error("Usuario no autenticado");
  const userUid = request.auth.uid;

  const {
    items,
    customer,               // { nombre, email|null, whatsapp }
    entrega,                // { tipo, fecha, hora }  ← se usan tal cual
    pago,                   // { metodoSeleccionado }
    dedicatoria = null,
    cantidadPersonas = null,
    notas = null,
    source = "web",
    terminosAceptados = false,
  } = request.data || {};

  if (!Array.isArray(items) || items.length === 0) throw new Error("Carrito vacío o inválido");
  if (!customer?.nombre || !customer?.whatsapp || !entrega?.fecha || !entrega?.hora) {
    throw new Error("Faltan datos requeridos de la orden");
  }
  if (!pago?.metodoSeleccionado || !["transferencia", "mercadopago"].includes(pago.metodoSeleccionado)) {
    throw new Error("Método de pago inválido");
  }
  if (!terminosAceptados) throw new Error("Debes aceptar los Términos y Condiciones.");

  // Rate limit
  const rateLimitRef = admin.firestore().collection("rateLimits").doc(userUid);
  const rateLimitDoc = await rateLimitRef.get();
  const now = Date.now();
  if (rateLimitDoc.exists) {
    const lastOrder = rateLimitDoc.data()?.lastOrderTime || 0;
    if (now - lastOrder < 30000) throw new Error("Esperá 30 segundos antes de crear otra orden");
  }

  const dedicatoriaSafe = sanitize(dedicatoria, 500);
  const notasSafe = sanitize(notas, 1000);
  const DESCUENTO_TRANSFERENCIA = 10;

  const orderRef = admin.firestore().collection("pedidos").doc();

  await admin.firestore().runTransaction(async (tx) => {
    let subtotal = 0;
    const itemsOut: any[] = [];

    for (const it of items) {
      const { productId, variantId, quantity } = it;
      if (!productId || typeof quantity !== "number" || quantity <= 0) {
        throw new Error("Ítem inválido en el carrito");
      }

      const realProductId = productId.includes("-") ? productId.split("-")[0] : productId;
      const pRef = admin.firestore().collection("productos").doc(realProductId);
      const snap = await tx.get(pRef);
      if (!snap.exists) throw new Error(`Producto no encontrado: ${realProductId}`);

      const producto = snap.data() as any;
      if (!producto.activo) throw new Error(`El producto "${producto.nombre}" ya no está disponible`);

      let precioUnitario = 0;
      let stockDisponible = 0;
      let variantLabel: string | null = null;

      if (producto.tieneVariantes && Array.isArray(producto.variantes)) {
        if (!variantId) throw new Error(`Debes seleccionar un tamaño para "${producto.nombre}"`);
        const variantes = producto.variantes as any[];
        const idx = variantes.findIndex((v) => v.id === variantId);
        if (idx === -1) throw new Error(`Variante no encontrada para "${producto.nombre}"`);
        const variante = variantes[idx];

        precioUnitario = Number(variante.precio ?? 0);
        stockDisponible = Number(variante.stock ?? 0);
        variantLabel = variante.label;

        if (stockDisponible < quantity) {
          throw new Error(`Stock insuficiente para "${producto.nombre}" (${variantLabel}). Disponible: ${stockDisponible}, solicitado: ${quantity}`);
        }
        if (precioUnitario <= 0) throw new Error(`Precio inválido para "${producto.nombre}"`);

        variantes[idx] = { ...variante, stock: stockDisponible - quantity };
        tx.update(pRef, { variantes });
      } else {
        precioUnitario = Number(producto.precio ?? 0);
        stockDisponible = Number(producto.stock ?? 0);

        if (stockDisponible < quantity) {
          throw new Error(`Stock insuficiente para "${producto.nombre}". Disponible: ${stockDisponible}, solicitado: ${quantity}`);
        }
        if (precioUnitario <= 0) throw new Error(`Precio inválido para "${producto.nombre}"`);

        tx.update(pRef, { stock: stockDisponible - quantity });
      }

      const subtotalItem = precioUnitario * quantity;
      subtotal += subtotalItem;

      itemsOut.push({
        productId,
        variantId: variantId || null,
        variantLabel,
        nombre: producto.nombre,
        precioUnitario,
        cantidad: quantity,
        subtotalItem,
      });
    }

    const aplicaDescuento = pago.metodoSeleccionado === "transferencia";
    const descuentoPorcentaje = aplicaDescuento ? DESCUENTO_TRANSFERENCIA : 0;
    const descuentoMonto = aplicaDescuento ? Math.round(subtotal * (DESCUENTO_TRANSFERENCIA / 100)) : 0;
    const total = Math.max(0, subtotal - descuentoMonto);

    const requiereSenia = pago.metodoSeleccionado === "transferencia";
    const seniaMonto = requiereSenia ? Math.round(total * 0.5) : 0;
    const saldoRestante = requiereSenia ? Math.max(0, total - seniaMonto) : 0;
    const liquidacion = pago.metodoSeleccionado === "mercadopago" ? "online" : "offline";

    tx.set(orderRef, {
      status: "pendiente",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userUid,
      customer: {
        nombre: customer.nombre,
        email: customer.email || null,
        whatsapp: String(customer.whatsapp), // ← se guarda tal cual
      },
      entrega: {
        tipo: entrega.tipo || "retiro",
        fecha: entrega.fecha,   // ← tal cual lo envía el front
        hora: entrega.hora,     // ← tal cual lo envía el front
      },
      pago: {
        metodoSeleccionado: pago.metodoSeleccionado,
        aplicaDescuento,
        requiereSenia,
        seniaMonto,
        saldoRestante,
        liquidacion,
        acreditado: false,
      },
      pricing: {
        subtotal,
        descuentoPorcentaje,
        descuentoMonto,
        total,
      },
      notasInternas: null,
      dedicatoria: dedicatoriaSafe,
      cantidadPersonas,
      terminosAceptados: !!terminosAceptados,
      notas: notasSafe,
      items: itemsOut,
      source,
    });
  });

  await rateLimitRef.set({ lastOrderTime: now });
  return { ok: true, orderId: orderRef.id };
});
