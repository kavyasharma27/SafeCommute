import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { supabase, isSupabaseConfigured } from '../config/database';

const router = Router();

interface Contact {
  id: number;
  userId: number;
  contactUserId: number;
  name: string;
  username: string;
  email?: string;
  relationship: string;
  createdAt: Date;
}

const contacts: Contact[] = [];
let contactIdCounter = 1;

// Get all contacts for logged-in user
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    if (isSupabaseConfigured()) {
      const { data: userContacts } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', req.user?.userId);

      const formatted = (userContacts || []).map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        contactUserId: c.contact_user_id,
        name: c.name,
        username: c.username,
        email: c.email,
        relationship: c.relationship,
        createdAt: c.created_at
      }));

      res.json({ contacts: formatted });
    } else {
      const userContacts = contacts.filter(c => c.userId === req.user?.userId);
      res.json({ contacts: userContacts });
    }
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Failed to get contacts' });
  }
});

// Add new contact by username
router.post('/', authenticate, async (req: Request, res: Response) => {
  const { contactUserId, name, username, email, relationship } = req.body;

  if (!contactUserId || !name || !username) {
    return res.status(400).json({ message: 'Contact user ID, name and username are required' });
  }

  if (contactUserId === req.user!.userId) {
    return res.status(400).json({ message: 'Cannot add yourself as contact' });
  }

  try {
    if (isSupabaseConfigured()) {
      // Check if already added
      const { data: existing } = await supabase
        .from('contacts')
        .select('id')
        .eq('user_id', req.user!.userId)
        .eq('contact_user_id', contactUserId);

      if (existing && existing.length > 0) {
        return res.status(400).json({ message: 'Contact already added' });
      }

      const { data: newContact, error } = await supabase
        .from('contacts')
        .insert({
          user_id: req.user!.userId,
          contact_user_id: contactUserId,
          name,
          username,
          email: email || null,
          relationship: relationship || 'Emergency Contact'
        })
        .select()
        .single();

      if (error || !newContact) throw error;

      res.status(201).json({
        message: 'Contact added successfully',
        contact: {
          id: newContact.id,
          userId: newContact.user_id,
          contactUserId: newContact.contact_user_id,
          name: newContact.name,
          username: newContact.username,
          email: newContact.email,
          relationship: newContact.relationship,
          createdAt: newContact.created_at
        }
      });
    } else {
      // Fallback: in-memory
      const existing = contacts.find(
        c => c.userId === req.user!.userId && c.contactUserId === contactUserId
      );
      
      if (existing) {
        return res.status(400).json({ message: 'Contact already added' });
      }

      const newContact: Contact = {
        id: contactIdCounter++,
        userId: req.user!.userId,
        contactUserId,
        name,
        username,
        relationship: relationship || 'Emergency Contact',
        createdAt: new Date()
      };

      contacts.push(newContact);

      res.status(201).json({
        message: 'Contact added successfully',
        contact: newContact
      });
    }
  } catch (error) {
    console.error('Add contact error:', error);
    res.status(500).json({ message: 'Failed to add contact' });
  }
});

// Delete contact
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  const contactId = parseInt(req.params.id);

  try {
    if (isSupabaseConfigured()) {
      // Delete from Supabase
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('user_id', req.user!.userId);

      if (error) throw error;

      res.json({ message: 'Contact deleted successfully' });
    } else {
      // Fallback: in-memory deletion
      const index = contacts.findIndex(
        c => c.id === contactId && c.userId === req.user?.userId
      );

      if (index === -1) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      contacts.splice(index, 1);
      res.json({ message: 'Contact deleted successfully' });
    }
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ message: 'Failed to delete contact' });
  }
});

// Get contacts for a specific user (for internal use)
export const getContactsByUserId = async (userId: number) => {
  if (isSupabaseConfigured()) {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('user_id', userId);

    return (data || []).map((c: any) => ({
      id: c.id,
      userId: c.user_id,
      contactUserId: c.contact_user_id,
      name: c.name,
      username: c.username,
      email: c.email,
      relationship: c.relationship
    }));
  }
  return contacts.filter(c => c.userId === userId);
};

export default router;
