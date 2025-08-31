// src/auth.ts
import { auth, db } from '@/config/firebase';
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  type User,
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';

export type Role = 'admin' | 'customer' | 'viewer';

const provider = new GoogleAuthProvider();
// fuerza selector de cuenta si ya hay sesión
provider.setCustomParameters({ prompt: 'select_account' });

async function ensureUserDoc(user: User) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);

  // info que se puede refrescar en cada login
  const base = {
    email: user.email ?? null,
    username: user.displayName ?? null,
    providerIds: user.providerData.map(p => p?.providerId).filter(Boolean),
    lastLogin: serverTimestamp(),
  };

  if (!snap.exists()) {
    // crear perfil inicial (NO pisa el role luego)
    await setDoc(ref, {
      ...base,
      role: 'customer' as Role,
      createdAt: serverTimestamp(),
    });
  } else {
    // actualizar sin tocar role/createdAt
    await updateDoc(ref, base);
  }
}

/** Google */
export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, provider);
  await ensureUserDoc(cred.user);
  return cred.user;
}

/** Email link: enviar */
export async function sendEmailLink(email: string, redirectTo: string = '/') {
  const url = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
  await sendSignInLinkToEmail(auth, email, { url, handleCodeInApp: true });
  // usa localStorage para evitar el prompt y sobrevivir a refresh
  localStorage.setItem('emailForSignIn', email);
}

/** Email link: completar */
export async function completeEmailLinkSignIn(providedEmail?: string) {
  if (!isSignInWithEmailLink(auth, window.location.href)) return null;

  const email = providedEmail || localStorage.getItem('emailForSignIn') || '';
  if (!email) return { needsEmail: true as const }; // muestra input en /auth/callback

  const result = await signInWithEmailLink(auth, email, window.location.href);
  localStorage.removeItem('emailForSignIn');

  await ensureUserDoc(result.user);

  const url = new URL(window.location.href);
  const redirect = url.searchParams.get('redirect') || '/';
  return { user: result.user, redirect };
}

export const signOut = () => auth.signOut();
