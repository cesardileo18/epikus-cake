import { getFunctions, httpsCallable } from 'firebase/functions';

export type EmailVars = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  [key: string]: any;
};

type SendEmailResponse = {
  success: boolean;
  messageId: string;
};

export function initEmailJS(): void {
  // No hace falta inicializar nada con Firebase
}

export function sendEmail(vars: EmailVars) {
  const functions = getFunctions(undefined, 'southamerica-east1');
  const sendEmailCallable = httpsCallable<EmailVars, SendEmailResponse>(functions, 'sendEmail');
  
  return sendEmailCallable(vars);
}

export default { initEmailJS, sendEmail };