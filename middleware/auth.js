import jwt from 'jsonwebtoken'
import { Op } from 'sequelize'
import User from '../models/User.js'
import Rider from '../models/Rider.js'

export const protect = async (req, res, next) => {
  try {
    let token

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    let user = await User.findByPk(decoded.id)
    if (!user) {
      user = await Rider.findByPk(decoded.id)
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    req.user = user
    next()
  } catch (error) {
    res.status(401).json({ success: false, message: 'Not authorized, token failed' })
  }
}

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this action' })
    }
    next()
  }
}

export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}
