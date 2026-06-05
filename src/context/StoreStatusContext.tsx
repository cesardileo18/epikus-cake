import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { StoreSettings, WeekdayKey, WeeklyAvailability } from '@/interfaces/settings';
import {
  DEFAULT_STORE_SETTINGS,
  subscribeToStoreSettings,
} from '@/services/settings.service';

interface StoreStatusContextValue {
  isStoreOpen: boolean;
  nextOpeningTime: string;
  closedMessage: string | null;
  settings: StoreSettings;
  loadingSettings: boolean;
}

const StoreStatusContext = createContext<StoreStatusContextValue>({
  isStoreOpen: false,
  nextOpeningTime: '',
  closedMessage: null,
  settings: DEFAULT_STORE_SETTINGS,
  loadingSettings: true,
});

const WEEKDAYS: WeekdayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const DAY_LABELS: Record<WeekdayKey, string> = {
  monday: 'lunes',
  tuesday: 'martes',
  wednesday: 'miercoles',
  thursday: 'jueves',
  friday: 'viernes',
  saturday: 'sabado',
  sunday: 'domingo',
};

const toMinutes = (value: string): number | null => {
  const [hours, minutes] = value.split(':').map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
};

const getArgentinaDate = (): Date =>
  new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));

function findNextOpening(availability: WeeklyAvailability, fromDate: Date): string {
  for (let offset = 0; offset < 7; offset += 1) {
    const candidate = new Date(fromDate);
    candidate.setDate(fromDate.getDate() + offset);
    const weekday = WEEKDAYS[candidate.getDay()];
    const day = availability[weekday];
    const firstSlot = day?.enabled ? day.slots.find((slot) => slot.from && slot.to) : null;

    if (!firstSlot) continue;

    const openMinutes = toMinutes(firstSlot.from);
    const currentMinutes = fromDate.getHours() * 60 + fromDate.getMinutes();
    if (openMinutes === null) continue;
    if (offset === 0 && currentMinutes >= openMinutes) continue;

    return offset === 0 ? firstSlot.from : `${DAY_LABELS[weekday]} ${firstSlot.from}`;
  }

  return '';
}

function resolveStoreStatus(settings: StoreSettings) {
  const envFlag = (import.meta.env.VITE_FORCE_STORE_CLOSED ?? '').toString().trim().toLowerCase();
  const customMessage = import.meta.env.VITE_STORE_CLOSED_MESSAGE || '';

  if (envFlag === 'false') {
    return { isStoreOpen: true, nextOpeningTime: '', closedMessage: null };
  }

  if (envFlag === 'true') {
    return {
      isStoreOpen: false,
      nextOpeningTime: '',
      closedMessage: customMessage || 'Tienda cerrada por mantenimiento.',
    };
  }

  if (!settings.storeEnabled) {
    return {
      isStoreOpen: false,
      nextOpeningTime: '',
      closedMessage: settings.maintenanceMessage || 'Tienda cerrada temporalmente.',
    };
  }

  const now = getArgentinaDate();
  const weekday = WEEKDAYS[now.getDay()];
  const day = settings.weeklyAvailability[weekday];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const activeSlot = day?.enabled
    ? day.slots.find((slot) => {
        const from = toMinutes(slot.from);
        const to = toMinutes(slot.to);
        return from !== null && to !== null && currentMinutes >= from && currentMinutes < to;
      })
    : null;

  if (activeSlot) {
    return { isStoreOpen: true, nextOpeningTime: '', closedMessage: null };
  }

  const schedule =
    day?.enabled && day.slots.length
      ? day.slots.map((slot) => `${slot.from} a ${slot.to}`).join(' / ')
      : 'cerrado';

  const nextOpeningTime = findNextOpening(settings.weeklyAvailability, now);

  return {
    isStoreOpen: false,
    nextOpeningTime,
    closedMessage: `Tienda cerrada. Horario ${DAY_LABELS[weekday]}: ${schedule}.`,
  };
}

export const StoreStatusProvider = ({ children }: { children: React.ReactNode }) => {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const unsub = subscribeToStoreSettings(
      (next) => {
        setSettings(next);
        setLoadingSettings(false);
      },
      () => setLoadingSettings(false)
    );

    return unsub;
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((value) => value + 1), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  const status = useMemo(() => resolveStoreStatus(settings), [settings, tick]);

  return (
    <StoreStatusContext.Provider value={{ ...status, settings, loadingSettings }}>
      {children}
    </StoreStatusContext.Provider>
  );
};

export const useStoreStatus = () => useContext(StoreStatusContext);
