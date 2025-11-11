// src/components/home/HeroCarousel.tsx
import { useEffect, useRef } from "react";
import Swiper from "swiper/bundle";
import "swiper/swiper-bundle.css";
const slides: string[] = [
  "https://res.cloudinary.com/dyf6dtb9y/image/upload/c_fill,g_auto,f_auto,q_90,dpr_2.0,w_1800,h_800/v1762720220/galletas_k7itai.jpg",
  "https://res.cloudinary.com/dyf6dtb9y/image/upload/c_fill,g_auto,f_auto,q_90,dpr_2.0,w_1800,h_800/v1762725167/parchita_l057q2.jpg",
  "https://res.cloudinary.com/dyf6dtb9y/image/upload/c_fill,g_auto,f_auto,q_90,dpr_2.0,w_1800,h_800/v1762725167/zanahoria_pwh0zp.jpg",
];


export default function HeroCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<Swiper | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    swiperRef.current = new Swiper(containerRef.current, {
      slidesPerView: 1,
      loop: true,
      effect: "fade",
      autoplay: { delay: 4000, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    });

    return () => {
      swiperRef.current?.destroy(true, true);
      swiperRef.current = null;
    };
  }, []);

  return (
    <section className="relative w-full h-[55vh] sm:h-[60vh] md:h-[70vh] lg:h-[80vh] min-h-[320px] max-h-[85vh] overflow-hidden">
      <div className="swiper w-full h-full" ref={containerRef}>
        <div className="swiper-wrapper">
          {slides.map((src, i) => (
            <div className="swiper-slide relative w-full h-full" key={i}>
              <img
                src={src}
                alt={`Torta ${i + 1}`}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

              {/* texto centrado en mobile / al fondo en desktop */}
              <div className="absolute inset-0 flex flex-col items-center justify-center md:justify-end pb-8 md:pb-12 px-4 md:px-6 text-center text-white">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold drop-shadow-lg">
                  Hechas con amor y los mejores ingredientes.
                </h1>
                <p className="mt-2 text-white/90 font-bold text-xs sm:text-sm md:text-base">
                  Hechas a pedido en CABA · Ingredientes reales ·
                </p>
                <a
                  href="/products"
                  className="mt-4 md:mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-5 py-2.5 md:px-6 md:py-3 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Ver Productos →
                </a>
              </div>
            </div>
          ))}
        </div>
        {/* Paginación dentro del área visible */}
        <div className="swiper-pagination !bottom-3 md:!bottom-6"></div>
        {/* Flechas (opcional) dentro del viewport */}
        {/* <div className="swiper-button-prev !left-3 md:!left-4 !top-1/2 !-translate-y-1/2 !text-white"></div>
    <div className="swiper-button-next !right-3 md:!right-4 !top-1/2 !-translate-y-1/2 !text-white"></div> */}
      </div>
    </section>
  );
}
