import express from 'express'
import Delivery from '../models/Delivery.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/:trackingNumber', async (req, res, next) => {
  try {
    const delivery = await Delivery.findOne({
      where: { trackingNumber: req.params.trackingNumber },
      attributes: ['id', 'trackingNumber', 'status', 'customerName', 'customerAddress', 'destinationAddress', 'destinationLng', 'destinationLat', 'packageType', 'packageWeight', 'trackingHistory', 'currentLng', 'currentLat', 'estimatedDeliveryTime', 'createdAt']
    })

    if (!delivery) return res.status(404).json({ success: false, message: 'Tracking number not found' })

    res.json({ success: true, delivery })
  } catch (error) {
    next(error)
  }
})

router.get('/live/all', protect, async (req, res, next) => {
  try {
    const deliveries = await Delivery.findAll({
      where: { status: 'in-transit' },
      attributes: ['id', 'trackingNumber', 'destinationAddress', 'currentLng', 'currentLat', 'estimatedDeliveryTime', 'riderId']
    })

    res.json({ success: true, deliveries })
  } catch (error) {
    next(error)
  }
})

router.post('/:id/update', protect, async (req, res, next) => {
  try {
    const { coordinates, note } = req.body

    const delivery = await Delivery.findByPk(req.params.id)

    const history = delivery.trackingHistory || []
    history.push({
      status: 'in-transit',
      location: { coordinates },
      timestamp: new Date(),
      note
    })

    await Delivery.update({
      currentLng: coordinates[0],
      currentLat: coordinates[1],
      currentLocationTimestamp: new Date(),
      trackingHistory: history
    }, { where: { id: req.params.id } })

    const updated = await Delivery.findByPk(req.params.id)

    if (req.io) {
      req.io.emit('locationUpdate', {
        deliveryId: updated.id,
        location: coordinates,
        timestamp: new Date()
      })
    }

    res.json({ success: true, delivery: updated })
  } catch (error) {
    next(error)
  }
})

export default router
