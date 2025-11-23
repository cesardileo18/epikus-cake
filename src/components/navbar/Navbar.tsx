// src/components/Navbar.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { signOut } from '@/auth/auth';
import CartButton from '@/components/cart/CartButton';
import { useStoreStatus } from "@/context/StoreStatusContext";

type MenuItem = { name: string; to: string; icon?: string };

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, role, loading } = useAuth(); // <- ahora tomamos role también
  const { isStoreOpen, closedMessage } = useStoreStatus();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  const redirect = encodeURIComponent((location.pathname + location.search) || '/');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(v => !v);
  const closeMenu = () => setIsMenuOpen(false);

  const publicItems: MenuItem[] = [
    { name: 'Inicio', to: '/', icon: '🏠' },
    { name: 'Productos', to: '/products', icon: '🍰' },
    { name: 'Sobre Nosotros', to: '/about', icon: '💝' },
    { name: 'Contacto', to: '/contact', icon: '📞' },
  ];

  // Vistas admin, acá
  const adminItems: MenuItem[] =
    role === 'admin'
      ? [
        { name: 'Dashboard', to: '/admin/dashboard', icon: '📊' },
        { name: 'Productos (admin)', to: '/admin/products', icon: '📦' },
        { name: 'Agregar Producto', to: '/admin/products/add', icon: '➕' },
        { name: 'Pedidos', to: '/admin/sells', icon: '🧾' },
        { name: 'Usuarios', to: '/admin/users', icon: '👥' },
        { name: 'Analytics', to: '/admin/analytics', icon: '📈' },
        { name: 'Sales Dashboard', to: '/admin/sales-dashboard', icon: '💰' },
      ]
      : [];

  const accountLabel = user?.displayName ?? user?.email ?? '';
  const initial = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase();

  const isActive = (to: string) => location.pathname === to;

  return (
    <>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-lg shadow-xl border-b border-pink-100' : 'bg-transparent'
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="group">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-15 h-15 flex items-center justify-center ${scrolled ? 'bg-transparent shadow-none ring-0' : 'bg-white/90 ring-1 ring-black/5 shadow-md'} rounded-2xl`}>
                      <img
                        className="w-12 h-12"
                        src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1758828059/epikus600x600px_redesy.png"
                        alt="Logo Epikus Cake"
                      />
                    </div>
                    {/* <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse" /> */}
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
                      Epikus Cake
                    </h1>
                    <p className="text-xs text-gray-600 -mt-1">Pastelería Premium</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center space-x-8">
              {/* Públicas */}
              {publicItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className={`relative group font-medium transition-colors duration-300 ${isActive(item.to) ? 'text-pink-600' : 'text-gray-700 hover:text-pink-600'
                    }`}
                >
                  {item.name}
                  <div
                    className={`absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300 ${isActive(item.to) ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                  />
                </Link>
              ))}

              {/* ADMIN dropdown (solo si role === 'admin') */}
              {adminItems.length > 0 && (
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-2 text-gray-700 hover:text-pink-600 font-medium"
                    aria-haspopup="menu"
                  >
                    Admin
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div
                    className="absolute right-0 mt-2 w-64 translate-y-1 opacity-0 invisible transition
                               group-hover:translate-y-0 group-hover:opacity-100 group-hover:visible z-50"
                  >
                    <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-xl">
                      {adminItems.map((it) => (
                        <Link key={it.to} to={it.to} className="block px-4 py-3 text-sm hover:bg-pink-50">
                          {it.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Carrito Desktop */}
              {!isStoreOpen ? (
                <div
                  title={closedMessage || "Tienda cerrada"}
                  className="flex items-center gap-2 px-4 py-2 rounded-full 
bg-white text-pink-600 font-semibold shadow-[0_2px_8px_rgba(216,30,119,0.25)] 
border border-pink-300 cursor-default hover:shadow-[0_3px_10px_rgba(216,30,119,0.35)] transition-all duration-300"

                >
                  <span className="text-pink-500 text-sm">🕒</span>
                  <span className="text-sm truncate max-w-[120px]" title={closedMessage || "Tienda cerrada"}>
                    {closedMessage && closedMessage.length > 7
                      ? closedMessage.slice(0, 7) + "..."
                      : closedMessage?.includes("mantenimiento")
                        ? closedMessage
                        : "Cerrada"}
                  </span>
                </div>
              ) : (
                <CartButton size="md" />
              )}
              {/* Auth Desktop */}
              {!loading && !user && (
                <Link
                  to={`/login?redirect=${redirect}`}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  Iniciar sesión
                </Link>
              )}

              {!loading && user && (
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-xl border border-pink-100 bg-white/70 px-3 py-2 shadow-sm hover:shadow transition"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold">
                      {(user.displayName ?? user.email ?? 'U').charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block max-w-[180px] truncate text-gray-700" title={user.displayName ?? user.email ?? ''}>
                      {user.displayName ?? user.email ?? ''}
                    </span>
                    <svg className="h-4 w-4 text-pink-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <div
                    className="absolute right-0 mt-2 w-56 translate-y-1 opacity-0 invisible transition z-50
                               group-hover:translate-y-0 group-hover:opacity-100 group-hover:visible"
                  >
                    <div className="overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-xl">
                      <Link to="/profile" className="block px-4 py-3 text-sm hover:bg-pink-50">Mi perfil</Link>
                      <Link to="/my-orders" className="block px-4 py-3 text-sm hover:bg-pink-50">Mis pedidos</Link>
                      <Link to="/favorites" className="block px-4 py-3 text-sm hover:bg-pink-50">Favoritos</Link>
                      <button onClick={signOut} className="block w-full text-left px-4 py-3 text-sm text-rose-600 hover:bg-rose-50" type="button">
                        Salir
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile actions */}
            <div className="flex items-center space-x-3 lg:hidden">
              {!isStoreOpen ? (
                <div
                  title={closedMessage || "Tienda cerrada"}
                  className="flex items-center gap-2 px-4 py-2 rounded-full 
                bg-white text-pink-600 font-semibold shadow-[0_2px_8px_rgba(216,30,119,0.25)] 
                border border-pink-300 cursor-default hover:shadow-[0_3px_10px_rgba(216,30,119,0.35)] transition-all duration-300"
                >
                  <span className="text-pink-500 text-sm">🕒</span>
                  <span className="text-sm truncate max-w-[120px]" title={closedMessage || "Tienda cerrada"}>
                    {closedMessage && closedMessage.length > 25
                      ? closedMessage.slice(0, 25) + "..."
                      : closedMessage?.includes("mantenimiento")
                        ? closedMessage
                        : "Tienda cerrada"}
                  </span>
                </div>
              ) : (
                <CartButton size="sm" />
              )}
              <button
                onClick={toggleMenu}
                className="relative w-10 h-10 rounded-xl bg-white/80 backdrop-blur-sm border border-pink-100 shadow-lg flex flex-col items-center justify-center space-y-1.5 hover:bg-white transition-all duration-300"
                type="button"
                aria-label="Toggle menu"
              >
                <div className={`w-5 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <div className={`w-5 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
                <div className={`w-5 h-0.5 bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 z-50 transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Fondo */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/95 via-rose-400/95 to-pink-600/95 backdrop-blur-lg" onClick={closeMenu} />

        {/* Contenido */}
        <div className={`relative h-full flex flex-col transition-all duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-modal="true">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-white text-4xl font-['Great_Vibes']">Epikus Cake</h2>
                <p className="text-pink-100 text-sm">
                  {/* {!loading && user ? `Hola, ${user.displayName ?? user.email}` : 'Menú Principal'} */}
                  Menú Principal
                </p>
              </div>
            </div>

            <button
              onClick={closeMenu}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
              type="button"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items (scrollable) */}
          <div className="flex-1 flex flex-col justify-start overflow-y-auto px-6 py-4 space-y-2">
            {/* Cuenta (solo si hay sesión) */}
            {!loading && user && (
              <div className="mb-4">
                <button
                  onClick={() => setMobileAccountOpen(o => !o)}
                  className="w-full flex items-center gap-3 rounded-2xl bg-white/10 border border-white/20 p-4 text-white"
                  type="button"
                  aria-expanded={mobileAccountOpen}
                >
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 flex items-center justify-center font-semibold">
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-semibold">{accountLabel}</p>
                    {user.email && <p className="truncate text-xs text-pink-100">{user.email}</p>}
                  </div>
                  <svg className={`h-5 w-5 transition-transform ${mobileAccountOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className={`grid transition-[grid-template-rows] duration-300 ${mobileAccountOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    <Link to="/profile" onClick={closeMenu} className="block mt-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white">Mi perfil</Link>
                    <Link to="/my-orders" onClick={closeMenu} className="block mt-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white">Mis pedidos</Link>
                    <Link to="/favorites" onClick={closeMenu} className="block mt-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white">Favoritos</Link>
                  </div>
                </div>
              </div>
            )}

            {/* Públicas */}
            {publicItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                onClick={closeMenu}
                className="group flex items-center space-x-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <div className="w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300" />
                </div>
                <svg className="w-6 h-6 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}

            {/* ADMIN móvil (solo si role === 'admin') */}
            {adminItems.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setMobileAdminOpen(o => !o)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/10 border border-white/20 text-white"
                  type="button"
                  aria-expanded={mobileAdminOpen}
                >
                  <span className="font-bold">Admin</span>
                  <svg className={`w-5 h-5 transition-transform ${mobileAdminOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>
                <div className={`grid transition-[grid-template-rows] duration-300 ${mobileAdminOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    {adminItems.map((it) => (
                      <Link
                        key={it.to}
                        to={it.to}
                        onClick={closeMenu}
                        className="block mt-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                      >
                        {it.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Auth móvil (NO logueados) */}
            {!loading && !user && (
              <Link
                to={`/login?redirect=${redirect}`}
                onClick={closeMenu}
                className="mt-4 text-center p-4 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
              >
                Iniciar sesión
              </Link>
            )}
          </div>

          {/* Botón Salir fijo abajo (solo logueados) */}
          {!loading && user && (
            <div className="sticky bottom-0 p-6 border-t border-white/20 bg-white/10 backdrop-blur-sm">
              <button
                onClick={() => { closeMenu(); signOut(); }}
                className="w-full text-center p-4 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition"
                type="button"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
