// src/components/analytics/AnalyticsTracker.tsx
import { useEffect } from "react";
import { analytics, db } from "@/config/firebase";
import { logEvent } from "firebase/analytics";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const LAST_VISIT_KEY = "epikus:lastVisit";
const VISITS_COLLECTION = "visits";

const AnalyticsTracker: React.FC = () => {
  useEffect(() => {
    console.log("[AnalyticsTracker] montado");

    // --------- 1) page_view (una vez al cargar) ----------
    if (analytics) {
      try {
        logEvent(analytics, "page_view", {
          page_path: window.location.pathname,
          page_title: document.title,
        });
        console.log("[AnalyticsTracker] page_view enviado");
      } catch (error) {
        console.error("[AnalyticsTracker] error en logEvent:", error);
      }
    } else {
      console.warn("[AnalyticsTracker] analytics no disponible (ok en algunos entornos)");
    }

    // --------- 2) visita diaria en Firestore ----------
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    let storedDate: string | null = null;

    try {
      storedDate = localStorage.getItem(LAST_VISIT_KEY);
    } catch (error) {
      console.error("[AnalyticsTracker] error leyendo localStorage:", error);
    }

    console.log("[AnalyticsTracker] storedDate =", storedDate, "today =", today);

    if (storedDate === today) {
      console.log("[AnalyticsTracker] visita de hoy ya registrada, no se guarda otra");
      return;
    }

    const logDailyVisit = async () => {
      try {
        const visitData = {
          fullUrl: window.location.href,
          referrer: document.referrer || null,

          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,

          visitDate: today,
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, VISITS_COLLECTION), visitData);
        console.log("[AnalyticsTracker] visita guardada con id:", docRef.id);

        try {
          localStorage.setItem(LAST_VISIT_KEY, today);
          console.log("[AnalyticsTracker] localStorage actualizado:", LAST_VISIT_KEY, "=", today);
        } catch (error) {
          console.error("[AnalyticsTracker] error escribiendo localStorage:", error);
        }
      } catch (error) {
        console.error("[AnalyticsTracker] error guardando visita en Firestore:", error);
      }
    };

    logDailyVisit();
  }, []);

  return null;
};

export default AnalyticsTracker;
