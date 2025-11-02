import { onRequest } from "firebase-functions/v2/https";
import { onCall } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import type { Request, Response } from "express";
import { defineString } from "firebase-functions/params";
import * as nodemailer from "nodemailer";
import { google } from "googleapis";

setGlobalOptions({ region: "southamerica-east1", maxInstances: 10 });

const MP_ACCESS_TOKEN = "APP_USR-3474946577848305-101116-a58950c687f436f321f334654137576b-211153688";

// Define las variables de entorno para Gmail
const gmailClientId = defineString("GMAIL_CLIENT_ID");
const gmailClientSecret = defineString("GMAIL_CLIENT_SECRET");
const gmailRefreshToken = defineString("GMAIL_REFRESH_TOKEN");
const gmailEmail = defineString("GMAIL_EMAIL");
const recaptchaSecret = defineString("RECAPTCHA_SECRET");

// 🌐 Test endpoint
export const ping = onRequest((req: Request, res: Response): void => {
  res.set("Access-Control-Allow-Origin", "*");
  res.status(200).send("ok");
});

// 💳 Crear preferencia Mercado Pago
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
      const { amount, description, orderId } = req.body || {}; // ← Agregado orderId
      if (!amount || !description || !orderId) { // ← Validación
        res.status(400).json({ error: "Faltan parámetros" });
        return;
      }

      const token = MP_ACCESS_TOKEN;
      if (!token) {
        res.status(500).json({ error: "Token de MercadoPago no configurado" });
        return;
      }

      const preference = {
        items: [
          {
            title: description,
            unit_price: Number(amount),
            quantity: 1,
          },
        ],
        back_urls: {
          success: `https://epikuscake.web.app/payment-success?orderId=${orderId}`, // ← Usa orderId
          failure: "https://epikuscake.web.app/confirm-order",
        },
        auto_return: "approved",
        external_reference: orderId, // ← Opcional pero recomendado
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

// 📧 Función auxiliar para crear el transporter de Nodemailer
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

// 📧 Enviar email
export const sendEmail = onCall(async (request) => {
  const { to, subject, text, html } = request.data;

  // Validación básica
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

// 🛡️ Verificar reCAPTCHA
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
    const data = await verifyResp.json(); // { success, score, action, ... }

    const score = typeof data.score === "number" ? data.score : 0;
    const ok = !!data.success && score >= 0.5; // umbral ajustable

    res.status(200).json({ ok, score });
  } catch (err: any) {
    console.error("reCAPTCHA verify error:", err);
    res.status(500).json({ ok: false, error: err?.message ?? "internal-error" });
  }
});