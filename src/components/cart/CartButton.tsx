// src/components/cart/CartButton.tsx
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom'; // 🔥 NUEVO
import { useCart } from '@/context/CartProvider';

type Props = {
  className?: string;
  size?: 'sm' | 'md';
};

const sizes = {
  sm: { btn: 'p-2', icon: 'w-5 h-5', badge: 'w-4 h-4 text-xs -top-1 -right-1' },
  md: { btn: 'p-3', icon: 'w-6 h-6', badge: 'w-5 h-5 text-sm -top-2 -right-2' },
};

export default function CartButton({ className = '', size = 'md' }: Props) {
  const navigate = useNavigate(); // 🔥 NUEVO
  const { count } = useCart(); // 🔥 REMOVIDO: openCart
  const s = sizes[size];

  return (
    <button
      onClick={() => navigate('/checkout')} // 🔥 CAMBIADO: ahora navega directamente
      type="button"
      className={[
        'relative rounded-2xl bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-lg',
        'hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300',
        s.btn,
        className,
      ].join(' ')}
      aria-label="Ir al carrito"
    >
      <ShoppingBagIcon className={s.icon} />
      <span
        className={[
          'absolute bg-yellow-400 text-black font-bold rounded-full flex items-center justify-center animate-pulse',
          s.badge,
        ].join(' ')}
      >
        {count}
      </span>
    </button>
  );
}