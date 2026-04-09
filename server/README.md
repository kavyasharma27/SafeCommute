# SafeCommute Server

Backend API for SafeCommute application.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`

4. Run development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Contacts
- `GET /api/contacts` - Get all emergency contacts
- `POST /api/contacts` - Add new contact
- `DELETE /api/contacts/:id` - Delete contact

### Journeys
- `GET /api/journeys` - Get journey history
- `POST /api/journeys/start` - Start new journey
- `PUT /api/journeys/:id/end` - End journey
- `POST /api/journeys/sos` - Send SOS alert

## Deployment

Deploy to Render or Railway:
```bash
npm run build
npm start
```
