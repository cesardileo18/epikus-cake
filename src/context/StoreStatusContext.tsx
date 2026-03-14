// src/context/StoreStatusContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

// ═══════════════════════════════════════════════════════════════
// 🕐 CONFIGURACIÓN CENTRALIZADA DE HORARIOS
// Modificar solo estos valores para cambiar horarios.
// Los mensajes y la lógica de "próxima apertura" se actualizan solos.
// ═══════════════════════════════════════════════════════════════
const SCHEDULE = {
  weekdays: { open: 9, close: 20 },  // Lunes a viernes
  saturday: { open: 9, close: 19 },  // Sábado
  sunday:   { open: 9, close: 19 },  // Domingo
} as const;

interface StoreStatusContextValue {
  isStoreOpen: boolean;
  nextOpeningTime: string;
  closedMessage: string | null;
}

const StoreStatusContext = createContext<StoreStatusContextValue>({
  isStoreOpen: false,
  nextOpeningTime: "",
  closedMessage: null,
});

// Devuelve { hour, day } en zona horaria de Argentina
function getArgentinaTime(): { hour: number; day: number } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "numeric",
    hour12: false,
    weekday: "short",
  });

  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
  const weekday = parts.find(p => p.type === "weekday")?.value || "";

  const dayMap: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  return { hour, day: dayMap[weekday] ?? 0 };
}

function isOpenNow(hour: number, day: number): boolean {
  if (day >= 1 && day <= 5) return hour >= SCHEDULE.weekdays.open && hour < SCHEDULE.weekdays.close;
  if (day === 6)             return hour >= SCHEDULE.saturday.open && hour < SCHEDULE.saturday.close;
  if (day === 0)             return hour >= SCHEDULE.sunday.open   && hour < SCHEDULE.sunday.close;
  return false;
}

function buildClosedMessage(day: number): string {
  if (day === 6) return `Tienda cerrada. Horario sábado: ${SCHEDULE.saturday.open}:00 a ${SCHEDULE.saturday.close}:00`;
  if (day === 0) return `Tienda cerrada. Horario domingo: ${SCHEDULE.sunday.open}:00 a ${SCHEDULE.sunday.close}:00`;
  return `Tienda cerrada. Horario: ${SCHEDULE.weekdays.open}:00 a ${SCHEDULE.weekdays.close}:00`;
}

function buildNextOpeningTime(hour: number, day: number): string {
  const now = new Date();
  const next = new Date(now);

  const closeHour =
    day >= 1 && day <= 5 ? SCHEDULE.weekdays.close :
    day === 6             ? SCHEDULE.saturday.close :
                            SCHEDULE.sunday.close;

  if (hour >= closeHour) {
    next.setDate(now.getDate() + 1);
  }
  next.setHours(9, 0, 0, 0);

  return next.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
}

export const StoreStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [isStoreOpen, setIsStoreOpen]       = useState(false);
  const [nextOpeningTime, setNextOpeningTime] = useState("");
  const [closedMessage, setClosedMessage]   = useState<string | null>(null);

  const checkStoreStatus = () => {
    const envFlag = (import.meta.env.VITE_FORCE_STORE_CLOSED ?? "").toString().trim().toLowerCase();
    const customMessage = import.meta.env.VITE_STORE_CLOSED_MESSAGE || "";

    // Flag explícito en .env para forzar estado
    if (envFlag === "false") {
      setIsStoreOpen(true);
      setClosedMessage(null);
      return;
    }
    if (envFlag === "true") {
      setIsStoreOpen(false);
      setClosedMessage(customMessage || "Tienda cerrada por mantenimiento");
      return;
    }

    // Lógica normal de horarios
    const { hour, day } = getArgentinaTime();
    const open = isOpenNow(hour, day);

    setIsStoreOpen(open);

    if (!open) {
      setClosedMessage(buildClosedMessage(day));
      setNextOpeningTime(buildNextOpeningTime(hour, day));
    } else {
      setClosedMessage(null);
    }
  };

  useEffect(() => {
    checkStoreStatus();
    const interval = setInterval(checkStoreStatus, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <StoreStatusContext.Provider value={{ isStoreOpen, nextOpeningTime, closedMessage }}>
      {children}
    </StoreStatusContext.Provider>
  );
};

export const useStoreStatus = () => useContext(StoreStatusContext);
