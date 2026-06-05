import type { Timestamp } from 'firebase/firestore';

export type WeekdayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface TimeSlot {
  from: string;
  to: string;
}

export interface DayAvailability {
  enabled: boolean;
  slots: TimeSlot[];
}

export type WeeklyAvailability = Record<WeekdayKey, DayAvailability>;

export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  whatsapp: string;
  whatsappMessage: string;
  address: string;
  instagramUrl: string;
  pedidosYaUrl: string;
  mapEmbedUrl: string;
  weeklyAvailability: WeeklyAvailability;
  shippingEnabled: boolean;
  shippingInfo: string;
  shippingCost: number;
  freeShippingFrom: number;
  storeEnabled: boolean;
  maintenanceMessage: string;
  bankAlias: string;
  bankCbu: string;
  bankHolder: string;
  updatedAt?: Timestamp;
}

export type StoreSettingsInput = Omit<StoreSettings, 'updatedAt'>;
