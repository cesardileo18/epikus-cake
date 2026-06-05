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

const inputClass =
  'h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100';

const textareaClass =
  'w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-pink-400 focus:ring-2 focus:ring-pink-100';

const WEEKDAYS: Array<{ key: WeekdayKey; label: string }> = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miercoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sabado' },
  { key: 'sunday', label: 'Domingo' },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-black uppercase tracking-wide text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Settings;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-pink-100 text-pink-600">
        <Icon size={18} />
      </div>
      <div>
        <h2 className="text-sm font-black uppercase tracking-wide text-slate-900">
          {title}
        </h2>
        <p className="mt-0.5 text-xs font-medium leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function SwitchControl({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={[
        'relative h-7 w-12 shrink-0 rounded-full border transition-colors',
        checked ? 'border-pink-500 bg-pink-500' : 'border-slate-300 bg-slate-300',
      ].join(' ')}
    >
      <span
        className={[
          'absolute left-1 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

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
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-700">
        Cargando configuracion...
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] rounded-xl border border-white/10 bg-slate-50 px-4 py-6 text-slate-900">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-pink-700">
              <Settings size={14} />
              Administracion
            </div>
            <h1 className="text-3xl font-bold text-slate-950">Configuracion</h1>
            <p className="mt-1 text-sm text-slate-500">
              Datos generales, horarios, contacto y comportamiento de la tienda.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-pink-600 px-4 text-sm font-bold text-white transition hover:bg-pink-700 disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Guardando...' : 'Guardar configuracion'}
          </button>
        </section>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex flex-col gap-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                icon={MapPin}
                title="Datos del negocio"
                description="Informacion usada en contacto, footer, WhatsApp y checkout."
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <Field label="Nombre de la tienda">
                  <input
                    value={form.storeName}
                    onChange={(event) => updateField('storeName', event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Email de contacto">
                  <input
                    type="email"
                    value={form.contactEmail}
                    onChange={(event) => updateField('contactEmail', event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="WhatsApp">
                  <input
                    value={form.whatsapp}
                    onChange={(event) => updateField('whatsapp', event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Direccion / retiro">
                  <input
                    value={form.address}
                    onChange={(event) => updateField('address', event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Instagram">
                  <input
                    type="url"
                    value={form.instagramUrl}
                    onChange={(event) => updateField('instagramUrl', event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="PedidosYa">
                  <input
                    type="url"
                    value={form.pedidosYaUrl}
                    onChange={(event) => updateField('pedidosYaUrl', event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Mensaje predeterminado de WhatsApp">
                    <input
                      value={form.whatsappMessage}
                      onChange={(event) => updateField('whatsappMessage', event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="md:col-span-2">
                  <Field label="URL embed de mapa">
                    <textarea
                      value={form.mapEmbedUrl}
                      onChange={(event) => updateField('mapEmbedUrl', event.target.value)}
                      className={textareaClass}
                      rows={3}
                    />
                  </Field>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
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
                    <article key={key} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <SwitchControl
                            checked={day.enabled}
                            onChange={(checked) => updateDayEnabled(key, checked)}
                            label={`${day.enabled ? 'Cerrar' : 'Abrir'} ${label}`}
                          />
                          <span className="text-sm font-bold text-slate-900">{label}</span>
                        </div>
                        {!day.enabled && (
                          <span className="text-xs font-bold uppercase text-slate-400">
                            Cerrado
                          </span>
                        )}
                      </div>

                      {day.enabled && (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <Field label="Desde">
                            <input
                              type="time"
                              value={slot.from}
                              onChange={(event) => updateSlot(key, 0, 'from', event.target.value)}
                              className={inputClass}
                            />
                          </Field>
                          <Field label="Hasta">
                            <input
                              type="time"
                              value={slot.to}
                              onChange={(event) => updateSlot(key, 0, 'to', event.target.value)}
                              className={inputClass}
                            />
                          </Field>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                icon={Truck}
                title="Logistica y transferencia"
                description="Informacion operativa para checkout y mensajes al cliente."
              />

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
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
                  <input
                    type="number"
                    value={form.shippingCost}
                    onChange={(event) => updateField('shippingCost', Number(event.target.value || 0))}
                    className={inputClass}
                  />
                </Field>
                <Field label="Envio gratis desde">
                  <input
                    type="number"
                    value={form.freeShippingFrom}
                    onChange={(event) => updateField('freeShippingFrom', Number(event.target.value || 0))}
                    className={inputClass}
                  />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Informacion de envio">
                    <textarea
                      value={form.shippingInfo}
                      onChange={(event) => updateField('shippingInfo', event.target.value)}
                      className={textareaClass}
                      rows={3}
                    />
                  </Field>
                </div>
                <Field label="Alias">
                  <input
                    value={form.bankAlias}
                    onChange={(event) => updateField('bankAlias', event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="CBU / CVU">
                  <input
                    value={form.bankCbu}
                    onChange={(event) => updateField('bankCbu', event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Titular">
                  <input
                    value={form.bankHolder}
                    onChange={(event) => updateField('bankHolder', event.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-5">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <SectionTitle
                icon={ShoppingCart}
                title="Estado de tienda"
                description="Pausa compras sin apagar la web."
              />

              <div className="mt-5 flex flex-col gap-4">
                <label className="rounded-lg border border-slate-200 bg-slate-50 p-4">
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
                  <textarea
                    value={form.maintenanceMessage}
                    onChange={(event) => updateField('maintenanceMessage', event.target.value)}
                    className={textareaClass}
                    rows={4}
                  />
                </Field>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <MessageCircle size={16} className="text-pink-600" />
                Vista rapida
              </div>
              <dl className="mt-4 space-y-3 text-xs">
                <div>
                  <dt className="font-black uppercase tracking-wide text-slate-400">WhatsApp</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700">
                    {form.whatsapp || 'Sin cargar'}
                  </dd>
                </div>
                <div>
                  <dt className="font-black uppercase tracking-wide text-slate-400">Email</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700">
                    {form.contactEmail || 'Sin cargar'}
                  </dd>
                </div>
                <div>
                  <dt className="font-black uppercase tracking-wide text-slate-400">Estado</dt>
                  <dd className="mt-0.5 font-semibold text-slate-700">
                    {form.storeEnabled ? 'Tienda activa' : 'Tienda pausada'}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="rounded-lg border border-pink-200 bg-pink-50 p-4 text-xs font-medium leading-relaxed text-pink-900">
              <Mail size={16} className="mb-2 text-pink-600" />
              Estos datos se consumen en tiempo real en contacto, footer, WhatsApp y estado de tienda.
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-black text-slate-900">
                <LinkIcon size={16} className="text-pink-600" />
                Documento
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Firestore: <code>settings/store</code>
              </p>
              <Landmark size={16} className="mt-4 text-pink-600" />
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
