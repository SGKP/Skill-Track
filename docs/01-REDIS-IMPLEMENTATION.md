# Redis Caching Implementation Guide

## 🎯 Goal
Reduce API response time from 500ms → 5ms for frequently accessed data.

## 📋 Prerequisites
- Basic understanding of caching concepts
- Node.js installed
- Redis server (local or cloud)

---

## Step 1: Setup Redis (Choose One)

### Option A: Local Development (Windows)
```powershell
# Using Docker (Recommended)
docker run -d --name redis-skilltrack -p 6379:6379 redis

# Verify it's running
docker ps
```

### Option B: Cloud Redis (Production)
**Upstash Redis** (Free tier, perfect for Vercel)
1. Go to https://upstash.com/
2. Create account
3. Create Redis database
4. Copy connection string

---

## Step 2: Install Dependencies
```bash
npm install redis ioredis
```

---

## Step 3: Create Redis Client

Create `src/lib/redis.js`:
```javascript
import { createClient } from 'redis';

let redis = null;

export async function getRedisClient() {
  if (redis && redis.isOpen) {
    return redis;
  }

  redis = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          return new Error('Too many retries');
        }
        return retries * 100; // Exponential backoff
      }
    }
  });

  redis.on('error', (err) => console.error('Redis Client Error', err));
  redis.on('connect', () => console.log('✅ Redis Connected'));

  await redis.connect();
  return redis;
}

// Helper functions
export class RedisCache {
  static async get(key) {
    try {
      const client = await getRedisClient();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null; // Fail gracefully
    }
  }

  static async set(key, value, expirySeconds = 3600) {
    try {
      const client = await getRedisClient();
      await client.setEx(key, expirySeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  static async del(key) {
    try {
      const client = await getRedisClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  static async invalidatePattern(pattern) {
    try {
      const client = await getRedisClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis INVALIDATE error:', error);
      return false;
    }
  }
}
```

---

## Step 4: Cache User Profile

