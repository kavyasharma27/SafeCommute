import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
} from '@mui/material';
import {
  Shield,
  Map,
  Contacts,
  History,
  Phone,
  AccountCircle,
  PlayArrow,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [userName, setUserName] = useState('User');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setUserName(userData.name || 'User');
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleSettings = () => {
    handleClose();
    navigate('/settings');
  };

  const quickActions = [
    {
      title: 'Start Journey',
      description: 'Begin tracking your location',
      icon: <PlayArrow sx={{ fontSize: 40 }} />,
      color: '#e91e63',
      action: () => navigate('/track'),
    },
    {
      title: 'Emergency SOS',
      description: 'Send instant alert',
      icon: <Phone sx={{ fontSize: 40 }} />,
      color: '#f44336',
      action: () => alert('SOS feature - Will send alerts to emergency contacts'),
    },
    {
      title: 'Safety Map',
      description: 'View community reports',
      icon: <Map sx={{ fontSize: 40 }} />,
      color: '#2196f3',
      action: () => navigate('/safety-map'),
    },
    {
      title: 'Contacts',
      description: 'Manage emergency contacts',
      icon: <Contacts sx={{ fontSize: 40 }} />,
      color: '#4caf50',
      action: () => navigate('/contacts'),
    },
  ];

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Shield sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SafeCommute
          </Typography>
          <IconButton color="inherit" onClick={() => navigate('/notifications')} sx={{ mr: 1 }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {userName}
          </Typography>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
          >
            <AccountCircle />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleProfile}>Profile</MenuItem>
            <MenuItem onClick={handleSettings}>Settings</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
          color: 'white',
          py: 6,
        }}
      >
        <Container>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Welcome back, {userName}!
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Stay safe on your journey today
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                elevation={2}
                sx={{
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={action.action}
              >
                <CardContent sx={{ textAlign: 'center', p: 3 }}>
                  <Box sx={{ color: action.color, mb: 2 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {action.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
            Recent Journeys
          </Typography>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <History sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No recent journeys
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Start your first journey to see it here
              </Typography>
              <Button variant="contained" onClick={() => navigate('/track')}>
                Start Journey
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard;
