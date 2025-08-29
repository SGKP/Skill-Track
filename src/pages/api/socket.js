import { Server } from 'socket.io'

let io

export default function handler(req, res) {
  if (!res.socket.server.io) {
    console.log('Setting up Socket.IO server...')
    
    io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    })

    io.on('connection', (socket) => {
      console.log('User connected:', socket.id)

      // Join user to their specific room
      socket.on('join', ({ userId, role }) => {
        socket.join(`user_${userId}`)
        if (role === 'admin') {
          socket.join('admins')
        }
        console.log(`User ${userId} joined as ${role}`)
      })

      // Handle private messages between admin and user
      socket.on('private_message', ({ from, to, message, fromRole, toRole }) => {
        const messageData = {
          from,
          to,
          message,
          fromRole,
          toRole,
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substr(2, 9)
        }

        // Send to specific user room
        if (toRole === 'admin') {
          socket.to('admins').emit('new_message', messageData)
        } else {
          socket.to(`user_${to}`).emit('new_message', messageData)
        }

        // Send back to sender for confirmation
        socket.emit('message_sent', messageData)
      })

      // Handle admin broadcast to all users
      socket.on('admin_broadcast', ({ message, adminId }) => {
        const broadcastData = {
          from: adminId,
          message,
          fromRole: 'admin',
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substr(2, 9),
          isBroadcast: true
        }

        socket.broadcast.emit('admin_broadcast', broadcastData)
      })

      // Handle user status updates
      socket.on('user_status_update', ({ userId, status, activity }) => {
        socket.to('admins').emit('user_status_change', {
          userId,
          status,
          activity,
          timestamp: new Date().toISOString()
        })
      })

      // Handle typing indicators
      socket.on('typing', ({ userId, isTyping, toRole }) => {
        if (toRole === 'admin') {
          socket.to('admins').emit('user_typing', { userId, isTyping })
        } else {
          socket.to(`user_${userId}`).emit('admin_typing', { isTyping })
        }
      })

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id)
      })
    })

    res.socket.server.io = io
  }

  res.end()
}