Modify `src/api/user/profile/route.js`:
```javascript
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { RedisCache } from '@/lib/redis';

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = `user:profile:${user.userId}`;

    // Try cache first
    const cachedProfile = await RedisCache.get(cacheKey);
    if (cachedProfile) {
      console.log('✅ Cache HIT:', cacheKey);
      return NextResponse.json({
        ...cachedProfile,
        cached: true,
        source: 'redis'
      });
    }

    console.log('❌ Cache MISS:', cacheKey);

    // Cache miss - fetch from database
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    
    const userProfile = await db.collection('users').findOne(
      { _id: user.userId },
      { projection: { password: 0 } } // Exclude password
    );

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Store in cache for 1 hour
    await RedisCache.set(cacheKey, userProfile, 3600);

    return NextResponse.json({
      ...userProfile,
      cached: false,
      source: 'mongodb'
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await req.json();
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Update database
    await db.collection('users').updateOne(
      { _id: user.userId },
      { $set: updates }
    );

    // Invalidate cache
    const cacheKey = `user:profile:${user.userId}`;
    await RedisCache.del(cacheKey);
    console.log('🗑️ Cache invalidated:', cacheKey);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## Step 5: Cache Dashboard Stats

Create `src/api/cache-stats/route.js`:
```javascript
import { NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/auth';
import clientPromise from '@/lib/mongodb';
import { RedisCache } from '@/lib/redis';

export async function GET(req) {
  try {
    const user = await getUserFromToken(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const cacheKey = 'admin:dashboard:stats';

    // Try cache (5 minute expiry for stats)
    const cachedStats = await RedisCache.get(cacheKey);
    if (cachedStats) {
      return NextResponse.json({
        ...cachedStats,
        cached: true,
        cacheAge: Date.now() - cachedStats.timestamp
      });
    }

    // Calculate stats from database (expensive operation)
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    const [totalUsers, activeUsers, premiumUsers] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('users').countDocuments({ 
        lastLogin: { $gte: new Date(Date.now() - 30*24*60*60*1000) }
      }),
      db.collection('users').countDocuments({ subscription: 'premium' })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      premiumUsers,
      revenue: premiumUsers * 499, // ₹499 per premium user
      timestamp: Date.now()
    };

    // Cache for 5 minutes
    await RedisCache.set(cacheKey, stats, 300);

    return NextResponse.json({
      ...stats,
      cached: false
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## Step 6: Rate Limiting

Create `src/lib/rateLimit.js`:
```javascript
import { RedisCache } from './redis';
import { getRedisClient } from './redis';

export async function rateLimit(identifier, maxRequests = 10, windowSeconds = 60) {
  try {
    const client = await getRedisClient();
    const key = `ratelimit:${identifier}:${Math.floor(Date.now() / 1000 / windowSeconds)}`;
    
    const requests = await client.incr(key);
    
    if (requests === 1) {
      // First request in this window - set expiry
      await client.expire(key, windowSeconds);
    }
    
    return {
      allowed: requests <= maxRequests,
      remaining: Math.max(0, maxRequests - requests),
      resetIn: windowSeconds
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request if Redis is down
    return { allowed: true, remaining: maxRequests, resetIn: windowSeconds };
  }
}

// Usage in API route
export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  const limit = await rateLimit(ip, 10, 60); // 10 requests per minute
  
  if (!limit.allowed) {
    return NextResponse.json({
      error: 'Too many requests',
      resetIn: limit.resetIn
    }, { 
      status: 429,
      headers: {
        'X-RateLimit-Remaining': limit.remaining.toString(),
        'X-RateLimit-Reset': limit.resetIn.toString()
      }
    });
  }
  
  // Process request
}
```

---

## Step 7: Session Storage

Create `src/lib/session.js`:
```javascript
import { RedisCache } from './redis';
import crypto from 'crypto';

export class SessionManager {
  static async createSession(userId, userData) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      userId,
      ...userData,
      createdAt: Date.now()
    };
    
    // Store session for 7 days
    await RedisCache.set(`session:${sessionId}`, sessionData, 7*24*60*60);
    
    return sessionId;
  }
  
  static async getSession(sessionId) {
    return await RedisCache.get(`session:${sessionId}`);
  }
  
  static async destroySession(sessionId) {
    await RedisCache.del(`session:${sessionId}`);
  }
  
  static async refreshSession(sessionId) {
    const session = await this.getSession(sessionId);
    if (session) {
      // Extend expiry
      await RedisCache.set(`session:${sessionId}`, session, 7*24*60*60);
    }
  }
}
```

---

## Step 8: Leaderboard (Bonus)

Create `src/api/leaderboard/route.js`:
```javascript
import { getRedisClient } from '@/lib/redis';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const skill = searchParams.get('skill') || 'overall';
    
    const redis = await getRedisClient();
    const key = `leaderboard:${skill}`;
    
    // Get top 100 users
    const topUsers = await redis.zRangeWithScores(key, 0, 99, { REV: true });
    
    const leaderboard = topUsers.map((item, index) => ({
      rank: index + 1,
      userId: item.value,
      score: item.score
    }));
    
    return NextResponse.json({ leaderboard });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { userId, skill = 'overall', score } = await req.json();
    
    const redis = await getRedisClient();
    const key = `leaderboard:${skill}`;
    
    // Add/update user score
    await redis.zAdd(key, { score, value: userId });
    
    // Get user's rank
    const rank = await redis.zRevRank(key, userId);
    
    return NextResponse.json({ 
      success: true, 
      rank: rank + 1,
      score 
    });
    
  } catch (error) {
    console.error('Score update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

---

## 🧪 Testing

Create `src/app/test-redis/page.js`:
```javascript
'use client';
import { useState } from 'react';

export default function TestRedis() {
  const [results, setResults] = useState([]);

  const testCache = async () => {
    const tests = [];
    
    // Test 1: Cold start (no cache)
    const start1 = Date.now();
    await fetch('/api/user/profile');
    tests.push({ name: 'First call (no cache)', time: Date.now() - start1 });
    
    // Test 2: Warm cache
    const start2 = Date.now();
    await fetch('/api/user/profile');
    tests.push({ name: 'Second call (cached)', time: Date.now() - start2 });
    
    // Test 3: Warm cache again
    const start3 = Date.now();
    await fetch('/api/user/profile');
    tests.push({ name: 'Third call (cached)', time: Date.now() - start3 });
    
    setResults(tests);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Redis Cache Testing</h1>
      <button 
        onClick={testCache}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Run Performance Test
      </button>
      
      {results.length > 0 && (
        <div className="mt-4">
          <h2 className="font-bold">Results:</h2>
          {results.map((test, i) => (
            <div key={i} className="p-2 border-b">
              {test.name}: <strong>{test.time}ms</strong>
            </div>
          ))}
          <div className="mt-4 p-4 bg-green-100 rounded">
            Speed improvement: {((results[0].time / results[1].time) * 100).toFixed(0)}x faster!
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## 📝 Environment Variables

Add to `.env.local`:
```bash
# Local Redis
REDIS_URL=redis://localhost:6379

# Or Upstash Redis (Production)
REDIS_URL=rediss://:YOUR_PASSWORD@YOUR_ENDPOINT.upstash.io:6379
```

---

## 🚀 Next Steps

1. **Monitor Cache Hit Rate**
   - Track hits vs misses
   - Aim for >80% hit rate

2. **Cache Invalidation Strategy**
   - Invalidate when data changes
   - Use TTL (Time To Live) appropriately

3. **Advanced Patterns**
   - Cache-aside (implemented above)
   - Write-through cache
   - Cache warming

4. **Production Monitoring**
   - Use Redis MONITOR command
   - Track memory usage
   - Set up alerts for high memory

---

## 🎯 Expected Results

Without Redis:
- Profile API: ~500ms
- Stats API: ~2000ms
- Dashboard load: ~3000ms

With Redis:
- Profile API: ~5ms (100x faster!)
- Stats API: ~10ms (200x faster!)
- Dashboard load: ~200ms (15x faster!)

---

## 🐛 Troubleshooting

**Redis connection error:**
```bash
# Check if Redis is running
docker ps

# Restart Redis
docker restart redis-skilltrack
```

**Memory issues:**
```javascript
// Check Redis memory
const redis = await getRedisClient();
const info = await redis.info('memory');
console.log(info);

// Set max memory policy
await redis.configSet('maxmemory-policy', 'allkeys-lru');
```

---

Ready to implement? Run `npm install redis` and start caching!
