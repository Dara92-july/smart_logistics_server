import connectDB from '../config/db.js'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()

const seedData = async () => {
  try {
    await connectDB()
    console.log('Connected to MySQL')

    await User.destroy({ where: {} })
    console.log('Cleared existing users')

    const adminName = process.env.ADMIN_NAME || 'Admin User'
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@smartlogistics.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123'
    const adminPhone = process.env.ADMIN_PHONE || '+234 800 000 0000'

    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
      phone: adminPhone
    })

    console.log(`\nAdmin user created: ${adminEmail} / ${adminPassword}`)
    process.exit(0)
  } catch (error) {
    console.error('Seed error:', error)
    process.exit(1)
  }
}

seedData()
