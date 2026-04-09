import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// Demo admin credentials (for interviews)
const ADMIN_EMAIL = 'admin@safecommute.com';
const ADMIN_PASSWORD = 'admin123';

// Real admin passcode (secure access - change this to your own!)
// In production, hash this with bcrypt
const REAL_ADMIN_PASSCODE = 'SafeCommute@2026';

// In-memory storage references
import authRoutes from './auth';
import journeyRoutes from './journeys';

interface SOSAlert {
  id: number;
  location: { lat: number; lng: number };
  timestamp: string;
}

const sosAlerts: SOSAlert[] = [];
let sosIdCounter = 1;

// Export function to add SOS alerts
export const addSOSAlert = (location: { lat: number; lng: number }) => {
  const alert: SOSAlert = {
    id: sosIdCounter++,
    location,
    timestamp: new Date().toISOString(),
  };
  sosAlerts.push(alert);
  console.log('📊 Admin: New SOS alert recorded');
};

// Demo admin login (for interviews)
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { isAdmin: true, mode: 'demo', email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Demo admin login successful',
      token,
      mode: 'demo',
    });
  } else {
    res.status(401).json({ message: 'Invalid demo credentials' });
  }
});

// Passcode login for real admin (no SMS needed!)
router.post('/passcode-login', (req: Request, res: Response) => {
  const { passcode } = req.body;

  // In production, hash the passcode with bcrypt for comparison
  if (passcode !== REAL_ADMIN_PASSCODE) {
    return res.status(401).json({ message: 'Invalid admin passcode' });
  }

  const token = jwt.sign(
    { isAdmin: true, mode: 'real' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );

  console.log('✅ Real admin authenticated via passcode');

  res.json({
    message: 'Real admin login successful',
    token,
    mode: 'real',
  });
});

// Admin stats - Privacy-focused (no personal data)
router.get('/stats', (req: Request, res: Response) => {
  // Verify admin token
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Get counts without exposing personal data
    const users = require('./auth').getUserCount();
    const { totalJourneys, activeJourneys } = require('./journeys').getJourneyStats();

    const stats = {
      totalUsers: users,
      totalJourneys: totalJourneys,
      activeJourneys: activeJourneys,
      totalSOSAlerts: sosAlerts.length,
      // Only show location data (anonymized - no user IDs)
      recentAlerts: sosAlerts.slice(-10).reverse(),
    };

    res.json(stats);
  } catch (error) {
    res.status(401).json({ message: 'Invalid admin token' });
  }
});

export default router;
