// src/components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Sube al inicio en cada cambio de ruta.
 * Si hay hash (#id), intenta hacer scroll al elemento.
 */
export default function ScrollToTop() {
  const { pathname, hash, search } = useLocation();

  useEffect(() => {
    if (hash) {
      // espera al próximo frame para asegurar el render del nodo
      requestAnimationFrame(() => {
        const id = hash.slice(1);
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ block: "start", inline: "nearest" });
          return;
        }
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search, hash]);

  return null;
}
