export interface WholesaleHero {
  badge: string;
  title_prefix: string;
  title_highlight: string;
  subtitle: string;
  availability_note: string;
}

export interface WholesalePackInfo {
  title: string;
  description: string;
}

export interface WholesaleTableColumns {
  product: string;
  unit_price: string;
  pack_min: string;
  pack_total: string;
}

export interface WholesaleTable {
  title_prefix: string;
  title_highlight: string;
  subtitle: string;
  columns: WholesaleTableColumns;
}

export interface WholesaleCta {
  title: string;
  subtitle: string;
  whatsapp_label: string;
  whatsapp_number: string;
  whatsapp_message: string;
}

export interface WholesalePage {
  title: string;
  hero: WholesaleHero;
  pack_info: WholesalePackInfo;
  table: WholesaleTable;
  cta: WholesaleCta;
  image_fallback_text: string;
}

export type TagVariant = 'rose' | 'gold';

export interface WholesaleCategory {
  id: string;
  label: string;
  tag_variant: TagVariant;
  title_prefix: string;
  title_highlight: string;
  subtitle: string;
}

export interface WholesaleProduct {
  id: string;
  category_id: string;
  name: string;
  description: string;
  image: string;
  price_per_unit: number;
  pack_qty: number;
}

export interface WholesaleContent {
  page: WholesalePage;
  categories: WholesaleCategory[];
  products: WholesaleProduct[];
}