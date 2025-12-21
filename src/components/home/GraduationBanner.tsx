import React from "react";

interface GraduationBannerProps {
  imageUrl: string;
}

const GraduationBanner: React.FC<GraduationBannerProps> = ({ imageUrl }) => {
  return (
    <section
      className="relative w-full py-5 md:py-5 overflow-hidden bg-center bg-cover"
      style={{
        backgroundImage: `url(${imageUrl})`,
        backgroundAttachment: "fixed",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm" />
      {/* Contenido */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          {/* Imagen */}
          <img
            src={imageUrl}
            alt="Graduación Pastelero Profesional - IAG"
            className="rounded-3xl shadow-2xl w-full object-cover"
            loading="lazy"
          />

          {/* Texto */}
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-3xl md:text-4xl font-light text-gray-900">
              Formación que respalda
              <span className="block font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                cada creación
              </span>
            </h3>

            <p className="text-lg text-gray-700 leading-relaxed max-w-xl">
              Pastelería profesional con formación en el Instituto Argentino de
              Gastronomía.
            </p>

            <p className="text-sm text-gray-600 italic">
              Técnica, pasión y compromiso en cada detalle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GraduationBanner;
