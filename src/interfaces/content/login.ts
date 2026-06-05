export interface LoginContent {
  hero: {
    title_prefix: string;        // "Iniciar"
    title_highlight: string;     // "sesión"
    subtitle: string;            // "Accedé para ver tus pedidos..."
  };
  google: {
    label: string;               // "Continuar con Google"
    connecting: string;          // "Conectando…"
    aria: string;                // "Continuar con Google"
    error: string;               // error al iniciar con Google
  };
  divider: {
    text: string;                // "o con tu email"
  };
  email: {
    label: string;               // "Correo electrónico"
    placeholder: string;         // "tu@email.com"
    help: string;                // "Te enviaremos un enlace mágico..."
    send_label: string;          // "Enviarme un enlace por email"
    resend_label: string;        // "Reenviar enlace"
    sending_label: string;       // "Enviando…"
    error: string;               // error al enviar enlace
    link_sent_prefix: string;    // "Te enviamos un enlace a "
    open_hint: string;           // "Abrilo desde el dispositivo..."
    resend_in_prefix: string;    // "Podrás reenviar en "
    resend_in_suffix: string;    // "s"
    cooldown_seconds: number;    // 60
  };
  footer: {
    back_home_label: string;     // "Volver al inicio"
  };
  routes: {
    home: string;                // "/"
  };
}
