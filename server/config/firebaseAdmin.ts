import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let firebaseAdminApp: App | null = null;

try {
  const existingApps = getApps();
  if (!existingApps.length) {
    const serviceAccountVar = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (serviceAccountVar) {
      const serviceAccount = JSON.parse(serviceAccountVar);
      firebaseAdminApp = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      firebaseAdminApp = initializeApp();
    }
  } else {
    firebaseAdminApp = existingApps[0]!;
  }
} catch (err) {
  console.warn('Firebase Admin SDK Notice: Running without live credentials. Token verification will fall back to secure token structure inspection if unconfigured.');
}

import { verifySessionToken } from './sessionToken';

export async function verifyFirebaseIdToken(token: string): Promise<{ uid: string; email?: string; name?: string }> {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid or unverified authentication token');
  }

  // 1. Attempt live Firebase Admin SDK token verification if configured
  if (firebaseAdminApp) {
    try {
      const auth = getAuth(firebaseAdminApp);
      const decoded = await auth.verifyIdToken(token);
      return {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name || (decoded.email ? decoded.email.split('@')[0] : 'Planora Member'),
      };
    } catch (err) {
      // If live Firebase Admin fails, attempt verified HMAC session token check
    }
  }

  // 2. Cryptographically signed HMAC session token verification (planora_v1.<payload>.<signature>)
  if (token.startsWith('planora_v1.')) {
    return verifySessionToken(token);
  }

  // Reject any unverified, unsigned, or forged token
  throw new Error('Invalid or unverified authentication token');
}

export default firebaseAdminApp;
