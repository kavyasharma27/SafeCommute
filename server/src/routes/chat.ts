import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { getUserById } from './auth';
import { createNotification } from './notifications';
import { supabase, isSupabaseConfigured } from '../config/database';

const router = Router();

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  message: string;
  timestamp: string;
  read: boolean;
}

const messages: Message[] = [];
let messageIdCounter = 1;

// Get chat messages between two users
router.get('/:contactUserId', authenticate, async (req: Request, res: Response) => {
  const contactUserId = parseInt(req.params.contactUserId);
  const currentUserId = req.user!.userId;

  try {
    if (isSupabaseConfigured()) {
      const { data: chatMessages } = await supabase
        .from('messages')
        .select('*')
        .or(`and(from_user_id.eq.${currentUserId},to_user_id.eq.${contactUserId}),and(from_user_id.eq.${contactUserId},to_user_id.eq.${currentUserId})`)
        .order('timestamp', { ascending: true });

      const formatted = (chatMessages || []).map((m: any) => ({
        id: m.id,
        fromUserId: m.from_user_id,
        toUserId: m.to_user_id,
        message: m.message,
        timestamp: m.timestamp,
        read: m.read
      }));

      // Mark received messages as read
      const unreadIds = formatted.filter(m => m.toUserId === currentUserId && !m.read).map(m => m.id);
      if (unreadIds.length > 0) {
        await supabase
          .from('messages')
          .update({ read: true })
          .in('id', unreadIds);
      }

      res.json({ messages: formatted });
    } else {
      const chatMessages = messages
        .filter(m => 
          (m.fromUserId === currentUserId && m.toUserId === contactUserId) ||
          (m.fromUserId === contactUserId && m.toUserId === currentUserId)
        )
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      // Mark received messages as read
      chatMessages
        .filter(m => m.toUserId === currentUserId)
        .forEach(m => m.read = true);

      res.json({ messages: chatMessages });
    }
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// Send a message
router.post('/send', authenticate, async (req: Request, res: Response) => {
  const { toUserId, message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ message: 'Message cannot be empty' });
  }

  try {
    let newMessage: Message;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          from_user_id: req.user!.userId,
          to_user_id: toUserId,
          message: message.trim(),
          read: false
        })
        .select()
        .single();

      if (error || !data) throw error;

      newMessage = {
        id: data.id,
        fromUserId: data.from_user_id,
        toUserId: data.to_user_id,
        message: data.message,
        timestamp: data.timestamp,
        read: data.read
      };
    } else {
      newMessage = {
        id: messageIdCounter++,
        fromUserId: req.user!.userId,
        toUserId,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      };

      messages.push(newMessage);
    }

    // Get user info for notification
    const fromUser = await getUserById(req.user!.userId);

    // Create notification for recipient
    await createNotification(
      toUserId,
      req.user!.userId,
      fromUser?.username || '',
      fromUser?.name || '',
      'message',
      message.trim()
    );

    console.log(`💬 Message from ${fromUser?.username} to user ${toUserId}`);

    res.status(201).json({
      message: 'Message sent successfully',
      chatMessage: newMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// Get unread message count from a specific user
router.get('/unread/:contactUserId', authenticate, (req: Request, res: Response) => {
  const contactUserId = parseInt(req.params.contactUserId);
  
  const count = messages.filter(
    m => m.fromUserId === contactUserId && 
         m.toUserId === req.user!.userId && 
         !m.read
  ).length;

  res.json({ count });
});

export default router;
