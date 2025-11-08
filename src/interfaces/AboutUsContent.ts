// src/interfaces/AboutUs.ts

export interface AboutUsHero {
  title_prefix: string;
  title_highlight: string;
  subtitle: string;
}

export interface AboutUsCta {
  whatsapp_label: string;
  whatsapp_link: string;
  contact_label: string;
  contact_link: string;
}

export interface AboutUsChefCard {
  image_src: string;
  image_alt: string;
  name: string;
  bio: string;
  bullets: string[];
}

export interface AboutUsStat {
  value: string;
  label: string;
}

export interface AboutUsTimelineItem {
  title: string;
  desc: string;
}

export interface AboutUsHistorySection {
  kicker: string;
  title: string;
  desc: string;
  timeline: AboutUsTimelineItem[];
}

export interface AboutUsGalleryItem {
  src: string;
  alt: string;
}

export interface AboutUsPrinciple {
  title: string;
  desc: string;
}
export interface AboutUsInstagram {
  kicker?: string;
  title: string;
  subtitle?: string;
  handle: string;
  url: string;
  qr_src: string;
  cta_label: string;
}
export interface AboutUsContent {
  hero: AboutUsHero;
  cta: AboutUsCta;
  chef_card: AboutUsChefCard;
  stats: AboutUsStat[];
  history_section: AboutUsHistorySection;
  gallery: AboutUsGalleryItem[];
  principles: AboutUsPrinciple[];
   instagram: AboutUsInstagram;
}
