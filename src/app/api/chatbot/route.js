import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
})

export async function POST(request) {
  try {
    const { message, userContext } = await request.json()

    // If OpenAI API key is not configured, return a demo response
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
      return getDemoResponse(message, userContext)
    }

    const systemPrompt = `You are an AI Career Assistant helping professionals with career guidance, skill development, and role transitions. 
    
    User Context:
    - Current Role: ${userContext.currentRole}
    - Experience Level: ${userContext.experience}
    - Skills: ${userContext.skills?.join(', ') || 'Not specified'}
    
    Provide helpful, specific, and actionable career advice. Keep responses concise but informative.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7
    })

    return NextResponse.json({
      response: completion.choices[0].message.content
    })

  } catch (error) {
    console.error('Chatbot error:', error)
    return NextResponse.json(
      { message: 'Failed to process your request' },
      { status: 500 }
    )
  }
}

function getDemoResponse(message, userContext) {
  const lowerMessage = message.toLowerCase()
  
  let response = ""

  if (lowerMessage.includes('transition') || lowerMessage.includes('switch')) {
    response = `For transitioning from ${userContext.currentRole} to a senior role, I recommend:

1. **Skill Enhancement**: Focus on leadership and advanced technical skills
2. **Build a Portfolio**: Showcase your best projects and results
3. **Networking**: Connect with professionals in your target role
4. **Certifications**: Consider relevant industry certifications
5. **Mentorship**: Find a mentor in your desired position

Would you like me to elaborate on any of these points?`
  }
  else if (lowerMessage.includes('skill') || lowerMessage.includes('learn')) {
    response = `Based on your ${userContext.currentRole} background, here are key skills to develop:

**Technical Skills:**
- Advanced programming languages (Python, JavaScript, SQL)
- Cloud platforms (AWS, Azure, GCP)
- Data analysis and visualization tools

**Soft Skills:**
- Project management
- Communication and presentation
- Team leadership

**Industry-Specific:**
- Machine Learning for data roles
- DevOps for engineering roles
- Business intelligence for analyst roles

Which area interests you most?`
  }
  else if (lowerMessage.includes('salary') || lowerMessage.includes('negotiate')) {
    response = `Here's how to approach salary negotiation:

1. **Research Market Rates**: Use sites like Glassdoor, PayScale
2. **Document Your Value**: List achievements and contributions
3. **Choose the Right Time**: During performance reviews or job offers
4. **Be Confident**: Present your case professionally
5. **Consider Total Package**: Benefits, flexibility, growth opportunities

For your experience level (${userContext.experience}), focus on demonstrating ROI and impact.`
  }
  else if (lowerMessage.includes('trend') || lowerMessage.includes('future')) {
    response = `Current trends in ${userContext.currentRole}:

🔥 **Hot Technologies:**
- AI/ML integration
- Cloud-native development
- Automation and DevOps
- Data-driven decision making

📈 **Growth Areas:**
- Remote work capabilities
- Cross-functional collaboration
- Sustainability tech
- Cybersecurity awareness

💡 **Skills in Demand:**
- Problem-solving
- Adaptability
- Continuous learning mindset

Stay updated through industry blogs, conferences, and professional networks!`
  }
  else if (lowerMessage.includes('leadership') || lowerMessage.includes('management')) {
    response = `To develop leadership skills:

**Core Leadership Areas:**
1. **Communication**: Clear, empathetic, and inclusive
2. **Decision Making**: Data-driven with stakeholder input
3. **Team Building**: Foster collaboration and growth
4. **Strategic Thinking**: Long-term planning and vision

**Action Steps:**
- Lead small projects or initiatives
- Mentor junior colleagues
- Take leadership courses
- Seek feedback regularly
- Practice public speaking

Remember: Leadership is about enabling others to succeed!`
  }
  else {
    response = `I'm here to help with your career! I can assist with:

🎯 **Career Transitions** - Moving to new roles
📚 **Skill Development** - What to learn next  
💰 **Salary Negotiation** - Getting fair compensation
📈 **Industry Trends** - Staying current
👑 **Leadership** - Building management skills

Based on your profile as a ${userContext.currentRole} with ${userContext.experience} experience, what specific area would you like to explore?`
  }

  return NextResponse.json({ response })
}
