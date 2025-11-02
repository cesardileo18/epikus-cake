// src/components/share/ShareReceipt.tsx
import React, { useState } from "react";
import { toPng } from "html-to-image";

type Props = {
  /** id del contenedor a capturar (ej: "invoice-section") */
  targetId: string;
  /** nombre del archivo a guardar/compartir */
  fileName?: string;
  /** título/texto para el share nativo */
  title?: string;
  text?: string;
  /** clases extras para estilos del botón */
  className?: string;
  /** children (ícono/label). Si no pasás, usamos “Compartir comprobante” */
  children?: React.ReactNode;
  /** excluir overlays (ej: botón flotante WA, reCAPTCHA) */
  excludeSelector?: string; // ej: ".no-capture, .grecaptcha-badge"
};

const ShareReceipt: React.FC<Props> = ({
  targetId,
  fileName = "comprobante.png",
  title = "Comprobante",
  text = "Compartiendo mi comprobante",
  className = "",
  children,
  excludeSelector = ".no-capture,.grecaptcha-badge",
}) => {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onShare = async () => {
    if (busy) return;
    setBusy(true);
    setErr(null);

    try {
      const el = document.getElementById(targetId);
      if (!el) throw new Error("No se encontró el comprobante.");

      // Generar PNG (mejor con oklch que html2canvas)
      const dataUrl = await toPng(el, {
        pixelRatio: Math.min(2, window.devicePixelRatio || 1.5),
        cacheBust: true,
        // filtramos overlays/molestos
        filter: (node: HTMLElement | SVGElement) => {
          // html-to-image tipa esto como HTMLElement; igual chequeamos Element para seguridad
          if (!(node instanceof Element)) return true;
          if (!excludeSelector) return true;
          // si el nodo o algún ancestro matchea, lo excluimos
          return !node.closest(excludeSelector);
        },
      });

      // dataURL -> Blob -> File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: "image/png" });

      // Web Share API (móvil)
      // @ts-ignore: TS no conoce canShare en algunos targets
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        // @ts-ignore
        await navigator.share({ title, text, files: [file] });
      } else {
        // Fallback: descarga (desktop)
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = fileName;
        a.click();
      }
    } catch (e: any) {
      console.error("ShareReceipt error:", e);
      setErr(e?.message || "No se pudo compartir el comprobante.");
      // limpiar el error luego de unos segundos
      setTimeout(() => setErr(null), 6000);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={onShare}
        disabled={busy}
        className={
          className ||
          "w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-green-500 hover:bg-green-600 disabled:opacity-60 transition"
        }
        aria-label="Compartir comprobante"
      >
        {busy ? (
          <>
            <span className="h-5 w-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            Generando…
          </>
        ) : (
          <>{children ?? "Compartir comprobante"}</>
        )}
      </button>

      {err && (
        <p className="mt-2 text-xs text-rose-600 text-center">{err}</p>
      )}
    </div>
  );
};

export default ShareReceipt;
