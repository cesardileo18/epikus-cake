import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import type { Request, Response } from "express";

setGlobalOptions({ region: "southamerica-east1", maxInstances: 10 });

export const ping = onRequest((req: Request, res: Response) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.status(200).send("ok");
});

export const createPreference = onRequest(async (req: Request, res: Response) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Método no permitido" });
    return;
  }

  try {
    const { amount, description } = req.body;

    if (!amount || !description) {
      res.status(400).json({ error: "Faltan parámetros" });
      return;
    }

    const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;

    const preference = {
      items: [{
        title: description,
        unit_price: Number(amount),
        quantity: 1,
      }],
      back_urls: {
        success: "https://epikuscake.web.app/payment-success",
        failure: "https://epikuscake.web.app/payment-failure",
      },
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await response.json();
    res.status(200).json({ preferenceId: data.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});