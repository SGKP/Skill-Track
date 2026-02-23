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
            const emailResults = []
            
            for (const user of users) {
              // Check if user already exists
              const existingUser = await db.collection('users').findOne({ email: user.email })
              
              if (!existingUser) {
                // Generate random password for NEW user
                const tempPassword = Math.random().toString(36).slice(-8)
                user.password = await bcrypt.hash(tempPassword, 12)
                
                await db.collection('users').insertOne(user)
                importCount++

                // Send email with credentials
                try {
                  const emailRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/email/send-notification`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      to: user.email,
                      subject: 'Welcome to Career Tracking Platform - Your Login Credentials',
                      text: `Welcome ${user.name}! Your account has been created. Email: ${user.email}, Temporary Password: ${tempPassword}. Please change your password after first login.`,
                      html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9fafb;border-radius:12px;">
                        <h2 style="color:#7c3aed;">Welcome to Career Tracking Platform!</h2>
                        <p>Hi <strong>${user.name}</strong>,</p>
                        <p>Your account has been created successfully. Here are your login credentials:</p>
                        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:16px 0;">
                          <p style="margin:4px 0;"><strong>Email:</strong> ${user.email}</p>
                          <p style="margin:4px 0;"><strong>Temporary Password:</strong> <code style="background:#f3f4f6;padding:2px 8px;border-radius:4px;font-size:16px;color:#7c3aed;">${tempPassword}</code></p>
                        </div>
                        <p>Please change your password after your first login.</p>
                        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/auth/login?role=user" style="display:inline-block;background:#7c3aed;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;margin-top:8px;">Login Here</a>
                      </div>`
                    }),
                  })
                  const emailData = await emailRes.json()
                  emailResults.push({ email: user.email, status: 'sent', detail: emailData.message })
                  console.log(`✅ Email sent to ${user.email}`)
                } catch (emailErr) {
                  emailResults.push({ email: user.email, status: 'failed', detail: emailErr.message })
                  console.error('❌ Failed to send email to', user.email, emailErr.message)
                }
              }
            }

            resolve(NextResponse.json({
              message: `Successfully imported ${importCount} users`,
              count: importCount,
              emailResults
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
