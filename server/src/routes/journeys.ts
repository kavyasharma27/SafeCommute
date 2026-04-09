import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { createNotification } from './notifications';
import { getUserById } from './auth';
import { supabase, isSupabaseConfigured, sendNotificationEmail } from '../config/database';

const router = Router();

interface Journey {
  id: number;
  userId: number;
  startLocation: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'active' | 'completed';
}

const journeys: Journey[] = [];
let journeyIdCounter = 1;

// Export stats for admin (no personal data)
export const getJourneyStats = () => ({
  totalJourneys: journeys.length,
  activeJourneys: journeys.filter(j => j.status === 'active').length,
});

// Get all journeys for user
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    let userJourneys: Journey[] = [];

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .eq('user_id', req.user!.userId)
        .order('start_time', { ascending: false });

      if (error) throw error;

      userJourneys = (data || []).map((j: any) => ({
        id: j.id,
        userId: j.user_id,
        startLocation: { lat: j.start_lat, lng: j.start_lng },
        endLocation: j.end_lat ? { lat: j.end_lat, lng: j.end_lng } : undefined,
        startTime: new Date(j.start_time),
        endTime: j.end_time ? new Date(j.end_time) : undefined,
        duration: j.duration,
        status: j.status
      }));
    } else {
      userJourneys = journeys.filter(j => j.userId === req.user?.userId);
    }

    res.json({ journeys: userJourneys });
  } catch (error) {
    console.error('Get journeys error:', error);
    res.status(500).json({ message: 'Failed to fetch journeys' });
  }
});

// Start new journey
router.post('/start', authenticate, async (req: Request, res: Response) => {
  const { lat, lng } = req.body;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Location coordinates required' });
  }

  try {
    let newJourney: Journey;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase
        .from('journeys')
        .insert({
          user_id: req.user!.userId,
          start_lat: lat,
          start_lng: lng,
          status: 'active'
        })
        .select()
        .single();

      if (error || !data) throw error;
      
      newJourney = {
        id: data.id,
        userId: data.user_id,
        startLocation: { lat: data.start_lat, lng: data.start_lng },
        startTime: new Date(data.start_time),
        status: data.status
      };
    } else {
      newJourney = {
        id: journeyIdCounter++,
        userId: req.user!.userId,
        startLocation: { lat, lng },
        startTime: new Date(),
        status: 'active'
      };
      journeys.push(newJourney);
    }

    // Get user info and notify emergency contacts
    const user = await getUserById(req.user!.userId);
    const contactsModule = require('./contacts');
    const userContacts = await contactsModule.getContactsByUserId(req.user!.userId);
    
    // Send in-app notifications
    for (const contact of userContacts) {
      await createNotification(
        contact.contactUserId,
        req.user!.userId,
        user?.username || '',
        user?.name || '',
        'journey_start',
        `${user?.name} started a journey`,
        { lat, lng }
      );

      // Send email notification
      if (contact.email) {
        await sendNotificationEmail(
          contact.email,
          '🚨 SafeCommute: Journey Started',
          `${user?.name} (@${user?.username}) has started a journey. Track their location in the SafeCommute app.`,
          { latitude: lat, longitude: lng }
        );
      }
    }

    console.log(`🚀 Journey started - Notified ${userContacts.length} emergency contacts`);

    res.status(201).json({
      message: 'Journey started',
      journey: newJourney
    });
  } catch (error) {
    console.error('Journey start error:', error);
    res.status(500).json({ message: 'Failed to start journey' });
  }
});

