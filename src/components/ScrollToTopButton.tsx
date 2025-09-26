// src/components/common/ScrollToTopButton.tsx
import React, { useEffect, useState } from "react";

const ScrollToTopButton: React.FC = () => {
    const [visible, setVisible] = useState<boolean>(false);

    useEffect((): (() => void) => {
        const toggleVisibility = (): void => {
            setVisible(window.scrollY > 250); // aparece al bajar 200px
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => {
            window.removeEventListener("scroll", toggleVisibility);
        };
    }, []);

    const scrollToTop = (): void => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    if (!visible) return null;

    return (
        <button
            onClick={scrollToTop}
            className="
            fixed bottom-5 left-5 z-40
            p-2 rounded-full
            bg-gradient-to-r from-pink-500 to-rose-400
            text-white
            shadow-lg hover:shadow-xl
            border border-white/30
            transition transform hover:-translate-y-1 hover:scale-105
            cursor-pointer
            "
            aria-label="Ir arriba"
            title="Ir arriba"
        >
            {/* Ícono flecha arriba */}
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
        </button>
    );
};

export default ScrollToTopButton;
