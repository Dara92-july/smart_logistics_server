import express from 'express'
import { Op } from 'sequelize'
import Route from '../models/Route.js'
import Delivery from '../models/Delivery.js'
import { protect } from '../middleware/auth.js'
import { optimizeRoute } from '../services/routeOptimizer.js'

const router = express.Router()

router.post('/optimize', protect, async (req, res, next) => {
  try {
    const { deliveryIds, algorithm = 'nearest-neighbor', startPoint } = req.body

    const deliveries = await Delivery.findAll({
      where: { id: { [Op.in]: deliveryIds }, status: 'pending' }
    })

    if (deliveries.length === 0) {
      return res.status(400).json({ success: false, message: 'No pending deliveries found' })
    }

    const result = await optimizeRoute(deliveries, algorithm, startPoint)

    res.json({
      success: true,
      route: result.waypoints,
      totalDistance: result.totalDistance,
      estimatedTime: result.estimatedTime,
      fuelSavings: result.fuelSavings,
      algorithm
    })
  } catch (error) {
    next(error)
  }
})

router.post('/', protect, async (req, res, next) => {
  try {
    const route = await Route.create(req.body)
    res.status(201).json({ success: true, route })
  } catch (error) {
    next(error)
  }
})

router.get('/', protect, async (req, res, next) => {
  try {
    const { status, rider } = req.query
    const where = {}
    if (status) where.status = status
    if (rider) where.riderId = rider

    const routes = await Route.findAll({ where, order: [['createdAt', 'DESC']] })

    res.json({ success: true, routes })
  } catch (error) {
    next(error)
  }
})

export default router
