import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

const DELIVERY_STATUSES = ['pending', 'assigned', 'in-transit', 'delivered', 'cancelled', 'failed']
const PRIORITIES = ['low', 'normal', 'high', 'urgent']
const PACKAGE_TYPES = ['Standard', 'Express', 'Fragile', 'Bulk', 'Perishable']
const SOURCES = ['web', 'api', 'mobile', 'import']

const Delivery = sequelize.define('Delivery', {
  trackingNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: {
    type: DataTypes.ENUM(...DELIVERY_STATUSES),
    defaultValue: 'pending'
  },
  priority: { type: DataTypes.ENUM(...PRIORITIES), defaultValue: 'normal' },
  customerName: { type: DataTypes.STRING, allowNull: false },
  customerPhone: { type: DataTypes.STRING, allowNull: false },
  customerEmail: { type: DataTypes.STRING, defaultValue: null },
  customerAddress: { type: DataTypes.STRING, allowNull: false },
  originAddress: { type: DataTypes.STRING, allowNull: false },
  originLng: { type: DataTypes.FLOAT, allowNull: false },
  originLat: { type: DataTypes.FLOAT, allowNull: false },
  destinationAddress: { type: DataTypes.STRING, allowNull: false },
  destinationLng: { type: DataTypes.FLOAT, allowNull: false },
  destinationLat: { type: DataTypes.FLOAT, allowNull: false },
  packageType: { type: DataTypes.ENUM(...PACKAGE_TYPES), defaultValue: 'Standard' },
  packageWeight: { type: DataTypes.FLOAT, allowNull: false },
  packageLength: { type: DataTypes.FLOAT, defaultValue: null },
  packageWidth: { type: DataTypes.FLOAT, defaultValue: null },
  packageHeight: { type: DataTypes.FLOAT, defaultValue: null },
  packageDescription: { type: DataTypes.TEXT, defaultValue: '' },
  packageValue: { type: DataTypes.FLOAT, defaultValue: 0 },
  packageIsFragile: { type: DataTypes.BOOLEAN, defaultValue: false },
  riderId: { type: DataTypes.INTEGER, defaultValue: null },
  assignedAt: { type: DataTypes.DATE, defaultValue: null },
  assignedById: { type: DataTypes.INTEGER, defaultValue: null },
  pickupTime: { type: DataTypes.DATE, defaultValue: null },
  deliveryTime: { type: DataTypes.DATE, defaultValue: null },
  estimatedDeliveryTime: { type: DataTypes.DATE, defaultValue: null },
  currentLng: { type: DataTypes.FLOAT, defaultValue: null },
  currentLat: { type: DataTypes.FLOAT, defaultValue: null },
  currentLocationTimestamp: { type: DataTypes.DATE, defaultValue: null },
  trackingHistory: { type: DataTypes.JSON, defaultValue: [] },
  deliveryFee: { type: DataTypes.FLOAT, defaultValue: 0 },
  insuranceFee: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalAmount: { type: DataTypes.FLOAT, defaultValue: 0 },
  rating: { type: DataTypes.INTEGER, defaultValue: null },
  feedback: { type: DataTypes.TEXT, defaultValue: null },
  notes: { type: DataTypes.TEXT, defaultValue: '' },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  source: { type: DataTypes.ENUM(...SOURCES), defaultValue: 'web' }
}, { timestamps: true })

Delivery.beforeCreate((delivery) => {
  if (!delivery.trackingNumber) {
    const date = new Date()
    const prefix = 'SL'
    const timestamp = date.getTime().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 5).toUpperCase()
    delivery.trackingNumber = `${prefix}-${timestamp}-${random}`
  }
})

export default Delivery
