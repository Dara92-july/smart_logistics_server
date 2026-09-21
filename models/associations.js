import User from './User.js'
import Rider from './Rider.js'
import Delivery from './Delivery.js'
import Route from './Route.js'
import Package from './Package.js'

Delivery.belongsTo(Rider, { foreignKey: 'riderId', as: 'rider' })
Delivery.belongsTo(User, { foreignKey: 'assignedById', as: 'assigner' })
Rider.hasMany(Delivery, { foreignKey: 'riderId', as: 'deliveries' })
Rider.belongsTo(Delivery, { foreignKey: 'currentDeliveryId', as: 'currentDelivery' })
Route.belongsTo(Rider, { foreignKey: 'riderId', as: 'rider' })
Package.belongsTo(Delivery, { foreignKey: 'deliveryId', as: 'delivery' })

export { User, Rider, Delivery, Route, Package }
