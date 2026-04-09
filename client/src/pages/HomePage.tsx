import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
} from '@mui/material';
import {
  Shield,
  LocationOn,
  Group,
  Phone,
  Map,
  History,
} from '@mui/icons-material';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      title: 'Live Location Sharing',
      description: 'Share your real-time location with trusted contacts during your journey',
    },
    {
      icon: <Phone sx={{ fontSize: 40 }} />,
      title: 'Emergency SOS',
      description: 'Instant alerts to your emergency contacts with one tap',
    },
    {
      icon: <Map sx={{ fontSize: 40 }} />,
      title: 'Safe Routes',
      description: 'Find well-lit, populated routes with nearby safe spots',
    },
    {
      icon: <Group sx={{ fontSize: 40 }} />,
      title: 'Community Safety',
      description: 'Crowdsourced safety reports and danger zone heatmaps',
    },
    {
      icon: <Shield sx={{ fontSize: 40 }} />,
      title: 'Fake Call',
      description: 'Simulate incoming calls for quick exits from uncomfortable situations',
    },
    {
      icon: <History sx={{ fontSize: 40 }} />,
      title: 'Journey History',
      description: 'Track and review all your past trips for safety records',
    },
  ];

  return (
    <Box>
      <AppBar position="static" elevation={0}>
        <Toolbar>
          <Shield sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SafeCommute
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button
            color="inherit"
            variant="outlined"
            sx={{ ml: 2 }}
            onClick={() => navigate('/register')}
          >
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          background: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
          color: 'white',
          py: 10,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
            Travel with Confidence
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Your safety companion for every journey
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              px: 4,
              py: 1.5,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.9)',
              },
            }}
            onClick={() => navigate('/register')}
          >
            Get Started Free
          </Button>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          fontWeight={600}
          sx={{ mb: 6 }}
        >
          Features
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                elevation={2}
                sx={{
                  height: '100%',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                  },
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4 }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h4" gutterBottom fontWeight={600}>
            Ready to feel safer?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Join thousands of women who trust SafeCommute for their daily travels
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/register')}
          >
            Start Your Journey
          </Button>
        </Box>
      </Container>

      <Box
        sx={{
          bgcolor: 'grey.900',
          color: 'white',
          py: 4,
          mt: 8,
          textAlign: 'center',
        }}
      >
        <Typography variant="body2">
          © 2026 SafeCommute. Built with care for women's safety.
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
