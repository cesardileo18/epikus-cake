// src/components/navbar/Navbar.tsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import { signOut } from '@/auth/auth';
import CartButton from '@/components/cart/CartButton';
import { useStoreStatus } from "@/context/StoreStatusContext";
import { useTheme } from '@/context/ThemeContext';

type MenuItem = { name: string; to: string; icon?: string };

const ChevronIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
  </svg>
);

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, role, loading } = useAuth();
  const { isStoreOpen, closedMessage } = useStoreStatus();
  const { isDark, toggleTheme } = useTheme();

  const [isMenuOpen, setIsMenuOpen]           = useState(false);
  const [scrolled, setScrolled]               = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [mobileAdminOpen, setMobileAdminOpen] = useState(false);

  const redirect = encodeURIComponent((location.pathname + location.search) || '/');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(v => !v);
  const closeMenu  = () => setIsMenuOpen(false);

  const publicItems: MenuItem[] = [
    { name: 'Inicio',          to: '/',         icon: '🏠' },
    { name: 'Productos',       to: '/products', icon: '🍰' },
    { name: 'Sobre Nosotros',  to: '/about',    icon: '💝' },
    { name: 'Contacto',        to: '/contact',  icon: '📞' },
    ...(!user ? [{ name: 'Mayoristas', to: '/wholesale', icon: '🏢' }] : []),
  ];

  const adminItems: MenuItem[] = role === 'admin' ? [
    { name: 'Tablero Global',     to: '/admin/dashboard',       icon: '📊' },
    { name: 'Editar Productos',   to: '/admin/products',        icon: '📦' },
    { name: 'Agregar Producto',   to: '/admin/products/add',    icon: '➕' },
    { name: 'Pedidos',            to: '/admin/sells',           icon: '🧾' },
    { name: 'Usuarios',           to: '/admin/users',           icon: '👥' },
    { name: 'Visitas a la página',to: '/admin/analytics',       icon: '📈' },
    { name: 'Tablero Ventas',     to: '/admin/sales-dashboard', icon: '💰' },
    { name: 'Calendario',         to: '/admin/sells/calendar',  icon: '📅' },
  ] : [];

  const accountLabel = user?.displayName ?? user?.email ?? '';
  const initial      = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase();
  const isActive     = (to: string) => location.pathname === to;

  return (
    <>
      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 transition-all duration-300"
        style={scrolled ? {
          background: 'var(--color-navbar-scrolled-bg)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-navbar-scrolled-border)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">

            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="group">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-15 h-15 flex items-center justify-center rounded-2xl"
                    style={scrolled ? undefined : {
                      background: 'var(--color-bg-card)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    }}
                  >
                    <img
                      className="w-12 h-12"
                      src="https://res.cloudinary.com/dyf6dtb9y/image/upload/v1765297906/EpikusNuevoDise%C3%B1o_woi7ij.png"
                      alt="Logo Epikus Cake"
                    />
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-brand-gradient">
                      Epikus Cake
                    </h1>
                    <p className="text-xs -mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                      Pastelería Premium
                    </p>
                  </div>
                </div>
              </Link>
            </div>

            {/* ── Desktop Menu ─────────────────────────────────── */}
            <div className="hidden lg:flex items-center space-x-8">

              {/* Links públicos */}
              {publicItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.to}
                  className="relative group font-medium transition-colors duration-300"
                  style={{ color: isActive(item.to) ? 'var(--color-brand)' : 'var(--color-text-primary)' }}
                >
                  {item.name}
                  <div
                    className="absolute -bottom-1 left-0 h-0.5 transition-all duration-300"
                    style={{
                      background: 'var(--gradient-brand)',
                      width: isActive(item.to) ? '100%' : '0',
                    }}
                  />
                </Link>
              ))}

              {/* Dropdown Admin */}
              {adminItems.length > 0 && (
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-2 font-medium transition-colors duration-300"
                    style={{ color: 'var(--color-text-primary)' }}
                    aria-haspopup="menu"
                  >
                    Admin
                    <ChevronIcon />
                  </button>
                  <div className="absolute right-0 mt-2 w-64 translate-y-1 opacity-0 invisible transition group-hover:translate-y-0 group-hover:opacity-100 group-hover:visible z-50">
                    <div className="nav-dropdown">
                      {adminItems.map((it) => (
                        <Link key={it.to} to={it.to} className="nav-dropdown-item">
                          {it.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Toggle dark mode */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: isDark ? 'rgba(255,107,168,0.15)' : 'rgba(232,50,124,0.08)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-brand)',
                }}
              >
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06L6.166 6.166z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Carrito o badge cerrado */}
              {!isStoreOpen ? (
                <div
                  title={closedMessage || 'Tienda cerrada'}
                  className="flex items-center gap-2 px-4 py-2 rounded-full cursor-default transition-all duration-300"
                  style={{
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-brand)',
                    border: '1px solid var(--color-brand-light)',
                    boxShadow: 'var(--shadow-brand)',
                    fontWeight: 600,
                  }}
                >
                  <span className="text-sm">🕒</span>
                  <span className="text-sm truncate max-w-[120px]">
                    {closedMessage && closedMessage.length > 7
                      ? closedMessage.slice(0, 7) + '...'
                      : closedMessage?.includes('mantenimiento')
                        ? closedMessage
                        : 'Cerrada'}
                  </span>
                </div>
              ) : (
                <CartButton size="md" />
              )}

              {/* Auth — no logueado */}
              {!loading && !user && (
                <Link to={`/login?redirect=${redirect}`} className="btn-brand px-4 py-2">
                  Iniciar sesión
                </Link>
              )}

              {/* Auth — logueado */}
              {!loading && user && (
                <div className="relative group">
                  <button
                    type="button"
                    className="flex items-center gap-3 rounded-xl px-3 py-2 shadow-sm hover:shadow transition"
                    style={{
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-bg-card)',
                    }}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white font-semibold"
                      style={{ background: 'var(--gradient-brand)' }}
                    >
                      {initial}
                    </div>
                    <span
                      className="hidden md:block max-w-[180px] truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                      title={accountLabel}
                    >
                      {accountLabel}
                    </span>
                    <span style={{ color: 'var(--color-brand)' }}>
                      <ChevronIcon />
                    </span>
                  </button>

                  <div className="absolute right-0 mt-2 w-56 translate-y-1 opacity-0 invisible transition z-50 group-hover:translate-y-0 group-hover:opacity-100 group-hover:visible">
                    <div className="nav-dropdown">
                      <Link to="/profile"    className="nav-dropdown-item">Mi perfil</Link>
                      <Link to="/my-orders"  className="nav-dropdown-item">Mis pedidos</Link>
                      <Link to="/favorites"  className="nav-dropdown-item">Favoritos</Link>
                      <Link to="/my-reviews" className="nav-dropdown-item">Mis opiniones</Link>
                      <Link to="/wholesale"  className="nav-dropdown-item">Mayoristas</Link>
                      <button
                        onClick={signOut}
                        className="nav-dropdown-item w-full text-left"
                        style={{ color: 'var(--color-brand)' }}
                        type="button"
                      >
                        Salir
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Mobile actions ───────────────────────────────── */}
            <div className="flex items-center space-x-3 lg:hidden">
              {/* Toggle dark mode mobile */}
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? 'Modo claro' : 'Modo oscuro'}
                aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
                className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300"
                style={{
                  background: isDark ? 'rgba(255,107,168,0.15)' : 'rgba(255,255,255,0.8)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-brand)',
                }}
              >
                {isDark ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.166 17.834a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06l-1.59-1.591zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.166 6.166a.75.75 0 00-1.06 1.06l1.59 1.591a.75.75 0 001.061-1.06L6.166 6.166z" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {!isStoreOpen ? (
                <div
                  title={closedMessage || 'Tienda cerrada'}
                  className="flex items-center gap-2 px-4 py-2 rounded-full cursor-default transition-all duration-300"
                  style={{
                    background: 'var(--color-bg-card)',
                    color: 'var(--color-brand)',
                    border: '1px solid var(--color-brand-light)',
                    boxShadow: 'var(--shadow-brand)',
                    fontWeight: 600,
                  }}
                >
                  <span className="text-sm">🕒</span>
                  <span className="text-sm truncate max-w-[120px]">
                    {closedMessage && closedMessage.length > 25
                      ? closedMessage.slice(0, 25) + '...'
                      : closedMessage?.includes('mantenimiento')
                        ? closedMessage
                        : 'Tienda cerrada'}
                  </span>
                </div>
              ) : (
                <CartButton size="sm" />
              )}

              {/* Hamburguesa */}
              <button
                onClick={toggleMenu}
                className="relative w-10 h-10 rounded-xl flex flex-col items-center justify-center space-y-1.5 transition-all duration-300"
                style={{
                  background: 'var(--color-bg-card)',
                  backdropFilter: 'blur(4px)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                }}
                type="button"
                aria-label="Toggle menu"
              >
                {[
                  isMenuOpen ? 'rotate-45 translate-y-2' : '',
                  isMenuOpen ? 'opacity-0' : 'opacity-100',
                  isMenuOpen ? '-rotate-45 -translate-y-2' : '',
                ].map((cls, i) => (
                  <div
                    key={i}
                    className={`w-5 h-0.5 transition-all duration-300 ${cls}`}
                    style={{ background: 'var(--gradient-brand)' }}
                  />
                ))}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        {/* Fondo */}
        <div
          className="absolute inset-0 backdrop-blur-lg"
          style={{ background: 'var(--color-mobile-menu-bg, linear-gradient(135deg, rgba(232,50,124,0.96) 0%, rgba(255,123,172,0.94) 50%, rgba(196,24,94,0.96) 100%))' }}
          onClick={closeMenu}
        />

        {/* Panel */}
        <div
          className={`relative h-full flex flex-col transition-all duration-500 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header mobile */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <h2 className="text-white text-4xl font-['Great_Vibes']">Epikus Cake</h2>
            <p className="text-white/70 text-sm">Menú Principal</p>
            <button
              onClick={closeMenu}
              className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300"
              type="button"
              aria-label="Cerrar menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 flex flex-col justify-start overflow-y-auto px-6 py-4 space-y-2">

            {/* Cuenta (logueado) */}
            {!loading && user && (
              <div className="mb-4">
                <button
                  onClick={() => setMobileAccountOpen(o => !o)}
                  className="w-full flex items-center gap-3 rounded-2xl bg-white/10 border border-white/20 p-4 text-white"
                  type="button"
                  aria-expanded={mobileAccountOpen}
                >
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center font-semibold text-white"
                    style={{ background: 'var(--gradient-brand)' }}
                  >
                    {initial}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate font-semibold">{accountLabel}</p>
                    {user.email && <p className="truncate text-xs text-white/70">{user.email}</p>}
                  </div>
                  <svg className={`h-5 w-5 transition-transform ${mobileAccountOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className={`grid transition-[grid-template-rows] duration-300 ${mobileAccountOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                  <div className="overflow-hidden">
                    {[
                      { to: '/profile',    label: 'Mi perfil' },
                      { to: '/my-orders',  label: 'Mis pedidos' },
                      { to: '/favorites',  label: 'Favoritos' },
                      { to: '/my-reviews', label: 'Mis opiniones' },
                      { to: '/wholesale',  label: 'Mayoristas' },
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeMenu}
                        className="block mt-2 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Links públicos */}
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

            {/* Admin móvil */}
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

            {/* Auth móvil — no logueado */}
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

          {/* Salir (fijo abajo, logueado) */}
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
