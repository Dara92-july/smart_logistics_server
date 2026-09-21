import { DataTypes } from 'sequelize'
import bcrypt from 'bcryptjs'
import { sequelize } from '../config/db.js'

const ROLES = ['admin', 'dispatcher', 'manager']

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM(...ROLES), defaultValue: 'dispatcher' },
  avatar: { type: DataTypes.STRING, defaultValue: null },
  phone: { type: DataTypes.STRING, defaultValue: null },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLogin: { type: DataTypes.DATE, defaultValue: null },
  preferences: {
    type: DataTypes.JSON,
    defaultValue: { notifications: true, darkMode: true, language: 'en' }
  }
}, { timestamps: true })

User.beforeSave(async (user) => {
  if (user.changed('password')) {
    user.password = await bcrypt.hash(user.password, 12)
  }
})

User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

User.prototype.toJSON = function() {
  const values = { ...this.get() }
  delete values.password
  return values
}

export default User
