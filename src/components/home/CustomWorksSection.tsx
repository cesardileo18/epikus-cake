import React, { useState } from 'react';
import type { CustomWorkItem } from '@/interfaces/CustomWorks';

interface CustomWorksSectionProps {
  title?: string;
  items: CustomWorkItem[];
}

const CustomWorksSection: React.FC<CustomWorksSectionProps> = ({ items }) => {
  const [selected, setSelected] = useState<CustomWorkItem | null>(null);

  return (
    <section className="custom-works-section relative py-5 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        <div className="text-center mb-5">
          <h2 className="custom-works-title text-3xl md:text-5xl font-light mb-3">
            Creaciones{' '}
            <span className="font-bold text-brand-gradient">únicas</span>
          </h2>
          <p className="custom-works-subtitle text-base md:text-lg">
            Cada torta cuenta una historia especial
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="custom-works-card group relative rounded-2xl p-1 transform hover:-translate-y-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both` } as React.CSSProperties}
            >
              <div className="custom-works-card-inner relative aspect-square rounded-xl overflow-hidden shadow-inner">
                <img
                  src={item.src}
                  alt={item.alt ?? 'Trabajo personalizado Epikus Cake'}
                  loading="lazy"
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/20 via-transparent to-rose-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="absolute inset-0 hidden md:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className="relative">
                    <div className="absolute inset-0 w-16 h-16 bg-pink-400/30 rounded-full animate-ping" />
                    <div className="relative w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <svg className="custom-works-zoom-icon w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="absolute top-2 right-2 md:hidden">
                  <div className="w-8 h-8 bg-white/95 rounded-full flex items-center justify-center shadow-lg">
                    <svg className="custom-works-zoom-icon w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>

                <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <div className="custom-works-card absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-50 blur-xl -z-10 transition-opacity duration-300" />
            </button>
          ))}
        </div>

        <div className="mt-5 text-center">
          <div className="custom-works-badge inline-flex items-center gap-3 px-6 py-3 rounded-full shadow-xl">
            <div className="flex -space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="custom-works-badge-dot w-8 h-8 rounded-full border-2 shadow-md"
                  style={{ animation: `bounce 2s infinite ${i * 0.2}s` }}
                />
              ))}
            </div>
            <span className="custom-works-badge-text text-sm font-semibold">
              diseños únicos creados
            </span>
            <span className="text-xl">🎂</span>
          </div>
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
          style={{ animation: 'fadeIn 0.2s ease-out' } as React.CSSProperties}
        >
          <button
            className="absolute top-4 right-4 w-14 h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:rotate-90 hover:scale-110 shadow-2xl border border-white/20 z-10"
            aria-label="Cerrar"
            onClick={() => setSelected(null)}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div
            className="custom-works-modal-frame relative max-w-5xl w-full p-2 rounded-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-black rounded-xl overflow-hidden">
              <img src={selected.src} alt={selected.alt} className="w-full h-auto max-h-[85vh] object-contain" />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn   { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn  { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </section>
  );
};

export default CustomWorksSection;
