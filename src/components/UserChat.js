'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export default function UserChat({ user }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const lastFetchRef = useRef(null)

  const getToken = () => localStorage.getItem('token')

  const fetchMessages = useCallback(async (since = null) => {
    try {
      const token = getToken()
      if (!token) return

      let url = '/api/chat/messages'
      if (since) url += `?since=${encodeURIComponent(since)}`

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (res.ok) {
        const data = await res.json()
        if (since && data.messages.length > 0) {
          setMessages(prev => {
            const existingIds = new Set(prev.map(m => m._id))
            const newMsgs = data.messages.filter(m => !existingIds.has(m._id))
            return [...prev, ...newMsgs]
          })
        } else if (!since) {
          setMessages(data.messages)
        }
        setIsConnected(true)
        lastFetchRef.current = new Date().toISOString()
      }
    } catch (error) {
      console.error('Fetch messages error:', error)
      setIsConnected(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMessages()
    pollIntervalRef.current = setInterval(() => {
      fetchMessages(lastFetchRef.current)
    }, 3000)
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [fetchMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const token = getToken()
    if (!token) {
      alert('Please login again.')
      return
    }

    const tempMessage = {
      _id: 'temp-' + Date.now(),
      from: user.id || user._id,
      fromName: user.name,
      message: newMessage,
      fromRole: 'user',
      createdAt: new Date().toISOString(),
      sending: true
    }

    setMessages(prev => [...prev, tempMessage])
    const msgText = newMessage
    setNewMessage('')

    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ to: 'admin', message: msgText })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => prev.map(m =>
          m._id === tempMessage._id ? { ...data.message, sending: false } : m
        ))
      } else {
        setMessages(prev => prev.filter(m => m._id !== tempMessage._id))
        alert('Failed to send message. Please try again.')
      }
    } catch (error) {
      console.error('Send error:', error)
      setMessages(prev => prev.filter(m => m._id !== tempMessage._id))
      alert('Failed to send message. Please try again.')
    }
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
              {isConnected ? 'Connected' : loading ? 'Connecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="text-center text-gray-500 py-8">
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start a conversation with the admin!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message._id}
              className={`flex ${
                message.fromRole === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.fromRole === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-900'
                } ${message.isBroadcast ? 'bg-purple-100 text-purple-900 border border-purple-300' : ''} ${message.sending ? 'opacity-60' : ''}`}
              >
                {message.isBroadcast && (
                  <p className="text-xs mb-1 font-semibold">📢 Admin Broadcast</p>
                )}
                <p className="text-sm">{message.message}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.createdAt).toLocaleTimeString()}
                  {message.sending && ' • Sending...'}
                </p>
              </div>
            </div>
          ))
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
              if (e.key === 'Enter') sendMessage()
            }}
            placeholder="Type your message to admin..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            Send
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {isConnected
            ? "Connected to admin chat. Messages refresh automatically."
            : "Connecting to chat server..."
          }
        </p>
      </div>
    </div>
  )
}
