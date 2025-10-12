// src/views/Home.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDaysIcon,
  SparklesIcon,
  ChatBubbleBottomCenterTextIcon,
  PaintBrushIcon,
  ShoppingBagIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import useFeaturedProducts from '@/hooks/useFeaturedProducts';
import FeaturedProducts from '@/components/productos/FeaturedProducts';
import CakeLottie from '@/components/animation/CakeLottie';
import ConfettiBurst from '@/components/animation/ConfettiBurst';

// 👉 contenido estático tipado desde JSON
import contentJson from '@/content/homeContent.json';
import type { HomeTextContent } from '@/interfaces/HomeContent'; // o '@/content/types'
const content: HomeTextContent = contentJson as HomeTextContent;

const Home: React.FC = () => {
  const { products: productosDestacados, loading } = useFeaturedProducts({ onlyActive: true, max: 6 });

  // Mapear íconos a cada feature por título (clave exacta del JSON)
  const iconByTitle: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
    'Hecho a pedido (3 días)': CalendarDaysIcon,
    'Ingredientes premium': SparklesIcon,
    'Atención personalizada': ChatBubbleBottomCenterTextIcon,
    'Diseños personalizados': PaintBrushIcon,
  };

  const features = content.features.map(f => ({
    ...f,
    Icon: iconByTitle[f.title] ?? SparklesIcon,
  }));

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    (e.target as HTMLImageElement).src =
      `https://via.placeholder.com/400x400/f8fafc/64748b?text=${encodeURIComponent(content.image_fallback_text)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-rose-400/5 to-pink-600/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 text-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
                {content.hero.title_prefix}{' '}
                <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                  {content.hero.title_highlight}
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                {content.hero.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                to="/products"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <ShoppingBagIcon className="w-5 h-5 mr-3" />
                {content.buttons.view_products}
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </div>

            {/* Columna animación */}
            <div className="relative">
              <div className="relative">
                <CakeLottie height={360} />
                <div className="absolute inset-0">
                  {/* @ts-ignore */}
                  <ConfettiBurst intervalMs={4000} count={50} shadow={false} />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 max-w-4xl mx-auto">
              {features.map(({ title, Icon, desc }) => (
                <div key={title} className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">{title}</div>
                  <p className="mt-1 text-sm text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-300 rounded-full opacity-20 animate-bounce" />
        <div className="absolute bottom-32 right-16 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full opacity-30 animate-bounce" />
        <div className="absolute top-1/3 right-8 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-300 rounded-full opacity-25 animate-bounce" />
      </section>

      {/* Destacados */}
      <section className="py-10 bg-[#ff7bab48] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 rounded-full font-semibold mb-6">
              <StarSolid className="w-4 h-4 mr-2 text-amber-300" />
              {content.featured_section.badge}
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              {content.featured_section.title_prefix}{' '}
              <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                {content.featured_section.title_highlight}
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {content.featured_section.subtitle}
            </p>
          </div>

          <FeaturedProducts
            productos={productosDestacados}
            loading={loading}
            handleImageError={handleImageError}
          />

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              {content.buttons.view_all_products}
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-300 rounded-full opacity-20 animate-bounce" />
      </section>
    </div>
  );
};

export default Home;
