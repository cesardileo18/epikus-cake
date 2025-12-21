import React from "react";

interface GraduationVideoSectionProps {
  videoSrc: string;
}

const GraduationVideoSection: React.FC<GraduationVideoSectionProps> = ({ 
  videoSrc = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
}) => {
  return (
    <section className="py-10 bg-gradient-to-br from-pink-500/10 via-rose-400/5 to-pink-600/10 border-b-4 border-pink-200">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Columna de Texto */}
          <div className="space-y-6 order-2 md:order-1">

            <h2 className="text-3xl md:text-5xl text-gray-900 leading-tight">
              Un momento que lo dice{" "}
              <span className="text-pink-600">todo</span>
            </h2>

            <div className="w-20 h-1 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full"></div>

            <p className="text-base md:text-xl text-gray-600 leading-relaxed">
              La graduación como{" "}
              <span className="font-semibold text-gray-900">Pastelero Profesional</span>.
            </p>

            <p className="text-sm md:text-lg text-gray-500 leading-relaxed">
              Un logro que hoy se refleja en la calidad, dedicación y amor 
              que ponemos en cada producto de <span className="font-semibold text-pink-600">Epikus Cake</span>.
            </p>

            <div className="flex gap-6 pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎓</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Certificado</div>
                  <div className="text-xs text-gray-500">Profesional</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Excelencia</div>
                  <div className="text-xs text-gray-500">Garantizada</div>
                </div>
              </div>
            </div>

          </div>

          {/* Columna del Video */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              
              {/* Decoración de fondo */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-pink-400 to-rose-400 rounded-3xl transform rotate-3"></div>
              
              {/* Container del video */}
              <div className="relative bg-white p-3 rounded-3xl shadow-2xl">
                <div className="w-[300px] aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-pink-400 to-rose-400">
                  <video
                    src={videoSrc}
                    controls
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Badge flotante */}
              <div className="absolute -top-4 -right-4 bg-pink-600 text-white px-5 py-2 rounded-full shadow-lg">
                <span className="text-sm font-bold">¡Orgullo! 🎉</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

export default GraduationVideoSection;