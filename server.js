import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import connectDB, { sequelize } from './config/db.js'
import './models/associations.js'
import { errorHandler } from './middleware/errorHandler.js'
import { setupSocketHandlers } from './services/socketHandler.js'
import User from './models/User.js'

import authRoutes from './routes/auth.js'
import riderRoutes from './routes/riders.js'
import deliveryRoutes from './routes/deliveries.js'
import routeRoutes from './routes/routes.js'
import analyticsRoutes from './routes/analytics.js'
import trackingRoutes from './routes/tracking.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? process.env.CLIENT_URL
      : [/^http:\/\/localhost:\d+$/],
    credentials: true
  }
})

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.CLIENT_URL
    : [/^http:\/\/localhost:\d+$/],
  credentials: true
}))
app.use(compression())
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Attach io to requests
app.use((req, res, next) => { req.io = io; next() })

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/riders', riderRoutes)
app.use('/api/deliveries', deliveryRoutes)
app.use('/api/routes', routeRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/tracking', trackingRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() })
})

// Error handling
app.use(errorHandler)

// Socket.IO setup
setupSocketHandlers(io)

const PORT = process.env.PORT || 5000

const seedAdmin = async () => {
  try {
    const userCount = await User.count()
    if (userCount === 0) {
      await User.create({
        name: process.env.ADMIN_NAME || 'Admin User',
        email: process.env.ADMIN_EMAIL || 'admin@smartlogistics.com',
        password: process.env.ADMIN_PASSWORD || 'password123',
        role: 'admin',
        phone: process.env.ADMIN_PHONE || '+234 800 000 0000',
      })
      console.log('Admin user seeded')
    }
  } catch (error) {
    console.error('Seed error:', error.message)
  }
}

connectDB().then(async () => {
  await seedAdmin()
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}).catch(err => {
  console.error('Failed to start server:', err.message || err)
  process.exit(1)
})

export { io, sequelize }
