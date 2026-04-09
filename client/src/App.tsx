import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import TrackJourney from './pages/TrackJourney';
import SafetyMap from './pages/SafetyMap';
import EmergencyContacts from './pages/EmergencyContacts';
import Notifications from './pages/Notifications';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PrivateRoute from './components/PrivateRoute';
import { ThemeContextProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/track" element={<TrackJourney />} />
            <Route path="/safety-map" element={<SafetyMap />} />
            <Route path="/contacts" element={<EmergencyContacts />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/chat/:contactUserId/:username" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </ThemeContextProvider>
  );
}

export default App;
