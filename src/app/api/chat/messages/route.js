import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'

// GET - Fetch messages for a user
export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const { db } = await connectToDatabase()
    const userId = decoded.userId?.toString() || decoded.id

    // Get user name from DB
    let userName = 'Unknown'
    try {
      const { ObjectId } = require('mongodb')
      const userDoc = await db.collection('users').findOne({ _id: new ObjectId(userId) })
      if (userDoc) userName = userDoc.name
    } catch(e) {}

    const { searchParams } = new URL(request.url)
    const withUser = searchParams.get('withUser') // for admin: filter by specific user
    const since = searchParams.get('since') // timestamp for polling
    const broadcast = searchParams.get('broadcast') // get broadcasts only

    let query = {}

    if (decoded.role === 'admin') {
      if (broadcast === 'true') {
        query = { isBroadcast: true }
      } else if (withUser) {
        query = {
          isBroadcast: { $ne: true },
          $or: [
            { from: userId, to: withUser },
            { from: withUser, to: userId }
          ]
        }
      } else {
        // Get all messages for admin
        query = {}
      }
    } else {
      // Regular user: get their messages + broadcasts
      query = {
        $or: [
          { from: userId },
          { to: userId },
          { isBroadcast: true }
        ]
      }
    }

    if (since) {
      query.createdAt = { $gt: new Date(since) }
    }

    const messages = await db.collection('messages')
      .find(query)
      .sort({ createdAt: 1 })
      .limit(200)
      .toArray()

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Fetch messages error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// POST - Send a message
export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    const { db } = await connectToDatabase()
    const { to, message, isBroadcast } = await request.json()

    if (!message?.trim()) {
      return NextResponse.json({ message: 'Message is required' }, { status: 400 })
    }

    const newMessage = {
      from: userId,
      fromName: userName,
      fromRole: decoded.role,
      to: isBroadcast ? 'all' : to,
      message: message.trim(),
      isBroadcast: isBroadcast || false,
      createdAt: new Date(),
      read: false
    }

    const result = await db.collection('messages').insertOne(newMessage)
    newMessage._id = result.insertedId

    return NextResponse.json({ message: newMessage })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}
