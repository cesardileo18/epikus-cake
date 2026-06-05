import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/config/firebase';
import type {
  StoreSettings,
  StoreSettingsInput,
  WeeklyAvailability,
} from '@/interfaces/settings';

const SETTINGS_COLLECTION = 'settings';
const STORE_SETTINGS_DOC = 'store';

const defaultWeeklyAvailability: WeeklyAvailability = {
  monday: { enabled: true, slots: [{ from: '09:00', to: '20:00' }] },
  tuesday: { enabled: true, slots: [{ from: '09:00', to: '20:00' }] },
  wednesday: { enabled: true, slots: [{ from: '09:00', to: '20:00' }] },
  thursday: { enabled: true, slots: [{ from: '09:00', to: '20:00' }] },
  friday: { enabled: true, slots: [{ from: '09:00', to: '20:00' }] },
  saturday: { enabled: true, slots: [{ from: '09:00', to: '19:00' }] },
  sunday: { enabled: true, slots: [{ from: '09:00', to: '19:00' }] },
};

export const DEFAULT_STORE_SETTINGS: StoreSettingsInput = {
  storeName: 'Epikus Cake',
  contactEmail: 'epikus.cake@gmail.com',
  whatsapp: '5491158651170',
  whatsappMessage: 'Hola Epikus Cake, me gustaria hacer un pedido.',
  address: 'Humberto 1ro 2076, CABA',
  instagramUrl: 'https://www.instagram.com/epikuscake',
  pedidosYaUrl:
    'https://www.pedidosya.com.ar/restaurantes/buenos-aires/epikuscake-3a2a8180-a027-4a0d-a981-04efdf2d04c4-menu?origin=shop_list',
  mapEmbedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3283.2958257442715!2d-58.397826490663086!3d-34.62196385834573!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccb1fe53395eb%3A0xf53cd2994461d0ac!2sHumberto%201%C2%BA%202076%2C%20C1229AAF%20Cdad.%20Aut%C3%B3noma%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1756591967869!5m2!1ses!2sar',
  weeklyAvailability: defaultWeeklyAvailability,
  shippingEnabled: true,
  shippingInfo: 'Envios por mensajeria a cargo del cliente. Retiro coordinado en CABA.',
  shippingCost: 0,
  freeShippingFrom: 0,
  storeEnabled: true,
  maintenanceMessage: '',
  bankAlias: '',
  bankCbu: '',
  bankHolder: '',
};

const settingsRef = () => doc(db, SETTINGS_COLLECTION, STORE_SETTINGS_DOC);

const cleanString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback;

const cleanNumber = (value: unknown, fallback = 0): number => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

function mapWeeklyAvailability(value: unknown): WeeklyAvailability {
  if (!value || typeof value !== 'object') {
    return DEFAULT_STORE_SETTINGS.weeklyAvailability;
  }

  const result: WeeklyAvailability = { ...DEFAULT_STORE_SETTINGS.weeklyAvailability };
  const source = value as Partial<Record<keyof WeeklyAvailability, unknown>>;

  for (const key of Object.keys(result) as Array<keyof WeeklyAvailability>) {
    const day = source[key];
    if (!day || typeof day !== 'object') continue;

    const dayData = day as { enabled?: unknown; slots?: unknown };
    const slots = Array.isArray(dayData.slots)
      ? dayData.slots
          .map((slot) => {
            if (!slot || typeof slot !== 'object') return null;
            const sourceSlot = slot as { from?: unknown; to?: unknown };
            const from = cleanString(sourceSlot.from).trim();
            const to = cleanString(sourceSlot.to).trim();
            return from && to ? { from, to } : null;
          })
          .filter((slot): slot is { from: string; to: string } => Boolean(slot))
          .slice(0, 2)
      : [];

    result[key] = {
      enabled: Boolean(dayData.enabled),
      slots,
    };
  }

  return result;
}

function mapSettings(data: Record<string, unknown>): StoreSettings {
  return {
    ...DEFAULT_STORE_SETTINGS,
    storeName: cleanString(data.storeName, DEFAULT_STORE_SETTINGS.storeName),
    contactEmail: cleanString(data.contactEmail, DEFAULT_STORE_SETTINGS.contactEmail),
    whatsapp: cleanString(data.whatsapp, DEFAULT_STORE_SETTINGS.whatsapp),
    whatsappMessage: cleanString(data.whatsappMessage, DEFAULT_STORE_SETTINGS.whatsappMessage),
    address: cleanString(data.address, DEFAULT_STORE_SETTINGS.address),
    instagramUrl: cleanString(data.instagramUrl, DEFAULT_STORE_SETTINGS.instagramUrl),
    pedidosYaUrl: cleanString(data.pedidosYaUrl, DEFAULT_STORE_SETTINGS.pedidosYaUrl),
    mapEmbedUrl: cleanString(data.mapEmbedUrl, DEFAULT_STORE_SETTINGS.mapEmbedUrl),
    weeklyAvailability: mapWeeklyAvailability(data.weeklyAvailability),
    shippingEnabled: Boolean(data.shippingEnabled ?? DEFAULT_STORE_SETTINGS.shippingEnabled),
    shippingInfo: cleanString(data.shippingInfo, DEFAULT_STORE_SETTINGS.shippingInfo),
    shippingCost: cleanNumber(data.shippingCost),
    freeShippingFrom: cleanNumber(data.freeShippingFrom),
    storeEnabled: Boolean(data.storeEnabled ?? DEFAULT_STORE_SETTINGS.storeEnabled),
    maintenanceMessage: cleanString(data.maintenanceMessage),
    bankAlias: cleanString(data.bankAlias),
    bankCbu: cleanString(data.bankCbu),
    bankHolder: cleanString(data.bankHolder),
    updatedAt: data.updatedAt as StoreSettings['updatedAt'],
  };
}

export async function getStoreSettings(): Promise<StoreSettings> {
  const snap = await getDoc(settingsRef());
  return snap.exists() ? mapSettings(snap.data()) : mapSettings({});
}

export function subscribeToStoreSettings(
  onData: (settings: StoreSettings) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  return onSnapshot(
    settingsRef(),
    (snap) => onData(snap.exists() ? mapSettings(snap.data()) : mapSettings({})),
    (err) => {
      console.error('subscribeToStoreSettings error:', err);
      onError?.(err);
    }
  );
}

export async function saveStoreSettings(input: StoreSettingsInput): Promise<void> {
  await setDoc(
    settingsRef(),
    {
      ...input,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}
