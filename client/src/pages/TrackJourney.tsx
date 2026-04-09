import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Alert,
  Chip,
} from '@mui/material';
import { ArrowBack, LocationOn, Phone, Stop } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const TrackJourney: React.FC = () => {
  const navigate = useNavigate();
  const [tracking, setTracking] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [duration, setDuration] = useState(0);
  const [journeyId, setJourneyId] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tracking) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tracking]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startTracking = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(coords);
          
          try {
            // Call backend API to start journey
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
              `${API_URL}/journeys/start`,
              coords,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            
            setJourneyId(response.data.journey.id);
            setTracking(true);
            setError('');
            setSuccess('Journey started! Your emergency contacts have been notified.');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccess(''), 3000);
          } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to start journey');
          }
        },
        (error) => {
          setError('Please enable location access to use this feature');
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const stopTracking = async () => {
    if (!journeyId || !location) return;
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(
        `${API_URL}/journeys/${journeyId}/end`,
        location,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setTracking(false);
      setDuration(0);
      setJourneyId(null);
      setSuccess('Journey ended safely! Your contacts have been notified.');
      
      // Clear success message and redirect after 2 seconds
      setTimeout(() => {
        setSuccess('');
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to end journey');
    }
  };

  const sendSOS = async () => {
    if (!location) {
      setError('Location not available');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      await axios.post(
        `${API_URL}/journeys/sos`,
        {
          lat: location.lat,
          lng: location.lng,
          message: 'Emergency Alert!',
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setSuccess('🚨 SOS Alert sent to all emergency contacts!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send SOS');
    }
  };

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Track Journey
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          <Box sx={{ textAlign: 'center' }}>
            <LocationOn
              sx={{
                fontSize: 80,
                color: tracking ? 'primary.main' : 'text.secondary',
                mb: 2,
              }}
            />

            {tracking && (
              <Chip
                label="Tracking Active"
                color="success"
                sx={{ mb: 2 }}
              />
            )}

            <Typography variant="h5" gutterBottom fontWeight={600}>
              {tracking ? 'Journey in Progress' : 'Start Your Journey'}
            </Typography>

            {tracking && (
              <Typography variant="h3" color="primary" sx={{ my: 3 }}>
                {formatDuration(duration)}
              </Typography>
            )}

            {location && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Current Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </Typography>
            )}

            {!tracking ? (
              <Button
                variant="contained"
                size="large"
                startIcon={<LocationOn />}
                onClick={startTracking}
                sx={{ px: 4 }}
              >
                Start Tracking
              </Button>
            ) : (
              <Box>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<Stop />}
                  onClick={stopTracking}
                  sx={{ px: 4, mb: 2 }}
                >
                  End Journey
                </Button>
              </Box>
            )}
          </Box>
        </Paper>

        {tracking && (
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Emergency Actions
            </Typography>

            <Button
              variant="contained"
              color="error"
              fullWidth
              size="large"
              startIcon={<Phone />}
              onClick={sendSOS}
              sx={{ mb: 2 }}
            >
              Send SOS Alert
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Press to immediately alert your emergency contacts
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default TrackJourney;
