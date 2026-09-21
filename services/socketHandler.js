import jwt from 'jsonwebtoken'
import Rider from '../models/Rider.js'

export const setupSocketHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) return next(new Error('Authentication required'))

      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = decoded.id

      const rider = await Rider.findByPk(decoded.id)
      if (rider) {
        socket.riderId = rider.id.toString()
        socket.join(`rider_${rider.id}`)
      }

      next()
    } catch (err) {
      next(new Error('Invalid token'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id} (User: ${socket.userId})`)

    socket.join('dispatchers')

    socket.on('updateLocation', async (data) => {
      if (!socket.riderId) return

      try {
        await Rider.update({
          lng: data.coordinates[0],
          lat: data.coordinates[1],
          lastLocationUpdate: new Date()
        }, { where: { id: socket.riderId } })

        socket.to('dispatchers').emit('riderLocationUpdate', {
          riderId: socket.riderId,
          coordinates: data.coordinates,
          timestamp: new Date()
        })
      } catch (err) {
        console.error('Location update error:', err)
      }
    })

    socket.on('updateDeliveryStatus', (data) => {
      if (!socket.riderId) return

      io.emit('deliveryStatusUpdate', {
        deliveryId: data.deliveryId,
        status: data.status,
        riderId: socket.riderId,
        timestamp: new Date(),
        location: data.location
      })
    })

    socket.on('trackDelivery', (deliveryId) => {
      socket.join(`delivery_${deliveryId}`)
    })

    socket.on('untrackDelivery', (deliveryId) => {
      socket.leave(`delivery_${deliveryId}`)
    })

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`)
      if (socket.riderId) {
        setTimeout(async () => {
          const rooms = io.sockets.adapter.rooms
          const riderRoom = rooms.get(`rider_${socket.riderId}`)
          if (!riderRoom || riderRoom.size === 0) {
            await Rider.update({ status: 'offline' }, { where: { id: socket.riderId } })
            io.emit('riderOffline', { riderId: socket.riderId })
          }
        }, 30000)
      }
    })
  })
}
