import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(request) {
  try {
    const { name, email, password, currentRole, experience, skills } = await request.json()

    const { db } = await connectToDatabase()
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const saltRounds = 12
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create user object
    const user = {
      name,
      email,
      password: hashedPassword,
      role: 'user', // Default role is user
      currentRole,
      experience,
      skills,
      createdAt: new Date(),
      updatedAt: new Date(),
      careerHistory: [],
      activities: [],
      status: 'active'
    }

    // Insert user into database
    const result = await db.collection('users').insertOne(user)

    // Send welcome email
    if (process.env.NODE_ENV === 'production') {
      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to Career Tracking Platform',
          text: `Welcome ${name}! Your account has been successfully created. You can now login with your credentials.`,
          html: `<h2>Welcome ${name}!</h2><p>Your account has been successfully created on our Career Tracking Platform.</p><p>You can now login with your credentials and start tracking your career journey.</p><p>Login here: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?role=user">Login</a></p>`
        }),
      })
    }

    return NextResponse.json({
      message: 'User registered successfully',
      userId: result.insertedId
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
