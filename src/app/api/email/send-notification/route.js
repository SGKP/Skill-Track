import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request) {
  try {
    const { to, subject, text, html } = await request.json()

    // Create nodemailer transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || 'your-email@gmail.com',
        pass: process.env.SMTP_PASS || 'your-app-password'
      }
    })

    // If email credentials are not configured, log the email instead
    if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
      console.log('Email would be sent:', {
        to,
        subject,
        text,
        html
      })
      
      return NextResponse.json({
        message: 'Email logged (SMTP not configured)',
        emailData: { to, subject, text }
      })
    }

    // Send email
    const mailOptions = {
      from: `"Career Tracking Platform" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    }

    const info = await transporter.sendMail(mailOptions)
    
    console.log('Email sent:', info.messageId)

    return NextResponse.json({
      message: 'Email sent successfully',
      messageId: info.messageId
    })

  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json(
      { message: 'Failed to send email', error: error.message },
      { status: 500 }
    )
  }
}
