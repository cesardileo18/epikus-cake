export interface CustomWorkItem {
  id: string;
  src: string;
  alt?: string;
}

export interface CustomWorksContent {
  title: string;
  items: CustomWorkItem[];
}
