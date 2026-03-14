import React, { useRef, useState } from 'react';
import type { WholesaleProduct, WholesaleTable } from '@/interfaces/WholesaleContent';

interface WholesalePriceTableProps {
    products: WholesaleProduct[];
    table: WholesaleTable;
}

const WholesalePriceTable: React.FC<WholesalePriceTableProps> = ({ products, table }) => {
    const tableRef = useRef<HTMLDivElement>(null);
    //@ts-ignore
    const [downloading, setDownloading] = useState(false);

    return (
        <section className="max-w-5xl mx-auto px-4 py-5">
            <div className="text-center mb-8">
                <h2 className="wholesale-table-title text-3xl md:text-4xl font-light mb-2">
                    {table.title_prefix}{' '}
                    <span className="font-bold text-brand-gradient">
                        {table.title_highlight}
                    </span>
                </h2>
                <p className="wholesale-table-subtitle text-sm mb-6">{table.subtitle}</p>
            </div>

            <div ref={tableRef} className="wholesale-table-wrapper">
                <table className="wholesale-table">
                    <thead>
                        <tr>
                            <th />
                            <th>{table.columns.product}</th>
                            <th>{table.columns.unit_price}</th>
                            <th>{table.columns.pack_min}</th>
                            <th>{table.columns.pack_total}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product, index) => {
                            const packTotal = product.price_per_unit * product.pack_qty;
                            return (
                                <tr key={product.id} className={index % 2 === 0 ? 'wholesale-table-row-even' : 'wholesale-table-row-odd'}>
                                    <td>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            crossOrigin="anonymous"
                                            className="w-12 h-12 object-cover rounded-xl"
                                            style={{ border: '2px solid #ffe4f0' }}
                                        />
                                    </td>
                                    <td>
                                        <span className="wholesale-table-product-name">{product.name}</span>
                                        <span className="wholesale-table-product-desc">{product.description}</span>
                                    </td>
                                    <td className="wholesale-table-price">
                                        ${product.price_per_unit.toLocaleString('es-AR')}
                                    </td>
                                    <td className="wholesale-table-pack">
                                        x {product.pack_qty}
                                    </td>
                                    <td className="wholesale-table-total">
                                        ${packTotal.toLocaleString('es-AR')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

export default WholesalePriceTable;
