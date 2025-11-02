// src/components/security/ReCaptchaInvisible.tsx
import React from "react";

const ReCaptchaInvisible: React.FC = () => {
  return (
    <div className="text-[11px] text-gray-500 text-center mb-2">
      Protegido por reCAPTCHA —{" "}
      <a 
        className="underline hover:text-gray-700" 
        href="https://policies.google.com/privacy" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Privacidad
      </a>
      {" · "}
      <a 
        className="underline hover:text-gray-700" 
        href="https://policies.google.com/terms" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        Términos
      </a>
    </div>
  );
};

export default ReCaptchaInvisible;