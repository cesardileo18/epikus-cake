import React from 'react';
import { Link } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import { Home, Mail, ScrollText, ShoppingBag, Store, Users } from 'lucide-react';
import { useStoreSettings } from '@/hooks/useStoreSettings';
import { DEFAULT_STORE_SETTINGS } from '@/services/settings.service';

const nav = [
  { label: 'Inicio', href: '/', icon: Home },
  { label: 'Productos', href: '/products', icon: ShoppingBag },
  { label: 'Sobre Nosotros', href: '/about', icon: Users },
  { label: 'Contacto', href: '/contact', icon: Mail },
];

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const { settings } = useStoreSettings();
  const currentSettings = settings || DEFAULT_STORE_SETTINGS;

  return (
    <footer>
      <div className="footer-wrapper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 py-10 md:grid-cols-3">
            <div className="space-y-3">
              <Link to="/" className="group inline-block">
                <div className="flex items-center gap-4">
                  <div className="footer-logo-wrap flex h-16 w-16 items-center justify-center rounded-2xl bg-white/90 shadow-md ring-1 ring-black/5 transition group-hover:shadow-lg md:h-20 md:w-20">
                    <img
                      className="h-12 w-12 md:h-14 md:w-14"
                      src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1765297906/EpikusNuevoDise%C3%B1o_woi7ij.png"
                      alt={`Logo ${currentSettings.storeName}`}
                      loading="lazy"
                    />
                  </div>
                  <span className="footer-brand-text text-3xl leading-none">
                    {currentSettings.storeName}
                  </span>
                </div>
              </Link>

              <p className="footer-text text-sm">
                Pasteleria artesanal en CABA. Ingredientes premium y pedidos personalizados.
              </p>

              <div className="flex items-center gap-3 pt-1">
                {currentSettings.instagramUrl && (
                  <a
                    href={currentSettings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Instagram de ${currentSettings.storeName}`}
                    className="footer-instagram-btn inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2"
                  >
                    <FaInstagram className="h-7 w-7" />
                  </a>
                )}

                {currentSettings.pedidosYaUrl && (
                  <a
                    href={currentSettings.pedidosYaUrl}
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Pedir en PedidosYa"
                    className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none"
                  >
                    <img
                      src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1764536245/icon-384x384_rlwlja.png"
                      alt="PedidosYa"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </a>
                )}
              </div>
            </div>

            <nav className="md:mx-auto">
              <h3 className="footer-text mb-3 text-sm font-semibold tracking-wide">
                Navegacion
              </h3>
              <ul className="space-y-2">
                {nav.map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link to={href} className="footer-link inline-flex items-center gap-2 text-sm">
                      <Icon size={15} aria-hidden />
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="md:ml-auto">
              <h3 className="footer-text mb-3 text-sm font-semibold tracking-wide">
                Informacion
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacidad" className="footer-link inline-flex items-center gap-2 text-sm transition">
                    <ScrollText size={15} aria-hidden />
                    Politica de Privacidad
                  </Link>
                </li>
                <li>
                  <Link to="/terminos" className="footer-link inline-flex items-center gap-2 text-sm transition">
                    <ScrollText size={15} aria-hidden />
                    Terminos y Condiciones
                  </Link>
                </li>
                {currentSettings.address && (
                  <li className="footer-text inline-flex items-start gap-2 text-sm">
                    <Store size={15} className="mt-0.5 shrink-0" aria-hidden />
                    {currentSettings.address}
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="footer-divider border-t py-4 text-center">
            <p className="footer-text text-xs">
              &copy; {year} <span className="footer-brand-name font-medium">{currentSettings.storeName}</span>.
              {' '}Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
