import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request) {
  let message = ''
  try {
    const { message: msg, userContext, history } = await request.json()
    message = msg

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      return NextResponse.json({ response: 'Gemini API key not configured. Please add GEMINI_API_KEY to your .env.local file.' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    const systemPrompt = `You are a smart, helpful AI assistant. You can answer ANY question on ANY topic — technical, non-technical, sports, science, history, coding, math, personal advice, fun facts, general knowledge, or anything else the user asks.

User info (for context only, use when relevant):
- Name: ${userContext?.name || 'User'}
- Role: ${userContext?.currentRole || 'Not specified'}
- Experience: ${userContext?.experience || 'Not specified'}
- Skills: ${userContext?.skills?.join(', ') || 'Not specified'}

Guidelines:
- Be helpful, friendly, and conversational
- Give clear, well-formatted answers using markdown (bold, bullets, etc.) when it adds clarity
- Be concise but thorough — don't pad answers unnecessarily
- For coding questions, use code blocks
- Never refuse a reasonable question or limit yourself to career topics only`

    // systemInstruction must be passed to getGenerativeModel, not startChat
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      systemInstruction: systemPrompt
    })

    // Gemini requires history to start with a 'user' turn — drop any leading bot messages
    const rawHistory = (history || []).map(h => ({
      role: h.sender === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }))
    const firstUserIdx = rawHistory.findIndex(h => h.role === 'user')
    const validHistory = firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : []

    const chat = model.startChat({ history: validHistory })

    const result = await chat.sendMessage(message)
    const response = result.response.text()

    return NextResponse.json({ response })

  } catch (error) {
    console.error('Chatbot error:', error)
    // Handle quota exceeded (429) with a friendly message
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('Too Many Requests')) {
      return NextResponse.json({
        response: getFallbackResponse(message),
        isFallback: true
      })
    }
    return NextResponse.json({ response: `Error: ${error.message}` }, { status: 500 })
  }
}

// Fallback responses when API quota is exhausted
function getFallbackResponse(message) {
  const msg = message.toLowerCase()
  if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
    return "Hello! I'm currently running in offline mode (API quota reached). For full AI responses, please update the GEMINI_API_KEY in .env.local with a new key from https://aistudio.google.com/app/apikey"
  }
  if (msg.includes('skill') || msg.includes('learn')) {
    return "**Top skills to learn in 2026:**\n- AI & Machine Learning\n- Cloud (AWS/Azure/GCP)\n- Full-Stack (React, Node.js)\n- Data Analysis\n- Cybersecurity\n\n*Note: AI is in offline mode. Get a new Gemini API key to enable full responses.*"
  }
  if (msg.includes('career') || msg.includes('job') || msg.includes('work')) {
    return "**Career tips:**\n- Build a strong portfolio\n- Network actively on LinkedIn\n- Keep skills updated\n- Contribute to open source\n- Practice system design & DSA\n\n*Note: AI is in offline mode. Update your API key for personalized advice.*"
  }
  if (msg.includes('python') || msg.includes('javascript') || msg.includes('code') || msg.includes('programming')) {
    return "**Programming resources:**\n- Python: docs.python.org, Real Python\n- JavaScript: MDN Web Docs, javascript.info\n- Practice: LeetCode, HackerRank, Codeforces\n\n*Note: AI is in offline mode. Update your API key for code help.*"
  }
  return "I'm currently in offline mode because the Gemini API quota is exhausted.\n\n**To restore full AI:** Go to https://aistudio.google.com/app/apikey, create a new free key, and update GEMINI_API_KEY in your .env.local file, then restart the server."
}
