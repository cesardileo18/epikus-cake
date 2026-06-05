import { useEffect, useState } from 'react';
import {
  Clock3,
  Landmark,
  Link as LinkIcon,
  Mail,
  MapPin,
  MessageCircle,
  Save,
  Settings,
  ShoppingCart,
  Truck,
} from 'lucide-react';
import { showToast } from '@/components/feedback/ToastProvider';
import type {
  StoreSettingsInput,
  TimeSlot,
  WeekdayKey,
} from '@/interfaces/settings';
import {
  DEFAULT_STORE_SETTINGS,
  getStoreSettings,
  saveStoreSettings,
} from '@/services/settings.service';
import {
  AdminCard,
  AdminHeader,
  AdminInput,
  AdminLoader,
  AdminPage,
  AdminTextarea,
  Field,
  SectionTitle,
  SwitchControl,
} from '@/components/admin/ui';

const WEEKDAYS: Array<{ key: WeekdayKey; label: string }> = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miercoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
];

const normalizeSlots = (slots: TimeSlot[]) =>
  slots
    .map((slot) => ({ from: slot.from.trim(), to: slot.to.trim() }))
    .filter((slot) => slot.from && slot.to)
    .slice(0, 2);

const AdminSettings: React.FC = () => {
  const [form, setForm] = useState<StoreSettingsInput>(DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    getStoreSettings()
      .then((settings) => {
        if (!mounted) return;
        setForm({
          storeName: settings.storeName,
          contactEmail: settings.contactEmail,
          whatsapp: settings.whatsapp,
          whatsappMessage: settings.whatsappMessage,
          address: settings.address,
          instagramUrl: settings.instagramUrl,
          pedidosYaUrl: settings.pedidosYaUrl,
          mapEmbedUrl: settings.mapEmbedUrl,
          weeklyAvailability: settings.weeklyAvailability,
          shippingEnabled: settings.shippingEnabled,
          shippingInfo: settings.shippingInfo,
          shippingCost: settings.shippingCost,
          freeShippingFrom: settings.freeShippingFrom,
          storeEnabled: settings.storeEnabled,
          maintenanceMessage: settings.maintenanceMessage,
          bankAlias: settings.bankAlias,
          bankCbu: settings.bankCbu,
          bankHolder: settings.bankHolder,
        });
      })
      .catch((err) => {
        console.error('AdminSettings load error:', err);
        showToast.error('No se pudo cargar la configuracion');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateField = <K extends keyof StoreSettingsInput>(
    key: K,
    value: StoreSettingsInput[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateDayEnabled = (dayKey: WeekdayKey, enabled: boolean) => {
    setForm((current) => {
      const day = current.weeklyAvailability[dayKey];
      return {
        ...current,
        weeklyAvailability: {
          ...current.weeklyAvailability,
          [dayKey]: {
            enabled,
            slots:
              enabled && day.slots.length === 0
                ? [{ from: '09:00', to: '13:00' }]
                : day.slots,
          },
        },
      };
    });
  };

  const updateSlot = (
    dayKey: WeekdayKey,
    slotIndex: number,
    key: keyof TimeSlot,
    value: string
  ) => {
    setForm((current) => {
      const day = current.weeklyAvailability[dayKey];
      return {
        ...current,
        weeklyAvailability: {
          ...current.weeklyAvailability,
          [dayKey]: {
            ...day,
            slots: day.slots.map((slot, index) =>
              index === slotIndex ? { ...slot, [key]: value } : slot
            ),
          },
        },
      };
    });
  };

  const handleSave = async () => {
    const contactEmail = form.contactEmail.trim();
    const whatsapp = form.whatsapp.replace(/\D/g, '');

    if (!form.storeName.trim()) {
      showToast.error('El nombre de la tienda es obligatorio');
      return;
    }

    if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
      showToast.error('El email de contacto no tiene un formato valido');
      return;
    }

    if (whatsapp && !/^\d{8,15}$/.test(whatsapp)) {
      showToast.error('El WhatsApp debe tener entre 8 y 15 digitos');
      return;
    }

    const weeklyAvailability = Object.fromEntries(
      WEEKDAYS.map(({ key }) => {
        const day = form.weeklyAvailability[key];
        return [
          key,
          {
            enabled: day.enabled,
            slots: day.enabled ? normalizeSlots(day.slots) : [],
          },
        ];
      })
    ) as StoreSettingsInput['weeklyAvailability'];

    setSaving(true);
    try {
      await saveStoreSettings({
        ...form,
        storeName: form.storeName.trim(),
        contactEmail,
        whatsapp,
        whatsappMessage: form.whatsappMessage.trim(),
        address: form.address.trim(),
        instagramUrl: form.instagramUrl.trim(),
        pedidosYaUrl: form.pedidosYaUrl.trim(),
        mapEmbedUrl: form.mapEmbedUrl.trim(),
        weeklyAvailability,
        shippingInfo: form.shippingInfo.trim(),
        shippingCost: Number(form.shippingCost || 0),
        freeShippingFrom: Number(form.freeShippingFrom || 0),
        maintenanceMessage: form.maintenanceMessage.trim(),
        bankAlias: form.bankAlias.trim(),
        bankCbu: form.bankCbu.replace(/\s/g, ''),
        bankHolder: form.bankHolder.trim(),
      });
      showToast.success('Configuracion guardada');
    } catch (err) {
      console.error('AdminSettings save error:', err);
      showToast.error('No se pudo guardar la configuracion');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminLoader label="Cargando configuracion..." />;
  }

  return (
    <AdminPage className="flex flex-col gap-5 sm:gap-7">
      <AdminHeader
        eyebrow="Administracion"
        eyebrowIcon={<Settings size={14} />}
        title="Configuracion"
        description="Datos generales, horarios, contacto y comportamiento de la tienda."
        actions={
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 text-sm font-bold text-white transition-colors hover:bg-pink-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar configuracion'}
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-5">
          <AdminCard>
            <SectionTitle
              icon={MapPin}
              title="Datos del negocio"
              description="Informacion usada en contacto, footer, WhatsApp y checkout."
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Field label="Nombre de la tienda">
                <AdminInput
                  value={form.storeName}
                  onChange={(event) => updateField('storeName', event.target.value)}
                  placeholder="Epikus Cake"
                />
              </Field>
              <Field label="Email de contacto">
                <AdminInput
                  type="email"
                  value={form.contactEmail}
                  onChange={(event) => updateField('contactEmail', event.target.value)}
                  placeholder="hola@epikuscake.com"
                />
              </Field>
              <Field label="WhatsApp">
                <AdminInput
                  value={form.whatsapp}
                  onChange={(event) => updateField('whatsapp', event.target.value)}
                  placeholder="5491158651170"
                />
              </Field>
              <Field label="Direccion / retiro">
                <AdminInput
                  value={form.address}
                  onChange={(event) => updateField('address', event.target.value)}
                  placeholder="Humberto 1ro 2076, CABA"
                />
              </Field>
              <Field label="Instagram">
                <AdminInput
                  type="url"
                  value={form.instagramUrl}
                  onChange={(event) => updateField('instagramUrl', event.target.value)}
                  placeholder="https://instagram.com/..."
                />
              </Field>
              <Field label="PedidosYa">
                <AdminInput
                  type="url"
                  value={form.pedidosYaUrl}
                  onChange={(event) => updateField('pedidosYaUrl', event.target.value)}
                  placeholder="https://pedidosya.com.ar/..."
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Mensaje predeterminado de WhatsApp">
                  <AdminInput
                    value={form.whatsappMessage}
                    onChange={(event) => updateField('whatsappMessage', event.target.value)}
                  />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="URL embed de mapa">
                  <AdminTextarea
                    value={form.mapEmbedUrl}
                    onChange={(event) => updateField('mapEmbedUrl', event.target.value)}
                    rows={3}
                  />
                </Field>
              </div>
            </div>
          </AdminCard>

          <AdminCard>
            <SectionTitle
              icon={Clock3}
              title="Horarios"
              description="Definen si el carrito y los botones de compra quedan disponibles."
            />

            <div className="mt-5 grid gap-3 lg:grid-cols-2">
              {WEEKDAYS.map(({ key, label }) => {
                const day = form.weeklyAvailability[key];
                const slot = day.slots[0] ?? { from: '09:00', to: '13:00' };

                return (
                  <article
                    key={key}
                    className={[
                      'rounded-xl border p-4 transition-colors',
                      day.enabled
                        ? 'border-pink-500/30 bg-pink-500/[0.06]'
                        : 'border-white/10 bg-white/[0.02]',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <SwitchControl
                          checked={day.enabled}
                          onChange={(checked) => updateDayEnabled(key, checked)}
                          label={`${day.enabled ? 'Cerrar' : 'Abrir'} ${label}`}
                        />
                        <span className="text-sm font-black text-white">{label}</span>
                      </div>
                      {!day.enabled && (
                        <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                          Cerrado
                        </span>
                      )}
                    </div>

                    {day.enabled && (
                      <div className="mt-4 grid grid-cols-2 gap-3">
                        <Field label="Desde">
                          <AdminInput
                            type="time"
                            value={slot.from}
                            onChange={(event) => updateSlot(key, 0, 'from', event.target.value)}
                          />
                        </Field>
                        <Field label="Hasta">
                          <AdminInput
                            type="time"
                            value={slot.to}
                            onChange={(event) => updateSlot(key, 0, 'to', event.target.value)}
                          />
                        </Field>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </AdminCard>

          <AdminCard>
            <SectionTitle
              icon={Truck}
              title="Logistica y transferencia"
              description="Informacion operativa para checkout y mensajes al cliente."
            />

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2 rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <label className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block text-[11px] font-black uppercase tracking-wide text-slate-500">
                      Ofrecer envios
                    </span>
                    <span className="text-xs text-slate-500">
                      Si esta apagado, se informa solo retiro coordinado.
                    </span>
                  </span>
                  <SwitchControl
                    checked={form.shippingEnabled}
                    onChange={(checked) => updateField('shippingEnabled', checked)}
                    label="Ofrecer envios"
                  />
                </label>
              </div>

              <Field label="Costo de envio">
                <AdminInput
                  type="number"
                  value={form.shippingCost}
                  onChange={(event) => updateField('shippingCost', Number(event.target.value || 0))}
                  min={0}
                />
              </Field>
              <Field label="Envio gratis desde">
                <AdminInput
                  type="number"
                  value={form.freeShippingFrom}
                  onChange={(event) => updateField('freeShippingFrom', Number(event.target.value || 0))}
                  min={0}
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Informacion de envio">
                  <AdminTextarea
                    value={form.shippingInfo}
                    onChange={(event) => updateField('shippingInfo', event.target.value)}
                    rows={3}
                  />
                </Field>
              </div>
              <Field label="Alias">
                <AdminInput
                  value={form.bankAlias}
                  onChange={(event) => updateField('bankAlias', event.target.value)}
                />
              </Field>
              <Field label="CBU / CVU">
                <AdminInput
                  value={form.bankCbu}
                  onChange={(event) => updateField('bankCbu', event.target.value)}
                />
              </Field>
              <Field label="Titular">
                <AdminInput
                  value={form.bankHolder}
                  onChange={(event) => updateField('bankHolder', event.target.value)}
                />
              </Field>
            </div>
          </AdminCard>
        </div>

        <aside className="flex flex-col gap-5">
          <AdminCard>
            <SectionTitle
              icon={ShoppingCart}
              title="Estado de tienda"
              description="Pausa compras sin apagar la web."
            />

            <div className="mt-5 flex flex-col gap-4">
              <label className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                <span className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-black uppercase tracking-wide text-slate-500">
                    Tienda activa
                  </span>
                  <SwitchControl
                    checked={form.storeEnabled}
                    onChange={(checked) => updateField('storeEnabled', checked)}
                    label="Tienda activa"
                  />
                </span>
                <span className="mt-1 block text-xs text-slate-500">
                  Cuando esta apagada, no se puede agregar al carrito.
                </span>
              </label>

              <Field label="Mensaje de mantenimiento">
                <AdminTextarea
                  value={form.maintenanceMessage}
                  onChange={(event) => updateField('maintenanceMessage', event.target.value)}
                  rows={4}
                />
              </Field>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white">
              <MessageCircle size={16} className="text-pink-300" />
              Vista rapida
            </div>
            <dl className="mt-4 space-y-3 text-xs">
              <div>
                <dt className="font-black uppercase tracking-wide text-slate-500">WhatsApp</dt>
                <dd className="mt-0.5 font-semibold text-slate-200">
                  {form.whatsapp || 'Sin cargar'}
                </dd>
              </div>
              <div>
                <dt className="font-black uppercase tracking-wide text-slate-500">Email</dt>
                <dd className="mt-0.5 font-semibold text-slate-200">
                  {form.contactEmail || 'Sin cargar'}
                </dd>
              </div>
              <div>
                <dt className="font-black uppercase tracking-wide text-slate-500">Estado</dt>
                <dd className="mt-0.5 font-semibold text-slate-200">
                  {form.storeEnabled ? 'Tienda activa' : 'Tienda pausada'}
                </dd>
              </div>
            </dl>
          </AdminCard>

          <section className="rounded-xl border border-pink-500/25 bg-pink-500/[0.06] p-4 text-xs font-medium leading-relaxed text-pink-100">
            <Mail size={16} className="mb-2 text-pink-300" />
            Estos datos se consumen en tiempo real en contacto, footer, WhatsApp y estado de tienda.
          </section>

          <AdminCard>
            <div className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-white">
              <LinkIcon size={16} className="text-pink-300" />
              Documento
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Firestore:{' '}
              <code className="rounded bg-white/[0.04] px-1.5 py-0.5 text-pink-200">
                settings/store
              </code>
            </p>
            <Landmark size={16} className="mt-4 text-pink-300" />
          </AdminCard>
        </aside>
      </div>
    </AdminPage>
  );
};

export default AdminSettings;
