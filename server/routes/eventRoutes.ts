import { Router, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/authMiddleware';
import { supabase, localDb } from '../config/supabase';

const router = Router();

// EVENT ENDPOINTS
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    if (supabase) {
      const { data, error } = await supabase.from('events').select('*').eq('owner_id', ownerUid);
      if (!error && data) {
        res.json({ success: true, events: data });
        return;
      }
    }
    const events = await localDb.getEventsByOwner(ownerUid);
    res.json({ success: true, events });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch events', details: err.message });
  }
});

router.post('/', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { name, eventType, description, startDate, locationName, totalBudget } = req.body;

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
          description: description || '',
          start_date: startDate,
          location_name: locationName || '',
          total_budget: totalBudget || 0,
          status: 'planning',
          completion_percentage: 0,
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ success: true, event: data });
        return;
      }
    }

    const newEvent = await localDb.createEvent({
      owner_id: ownerUid,
      name,
      event_type: eventType || 'wedding',
      description: description || '',
      start_date: startDate,
      location_name: locationName || '',
      total_budget: totalBudget || 0,
      status: 'planning',
      completion_percentage: 0,
    });

    res.status(201).json({ success: true, event: newEvent });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
});

router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;

    if (supabase) {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).eq('owner_id', ownerUid).single();
      if (!error && data) {
        res.json({ success: true, event: data });
        return;
      }
    }

    const event = await localDb.getEventById(id, ownerUid);
    if (!event) {
      res.status(404).json({ error: 'Event not found or access forbidden' });
      return;
    }
    res.json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch event', details: err.message });
  }
});

router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;
    const updates = req.body;

    // Prevent system id override
    delete updates.id;
    delete updates.owner_id;

    if (supabase) {
      const { data, error } = await supabase.from('events').update(updates).eq('id', id).eq('owner_id', ownerUid).select().single();
      if (!error && data) {
        res.json({ success: true, event: data });
        return;
      }
    }

    const updated = await localDb.updateEvent(id, ownerUid, updates);
    if (!updated) {
      res.status(404).json({ error: 'Event not found or unauthorized' });
      return;
    }
    res.json({ success: true, event: updated });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update event', details: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;

    if (supabase) {
      const { error } = await supabase.from('events').delete().eq('id', id).eq('owner_id', ownerUid);
      if (!error) {
        res.json({ success: true, message: 'Event deleted successfully' });
        return;
      }
    }

    const deleted = await localDb.deleteEvent(id, ownerUid);
    if (!deleted) {
      res.status(404).json({ error: 'Event not found or unauthorized' });
      return;
    }
    res.json({ success: true, message: 'Event deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete event', details: err.message });
  }
});

// TASK ENDPOINTS
router.get('/:id/tasks', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;

    if (supabase) {
      const { data, error } = await supabase.from('event_tasks').select('*').eq('event_id', id).eq('owner_id', ownerUid);
      if (!error && data) {
        res.json({ success: true, tasks: data });
        return;
      }
    }

    const tasks = await localDb.getTasksByEvent(id, ownerUid);
    res.json({ success: true, tasks });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
});

router.post('/:id/tasks', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;
    const { taskName, description, assignedTo, deadline, priority } = req.body;

    if (!taskName) {
      res.status(400).json({ error: 'Task name is required' });
      return;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('event_tasks')
        .insert({
          event_id: id,
          owner_id: ownerUid,
          task_name: taskName,
          description: description || '',
          assigned_to: assignedTo || '',
          deadline: deadline || null,
          status: 'pending',
          priority: priority || 'medium',
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ success: true, task: data });
        return;
      }
    }

    const task = await localDb.createTask({
      event_id: id,
      owner_id: ownerUid,
      task_name: taskName,
      description: description || '',
      assigned_to: assignedTo || '',
      deadline: deadline || undefined,
      status: 'pending',
      priority: priority || 'medium',
    });

    res.status(201).json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
});

router.put('/:id/tasks/:taskId', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { taskId } = req.params;
    const updates = req.body;

    if (supabase) {
      const { data, error } = await supabase.from('event_tasks').update(updates).eq('id', taskId).eq('owner_id', ownerUid).select().single();
      if (!error && data) {
        res.json({ success: true, task: data });
        return;
      }
    }

    const task = await localDb.updateTask(taskId, ownerUid, updates);
    if (!task) {
      res.status(404).json({ error: 'Task not found or unauthorized' });
      return;
    }
    res.json({ success: true, task });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
});

// BUDGET ENDPOINTS
router.get('/:id/budgets', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;

    if (supabase) {
      const { data, error } = await supabase.from('event_budgets').select('*').eq('event_id', id).eq('owner_id', ownerUid);
      if (!error && data) {
        res.json({ success: true, budgets: data });
        return;
      }
    }

    const budgets = await localDb.getBudgetsByEvent(id, ownerUid);
    res.json({ success: true, budgets });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch budgets', details: err.message });
  }
});

router.post('/:id/budgets', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;
    const { category, plannedAmount, actualAmount, paymentStatus, notes } = req.body;

    if (!category) {
      res.status(400).json({ error: 'Budget category is required' });
      return;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('event_budgets')
        .insert({
          event_id: id,
          owner_id: ownerUid,
          category,
          planned_amount: plannedAmount || 0,
          actual_amount: actualAmount || 0,
          payment_status: paymentStatus || 'unpaid',
          notes: notes || '',
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ success: true, budget: data });
        return;
      }
    }

    const budget = await localDb.createBudget({
      event_id: id,
      owner_id: ownerUid,
      category,
      planned_amount: plannedAmount || 0,
      actual_amount: actualAmount || 0,
      payment_status: paymentStatus || 'unpaid',
      notes: notes || '',
    });

    res.status(201).json({ success: true, budget });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create budget item', details: err.message });
  }
});

// GUEST ENDPOINTS
router.get('/:id/guests', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;

    if (supabase) {
      const { data, error } = await supabase.from('event_guests').select('*').eq('event_id', id).eq('owner_id', ownerUid);
      if (!error && data) {
        res.json({ success: true, guests: data });
        return;
      }
    }

    const guests = await localDb.getGuestsByEvent(id, ownerUid);
    res.json({ success: true, guests });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch guests', details: err.message });
  }
});

router.post('/:id/guests', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerUid = req.user!.uid;
    const { id } = req.params;
    const { guestName, email, rsvpStatus, plusOnes, dietaryNotes } = req.body;

    if (!guestName) {
      res.status(400).json({ error: 'Guest name is required' });
      return;
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('event_guests')
        .insert({
          event_id: id,
          owner_id: ownerUid,
          guest_name: guestName,
          email: email || '',
          invitation_status: 'sent',
          rsvp_status: rsvpStatus || 'pending',
          plus_ones: plusOnes || 0,
          dietary_notes: dietaryNotes || '',
        })
        .select()
        .single();

      if (!error && data) {
        res.status(201).json({ success: true, guest: data });
        return;
      }
    }

    const guest = await localDb.createGuest({
      event_id: id,
      owner_id: ownerUid,
      guest_name: guestName,
      email: email || '',
      invitation_status: 'sent',
      rsvp_status: rsvpStatus || 'pending',
      plus_ones: plusOnes || 0,
      dietary_notes: dietaryNotes || '',
    });

    res.status(201).json({ success: true, guest });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create guest', details: err.message });
  }
});

export default router;
