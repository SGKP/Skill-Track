import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const dbName = process.env.MONGODB_DB || 'career_tracking'

let cachedClient = null
let cachedDb = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(uri)
    await client.connect()
    
    const db = client.db(dbName)
    
    cachedClient = client
    cachedDb = db
    
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to database:', error)
    throw error
  }
}
