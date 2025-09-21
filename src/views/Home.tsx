import React, { useState } from 'react';
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
import FloatingWhatsApp from '@/components/FloatingWhatsApp';
import FeaturedProducts from '@/components/FeaturedProducts';

const Home: React.FC = () => {
  const [favoritos, setFavoritos] = useState<Set<string>>(new Set());

  // ⬇️ destacados en tiempo real (máx 6)
  const { products: productosDestacados, loading } = useFeaturedProducts({ onlyActive: true, max: 6 });

  const features = [
    { title: 'Hecho a pedido (3 días)', icon: CalendarDaysIcon, desc: 'Cada torta se prepara especialmente para vos. Tomamos pedidos con 3 días de anticipación.' },
    { title: 'Ingredientes premium', icon: SparklesIcon, desc: 'Materias primas reales y de primera calidad.' },
    { title: 'Atención personalizada', icon: ChatBubbleBottomCenterTextIcon, desc: 'Asesoría 1:1 por WhatsApp en cada paso.' },
    { title: 'Diseños personalizados', icon: PaintBrushIcon, desc: 'Llevamos tu idea a un diseño único.' },
  ];

  const toggleFavorito = (productId: string): void => {
    setFavoritos((prev) => {
      const n = new Set(prev);
      n.has(productId) ? n.delete(productId) : n.add(productId);
      return n;
    });
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
    (e.target as HTMLImageElement).src =
      'https://via.placeholder.com/400x400/f8fafc/64748b?text=Imagen+no+disponible';
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
                Sabores que{' '}
                <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                  Enamoran
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Creamos momentos dulces únicos con ingredientes premium y amor artesanal en cada preparación
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
              <Link
                to="/products"
                className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                <ShoppingBagIcon className="w-5 h-5 mr-3" />
                Ver Productos
                <ChevronRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>

              <a
                href="https://wa.me/YOUR_PHONE_NUMBER"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm border border-pink-200 text-gray-700 font-bold rounded-2xl shadow-lg hover:shadow-xl hover:bg-white transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.712.306 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
                </svg>
                Consultar por WhatsApp
              </a>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 max-w-4xl mx-auto">
              {features.map(({ title, icon: Icon, desc }) => (
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
        <div className="absolute bottom-32 right-16 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-300 rounded-full opacity-30 animate-pulse" />
        <div className="absolute top-1/3 right-8 w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-300 rounded-full opacity-25 animate-bounce" />
      </section>

      {/* Destacados */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-100 to-rose-100 text-pink-800 rounded-full font-semibold mb-6">
              <StarSolid className="w-4 h-4 mr-2" />
              Productos Destacados
            </div>
            <h2 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              Nuestras <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">Especialidades</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Cada creación es única, elaborada con ingredientes premium y el amor que caracteriza nuestra pastelería
            </p>
          </div>

          <FeaturedProducts
            productos={productosDestacados}
            favoritos={favoritos}
            loading={loading}
            toggleFavorito={toggleFavorito}
            handleImageError={handleImageError}
          />
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              Ver Todos los Productos
              <ChevronRightIcon className="w-5 h-5 ml-2" />
            </Link>
          </div>
        </div>
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-pink-400 to-rose-300 rounded-full opacity-20 animate-bounce" />
        <div className="absolute top-1/4 right-20 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-300  rounded-full opacity-30 animate-bounce" />
        <div className="absolute bottom-1/3 right-10 w-15 h-15 bg-gradient-to-r from-green-300 to-teal-400 rounded-full opacity-25 animate-bounce" />
      </section>

      {/* CTA final */}
      <section className="py-20 bg-gradient-to-r from-pink-500 to-rose-400">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">¿Listo para endulzar tu día?</h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Contáctanos ahora y hagamos realidad ese dulce momento que estás buscando
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://wa.me/YOUR_PHONE_NUMBER"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-white text-pink-600 font-bold rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-3 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.712.306 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
              </svg>
              Escribir por WhatsApp
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center px-8 py-4 border-2 border-white text-white font-bold rounded-2xl hover:bg-white hover:text-pink-600 transition-all duration-300"
            >
              Ver Información de Contacto
            </Link>
          </div>
        </div>
      </section>
      <FloatingWhatsApp />
    </div>
  );
};

export default Home;
