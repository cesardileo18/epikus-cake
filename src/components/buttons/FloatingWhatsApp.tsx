import { FaWhatsapp } from 'react-icons/fa';
const WA_PHONE = import.meta.env.VITE_WA_PHONE;
const DEFAULT_WA_MSG = '¡Hola! Vengo de tu página web y quiero hacer una consulta.';

export default function FloatingWhatsApp() {
  const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(DEFAULT_WA_MSG)}`;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir WhatsApp"
      className="fixed bottom-9 md:bottom-5 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-xl transition
                 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
      style={{ animation: 'epikus-pop 800ms ease 2.2s both' }}
    >
      <FaWhatsapp className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
