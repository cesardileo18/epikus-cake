// src/pages/Contact.tsx
import React, { useState } from 'react';
import useContactForm from '@/hooks/useContactForm';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import ReCaptchaInvisible from '@/components/security/ReCaptchaInvisible';

import contactJson from '@/content/contactContent.json';
import type { ContactContent } from '@/interfaces/ContactContent';


const content: ContactContent = contactJson as ContactContent;

// Helpers para campos con formato "[texto](url)"
const mdHref = (s: string) => {
  const m = s.match(/^\[(.*?)\]\((.*?)\)$/);
  return m ? m[2] : s;
};
const mdText = (s: string) => {
  const m = s.match(/^\[(.*?)\]\((.*?)\)$/);
  return m ? m[1] : s;
};

const Contact: React.FC = () => {
  const {
    form, onChange, valid, submit, sending, status, whatsappLink, nameRef,
  } = useContactForm();
  const [errorRecaptcha, setErrorRecaptcha] = useState<string | null>(null);
  const { executeRecaptcha } = useRecaptcha(true);

  const submitDisabled = !valid || sending;

  // Nuevo handler que incluye reCAPTCHA
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorRecaptcha(null);
    // Ejecutar reCAPTCHA
    const recaptchaResult = await executeRecaptcha("contact_form");

    if (!recaptchaResult.ok) {
      console.error("reCAPTCHA falló:", recaptchaResult.error);
      return;
    }

    if (recaptchaResult.score && recaptchaResult.score < 0.5) {
      console.error("Score reCAPTCHA muy bajo:", recaptchaResult.score);
      setErrorRecaptcha('No pudimos verificar que sos humano. Intentá de nuevo.');
      return;
    }

    // Si pasó reCAPTCHA, enviar formulario
    submit(e);
  };

  return (
    <div className="min-h-screen bg-[#ff7bab48]">
      {/* Contenedor y paddings alineados a Home/Products */}
      <section className="py-22">
        <div className="max-w-7xl mx-auto px-6">
          {/* Título */}
          <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
            {content.header.title_prefix}{' '}
            <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
              {content.header.title_highlight}
            </span>
          </h1>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">{content.form.title}</h2>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {content.form.fields.name.label}
                  </label>
                  <input
                    ref={nameRef}
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder={content.form.fields.name.placeholder}
                    required
                    autoComplete={content.form.fields.name.autocomplete}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {content.form.fields.email.label}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder={mdText(content.form.fields.email.placeholder)}
                      required
                      autoComplete={content.form.fields.email.autocomplete}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {content.form.fields.phone.label}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400"
                      placeholder={content.form.fields.phone.placeholder}
                      autoComplete={content.form.fields.phone.autocomplete}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    {content.form.fields.message.label}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={content.form.fields.message.rows}
                    className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder={content.form.fields.message.placeholder}
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

                {/* Badge reCAPTCHA */}
                <ReCaptchaInvisible />
                {errorRecaptcha && (
                  <div className="rounded-xl px-4 py-3 text-sm bg-rose-50 text-rose-700 border border-rose-200">
                    {errorRecaptcha}
                  </div>
                )}
                {/* Botones */}
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
                    {sending ? content.form.buttons.submitting : content.form.buttons.submit}
                  </button>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-3 rounded-xl font-semibold border border-pink-200 text-pink-600 bg-white/80 hover:bg-white transition"
                  >
                    {content.form.buttons.whatsapp}
                  </a>
                </div>
              </form>
            </div>

            {/* Mapa */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6 md:p-8 self-start">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{content.map_section.title}</h2>

              <div className="aspect-[4/3] sm:aspect-video w-full overflow-hidden rounded-2xl border border-pink-100 shadow">
                <iframe
                  className="w-full h-full"
                  src={mdHref(content.map_section.iframe_src)}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Ubicación Epikus Cake"
                />
              </div>

              <p className="text-sm text-gray-600 mt-4">{content.map_section.disclaimer}</p>
            </div>

            {/* Datos rápidos */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6 md:p-8">
              <div className="mt-8 grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="rounded-xl bg-[#e70ee71c] p-4">
                  <p className="font-semibold text-gray-900 mb-1">{content.quick_info.email.label}</p>
                  <p>{mdText(content.quick_info.email.value)}</p>
                </div>
                <div className="rounded-xl bg-[#e70ee71c] p-4">
                  <p className="font-semibold text-gray-900 mb-1">{content.quick_info.schedule.label}</p>
                  <p>{content.quick_info.schedule.value}</p>
                  {content.quick_info.schedule.note && (
                    <p className="text-xs text-gray-500">{content.quick_info.schedule.note}</p>
                  )}
                </div>
                <div className="rounded-xl bg-[#e70ee71c] p-4 sm:col-span-2">
                  <p className="font-semibold text-gray-900 mb-1">{content.quick_info.pickup_delivery.label}</p>
                  <p>{content.quick_info.pickup_delivery.value}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;