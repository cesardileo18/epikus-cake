// src/components/layout/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram } from "react-icons/fa";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  const nav = [
    { label: "Inicio",         href: "/",        icon: "🏠" },
    { label: "Productos",      href: "/products", icon: "🍰" },
    { label: "Sobre Nosotros", href: "/about",    icon: "💝" },
    { label: "Contacto",       href: "/contact",  icon: "📞" },
  ];

  return (
    <footer>
      <div className="footer-wrapper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 py-10 md:grid-cols-3">

            {/* Marca */}
            <div className="space-y-3">
              <Link to="/" className="group inline-block">
                <div className="flex items-center gap-4">
                  <div className="footer-logo-wrap w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white/90 ring-1 ring-black/5 shadow-md rounded-2xl transition group-hover:shadow-lg">
                    <img
                      className="w-12 h-12 md:w-14 md:h-14"
                      src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1765297906/EpikusNuevoDise%C3%B1o_woi7ij.png"
                      alt="Logo Epikus Cake"
                      loading="lazy"
                    />
                  </div>
                  <span className="footer-brand-text leading-none text-3xl">
                    Epikus Cake
                  </span>
                </div>
              </Link>

              <p className="footer-text text-sm">
                Pastelería artesanal en CABA · Ingredientes premium y pedidos personalizados.
              </p>

              <div className="flex items-center gap-3 pt-1">
                <a
                  href="https://www.instagram.com/epikuscake?igsh=MXMxOGl4OWtqZ2h3bA=="
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram de Epikus Cake"
                  className="footer-instagram-btn inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow hover:shadow-md transition hover:-translate-y-0.5 focus:outline-none focus:ring-2"
                >
                  <FaInstagram className="h-7 w-7" />
                </a>

                <a
                  href="https://www.pedidosya.com.ar/restaurantes/buenos-aires/epikuscake-3a2a8180-a027-4a0d-a981-04efdf2d04c4-menu?origin=shop_list"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Pedí en PedidosYa"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full shadow overflow-hidden hover:shadow-md transition hover:-translate-y-0.5 focus:outline-none"
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
              <h3 className="footer-text mb-3 text-sm font-semibold tracking-wide">
                Navegación
              </h3>
              <ul className="space-y-2">
                {nav.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      className="footer-link text-sm inline-flex items-center gap-1"
                    >
                      <span aria-hidden>{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal */}
            <div className="md:ml-auto">
              <h3 className="footer-text mb-3 text-sm font-semibold tracking-wide">
                Información
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacidad" className="footer-link text-sm transition">
                    Política de Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/terminos" className="footer-link text-sm transition">
                    Términos y Condiciones
                  </Link>
                </li>
                <li className="footer-text text-sm">
                  CABA, Buenos Aires · Argentina
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="footer-divider border-t py-4 text-center">
            <p className="footer-text text-xs">
              © {year}{' '}
              <span className="footer-brand-name font-medium">Epikus Cake</span>.
              {' '}Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
