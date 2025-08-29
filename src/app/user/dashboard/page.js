'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import UserSidebar from '@/components/UserSidebar'
import UserProfile from '@/components/UserProfile'
import CareerTracking from '@/components/CareerTracking'
import Chatbot from '@/components/Chatbot'
import UserChat from '@/components/UserChat'

export default function UserDashboard() {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) {
      router.push('/auth/login?role=user')
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role === 'admin') {
      router.push('/admin/dashboard')
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
      <UserSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
      />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {activeTab === 'profile' && 'Your Profile'}
              {activeTab === 'career' && 'Career Tracking'}
              {activeTab === 'chatbot' && 'AI Career Assistant'}
              {activeTab === 'chat' && 'Admin Communication'}
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.name}! Track your career journey here.
            </p>
          </div>

          {activeTab === 'profile' && <UserProfile user={user} setUser={setUser} />}
          {activeTab === 'career' && <CareerTracking user={user} />}
          {activeTab === 'chatbot' && <Chatbot user={user} />}
          {activeTab === 'chat' && <UserChat user={user} />}
        </div>
      </main>
    </div>
  )
}
