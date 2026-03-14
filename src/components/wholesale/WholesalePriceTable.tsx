import React, { useRef, useState } from 'react';
import type { WholesaleProduct, WholesaleTable } from '@/interfaces/WholesaleContent';

// import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

interface WholesalePriceTableProps {
    products: WholesaleProduct[];
    table: WholesaleTable;
}

const WholesalePriceTable: React.FC<WholesalePriceTableProps> = ({ products, table }) => {
    const tableRef = useRef<HTMLDivElement>(null);
    //@ts-ignore
    const [downloading, setDownloading] = useState(false);
    //@ts-ignore
    const handleDownloadPNG = async (): Promise<void> => {
        if (!tableRef.current) return;
        setDownloading(true);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const { jsPDF } = await import('jspdf');

            const canvas = await html2canvas(tableRef.current, { useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = pageWidth - 20;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
            pdf.save('epikus-cake-lista-precios.pdf');
        } catch (e) {
            console.error('Error generando PDF:', e);
        } finally {
            setDownloading(false);
        }
    };

   return (
    <section className="max-w-5xl mx-auto px-4 py-5">
        <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-light mb-2" style={{ color: 'var(--color-text-primary)' }}>
                {table.title_prefix}{' '}
                <span className="font-bold text-brand-gradient">
                    {table.title_highlight}
                </span>
            </h2>
            <p className="text-sm mb-6">{table.subtitle}</p>
{/* 
            <button
                onClick={handleDownloadPNG}
                disabled={downloading}
                type="button"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-400 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {downloading ? 'Generando...' : 'Descargar lista de precios'}
            </button> */}
        </div>

        <div ref={tableRef} style={{ borderRadius: '16px', overflow: 'auto', boxShadow: 'var(--shadow-card)', background: 'var(--color-bg-card)' }}>
            <table style={{ width: '100%', minWidth: '560px', background: 'var(--color-bg-card)', fontSize: '14px', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: 'var(--color-brand)', color: '#ffffff' }}>
                        <th style={{ padding: '14px 16px', width: '64px' }} />
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#ffffff' }}>
                            {table.columns.product}
                        </th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#ffffff' }}>
                            {table.columns.unit_price}
                        </th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#ffffff' }}>
                            {table.columns.pack_min}
                        </th>
                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, color: '#ffffff' }}>
                            {table.columns.pack_total}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product, index) => {
                        const packTotal = product.price_per_unit * product.pack_qty;
                        return (
                            <tr key={product.id} style={{ background: index % 2 === 0 ? 'var(--color-bg-card)' : 'var(--color-bg-section-alt)', borderBottom: '1px solid var(--color-border)' }}>
                                <td style={{ padding: '10px 16px' }}>
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        crossOrigin="anonymous"
                                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #ffe4f0' }}
                                    />
                                </td>
                                <td style={{ padding: '10px 16px' }}>
                                    <span style={{ fontWeight: 700, color: '#1a0a10', fontSize: '14px' }}>{product.name}</span>
                                    <span style={{ display: 'block', fontSize: '12px', color: '#9a7a8a', marginTop: '2px' }}>{product.description}</span>
                                </td>
                                <td style={{ padding: '10px 16px', fontWeight: 800, color: '#e11d5a', fontSize: '16px' }}>
                                    ${product.price_per_unit.toLocaleString('es-AR')}
                                </td>
                                <td style={{ padding: '10px 16px', fontWeight: 600, color: '#1a0a10' }}>
                                    x {product.pack_qty}
                                </td>
                                <td style={{ padding: '10px 16px', color: '#9a7a8a', fontSize: '13px' }}>
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