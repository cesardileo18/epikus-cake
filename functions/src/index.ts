import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import type { Request, Response } from "express";
// import { defineSecret } from "firebase-functions/params";

setGlobalOptions({ region: "southamerica-east1", maxInstances: 10 });

const MP_ACCESS_TOKEN = "APP_USR-3474946577848305-101116-a58950c687f436f321f334654137576b-211153688";

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
      const { amount, description } = req.body || {};
      if (!amount || !description) {
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
          success: "https://epikuscake.web.app/products",
          failure: "https://epikuscake.web.app/confirm-order",
        },
        auto_return: "approved",
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
        initPoint: data?.init_point ?? null, // ✅ esto permite abrir el popup
      });
    } catch (err: any) {
      console.error("Error en createPreference:", err);
      res.status(500).json({ error: err?.message ?? "Error interno" });
    }
  }
);
