// src/views/ConfirmOrder.tsx
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartProvider';
import { db, auth } from '@/config/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import MercadoPagoCheckout from '@/components/mercadoPago/MercadoPagoCheckout';

const price = (n: number) => n.toLocaleString('es-AR');
const WA_PHONE = '5491158651170'; // <-- tu número sin + ni espacios

const ConfirmOrder: React.FC = () => {
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'mercadopago'>('whatsapp');
  const [form, setForm] = useState({
    nombre: '',
    whatsapp: '',
    entrega: 'retiro' as 'retiro' | 'envio',
    fecha: '',
    hora: '',
    direccion: '',
    notas: '',
  });
  const [enviando, setEnviando] = useState(false);

  const onChange =
    (k: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

  const valido = useMemo(() => {
    if (!form.nombre.trim()) return false;
    if (!/^\d{10,15}$/.test(form.whatsapp.replace(/\D/g, ''))) return false;
    if (!form.fecha || !form.hora) return false;
    if (form.entrega === 'envio' && !form.direccion.trim()) return false;
    return items.length > 0;
  }, [form, items.length]);

  // 🔥 ACTUALIZADO: incluye variantLabel en el mensaje
  const buildWaMessage = (orderId: string) => {
    const lines = items.map(
      (it) => `• ${it.product.nombre}${it.variantLabel ? ` (${it.variantLabel})` : ''} x${it.quantity} — $${price(it.precio * it.quantity)}`
    );
    const datosEntrega =
      form.entrega === 'retiro'
        ? 'Modalidad: Retiro por el local'
        : `Modalidad: Envío\nDirección: ${form.direccion}`;
    const when = `Fecha: ${form.fecha}  Hora: ${form.hora}`;
    const cliente = `Cliente: ${form.nombre}\nWhatsApp: ${form.whatsapp}`;
    const notas = form.notas ? `\nNotas: ${form.notas}` : '';

    return (
      `Hola Epikus Cake 👋\n` +
      `Quiero confirmar el *pedido #${orderId}*:\n\n` +
      `${lines.join('\n')}\n` +
      `\nTotal: $${price(total)}\n\n` +
      `${datosEntrega}\n${when}\n${cliente}${notas}\n\n` +
      `Gracias!`
    );
  };

  // 🔥 ACTUALIZADO: descuenta stock por variante si aplica
  const createOrderAndDecrement = async (userUid: string): Promise<string> => {
    const orderRef = doc(collection(db, 'pedidos'));

    await runTransaction(db, async (tx) => {
      // 1) Validar y descontar stock actual
      for (const it of items) {
        const pRef = doc(db, 'productos', it.product.id);
        const snap = await tx.get(pRef);
        if (!snap.exists()) throw new Error(`Producto inexistente: ${it.product.nombre}`);
        
        const producto = snap.data();
        
        // Si tiene variante, descontar stock de la variante específica
        if (it.variantId && producto.tieneVariantes && Array.isArray(producto.variantes)) {
          const variantes = producto.variantes;
          const idx = variantes.findIndex((v: any) => v.id === it.variantId);
          if (idx === -1) throw new Error(`Variante no encontrada: ${it.variantLabel}`);
          
          const stockVariante = Number(variantes[idx].stock ?? 0);
          if (stockVariante < it.quantity) {
            throw new Error(`Sin stock suficiente de "${it.product.nombre} (${it.variantLabel})". Quedan ${stockVariante}.`);
          }
          
          variantes[idx].stock = stockVariante - it.quantity;
          tx.update(pRef, { variantes });
        } else {
          // Producto sin variantes, descontar stock simple
          const stock = Number(producto.stock ?? 0);
          if (stock < it.quantity) {
            throw new Error(`Sin stock suficiente de "${it.product.nombre}". Quedan ${stock}.`);
          }
          tx.update(pRef, { stock: stock - it.quantity });
        }
      }

      // 2) Crear el pedido - 🔥 ACTUALIZADO: incluye variantId y variantLabel
      tx.set(orderRef, {
        status: 'pendiente',
        createdAt: serverTimestamp(),
        userUid: userUid,
        customer: { nombre: form.nombre, whatsapp: form.whatsapp },
        entrega: {
          tipo: form.entrega,
          direccion: form.entrega === 'envio' ? form.direccion : null,
          fecha: form.fecha,
          hora: form.hora,
        },
        notas: form.notas || null,
        items: items.map((it) => ({
          productId: it.product.id,
          variantId: it.variantId || null,
          variantLabel: it.variantLabel || null,
          nombre: it.product.nombre,
          precio: it.precio,
          cantidad: it.quantity,
          subtotal: it.precio * it.quantity,
        })),
        total,
        source: 'web',
      });
    });

    return orderRef.id;
  };

  const confirmar = async () => {
    if (!valido || enviando) return;
    setEnviando(true);
    try {
      const user = auth.currentUser!;
      const orderId = await createOrderAndDecrement(user.uid);
      const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(buildWaMessage(orderId))}`;
      window.open(url, '_blank');
      clear();
      nav('/products');
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'No se pudo confirmar el pedido.');
    } finally {
      setEnviando(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="mb-4">Tu carrito está vacío.</p>
          <Link to="/products" className="text-pink-600 underline">Volver a productos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ff7bab48] pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="mb-8 leading-tight text-[clamp(2rem,6vw,3rem)] font-light text-gray-900">
          Confirmar <span className="font-bold text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">pedido</span>
        </h1>

        <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="rounded-xl border border-gray-200 px-3 py-2" placeholder="Nombre y apellido"
              value={form.nombre} onChange={onChange('nombre')} />
            <input className="rounded-xl border border-gray-200 px-3 py-2" placeholder="WhatsApp (solo números)"
              value={form.whatsapp} onChange={onChange('whatsapp')} inputMode="numeric" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 border rounded-xl px-3 py-2">
              <input type="radio" name="entrega" value="retiro"
                checked={form.entrega === 'retiro'} onChange={onChange('entrega')} />
              <span>Retiro</span>
            </label>
            <label className="flex items-center gap-2 border rounded-xl px-3 py-2">
              <input type="radio" name="entrega" value="envio"
                checked={form.entrega === 'envio'} onChange={onChange('entrega')} />
              <span>Envío</span>
            </label>
          </div>

          {form.entrega === 'envio' && (
            <input className="rounded-xl border border-gray-200 px-3 py-2"
              placeholder="Dirección (calle y altura, barrio)"
              value={form.direccion} onChange={onChange('direccion')} />
          )}

          <div className="grid grid-cols-2 gap-2">
            <input type="date" className="rounded-xl border border-gray-200 px-3 py-2"
              value={form.fecha} onChange={onChange('fecha')} />
            <input type="time" className="rounded-xl border border-gray-200 px-3 py-2"
              value={form.hora} onChange={onChange('hora')} />
          </div>

          <textarea className="w-full rounded-xl border border-gray-200 px-3 py-2"
            placeholder="Notas (ej: sin pasas, mensaje en la torta…)"
            rows={3} value={form.notas} onChange={onChange('notas')} />

          <div className="flex items-center justify-between border-t pt-4">
            <div className="font-semibold">Total</div>
            <div className="text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text font-bold">
              ${price(total)}
            </div>
          </div>
          <div className="border-t pt-4 space-y-3">
            <h3 className="font-semibold">Método de pago</h3>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center gap-2 border-2 rounded-xl px-3 py-2 cursor-pointer transition-all ${paymentMethod === 'whatsapp' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                }`}>
                <input
                  type="radio"
                  name="payment"
                  value="whatsapp"
                  checked={paymentMethod === 'whatsapp'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'whatsapp')}
                />
                <span>WhatsApp</span>
              </label>
              <label className={`flex items-center gap-2 border-2 rounded-xl px-3 py-2 cursor-pointer transition-all ${paymentMethod === 'mercadopago' ? 'border-pink-500 bg-pink-50' : 'border-gray-200'
                }`}>
                <input
                  type="radio"
                  name="payment"
                  value="mercadopago"
                  checked={paymentMethod === 'mercadopago'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'mercadopago')}
                />
                <span>MercadoPago</span>
              </label>
            </div>
          </div>
          {paymentMethod === 'whatsapp' ? (
            <button
              type="button"
              disabled={!valido || enviando}
              onClick={confirmar}
              className={[
                'w-full py-3 rounded-xl font-semibold shadow-lg transition-all',
                !valido || enviando
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:from-pink-600 hover:to-rose-500',
              ].join(' ')}
            >
              {enviando ? 'Abriendo WhatsApp…' : 'Confirmar por WhatsApp'}
            </button>
          ) : (
            <MercadoPagoCheckout
              amount={total}
              description="Pedido Epikus Cake"
              onError={(e) => alert('Error en el pago: ' + (e?.message ?? e))}
            />
          )}
          <Link to="/checkout" className="block text-center text-pink-600 hover:underline">Volver</Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrder;