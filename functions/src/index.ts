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

// Define las variables de entorno para Gmail
const gmailClientId = defineString("GMAIL_CLIENT_ID");
const gmailClientSecret = defineString("GMAIL_CLIENT_SECRET");
const gmailRefreshToken = defineString("GMAIL_REFRESH_TOKEN");
const gmailEmail = defineString("GMAIL_EMAIL");
const recaptchaSecret = defineString("RECAPTCHA_SECRET");

// ───────────────────────────────────────────────────────────────────────────────
// ✅ CONFIGURACIÓN DE VALIDACIONES (ajustable sin tocar la lógica)
// - Máximo por ítem (para evitar “cantidad excesiva”)
// - Anticipación mínima y máxima para fecha/hora de entrega
// - Zona horaria objetivo (AR no tiene DST hoy; si cambias de país, ajustá)
const MAX_CANTIDAD_POR_ITEM = 5;           // ← tope por cada producto
const MIN_ANTICIPACION_MINUTOS = 2880;      // ← 48 horas mínimo
const MAX_DIAS_ANTICIPACION = 30;           // ← 30 días máximo, define cuántos días hacia el futuro se puede programar una entrega.
const TZ_OFFSET_ARG = "-03:00";             // ← America/Argentina/Buenos_Aires
// ───────────────────────────────────────────────────────────────────────────────

// ✅ SEGURIDAD: Función auxiliar para sanitizar strings
// Elimina caracteres peligrosos (<, >) que podrían usarse para inyectar código HTML/JavaScript
// Esto previene ataques XSS (Cross-Site Scripting)
function sanitize(text: string | null, maxLength: number): string | null {
  if (!text) return null;
  // Remueve < y > para prevenir tags HTML, recorta espacios y limita longitud
  return text.replace(/[<>]/g, '').trim().slice(0, maxLength);
}

// ✅ VALIDACIÓN WHATSAPP (E.164)
// - isValidE164: chequea formato +XXXXXXXX (8 a 15 dígitos)
// - toE164: normaliza entradas típicas de AR (agrega +54 9, remueve 0 LD, etc.)
function isValidE164(value: string): boolean {
  return /^\+[1-9]\d{7,14}$/.test(value); // + y 8–15 dígitos
}

function toE164(phone: string, defaultCountry: 'AR' | 'INTL' = 'AR'): string | null {
  if (!phone) return null;
  const raw = phone.trim();
  const onlyDigits = raw.replace(/\D/g, '');
  let candidate: string;

  if (raw.startsWith('+')) {
    candidate = '+' + onlyDigits; // ya venía con +, limpiamos no dígitos
  } else if (onlyDigits.startsWith('00')) {
    candidate = '+' + onlyDigits.slice(2); // 00 → +
  } else if (defaultCountry === 'AR') {
    // Regla práctica: para WhatsApp en AR suele requerirse +54 9 + número móvil
    // - Quitar 0 de larga distancia
    // - Asegurar '9' luego de +54 para móviles
    let rest = onlyDigits;
    if (rest.startsWith('0')) rest = rest.slice(1);
    if (!rest.startsWith('9')) rest = '9' + rest;
    candidate = '+54' + rest;
  } else {
    candidate = '+' + onlyDigits;
  }

  return isValidE164(candidate) ? candidate : null;
}

// ✅ VALIDACIÓN FECHA/HORA
// - parseDeliveryDateTime: arma un Date a partir de strings fecha (YYYY-MM-DD) y hora (HH:mm)
// - valida estructura, que no sea NaN y convierte usando offset AR (sin DST)
function parseDeliveryDateTime(fecha: string, hora: string): Date | null {
  if (typeof fecha !== 'string' || typeof hora !== 'string') return null;
  // Normaliza hora a HH:mm
  const m = hora.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  const hh = m[1].padStart(2, '0');
  const mm = m[2];
  // Construye ISO con offset AR
  const iso = `${fecha}T${hh}:${mm}:00${TZ_OFFSET_ARG}`;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
}

