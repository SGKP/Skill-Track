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
    
    const users = await db.collection('users')
      .find({ 
        role: { $ne: 'admin' },
        status: 'active'
      })
      .project({ password: 0 })
      .toArray()

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching active users:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
