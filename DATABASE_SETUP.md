# 🗄️ Database Integration Guide for SafeCommute

## ⚠️ Current Problem

**Your app currently uses in-memory storage (JavaScript arrays)**
- ❌ Data is lost when you refresh the page
- ❌ Data is lost when server restarts  
- ❌ Won't work on Netlify/Vercel deployment
- ❌ Each user session starts fresh

```typescript
// Current backend - TEMPORARY STORAGE!
const users: User[] = [];  // ← Lost on restart!
const journeys: Journey[] = [];  // ← Lost on restart!
const contacts: Contact[] = [];  // ← Lost on restart!
```

## ✅ Solution: Use a Real Database

You need a **persistent database** to store:
- Users (name, email, username, password)
- Emergency contacts
- Journey history
- Notifications
- Chat messages

---

## 🆓 Best FREE Database Options for Students/Portfolio

### 🥇 **Option 1: Supabase (RECOMMENDED)**

**Why Supabase?**
- ✅ PostgreSQL (powerful SQL database)
- ✅ 500 MB free storage
- ✅ Built-in authentication (no need to write login code!)
- ✅ Realtime subscriptions (perfect for notifications!)
- ✅ Free tier forever
- ✅ Easy to use
- ✅ Great for portfolios

**Free Tier:**
- 500 MB database space
- 2 GB bandwidth
- 50,000 monthly active users
- Unlimited API requests

**Setup Steps:**
1. Go to https://supabase.com
2. Click "Start your project" (free, no credit card)
3. Create a new project
4. Get your API URL and API Key
5. Install in your backend: `npm install @supabase/supabase-js`

**Example Code:**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://YOUR_PROJECT.supabase.co',
  'YOUR_API_KEY'
)

// Register user
const { data, error } = await supabase.auth.signUp({
  email: 'user@email.com',
  password: 'password123'
})

// Save contact
const { data } = await supabase
  .from('contacts')
  .insert({ userId: 1, contactUserId: 2, name: 'Friend' })
```

---

### 🥈 **Option 2: MongoDB Atlas**

**Why MongoDB?**
- ✅ NoSQL (flexible, no fixed schema)
- ✅ 512 MB free storage
- ✅ Most popular database for Node.js
- ✅ Good documentation
- ✅ Easy to learn

**Free Tier:**
- 512 MB storage
- Shared RAM
- Free forever

**Setup Steps:**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free, no credit card)
3. Create a free cluster (M0)
4. Get connection string
5. Install: `npm install mongodb mongoose`

**Example Code:**
```typescript
import mongoose from 'mongoose';

// Connect
await mongoose.connect('mongodb+srv://user:pass@cluster.mongodb.net/safecommute');

// Define model
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  username: { type: String, unique: true },
  password: String
});

const User = mongoose.model('User', UserSchema);

// Create user
const user = new User({
  name: 'Kavya',
  email: 'kavya@test.com',
  username: 'kavya_27',
  password: 'hashed_password'
});
await user.save();

// Find user
const user = await User.findOne({ email: 'kavya@test.com' });
```

---

### 🥉 **Option 3: Firebase (Google)**

**Why Firebase?**
- ✅ Google's platform
- ✅ 1 GB free storage
- ✅ Built-in authentication
- ✅ Realtime database
- ✅ Free hosting included

**Free Tier:**
- 1 GB storage
- 10 GB bandwidth
- 50,000 reads/day

**Setup Steps:**
1. Go to https://firebase.google.com
2. Create a project
3. Add Firestore Database
4. Install: `npm install firebase-admin`

---

## 🎯 My Recommendation for You: **SUPABASE**

### Why Supabase is Perfect for SafeCommute:

1. **Built-in Authentication** ✅
   - Don't need to hash passwords yourself
   - JWT tokens handled automatically
   - Email verification ready

2. **Realtime Notifications** ✅
   - Instant updates when journey starts
   - No polling needed!
   - Better UX

3. **SQL Database** ✅
   - Better for relationships (users → contacts → journeys)
   - Easy to understand
   - Portfolio-friendly (employers love SQL)

4. **Free Forever** ✅
   - No credit card needed
   - Won't expire

---

## 📊 Database Schema for SafeCommute

Here's what your tables should look like:

### **users** table
```sql
id          | INTEGER (primary key)
name        | TEXT
email       | TEXT (unique)
username    | TEXT (unique)
password    | TEXT (hashed)
created_at  | TIMESTAMP
```

### **contacts** table
```sql
id              | INTEGER (primary key)
user_id         | INTEGER (foreign key → users.id)
contact_user_id | INTEGER (foreign key → users.id)
name            | TEXT
username        | TEXT
relationship    | TEXT
created_at      | TIMESTAMP
```

### **journeys** table
```sql
id              | INTEGER (primary key)
user_id         | INTEGER (foreign key → users.id)
start_lat       | DECIMAL
start_lng       | DECIMAL
end_lat         | DECIMAL
end_lng         | DECIMAL
start_time      | TIMESTAMP
end_time        | TIMESTAMP
status          | TEXT (active/completed)
```

### **notifications** table
```sql
id              | INTEGER (primary key)
user_id         | INTEGER (recipient)
from_user_id    | INTEGER
from_username   | TEXT
from_name       | TEXT
type            | TEXT (journey_start/sos_alert/message)
message         | TEXT
location_lat    | DECIMAL
location_lng    | DECIMAL
timestamp       | TIMESTAMP
read            | BOOLEAN
```

### **messages** table
```sql
id              | INTEGER (primary key)
from_user_id    | INTEGER
to_user_id      | INTEGER
message         | TEXT
timestamp       | TIMESTAMP
read            | BOOLEAN
```

---

## 🚀 Quick Start with Supabase (15 minutes)

### Step 1: Create Account
```bash
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign in with GitHub (recommended for portfolio)
4. Create a new organization (e.g., "SafeCommute")
5. Create a new project:
   - Name: SafeCommute
   - Database Password: (save this!)
   - Region: Choose closest to you
   - Wait 2 minutes for deployment
