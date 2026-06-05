// src/content/types.ts
export interface HeroContent {
  title_prefix: string;
  title_highlight: string;
  subtitle: string;
}

export interface ButtonLabels {
  view_products: string;
  view_all_products: string;
}

export interface FeatureItem {
  title: string;
  desc: string;
}

export interface FeaturedSection {
  badge: string;
  title_prefix: string;
  title_highlight: string;
  subtitle: string;
}

export interface HomeTextContent {
  hero: HeroContent;
  buttons: ButtonLabels;
  features: FeatureItem[];
  featured_section: FeaturedSection;
  image_fallback_text: string;
}
