import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { supabase, isSupabaseConfigured } from '../config/database';

const router = Router();

interface Notification {
  id: number;
  userId: number;
  fromUserId: number;
  fromUsername: string;
  fromName: string;
  type: 'journey_start' | 'journey_end' | 'sos_alert' | 'message';
  message: string;
  location?: { lat: number; lng: number };
  timestamp: string;
  read: boolean;
}

const notifications: Notification[] = [];
let notificationIdCounter = 1;

// Get all notifications for current user
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured()) {
      const { data: userNotifications } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', req.user!.userId)
        .order('timestamp', { ascending: false });

      const formatted = (userNotifications || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id,
        fromUserId: n.from_user_id,
        fromUsername: n.from_username,
        fromName: n.from_name,
        type: n.type,
        message: n.message,
        location: n.location_lat ? { lat: n.location_lat, lng: n.location_lng } : undefined,
        timestamp: n.timestamp,
        read: n.read
      }));

      res.json({ notifications: formatted });
    } else {
      const userNotifications = notifications
        .filter(n => n.userId === req.user!.userId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      res.json({ notifications: userNotifications });
    }
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to get notifications' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, (req: Request, res: Response) => {
  const notification = notifications.find(
    n => n.id === parseInt(req.params.id) && n.userId === req.user!.userId
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  notification.read = true;

  res.json({ message: 'Notification marked as read', notification });
});

// Mark all as read
router.put('/mark-all-read', authenticate, (req: Request, res: Response) => {
  notifications
    .filter(n => n.userId === req.user!.userId)
    .forEach(n => n.read = true);

  res.json({ message: 'All notifications marked as read' });
});

// Create notification (internal use)
export const createNotification = async (
  userId: number,
  fromUserId: number,
  fromUsername: string,
  fromName: string,
  type: Notification['type'],
  message: string,
  location?: { lat: number; lng: number }
) => {
  try {
    if (isSupabaseConfigured()) {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          from_user_id: fromUserId,
          from_username: fromUsername,
          from_name: fromName,
          type,
          message,
          location_lat: location?.lat || null,
          location_lng: location?.lng || null,
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      console.log(`📬 Notification created in DB for user ${userId}: ${message}`);
      return notification;
    } else {
      const notification: Notification = {
        id: notificationIdCounter++,
        userId,
        fromUserId,
        fromUsername,
        fromName,
        type,
        message,
        location,
        timestamp: new Date().toISOString(),
        read: false,
      };

      notifications.push(notification);
      console.log(`📬 Notification created in memory for user ${userId}: ${message}`);
      
      return notification;
    }
  } catch (error) {
    console.error('Create notification error:', error);
    return null;
  }
};

// Get unread count
router.get('/unread-count', authenticate, (req: Request, res: Response) => {
  const count = notifications.filter(
    n => n.userId === req.user!.userId && !n.read
  ).length;

  res.json({ count });
});

export default router;
