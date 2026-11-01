import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  generateGoogleOAuthUrl,
  processOAuthCallback,
  syncEventToGoogleCalendar,
} from '../services/calendarService';
import { localDb, supabase } from '../config/supabase';

const router = Router();

// GET /api/calendar/connect - Initiate Google Calendar OAuth
router.get('/connect', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  try {
    const userId = req.user!.uid;
    const redirectUri = `${req.protocol}://${req.get('host')}/api/calendar/callback`;
    const url = generateGoogleOAuthUrl(userId, redirectUri);
    res.json({ success: true, url });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate OAuth URL', details: err.message });
  }
});

// GET /api/calendar/callback - Handle OAuth redirect
router.get('/callback', async (req, res): Promise<void> => {
  try {
    const { code, state } = req.query;
    if (!code || typeof code !== 'string') {
      res.status(400).send('OAuth callback error: missing authorization code.');
      return;
    }

    let userId = 'demo_user';
    if (state && typeof state === 'string') {
      try {
        const parsed = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        if (parsed.userId) userId = parsed.userId;
      } catch {
        // ignore
      }
    }

    await processOAuthCallback(code, userId);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Google Calendar Connected — Planora AI</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 40px; background: #FBF7EF; color: #171412;">
          <h2 style="color: #7A3D19;">Google Calendar Successfully Connected!</h2>
          <p>Your Planora AI events will now sync seamlessly with your Google Calendar.</p>
          <script>
            setTimeout(function() {
              if (window.opener) {
                window.opener.postMessage({ type: 'GCAL_CONNECTED' }, '*');
                window.close();
              } else {
                window.location.href = '/?route=my-events';
              }
            }, 1500);
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`OAuth processing error: ${err.message}`);
  }
});

// GET /api/calendar/status - Get current connection status
router.get('/status', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    let conn = null;
    if (supabase) {
      const { data } = await supabase.from('google_calendar_connections').select('*').eq('user_id', userId).single();
      conn = data;
    } else {
      conn = await localDb.getCalendarConnection(userId);
    }

    res.json({
      isConnected: Boolean(conn && conn.connection_status === 'connected'),
      connection: conn ? { googleAccountId: conn.google_account_id, lastSyncedAt: conn.last_synced_at } : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch calendar status', details: err.message });
  }
});

// POST /api/calendar/sync - Sync specific event to Google Calendar
router.post('/sync', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    const { eventId } = req.body;

    if (!eventId) {
      res.status(400).json({ error: 'eventId is required' });
      return;
    }

    const event = await localDb.getEventById(eventId, userId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    const syncResult = await syncEventToGoogleCalendar(userId, event);
    res.json({ success: true, synced: syncResult.synced, gcalEventId: syncResult.gcalEventId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to sync event to Google Calendar', details: err.message });
  }
});

// POST /api/calendar/disconnect - Disconnect Google Calendar
router.post('/disconnect', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;
    if (supabase) {
      await supabase.from('google_calendar_connections').delete().eq('user_id', userId);
    }
    await localDb.removeCalendarConnection(userId);
    res.json({ success: true, message: 'Google Calendar disconnected successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to disconnect calendar', details: err.message });
  }
});

export default router;
