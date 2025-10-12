import React, { useState } from 'react';
import { Payment } from '@mercadopago/sdk-react';

interface MercadoPagoCheckoutProps {
    amount: number;
    description: string;
    onSuccess?: (paymentId: string) => void;
    onError?: (error: any) => void;
}

const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
    amount,
    description,
    onSuccess,
    onError,
}) => {
    const [preferenceId, setPreferenceId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const createPreference = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/create-preference', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, description }),
            });

            if (!response.ok) throw new Error('Error al crear la preferencia');

            const data = await response.json();
            setPreferenceId(data.preferenceId);
        } catch (error) {
            console.error('Error:', error);
            onError?.(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData: any) => {
        console.log('Pago exitoso:', formData);
        if (onSuccess) {
            onSuccess(formData?.formData?.payment_id || 'unknown');
        }
    };

    const handleError = (error: any) => {
        console.error('Error en el pago:', error);
        if (onError) {
            onError(error);
        }
    };

    if (!preferenceId) {
        return (
            <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-semibold mb-4">Resumen de pago</h3>
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-600">{description}</span>
                    <span className="text-2xl font-bold text-pink-600">
                        ${amount.toLocaleString('es-AR')}
                    </span>
                </div>
                <button
                    onClick={createPreference}
                    disabled={loading}
                    className={`w-full py-3 rounded-xl font-semibold transition-all ${loading
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:from-pink-600 hover:to-rose-500'
                        }`}
                >
                    {loading ? 'Preparando pago...' : 'Pagar con MercadoPago'}
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg">
            <Payment
                initialization={{
                    amount,
                    preferenceId
                }}
                customization={{
                    paymentMethods: {
                        maxInstallments: 1,
                        creditCard: ['credit_card'],
                        debitCard: ['debit_card']
                    }
                } as any}
                onSubmit={handleSubmit}
                onError={handleError}
            />
        </div>
    );
};

export default MercadoPagoCheckout;