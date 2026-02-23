import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const { db } = await connectToDatabase()
    
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    })

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      careerHistory: user.careerHistory || [],
      activities: user.activities || []
    })

  } catch (error) {
    console.error('Error fetching career data:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const { title, description, type } = await request.json()

    const { db } = await connectToDatabase()
    
    const careerUpdate = {
      title,
      description,
      type,
      date: new Date().toISOString()
    }

    const activity = {
      type: 'career_update',
      description: `Added career update: ${title}`,
      timestamp: new Date().toISOString()
    }

    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(decoded.userId) },
      { 
        $push: { 
          careerHistory: careerUpdate,
          activities: activity
        },
        $set: { updatedAt: new Date() }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 })
    }

    // Get updated user data
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(decoded.userId) 
    })

    return NextResponse.json({
      careerHistory: user.careerHistory || [],
      activities: user.activities || []
    })

  } catch (error) {
    console.error('Error adding career update:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
