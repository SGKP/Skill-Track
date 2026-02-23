'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminChat() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chatUsers, setChatUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [broadcastMode, setBroadcastMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const pollIntervalRef = useRef(null)
  const lastFetchRef = useRef(null)

  const getToken = () => localStorage.getItem('token')

  const fetchChatUsers = useCallback(async () => {
    try {
      const token = getToken()
      if (!token) return
      const res = await fetch('/api/chat/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setChatUsers(data.users || [])
      }
    } catch (error) {
      console.error('Fetch chat users error:', error)
    }
  }, [])

  const fetchMessages = useCallback(async (since = null) => {
    try {
      const token = getToken()
      if (!token) return

      let url = '/api/chat/messages'
      const params = new URLSearchParams()
      if (since) params.set('since', since)
      if (broadcastMode) params.set('broadcast', 'true')
      else if (selectedUser) params.set('withUser', selectedUser.userId)
      if (params.toString()) url += `?${params.toString()}`

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
  }, [selectedUser, broadcastMode])

  useEffect(() => {
    setLoading(true)
    lastFetchRef.current = null
    fetchMessages()
    fetchChatUsers()

    pollIntervalRef.current = setInterval(() => {
      fetchMessages(lastFetchRef.current)
      fetchChatUsers()
    }, 3000)

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [fetchMessages, fetchChatUsers])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return
    const token = getToken()
    const user = JSON.parse(localStorage.getItem('user'))
    if (!token || !user) return

    const msgText = newMessage
    setNewMessage('')

    if (broadcastMode) {
      const tempMessage = {
        _id: 'temp-' + Date.now(), from: user.id || user._id, fromName: user.name,
        message: msgText, fromRole: 'admin', isBroadcast: true,
        createdAt: new Date().toISOString(), sending: true
      }
      setMessages(prev => [...prev, tempMessage])
      try {
        const res = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ message: msgText, isBroadcast: true })
        })
        if (res.ok) {
          const data = await res.json()
          setMessages(prev => prev.map(m => m._id === tempMessage._id ? { ...data.message, sending: false } : m))
        }
      } catch (error) { console.error('Broadcast error:', error) }
    } else if (selectedUser) {
      const tempMessage = {
        _id: 'temp-' + Date.now(), from: user.id || user._id, fromName: user.name,
        to: selectedUser.userId, message: msgText, fromRole: 'admin',
        toRole: 'user', createdAt: new Date().toISOString(), sending: true
      }
      setMessages(prev => [...prev, tempMessage])
      try {
        const res = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ to: selectedUser.userId, message: msgText })
        })
        if (res.ok) {
          const data = await res.json()
          setMessages(prev => prev.map(m => m._id === tempMessage._id ? { ...data.message, sending: false } : m))
        }
      } catch (error) { console.error('Send error:', error) }
    }
  }

  const filteredMessages = broadcastMode
    ? messages.filter(m => m.isBroadcast)
    : selectedUser
      ? messages.filter(m => (m.from === selectedUser.userId || m.to === selectedUser.userId) && !m.isBroadcast)
      : []

  const unreadCount = (userId) => {
    const u = chatUsers.find(cu => cu.userId === userId)
    return u?.unreadCount || 0
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px] rounded-2xl overflow-hidden border border-white/[0.06]" style={{ background: 'linear-gradient(145deg, #0c0c14 0%, #08080e 100%)' }}>
      {/* Sidebar */}
      <div className="w-72 border-r border-white/[0.06] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white/80">Messages</h3>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50' : 'bg-red-400'}`} />
              <span className="text-[10px] text-white/30">{isConnected ? 'Live' : 'Offline'}</span>
            </div>
          </div>
          <button
            onClick={() => { setBroadcastMode(true); setSelectedUser(null) }}
            className={`w-full px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-2 ${
              broadcastMode
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/25'
                : 'bg-white/[0.03] text-white/30 border border-white/[0.06] hover:text-white/50 hover:border-white/[0.1]'
            }`}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"/>
            </svg>
            Broadcast
          </button>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto p-2">
          {chatUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" className="text-white/15">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/>
                </svg>
              </div>
              <p className="text-xs text-white/20">No chat users yet</p>
              <p className="text-[10px] text-white/10 mt-1">Users will appear when they message</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {chatUsers.map((user, index) => {
                const isSelected = selectedUser?.userId === user.userId && !broadcastMode
                const unread = unreadCount(user.userId)
                return (
                  <button
                    key={user.userId || `user-${index}`}
                    onClick={() => { setSelectedUser(user); setBroadcastMode(false) }}
                    className={`w-full text-left p-3 rounded-xl transition-all duration-150 ${
                      isSelected
                        ? 'bg-purple-500/10 border border-purple-500/15'
                        : 'hover:bg-white/[0.02] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/15 flex items-center justify-center text-[11px] font-bold text-blue-300">
                          {user.userName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c0c14]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isSelected ? 'text-white/90' : 'text-white/60'}`}>
                          {user.userName || 'User'}
                        </p>
                      </div>
                      {unread > 0 && (
                        <span className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center">
                          {unread}
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Online count */}
        <div className="px-4 py-3 border-t border-white/[0.04]">
          <p className="text-[10px] text-white/15">{chatUsers.length} user(s) in chat</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-3">
          {broadcastMode ? (
            <>
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"/>
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">Broadcast</p>
                <p className="text-[10px] text-white/25">Message all connected users</p>
              </div>
            </>
          ) : selectedUser ? (
            <>
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/15 flex items-center justify-center text-[11px] font-bold text-blue-300">
                  {selectedUser.userName?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#0c0c14]" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/80">{selectedUser.userName || 'User'}</p>
                <p className="text-[10px] text-white/25">Online</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-white/25">Select a conversation</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5">
          {!broadcastMode && !selectedUser ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center mb-4">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2" className="text-white/10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
                </svg>
              </div>
              <p className="text-sm text-white/15">Select a user to start chatting</p>
              <p className="text-xs text-white/8 mt-1">or use broadcast to message everyone</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-sm text-white/15">No messages yet</p>
              <p className="text-xs text-white/8 mt-1">Send the first message</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMessages.map((message) => {
                const isAdmin = message.fromRole === 'admin'
                return (
                  <div key={message._id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                      message.isBroadcast
                        ? 'bg-purple-500/15 text-purple-200 border border-purple-500/15 rounded-br-md'
                        : isAdmin
                          ? 'bg-blue-500/15 text-blue-100 border border-blue-500/10 rounded-br-md'
                          : 'bg-white/[0.04] text-white/70 border border-white/[0.06] rounded-bl-md'
                    }`}>
                      {message.isBroadcast && (
                        <p className="text-[10px] font-semibold text-purple-400/60 mb-1">Broadcast</p>
                      )}
                      <p className="leading-relaxed">{message.message}</p>
                      <p className="text-[10px] mt-1.5 opacity-40">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage()
              }}
              placeholder={
                broadcastMode ? "Type broadcast message..."
                : selectedUser ? `Message ${selectedUser.userName}...`
                : "Select a user..."
              }
              className="flex-1 px-4 py-2.5 rounded-xl text-sm text-white placeholder-white/15 bg-white/[0.03] border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/20 transition-all"
              disabled={!isConnected || (!selectedUser && !broadcastMode)}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || !isConnected || (!selectedUser && !broadcastMode)}
              className={`p-2.5 rounded-xl transition-all disabled:opacity-20 disabled:cursor-not-allowed ${
                broadcastMode
                  ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 border border-purple-500/20'
                  : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/20'
              }`}
            >
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
