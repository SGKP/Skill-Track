'use client'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Career Tracking Platform
          </h1>
          <p className="text-gray-600">
            Track your career journey with AI-powered guidance
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/auth/login?role=user"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 block text-center"
          >
            Login as User
          </Link>
          
          <Link 
            href="/auth/login?role=admin"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 block text-center"
          >
            Login as Admin
          </Link>
          
          <Link 
            href="/auth/register"
            className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-bold py-3 px-4 rounded-lg transition duration-200 block text-center"
          >
            Register New Account
          </Link>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Powered by AI • Real-time Communication • Career Growth</p>
        </div>
      </div>
    </div>
  )
}
