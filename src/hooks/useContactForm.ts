import { useMemo, useRef, useState } from 'react';
import { sendEmail } from '@/config/emailjs';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { DEFAULT_STORE_SETTINGS } from '@/services/settings.service';

export type ContactFormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

const INITIAL: ContactFormState = { name: '', email: '', phone: '', message: '' };

export default function useContactForm() {
  const { settings } = useStoreSettings();
  const [form, setForm] = useState<ContactFormState>(INITIAL);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const valid = useMemo(() => {
    if (!form.name.trim()) return false;
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return false;
    if (!form.message.trim()) return false;
    return true;
  }, [form]);

  const whatsappNumber = settings?.whatsapp || DEFAULT_STORE_SETTINGS.whatsapp;
  const whatsappMessage = settings?.whatsappMessage || DEFAULT_STORE_SETTINGS.whatsappMessage;
  const whatsappLink = useMemo(
    () => `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
    [whatsappMessage, whatsappNumber]
  );

  const submit = async (e?: React.FormEvent, recipientEmail?: string) => {
    if (e) e.preventDefault();
    if (!valid || sending) return;

    setSending(true);
    setStatus(null);

    try {
      await sendEmail({
        to: recipientEmail || settings?.contactEmail || DEFAULT_STORE_SETTINGS.contactEmail,
        subject: `Nuevo mensaje de ${form.name}`,
        html: `<p><strong>Nombre:</strong> ${form.name}</p>
         <p><strong>Email:</strong> ${form.email}</p>
         <p><strong>Telefono:</strong> ${form.phone}</p>
         <p><strong>Mensaje:</strong></p>
         <p>${form.message}</p>`,
        text: `Nombre: ${form.name}\nEmail: ${form.email}\nTelefono: ${form.phone}\n\nMensaje:\n${form.message}`,
      });
      setStatus({
        type: 'success',
        msg: 'Gracias! Tu mensaje fue enviado. Te respondemos a la brevedad.',
      });
      setForm(INITIAL);
      setTimeout(() => nameRef.current?.focus(), 0);
    } catch (err) {
      console.error(err);
      setStatus({
        type: 'error',
        msg: 'Ups, no pudimos enviar el mensaje. Intenta de nuevo en unos minutos.',
      });
    } finally {
      setSending(false);
      setTimeout(() => setStatus(null), 4000);
    }
  };

  return { form, onChange, valid, submit, sending, status, whatsappLink, nameRef };
}
