import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const { name, currentRole, experience, skills } = await request.json()

    const { db } = await connectToDatabase()
    
    const activity = {
      type: 'profile_update',
      description: 'Updated profile information',
      timestamp: new Date().toISOString()
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $set: { 
          name,
          currentRole,
          experience,
          skills,
          updatedAt: new Date()
        },
        $push: { activities: activity }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Get updated user data
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    }, { projection: { password: 0 } })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user
    })

  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
