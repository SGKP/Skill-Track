import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { connectToDatabase } from '@/lib/mongodb'
import multer from 'multer'
import csv from 'csv-parser'
import fs from 'fs'
import { Readable } from 'stream'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key')
    
    if (decoded.role !== 'admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }

    const formData = await request.formData()
    const csvFile = formData.get('csvFile')

    if (!csvFile) {
      return NextResponse.json({ message: 'No CSV file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await csvFile.arrayBuffer())
    const stream = Readable.from(buffer)

    const { db } = await connectToDatabase()
    const users = []
    let importCount = 0

    return new Promise((resolve, reject) => {
      stream
        .pipe(csv())
        .on('data', (row) => {
          // Expect CSV with columns: name, email, currentRole, experience, skills
          if (row.name && row.email) {
            users.push({
              name: row.name,
              email: row.email,
              currentRole: row.currentRole || 'Not specified',
              experience: row.experience || 'Entry Level',
              skills: row.skills ? row.skills.split(';') : [],
              password: '', // Will be set below
              role: 'user',
              createdAt: new Date(),
              updatedAt: new Date(),
              careerHistory: [],
              activities: [],
              status: 'active'
            })
          }
        })
        .on('end', async () => {
          try {
            for (const user of users) {
              // Check if user already exists
              const existingUser = await db.collection('users').findOne({ email: user.email })
              
              if (!existingUser) {
                // Generate random password
                const tempPassword = Math.random().toString(36).slice(-8)
                user.password = await bcrypt.hash(tempPassword, 12)
                
                await db.collection('users').insertOne(user)
                importCount++

                // Send email with credentials (in production)
                if (process.env.NODE_ENV === 'production') {
                  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/email/send-notification`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      to: user.email,
                      subject: 'Welcome to Career Tracking Platform',
                      text: `Welcome ${user.name}! Your account has been created. Email: ${user.email}, Temporary Password: ${tempPassword}. Please change your password after first login.`,
                      html: `<h2>Welcome ${user.name}!</h2><p>Your account has been created on our Career Tracking Platform.</p><p><strong>Email:</strong> ${user.email}<br><strong>Temporary Password:</strong> ${tempPassword}</p><p>Please change your password after first login.</p><p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?role=user">Login Here</a></p>`
                    }),
                  })
                }
              }
            }

            resolve(NextResponse.json({
              message: `Successfully imported ${importCount} users`,
              count: importCount
            }))
          } catch (error) {
            console.error('Error importing users:', error)
            reject(NextResponse.json(
              { message: 'Error importing users' },
              { status: 500 }
            ))
          }
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error)
          reject(NextResponse.json(
            { message: 'Error parsing CSV file' },
            { status: 400 }
          ))
        })
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
