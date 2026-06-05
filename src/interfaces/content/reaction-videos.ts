export interface VideoItem {
  id: string;
  src: string;
}

export interface ReactionVideosSectionProps {
  title: string;
  subtitle?: string;
  videos: VideoItem[];
}
