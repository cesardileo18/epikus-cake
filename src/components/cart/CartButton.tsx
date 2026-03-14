// src/components/cart/CartButton.tsx
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const { count } = useCart();
  const s = sizes[size];

  return (
    <button
      onClick={() => navigate('/checkout')}
      type="button"
      className={['cart-btn relative rounded-2xl text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300', s.btn, className].join(' ')}
      aria-label="Ir al carrito"
    >
      <ShoppingBagIcon className={s.icon} />
      <span
        className={['cart-badge absolute font-bold rounded-full flex items-center justify-center animate-pulse', s.badge].join(' ')}
      >
        {count}
      </span>
    </button>
  );
}
