# Deployment Guide

## Frontend Deployment (Netlify)

1. Push your code to GitHub

2. Go to [Netlify](https://netlify.com) and sign in

3. Click "Add new site" → "Import an existing project"

4. Connect your GitHub repository

5. Configure build settings:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`

6. Add environment variables in Netlify:
   - `REACT_APP_GOOGLE_MAPS_API_KEY`
   - `REACT_APP_API_URL` (your backend URL)
   - Add other Firebase variables

7. Deploy!

## Backend Deployment (Render / Railway)

### Option 1: Render

1. Go to [Render](https://render.com) and sign in

2. Click "New +" → "Web Service"

3. Connect your GitHub repository

4. Configure:
   - Name: `safecommute-api`
   - Root Directory: `server`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. Add environment variables (from `.env.example`)

6. Deploy!

### Option 2: Railway

1. Go to [Railway](https://railway.app) and sign in

2. Click "New Project" → "Deploy from GitHub repo"

3. Select your repository

4. Configure root directory: `server`

5. Add environment variables

6. Deploy!

## Database (Supabase)

1. Go to [Supabase](https://supabase.com)

2. Create new project

3. Get your PostgreSQL connection details

4. Add to your backend environment variables:
   - `DB_HOST`
   - `DB_PORT`
   - `DB_NAME`
   - `DB_USER`
   - `DB_PASSWORD`

## Update Frontend API URL

After deploying backend, update in client:
```
REACT_APP_API_URL=https://your-backend-url.onrender.com/api
```

Redeploy frontend.

## Testing

Visit your Netlify URL and test the application!
