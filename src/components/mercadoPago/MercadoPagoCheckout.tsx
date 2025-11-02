// src/components/mercadoPago/MercadoPagoCheckout.tsx
import React, { useState } from "react";
import { showToast } from "../Toast/ToastProvider";

interface MercadoPagoCheckoutProps {
  amount: number;
  description: string;
  onSuccess?: (paymentId: string) => void; // se mantiene por compatibilidad (no se usa en redirect)
  onError?: (error: any) => void;
}

const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  amount,
  description,
  onError,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const resp = await fetch("/api/create-preference", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ amount, description }),
      });

      if (!resp.ok) throw new Error("Error al crear la preferencia");

      const { initPoint } = await resp.json();
      if (!initPoint) throw new Error("MP no devolvió initPoint");

      // ✅ Abrir Checkout Pro (popup/redirect). El “modal” depende del user-agent/dispositivo.
      const url = initPoint + (initPoint.includes("?") ? "&" : "?") + "redirect_mode=modal";
      window.location.assign(url); // o window.open(url, "_self");
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
