'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/AdminSidebar'
import UserManagement from '@/components/UserManagement'
import AdminChat from '@/components/AdminChat'
import AdminStats from '@/components/AdminStats'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/auth/login?role=admin')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== 'admin') {
      router.push('/')
      return
    }

    setUser(parsedUser)
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === 'stats' && 'Dashboard Overview'}
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'chat' && 'Real-time Communication'}
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! Here's what's happening today.
            </p>
          </div>

          {activeTab === 'stats' && <AdminStats />}
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'chat' && <AdminChat />}
        </div>
      </main>
    </div>
  )
}
