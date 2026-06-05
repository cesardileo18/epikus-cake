export interface PrivacyContent {
  hero: {
    badge: string;
    title_prefix: string;
    title_highlight: string;
    subtitle_html: string; // admite <span> para marca
  };
  intro: {
    text_html: string; // contiene mailto
  };
  sections: Array<{
    title: string;
    items?: string[];     // para listas
    text?: string;        // para párrafos
  }>;
  meta: {
    last_update_label: string; // "Última actualización:"
    last_update_value: string; // "Septiembre 2025"
  };
  routes: {
    home: string; // "/"
  };
  cta: {
    back_home: string; // "Volver al inicio"
  };
}
