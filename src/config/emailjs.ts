import emailjs from '@emailjs/browser';

const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string;
const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;

let initialized = false;

/** Inicializa EmailJS una sola vez (igual que Firebase). */
export function initEmailJS(): void {
  if (!initialized) {
    if (!PUBLIC_KEY) throw new Error('Falta VITE_EMAILJS_PUBLIC_KEY');
    emailjs.init({ publicKey: PUBLIC_KEY });
    initialized = true;
  }
}

/** Tipado de las variables que espera tu template de EmailJS. */
export type EmailVars = {
  from_name: string;
  from_email: string;
  message: string;
  // agrega más campos si tu template los usa
  [key: string]: any;
};

/** Enviar email usando los IDs por defecto del .env (sobrescribibles). */
export function sendEmail(
  vars: EmailVars,
  templateId: string = TEMPLATE_ID,
  serviceId: string = SERVICE_ID
) {
  initEmailJS();
  if (!serviceId)  throw new Error('Falta VITE_EMAILJS_SERVICE_ID');
  if (!templateId) throw new Error('Falta VITE_EMAILJS_TEMPLATE_ID');
  return emailjs.send(serviceId, templateId, vars);
}

export default { initEmailJS, sendEmail };
