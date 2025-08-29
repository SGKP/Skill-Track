import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function DELETE(request, { params }) {
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
    const userId = params.id

    // Delete user
    const result = await db.collection('users').deleteOne({ 
      _id: new ObjectId(userId),
      role: { $ne: 'admin' } // Prevent admin deletion
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'User not found or cannot be deleted' },
        { status: 404 }
      )
    }

    return NextResponse.json({ message: 'User deleted successfully' })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
