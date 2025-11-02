// src/views/ConfirmOrder.tsx
import React, { useMemo, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartProvider';
import { db, auth } from '@/config/firebase';
import { collection, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import MercadoPagoCheckout from '@/components/mercadoPago/MercadoPagoCheckout';
import {
  HiUser, HiEnvelope, HiPhone, HiCalendar, HiClock,
  HiCake, HiDocumentText, HiSparkles, HiInformationCircle
} from 'react-icons/hi2';
import { motion, AnimatePresence } from 'framer-motion';
import { useRecaptcha } from '@/hooks/useRecaptcha';
import ReCaptchaInvisible from '@/components/security/ReCaptchaInvisible';
import { sendEmail } from '@/config/emailjs';

const price = (n: number) => n.toLocaleString('es-AR');
const WA_PHONE = '5491158651170';
const DESCUENTO_TRANSFERENCIA = 10;

const ConfirmOrder: React.FC = () => {
  const enviandoRef = useRef(false);
  // ====== estilos animaciones CSS (shimmer / confetti / float)
  const [errorRecaptcha, setErrorRecaptcha] = useState<string | null>(null);
  const { executeRecaptcha } = useRecaptcha();
  const Styles = () => (
    <style>{`
      @keyframes shimmer {
        0% { background-position: 0% 50% }
        100% { background-position: 200% 50% }
      }
      .btn-shimmer {
        background-image: linear-gradient(90deg, rgba(255,255,255,.15) 0%, rgba(255,255,255,0) 20%, rgba(255,255,255,.15) 40%);
        background-size: 200% 100%;
        animation: shimmer 1.6s linear infinite;
      }
      @keyframes floatY {
        0% { transform: translateY(0px) }
        50% { transform: translateY(-8px) }
        100% { transform: translateY(0px) }
      }
      .float-slow { animation: floatY 4.5s ease-in-out infinite }
      .float-fast { animation: floatY 3.2s ease-in-out infinite }
      /* confetti stars */
      .confetti-star {
        position: absolute;
        font-size: 16px;
        opacity: 0;
        animation: pop 800ms ease forwards;
      }
      @keyframes pop {
        0% { transform: translateY(0) scale(.6) rotate(0deg); opacity: 0 }
        20% { opacity: 1 }
        100% { transform: translateY(-120px) translateX(var(--x, 40px)) scale(1.2) rotate(50deg); opacity: 0 }
      }
    `}</style>
  );
  const { items, total, clear } = useCart();
  const nav = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'transferencia' | 'mercadopago'>('transferencia');
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    fecha: '',
    hora: '',
    dedicatoria: '',
    cantidadPersonas: '',
    alergias: '',
    notas: '',
  });
  const [enviando, setEnviando] = useState(false);
  const [celebrate, setCelebrate] = useState(false); // 🎉 mini confetti

  const pricing = useMemo(() => {
    const subtotal = total;
    const aplicaDescuento = paymentMethod === 'transferencia';
    const descuentoMonto = aplicaDescuento ? Math.round(subtotal * (DESCUENTO_TRANSFERENCIA / 100)) : 0;
    const totalFinal = Math.max(0, subtotal - descuentoMonto);
    const senia50 = Math.round(totalFinal * 0.5);
    const saldo50 = Math.max(0, totalFinal - senia50);
    return { subtotal, aplicaDescuento, descuentoPorcentaje: aplicaDescuento ? DESCUENTO_TRANSFERENCIA : 0, descuentoMonto, total: totalFinal, senia50, saldo50 };
  }, [total, paymentMethod]);

  const onChange =
    (k: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }));

  const valido = useMemo(() => {
    if (!form.nombre.trim()) return false;
    if (!/^\d{10,15}$/.test(form.whatsapp.replace(/\D/g, ''))) return false;
    if (!form.fecha || !form.hora) return false;
    return items.length > 0;
  }, [form, items.length]);

  const minDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 48h adelante

  const buildWaMessage = (orderId: string) => {
    const lines = items.map(
      (it) => `• ${it.product.nombre}${it.variantLabel ? ` (${it.variantLabel})` : ''} x${it.quantity} — $${price(it.precio * it.quantity)}`
    );
    const when = `Fecha: ${form.fecha}  Hora: ${form.hora}`;
    const cliente = `Cliente: ${form.nombre}${form.email ? `\nEmail: ${form.email}` : ''}\nWhatsApp: ${form.whatsapp}`;
    const descuentoTexto = pricing.aplicaDescuento ? `\n✨ Descuento ${DESCUENTO_TRANSFERENCIA}%: -$${price(pricing.descuentoMonto)}` : '';
    const extras = [
      form.dedicatoria ? `\nDedicatoria: ${form.dedicatoria}` : '',
      form.cantidadPersonas ? `\nCantidad de personas: ${form.cantidadPersonas}` : '',
      form.alergias ? `\n⚠️ Alergias/Restricciones: ${form.alergias}` : '',
      form.notas ? `\nNotas adicionales: ${form.notas}` : ''
    ].join('');
    const politica =
      `\n\nModalidad: *Retiro en local*` +
      `\nSi preferís, podés enviar un *Cabify/Remís* (costo a cargo del comprador).` +
      `\n\n*Reserva*: tu pedido queda confirmado al *acreditar la seña del 50%*.` +
      `\nSeña (50%): $${price(pricing.senia50)}  |  Saldo al retirar: $${price(pricing.saldo50)}`;
    return (
      `Hola Epikus Cake 👋\n` +
      `Quiero confirmar el *pedido #${orderId}*:\n\n` +
      `${lines.join('\n')}\n` +
      `\nSubtotal: $${price(pricing.subtotal)}${descuentoTexto}\n` +
      `*TOTAL: $${price(pricing.total)}*\n` +
      `${politica}\n\n` +
      `${when}\n` +
      `Método de pago: ${paymentMethod === 'transferencia' ? 'Transferencia/Efectivo' : 'MercadoPago'}\n` +
      `${cliente}${extras}\n\n` +
      `Gracias!`
    );
  };

  const createOrderAndDecrement = async (userUid: string): Promise<string> => {
    const orderRef = doc(collection(db, 'pedidos'));
    await runTransaction(db, async (tx) => {
      for (const it of items) {
        const pRef = doc(db, 'productos', it.product.id);
        const snap = await tx.get(pRef);
        if (!snap.exists()) throw new Error(`Producto inexistente: ${it.product.nombre}`);
        const producto = snap.data();
        if (it.variantId && producto.tieneVariantes && Array.isArray(producto.variantes)) {
          const variantes = producto.variantes;
          const idx = variantes.findIndex((v: any) => v.id === it.variantId);
          if (idx === -1) throw new Error(`Variante no encontrada: ${it.variantLabel}`);
          const stockVariante = Number(variantes[idx].stock ?? 0);
          if (stockVariante < it.quantity) throw new Error(`Sin stock suficiente de "${it.product.nombre} (${it.variantLabel})". Quedan ${stockVariante}.`);
          variantes[idx].stock = stockVariante - it.quantity;
          tx.update(pRef, { variantes });
        } else {
          const stock = Number(producto.stock ?? 0);
          if (stock < it.quantity) throw new Error(`Sin stock suficiente de "${it.product.nombre}". Quedan ${stock}.`);
          tx.update(pRef, { stock: stock - it.quantity });
        }
      }

      tx.set(orderRef, {
        status: 'pendiente',
        createdAt: serverTimestamp(),
        userUid,
        customer: { nombre: form.nombre, email: form.email || null, whatsapp: form.whatsapp },
        entrega: { tipo: 'retiro', fecha: form.fecha, hora: form.hora },
        pago: {
          metodoSeleccionado: paymentMethod,
          aplicaDescuento: pricing.aplicaDescuento,
          requiereSenia: paymentMethod === 'transferencia',
          seniaMonto: paymentMethod === 'transferencia' ? pricing.senia50 : 0,
          saldoRestante: paymentMethod === 'transferencia' ? pricing.saldo50 : 0,
          liquidacion: paymentMethod === 'mercadopago' ? 'online' : 'offline',
          acreditado: false,
        },
        pricing: {
          subtotal: pricing.subtotal,
          descuentoPorcentaje: pricing.descuentoPorcentaje,
          descuentoMonto: pricing.descuentoMonto,
          total: pricing.total,
        },
        notasInternas: null,
        dedicatoria: form.dedicatoria || null,
        cantidadPersonas: form.cantidadPersonas || null,
        alergias: form.alergias || null,
        notas: form.notas || null,
        items: items.map((it) => ({
          productId: it.product.id,
          variantId: it.variantId || null,
          variantLabel: it.variantLabel || null,
          nombre: it.product.nombre,
          precioUnitario: it.precio,
          cantidad: it.quantity,
          subtotalItem: it.precio * it.quantity,
        })),
        source: 'web',
      });
    });
    return orderRef.id;
  };

  const confirmarTransferencia = async () => {
    if (!valido || enviando || enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviando(true);
    setErrorRecaptcha(null);

    try {
      // 1) reCAPTCHA
      const recaptchaResult = await executeRecaptcha("confirm_order");
      if (!recaptchaResult.ok || (recaptchaResult.score && recaptchaResult.score < 0.5)) {
        setErrorRecaptcha('No pudimos verificar que sos humano. Intentá de nuevo.');
        return;
      }

      // 2) Crear la orden (necesitamos el orderId)
      const user = auth.currentUser!;
      const orderId = await createOrderAndDecrement(user.uid);

      // 3) Abrir WhatsApp en NUEVA pestaña (sin tocar la actual)
      const message = buildWaMessage(orderId);
      const waHref = `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(message)}`;

      const a = document.createElement('a');
      a.href = waHref;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();

      // 4) Limpiar y navegar al comprobante (tu SPA)
      clear();
      setCelebrate(true);
      nav(`/payment-success?orderId=${orderId}`);

      // 5) Emails EN PARALELO (no bloquean la UX)
      const tasks: Promise<unknown>[] = [];

      if (form.email) {
        tasks.push(
          sendEmail({
            to: form.email,
            subject: `Confirmación de pedido #${orderId} - Epikus Cake`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #ec4899;">¡Gracias por tu pedido!</h2>
              <p>Hola <strong>${form.nombre}</strong>,</p>
              <p>Tu pedido <strong>#${orderId}</strong> ha sido recibido correctamente.</p>
              <div style="background: #fdf2f8; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Total:</strong> $${price(pricing.total)}</p>
                <p><strong>Seña (50%):</strong> $${price(pricing.senia50)}</p>
                <p><strong>Retiro:</strong> ${form.fecha} a las ${form.hora}</p>
              </div>
              <p>En breve te contactamos por WhatsApp para coordinar el pago de la seña.</p>
              <p><strong>Recordá:</strong> Tu pedido queda confirmado al acreditar la seña del 50%.</p>
              <p style="margin-top: 30px;">Gracias por confiar en Epikus Cake 💖</p>
            </div>
          `,
            text: `Pedido #${orderId} confirmado. Total: $${price(pricing.total)}. Seña 50%: $${price(pricing.senia50)}. Retiro: ${form.fecha} ${form.hora}`
          }).catch(err => console.error('Email cliente falló:', err))
        );
      }

      const productosHTML = items.map(it =>
        `<li>${it.product.nombre}${it.variantLabel ? ` (${it.variantLabel})` : ''} x${it.quantity} — $${price(it.precio * it.quantity)}</li>`
      ).join('');

      tasks.push(
        sendEmail({
          to: import.meta.env.VITE_CONTACT_EMAIL,
          subject: `🛒 Nueva compra - Pedido #${orderId}`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #ec4899;">Nueva compra recibida</h2>
            <p><strong>Pedido:</strong> #${orderId}</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin-top: 0;">👤 Datos del cliente</h3>
              <p><strong>Nombre:</strong> ${form.nombre}</p>
              <p><strong>Email:</strong> ${form.email || 'No proporcionó'}</p>
              <p><strong>WhatsApp:</strong> ${form.whatsapp}</p>
            </div>
            <div style="background: #fdf2f8; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin-top: 0;">🛍️ Productos</h3>
              <ul>${productosHTML}</ul>
            </div>
            <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin-top: 0;">💰 Pago</h3>
              <p><strong>Subtotal:</strong> $${price(pricing.subtotal)}</p>
              ${pricing.aplicaDescuento ? `<p><strong>Descuento ${pricing.descuentoPorcentaje}%:</strong> -$${price(pricing.descuentoMonto)}</p>` : ''}
              <p style="font-size: 18px;"><strong>TOTAL:</strong> $${price(pricing.total)}</p>
              <p><strong>Seña (50%):</strong> $${price(pricing.senia50)}</p>
              <p><strong>Saldo al retirar:</strong> $${price(pricing.saldo50)}</p>
              <p><strong>Método:</strong> ${paymentMethod === 'transferencia' ? 'Transferencia/Efectivo' : 'MercadoPago'}</p>
            </div>
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h3 style="margin-top: 0;">📅 Retiro</h3>
              <p><strong>Fecha:</strong> ${form.fecha}</p>
              <p><strong>Hora:</strong> ${form.hora}</p>
            </div>
            ${form.notas ? `
              <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h3 style="margin-top: 0;">📝 Notas especiales</h3>
                <p>${form.notas}</p>
              </div>
            ` : ''}
            <p style="color: #666; font-size: 12px; margin-top: 30px;">Este email se envió automáticamente desde el sitio web.</p>
          </div>
        `,
          text: `Nueva compra #${orderId}\nCliente: ${form.nombre}\nWhatsApp: ${form.whatsapp}\nTotal: $${price(pricing.total)}\nRetiro: ${form.fecha} ${form.hora}`
        }).catch(err => console.error('Email interno falló:', err))
      );

      Promise.allSettled(tasks).then(() => { }).catch(() => { });
    } catch (e: any) {
      console.error(e);
      alert(e?.message || 'No se pudo confirmar el pedido.');
    } finally {
      setEnviando(false);
      enviandoRef.current = false;
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
    <div className="relative min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-24 pb-28 overflow-hidden">
      <Styles />

      {/* Burbujas animadas de fondo (claras y grandes, visibles en desktop) */}
      <motion.div
        className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-pink-200/30 blur-3xl"
        animate={{ x: [0, 35, -10, 0], y: [0, -20, 15, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-28 -right-20 h-[28rem] w-[28rem] rounded-full bg-rose-300/25 blur-3xl"
        animate={{ x: [0, -25, 10, 0], y: [0, 30, -18, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header con “mascota” flotante */}
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="mb-8 relative">
          <h1 className="leading-tight text-[clamp(2rem,6vw,3.25rem)] font-light text-gray-900">
            Confirmar <span className="font-black text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text">pedido</span>
          </h1>
          <div className="mt-3 hidden md:flex items-center gap-2 text-xs font-medium text-gray-500">
            <span className="px-2.5 py-1 rounded-full bg-white shadow-sm border">1. Datos</span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-full bg-white shadow-sm border">2. Retiro</span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-full bg-white shadow-sm border">3. Pago</span>
            <span>•</span>
            <span className="px-2.5 py-1 rounded-full bg-white shadow-sm border">4. Confirmación</span>
          </div>

          <div className="absolute -top-6 right-2 hidden md:block float-slow mt-2">
            <span className="text-6xl select-none">🎂</span>
          </div>
        </motion.div>

        {/* Grid 2 columnas: form + resumen sticky */}
        <div className="grid lg:grid-cols-[1.6fr_1fr] gap-8 items-start">
          {/* LEFT: Form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 backdrop-blur rounded-2xl shadow-xl p-6 space-y-6 border border-pink-100"
          >
            {/* Información personal */}
            <section className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600">👤</span>
                Información Personal
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="relative group">
                  <HiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-3 py-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                    placeholder="Nombre y apellido"
                    value={form.nombre}
                    onChange={onChange('nombre')}
                  />
                </div>
                <div className="relative group">
                  <HiEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-3 py-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                    placeholder="Email (opcional)"
                    value={form.email}
                    onChange={onChange('email')}
                  />
                </div>
                <div className="relative group">
                  <HiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-3 py-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                    placeholder="WhatsApp (solo números)"
                    value={form.whatsapp}
                    onChange={onChange('whatsapp')}
                    inputMode="numeric"
                  />
                </div>
              </div>
            </section>

            {/* Retiro en local */}
            <section className="space-y-4 border-t pt-6">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600">🏠</span>
                Retiro en local
              </h3>

              <div className="rounded-xl bg-pink-50 border border-pink-200 p-3 text-sm text-pink-900 flex gap-2">
                <HiInformationCircle className="w-5 h-5 mt-[2px]" />
                <p>
                  No contamos con delivery propio. Si querés envío, podés enviar un <strong>Cabify/Remís</strong>;
                  el <strong>costo corre por cuenta del comprador</strong> y lo coordinamos por WhatsApp.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative group">
                  <HiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="date"
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-3 py-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                    value={form.fecha}
                    onChange={onChange('fecha')}
                    min={minDate}
                  />
                </div>
                <div className="relative group">
                  <HiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <motion.input
                    whileFocus={{ scale: 1.01 }}
                    type="time"
                    className="w-full rounded-xl border border-gray-200 pl-11 pr-3 py-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none"
                    value={form.hora}
                    onChange={onChange('hora')}
                  />
                </div>
              </div>
            </section>

            {/* Detalles */}
            <section className="space-y-4 border-t pt-6">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600">📝</span>
                Detalles del pedido
              </h3>
              <div className="relative group">
                <HiDocumentText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  className="w-full rounded-xl border border-gray-200 pl-11 pr-3 py-3 focus:border-pink-400 focus:ring-2 focus:ring-pink-200 outline-none resize-none"
                  placeholder="Notas (ej: sin pasas, decoración especial...)"
                  rows={3}
                  value={form.notas}
                  onChange={onChange('notas')}
                />
              </div>
            </section>

            {/* Método de pago */}
            <section className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600">💳</span>
                Método de pago
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <motion.label
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.995 }}
                  className={`relative flex flex-col gap-2 border-2 rounded-xl px-4 py-4 cursor-pointer transition-all ${paymentMethod === 'transferencia' ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-gray-200 hover:border-pink-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="transferencia"
                      checked={paymentMethod === 'transferencia'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'transferencia')}
                      className="text-pink-500 focus:ring-pink-500 w-4 h-4"
                    />
                    <span className="text-2xl">💸</span>
                    <span className="text-sm font-semibold">Transferencia / Efectivo</span>
                  </div>

                  <div className="flex items-center gap-1 ml-7 text-xs font-bold text-green-600">
                    <HiSparkles className="w-4 h-4" />
                    <span>¡{DESCUENTO_TRANSFERENCIA}% de descuento!</span>
                  </div>

                  <p className="ml-7 text-xs text-gray-600">
                    <strong>Beneficio por transferencia:</strong> Tenés <strong>10% OFF</strong>. Para
                    <strong> confirmar tu pedido</strong> requerimos una <strong>seña del 50%</strong>.
                    Te pasamos los datos y coordinamos por WhatsApp. 💖
                  </p>
                </motion.label>

                <motion.label
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.995 }}
                  className={`flex flex-col gap-2 border-2 rounded-xl px-4 py-4 cursor-pointer transition-all ${paymentMethod === 'mercadopago' ? 'border-pink-500 bg-pink-50 shadow-md' : 'border-gray-200 hover:border-pink-300'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value="mercadopago"
                      checked={paymentMethod === 'mercadopago'}
                      onChange={(e) => setPaymentMethod(e.target.value as 'mercadopago')}
                      className="text-pink-500 focus:ring-pink-500 w-4 h-4"
                    />
                    <span className="text-2xl">💳</span>
                    <span className="text-sm font-semibold">MercadoPago</span>
                  </div>
                  <p className="ml-7 text-xs text-gray-600">
                    Pagás online al precio de lista (sin descuento). Confirmación automática al aprobarse el pago.
                  </p>
                </motion.label>
              </div>
            </section>

            {/* CTA */}
            <div>
              {paymentMethod === 'transferencia' ? (
                <>
                  {/* Badge reCAPTCHA */}
                  <ReCaptchaInvisible />
                  {errorRecaptcha && (
                    <div className="rounded-xl px-4 py-3 text-sm bg-rose-50 text-rose-700 border border-rose-200">
                      {errorRecaptcha}
                    </div>
                  )}
                  <motion.button
                    whileHover={{ y: -1, scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    type="button"
                    disabled={!valido || enviando}
                    onClick={confirmarTransferencia}
                    className={[
                      'relative w-full py-4 rounded-xl font-semibold shadow-lg transition-all text-lg flex items-center justify-center gap-2 overflow-hidden',
                      !valido || enviando
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white hover:shadow-xl',
                    ].join(' ')}
                  >
                    {!enviando && <span className="absolute inset-0 btn-shimmer opacity-40 pointer-events-none" />}
                    {enviando ? (
                      <>
                        <span className="animate-spin">⏳</span> Procesando...
                      </>
                    ) : (
                      <>
                        <span>✅</span> Confirmar por WhatsApp
                      </>
                    )}
                  </motion.button>
                </>
              ) : (
                <MercadoPagoCheckout
                  amount={total} // sin descuento en MP
                  description="Pedido Epikus Cake"
                  onError={(e) => alert('Error en el pago: ' + (e?.message ?? e))}
                />
              )}

              <Link to="/checkout" className="block text-center text-pink-600 hover:text-pink-700 hover:underline font-medium py-3">
                ← Volver al carrito
              </Link>

              <p className="text-xs text-gray-500 text-center">
                La fecha y hora se reservan al acreditar la seña del 50% (transferencia/efectivo). Ver{' '}
                <Link to="/terminos" className="underline">Términos y Condiciones</Link>.
              </p>
            </div>
          </motion.div>

          {/* RIGHT: Resumen sticky con badge animado */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="sticky top-24 self-start"
          >
            <div className="relative rounded-2xl border border-pink-200/70 bg-white/80 backdrop-blur shadow-xl p-6">
              <div className="absolute -top-4 right-4">
                <AnimatePresence>
                  {paymentMethod === 'transferencia' && (
                    <motion.span
                      initial={{ y: -8, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -8, opacity: 0 }}
                      className="inline-flex items-center gap-1 rounded-full bg-green-100 text-green-700 text-[11px] font-bold px-3 py-1 border border-green-200"
                    >
                      <HiSparkles className="w-3.5 h-3.5" /> 10% OFF
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>

              <h4 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <HiCake className="w-5 h-5 text-pink-500" /> Resumen del pedido
              </h4>

              <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
                {items.map((it) => (
                  <motion.div
                    key={`${it.product.id}-${it.variantId ?? 'base'}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start justify-between text-sm"
                  >
                    <div className="text-gray-700">
                      <span className="font-medium">{it.product.nombre}</span>
                      {it.variantLabel ? <span className="text-gray-500"> ({it.variantLabel})</span> : null}
                      <span className="text-gray-500"> ×{it.quantity}</span>
                    </div>
                    <div className="text-gray-800 font-semibold">${price(it.precio * it.quantity)}</div>
                  </motion.div>
                ))}
                {items.length === 0 && <p className="text-sm text-gray-500">No hay productos.</p>}
              </div>

              <div className="my-4 border-t"></div>

              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>Subtotal</span>
                <span className="font-semibold">${price(pricing.subtotal)}</span>
              </div>

              <AnimatePresence>
                {pricing.aplicaDescuento && (
                  <motion.div
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    className="flex items-center justify-between text-sm text-green-600"
                  >
                    <span>Descuento {pricing.descuentoPorcentaje}%</span>
                    <span className="font-semibold">-${price(pricing.descuentoMonto)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-transparent bg-gradient-to-r from-pink-500 to-rose-400 bg-clip-text font-extrabold text-2xl">
                  ${price(pricing.total)}
                </span>
              </div>

              {paymentMethod === 'transferencia' && (
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <div className="flex items-center justify-between">
                    <span>Seña 50%</span>
                    <span className="font-semibold">${price(pricing.senia50)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Saldo al retirar</span>
                    <span className="font-semibold">${price(pricing.saldo50)}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </div>
      </div>

      {/* 🎉 Mini confetti (estrellitas) */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onAnimationComplete={() => setCelebrate(false)}
            className="pointer-events-none fixed inset-0 z-50"
          >
            {Array.from({ length: 24 }).map((_, i) => {
              const left = Math.random() * 100;
              const x = (Math.random() - 0.5) * 160; // desplazamiento lateral
              const delay = Math.random() * 0.15;
              const emojis = ['✨', '⭐', '🌟', '💖', '🎉'];
              const emoji = emojis[i % emojis.length];
              return (
                <span
                  key={i}
                  className="confetti-star"
                  style={{
                    left: `${left}%`,
                    bottom: '10%',
                    animationDelay: `${delay}s`,
                    // @ts-ignore
                    '--x': `${x}px`
                  }}
                >
                  {emoji}
                </span>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ConfirmOrder;
