// Run this script to create an admin user
// node scripts/create-admin.js

const { MongoClient } = require('mongodb')
const bcrypt = require('bcryptjs')

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'career_tracking'

async function createAdmin() {
  const client = new MongoClient(MONGODB_URI)
  
  try {
    await client.connect()
    const db = client.db(MONGODB_DB)
    
    // Check if admin already exists
    const existingAdmin = await db.collection('users').findOne({ 
      email: 'admin@mastercard.com' 
    })
    
    if (existingAdmin) {
      console.log('Admin user already exists!')
      return
    }
    
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = {
      name: 'System Administrator',
      email: 'admin@mastercard.com',
      password: hashedPassword,
      role: 'admin',
      currentRole: 'System Administrator',
      experience: 'Senior',
      skills: ['System Administration', 'User Management', 'Analytics'],
      createdAt: new Date(),
      updatedAt: new Date(),
      careerHistory: [],
      activities: [],
      status: 'active'
    }
    
    await db.collection('users').insertOne(adminUser)
    
    console.log('Admin user created successfully!')
    console.log('Email: admin@mastercard.com')
    console.log('Password: admin123')
    console.log('Please change the password after first login.')
    
  } catch (error) {
    console.error('Error creating admin:', error)
  } finally {
    await client.close()
  }
}

createAdmin()
