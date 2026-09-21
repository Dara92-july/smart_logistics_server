import { DataTypes } from 'sequelize'
import { sequelize } from '../config/db.js'

const ROUTE_STATUSES = ['planned', 'active', 'completed', 'cancelled']
const ALGORITHMS = ['nearest-neighbor', 'genetic', 'priority', 'capacity', 'manual']

const Route = sequelize.define('Route', {
  name: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.ENUM(...ROUTE_STATUSES), defaultValue: 'planned' },
  riderId: { type: DataTypes.INTEGER, allowNull: false },
  deliveryIds: { type: DataTypes.JSON, defaultValue: [] },
  waypoints: { type: DataTypes.JSON, defaultValue: [] },
  algorithm: {
    type: DataTypes.ENUM(...ALGORITHMS),
    defaultValue: 'manual'
  },
  optimizationScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  totalDistance: { type: DataTypes.FLOAT, defaultValue: 0 },
  estimatedDuration: { type: DataTypes.FLOAT, defaultValue: 0 },
  actualDuration: { type: DataTypes.FLOAT, defaultValue: 0 },
  fuelConsumption: { type: DataTypes.FLOAT, defaultValue: 0 },
  startTime: { type: DataTypes.DATE, defaultValue: null },
  endTime: { type: DataTypes.DATE, defaultValue: null },
  geometryCoordinates: { type: DataTypes.JSON, defaultValue: [] }
}, { timestamps: true })

export default Route
