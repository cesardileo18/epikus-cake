// src/pages/Privacidad.tsx
import React from "react";
import { Link } from "react-router-dom";

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Hero */}
      <section className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-rose-400/5 to-pink-600/10" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-20 pb-10">
          <div className="text-center space-y-4">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 rounded-full font-semibold">
              Política de Privacidad
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900">
              Tu información,{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                siempre segura
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              En <span className="font-semibold">Epikus Cake</span> respetamos tu
              privacidad y tratamos tus datos con responsabilidad y transparencia.
            </p>
          </div>
        </div>

        {/* orbes decorativos como en Home */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-300 rounded-full opacity-20 animate-bounce" />
        <div className="absolute bottom-12 right-10 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-8 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-300 rounded-full opacity-25 animate-bounce" />
      </section>

      {/* Contenido */}
      <section className="relative py-10">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          {/* Intro */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <p className="text-gray-700">
              Esta Política describe qué datos personales recopilamos, para qué los usamos,
              cómo los protegemos y qué derechos tenés. Si tenés dudas, escribinos a{" "}
              <a
                href="mailto:epikuscake@gmail.com"
                className="text-pink-600 font-semibold hover:underline"
              >
                epikuscake@gmail.com
              </a>{" "}
              o por WhatsApp.
            </p>
          </div>

          {/* 1. Datos que recopilamos */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              1. Datos que recopilamos
            </h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Nombre, teléfono y/o e-mail que nos envíes por WhatsApp, formulario o redes.</li>
              <li>Datos necesarios para gestionar pedidos (dirección, fecha de entrega, preferencias).</li>
              <li>Información técnica mínima de navegación (p. ej., páginas visitadas) para mejorar la experiencia. No hacemos perfiles invasivos ni vendemos datos.</li>
            </ul>
          </div>

          {/* 2. Finalidades */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              2. Para qué usamos tu información
            </h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Tomar, preparar y entregar pedidos.</li>
              <li>Responder consultas y brindar soporte personalizado.</li>
              <li>Mejorar nuestros productos, catálogo y experiencia del sitio.</li>
              <li>Procesar pagos (si corresponde) a través de proveedores como Mercado Pago.</li>
            </ul>
          </div>

          {/* 3. Compartir datos */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              3. Con quién compartimos datos
            </h2>
            <p className="text-gray-700">
              No vendemos tu información. Solo la compartimos con terceros necesarios para
              operar (p. ej., pasarela de pagos y servicios de entrega), quienes están
              obligados a protegerla y usarla solo para ese fin.
            </p>
          </div>

          {/* 4. Seguridad */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              4. Seguridad
            </h2>
            <p className="text-gray-700">
              Aplicamos medidas razonables para resguardar tus datos. Aun así, ningún
              sistema es 100% infalible. Si detectás algo inusual, contactanos de inmediato.
            </p>
          </div>

          {/* 5. Tus derechos */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              5. Tus derechos
            </h2>
            <p className="text-gray-700">
              Podés solicitar acceso, actualización, rectificación o eliminación de tus datos.
              Escribinos a{" "}
              <a
                href="mailto:epikuscake@gmail.com"
                className="text-pink-600 font-semibold hover:underline"
              >
                epikuscake@gmail.com
              </a>
              . Si residís en Argentina, esta política se adecua de forma general a la{" "}
              Ley 25.326 de Protección de Datos Personales.
            </p>
          </div>

          {/* 6. Cookies (opcional simple) */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              6. Cookies
            </h2>
            <p className="text-gray-700">
              Usamos cookies técnicas para el funcionamiento del sitio y, de forma limitada,
              analíticas para mejorar contenidos. Podés bloquearlas desde tu navegador.
            </p>
          </div>

          {/* 7. Cambios */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              7. Cambios en esta política
            </h2>
            <p className="text-gray-700">
              Podemos actualizar esta política. Publicaremos cualquier modificación aquí.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Última actualización: Septiembre 2025
            </p>
          </div>

          {/* CTA / Volver */}
          <div className="text-center pt-2">
            <Link
              to="/"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
