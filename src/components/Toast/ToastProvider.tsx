// src/components/common/ToastProvider.tsx
import React from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

const ToastProvider: React.FC = () => {
  return (
    <Toaster 
      position="top-center"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #fff 0%, #fdf2f8 100%)',
          color: '#1f2937',
          padding: '20px 24px',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(236, 72, 153, 0.2), 0 0 0 1px rgba(236, 72, 153, 0.1)',
          fontWeight: '500',
          fontSize: '15px',
          maxWidth: '400px',
        },
        success: {
          duration: 3500,
          iconTheme: {
            primary: '#ec4899',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(135deg, #fff 0%, #fdf2f8 100%)',
            border: '2px solid #fbcfe8',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            background: 'linear-gradient(135deg, #fff 0%, #fef2f2 100%)',
            border: '2px solid #fecaca',
          },
        },
        loading: {
          iconTheme: {
            primary: '#ec4899',
            secondary: '#fff',
          },
        },
      }}
    />
  );
};

// Funciones helper para usar en cualquier componente
export const showToast = {
  success: (message: string) => {
    toast.success(message, {
      icon: '✨',
    });
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  productAdded: (productName: string, variant?: string) => {
    const message = variant 
      ? `${productName} (${variant})`
      : productName;
    
    toast.success(
      () => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">🎂</span>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 mb-0.5">¡Agregado al carrito!</p>
            <p className="text-sm text-gray-600">{message}</p>
          </div>
        </div>
      ),
      {
        duration: 3500,
        style: {
          background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)',
          padding: '16px',
          borderRadius: '16px',
          border: '2px solid #fbcfe8',
          boxShadow: '0 10px 40px rgba(236, 72, 153, 0.25)',
          maxWidth: '450px',
        },
      }
    );
  },
  
  productRemoved: (productName: string) => {
    toast(
      () => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-xl">🗑️</span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{productName}</p>
            <p className="text-sm text-gray-600">Eliminado del carrito</p>
          </div>
        </div>
      ),
      {
        duration: 2500,
        style: {
          background: '#fff',
          padding: '16px',
          borderRadius: '16px',
          border: '2px solid #e5e7eb',
        },
      }
    );
  },
  
  stockWarning: (available: number) => {
    toast(
      `⚠️ Solo quedan ${available} unidades disponibles`,
      {
        icon: '⚠️',
        style: {
          background: 'linear-gradient(135deg, #fff 0%, #fef3c7 100%)',
          border: '2px solid #fde68a',
        },
      }
    );
  },

  custom: (message: string, options?: any) => {
    toast(message, options);
  }
};

export default ToastProvider;