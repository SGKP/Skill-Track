'use client'
import { useState, useEffect, useRef } from 'react'

export default function Chatbot({ user }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello ${user?.name}! I'm your AI Career Assistant. I can help you with career guidance, skill development, and role transitions. What would you like to know?`,
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: newMessage,
          userContext: {
            currentRole: user.currentRole,
            experience: user.experience,
            skills: user.skills
          }
        })
      })

      const data = await response.json()

      if (response.ok) {
        const botMessage = {
          id: Date.now() + 1,
          text: data.response,
          sender: 'bot',
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.message || 'Failed to get response')
      }
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickQuestions = [
    "How can I transition from Data Science to Senior Data Engineer?",
    "What skills should I learn for career advancement?",
    "How do I negotiate a salary increase?",
    "What are the latest trends in my field?",
    "How can I improve my leadership skills?"
  ]

  const handleQuickQuestion = (question) => {
    setNewMessage(question)
  }

  return (
    <div className="bg-white rounded-lg shadow h-96 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Career Assistant</h3>
            <p className="text-sm text-gray-600">Ask me anything about your career!</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <p className="text-xs mt-1 opacity-75">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Quick Questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.slice(0, 2).map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                {question.length > 30 ? question.substring(0, 30) + '...' : question}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about career guidance, skills, transitions..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}
