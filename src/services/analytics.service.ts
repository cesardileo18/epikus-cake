// src/services/analytics.service.ts
// Centraliza todas las llamadas a Firestore relacionadas con /visits
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface Visit {
  visitDate: string;
  userAgent: string;
  platform: string;
  referrer: string | null;
  createdAt: any;
}

/**
 * Obtiene todas las visitas registradas (una vez).
 * Usado en: AnalyticsDashboard
 */
export async function getAllVisits(): Promise<Visit[]> {
  const snap = await getDocs(collection(db, 'visits'));
  return snap.docs.map(d => d.data() as Visit);
}
