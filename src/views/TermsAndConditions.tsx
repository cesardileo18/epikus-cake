// src/pages/TermsAndConditions.tsx
import React from "react";
import { Link } from "react-router-dom";

const TermsAndConditions: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Hero */}
      <section className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-rose-400/5 to-pink-600/10" />
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-20 pb-10">
          <div className="text-center space-y-4">
            <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 rounded-full font-semibold">
              Términos y Condiciones
            </span>
            <h1 className="text-4xl md:text-5xl font-light text-gray-900">
              Hacemos todo{" "}
              <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                claro y simple
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Condiciones aplicables a los pedidos de <span className="font-semibold">Epikus Cake</span>.
            </p>
          </div>
        </div>

        {/* Orbes decorativos como en Home */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-300 rounded-full opacity-20 animate-bounce" />
        <div className="absolute bottom-12 right-10 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-8 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-300 rounded-full opacity-25 animate-bounce" />
      </section>

      {/* Contenido */}
      <section className="relative py-10">
        <div className="max-w-5xl mx-auto px-6 space-y-6">
          {/* 1. Pedidos */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              1. Pedidos y anticipación
            </h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Los pedidos deben realizarse con un mínimo de <b>48 a 72 horas</b> de anticipación.</li>
              <li>Para confirmar el pedido es necesario abonar el <b>50% del valor</b>. El saldo se paga al retirar.</li>
              <li>Los productos son personalizados y se elaboran a pedido.</li>
            </ul>
          </div>

          {/* 2. Pagos y precios */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              2. Pagos y precios
            </h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Cotizamos según los precios vigentes del mes.</li>
              <li>Para cotizaciones con fecha futura (p. ej., en 2–3 meses), el precio <b>puede variar</b> por inflación o cambios de insumos.</li>
              <li>El valor final se confirma al momento de la seña.</li>
            </ul>
          </div>

          {/* 3. Retiros y envíos */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              3. Retiros y envíos
            </h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Los pedidos se <b>retiran en nuestro domicilio</b> (CABA).</li>
              <li>Si el cliente desea envío, podemos gestionarlo por <b>Cabify</b> a pedido del comprador.</li>
              <li>El envío es <b>a cargo y bajo responsabilidad</b> del comprador. Epikus Cake no se hace responsable por el estado del producto una vez entregado al transporte.</li>
            </ul>
          </div>

          {/* 4. Cancelaciones */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              4. Cancelaciones
            </h2>
            <ul className="list-disc ml-6 text-gray-700 space-y-1">
              <li>Cancelaciones con más de <b>48 horas</b> de anticipación: reintegro del monto abonado.</li>
              <li>Cancelaciones posteriores: <b>sin reembolso</b>, por tratarse de productos personalizados.</li>
            </ul>
          </div>

          {/* 5. Trato y derecho a rechazar */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              5. Trato y derecho a rechazar pedidos
            </h2>
            <p className="text-gray-700">
              Priorizamos un trato cordial y respetuoso. Nos reservamos el derecho de <b>rechazar pedidos</b> ante conductas inapropiadas o faltas de respeto hacia nuestro equipo.
            </p>
          </div>

          {/* 6. Modificaciones */}
          <div className="bg-white/80 backdrop-blur-sm border border-pink-100 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              6. Modificaciones
            </h2>
            <p className="text-gray-700">
              Estos términos pueden actualizarse sin previo aviso. La última versión estará siempre disponible en este sitio.
            </p>
            <p className="mt-4 text-sm text-gray-500">Última actualización: Septiembre 2025</p>
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

export default TermsAndConditions;
