// src/views/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDaysIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  PaintBrushIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import useFeaturedProducts from '@/hooks/useFeaturedProducts';
import ProductGrid from '@/components/productos/ProductGrid';
import contentJson from '@/content/homeContent.json';
import type { HomeTextContent } from '@/interfaces/HomeContent';
import HeroCarousel from '@/components/home/HeroCarousel';
import { Badge } from '@/components/aboutUs/Badge';
import { InstagramSection } from '@/components/aboutUs/InstagramSection';
import aboutJson from "@/content/aboutUsContent.json";
import customVideos from "@/content/customVideos.json";
import type { ReactionVideosSectionProps } from '@/interfaces/customVideos';
import type { AboutUsContent } from "@/interfaces/AboutUsContent";
import ReactionVideosSection from '@/components/reacciones/ReactionVideosSection';
import CustomWorksSection from '@/components/home/CustomWorksSection';
import customWorksJson from '@/content/customWorks.json';
import type { CustomWorksContent } from '@/interfaces/CustomWorks';
import GraduationBanner from '@/components/home/GraduationBanner';

const customWorks    = customWorksJson as CustomWorksContent;
const videosContent  = customVideos as ReactionVideosSectionProps;
const contentAbout   = aboutJson as AboutUsContent;
const content        = contentJson as HomeTextContent;

const iconByTitle: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  'Hecho a pedido (3 días)':    CalendarDaysIcon,
  'Ingredientes premium':        SparklesIcon,
  'Atención personalizada':      ChatBubbleBottomCenterTextIcon,
  'Diseños personalizados':      PaintBrushIcon,
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
  (e.target as HTMLImageElement).src =
    `https://via.placeholder.com/400x400/f8fafc/64748b?text=${encodeURIComponent(content.image_fallback_text)}`;
};

const Home: React.FC = () => {
  const { products: featuredProducts, loading } = useFeaturedProducts({ onlyActive: true, max: 6 });

  const features = content.features.map(f => ({
    ...f,
    Icon: iconByTitle[f.title] ?? SparklesIcon,
  }));

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-bg-page)' }}>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative pt-25 md:pt-28 pb-10 overflow-hidden">
        <div className="absolute inset-0 section-alt-bg" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light mb-4"
              style={{ color: 'var(--color-text-primary)' }}>
              {content.hero.title_prefix}{' '}
              <span className="font-bold text-brand-gradient">
                {content.hero.title_highlight}
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: 'var(--color-text-secondary)' }}>
              {content.hero.subtitle}
            </p>
          </div>
        </div>

        {/* Burbujas decorativas */}
        <div className="absolute top-20 left-10 w-20 h-20 rounded-full opacity-20 animate-bounce"
          style={{ background: 'var(--gradient-brand)' }} />
        <div className="absolute bottom-32 right-16 w-16 h-16 rounded-full opacity-30 animate-bounce"
          style={{ background: 'linear-gradient(to right, #fbbf24, #f97316)' }} />
        <div className="absolute top-1/3 right-8 w-12 h-12 rounded-full opacity-25 animate-bounce"
          style={{ background: 'linear-gradient(to right, #a855f7, var(--color-brand-light))' }} />
      </section>

      {/* ── Carrusel ──────────────────────────────────────────── */}
      <section className="relative w-full">
        <HeroCarousel />
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="relative w-full py-12 md:py-16 section-alt-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {features.map(({ title, Icon, desc }) => (
              <div key={title} className="text-center px-2">
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                  style={{ background: 'var(--gradient-brand)' }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-sm md:text-base lg:text-lg font-semibold mb-2"
                  style={{ color: 'var(--color-text-primary)' }}>
                  {title}
                </div>
                <p className="text-xs md:text-sm leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <GraduationBanner
        imageUrl="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1766275946/fotoGraduacion_gaauk1.jpg"
      />

      {/* ── Productos Destacados ───────────────────────────────── */}
      <section className="pt-5 section-brand-bg backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <div className="mb-5">
              <Badge>
                <StarSolid className="w-4 h-4 mr-2 text-amber-300" />
                {content.featured_section.badge}
              </Badge>
            </div>
            <h2 className="text-4xl md:text-5xl font-light mb-4"
              style={{ color: 'var(--color-text-primary)' }}>
              {content.featured_section.title_prefix}{' '}
              <span className="font-bold text-brand-gradient">
                {content.featured_section.title_highlight}
              </span>
            </h2>
            <p className="text-xl max-w-2xl mx-auto"
              style={{ color: 'var(--color-text-secondary)' }}>
              {content.featured_section.subtitle}
            </p>
          </div>

          <ProductGrid
            productos={featuredProducts}
            loading={loading}
            handleImageError={handleImageError}
          />

          <div className="text-center py-5">
            <Link to="/products" className="btn-brand inline-flex items-center px-8 py-2 rounded-2xl">
              {content.buttons.view_all_products}
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Instagram ─────────────────────────────────────────── */}
      <div className="section-brand-bg">
        <InstagramSection instagram={contentAbout.instagram} />
      </div>

      {/* ── Videos ────────────────────────────────────────────── */}
      <div className="section-alt-bg">
        <ReactionVideosSection
          title={videosContent.title}
          subtitle={videosContent.subtitle}
          videos={videosContent.videos}
        />
      </div>

      {/* ── Custom Works ──────────────────────────────────────── */}
      <div>
        <CustomWorksSection
          title={customWorks.title}
          items={customWorks.items}
        />
      </div>

    </div>
  );
};

export default Home;
