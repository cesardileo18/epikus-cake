// src/views/Profile.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import {
  EnvelopeIcon,
  CalendarIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  ArrowRightOnRectangleIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { UserCircleIcon as UserCircleSolid } from '@heroicons/react/24/solid';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const getAuthMethod = (): string => {
    if (!user) return 'Desconocido';
    
    const providers = user.providerData;
    if (providers && providers.length > 0) {
      const hasGoogle = providers.some(p => p.providerId === 'google.com');
      if (hasGoogle) return 'Google';
    }
    return 'Email (Link mágico)';
  };

  const authMethod = getAuthMethod();
  const displayName = user?.displayName || 'Usuario';
  const email = user?.email || 'No disponible';
  const photoURL = user?.photoURL;
  const createdAt = (user?.metadata as any)?.creationTime;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
            Debes iniciar sesión
          </h2>
          <Link
            to="/login"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ff7bab48] py-16 sm:py-22 px-3 xs:px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-gray-900 mb-3 sm:mb-4">
            Mi{' '}
            <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">
              Perfil
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Tu información personal
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden mb-6">
          {/* Header con gradiente - altura reducida en móvil */}
          <div className="bg-gradient-to-r from-pink-500 to-rose-400 h-24 sm:h-32 relative">
            <div className="absolute -bottom-12 sm:-bottom-16 left-1/2 transform -translate-x-1/2">
              <div className="bg-white rounded-full p-1.5 sm:p-2 shadow-lg">
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayName}
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-pink-400 to-rose-300 flex items-center justify-center">
                    <UserCircleSolid className="w-20 h-20 sm:w-24 sm:h-24 text-white" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content - padding ajustado */}
          <div className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-4 sm:px-8">
            {/* Nombre */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 break-words px-2">
                {displayName}
              </h2>
            </div>

            {/* Info Grid - 1 columna en móvil pequeño */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {/* Email */}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm flex-shrink-0">
                    <EnvelopeIcon className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                      Email
                    </p>
                    <p className="text-sm sm:text-base font-medium text-gray-900 break-all">
                      {email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fecha de registro */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm flex-shrink-0">
                    <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
                      Miembro desde
                    </p>
                    <p className="text-sm sm:text-base font-medium text-gray-900">
                      {formatDate(createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Método de autenticación */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 sm:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl shadow-sm flex-shrink-0">
                    <ShieldCheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2">
                      Método de inicio de sesión
                    </p>
                    <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full text-xs sm:text-sm font-medium text-gray-700 shadow-sm">
                      {authMethod === 'Google' ? (
                        <>
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                          </svg>
                          Google
                        </>
                      ) : (
                        <>
                          <EnvelopeIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600 flex-shrink-0" />
                          Email (Link mágico)
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción - stack en móvil */}
            <div className="border-t border-gray-200 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Link
                  to="/my-orders"
                  className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-pink-500 to-rose-400 text-white text-sm sm:text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  <ClipboardDocumentListIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ver Mis Pedidos
                </Link>

                <Link
                  to="/products"
                  className="flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-white border-2 border-pink-500 text-pink-500 text-sm sm:text-base font-semibold rounded-xl hover:bg-pink-50 transition-all duration-300"
                >
                  <ShoppingBagIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  Ir a Comprar
                </Link>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-gray-100 text-gray-700 text-sm sm:text-base font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Info adicional */}
        <div className="text-center text-xs sm:text-sm text-gray-500 px-4">
          <p>
            ¿Necesitas ayuda?{' '}
            <Link to="/contact" className="text-pink-500 hover:text-pink-600 font-semibold">
              Contáctanos
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;