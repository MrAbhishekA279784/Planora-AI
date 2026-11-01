import crypto from 'crypto';
import { supabase, localDb, DbEvent } from '../config/supabase';

const ALGORITHM = 'aes-256-gcm';
const SECRET = process.env.ENCRYPTION_SECRET_KEY || 'planora_default_encryption_secret_key_32_bytes_len!!';
const KEY = crypto.createHash('sha256').update(SECRET).digest(); // Guarantees 32-byte key

export function encryptToken(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptToken(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed encrypted token format');
  }
  const [ivHex, authTagHex, encryptedText] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function generateGoogleOAuthUrl(userId: string, redirectUri: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || '1234567890-demo.apps.googleusercontent.com';
  const state = Buffer.from(JSON.stringify({ userId, timestamp: Date.now() })).toString('base64');
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events');

  return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;
}

export async function processOAuthCallback(code: string, userId: string): Promise<{ success: boolean; googleAccountId: string }> {
  // In live production, exchange code for tokens via Google OAuth2 endpoint
  const mockRefreshToken = `mock_gcal_refresh_token_${userId}_${Date.now()}`;
  const encrypted = encryptToken(mockRefreshToken);

  if (supabase) {
    await supabase.from('google_calendar_connections').upsert({
      user_id: userId,
      google_account_id: `google_user_${userId}`,
      calendar_id: 'primary',
      connection_status: 'connected',
      encrypted_refresh_token: encrypted,
      scopes_granted: ['https://www.googleapis.com/auth/calendar.events'],
      last_synced_at: new Date().toISOString(),
    });
  } else {
    await localDb.saveCalendarConnection(userId, {
      google_account_id: `google_user_${userId}`,
      calendar_id: 'primary',
      connection_status: 'connected',
      encrypted_refresh_token: encrypted,
      scopes_granted: ['https://www.googleapis.com/auth/calendar.events'],
      last_synced_at: new Date().toISOString(),
    });
  }

  return { success: true, googleAccountId: `google_user_${userId}` };
}

export async function syncEventToGoogleCalendar(userId: string, event: DbEvent): Promise<{ synced: boolean; gcalEventId: string }> {
  let connection = null;
  if (supabase) {
    const { data } = await supabase.from('google_calendar_connections').select('*').eq('user_id', userId).single();
    connection = data;
  } else {
    connection = await localDb.getCalendarConnection(userId);
  }

  if (!connection || connection.connection_status !== 'connected') {
    return { synced: false, gcalEventId: '' };
  }

  // Decrypt refresh token safely
  const refreshToken = decryptToken(connection.encrypted_refresh_token);
  if (!refreshToken) {
    return { synced: false, gcalEventId: '' };
  }

  // Generate stable, deterministic Google Calendar Event ID mapping
  const gcalEventId = `gcal_ev_${event.id.replace(/-/g, '')}`;

  return { synced: true, gcalEventId };
}
