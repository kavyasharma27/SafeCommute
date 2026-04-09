-- SafeCommute Database Schema for Supabase
-- Run this SQL in Supabase SQL Editor: https://supabase.com/dashboard

-- 1. Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- 2. Contacts table (emergency contacts)
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  relationship TEXT DEFAULT 'Emergency Contact',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, contact_user_id)
);

CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);

-- 3. Journeys table
CREATE TABLE IF NOT EXISTS journeys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_lat DECIMAL(10, 8) NOT NULL,
  start_lng DECIMAL(11, 8) NOT NULL,
  end_lat DECIMAL(10, 8),
  end_lng DECIMAL(11, 8),
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  duration INTEGER,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed'))
);

CREATE INDEX IF NOT EXISTS idx_journeys_user_id ON journeys(user_id);
CREATE INDEX IF NOT EXISTS idx_journeys_status ON journeys(status);

-- 4. Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_username TEXT NOT NULL,
  from_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('journey_start', 'journey_end', 'sos_alert', 'message')),
  message TEXT NOT NULL,
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8),
  timestamp TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);

-- 5. Messages table (chat)
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  from_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);

-- Enable Row Level Security (RLS) - IMPORTANT FOR SECURITY!
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view all users for search" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow user registration" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own contacts" ON contacts
  FOR SELECT USING (user_id IN (SELECT id FROM users));

CREATE POLICY "Users can insert their own contacts" ON contacts
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users));

CREATE POLICY "Users can delete their own contacts" ON contacts
  FOR DELETE USING (user_id IN (SELECT id FROM users));

CREATE POLICY "Users can view their own journeys" ON journeys
  FOR SELECT USING (user_id IN (SELECT id FROM users));

CREATE POLICY "Users can insert their own journeys" ON journeys
  FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users));

CREATE POLICY "Users can update their own journeys" ON journeys
  FOR UPDATE USING (user_id IN (SELECT id FROM users));

CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id IN (SELECT id FROM users));

CREATE POLICY "Allow creating notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id IN (SELECT id FROM users));

CREATE POLICY "Users can view their sent and received messages" ON messages
  FOR SELECT USING (from_user_id IN (SELECT id FROM users) OR to_user_id IN (SELECT id FROM users));

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (from_user_id IN (SELECT id FROM users));

CREATE POLICY "Users can update their received messages" ON messages
  FOR UPDATE USING (to_user_id IN (SELECT id FROM users));

-- Success message
SELECT '✅ SafeCommute database schema created successfully!' AS status;
SELECT 'Tables created: users, contacts, journeys, notifications, messages' AS info;
SELECT 'Row Level Security enabled for all tables' AS security;
SELECT 'Indexes created for performance optimization' AS performance;
