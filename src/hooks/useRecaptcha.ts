// src/hooks/useRecaptcha.ts
import { useEffect, useState, useCallback } from "react";

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY as string;
const VERIFY_URL = import.meta.env.VITE_RECAPTCHA_VERIFY_URL as string;

interface RecaptchaResult {
  ok: boolean;
  score?: number;
  error?: string;
}

// NUEVA OPCIÓN: autoLoad = false por defecto
export const useRecaptcha = (autoLoad: boolean = false) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(autoLoad);

  useEffect(() => {
    // Solo cargar si shouldLoad es true
    if (!shouldLoad) return;

    if (!RECAPTCHA_SITE_KEY) {
      console.error("VITE_RECAPTCHA_SITE_KEY no está definido");
      return;
    }

    // Si ya está cargado
    if (window.grecaptcha) {
      window.grecaptcha.ready(() => setIsLoaded(true));
      return;
    }

    // Cargar script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setIsLoaded(true));
      }
    };

    script.onerror = () => {
      console.error("Error al cargar reCAPTCHA");
    };

    document.head.appendChild(script);

    // No hacer cleanup aquí porque puede estar en uso en otra página
  }, [shouldLoad]);

  const executeRecaptcha = useCallback(async (action: string = "submit"): Promise<RecaptchaResult> => {
    // Si no está cargado, intentar cargarlo
    if (!isLoaded) {
      setShouldLoad(true);
      return { ok: false, error: "reCAPTCHA se está cargando..." };
    }

    if (!window.grecaptcha) {
      return { ok: false, error: "reCAPTCHA no está disponible" };
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      
      const response = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        return { ok: false, error: "Error en la verificación del servidor" };
      }

      const data: { ok: boolean; score?: number } = await response.json();
      return { ok: data.ok, score: data.score };
    } catch (error) {
      console.error("Error ejecutando reCAPTCHA:", error);
      return { ok: false, error: "Error al ejecutar reCAPTCHA" };
    }
  }, [isLoaded]);

  return { isLoaded, executeRecaptcha };
};