// End journey
router.put('/:id/end', authenticate, async (req: Request, res: Response) => {
  const journeyId = parseInt(req.params.id);
  const { lat, lng } = req.body;

  try {
    let journey: Journey | undefined;

    if (isSupabaseConfigured()) {
      // Fetch journey from Supabase
      const { data: journeyData, error: fetchError } = await supabase
        .from('journeys')
        .select('*')
        .eq('id', journeyId)
        .eq('user_id', req.user!.userId)
        .eq('status', 'active')
        .single();

      if (fetchError || !journeyData) {
        return res.status(404).json({ message: 'Journey not found' });
      }

      // Calculate duration
      const startTime = new Date(journeyData.start_time);
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

      // Update journey in Supabase
      const { data: updatedData, error: updateError } = await supabase
        .from('journeys')
        .update({
          end_lat: lat,
          end_lng: lng,
          end_time: endTime.toISOString(),
          duration: duration,
          status: 'completed'
        })
        .eq('id', journeyId)
        .select()
        .single();

      if (updateError || !updatedData) throw updateError;

      journey = {
        id: updatedData.id,
        userId: updatedData.user_id,
        startLocation: { lat: updatedData.start_lat, lng: updatedData.start_lng },
        endLocation: { lat: updatedData.end_lat, lng: updatedData.end_lng },
        startTime: new Date(updatedData.start_time),
        endTime: new Date(updatedData.end_time),
        duration: updatedData.duration,
        status: updatedData.status
      };
    } else {
      // In-memory fallback
      journey = journeys.find(
        j => j.id === journeyId && j.userId === req.user?.userId
      );

      if (!journey) {
        return res.status(404).json({ message: 'Journey not found' });
      }

      journey.endLocation = { lat, lng };
      journey.endTime = new Date();
      journey.duration = Math.floor(
        (journey.endTime.getTime() - journey.startTime.getTime()) / 1000
      );
      journey.status = 'completed';
    }

    // Get user info and notify emergency contacts
    const user = await getUserById(req.user!.userId);
    const contactsModule = require('./contacts');
    const userContacts = await contactsModule.getContactsByUserId(req.user!.userId);
    
    for (const contact of userContacts) {
      await createNotification(
        contact.contactUserId,
        req.user!.userId,
        user?.username || '',
        user?.name || '',
        'journey_end',
        `${user?.name} ended their journey safely`,
        { lat, lng }
      );

      // Send email notification
      if (contact.email) {
        await sendNotificationEmail(
          contact.email,
          '✅ SafeCommute: Journey Ended Safely',
          `${user?.name} (@${user?.username}) has safely ended their journey.`,
          { latitude: lat, longitude: lng }
        );
      }
    }

    console.log(`✅ Journey ended - Notified ${userContacts.length} emergency contacts`);

    res.json({
      message: 'Journey ended',
      journey
    });
  } catch (error) {
    console.error('End journey error:', error);
    res.status(500).json({ message: 'Failed to end journey' });
  }
});

// Send SOS alert
router.post('/sos', authenticate, async (req: Request, res: Response) => {
  const { lat, lng, message } = req.body;

  console.log(`🚨 SOS Alert from user ${req.user?.userId}`);
  console.log(`Location: ${lat}, ${lng}`);
  console.log(`Message: ${message || 'Emergency!'}`);

  try {
    // Get user info
    const user = await getUserById(req.user!.userId);

    // Notify emergency contacts with SOS
    const contactsModule = require('./contacts');
    const userContacts = await contactsModule.getContactsByUserId(req.user!.userId);
    
    for (const contact of userContacts) {
      // In-app notification
      await createNotification(
        contact.contactUserId,
        req.user!.userId,
        user?.username || '',
        user?.name || '',
        'sos_alert',
        `🚨 EMERGENCY! ${user?.name} sent an SOS alert and needs help!`,
        { lat, lng }
      );

      // Email notification
      if (contact.email) {
        await sendNotificationEmail(
          contact.email,
          '🚨 EMERGENCY: SafeCommute SOS Alert',
          `⚠️ EMERGENCY ALERT ⚠️<br><br>${user?.name} (@${user?.username}) has sent an SOS alert and needs immediate help!<br><br>Please check on them immediately!`,
          { latitude: lat, longitude: lng }
        );
      }
    }

    console.log(`🚨 SOS sent to ${userContacts.length} emergency contacts`);

    res.json({
      success: true,
      message: 'SOS alert sent to all emergency contacts'
    });
  } catch (error) {
    console.error('SOS alert error:', error);
    res.status(500).json({ message: 'Failed to send SOS alert' });
  }
});

export default router;
