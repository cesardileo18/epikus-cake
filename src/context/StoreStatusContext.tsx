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
    const forceClosed = import.meta.env.VITE_FORCE_STORE_CLOSED === "true";
    const customMessage = import.meta.env.VITE_STORE_CLOSED_MESSAGE || "";

    const now = new Date();
    const day = now.getDay(); // 0 = domingo, 6 = sábado
    const hour = now.getHours();

    if (forceClosed) {
      setIsStoreOpen(false);
      setClosedMessage(customMessage || "Tienda cerrada por mantenimiento");
      return;
    }

    let open = false;

    // 🕘 Horarios personalizados
    if (day >= 1 && day <= 5) {
      // Lunes a viernes → 9:00 a 20:00
      open = hour >= 9 && hour < 20;
    } else if (day === 6) {
      // Sábado → 9:00 a 16:00
      open = hour >= 9 && hour < 16;
    } else if (day === 0) {
      // Domingo → 9:00 a 13:00
      open = hour >= 9 && hour < 13;
    }

    setIsStoreOpen(open);

    if (!open) {
      let message = "Tienda cerrada. ";
      if (day === 6) message += "Horario sábado: 9:00 a 16:00";
      else if (day === 0) message += "Horario domingo: 9:00 a 13:00";
      else message += "Horario: 9:00 a 20:00";

      setClosedMessage(message);

      // Próxima apertura
      const next = new Date(now);
      if (day === 6 && hour >= 16) {
        // sábado después de cierre → abre domingo 9:00
        next.setDate(now.getDate() + 1);
        next.setHours(9, 0, 0, 0);
      } else if (day === 0 && hour >= 13) {
        // domingo después de cierre → abre lunes 9:00
        next.setDate(now.getDate() + 1);
        next.setHours(9, 0, 0, 0);
      } else {
        // cualquier otro día → siguiente día 9:00
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
    const interval = setInterval(checkStoreStatus, 60 * 1000); // revisa cada minuto
    return () => clearInterval(interval);
  }, []);

  return (
    <StoreStatusContext.Provider value={{ isStoreOpen, nextOpeningTime, closedMessage }}>
      {children}
    </StoreStatusContext.Provider>
  );
};

export const useStoreStatus = () => useContext(StoreStatusContext);
