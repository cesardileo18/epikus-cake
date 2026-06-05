import { useEffect, useState } from 'react';
import { subscribeToStoreSettings } from '@/services/settings.service';
import type { StoreSettings } from '@/interfaces/settings';

interface UseStoreSettingsResult {
  settings: StoreSettings | null;
  loading: boolean;
  error: unknown;
}

export function useStoreSettings(): UseStoreSettingsResult {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    const unsub = subscribeToStoreSettings(
      (next) => {
        setSettings(next);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  return { settings, loading, error };
}
