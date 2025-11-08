export interface TermsContent {
  hero: {
    badge: string;
    title_prefix: string;
    title_highlight: string;
    subtitle_html: string;
  };
  sections: Array<{
    title: string;
    items?: string[];     // listas con bullets
    text?: string;        // párrafos
  }>;
  meta: {
    last_update_label: string;
    last_update_value: string;
  };
  routes: {
    home: string;         // "/"
  };
  cta: {
    back_home: string;    // "Volver al inicio"
  };
}
