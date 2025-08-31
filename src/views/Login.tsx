import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { sendEmailLink, signInWithGoogle } from '@/auth/auth';

// Util
const isValidEmail = (v: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [sent, setSent] = useState<boolean>(false);
  const [loadingGoogle, setLoadingGoogle] = useState<boolean>(false);
  const [loadingEmail, setLoadingEmail] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0); // seg. para reenviar

  const location = useLocation();
  const navigate = useNavigate();
  const redirect: string =
    new URLSearchParams(location.search).get('redirect') || '/';

  const canSubmitEmail = useMemo(
    () => isValidEmail(email) && !loadingEmail && cooldown === 0,
    [email, loadingEmail, cooldown]
  );

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleGoogle = async (): Promise<void> => {
    try {
      setError(null);
      setLoadingGoogle(true);
      await signInWithGoogle();
      navigate(redirect);
    } catch {
      setError('No pudimos iniciar sesión con Google. Intenta nuevamente.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  const sendLink = async (): Promise<void> => {
    try {
      setError(null);
      setLoadingEmail(true);
      await sendEmailLink(email, redirect);
      setSent(true);
      setCooldown(60); // 60s para reenviar
    } catch {
      setError('No pudimos enviar el enlace. Revisa el correo e intenta otra vez.');
    } finally {
      setLoadingEmail(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!canSubmitEmail) return;
    await sendLink();
  };

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 overflow-hidden">
      {/* Shapes del fondo (como en Home) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-gradient-to-r from-pink-400 to-rose-300 opacity-20 blur-2xl animate-bounce" />
        <div className="absolute bottom-16 right-10 w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-orange-300 opacity-30 blur-xl animate-pulse" />
        <div className="absolute top-1/3 -right-6 w-20 h-20 rounded-full bg-gradient-to-r from-purple-400 to-pink-300 opacity-25 blur-xl animate-bounce" />
      </div>

      {/* MISMO LAYOUT QUE HOME */}
      <div className="relative z-10 pt-28 md:pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Centro el card dentro del contenedor */}
          <section className="grid place-items-center">
            <div className="w-full max-w-xl rounded-3xl bg-white/70 backdrop-blur-xl border border-pink-100 shadow-[0_20px_60px_rgba(244,114,182,0.15)] p-8 md:p-10">
              <header className="text-center mb-8">
                {/* Título estilo hero con highlight en “sesión” */}
                <h1
                  className="text-[clamp(2rem,6.5vw,3.5rem)] leading-[1.1] font-extralight tracking-tight text-slate-900"
                >
                  Iniciar <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">sesión</span>
                </h1>
                <p className="mt-3 text-[clamp(0.95rem,1.6vw,1.25rem)] text-gray-600">
                  Accedé para ver tus pedidos y continuar tu compra
                </p>
              </header>

              {/* Google */}
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loadingGoogle}
                className="group relative w-full inline-flex items-center justify-center gap-3 rounded-2xl px-5 py-4 text-white font-semibold
                bg-gradient-to-r from-pink-500 to-rose-400 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                aria-label="Continuar con Google"
                title="Continuar con Google"
              >
                {/* Icono Google */}
                <span className="h-5 w-5 bg-white rounded-[4px] grid place-items-center">
                  <svg width="14" height="14" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.72 1.23 9.24 3.62l6.9-6.9C35.9 2.02 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l8.9 6.9C13.27 14.54 18.2 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.5 24c0-1.64-.15-3.22-.44-4.74H24v9.05h12.7c-.55 2.98-2.26 5.5-4.85 7.2l7.4 5.73C43.9 37.46 46.5 31.2 46.5 24z" />
                    <path fill="#FBBC05" d="M11.46 28.12A14.5 14.5 0 0 1 10.7 24c0-1.43.24-2.81.68-4.1l-8.9-6.9A23.93 23.93 0 0 0 0 24c0 3.86.9 7.5 2.5 10.75l8.96-6.63z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.14 15.9-5.83l-7.4-5.73c-2.06 1.39-4.7 2.21-8.5 2.21-6.8 0-12.53-4.6-14.54-10.93l-8.96 6.63C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                </span>
                {loadingGoogle ? 'Conectando…' : 'Continuar con Google'}
                {loadingGoogle && (
                  <span className="absolute right-5 h-5 w-5 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                )}
              </button>

              {/* Divider */}
              <div className="my-8 flex items-center gap-4 text-gray-400">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
                <span className="text-sm font-medium">o con tu email</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-pink-200 to-transparent" />
              </div>

              {/* Email */}
              <form onSubmit={handleEmailSubmit} className="space-y-4" noValidate>
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-gray-700">Correo electrónico</span>
                  <div className="relative">
                    <input
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      placeholder="tu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full rounded-2xl border bg-white/80 backdrop-blur-sm px-4 py-3.5 pr-11 outline-none transition
                        ${email.length === 0 ? 'border-pink-100 focus:ring-2 focus:ring-pink-200' :
                          isValidEmail(email) ? 'border-emerald-200 focus:ring-2 focus:ring-emerald-200' :
                            'border-rose-200 focus:ring-2 focus:ring-rose-200'}
                      `}
                      aria-describedby="email-help"
                    />
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12l-4 4-4-4m8-4l-4 4-4-4" />
                    </svg>
                  </div>
                  <small id="email-help" className="mt-1 block text-xs text-gray-500">
                    Te enviaremos un enlace mágico para ingresar.
                  </small>
                </label>

                <button
                  type="submit"
                  disabled={!canSubmitEmail}
                  className="w-full rounded-2xl border border-pink-200 bg-white/70 px-5 py-3.5 font-semibold text-gray-800 shadow-sm
                  hover:shadow transition disabled:opacity-60 disabled:cursor-not-allowed relative"
                >
                  {loadingEmail ? 'Enviando…' : sent ? 'Reenviar enlace' : 'Enviarme un enlace por email'}
                  {loadingEmail && (
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 border-2 border-gray-400/60 border-t-transparent rounded-full animate-spin" />
                  )}
                </button>

                <div className="min-h-[24px]" aria-live="polite">
                  {sent && !loadingEmail && (
                    <p className="text-sm text-gray-600">
                      Te enviamos un enlace a <span className="font-semibold">{email}</span>. Abrilo desde el dispositivo donde querés continuar.
                      {cooldown > 0 && (
                        <> Podrás reenviar en <span className="font-semibold">{cooldown}s</span>.</>
                      )}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700 text-sm" role="alert">
                    {error}
                  </div>
                )}
              </form>

              {/* Footer pequeño */}
              <div className="mt-8 flex items-center justify-center text-xs text-gray-500">
                <Link to="/" className="font-semibold text-pink-600 hover:text-rose-500">Volver al inicio</Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Login;
