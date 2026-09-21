import { DataTypes } from 'sequelize'
import bcrypt from 'bcryptjs'
import { sequelize } from '../config/db.js'

const RIDER_STATUSES = ['active', 'offline', 'busy', 'suspended']
const VEHICLE_TYPES = ['Bike', 'Van', 'Truck', 'Bicycle']

const Rider = sequelize.define('Rider', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  phone: { type: DataTypes.STRING, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM(...RIDER_STATUSES), defaultValue: 'offline' },
  vehicle: { type: DataTypes.ENUM(...VEHICLE_TYPES), defaultValue: 'Bike' },
  vehicleNumber: { type: DataTypes.STRING, defaultValue: null },
  licenseNumber: { type: DataTypes.STRING, defaultValue: null },
  rating: { type: DataTypes.FLOAT, defaultValue: 5.0 },
  totalDeliveries: { type: DataTypes.INTEGER, defaultValue: 0 },
  totalEarnings: { type: DataTypes.FLOAT, defaultValue: 0 },
  lat: { type: DataTypes.FLOAT, defaultValue: 6.5244 },
  lng: { type: DataTypes.FLOAT, defaultValue: 3.3792 },
  currentDeliveryId: { type: DataTypes.INTEGER, defaultValue: null },
  isVerified: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLocationUpdate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  workingHours: { type: DataTypes.JSON, defaultValue: [] },
  avgDeliveryTime: { type: DataTypes.FLOAT, defaultValue: 0 },
  onTimeRate: { type: DataTypes.FLOAT, defaultValue: 100 },
  customerRating: { type: DataTypes.FLOAT, defaultValue: 5.0 },
  documents: {
    type: DataTypes.JSON,
    defaultValue: { idCard: null, license: null, insurance: null }
  }
}, { timestamps: true })

Rider.beforeSave(async (rider) => {
  if (rider.changed('password')) {
    rider.password = await bcrypt.hash(rider.password, 12)
  }
})

Rider.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

Rider.prototype.toJSON = function() {
  const values = { ...this.get() }
  delete values.password
  return values
}

export default Rider
