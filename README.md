# SafeCommute - Women's Safety Travel Application 🚀

A comprehensive safety companion app for travelers with real-time tracking, emergency alerts, and instant notifications.

![SafeCommute](https://img.shields.io/badge/Status-Production%20Ready-success)
![React](https://img.shields.io/badge/React-18.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)
![Supabase](https://img.shields.io/badge/Database-Supabase-orange)

## ✨ Features

### Core Features
- 🔐 **Secure Authentication** - JWT-based user registration and login
- 👥 **Emergency Contacts** - Add SafeCommute users as emergency contacts
- 🗺️ **Journey Tracking** - Real-time GPS tracking with live location updates
- 🚨 **SOS Alerts** - One-tap emergency alerts with location sharing
- 💬 **Real-time Chat** - Instant messaging with emergency contacts
- 🔔 **Push Notifications** - Get notified when contacts start journeys or send alerts
- 👤 **Profile Management** - Edit your profile and username
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📅 **Accurate Timestamps** - IST timezone support with date/time display

### Technical Features
- ✅ Fully responsive design (mobile, tablet, desktop)
- ✅ Real-time data synchronization
- ✅ Secure database with Row Level Security (RLS)
- ✅ Password encryption with bcrypt
- ✅ Email notifications via Resend API
- ✅ Material-UI components for beautiful UX
- ✅ TypeScript for type safety

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI** for UI components
- **React Router** for navigation
- **Context API** for theme management

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **JWT** for authentication
- **bcrypt** for password hashing

### Database & Services
- **Supabase** (PostgreSQL) for data storage
- **Resend API** for email notifications
- **Row Level Security** for data protection

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Resend API key (for email notifications)

### 1. Clone the Repository
```bash
git clone https://github.com/kavyasharma27/SafeCommute.git
cd SafeCommute
```

### 2. Install Dependencies

**Backend:**
```bash
cd server
npm install
```

**Frontend:**
```bash
cd client
npm install
```

### 3. Environment Variables

**Backend (.env in `/server`):**
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
RESEND_API_KEY=your_resend_api_key
JWT_SECRET=your_random_secret_key
PORT=5000
```

**Frontend (.env in `/client`):**
```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. Database Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project
3. Go to SQL Editor
4. Run the `SUPABASE_SETUP.sql` file from the root directory

### 5. Run the Application

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm start
```

App will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy:
- **Frontend:** Netlify (configured with `netlify.toml`)
- **Backend:** Render or Railway
- **Database:** Supabase (already cloud-based)

## 📱 Usage

1. **Register** - Create account with email
2. **Add Contacts** - Search users by username
3. **Start Journey** - Enable GPS tracking
4. **SOS** - One-tap emergency alerts
5. **Chat** - Message emergency contacts

## 🔒 Security

- Row Level Security (RLS) enabled
- Password hashing with bcrypt
- JWT token authentication
- Input validation on all endpoints

## 👩‍💻 Developer

**Kavya Sharma**
- GitHub: [@kavyasharma27](https://github.com/kavyasharma27)

## 📄 License

MIT License

---

**Made with ❤️ for Women's Safety**


1. Clone the repository
```bash
git clone https://github.com/yourusername/safecommute.git
cd safecommute
```

2. Install dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Configure environment variables (see `.env.example` files)

4. Start development servers
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm start
```

## Deployment

- **Frontend**: Deployed on Netlify
- **Backend**: Deployed on Render/Railway
- **Database**: Supabase PostgreSQL

## Contributing

This is a personal portfolio project, but suggestions and feedback are welcome!

## License

MIT License - Feel free to use this project for learning purposes.

## Contact

Kavya Sharma - kavyasharma2704@gmail.com
GitHub: [@kavyasharma27](https://github.com/kavyasharma27)
LinkedIn: [kavya-sharma](https://linkedin.com/in/kavya-sharma)
