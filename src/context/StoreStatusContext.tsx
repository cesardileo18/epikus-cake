// src/context/StoreStatusContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";

interface StoreStatusContextProps {
  isStoreOpen: boolean;
  nextOpeningTime: string;
  closedMessage: string | null;
}

const StoreStatusContext = createContext<StoreStatusContextProps>({
  isStoreOpen: false,
  nextOpeningTime: "",
  closedMessage: null,
});

export const StoreStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [nextOpeningTime, setNextOpeningTime] = useState("");
  const [closedMessage, setClosedMessage] = useState<string | null>(null);
  
  const checkStoreStatus = () => {
    const raw = (import.meta.env.VITE_FORCE_STORE_CLOSED ?? "").toString().trim().toLowerCase();
    const forceClosed = raw === "true" || raw === "1" || raw === "yes" || raw === "on";
    const customMessage = import.meta.env.VITE_STORE_CLOSED_MESSAGE || "";

    // Obtener hora de Argentina correctamente
    const now = new Date();
    
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Argentina/Buenos_Aires',
      hour: 'numeric',
      hour12: false,
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    
    const parts = formatter.formatToParts(now);
    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const weekday = parts.find(p => p.type === 'weekday')?.value || '';
    
    // Convertir weekday a número (0 = domingo)
    const dayMap: Record<string, number> = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    };
    const day = dayMap[weekday] || 0;

    if (forceClosed) {
      setIsStoreOpen(false);
      setClosedMessage(customMessage || "Tienda cerrada por mantenimiento");
      return;
    }

    let open = false;

    // ═══════════════════════════════════════════════════════════════
    // 🕐 CONFIGURACIÓN DE HORARIOS - MODIFICAR AQUÍ
    // ═══════════════════════════════════════════════════════════════
    
    if (day >= 1 && day <= 5) {
      // 📅 LUNES A VIERNES
      // Cambiar los números para modificar horario de apertura y cierre
      // Formato: hour >= HORA_APERTURA && hour < HORA_CIERRE
      open = hour >= 9 && hour < 20;  // ← ACTUAL: 9:00 a 20:00
    } 
    else if (day === 6) {
      // 📅 SÁBADO
      // Cambiar los números para modificar horario
      open = hour >= 9 && hour < 17;  // ← ACTUAL: 9:00 a 17:00
    } 
    else if (day === 0) {
      // 📅 DOMINGO
      // Cambiar los números para modificar horario
      open = hour >= 9 && hour < 19;  // ← ACTUAL: 9:00 a 19:00
    }

    // ═══════════════════════════════════════════════════════════════

    setIsStoreOpen(open);
    
    if (!open) {
      // ═══════════════════════════════════════════════════════════════
      // 💬 MENSAJES DE HORARIOS - ACTUALIZAR SI CAMBIAS LOS HORARIOS ARRIBA
      // ═══════════════════════════════════════════════════════════════
      let message = "Tienda cerrada. ";
      if (day === 6) message += "Horario sábado: 9:00 a 17:00";      // ← Actualizar si cambiás horario sábado
      else if (day === 0) message += "Horario domingo: 9:00 a 19:00"; // ← Actualizar si cambiás horario domingo
      else message += "Horario: 9:00 a 20:00";                        // ← Actualizar si cambiás horario lunes-viernes

      setClosedMessage(message);

      // ═══════════════════════════════════════════════════════════════
      // ⏰ PRÓXIMA APERTURA - ACTUALIZAR SI CAMBIAS LOS HORARIOS DE CIERRE
      // ═══════════════════════════════════════════════════════════════
      const next = new Date(now);
      if (day === 6 && hour >= 17) {
        // Sábado después del cierre → abre domingo
        // ⚠️ Cambiar el 17 si modificás hora de cierre del sábado
        next.setDate(now.getDate() + 1);
        next.setHours(9, 0, 0, 0);
      } else if (day === 0 && hour >= 19) {
        // Domingo después del cierre → abre lunes
        // ⚠️ Cambiar el 19 si modificás hora de cierre del domingo
        next.setDate(now.getDate() + 1);
        next.setHours(9, 0, 0, 0);
      } else {
        // Cualquier otro día → siguiente día a las 9:00
        // ⚠️ Cambiar el 20 si modificás hora de cierre lunes-viernes
        if (hour >= 20) next.setDate(now.getDate() + 1);
        next.setHours(9, 0, 0, 0);
      }

      setNextOpeningTime(
        next.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      );
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