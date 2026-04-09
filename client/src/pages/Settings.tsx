import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  AppBar,
  Toolbar,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack,
  Brightness4,
  Brightness7,
  Notifications,
  Lock,
} from '@mui/icons-material';
import { useThemeMode } from '../context/ThemeContext';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => navigate('/dashboard')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2 }}>
            Settings
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3}>
          <List sx={{ p: 0 }}>
            <ListItem>
              <ListItemIcon>
                {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
              </ListItemIcon>
              <ListItemText
                primary="Dark Mode"
                secondary={mode === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={mode === 'dark'}
                    onChange={toggleTheme}
                    color="primary"
                  />
                }
                label=""
              />
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText
                primary="Push Notifications"
                secondary="Receive alerts when contacts send SOS or start journeys"
              />
              <FormControlLabel
                control={<Switch defaultChecked color="primary" />}
                label=""
              />
            </ListItem>

            <Divider />

            <ListItem>
              <ListItemIcon>
                <Lock />
              </ListItemIcon>
              <ListItemText
                primary="Auto-lock"
                secondary="Lock app when inactive for 5 minutes"
              />
              <FormControlLabel
                control={<Switch color="primary" />}
                label=""
              />
            </ListItem>
          </List>
        </Paper>

        <Paper elevation={3} sx={{ mt: 3, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            About SafeCommute
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Version 1.0.0
          </Typography>
          <Typography variant="body2" color="text.secondary">
            SafeCommute is your personal safety companion for tracking journeys and staying connected with emergency contacts.
          </Typography>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            © 2026 SafeCommute. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Settings;
