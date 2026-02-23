import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request) {
  try {
    const { email, password, role } = await request.json()

    const { db } = await connectToDatabase()
    
    // Check if user exists
    const user = await db.collection('users').findOne({ email })
    
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check role authorization
    if (role === 'admin' && user.role !== 'admin') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    )

    // Send email notification for login
    if (process.env.NODE_ENV === 'production') {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user.email,
          subject: 'Login Notification',
          text: `Hello ${user.name}, you have successfully logged in to your account at ${new Date().toLocaleString()}.`,
          html: `<p>Hello <strong>${user.name}</strong>,</p><p>You have successfully logged in to your account at <strong>${new Date().toLocaleString()}</strong>.</p>`
        }),
      })
    }

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentRole: user.currentRole,
        experience: user.experience,
        skills: user.skills
      }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
