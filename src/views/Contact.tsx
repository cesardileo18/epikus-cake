// src/views/Contact.tsx
import React, { useMemo, useRef, useState } from 'react';
import { sendEmail } from '@/config/emailjs';

type FormState = {
    name: string;
    email: string;
    phone: string;
    message: string;
};

const initialState: FormState = {
    name: '',
    email: '',
    phone: '',
    message: '',
};

const Contact: React.FC = () => {
    const [form, setForm] = useState<FormState>(initialState);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const nameRef = useRef<HTMLInputElement | null>(null);

    // WhatsApp (desde .env: VITE_WHATSAPP_NUMBER=54911...)
    const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER ?? '';
    const whatsappLink = useMemo(() => {
        const text = 'Hola Epikus Cake, me gustaría hacer un pedido.';
        return whatsappNumber
            ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`
            : '#';
    }, [whatsappNumber]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const valid = useMemo(() => {
        return Boolean(
            form.name.trim() &&
            form.email.trim() &&
            /^\S+@\S+\.\S+$/.test(form.email) &&
            form.message.trim()
        );
    }, [form]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!valid || sending) return;

        setSending(true);
        setStatus(null);
        try {
            // IMPORTANTE: los nombres deben coincidir con tu template de EmailJS
            await sendEmail({
                from_name: form.name,
                from_email: form.email, // usado también en “Reply To: {{from_email}}”
                phone: form.phone,
                message: form.message,
            });

            setStatus({
                type: 'success',
                msg: '¡Gracias! Tu mensaje fue enviado. Te respondemos a la brevedad.',
            });
            setForm(initialState);
            // devolver el foco para enviar otro mensaje rápido
            setTimeout(() => nameRef.current?.focus(), 0);
        } catch (err) {
            console.error(err);
            setStatus({
                type: 'error',
                msg: 'Ups, no pudimos enviar el mensaje. Intentá de nuevo en unos minutos.',
            });
        } finally {
            setSending(false);
            // ocultar alerta después de un rato
            setTimeout(() => setStatus(null), 4000);
        }
    };

    const submitDisabled = !valid || sending;

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-24 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                {/* Título */}
                <h1 className="mb-10 leading-tight text-[clamp(2rem,6vw,3.5rem)] font-light text-gray-900">
                    Ponete en{' '}
                    <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                        contacto
                    </span>
                </h1>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Formulario */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6 md:p-8">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Escribinos</h2>

                        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

                    {/* Card del mapa */}
                    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-pink-100 p-6 md:p-8 self-start">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dónde estamos</h2>

                        {/* Un poco más alto en mobile para que “llene” mejor */}
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

                        {/* Aclaración que teníamos antes */}
                        <p className="text-sm text-gray-600 mt-4">
                            * Si necesitás envío, coordinamos mensajería (Cabify/Flash/Moto) y el costo corre por cuenta del cliente.
                            No nos responsabilizamos por el estado final del producto durante el transporte de terceros.
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;
