// src/components/layout/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const nav = [
    { label: "Inicio", href: "/", icon: "🏠" },
    { label: "Productos", href: "/products", icon: "🍰" },
    { label: "Sobre Nosotros", href: "/about", icon: "💝" },
    { label: "Contacto", href: "/contact", icon: "📞" },
  ];

  return (
    <footer>
      {/* línea superior con gradiente de marca */}
      {/* <div className="h-[3px] w-full bg-gradient-to-r from-[#D81E77] via-[#FF7BAC] to-[#9B5DE5]" /> */}

      <div className="bg-[#ff7babb4]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 py-10 md:grid-cols-3">
            {/* Marca (logo grande con caja blanca como navbar) */}
            <div className="space-y-3">
              <Link to="/" className="group inline-block">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div
                      className="
                        w-16 h-16 md:w-20 md:h-20
                        flex items-center justify-center
                        bg-white/90 ring-1 ring-black/5 shadow-md
                        rounded-2xl transition
                        group-hover:shadow-lg
                      "
                    >
                      <img
                        className="w-12 h-12 md:w-14 md:h-14"
                        src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1765297906/EpikusNuevoDise%C3%B1o_woi7ij.png"
                        alt="Logo Epikus Cake"
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <span
                    className="
                      font-['Great_Vibes'] leading-none
                      text-3xl md:text-3xl
                      text-gray-800
                    "
                  >
                    Epikus Cake
                  </span>
                </div>
              </Link>

              <p className="text-sm text-[#4E4444]">
                Pastelería artesanal en CABA · Ingredientes premium y pedidos personalizados.
              </p>

              {/* Redes: Instagram */}
              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://www.instagram.com/epikuscake?igsh=MXMxOGl4OWtqZ2h3bA=="
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram de Epikus Cake"
                  className="
                    inline-flex h-10 w-10 items-center justify-center
                    rounded-full text-white shadow
                    bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]
                    hover:shadow-md transition hover:-translate-y-0.5
                    focus:outline-none focus:ring-2 focus:ring-[#FF7BAC]/40
                  "
                >
                  <FaInstagram className="h-7 w-7" />
                </a>
                {/* PedidosYa */}
                <a
                  href="https://www.pedidosya.com.ar/restaurantes/buenos-aires/epikuscake-3a2a8180-a027-4a0d-a981-04efdf2d04c4-menu?origin=shop_list"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Pedí en PedidosYa"
                  className="
                    inline-flex h-10 w-10 items-center justify-center
                    rounded-full shadow overflow-hidden
                    hover:shadow-md transition hover:-translate-y-0.5
                    focus:outline-none focus:ring-2 focus:ring-[#FA0050]/40
                  "
                >
                  <img
                    src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1764536245/icon-384x384_rlwlja.png"
                    alt="PedidosYa"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>

            {/* Navegación */}
            <nav className="md:mx-auto">
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-[#4E4444]">
                Navegación
              </h3>
              <ul className="space-y-2">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="text-sm text-[#4E4444] hover:text-[#D81E77] transition inline-flex items-center gap-1"
                    >
                      <span aria-hidden>{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal / pequeña info */}
            <div className="md:ml-auto">
              <h3 className="mb-3 text-sm font-semibold tracking-wide text-[#4E4444]">
                Información
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/privacidad"
                    className="text-sm text-[#4E4444] hover:text-[#D81E77] transition"
                  >
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terminos"
                    className="text-sm text-[#4E4444] hover:text-[#D81E77] transition"
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li className="text-sm text-[#4E4444]">
                  CABA, Buenos Aires · Argentina
                </li>
              </ul>
            </div>
          </div>

          {/* Línea inferior */}
          <div className="border-t border-white/60 py-4 text-center">
            <p className="text-xs text-[#4E4444]">
              © {year} <span className="font-medium text-[#D81E77]">Epikus Cake</span>. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
