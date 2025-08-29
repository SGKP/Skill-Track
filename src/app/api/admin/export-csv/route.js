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
      .find({ role: { $ne: 'admin' } })
      .project({ password: 0 })
      .toArray()

    // Create CSV content
    const csvHeader = 'Name,Email,Current Role,Experience,Skills,Status,Created At\n'
    const csvRows = users.map(user => {
      const skills = Array.isArray(user.skills) ? user.skills.join(';') : ''
      return `"${user.name}","${user.email}","${user.currentRole}","${user.experience}","${skills}","${user.status}","${new Date(user.createdAt).toLocaleDateString()}"`
    }).join('\n')

    const csvContent = csvHeader + csvRows

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
