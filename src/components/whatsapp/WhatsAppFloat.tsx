import { FaWhatsapp } from 'react-icons/fa';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { DEFAULT_STORE_SETTINGS } from '@/services/settings.service';

export default function WhatsAppFloat() {
  const { settings } = useStoreSettings();
  const phone = settings?.whatsapp || DEFAULT_STORE_SETTINGS.whatsapp;
  const message =
    settings?.whatsappMessage || 'Hola, vengo de la pagina web y quiero hacer una consulta.';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Abrir WhatsApp"
      className="floating-wa fixed bottom-9 right-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl transition hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300 md:bottom-5"
    >
      <FaWhatsapp className="h-7 w-7" aria-hidden="true" />
    </a>
  );
}