// Test endpoint
export const ping = onRequest((req: Request, res: Response): void => {
  res.set("Access-Control-Allow-Origin", "*");
  res.status(200).send("ok");
});

// Crear preferencia Mercado Pago
export const createPreference = onRequest(
  async (req: Request, res: Response): Promise<void> => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({ error: "Método no permitido" });
      return;
    }

    try {
      const { items, orderId } = req.body || {};

      if (!items || !Array.isArray(items) || items.length === 0 || !orderId) {
        res.status(400).json({ error: "Faltan parámetros" });
        return;
      }

      const token = MP_ACCESS_TOKEN;
      if (!token) {
        res.status(500).json({ error: "Token de MercadoPago no configurado" });
        return;
      }

      const preference = {
        items: items.map((item: any) => ({
          title: `${item.nombre}${item.variantLabel ? ` (${item.variantLabel})` : ''}`,
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preference),
      });

      const data = await response.json();

      res.set("Access-Control-Allow-Origin", "*");
      res.status(200).json({
        preferenceId: data?.id ?? null,
        initPoint: data?.init_point ?? null,
      });
    } catch (err: any) {
      console.error("Error en createPreference:", err);
      res.status(500).json({ error: err?.message ?? "Error interno" });
    }
  }
);

// Webhook de notificaciones de Mercado Pago
export const mercadopagoWebhook = onRequest(async (req: Request, res: Response): Promise<void> => {
  res.set("Access-Control-Allow-Origin", "*");
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido" }); return; }

  try {
    // --- FIRMA (X-Signature) ---
    const signature = req.header("x-signature") || "";
    const requestId = req.header("x-request-id") || "";
    const secret = process.env.MP_WEBHOOK_SECRET || ""; // poné este secret en tu app de MP

    if (!signature || !requestId || !secret) { res.status(401).send("missing-signature"); return; }

    const [tsPart, v1Part] = signature.split(",");
    const ts = (tsPart || "").replace("ts=", "");
    const v1 = (v1Part || "").replace("v1=", "");

    // id del evento (payment) viene en body.data.id
    const { type, data } = req.body || {};
    const paymentId = String(data?.id || "");

    if (!paymentId) { res.status(400).json({ error: "Payment ID no encontrado" }); return; }

    // manifest oficial: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
    const manifest = `id:${paymentId};request-id:${requestId};ts:${ts};`;
    const calc = crypto.createHmac("sha256", secret).update(manifest).digest("hex");
    if (calc !== v1) { res.status(401).send("invalid-signature"); return; }

    // --- IDEMPOTENCIA ---
    const idemRef = admin.firestore().collection("mp_payments").doc(paymentId);
    const idemSnap = await idemRef.get();
    if (idemSnap.exists) { res.status(200).send("ok"); return; }
    await idemRef.set({ requestId, ts, receivedAt: admin.firestore.FieldValue.serverTimestamp() });

    // --- LÓGICA EXISTENTE ---
    if (type !== "payment") { res.status(200).send("ok"); return; }

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${MP_ACCESS_TOKEN}` }
    });
    if (!response.ok) { res.status(502).json({ error: "MP fetch error" }); return; }

    const payment = await response.json();
    const orderId = payment.external_reference;
    const status = payment.status;
    if (!orderId) { console.error("❌ Pago sin external_reference:", paymentId); res.status(200).send("ok"); return; }

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
    console.log(`✅ Webhook procesado - Order: ${orderId}, Payment: ${paymentId}, Status: ${status}`);
    res.status(200).send("ok");
  } catch (err: any) {
    console.error("❌ Error en webhook:", err);
    res.status(500).json({ error: err?.message ?? "Error interno" });
  }
});

// Función auxiliar para crear el transporter de Nodemailer
async function createTransporter() {
  const OAuth2 = google.auth.OAuth2;

  const oauth2Client = new OAuth2(
    gmailClientId.value(),
    gmailClientSecret.value(),
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: gmailRefreshToken.value(),
  });

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

// Enviar email
export const sendEmail = onCall(async (request) => {
  const { to, subject, text, html } = request.data;

  if (!to || !subject) {
    throw new Error("Faltan parámetros requeridos: to, subject");
  }

  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `Epikus Cake <${gmailEmail.value()}>`,
      to,
      subject,
      text,
      html,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email enviado:", result.messageId);

    return { success: true, messageId: result.messageId };
  } catch (error: any) {
    console.error("❌ Error al enviar email:", error);
    throw new Error(error.message || "Error al enviar email");
  }
});

// Verificar reCAPTCHA
export const verifyRecaptcha = onRequest(async (req: Request, res: Response): Promise<void> => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method-not-allowed" });
    return;
  }

  try {
    const token = req.body?.token as string | undefined;
    if (!token) {
      res.status(400).json({ ok: false, error: "missing-token" });
      return;
    }

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
    console.error("reCAPTCHA verify error:", err);
    res.status(500).json({ ok: false, error: err?.message ?? "internal-error" });
  }
});

// Validar carrito antes de confirmar
export const validateCart = onCall(async (request) => {
  const { items } = request.data;

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Carrito vacío o inválido");
  }

  try {
    const validatedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const { productId, variantId, quantity } = item;

      const realProductId = productId.includes('-')
        ? productId.split('-')[0]
        : productId;

      const productDoc = await admin.firestore()
        .collection('productos')
        .doc(realProductId)
        .get();

      if (!productDoc.exists) {
        throw new Error(`Producto no encontrado: ${realProductId}`);
      }

      const producto = productDoc.data()!;

      if (!producto.activo) {
        throw new Error(`El producto "${producto.nombre}" ya no está disponible`);
      }

      let precioReal = 0;
      let stockDisponible = 0;
      let variantLabel = null;

      if (producto.tieneVariantes && Array.isArray(producto.variantes)) {
        if (!variantId) {
          throw new Error(`Debes seleccionar un tamaño para "${producto.nombre}"`);
        }

        const variant = producto.variantes.find((v: any) => v.id === variantId);
        if (!variant) {
          throw new Error(`Variante no encontrada para "${producto.nombre}"`);
        }

        precioReal = Number(variant.precio ?? 0);
        stockDisponible = Number(variant.stock ?? 0);
        variantLabel = variant.label;
      } else {
        precioReal = Number(producto.precio ?? 0);
        stockDisponible = Number(producto.stock ?? 0);
      }

      if (stockDisponible < quantity) {
        throw new Error(
          `Stock insuficiente para "${producto.nombre}"${variantLabel ? ` (${variantLabel})` : ''}. Disponible: ${stockDisponible}, solicitado: ${quantity}`
        );
      }

      if (precioReal <= 0) {
        throw new Error(`Precio inválido para "${producto.nombre}"`);
      }

      const subtotalItem = precioReal * quantity;
      subtotal += subtotalItem;

      validatedItems.push({
        productId: item.productId,
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

    return {
      ok: true,
      items: validatedItems,
      subtotal,
      timestamp: Date.now(),
    };

  } catch (error: any) {
    console.error("❌ Error en validateCart:", error);
    throw new Error(error.message || "Error al validar el carrito");
  }
});

// 🧩 Crear orden atómica: valida, descuenta stock y crea el documento en /pedidos
export const createOrder = onCall(async (request) => {
  // ✅ PASO 1: VERIFICAR AUTENTICACIÓN
  if (!request.auth) {
    throw new Error('Usuario no autenticado');
  }
  const userUid = request.auth.uid; // ← Este userUid es 100% confiable

  const {
    items,                 // [{ productId, variantId?, quantity }]
    customer,              // { nombre, email|null, whatsapp }
    entrega,               // { tipo: 'retiro', fecha, hora }
    pago,                  // { metodoSeleccionado: 'transferencia'|'mercadopago' }
    dedicatoria = null,    // string|null
    cantidadPersonas = null, // string|null
    notas = null,          // string|null
    source = 'web',        // string
    terminosAceptados = false, // ← NUEVO
  } = request.data || {};

  // ✅ PASO 2: VALIDACIONES BÁSICAS DE CAMPOS REQUERIDOS
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Carrito vacío o inválido');
  }
  if (!customer?.nombre || !customer?.whatsapp || !entrega?.fecha || !entrega?.hora) {
    throw new Error('Faltan datos requeridos de la orden');
  }
  if (!pago?.metodoSeleccionado || !['transferencia', 'mercadopago'].includes(pago.metodoSeleccionado)) {
    throw new Error('Método de pago inválido');
  }
  if (!terminosAceptados) {
    throw new Error('Debes aceptar los Términos y Condiciones.');
  }

  // ✅ PASO 3: VALIDAR Y NORMALIZAR WHATSAPP (E.164)
  // - No cambia tu lógica de negocio; solo asegura un formato consistente al guardar.
  const whatsappNorm = toE164(String(customer.whatsapp), 'AR');
  if (!whatsappNorm) {
    throw new Error('WhatsApp inválido. Ingresá un número válido con código de país (ej: +54911XXXXXXXX).');
  }

  // ✅ PASO 4: VALIDAR FECHA/HORA (estructura, futuro, anticipación, horizonte)
  const entregaDate = parseDeliveryDateTime(String(entrega.fecha), String(entrega.hora));
  if (!entregaDate) {
    throw new Error('Fecha/hora inválida. Usá formato YYYY-MM-DD y HH:mm.');
  }
  const nowMs = Date.now();
  const entregaMs = entregaDate.getTime();

  // 4.1) Anticipación mínima (p. ej., 3 horas)
  if (entregaMs < nowMs + MIN_ANTICIPACION_MINUTOS * 60 * 1000) {
    throw new Error(`La fecha/hora debe tener al menos ${MIN_ANTICIPACION_MINUTOS} minutos de anticipación.`);
  }

  // 4.2) Horizonte máximo (p. ej., 30 días)
  const maxMs = nowMs + MAX_DIAS_ANTICIPACION * 24 * 60 * 60 * 1000;
  if (entregaMs > maxMs) {
    throw new Error(`La fecha/hora no puede superar ${MAX_DIAS_ANTICIPACION} días desde hoy.`);
  }

  // (Opcional) Ventana horaria operativa — desactivada por defecto
  // const hora = entregaDate.getHours();
  // if (hora < 9 || hora > 21) {
  //   throw new Error('La hora de entrega debe estar entre 09:00 y 21:00.');
  // }

  // ✅ PASO 5: VALIDAR CANTIDAD EXCESIVA POR ÍTEM (además del stock en la transacción)
  for (const it of items) {
    const q = Number(it?.quantity);
    if (!Number.isFinite(q) || q <= 0) {
      throw new Error('Ítem inválido en el carrito');
    }
    if (q > MAX_CANTIDAD_POR_ITEM) {
      throw new Error(`La cantidad por producto no puede superar ${MAX_CANTIDAD_POR_ITEM}.`);
    }
  }

  // ✅ PASO 6: RATE LIMITING (protección contra spam) — ya lo tenías
  const rateLimitRef = admin.firestore().collection('rateLimits').doc(userUid);
  const rateLimitDoc = await rateLimitRef.get();
  const now = Date.now();

  if (rateLimitDoc.exists) {
    const lastOrder = rateLimitDoc.data()?.lastOrderTime || 0;
    if (now - lastOrder < 30000) {
      throw new Error('Esperá 30 segundos antes de crear otra orden');
    }
  }

  // ✅ PASO 7: SANITIZAR TEXTOS (protección contra XSS) — ya lo tenías
  const dedicatoriaSafe = sanitize(dedicatoria, 500);    // Máximo 500 chars
  const notasSafe = sanitize(notas, 1000);               // Máximo 1000 chars

  // Reglas de pricing (calculadas en backend para evitar manipulación)
  const DESCUENTO_TRANSFERENCIA = 10;

  // ✅ PASO 8: TRANSACCIÓN ATÓMICA (stock + creación de pedido)
  const orderRef = admin.firestore().collection('pedidos').doc();

  await admin.firestore().runTransaction(async (tx) => {
    let subtotal = 0;
    const itemsOut: any[] = [];

    // 8.1) VALIDAR CADA PRODUCTO, STOCK Y PRECIOS
    for (const it of items) {
      const { productId, variantId, quantity } = it;

      // Validación de integridad del ítem
      if (!productId || typeof quantity !== 'number' || quantity <= 0) {
        throw new Error('Ítem inválido en el carrito');
      }
      // Ya validamos tope por ítem antes; aquí seguimos igual que tu lógica

      const realProductId = productId.includes('-') ? productId.split('-')[0] : productId;

      const pRef = admin.firestore().collection('productos').doc(realProductId);
      const snap = await tx.get(pRef);

      if (!snap.exists) throw new Error(`Producto no encontrado: ${realProductId}`);

      const producto = snap.data() as any;

      if (!producto.activo) {
        throw new Error(`El producto "${producto.nombre}" ya no está disponible`);
      }

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
          throw new Error(
            `Stock insuficiente para "${producto.nombre}"${variantLabel ? ` (${variantLabel})` : ''}. Disponible: ${stockDisponible}, solicitado: ${quantity}`
          );
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
        productId,                 // Mantener el ID completo (puede incluir variante)
        variantId: variantId || null,
        variantLabel,
        nombre: producto.nombre,
        precioUnitario,            // Precio REAL backend
        cantidad: quantity,
        subtotalItem,
      });
    }

    // 8.2) CALCULAR PRICING (sin cambios de tu lógica)
    const aplicaDescuento = pago.metodoSeleccionado === 'transferencia';
    const descuentoPorcentaje = aplicaDescuento ? DESCUENTO_TRANSFERENCIA : 0;
    const descuentoMonto = aplicaDescuento ? Math.round(subtotal * (DESCUENTO_TRANSFERENCIA / 100)) : 0;
    const total = Math.max(0, subtotal - descuentoMonto);

    // 8.3) Señal y liquidación (sin cambios)
    const requiereSenia = pago.metodoSeleccionado === 'transferencia';
    const seniaMonto = requiereSenia ? Math.round(total * 0.5) : 0;
    const saldoRestante = requiereSenia ? Math.max(0, total - seniaMonto) : 0;
    const liquidacion = pago.metodoSeleccionado === 'mercadopago' ? 'online' : 'offline';

    // 8.4) CREAR DOCUMENTO DE LA ORDEN (sin cambios; solo guardo WhatsApp normalizado)
    tx.set(orderRef, {
      status: 'pendiente',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      userUid,  // userUid verificado del token
      customer: {
        nombre: customer.nombre,
        email: customer.email || null,
        whatsapp: whatsappNorm, // ← número normalizado E.164
      },
      entrega: {
        tipo: entrega.tipo || 'retiro',
        fecha: entrega.fecha,
        hora: entrega.hora,
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
      dedicatoria: dedicatoriaSafe,    // Texto sanitizado
      cantidadPersonas,
      terminosAceptados: !!terminosAceptados,
      notas: notasSafe,                // Texto sanitizado
      items: itemsOut,                 // Items con precios del backend
      source,
    });
  });
  // ← Aquí termina la transacción. Si llegamos acá, TODO se guardó correctamente

  // ✅ PASO 9: ACTUALIZAR RATE LIMIT (sin cambios)
  await rateLimitRef.set({ lastOrderTime: now });

  // ✅ PASO 10: RESPONDER AL CLIENTE (sin cambios)
  return {
    ok: true,
    orderId: orderRef.id,
  };
});
