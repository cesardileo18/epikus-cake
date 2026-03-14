// src/components/ConsentimientoTyC.tsx
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  accepted: boolean;
  onChange: (checked: boolean) => void;
  termsUrl: string;
};

const ConsentimientoTyC: React.FC<Props> = ({ accepted, onChange, termsUrl }) => {
  return (
    <label
      className="flex items-start gap-2 text-sm cursor-pointer select-none mb-3"
      style={{ color: 'var(--color-text-primary)' }}
    >
      <input
        type="checkbox"
        checked={accepted}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded"
        style={{ accentColor: 'var(--color-brand)' }}
      />
      <span className="leading-5">
        Acepto los{" "}
        <Link
          to={termsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
          style={{ color: 'var(--color-brand)' }}
        >
          Términos y Condiciones
        </Link>
        <span className="ml-1" style={{ color: 'var(--color-brand)' }}>*</span>
      </span>
    </label>
  );
};

export default ConsentimientoTyC;
