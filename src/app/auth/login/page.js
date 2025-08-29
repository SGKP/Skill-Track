'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam && (roleParam === 'admin' || roleParam === 'user')) {
      setRole(roleParam)
    }
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, role }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        
        if (role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/user/dashboard')
        }
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {role === 'admin' ? 'Admin Login' : 'User Login'}
          </h1>
          <p className="text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
            ← Back to Home
          </Link>
        </div>

        {role === 'user' && (
          <div className="mt-4 text-center">
            <Link href="/auth/register" className="text-gray-600 hover:text-gray-800 text-sm">
              Don't have an account? Register here
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
