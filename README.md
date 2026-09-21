# 🚚 Smart Logistics / Dispatch Platform

> AI-powered logistics and dispatch management platform built for African businesses.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)](https://mongodb.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7-010101?logo=socket.io)](https://socket.io)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

---

## ✨ Features

### Core Functionality
- 📦 **Delivery Management** - Create, track, and manage deliveries with unique tracking numbers
- 🏍️ **Rider Fleet** - Manage riders, vehicles, assignments, and performance
- 🗺️ **Live Tracking** - Real-time GPS tracking of riders and deliveries on interactive maps
- 🤖 **AI Route Optimization** - Multiple algorithms (Nearest Neighbor, Genetic, Priority-based, Capacity)
- 📊 **Analytics Dashboard** - Comprehensive KPIs, charts, and performance metrics
- 🔔 **Real-time Updates** - WebSocket-powered live notifications and status updates

### PWA Features
- 📱 **Installable** - Works as a standalone app on mobile and desktop
- 🌐 **Offline Support** - Service worker caching for critical assets
- 🔔 **Push Notifications** - Background sync and push notification support
- ⚡ **Fast Loading** - Optimized caching strategies
- 🔄 **Background Sync** - Queue operations when offline

### African Logistics Optimized
- 🌍 **Lagos/Nigeria Default** - Pre-configured for African urban logistics
- 💰 **Naira (₦) Currency** - Local currency support
- 📍 **OpenStreetMap** - Free, reliable mapping for African regions
- 🚦 **Traffic-aware Estimates** - Realistic delivery times for African cities
- 📱 **Low-bandwidth Ready** - Optimized for varying network conditions

---

## 🏗️ Architecture

```
smart-logistics/
├── client/                 # React Frontend (Vite + Tailwind)
│   ├── public/            # PWA assets, service worker
│   └── src/
│       ├── components/    # UI Components
│       │   ├── Dashboard/
│       │   ├── Riders/
│       │   ├── Deliveries/
│       │   ├── Routes/
│       │   ├── Tracking/
│       │   ├── Analytics/
│       │   └── Auth/
│       ├── context/       # React Context (Auth, Socket)
│       ├── hooks/         # Custom hooks
│       └── utils/         # Helpers & API client
│
├── server/                 # Node.js Backend (Express)
│   ├── models/            # MongoDB Models
│   │   ├── User.js
│   │   ├── Rider.js
│   │   ├── Delivery.js
│   │   ├── Route.js
│   │   └── Package.js
│   ├── routes/            # API Routes
│   ├── middleware/        # Auth & Error Handling
│   ├── services/          # Business Logic
│   │   ├── routeOptimizer.js    # AI Algorithms
│   │   ├── notificationService.js
│   │   └── socketHandler.js
│   └── utils/             # Geospatial utilities
│
└── docker-compose.yml      # Full stack orchestration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- MongoDB 7.0+
- npm or yarn

### 1. Clone & Install

```bash
git clone <repository-url>
cd smart-logistics

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 2. Environment Setup

```bash
# Server
cd server
cp .env.example .env

# Edit .env with your values:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/smart-logistics
# JWT_SECRET=your-super-secret-key
# JWT_EXPIRE=7d
```

### 3. Seed Database

```bash
cd server
npm run seed
```

This creates:
- Admin user: `admin@smartlogistics.com` / `password123`
- 5 demo riders
- 5 demo deliveries

### 4. Start Development

```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

The app will be available at:
- **Client**: http://localhost:3000
- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/health

### 5. Docker (Alternative)

```bash
# Start everything with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

---

## 📱 PWA Installation

### Chrome/Edge Desktop
1. Open http://localhost:3000
2. Click the install icon (➕) in the address bar
3. Launch from desktop/start menu

### Chrome Android
1. Open the site in Chrome
2. Tap "Add to Home Screen" in the menu
3. Install as standalone app

### Safari iOS
1. Open in Safari
2. Tap Share → "Add to Home Screen"
3. Launch like a native app

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user/rider |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |

### Riders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/riders` | List all riders |
| GET | `/api/riders/active` | Active riders with location |
| GET | `/api/riders/:id` | Get rider details |
| POST | `/api/riders` | Create rider (Admin) |
| PUT | `/api/riders/:id/location` | Update location |
| PUT | `/api/riders/:id/status` | Update status |
| GET | `/api/riders/:id/analytics` | Rider analytics |

### Deliveries
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/deliveries` | List deliveries |
| GET | `/api/deliveries/active` | Active deliveries |
| POST | `/api/deliveries` | Create delivery |
| POST | `/api/deliveries/:id/assign` | Assign rider |
| PUT | `/api/deliveries/:id/status` | Update status |
| PUT | `/api/deliveries/:id/location` | Update location |

### Routes & Optimization
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/routes/optimize` | AI route optimization |
| GET | `/api/routes` | List routes |
| POST | `/api/routes` | Create route |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics` | Detailed analytics |
| GET | `/api/analytics/rider/:id` | Rider analytics |

### Tracking
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tracking/:trackingNumber` | Public tracking |
| GET | `/api/tracking/live/all` | Live tracking data |
| POST | `/api/tracking/:id/update` | Update location |

---

## 🤖 AI Route Optimization

The platform includes multiple optimization algorithms:

1. **Nearest Neighbor** - Fast, simple greedy approach
2. **Genetic Algorithm** - Evolutionary optimization for complex routes
3. **Priority-based** - Sorts by urgency (urgent → high → normal → low)
4. **Capacity-optimized** - Balances vehicle load limits

### Usage
```javascript
// Request optimization
POST /api/routes/optimize
{
  "deliveryIds": ["id1", "id2", "id3"],
  "algorithm": "genetic",
  "startPoint": [3.3792, 6.5244]
}

// Response
{
  "waypoints": [...],
  "totalDistance": 28.5,
  "estimatedTime": 142,
  "fuelSavings": 15,
  "algorithm": "genetic"
}
```

---

## 🗺️ Real-time Features

### WebSocket Events
```javascript
// Client-side connection
const socket = io('ws://localhost:5000', {
  auth: { token: localStorage.getItem('token') }
})

// Listen for updates
socket.on('locationUpdate', (data) => {
  console.log('Rider moved:', data)
})

socket.on('deliveryStatusUpdate', (data) => {
  console.log('Status changed:', data)
})

socket.on('newAssignment', (data) => {
  console.log('New delivery assigned:', data)
})
```

---

## 📊 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Leaflet** - Maps
- **Chart.js** - Analytics charts
- **Socket.IO Client** - Real-time communication
- **Framer Motion** - Animations
- **Lucide React** - Icons
- **Zustand** - State management

### Backend
- **Express.js** - Web framework
- **MongoDB + Mongoose** - Database
- **Socket.IO** - WebSocket server
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **Winston** - Logging

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Orchestration
- **PWA** - Progressive Web App

---

## 🌍 Why This Works for Africa

1. **Offline-first PWA** - Works with intermittent connectivity
2. **OpenStreetMap** - Free, detailed African maps
3. **Naira Currency** - Local financial context
4. **Traffic-aware** - Realistic urban African delivery estimates
5. **Low-bandwidth** - Optimized assets and caching
6. **Mobile-first** - Designed for smartphone-dominant markets
7. **Multi-algorithm routing** - Handles poor road infrastructure
8. **SMS-ready** - Architecture supports Africa's Talking integration

---

## 📝 License

MIT License - Built for African logistics innovation.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For support, email support@smartlogistics.com or join our Slack channel.

**Built with ❤️ for African Logistics**
