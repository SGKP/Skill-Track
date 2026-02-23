# RAG (Retrieval Augmented Generation) Implementation Guide

## 🎯 Goal
Make your AI chatbot answer questions using YOUR platform's data - career paths, user experiences, course reviews, etc.

## 📚 What You'll Learn
- Convert text to vectors (embeddings)
- Store vectors in database
- Search similar content
- Generate AI responses with context

---

## Understanding RAG in 5 Minutes

### Traditional AI (Limited):
```
User: "How do people become data scientists at Google?"
AI: "Generally, data scientists need Python, SQL, ML..." 
❌ Generic answer, no specific data
```

### RAG AI (Powerful):
```
User: "How do people become data scientists at Google?"

1. Convert question → Vector [0.123, 0.456, ...]
2. Search YOUR database for similar career paths
3. Find: "John: SWE → Data Analyst → Data Scientist at Google (2 years)"
4. Give to AI as context
5. AI: "Based on 5 users in our platform, common path is..."
✅ Specific, accurate, based on YOUR data
```

---

## Architecture Overview

```
┌─────────────────┐
│  User Question  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Create Vector  │ (OpenAI Embeddings)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vector Search  │ (MongoDB/Pinecone)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Get Top 5 Docs  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Prompt   │ "Context: [docs]\nQuestion: [q]"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  AI Response    │ (Based on actual data)
└─────────────────┘
```

---

## Option 1: MongoDB Atlas Vector Search (Recommended)

### Why MongoDB?
- ✅ You're already using it!
- ✅ No additional database needed
- ✅ Free tier available
- ✅ Easy setup

### Step 1: Enable Vector Search in MongoDB Atlas

1. Go to MongoDB Atlas dashboard
2. Click on your cluster
3. Go to "Search" tab
4. Create Search Index:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "content_vector": {
        "type": "knnVector",
        "dimensions": 1536,
        "similarity": "cosine"
      },
      "content": {
        "type": "string"
      },
      "metadata": {
        "type": "document",
        "dynamic": true
      }
    }
  }
}
```

### Step 2: Create Embedding Function

Create `src/lib/embeddings.js`:
```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function createEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // Cheaper & faster
      input: text.substring(0, 8000), // Max 8k tokens
    });

    return response.data[0].embedding; // Array of 1536 numbers
  } catch (error) {
    console.error('Embedding error:', error);
    throw error;
  }
}

export async function createBulkEmbeddings(texts) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts, // Array of strings
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Bulk embedding error:', error);
    throw error;
  }
}
```

### Step 3: Store Career Paths in Vector DB

Create `src/lib/vectorStore.js`:
```javascript
import clientPromise from './mongodb';
import { createEmbedding } from './embeddings';

export class VectorStore {
  static async addDocument(document) {
    const { content, metadata } = document;
    
    // Create embedding
    const embedding = await createEmbedding(content);
    
    // Store in MongoDB
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    await db.collection('vector_documents').insertOne({
      content,
      content_vector: embedding,
      metadata,
      createdAt: new Date()
    });
    
    console.log('✅ Document added to vector store');
  }

