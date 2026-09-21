import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

const PACKAGE_STATUSES = ['registered', 'picked-up', 'in-transit', 'at-hub', 'out-for-delivery', 'delivered', 'returned']
const CATEGORIES = ['electronics', 'clothing', 'food', 'documents', 'fragile', 'other']

const Package = sequelize.define('Package', {
  trackingNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
  deliveryId: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM(...PACKAGE_STATUSES),
    defaultValue: 'registered'
  },
  weight: { type: DataTypes.FLOAT, allowNull: false },
  length: { type: DataTypes.FLOAT, defaultValue: null },
  width: { type: DataTypes.FLOAT, defaultValue: null },
  height: { type: DataTypes.FLOAT, defaultValue: null },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: {
    type: DataTypes.ENUM(...CATEGORIES),
    defaultValue: 'other'
  },
  value: { type: DataTypes.FLOAT, defaultValue: 0 },
  isFragile: { type: DataTypes.BOOLEAN, defaultValue: false },
  requiresSignature: { type: DataTypes.BOOLEAN, defaultValue: false },
  temperatureControlled: { type: DataTypes.BOOLEAN, defaultValue: false },
  photos: { type: DataTypes.JSON, defaultValue: [] },
  barcode: { type: DataTypes.STRING, defaultValue: null },
  qrCode: { type: DataTypes.STRING, defaultValue: null }
}, { timestamps: true })

export default Package
