import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Button,
  IconButton,
  Badge,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  DirectionsRun,
  Warning,
  Message,
  LocationOn,
  CheckCircle,
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface Notification {
  id: number;
  fromUsername: string;
  fromName: string;
  type: 'journey_start' | 'journey_end' | 'sos_alert' | 'message';
  message: string;
  location?: { lat: number; lng: number };
  timestamp: string;
  read: boolean;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'journey_start':
        return <DirectionsRun sx={{ color: '#2196f3' }} />;
      case 'sos_alert':
        return <Warning sx={{ color: '#f44336' }} />;
      case 'message':
        return <Message sx={{ color: '#4caf50' }} />;
      default:
        return <NotificationsIcon />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'journey_start':
        return '#e3f2fd';
      case 'sos_alert':
        return '#ffebee';
      case 'message':
        return '#e8f5e9';
      default:
        return '#f5f5f5';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    // Manually add 5 hours 30 minutes to convert UTC to IST
    const istTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
    const now = new Date();
    
    // Check if it's today
    const isToday = istTime.toDateString() === now.toDateString();
    
    if (isToday) {
      // For today's notifications, show "Today" + exact time
      const time = istTime.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      return `Today at ${time}`;
    }
    
    // For older notifications, check if yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = istTime.toDateString() === yesterday.toDateString();
    
    if (isYesterday) {
      const time = istTime.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      });
      return `Yesterday at ${time}`;
    }
    
    // For older notifications, show full date + time
    const dateStr = istTime.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    });
    const time = istTime.toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
    
    return `${dateStr} at ${time}`;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            🔔 Notifications
          </Typography>
          {notifications.some(n => !n.read) && (
            <Button
              variant="outlined"
              size="small"
              onClick={markAllAsRead}
              disabled={loading}
            >
              Mark all as read
            </Button>
          )}
        </Box>

        {notifications.length === 0 ? (
          <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No notifications yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You'll see updates here when your emergency contacts start journeys or send messages
            </Typography>
          </Paper>
        ) : (
          <Paper elevation={2}>
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      bgcolor: notification.read ? 'transparent' : getColor(notification.type),
                      opacity: notification.read ? 0.7 : 1,
                      transition: 'all 0.3s',
                      '&:hover': {
                        bgcolor: notification.read ? '#f5f5f5' : getColor(notification.type),
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'white' }}>
                        {getIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" fontWeight={600}>
                            @{notification.fromUsername}
                          </Typography>
                          <Chip 
                            label={notification.type.replace('_', ' ')} 
                            size="small" 
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {notification.message}
                          </Typography>
                          {notification.location && (
                            <Button
                              size="small"
                              startIcon={<LocationOn />}
                              onClick={() => window.open(
                                `https://www.google.com/maps?q=${notification.location!.lat},${notification.location!.lng}`,
                                '_blank'
                              )}
                              sx={{ mt: 1 }}
                            >
                              View Location
                            </Button>
                          )}
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            display="block" 
                            sx={{ 
                              mt: 1,
                              fontWeight: 500,
                              fontSize: '0.85rem'
                            }}
                          >
                            📅 {formatTime(notification.timestamp)}
                          </Typography>
                        </Box>
                      }
                    />
                    {!notification.read && (
                      <IconButton onClick={() => markAsRead(notification.id)} size="small">
                        <CheckCircle color="primary" />
                      </IconButton>
                    )}
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}

        <Button
          fullWidth
          variant="outlined"
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 3 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Notifications;
