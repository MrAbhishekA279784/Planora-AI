import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { supabase, localDb } from '../config/supabase';

export async function getEvents(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const ownerUid = req.user!.uid;

    if (supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('owner_id', ownerUid);

      if (!error && data) {
        res.json({ success: true, events: data });
        return;
      }
    }

    const localEvents = await localDb.getEventsByOwner(ownerUid);
    res.json({ success: true, events: localEvents });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
}

export async function getEventById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Event ID is required' });
      return;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .eq('owner_id', ownerUid)
        .single();

      if (!error && data) {
        res.json({ success: true, event: data });
        return;
      }
    }

    const localEvent = await localDb.getEventById(id, ownerUid);
    if (!localEvent) {
      res.status(404).json({ error: 'Event not found or access forbidden' });
      return;
    }

    res.json({ success: true, event: localEvent });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch event details', details: err.message });
  }
}

export async function createEvent(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const ownerUid = req.user!.uid;
    const { name, eventType, description, startDate, totalBudget } = req.body;

    if (!name || !startDate) {
      res.status(400).json({ error: 'Event name and start date are required' });
      return;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('events')
        .insert({
          owner_id: ownerUid,
          name,
          event_type: eventType || 'wedding',
          description,
          start_date: startDate,
          total_budget: totalBudget || 0,
          status: 'planning',
          completion_percentage: 0,
        })
        .select()
        .single();

      if (!error && data) {
        res.status(21).json({ success: true, event: data });
        return;
      }
    }

    const newLocalEvent = await localDb.createEvent({
      owner_id: ownerUid,
      name,
      event_type: eventType || 'wedding',
      description: description || '',
      start_date: startDate,
      total_budget: totalBudget || 0,
      status: 'planning',
      completion_percentage: 0,
    });

    res.status(201).json({ success: true, event: newLocalEvent });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
}
