// src/pages/Contact.tsx
import React from 'react';
import useContactForm from '@/hooks/useContactForm';

const Contact: React.FC = () => {
  const {
    form, onChange, valid, submit, sending, status, whatsappLink, nameRef,
  } = useContactForm();

  const submitDisabled = !valid || sending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Contenedor y paddings alineados a Home/Products */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            Ponete en{' '}
            <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
              Contacto
            </span>
          </h1>
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Escribinos</h2>

              <form onSubmit={submit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    ref={nameRef}
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Tu nombre"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="tu@email.com"
                      required
                      autoComplete="email"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono (opcional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder="Ej: 11 2345 6789"
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={5}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="Contanos qué te gustaría pedir o consultar…"
                    required
                  />
                </div>

                {status && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={`rounded-xl px-4 py-3 text-sm ${status.type === 'success'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                  >
                    {status.msg}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitDisabled}
                    aria-busy={sending}
                    className={`flex-1 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${submitDisabled
                        ? 'bg-pink-300 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-rose-400 hover:shadow-xl'
                      }`}
                  >
                    {sending ? 'Enviando…' : 'Enviar mensaje'}
                  </button>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-3 rounded-xl font-semibold border border-pink-200 text-pink-600 bg-white/80 hover:bg-white transition"
                  >
                    Escribir por WhatsApp
                  </a>
                </div>
              </form>

              {/* Datos rápidos */}
              <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="rounded-xl bg-pink-50/60 border border-pink-100 p-4">
                  <p className="font-semibold text-gray-900 mb-1">Email</p>
                  <p>epikuscake@gmail.com</p>
                </div>
                <div className="rounded-xl bg-pink-50/60 border border-pink-100 p-4">
                  <p className="font-semibold text-gray-900 mb-1">Horario</p>
                  <p>Lun a Sáb · 10:00–18:00</p>
                  <p className="text-xs text-gray-500">Pedidos con 72 h de anticipación</p>
                </div>
                <div className="rounded-xl bg-pink-50/60 border border-pink-100 p-4 sm:col-span-2">
                  <p className="font-semibold text-gray-900 mb-1">Retiro / Entrega</p>
                  <p>
                    Humberto 1º 2076, CABA — Retiro acordado. Envíos por mensajería a cargo del cliente.
                    No nos responsabilizamos por el estado final del producto durante el transporte de terceros.
                  </p>
                </div>
              </div>
            </div>

            {/* Mapa */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6 md:p-8 self-start">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dónde estamos</h2>

              <div className="aspect-[4/3] sm:aspect-video w-full overflow-hidden rounded-2xl border border-pink-100 shadow">
                <iframe
                  className="w-full h-full"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.2958257442715!2d-58.397826490663086!3d-34.62196385834573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb1fe53395eb%3A0xf53cd2994461d0ac!2sHumberto%201%C2%BA%202076%2C%20C1229AAF%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1756591967869!5m2!1ses!2sar"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Epikus Cake"
                />
              </div>

              <p className="text-sm text-gray-600 mt-4">
                * Si necesitás envío, coordinamos mensajería (Cabify/Flash/Moto) y el costo corre por cuenta del cliente.
                No nos responsabilizamos por el estado final del producto durante el transporte de terceros.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
