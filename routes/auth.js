import express from 'express'
import { body, validationResult } from 'express-validator'
import { Op } from 'sequelize'
import User from '../models/User.js'
import Rider from '../models/Rider.js'
import { protect, generateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { name, email, password, role } = req.body

    const existingUser = await User.findOne({ where: { email } })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' })
    }

    const user = await User.create({ name, email, password, role: role || 'dispatcher' })
    const token = generateToken(user.id)

    res.status(201).json({
      success: true,
      token,
      user
    })
  } catch (error) {
    next(error)
  }
})

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { email, password } = req.body

    let user = await User.findOne({ where: { email } })
    let isRider = false

    if (!user) {
      user = await Rider.findOne({ where: { email } })
      isRider = true
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' })
    }

    user.lastLogin = new Date()
    await user.save()

    const token = generateToken(user.id)

    res.json({
      success: true,
      token,
      user: { ...user.toJSON(), role: isRider ? 'rider' : user.role }
    })
  } catch (error) {
    next(error)
  }
})

router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user })
})

router.put('/profile', protect, async (req, res, next) => {
  try {
    const updates = {}
    const allowed = ['name', 'phone', 'avatar', 'preferences']
    allowed.forEach(field => { if (req.body[field]) updates[field] = req.body[field] })

    await User.update(updates, { where: { id: req.user.id } })
    const user = await User.findByPk(req.user.id)
    res.json({ success: true, user })
  } catch (error) {
    next(error)
  }
})

export default router
