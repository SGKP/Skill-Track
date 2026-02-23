'use client'
import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

export default function UserChat({ user }) {
  const [socket, setSocket] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isAdminTyping, setIsAdminTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState(null)
  const messagesEndRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  useEffect(() => {
    // Initialize socket connection
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
    console.log('🔌 Connecting to socket:', socketUrl)

    const socketInstance = io(socketUrl, {
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
      withCredentials: false
    })

    socketInstance.on('connect', () => {
      console.log('✅ User connected to socket:', socketInstance.id)
      setIsConnected(true)
      setConnectionError(null)
      
      // Join room
      const joinData = { 
        userId: user.id || user._id || user.email, 
        role: 'user',
        userName: user.name || 'User'
      };
      console.log('👤 User joining with:', joinData);
      socketInstance.emit('join', joinData);
    })

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message)
      setConnectionError('Unable to connect to chat server')
      setIsConnected(false)
    })

    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Disconnected:', reason)
      setIsConnected(false)
    })

    // Receive messages
    socketInstance.on('receive_message', (messageData) => {
      console.log('📨 Message received:', messageData)
      setMessages(prev => [...prev, messageData])
    })

    // Receive broadcasts
    socketInstance.on('receive_broadcast', (broadcastData) => {
      console.log('📢 Broadcast received:', broadcastData)
      setMessages(prev => [...prev, broadcastData])
    })

    // Message sent confirmation
    socketInstance.on('message_sent', (messageData) => {
      console.log('✅ Message sent confirmed')
    })

    // Admin typing indicator
    socketInstance.on('admin_typing', ({ isTyping }) => {
      setIsAdminTyping(isTyping)
    })

    setSocket(socketInstance)

    return () => {
      if (socketInstance) {
        socketInstance.disconnect()
      }
    }
  }, [user.id, user._id, user.name])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleTyping = () => {
    if (!socket || !isConnected) return

    socket.emit('typing', { to: 'admin', isTyping: true })

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    // Stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { to: 'admin', isTyping: false })
    }, 2000)
  }

  const sendMessage = () => {
    if (!newMessage.trim()) return
    
    if (!socket || !isConnected) {
      alert('Not connected to chat. Please refresh the page.')
      return
    }

    const tempMessage = {
      id: Date.now(),
      from: user.id || user._id,
      fromName: user.name,
      message: newMessage,
      fromRole: 'user',
      timestamp: new Date().toISOString(),
      sending: true
    }

    // Add to UI immediately
    setMessages(prev => [...prev, tempMessage])

    // Send to server
    socket.emit('send_message', {
      to: 'admin',
      message: newMessage,
      fromRole: 'user',
      toRole: 'admin'
    })

    setNewMessage('')
    
    // Stop typing indicator
    socket.emit('typing', { to: 'admin', isTyping: false })
  }

  return (
    <div className="bg-white rounded-lg shadow h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Admin Communication</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              isConnected ? 'bg-green-400' : 'bg-red-400'
            }`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start a conversation with the admin!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.fromRole === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.fromRole === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                } ${message.isBroadcast ? 'bg-purple-100 text-purple-900 border border-purple-300' : ''}`}
              >
                {message.isBroadcast && (
                  <p className="text-xs mb-1 font-semibold">📢 Admin Broadcast</p>
                )}
                <p className="text-sm">{message.message}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {isAdminTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <p className="text-sm">Admin is typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                sendMessage()
              } else {
                handleTyping()
              }
            }}
            placeholder="Type your message to admin..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={!isConnected}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || !isConnected}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {isConnected 
            ? "Connected to admin chat. Messages are sent in real-time."
            : "Disconnected. Please refresh the page to reconnect."
          }
        </p>
      </div>
    </div>
  )
}
