import React from 'react';
import type { WholesaleProduct, WholesaleCategory } from '@/interfaces/WholesaleContent';

interface WholesaleProductCardProps {
    product: WholesaleProduct;
    category: WholesaleCategory;
    imageFallbackText: string;
}

const tagStyles: Record<string, string> = {
    rose: 'bg-gradient-to-r from-pink-500 to-rose-400 text-white',
    gold: 'bg-gradient-to-r from-yellow-400 to-amber-400 text-white',
};

const WholesaleProductCard: React.FC<WholesaleProductCardProps> = ({
    product,
    category,
    imageFallbackText,
}) => {
    const packTotal = product.price_per_unit * product.pack_qty;

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
        (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x400/ffe4f0/f43f6e?text=${encodeURIComponent(imageFallbackText)}`;
    };

    return (
        <div className="group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1" style={{ background: 'var(--color-bg-card)' }}>
            {/* Tag */}
            <span className={`absolute top-3 left-3 z-10 text-xs font-semibold px-3 py-1 rounded-full ${tagStyles[category.tag_variant]}`}>
                {category.label}
            </span>

            {/* Imagen */}
            <div className="relative w-full h-56 overflow-hidden" style={{ background: 'var(--color-bg-section-alt)' }}>
                <img
                    src={product.image}
                    alt={product.name}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 flex flex-col justify-between min-h-[210px]" style={{ background: 'var(--color-bg-card-inner)' }}>
                <h3 className="font-bold text-base sm:text-lg mb-1 font-serif" style={{ color: 'var(--color-text-primary)' }}>
                    {product.name}
                </h3>
                <p className="text-sm leading-relaxed mb-4">
                    {product.description}
                </p>

                {/* Footer */}
                <div className="flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">
                            Precio unitario
                        </span>
                        <span className="text-2xl font-bold leading-none" style={{ color: 'var(--color-brand)' }}>
                            <sup className="text-sm align-super">$</sup>
                            {product.price_per_unit.toLocaleString('es-AR')}
                        </span>
                    </div>

                    <div className="flex flex-col items-center rounded-xl px-3 py-2 text-center" style={{ background: 'var(--color-bg-section-alt)', color: 'var(--color-brand)' }}>
                        <span className="text-sm font-bold leading-none">
                            Pack x{product.pack_qty}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-0.5">mínimo</span>
                        <span className="text-[11px] font-semibold text-gray-500 mt-1 border-t border-pink-100 pt-1 w-full text-center">
                            = ${packTotal.toLocaleString('es-AR')}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WholesaleProductCard;