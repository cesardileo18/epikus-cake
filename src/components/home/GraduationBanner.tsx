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
      {/* Overlay — en dark mode más oscuro */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'var(--color-graduation-overlay, rgba(255,255,255,0.70))' }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
          <img
            src={imageUrl}
            alt="Graduación Pastelero Profesional - IAG"
            className="rounded-3xl shadow-2xl w-full object-cover"
            loading="lazy"
          />

          <div className="space-y-2 text-center md:text-left">
            <h3
              className="text-3xl md:text-4xl font-light"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Formación que respalda
              <span className="block font-bold text-brand-gradient">
                cada creación
              </span>
            </h3>

            <p
              className="text-lg leading-relaxed max-w-xl"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Pastelería profesional con formación en el Instituto Argentino de Gastronomía.
            </p>

            <p
              className="text-sm italic"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Técnica, pasión y compromiso en cada detalle.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GraduationBanner;
