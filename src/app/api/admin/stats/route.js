import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const { db } = await connectToDatabase()
    
    // Get statistics
    const totalUsers = await db.collection('users').countDocuments({ role: { $ne: 'admin' } })
    const activeUsers = await db.collection('users').countDocuments({ 
      role: { $ne: 'admin' }, 
      status: 'active' 
    })
    
    // Get total career changes
    const users = await db.collection('users').find({ role: { $ne: 'admin' } }).toArray()
    const totalCareerChanges = users.reduce((total, user) => {
      return total + (user.careerHistory?.length || 0)
    }, 0)

    // Get recent activities
    const recentActivities = []
    for (const user of users.slice(0, 10)) {
      if (user.activities && user.activities.length > 0) {
        const userActivities = user.activities.slice(-3).map(activity => ({
          ...activity,
          userName: user.name
        }))
        recentActivities.push(...userActivities)
      }
    }
    
    // Sort by timestamp and get latest 10
    recentActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalCareerChanges,
      recentActivities: recentActivities.slice(0, 10)
    })

  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
