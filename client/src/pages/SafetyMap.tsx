import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { ArrowBack, Map } from '@mui/icons-material';

const SafetyMap: React.FC = () => {
  const navigate = useNavigate();

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
            Safety Map
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center', minHeight: '500px' }}>
          <Map sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Community Safety Map
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Interactive map with safety reports coming soon
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This feature will show crowdsourced incident reports and safety heatmaps
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default SafetyMap;
