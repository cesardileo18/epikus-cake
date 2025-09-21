// src/views/ConfirmOrder.tsx
import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartProvider';

import { db, auth } from '@/config/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

const price = (n: number) => n.toLocaleString('es-AR');
const WA_PHONE = '5491158651170'; // <-- tu número sin + ni espacios

const ConfirmOrder: React.FC = () => {
  const { items, total, clear } = useCart();
  const nav = useNavigate();

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

  const ensureAuth = async () => {
    if (!auth.currentUser) await signInAnonymously(auth);
    return auth.currentUser!;
  };

  const buildWaMessage = (orderId: string) => {
    const lines = items.map(
      (it) => `• ${it.product.nombre} x${it.quantity} — $${price(it.product.precio * it.quantity)}`
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

  // ✅ Crea ticket en /pedidos y descuenta stock en /productos (transacción)
  const createOrderAndDecrement = async (userUid: string): Promise<string> => {
    const orderRef = doc(collection(db, 'pedidos')); // colección raíz "pedidos"

    await runTransaction(db, async (tx) => {
      // 1) Validar y descontar stock actual
      for (const it of items) {
        const pRef = doc(db, 'productos', it.product.id);
        const snap = await tx.get(pRef);
        if (!snap.exists()) throw new Error(`Producto inexistente: ${it.product.nombre}`);
        const data = snap.data() as { stock?: number };
        const stock = Number(data.stock ?? 0);
        if (stock < it.quantity) {
          throw new Error(`Sin stock suficiente de "${it.product.nombre}". Quedan ${stock}.`);
        }
        tx.update(pRef, { stock: stock - it.quantity });
      }

      // 2) Crear el pedido
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
          nombre: it.product.nombre,
          precio: it.product.precio,
          cantidad: it.quantity,
          subtotal: it.product.precio * it.quantity,
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
      const user = await ensureAuth();                     // asegura request.auth para reglas
      const orderId = await createOrderAndDecrement(user.uid); // crea /pedidos y descuenta stock
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-24 pb-20">
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

          <Link to="/checkout" className="block text-center text-pink-600 hover:underline">Volver</Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmOrder;
