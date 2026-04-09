import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, isSupabaseConfigured } from '../config/database';

const router = Router();

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
}

// Fallback in-memory storage (when Supabase not configured)
const users: User[] = [];
let userIdCounter = 1;

// Export function for admin stats (no personal data)
export const getUserCount = () => users.length;

// Register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (isSupabaseConfigured()) {
      // Use Supabase database
      const { data: existing } = await supabase
        .from('users')
        .select('email, username')
        .or(`email.eq.${email},username.eq.${username}`);
      
      if (existing && existing.length > 0) {
        const msg = existing[0].email === email ? 'User already exists' : 'Username already taken';
        return res.status(400).json({ message: msg });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({ name, email, username, password: hashedPassword })
        .select()
        .single();

      if (error || !newUser) {
        console.error('Supabase insert error:', error);
        return res.status(500).json({ message: 'Failed to create user' });
      }

      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      console.log('✅ User registered in Supabase:', newUser.username);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, username: newUser.username }
      });
    } else {
      // Fallback: in-memory storage
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const existingUsername = users.find(u => u.username === username);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: User = {
        id: userIdCounter++,
        name,
        email,
        username,
        password: hashedPassword,
        createdAt: new Date()
      };

      users.push(newUser);

      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      console.log('⚠️ User registered in memory (Supabase not configured):', newUser.username);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: { id: newUser.id, name: newUser.name, email: newUser.email, username: newUser.username }
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (isSupabaseConfigured()) {
      // Use Supabase database
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('email', email);

      const user = users && users[0];
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      console.log('✅ User logged in from Supabase:', user.username);

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email, username: user.username }
      });
    } else {
      // Fallback: in-memory storage
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '7d' }
      );

      console.log('⚠️ User logged in from memory:', user.username);

      res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, name: user.name, email: user.email, username: user.username }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

// Search users by username
router.get('/search/:username', async (req: Request, res: Response) => {
  const { username } = req.params;
  
  try {
    if (isSupabaseConfigured()) {
      const { data: foundUsers } = await supabase
        .from('users')
        .select('id, name, username, email')
        .ilike('username', `%${username}%`)
        .limit(10);

      res.json({ users: foundUsers || [] });
    } else {
      const foundUsers = users
        .filter(u => u.username.toLowerCase().includes(username.toLowerCase()))
        .map(u => ({ id: u.id, name: u.name, username: u.username, email: u.email }))
        .slice(0, 10);

      res.json({ users: foundUsers });
    }
  } catch (error) {
    console.error('Search error:', error);
    res.json({ users: [] });
  }
});

// Get user by ID (for internal use)
export const getUserById = async (id: number) => {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }
  return users.find(u => u.id === id);
};

// Update profile (requires authentication middleware)
router.put('/update-profile', async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { name, username } = req.body;
    const userId = req.user.userId;

    if (!name || !username) {
      return res.status(400).json({ message: 'Name and username are required' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    if (isSupabaseConfigured()) {
      // Check if username is already taken by another user
      const { data: existing } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', username)
        .neq('id', userId);

      if (existing && existing.length > 0) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      // Update the user
      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ name, username })
        .eq('id', userId)
        .select()
        .single();

      if (error || !updatedUser) {
        console.error('Update profile error:', error);
        return res.status(500).json({ message: 'Failed to update profile' });
      }

      console.log('✅ Profile updated in Supabase:', updatedUser.username);

      res.json({
        message: 'Profile updated successfully',
        user: { id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, username: updatedUser.username }
      });
    } else {
      // Fallback: in-memory storage
      const existingUsername = users.find(u => u.username === username && u.id !== userId);
      if (existingUsername) {
        return res.status(400).json({ message: 'Username already taken' });
      }

      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.name = name;
      user.username = username;

      console.log('⚠️ Profile updated in memory:', user.username);

      res.json({
        message: 'Profile updated successfully',
        user: { id: user.id, name: user.name, email: user.email, username: user.username }
      });
    }
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;
