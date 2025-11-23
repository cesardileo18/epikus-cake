// src/hooks/useFavorites.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthProvider";
import { db } from "@/config/firebase";
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

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
          const userFavsCol = collection(db, "users", currentUid, "favorites");

          // migramos de forma simple (uno por uno)
          localFavs.forEach(async (productId) => {
            const favDoc = doc(userFavsCol, productId);
            try {
              await setDoc(
                favDoc,
                {
                  productId,
                  createdAt: serverTimestamp(),
                },
                { merge: true }
              );
            } catch (err) {
              console.error("Error migrando favorito", productId, err);
            }
          });

          // limpiar localStorage después de migrar
          writeLocalFavorites([]);
        }
      }

      // 🟣 2) Escuchar favoritos de Firestore en tiempo real
      const favsCol = collection(db, "users", currentUid, "favorites");
      unsubscribe = onSnapshot(
        favsCol,
        (snap) => {
          const ids = snap.docs.map((d) => d.id);
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
      const favDocRef = doc(db, "users", currentUid, "favorites", productId);
      const alreadyFav = favorites.includes(productId);

      try {
        if (alreadyFav) {
          await deleteDoc(favDocRef);
        } else {
          await setDoc(favDocRef, {
            productId,
            createdAt: serverTimestamp(),
          });
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
