// src/components/cart/CartDrawer.tsx
import { useEffect, type ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useCart } from '@/context/CartProvider';

const price = (n: number) => n.toLocaleString('es-AR');

export default function CartDrawer(): ReactElement | null {
    const { isOpen, closeCart, items, updateQty, remove, total } = useCart();
    const isEmpty = items.length === 0;
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) document.body.classList.add('overflow-hidden');
        else        document.body.classList.remove('overflow-hidden');
        return () => document.body.classList.remove('overflow-hidden');
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCart} />

            {/* Panel */}
            <aside className="cart-bg absolute right-0 top-0 h-full w-full max-w-md shadow-2xl sm:rounded-l-3xl flex flex-col">

                {/* Header */}
                <div className="cart-border p-5 border-b flex items-center justify-between">
                    <h2 className="cart-title text-xl font-bold">Carrito</h2>
                    <button
                        onClick={closeCart}
                        className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
                        type="button"
                        aria-label="Cerrar"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Lista */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {isEmpty ? (
                        <p className="cart-empty-text">Tu carrito está vacío.</p>
                    ) : items.map((i) => (
                        <div key={i.productId} className="cart-item-bg flex gap-3 p-3 rounded-xl">
                            <img
                                src={i.product.imagen}
                                alt={i.product.nombre}
                                className="w-16 h-16 rounded-lg object-cover"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src =
                                        'https://via.placeholder.com/64x64/f3f4f6/9ca3af?text=No+img';
                                }}
                            />
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <h3 className="cart-item-name font-semibold">
                                            {i.product.nombre}
                                        </h3>
                                        {i.variantLabel && (
                                            <p className="cart-item-variant text-xs mt-0.5">
                                                📦 {i.variantLabel}
                                            </p>
                                        )}
                                        <p className="cart-item-price font-bold">
                                            ${price(i.precio)}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => remove(i.productId)}
                                        className="w-8 h-8 rounded-full hover:bg-gray-200 flex items-center justify-center transition"
                                        type="button"
                                        aria-label="Quitar"
                                    >
                                        <TrashIcon className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="mt-2 flex items-center gap-2">
                                    <button
                                        onClick={() => updateQty(i.productId, i.quantity - 1)}
                                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition"
                                        type="button"
                                    >
                                        <MinusIcon className="w-4 h-4" />
                                    </button>

                                    <span className="min-w-[2rem] text-center font-semibold">{i.quantity}</span>

                                    <button
                                        onClick={() => updateQty(i.productId, i.quantity + 1)}
                                        className="cart-qty-btn-plus w-8 h-8 rounded-full flex items-center justify-center transition"
                                        type="button"
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                    </button>

                                    <div className="ml-auto font-semibold">
                                        ${(i.precio * i.quantity).toLocaleString('es-AR')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="cart-border p-5 border-t">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-lg font-semibold">Total</span>
                        <span className="text-lg font-bold text-brand-gradient">
                            ${price(total)}
                        </span>
                    </div>
                    <button
                        type="button"
                        disabled={isEmpty}
                        aria-disabled={isEmpty}
                        onClick={() => {
                            if (isEmpty) return;
                            closeCart();
                            navigate('/checkout');
                        }}
                        className={isEmpty ? 'w-full py-4 rounded-btn font-bold bg-gray-200 text-gray-400 cursor-not-allowed' : 'btn-brand w-full py-4'}
                    >
                        Continuar compra
                    </button>
                </div>
            </aside>
        </div>
    );
}
