import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ArrowBack, Add, Person, Delete, Chat } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Contact {
  id: number;
  contactUserId: number;
  name: string;
  username: string;
  relationship: string;
}

interface SearchResult {
  id: number;
  name: string;
  username: string;
}

const EmergencyContacts: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(response.data.contacts);
    } catch (error) {
      console.error('Error fetching contacts:', error);
    }
  };

  const searchUsers = async () => {
    try {
      setSearchLoading(true);
      const response = await axios.get(`${API_URL}/auth/search/${searchQuery}`);
      setSearchResults(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!selectedUser) {
      setError('Please select a user');
      return;
    }

    if (!relationship) {
      setError('Please enter relationship');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/contacts`,
        {
          contactUserId: selectedUser.id,
          name: selectedUser.name,
          username: selectedUser.username,
          relationship,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchContacts();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setError('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setRelationship('');
  };

  const handleClose = () => {
    setOpen(false);
    setError('');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setRelationship('');
  };

  const selectUser = (user: SearchResult) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
            Emergency Contacts
          </Typography>
          <IconButton color="inherit" onClick={handleOpen}>
            <Add />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>📱 Username-Based Contacts</strong><br />
          Add SafeCommute users as emergency contacts. They'll get instant notifications when you start a journey or send SOS alerts - no SMS fees!
        </Alert>

        {contacts.length === 0 ? (
          <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
            <Person sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No emergency contacts yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add trusted SafeCommute users who will receive real-time updates about your safety
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={handleOpen}>
              Add Your First Contact
            </Button>
          </Paper>
        ) : (
          <Paper elevation={2}>
            <List>
              {contacts.map((contact) => (
                <ListItem
                  key={contact.id}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        onClick={() => navigate(`/chat/${contact.contactUserId}/${contact.username}`)}
                        sx={{ mr: 1 }}
                      >
                        <Chat />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteContact(contact.id)} color="error">
                        <Delete />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {contact.name[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {contact.name}
                        </Typography>
                        <Chip label={`@${contact.username}`} size="small" variant="outlined" />
                      </Box>
                    }
                    secondary={contact.relationship}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        )}

        {/* Add Contact Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Add Emergency Contact</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {!selectedUser ? (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Search for SafeCommute users by username
                </Typography>
                <TextField
                  fullWidth
                  label="Search by Username"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type at least 2 characters..."
                  InputProps={{
                    endAdornment: searchLoading && <CircularProgress size={20} />,
                  }}
                  sx={{ mb: 2 }}
                />

                {searchResults.length > 0 && (
                  <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                    <List>
                      {searchResults.map((user) => (
                        <ListItem
                          key={user.id}
                          button
                          onClick={() => selectUser(user)}
                        >
                          <ListItemAvatar>
                            <Avatar>{user.name[0].toUpperCase()}</Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={user.name}
                            secondary={`@${user.username}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}

                {searchQuery.length >= 2 && searchResults.length === 0 && !searchLoading && (
                  <Alert severity="warning">
                    No users found with username "{searchQuery}"
                  </Alert>
                )}
              </>
            ) : (
              <>
                <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: '#e8f5e9' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Selected User:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar>{selectedUser.name[0].toUpperCase()}</Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {selectedUser.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        @{selectedUser.username}
                      </Typography>
                    </Box>
                  </Box>
                  <Button size="small" onClick={() => setSelectedUser(null)} sx={{ mt: 1 }}>
                    Change User
                  </Button>
                </Paper>

                <TextField
                  fullWidth
                  label="Relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g., Friend, Family, Colleague"
                  required
                />
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleAddContact}
              variant="contained"
              disabled={!selectedUser || !relationship || loading}
            >
              {loading ? 'Adding...' : 'Add Contact'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default EmergencyContacts;
