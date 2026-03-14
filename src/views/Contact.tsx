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
    <div className="min-h-screen section-brand-bg">
      {/* Contenedor y paddings alineados a Home/Products */}
      <section className="page-hero">
        <div className="max-w-7xl mx-auto px-6">
          {/* Título */}
          <div className="mb-10">
            <h1 className="text-4xl md:text-5xl font-light mb-4" style={{ color: 'var(--color-text-primary)' }}>
              {content.header.title_prefix}{' '}
              <span className="font-bold text-brand-gradient">
                {content.header.title_highlight}
              </span>
            </h1>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
              <h2 className="text-xl font-semibold mb-6" style={{ color: 'var(--color-text-primary)' }}>{content.form.title}</h2>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {content.form.fields.name.label}
                  </label>
                  <input
                    ref={nameRef}
                    id="name"
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="w-full rounded-lg px-4 py-3 outline-none transition-all"
                    style={{ background: 'var(--color-bg-page)', border: '2px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                    placeholder={content.form.fields.name.placeholder}
                    required
                    autoComplete={content.form.fields.name.autocomplete}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {content.form.fields.email.label}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={onChange}
                      className="w-full rounded-lg px-4 py-3 outline-none transition-all"
                      style={{ background: 'var(--color-bg-page)', border: '2px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      placeholder={mdText(content.form.fields.email.placeholder)}
                      required
                      autoComplete={content.form.fields.email.autocomplete}
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                      {content.form.fields.phone.label}
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      className="w-full rounded-lg px-4 py-3 outline-none transition-all"
                      style={{ background: 'var(--color-bg-page)', border: '2px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                      placeholder={content.form.fields.phone.placeholder}
                      autoComplete={content.form.fields.phone.autocomplete}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-primary)' }}>
                    {content.form.fields.message.label}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={form.message}
                    onChange={onChange}
                    rows={content.form.fields.message.rows}
                    className="w-full rounded-lg px-4 py-3 outline-none transition-all resize-none"
                    style={{ background: 'var(--color-bg-page)', border: '2px solid var(--color-border)', color: 'var(--color-text-primary)' }}
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
                    className={`flex-1 py-3 rounded-xl font-semibold text-white shadow-lg transition-all ${submitDisabled ? 'cursor-not-allowed opacity-60' : ''} btn-brand`}
                  >
                    {sending ? content.form.buttons.submitting : content.form.buttons.submit}
                  </button>

                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-brand-outline flex-1 text-center py-3"
                  >
                    {content.form.buttons.whatsapp}
                  </a>
                </div>
              </form>
            </div>

            {/* Mapa */}
            <div className="backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8 self-start" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
              <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>{content.map_section.title}</h2>

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

              <p className="text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>{content.map_section.disclaimer}</p>
            </div>

            {/* Datos rápidos */}
            <div className="backdrop-blur-sm rounded-3xl shadow-xl p-6 md:p-8" style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' }}>
              <div className="grid sm:grid-cols-2 gap-4 text-sm" style={{ color: 'var(--color-text-primary)' }}>
                <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-card-inner)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{content.quick_info.email.label}</p>
                  <p>{mdText(content.quick_info.email.value)}</p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--color-bg-card-inner)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{content.quick_info.schedule.label}</p>
                  <p>{content.quick_info.schedule.value}</p>
                  {content.quick_info.schedule.note && (
                    <p className="text-xs text-gray-500">{content.quick_info.schedule.note}</p>
                  )}
                </div>
                <div className="rounded-xl p-4 sm:col-span-2" style={{ background: 'var(--color-bg-card-inner)' }}>
                  <p className="font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>{content.quick_info.pickup_delivery.label}</p>
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