import crypto from 'node:crypto';

const getSessionSecret = (): string => {
  const secret = process.env.SESSION_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!secret || secret.length < 16) {
      throw new Error(
        'SECURITY CRITICAL ERROR: SESSION_SECRET must be explicitly defined with at least 16 characters in production environments.'
      );
    }
    return secret;
  }
  return secret || 'planora_secure_hmac_session_secret_key_2026_v1';
};

export interface SessionPayload {
  uid: string;
  email: string;
  name?: string;
  iat: number;
  exp: number;
}

export function issueSessionToken(uid: string, email: string, name?: string, expiresInSeconds = 86400): string {
  if (!uid || typeof uid !== 'string') {
    throw new Error('Cannot issue session token without valid uid');
  }

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresInSeconds;
  const payload: SessionPayload = {
    uid,
    email: email || `${uid}@example.com`,
    name: name || 'Planora Member',
    iat,
    exp,
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr, 'utf8').toString('base64url');

  const hmac = crypto.createHmac('sha256', getSessionSecret());
  hmac.update(payloadB64);
  const signature = hmac.digest('hex');

  return `planora_v1.${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string): { uid: string; email: string; name: string } {
  if (!token || typeof token !== 'string') {
    throw new Error('Invalid or unverified authentication token');
  }

  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'planora_v1') {
    throw new Error('Invalid or unverified authentication token');
  }

  const [, payloadB64, signature] = parts;

  // Re-compute HMAC signature
  const hmac = crypto.createHmac('sha256', getSessionSecret());
  hmac.update(payloadB64);
  const expectedSignature = hmac.digest('hex');

  const sigBuf = Buffer.from(signature, 'utf8');
  const expectedBuf = Buffer.from(expectedSignature, 'utf8');

  if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
    throw new Error('Invalid or unverified authentication token: signature verification failed');
  }

  // Parse payload
  let payload: SessionPayload;
  try {
    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf8');
    payload = JSON.parse(payloadStr);
  } catch {
    throw new Error('Invalid or unverified authentication token: malformed payload');
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (!payload.exp || payload.exp < now) {
    throw new Error('Invalid or unverified authentication token: token expired');
  }

  if (!payload.uid) {
    throw new Error('Invalid or unverified authentication token: missing uid');
  }

  return {
    uid: payload.uid,
    email: payload.email || `${payload.uid}@example.com`,
    name: payload.name || 'Planora Member',
  };
}
