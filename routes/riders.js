import express from 'express'
import { Op } from 'sequelize'
import Rider from '../models/Rider.js'
import Delivery from '../models/Delivery.js'
import Route from '../models/Route.js'
import { protect, restrictTo } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res, next) => {
  try {
    const { status, search, near, radius = 5000 } = req.query
    const where = { isActive: true }

    if (status) where.status = status
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    }

    const riders = await Rider.findAll({ where, order: [['createdAt', 'DESC']] })
    res.json({ success: true, count: riders.length, riders })
  } catch (error) {
    next(error)
  }
})

router.get('/active', protect, async (req, res, next) => {
  try {
    const riders = await Rider.findAll({
      where: { status: { [Op.in]: ['active', 'busy'] }, isActive: true },
      attributes: ['id', 'name', 'status', 'lat', 'lng', 'vehicle', 'rating', 'totalDeliveries']
    })

    res.json({ success: true, riders })
  } catch (error) {
    next(error)
  }
})

router.get('/:id', protect, async (req, res, next) => {
  try {
    const rider = await Rider.findByPk(req.params.id)
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' })

    const recentDeliveries = await Delivery.findAll({
      where: { riderId: rider.id },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['id', 'trackingNumber', 'status', 'destinationAddress', 'createdAt']
    })

    res.json({ success: true, rider: { ...rider.toJSON(), recentDeliveries } })
  } catch (error) {
    next(error)
  }
})

router.post('/', protect, restrictTo('admin', 'manager'), async (req, res, next) => {
  try {
    const rider = await Rider.create(req.body)
    res.status(201).json({ success: true, rider })
  } catch (error) {
    next(error)
  }
})

router.delete('/:id', protect, restrictTo('admin'), async (req, res, next) => {
  try {
    await Delivery.update({ riderId: null }, { where: { riderId: req.params.id } })
    await Route.destroy({ where: { riderId: req.params.id } })
    await Rider.update({ currentDeliveryId: null }, { where: { id: req.params.id } })
    await Rider.destroy({ where: { id: req.params.id } })
    res.json({ success: true, message: 'Rider deleted' })
  } catch (error) {
    next(error)
  }
})

router.put('/:id/location', protect, async (req, res, next) => {
  try {
    const { coordinates } = req.body
    await Rider.update({
      lng: coordinates[0],
      lat: coordinates[1],
      lastLocationUpdate: new Date()
    }, { where: { id: req.params.id } })

    const rider = await Rider.findByPk(req.params.id)

    if (req.io) {
      req.io.emit('locationUpdate', { riderId: rider.id, location: { coordinates } })
    }

    res.json({ success: true, rider })
  } catch (error) {
    next(error)
  }
})

router.put('/:id/status', protect, async (req, res, next) => {
  try {
    const { status } = req.body
    await Rider.update({ status }, { where: { id: req.params.id } })
    const rider = await Rider.findByPk(req.params.id)
    res.json({ success: true, rider })
  } catch (error) {
    next(error)
  }
})

router.get('/:id/analytics', protect, async (req, res, next) => {
  try {
    const { period = 'week' } = req.query
    const rider = await Rider.findByPk(req.params.id)
    if (!rider) return res.status(404).json({ success: false, message: 'Rider not found' })

    const daysAgo = period === 'week' ? 7 : period === 'month' ? 30 : 1
    const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)

    const deliveries = await Delivery.findAll({
      where: {
        riderId: req.params.id,
        createdAt: { [Op.gte]: startDate }
      }
    })

    const stats = {
      totalDeliveries: deliveries.length,
      completed: deliveries.filter(d => d.status === 'delivered').length,
      cancelled: deliveries.filter(d => d.status === 'cancelled').length,
      avgDeliveryTime: deliveries.filter(d => d.deliveryTime && d.pickupTime).reduce((acc, d) =>
        acc + (new Date(d.deliveryTime) - new Date(d.pickupTime)) / 60000, 0) / deliveries.filter(d => d.deliveryTime).length || 0,
      earnings: deliveries.reduce((acc, d) => acc + (d.deliveryFee || 0), 0)
    }

    res.json({ success: true, stats })
  } catch (error) {
    next(error)
  }
})

export default router