  static async search(query, limit = 5) {
    // Create query embedding
    const queryEmbedding = await createEmbedding(query);
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    // Vector search using aggregation
    const results = await db.collection('vector_documents').aggregate([
      {
        $vectorSearch: {
          index: 'vector_index', // Name from Step 1
          path: 'content_vector',
          queryVector: queryEmbedding,
          numCandidates: 100,
          limit: limit
        }
      },
      {
        $project: {
          content: 1,
          metadata: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ]).toArray();
    
    return results;
  }

  static async addCareerPath(careerData) {
    const { userId, name, transitions } = careerData;
    
    // Create rich text description
    const content = `
Career Journey: ${name}
Transitions: ${transitions.map(t => `${t.from} → ${t.to} (${t.duration})`).join(', ')}
Skills gained: ${transitions.flatMap(t => t.skills).join(', ')}
Companies: ${transitions.map(t => t.company).join(', ')}
    `.trim();
    
    await this.addDocument({
      content,
      metadata: {
        type: 'career_path',
        userId,
        name,
        transitions
      }
    });
  }

  static async addCourseReview(reviewData) {
    const { courseName, userName, rating, review, skills } = reviewData;
    
    const content = `
Course: ${courseName}
Rating: ${rating}/5
Review by ${userName}: ${review}
Skills learned: ${skills.join(', ')}
    `.trim();
    
    await this.addDocument({
      content,
      metadata: {
        type: 'course_review',
        courseName,
        userName,
        rating,
        skills
      }
    });
  }

  static async addCompanyInsight(insightData) {
    const { company, role, userName, experience } = insightData;
    
    const content = `
Company: ${company}
Role: ${role}
Employee experience by ${userName}: ${experience}
    `.trim();
    
    await this.addDocument({
      content,
      metadata: {
        type: 'company_insight',
        company,
        role,
        userName
      }
    });
  }
}
```

### Step 4: Create RAG API Endpoint

Create `src/app/api/rag/query/route.js`:
```javascript
import { NextResponse } from 'next/server';
import { VectorStore } from '@/lib/vectorStore';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { question, userId } = await req.json();

    // 1. Search relevant documents
    const relevantDocs = await VectorStore.search(question, 5);

    if (relevantDocs.length === 0) {
      return NextResponse.json({
        answer: "I don't have enough data to answer that question yet. Please check back as more users share their experiences!",
        sources: []
      });
    }

    // 2. Build context from retrieved documents
    const context = relevantDocs
      .map((doc, i) => `[${i + 1}] ${doc.content}`)
      .join('\n\n');

    // 3. Create prompt with context
    const systemPrompt = `You are a career advisor for SkillTrack platform. 
Answer questions using ONLY the provided context from our user database.
If the context doesn't contain relevant information, say so.
Cite your sources using [1], [2], etc.`;

    const userPrompt = `Context from our database:
${context}

User question: ${question}

Provide a helpful answer based on the real experiences above.`;

    // 4. Get AI response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const answer = completion.choices[0].message.content;

    // 5. Return answer with sources
    return NextResponse.json({
      answer,
      sources: relevantDocs.map(doc => ({
        content: doc.content.substring(0, 200) + '...',
        metadata: doc.metadata,
        relevance: doc.score
      }))
    });

  } catch (error) {
    console.error('RAG query error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
```

### Step 5: Update Chatbot Component

Update `src/components/Chatbot.js`:
```javascript
'use client'
import { useState, useEffect, useRef } from 'react';

export default function Chatbot({ user }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Hello ${user?.name}! I can answer questions based on real career data from our platform. Try asking: "How do people transition to data science?"`,
      sender: 'bot',
      timestamp: new Date().toISOString()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = newMessage;
    setNewMessage('');
    setIsLoading(true);

    try {
      // Call RAG API
      const response = await fetch('/api/rag/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          question: currentMessage,
          userId: user.id
        })
      });

      const data = await response.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.answer,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        sources: data.sources // Show sources
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{msg.text}</p>
              
              {/* Show sources */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <p className="text-xs font-semibold mb-2">Sources:</p>
                  {msg.sources.map((source, i) => (
                    <div key={i} className="text-xs mb-1 opacity-75">
                      [{i + 1}] {source.metadata.type} - Score: {source.relevance.toFixed(2)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask about career paths, skills, companies..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Step 6: Populate Vector Database

Create `src/app/api/rag/populate/route.js`:
```javascript
import { NextResponse } from 'next/server';
import { VectorStore } from '@/lib/vectorStore';
import clientPromise from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { adminKey } = await req.json();
    
    // Protect this endpoint!
    if (adminKey !== process.env.ADMIN_SECRET_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Get all users with career data
    const users = await db.collection('users').find({
      careerHistory: { $exists: true, $ne: [] }
    }).toArray();

    let count = 0;

    for (const user of users) {
      if (user.careerHistory && user.careerHistory.length > 0) {
        await VectorStore.addCareerPath({
          userId: user._id,
          name: user.name,
          transitions: user.careerHistory
        });
        count++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Indexed ${count} career paths`
    });

  } catch (error) {
    console.error('Population error:', error);
    return NextResponse.json(
      { error: 'Failed to populate vector store' },
      { status: 500 }
    );
  }
}
```

Run once to populate:
```bash
curl -X POST http://localhost:3000/api/rag/populate \
  -H "Content-Type: application/json" \
  -d '{"adminKey":"your-secret-key"}'
```

---

## Option 2: Pinecone (Easier Alternative)

### Why Pinecone?
- ✅ Purpose-built for vectors
- ✅ Extremely fast
- ✅ Free tier: 100K vectors
- ✅ No setup required

### Step 1: Setup Pinecone

```bash
npm install @pinecone-database/pinecone
```

```javascript
// src/lib/pinecone.js
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY
});

const index = pinecone.index('skilltrack');

export class PineconeStore {
  static async upsert(id, embedding, metadata) {
    await index.upsert([{
      id,
      values: embedding,
      metadata
    }]);
  }

  static async query(embedding, topK = 5) {
    const results = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true
    });

    return results.matches;
  }
}
```

### Comparison: MongoDB vs Pinecone

| Feature | MongoDB Atlas | Pinecone |
|---------|---------------|----------|
| Setup | Configure index | Just API key |
| Speed | Fast | Faster |
| Cost | Free tier (512MB) | Free (100K vectors) |
| Integration | Same database | Extra service |
| Best for | Already using MongoDB | Vector-only focus |

---

## Step 7: Auto-Index New Content

Create `src/lib/hooks/useAutomaticIndexing.js`:
```javascript
// Whenever user updates career, auto-index it
export async function indexCareerUpdate(userId, update) {
  const { VectorStore } = await import('@/lib/vectorStore');
  
  const content = `
Career update for user ${userId}:
${update.title} - ${update.description}
Type: ${update.type}
Date: ${new Date(update.date).toLocaleDateString()}
  `.trim();
  
  await VectorStore.addDocument({
    content,
    metadata: {
      type: 'career_update',
      userId,
      updateId: update.id,
      updateType: update.type
    }
  });
}
```

Add to your career update API:
```javascript
// In src/app/api/user/career/route.js
import { indexCareerUpdate } from '@/lib/hooks/useAutomaticIndexing';

export async function POST(req) {
  // ... existing code to save update ...
  
  // Auto-index for RAG
  await indexCareerUpdate(user.userId, newUpdate);
  
  return NextResponse.json({ success: true });
}
```

---

## Step 8: Advanced RAG Features

### Hybrid Search (Keyword + Vector)
```javascript
export async function hybridSearch(query, limit = 5) {
  // 1. Vector search
  const vectorResults = await VectorStore.search(query, limit);
  
  // 2. Text search
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB);
  const textResults = await db.collection('vector_documents')
    .find({ $text: { $search: query } })
    .limit(limit)
    .toArray();
  
  // 3. Combine and deduplicate
  const combined = [...vectorResults, ...textResults];
  const unique = [...new Map(combined.map(item => [item._id, item])).values()];
  
  return unique.slice(0, limit);
}
```

### Query Rewriting
```javascript
async function rewriteQuery(originalQuery) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{
      role: 'system',
      content: 'Rewrite this question to be more searchable. Extract key concepts.'
    }, {
      role: 'user',
      content: originalQuery
    }],
    temperature: 0.3
  });
  
  return completion.choices[0].message.content;
}

// Use in RAG:
const rewrittenQuery = await rewriteQuery(question);
const results = await VectorStore.search(rewrittenQuery, 5);
```

### Filtering by Metadata
```javascript
// Only search career paths from specific companies
const results = await db.collection('vector_documents').aggregate([
  {
    $vectorSearch: {
      index: 'vector_index',
      path: 'content_vector',
      queryVector: queryEmbedding,
      numCandidates: 100,
      limit: 5,
      filter: {
        'metadata.company': 'Google'
      }
    }
  }
]).toArray();
```

---

## 🧪 Testing RAG

Create `src/app/test-rag/page.js`:
```javascript
'use client';
import { useState } from 'react';

export default function TestRAG() {
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testQuery = async () => {
    setLoading(true);
    const res = await fetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const sampleQuestions = [
    'How do people transition from software engineer to data scientist?',
    'What skills are needed to become a product manager?',
    'Best companies for career growth in India?',
    'How long does it take to get promoted at Google?'
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">RAG Testing Interface</h1>
      
      <div className="mb-4">
        <label className="block font-semibold mb-2">Sample Questions:</label>
        <div className="space-y-2">
          {sampleQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => setQuestion(q)}
              className="block text-left w-full p-2 bg-gray-100 hover:bg-gray-200 rounded"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
      
      <div className="mb-4">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question..."
          className="w-full border rounded p-3"
        />
      </div>
      
      <button
        onClick={testQuery}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded font-semibold disabled:opacity-50"
      >
        {loading ? 'Searching...' : 'Ask Question'}
      </button>
      
      {result && (
        <div className="mt-6 border rounded-lg p-6">
          <h2 className="font-bold text-xl mb-3">Answer:</h2>
          <p className="mb-4 whitespace-pre-wrap">{result.answer}</p>
          
          {result.sources && (
            <>
              <h3 className="font-bold mb-2">Sources ({result.sources.length}):</h3>
              {result.sources.map((source, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded mb-2">
                  <p className="text-sm mb-1">{source.content}</p>
                  <p className="text-xs text-gray-600">
                    Type: {source.metadata.type} | Relevance: {source.relevance.toFixed(3)}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📊 Cost Estimation

### OpenAI Embeddings:
- Model: text-embedding-3-small
- Cost: $0.02 per 1M tokens
- Example: 1000 career paths (500 words each) = ~$0.01

### Vector Storage:
- MongoDB Atlas: Free tier (512MB)
- Pinecone: Free tier (100K vectors)

### AI Completions:
- GPT-3.5-turbo: $0.50 / 1M tokens
- GPT-4-turbo: $10 / 1M tokens

**Expected monthly cost for 1000 users:**
- Embeddings: ~$2
- Completions: ~$10
- **Total: ~$12/month**

---

## 🎯 Performance Tips

1. **Cache embeddings**: Don't re-create for same text
2. **Batch operations**: Embed multiple docs together
3. **Use smaller model**: text-embedding-3-small (cheaper, faster)
4. **Limit context**: Only retrieve top 3-5 documents
5. **Async processing**: Index documents in background

---

## 🚀 Next Steps

1. ✅ Index existing user career paths
2. ✅ Auto-index new content
3. ✅ Add company reviews
4. ✅ Add course recommendations
5. ✅ Track query analytics
6. ✅ A/B test: RAG vs regular chatbot

---

Ready to implement? Start with MongoDB Atlas setup!
