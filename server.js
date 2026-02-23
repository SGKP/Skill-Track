const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      // Let Socket.IO handle its own requests
      if (req.url.startsWith('/socket.io/')) {
        return; // Socket.IO will handle this
      }
      
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // Initialize Socket.IO
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['polling', 'websocket'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Store active users and their socket IDs
  const activeUsers = new Map();
  const adminSockets = new Set();

  io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    // Join user to their specific room
    socket.on('join', ({ userId, role, userName }) => {
      console.log('📝 Join request:', { userId, role, userName });
      
      socket.userId = userId;
      socket.role = role;
      socket.userName = userName;

      // Store user info
      activeUsers.set(userId, {
        socketId: socket.id,
        userId,
        role,
        userName,
        joinedAt: new Date()
      });
      
      console.log('📊 Active users count:', activeUsers.size);

      if (role === 'admin') {
        socket.join('admins');
        adminSockets.add(socket.id);
        console.log(`👨‍💼 Admin ${userName} joined`);
      } else {
        socket.join(`user_${userId}`);
        
        // Notify admins that user is online
        console.log('📢 Notifying admins about user:', userName);
        io.to('admins').emit('user_online', {
          userId,
          userName,
          timestamp: new Date().toISOString()
        });
        
        console.log(`👤 User ${userName} joined`);
      }

      // Send active users list to admins
      if (role === 'admin') {
        const usersList = Array.from(activeUsers.values())
          .filter(u => u.role !== 'admin')
          .map(u => ({
            userId: u.userId,
            userName: u.userName,
            online: true
          }));
        
        console.log('📋 Sending user list to admin:', usersList);
        socket.emit('active_users_list', usersList);
      }
    });

    // Handle private messages
    socket.on('send_message', ({ to, message, fromRole, toRole }) => {
      const messageData = {
        id: Date.now() + Math.random(),
        from: socket.userId,
        fromName: socket.userName,
        to,
        message,
        fromRole,
        toRole,
        timestamp: new Date().toISOString()
      };

      console.log(`💬 Message from ${socket.userName} to ${to}`);

      // Send to recipient
      if (toRole === 'admin') {
        io.to('admins').emit('receive_message', messageData);
      } else {
        io.to(`user_${to}`).emit('receive_message', messageData);
      }

      // Confirm to sender
      socket.emit('message_sent', messageData);
    });

    // Admin broadcast to all users
    socket.on('admin_broadcast', ({ message }) => {
      if (socket.role !== 'admin') return;

      const broadcastData = {
        id: Date.now() + Math.random(),
        from: socket.userId,
        fromName: socket.userName,
        message,
        fromRole: 'admin',
        isBroadcast: true,
        timestamp: new Date().toISOString()
      };

      console.log(`📢 Admin broadcast: ${message.substring(0, 50)}`);

      // Send to all users (not admins)
      socket.broadcast.emit('receive_broadcast', broadcastData);
    });

    // Typing indicators
    socket.on('typing', ({ to, isTyping }) => {
      if (socket.role === 'admin') {
        io.to(`user_${to}`).emit('admin_typing', { isTyping });
      } else {
        io.to('admins').emit('user_typing', {
          userId: socket.userId,
          userName: socket.userName,
          isTyping
        });
      }
    });

    // User disconnection
    socket.on('disconnect', () => {
      console.log('❌ User disconnected:', socket.id);

      if (socket.userId) {
        activeUsers.delete(socket.userId);
        
        if (socket.role === 'admin') {
          adminSockets.delete(socket.id);
        } else {
          // Notify admins that user went offline
          io.to('admins').emit('user_offline', {
            userId: socket.userId,
            userName: socket.userName,
            timestamp: new Date().toISOString()
          });
        }
      }
    });
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`
    ✅ Server ready on http://${hostname}:${port}
    💬 Socket.IO ready for connections
    `);
  });
});
