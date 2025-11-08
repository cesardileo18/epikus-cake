// src/components/ConsentimientoTyC.tsx
import React from "react";
import { Link } from "react-router-dom";

type Props = {
  accepted: boolean;                     // estado controlado desde el padre
  onChange: (checked: boolean) => void;  // callback al tildar/destildar
  termsUrl: string;                      // link a Términos y Condiciones
};

const ConsentimientoTyC: React.FC<Props> = ({ accepted, onChange, termsUrl }) => {
  return (
    <label className="flex items-start gap-2 text-sm text-gray-700 cursor-pointer select-none mb-3">
      <input
        type="checkbox"
        checked={accepted}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
      />
      <span className="leading-5">
        Acepto los{" "}
        <Link
          to={termsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-pink-600 hover:text-pink-700 underline font-medium"
        >
          Términos y Condiciones
        </Link>
        <span className="ml-1 text-rose-500">*</span>
      </span>
    </label>
  );
};

export default ConsentimientoTyC;