```

### Step 2: Create Tables
```sql
-- In Supabase SQL Editor (left sidebar → SQL Editor → New Query)

-- Users table (Supabase has built-in auth.users, but we can extend it)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Contacts table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  contact_user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  username TEXT NOT NULL,
  relationship TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, contact_user_id)
);

-- Journeys table
CREATE TABLE journeys (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  start_lat DECIMAL NOT NULL,
  start_lng DECIMAL NOT NULL,
  end_lat DECIMAL,
  end_lng DECIMAL,
  start_time TIMESTAMP DEFAULT NOW(),
  end_time TIMESTAMP,
  status TEXT DEFAULT 'active',
  duration INTEGER
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  from_user_id UUID REFERENCES auth.users NOT NULL,
  from_username TEXT NOT NULL,
  from_name TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  location_lat DECIMAL,
  location_lng DECIMAL,
  timestamp TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Messages table
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users NOT NULL,
  to_user_id UUID REFERENCES auth.users NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);
```

### Step 3: Get API Keys
```bash
1. Click "Settings" (gear icon, left sidebar)
2. Click "API"
3. Copy:
   - Project URL: https://xxx.supabase.co
   - anon public key: eyJhbGc...
   - service_role key: eyJhbGc... (secret!)
```

### Step 4: Install in Your Backend
```bash
cd server
npm install @supabase/supabase-js dotenv
```

### Step 5: Create `.env` file in `server/` folder
```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
JWT_SECRET=your_jwt_secret
```

### Step 6: Update `server/src/config/supabase.ts` (NEW FILE)
```typescript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);
```

### Step 7: Update Auth Route Example
```typescript
// server/src/routes/auth.ts
import { supabase } from '../config/supabase';

// Register
router.post('/register', async (req, res) => {
  const { name, email, username, password } = req.body;

  // Supabase handles auth automatically!
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    return res.status(400).json({ message: authError.message });
  }

  // Save additional profile data
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user!.id,
      username,
      name,
    });

  res.status(201).json({
    message: 'User registered successfully',
    user: { id: authData.user!.id, email, username, name }
  });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Get profile data
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, name')
    .eq('id', data.user.id)
    .single();

  res.json({
    message: 'Login successful',
    token: data.session.access_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      username: profile?.username,
      name: profile?.name,
    }
  });
});
```

---

## 📦 Alternative: PostgreSQL on Railway (Also Free)

**Railway** offers free PostgreSQL:
- 512 MB storage
- $5 free credit/month
- Good for production

Link: https://railway.app

---

## ✅ Summary

**For your portfolio project, I recommend:**

1. **Use Supabase** (easiest, free forever)
2. **Why?**
   - Built-in auth saves development time
   - Realtime features (instant notifications!)
   - SQL database (portfolio-friendly)
   - Free tier is generous
   - Works on Netlify/Vercel deployment

3. **Setup time:** 15-30 minutes
4. **Learning benefit:** You'll learn PostgreSQL (valuable skill!)

**Want me to help you set it up?** Just say "let's add Supabase" and I'll:
1. Create the Supabase config file
2. Update all your routes to use database
3. Add migration scripts
4. Test everything together

---

## 🎓 Portfolio Tip

When you show this to recruiters, say:
> "I used Supabase (PostgreSQL) for data persistence with JWT authentication. The realtime subscriptions enable instant notifications when emergency contacts start journeys."

This shows you understand databases, authentication, and modern backend architecture! 🚀
