import express from 'express'
import { Op } from 'sequelize'
import Delivery from '../models/Delivery.js'
import Rider from '../models/Rider.js'
import Route from '../models/Route.js'
import Package from '../models/Package.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res, next) => {
  try {
    const { status, rider, search, limit = 20, page = 1, sort = '-createdAt' } = req.query
    const where = {}

    if (status) where.status = status
    if (rider) where.riderId = rider
    if (search) {
      where[Op.or] = [
        { trackingNumber: { [Op.like]: `%${search}%` } },
        { customerName: { [Op.like]: `%${search}%` } },
        { customerPhone: { [Op.like]: `%${search}%` } },
        { destinationAddress: { [Op.like]: `%${search}%` } }
      ]
    }

    const sortField = sort.startsWith('-') ? sort.slice(1) : sort
    const sortDir = sort.startsWith('-') ? 'DESC' : 'ASC'

    const skip = (Number(page) - 1) * Number(limit)

    const { count: total, rows: deliveries } = await Delivery.findAndCountAll({
      where,
      include: [
        { model: Rider, as: 'rider', attributes: ['id', 'name', 'phone', 'rating', 'vehicle', 'lat', 'lng'] }
      ],
      order: [[sortField, sortDir]],
      offset: skip,
      limit: Number(limit)
    })

    res.json({
      success: true,
      count: deliveries.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      deliveries
    })
  } catch (error) {
    next(error)
  }
})

router.get('/active', protect, async (req, res, next) => {
  try {
    const deliveries = await Delivery.findAll({
      where: { status: 'in-transit' },
      include: [
        { model: Rider, as: 'rider', attributes: ['id', 'name', 'phone', 'lat', 'lng', 'vehicle'] }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json({ success: true, deliveries })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', protect, async (req, res, next) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id, {
      include: [
        { model: Rider, as: 'rider', attributes: ['id', 'name', 'phone', 'rating', 'vehicle', 'lat', 'lng'] }
      ]
    })

    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' })
    res.json({ success: true, delivery })
  } catch (error) {
    next(error)
  }
})

router.post('/', protect, async (req, res, next) => {
  try {
    const body = { ...req.body, assignedById: req.user.id }

    if (body.customer) {
      body.customerName = body.customer.name
      body.customerPhone = body.customer.phone
      body.customerEmail = body.customer.email
      body.customerAddress = body.customer.address
      delete body.customer
    }
    if (body.origin) {
      body.originAddress = body.origin.address
      body.originLng = body.origin.coordinates?.[0]
      body.originLat = body.origin.coordinates?.[1]
      delete body.origin
    }
    if (body.destination) {
      body.destinationAddress = body.destination.address
      body.destinationLng = body.destination.coordinates?.[0]
      body.destinationLat = body.destination.coordinates?.[1]
      delete body.destination
    }
    if (body.package) {
      body.packageType = body.package.type
      body.packageWeight = body.package.weight
      body.packageLength = body.package.dimensions?.length
      body.packageWidth = body.package.dimensions?.width
      body.packageHeight = body.package.dimensions?.height
      body.packageDescription = body.package.description
      body.packageValue = body.package.value
      body.packageIsFragile = body.package.isFragile
      delete body.package
    }
    if (body.rider) {
      body.riderId = body.rider
      delete body.rider
      await Rider.update({ status: 'busy', currentDeliveryId: null }, { where: { id: body.riderId } })
    }

    const delivery = await Delivery.create(body)

    res.status(201).json({ success: true, delivery })
  } catch (error) {
    next(error)
  }
})

router.post('/:id/assign', protect, restrictTo('admin', 'dispatcher', 'manager'), async (req, res, next) => {
  try {
    const { riderId } = req.body

    const delivery = await Delivery.findByPk(req.params.id)
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' })

    const rider = await Rider.findByPk(riderId)
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' })
    if (rider.status === 'busy') return res.status(400).json({ success: false, message: 'Rider is already busy' })

    delivery.riderId = riderId
    delivery.status = 'assigned'
    delivery.assignedAt = new Date()
    delivery.assignedById = req.user.id
    await delivery.save()

    rider.status = 'busy'
    rider.currentDeliveryId = delivery.id
    await rider.save()

    if (req.io) {
      req.io.to(`rider_${riderId}`).emit('newAssignment', { delivery })
      req.io.emit('deliveryUpdated', { deliveryId: delivery.id, status: 'assigned', rider: rider.name })
    }

    const updated = await Delivery.findByPk(delivery.id, {
      include: [{ model: Rider, as: 'rider', attributes: ['id', 'name', 'phone'] }]
    })

    res.json({ success: true, delivery: updated })
  } catch (error) {
    next(error)
  }
})

router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status, location, note } = req.body

    const delivery = await Delivery.findByPk(req.params.id)
    if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' })

    const oldStatus = delivery.status
    delivery.status = status

    if (status === 'in-transit' && !delivery.pickupTime) delivery.pickupTime = new Date()
    if (status === 'delivered') {
      delivery.deliveryTime = new Date()
      if (delivery.riderId) {
        await Rider.update({ status: 'active', currentDeliveryId: null }, { where: { id: delivery.riderId } })
        await Rider.increment({ totalDeliveries: 1 }, { where: { id: delivery.riderId } })
      }
    }
    if (status === 'cancelled' && delivery.riderId) {
      await Rider.update({ status: 'active', currentDeliveryId: null }, { where: { id: delivery.riderId } })
    }

    const historyEntry = {
      status,
      location: location ? { coordinates: location } : null,
      timestamp: new Date(),
      note: note || `Status changed from ${oldStatus} to ${status}`
    }
    const history = delivery.trackingHistory || []
    history.push(historyEntry)
    delivery.trackingHistory = history

    await delivery.save()

    if (req.io) {
      req.io.emit('statusUpdate', {
        deliveryId: delivery.id,
        status,
        trackingHistory: delivery.trackingHistory
      })
    }

    res.json({ success: true, delivery })
  } catch (error) {
    next(error)
  }
})

router.put('/:id/location', protect, async (req, res, next) => {
  try {
    const { coordinates } = req.body
    await Delivery.update({
      currentLng: coordinates[0],
      currentLat: coordinates[1],
      currentLocationTimestamp: new Date()
    }, { where: { id: req.params.id } })

    const delivery = await Delivery.findByPk(req.params.id)

    if (req.io) {
      req.io.emit('deliveryLocation', { deliveryId: delivery.id, location: coordinates })
    }

    res.json({ success: true, delivery })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    await Rider.update({ currentDeliveryId: null }, { where: { currentDeliveryId: req.params.id } })
    await Package.destroy({ where: { deliveryId: req.params.id } })
    await Delivery.destroy({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Delivery deleted' })
  } catch (error) {
    next(error)
  }
})

export default router
