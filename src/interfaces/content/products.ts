// src/interfaces/Products.ts

export interface ProductsHeader {
  title_prefix: string;
  title_highlight: string;
  subtitle: string;
}

export interface ProductsSearchText {
  placeholder: string;
  clear_aria_label: string;
}

export interface ProductsFiltersText {
  button_label: string;
  dropdown_title: string;
  option_all: string;
}

export interface ProductsLoadingText {
  message: string;
}

export interface ProductsEmptyStateText {
  title: string;
  description: string;
}

export interface ProductsTextContent {
  header: ProductsHeader;
  search: ProductsSearchText;
  filters: ProductsFiltersText;
  loading: ProductsLoadingText;
  empty_state: ProductsEmptyStateText;
  image_fallback_text: string;
}
