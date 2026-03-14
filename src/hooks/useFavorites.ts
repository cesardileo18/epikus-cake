// src/hooks/useFavorites.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import {
  subscribeToFavorites,
  addFavorite,
  removeFavorite,
  migrateFavoritesToFirestore,
} from "@/services/favorites.service";

const LOCAL_STORAGE_KEY = "epikus_favorites";

function readLocalFavorites(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string");
  } catch {
    return [];
  }
}

function writeLocalFavorites(favs: string[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favs));
  } catch {
    // no hacemos nada si falla
  }
}

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // para detectar login (transición de invitado → logueado)
  const prevUidRef = useRef<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const currentUid = user?.uid ?? null;

    // 👇 Detectar transición de invitado → usuario logueado
    const prevUid = prevUidRef.current;
    const justLoggedIn = !prevUid && currentUid;

    // guardamos uid actual para la próxima vez
    prevUidRef.current = currentUid;

    if (currentUid) {
      // 🟣 1) Si se acaba de loguear, migramos favoritos de localStorage → Firestore
      if (justLoggedIn) {
        const localFavs = readLocalFavorites();
        if (localFavs.length > 0) {
          migrateFavoritesToFirestore(currentUid, localFavs);
          writeLocalFavorites([]);
        }
      }

      // 🟣 2) Escuchar favoritos de Firestore en tiempo real
      unsubscribe = subscribeToFavorites(
        currentUid,
        (ids) => {
          setFavorites(ids);
          setLoading(false);
        },
        (err) => {
          console.error("Error leyendo favoritos:", err);
          setFavorites([]);
          setLoading(false);
        }
      );
    } else {
      // 🟢 Modo invitado: usamos localStorage
      const localFavs = readLocalFavorites();
      setFavorites(localFavs);
      setLoading(false);

      if (unsubscribe) {
        unsubscribe();
      }
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const isFavorite = useCallback(
    (productId: string): boolean => {
      return favorites.includes(productId);
    },
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (productId: string): Promise<void> => {
      const currentUid = user?.uid;

      // 🟢 Modo invitado → localStorage
      if (!currentUid) {
        setFavorites((prev) => {
          const exists = prev.includes(productId);
          const next = exists
            ? prev.filter((id) => id !== productId)
            : [...prev, productId];

          writeLocalFavorites(next);
          return next;
        });
        return;
      }

      // 🟣 Modo logueado → Firestore
      const alreadyFav = favorites.includes(productId);
      try {
        if (alreadyFav) {
          await removeFavorite(currentUid, productId);
        } else {
          await addFavorite(currentUid, productId);
        }
      } catch (err) {
        console.error("Error al actualizar favorito:", err);
      }
    },
    [user, favorites]
  );

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
  };
};
