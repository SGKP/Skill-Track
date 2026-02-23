import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'

// GET - Get list of users who have chatted (for admin sidebar)
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

    // Get distinct users who have sent messages (non-admin)
    const chatUsers = await db.collection('messages').aggregate([
      { $match: { fromRole: 'user', isBroadcast: { $ne: true } } },
      {
        $group: {
          _id: '$from',
          userName: { $last: '$fromName' },
          lastMessage: { $last: '$message' },
          lastMessageAt: { $last: '$createdAt' },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          }
        }
      },
      { $sort: { lastMessageAt: -1 } }
    ]).toArray()

    const users = chatUsers.map(u => ({
      userId: u._id,
      userName: u.userName || 'User',
      lastMessage: u.lastMessage,
      lastMessageAt: u.lastMessageAt,
      unreadCount: u.unreadCount,
      online: true // In REST mode, we show all chat users
    }))

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Chat users error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
