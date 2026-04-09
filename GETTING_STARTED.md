# Quick Start Guide

## Prerequisites

Before you begin, ensure you have:
- Node.js 18+ installed
- Git installed
- A code editor (VS Code recommended)

## Installation Steps

### 1. Clone or Download

If you haven't already, navigate to your project folder:
```bash
cd c:\Users\v-kavysharma\Downloads\ProjectResume
```

### 2. Install Dependencies

Install both client and server dependencies:

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 3. Configure Environment Variables

**Client (.env file in client folder):**
```bash
cd client
copy .env.example .env
```

Edit `client/.env` and add your API keys:
- Get Google Maps API key from: https://console.cloud.google.com
- Get Firebase config from: https://console.firebase.google.com

**Server (.env file in server folder):**
```bash
cd ../server
copy .env.example .env
```

Edit `server/.env` with your configurations.

### 4. Run the Application

Open **two terminal windows**:

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

The app will open at: http://localhost:3000

## Testing the App

1. Click "Sign Up" to create an account
2. Login with your credentials
3. Explore the dashboard
4. Try "Start Journey" to test location tracking
5. Add emergency contacts
6. Test the SOS feature

## Common Issues

**Error: "Cannot find module"**
- Solution: Run `npm install` again

**Port already in use**
- Solution: Change PORT in server/.env file

**Location not working**
- Solution: Allow location access in browser settings

## Next Steps

- Customize the UI colors in `client/src/App.tsx` (theme section)
- Add your own features
- Deploy to Netlify and Render (see DEPLOYMENT.md)

## Need Help?

Check the README.md files in:
- `/README.md` - Project overview
- `/client/README.md` - Frontend details
- `/server/README.md` - Backend API docs
- `/DEPLOYMENT.md` - Deployment guide
