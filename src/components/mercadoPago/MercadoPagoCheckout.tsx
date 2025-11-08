import React, { useState } from "react";
import { showToast } from "../Toast/ToastProvider";
import type { MercadoPagoCheckoutProps } from "@/interfaces/mercadoPago/mercadoPago";
import { httpsCallable } from "firebase/functions";
import { auth, functions } from "@/config/firebase";

const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  amount,
  description,
  form,
  items,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1️⃣ PRIMERO: Crear la orden en Firestore
      const createOrder = httpsCallable(functions, "createOrder");
      const { data }: any = await createOrder({
        userUid: auth.currentUser?.uid || "guest",
        items: items.map((it) => ({
          productId: it.productId,
          variantId: it.variantId ?? null,
          quantity: it.quantity,
        })),
        customer: {
          nombre: form.nombre,
          email: form.email || null,
          whatsapp: form.whatsapp
        },
        entrega: {
          tipo: "retiro",
          fecha: form.fecha,
          hora: form.hora
        },
        pago: {
          metodoSeleccionado: 'mercadopago'
        },
        dedicatoria: form.dedicatoria || null,
        cantidadPersonas: form.cantidadPersonas || null,
        terminosAceptados: form.terminosAceptados,
        notas: form.notas || null,
        source: "web",
      });

      const orderId = data?.orderId;
      if (!orderId) throw new Error("No se pudo crear la orden.");

      // 2️⃣ SEGUNDO: Crear la preferencia de MercadoPago con el orderId
      const resp = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          orderId,
          items: items.map(it => ({
            nombre: it.product.nombre,
            precioUnitario: it.precio,
            cantidad: it.quantity,
            variantLabel: it.variantLabel || null
          }))
        }),
      });

      if (!resp.ok) throw new Error("Error al crear la preferencia");

      const { initPoint } = await resp.json();
      if (!initPoint) throw new Error("MP no devolvió initPoint");

      // 3️⃣ TERCERO: Redirigir a MercadoPago
      window.location.assign(initPoint);

    } catch (err: any) {
      console.error("Checkout error:", err);
      onError?.(err);
      showToast.error("No se pudo iniciar el pago.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Resumen de pago</h3>
      <div className="flex justify-between items-center mb-6">
        <span className="text-gray-600">{description}</span>
        <span className="text-2xl font-bold text-pink-600">
          ${amount.toLocaleString("es-AR")}
        </span>
      </div>
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          loading
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:from-pink-600 hover:to-rose-500"
        }`}
      >
        {loading ? "Preparando pago..." : "Pagar con MercadoPago"}
      </button>
    </div>
  );
};

export default MercadoPagoCheckout;