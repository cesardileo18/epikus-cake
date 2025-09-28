import { FaWhatsapp } from 'react-icons/fa';
export default function FloatingWhatsApp() {
    return (
        <a
            href="https://wa.me/YOUR_PHONE_NUMBER"
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
