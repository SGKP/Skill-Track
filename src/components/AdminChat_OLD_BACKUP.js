'use client'
import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export default function AdminChat() {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [activeUsers, setActiveUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'))
    
    // Initialize socket connection
    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000', {
      path: '/api/socket'
    })

    socketInstance.on('connect', () => {
      console.log('Admin connected to socket')
      socketInstance.emit('join', { userId: user.id, role: 'admin' })
    })

    socketInstance.on('new_message', (messageData) => {
      setMessages(prev => [...prev, messageData])
    })

    socketInstance.on('user_status_change', (statusData) => {
      setActiveUsers(prev => {
        const existingUser = prev.find(u => u.id === statusData.userId)
        if (existingUser) {
          return prev.map(u => 
            u.id === statusData.userId 
              ? { ...u, status: statusData.status, lastActivity: statusData.activity }
              : u
          )
        } else {
          return [...prev, {
            id: statusData.userId,
            status: statusData.status,
            lastActivity: statusData.activity
          }]
        }
      })
    })

    socketInstance.on('user_typing', ({ userId, isTyping }) => {
      if (selectedUser && selectedUser.id === userId) {
        setIsTyping(isTyping)
      }
    })

    setSocket(socketInstance)

    // Fetch active users
    fetchActiveUsers()

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchActiveUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/active-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setActiveUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching active users:', error)
    }
  }

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedUser || !socket) return

    const user = JSON.parse(localStorage.getItem('user'))
    
    socket.emit('private_message', {
      from: user.id,
      to: selectedUser.id,
      message: newMessage,
      fromRole: 'admin',
      toRole: 'user'
    })

    setNewMessage('')
  }

  const sendBroadcast = () => {
    if (!newMessage.trim() || !socket) return

    const user = JSON.parse(localStorage.getItem('user'))
    
    socket.emit('admin_broadcast', {
      message: newMessage,
      adminId: user.id
    })

    setMessages(prev => [...prev, {
      from: user.id,
      message: newMessage,
      fromRole: 'admin',
      timestamp: new Date().toISOString(),
      isBroadcast: true
    }])

    setNewMessage('')
  }

  const handleTyping = () => {
    if (selectedUser && socket) {
      socket.emit('typing', { 
        userId: selectedUser.id, 
        isTyping: true, 
        toRole: 'user' 
      })
      
      setTimeout(() => {
        socket.emit('typing', { 
          userId: selectedUser.id, 
          isTyping: false, 
          toRole: 'user' 
        })
      }, 1000)
    }
  }

  return (
    <div className="flex h-96 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-2xl border border-gray-700/50">
      {/* User List */}
      <div className="w-1/3 border-r border-gray-700/50">
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="font-semibold text-white">Active Users</h3>
        </div>
        <div className="overflow-y-auto h-80">
          {activeUsers.map((user, idx) => {
            // Ensure the key is always unique, even if user.id is duplicated
            const key = (user.id || user._id ? `${user.id || user._id}` : `user-${idx}`) + `-${idx}`;
            return (
              <div
                key={key}
                onClick={() => setSelectedUser(user)}
                className={`p-4 border-b border-gray-700/50 cursor-pointer hover:bg-gray-800/60 transition-all duration-200 ${
                  selectedUser?.id === user.id ? 'bg-purple-600/20 border-purple-500/50' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    user.status === 'online' ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-gray-400">{user.currentRole}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-700/50">
          <h3 className="font-semibold text-white">
            {selectedUser ? `Chat with ${selectedUser.name}` : 'Select a user to chat'}
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-800/50">
          {messages
            .filter(msg => 
              !selectedUser || 
              msg.isBroadcast || 
              msg.from === selectedUser.id || 
              msg.to === selectedUser.id
            )
            .map((message, idx) => (
              <div
                key={message.id || message.timestamp || idx}
                className={`flex ${
                  message.fromRole === 'admin' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    message.fromRole === 'admin'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-100'
                  } ${message.isBroadcast ? 'bg-purple-600 text-white' : ''}`}
                >
                  {message.isBroadcast && (
                    <p className="text-xs mb-1">📢 Broadcast</p>
                  )}
                  <p className="text-sm">{message.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg">
                <p className="text-sm">User is typing...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-gray-700/50">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (e.shiftKey) {
                    sendBroadcast()
                  } else {
                    sendMessage()
                  }
                } else {
                  handleTyping()
                }
              }}
              placeholder={selectedUser ? "Type a message..." : "Select a user first..."}
              className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
              disabled={!selectedUser}
            />
            <button
              onClick={sendMessage}
              disabled={!selectedUser || !newMessage.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-600 transition-colors duration-200"
            >
              Send
            </button>
            <button
              onClick={sendBroadcast}
              disabled={!newMessage.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-600 transition-colors duration-200"
            >
              Broadcast
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Press Enter to send message, Shift+Enter to broadcast to all users
          </p>
        </div>
      </div>
    </div>
  )
}
