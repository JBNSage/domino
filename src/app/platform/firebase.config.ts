import type { FirebaseOptions } from 'firebase/app';

/**
 * The Firebase project's web configuration, from the Firebase console
 * (Configuración del proyecto → Tus apps → Web). It is public by design: what
 * protects the data is `firestore.rules`. Set to null, mesas cannot be
 * shared and the app works as before.
 */
export const firebaseConfig: FirebaseOptions | null = {
  apiKey: 'AIzaSyBf3adsipIcmR7myLIICNZ_gvmVpozEDTQ',
  authDomain: 'domino-e234a.firebaseapp.com',
  projectId: 'domino-e234a',
  storageBucket: 'domino-e234a.firebasestorage.app',
  messagingSenderId: '530132374513',
  appId: '1:530132374513:web:5b8bf49c1457e083c1aa50',
};
