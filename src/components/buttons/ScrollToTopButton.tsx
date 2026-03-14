// src/components/buttons/ScrollToTopButton.tsx
import React, { useEffect, useState } from "react";

const ScrollToTopButton: React.FC = () => {
    const [visible, setVisible] = useState<boolean>(false);

    useEffect((): (() => void) => {
        const toggle = (): void => setVisible(window.scrollY > 250);
        window.addEventListener("scroll", toggle);
        return () => window.removeEventListener("scroll", toggle);
    }, []);

    if (!visible) return null;

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="btn-brand fixed bottom-9 md:bottom-5 left-5 z-40 p-2 rounded-full border border-white/30"
            aria-label="Ir arriba"
            title="Ir arriba"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
        </button>
    );
};

export default ScrollToTopButton;
