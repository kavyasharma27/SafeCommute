import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  Avatar,
  AppBar,
  Toolbar,
} from '@mui/material';
import { Send, ArrowBack } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Message {
  id: number;
  fromUserId: number;
  toUserId: number;
  message: string;
  timestamp: string;
  read: boolean;
}

const Chat: React.FC = () => {
  const { contactUserId, username } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUserId(user.id);
    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/chat/${contactUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/chat/send`,
        {
          toUserId: parseInt(contactUserId!),
          message: newMessage,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    // Manually add 5 hours 30 minutes to convert UTC to IST
    const istTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    
    // Display in 12-hour format with AM/PM
    return istTime.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/contacts')}>
            <ArrowBack />
          </IconButton>
          <Avatar sx={{ ml: 2, mr: 2, bgcolor: 'secondary.main' }}>
            {username?.[0]?.toUpperCase()}
          </Avatar>
          <Typography variant="h6">
            @{username}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <List>
              {messages.map((msg) => (
                <ListItem
                  key={msg.id}
                  sx={{
                    justifyContent: msg.fromUserId === currentUserId ? 'flex-end' : 'flex-start',
                    px: 0,
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      bgcolor: msg.fromUserId === currentUserId ? 'primary.main' : '#f0f0f0',
                      color: msg.fromUserId === currentUserId ? 'white' : 'text.primary',
                      borderRadius: 2,
                      px: 2,
                      py: 1,
                    }}
                  >
                    <Typography variant="body1">{msg.message}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 0.5,
                        opacity: 0.8,
                        textAlign: 'right',
                        fontSize: '0.75rem',
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </Typography>
                  </Box>
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </Box>

          <Box
            component="form"
            onSubmit={sendMessage}
            sx={{
              p: 2,
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              variant="outlined"
              size="small"
            />
            <IconButton type="submit" color="primary" disabled={!newMessage.trim()}>
              <Send />
            </IconButton>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Chat;
