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
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-black relative overflow-hidden flex">
      {/* Clean subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-slate-600/5 to-purple-600/5"></div>
      </div>

      {/* Purple accent shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-16 left-16 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-24 right-24 w-52 h-52 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '3s'}}></div>
      </div>

      <UserSidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <main className="flex-1 flex flex-col">
        {/* Mobile Header with Hamburger Menu */}
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50 p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white hover:text-purple-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-lg p-2"
            aria-label="Toggle sidebar"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block h-0.5 w-6 bg-current transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-current transition-all duration-300 mt-1 ${sidebarOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block h-0.5 w-6 bg-current transition-all duration-300 mt-1 ${sidebarOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>

        <div className="flex-1 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 hidden lg:block">
              <h1 className="text-3xl font-bold text-white">
                {activeTab === 'profile' && 'Your Profile'}
                {activeTab === 'career' && 'Career Journey'}
                {activeTab === 'chatbot' && 'Career Assistant'}
                {activeTab === 'chat' && 'Admin Communication'}
              </h1>
              <p className="text-gray-300 mt-2">
                Welcome back, {user?.name}! Track your career journey here.
              </p>
            </div>

            {activeTab === 'profile' && <UserProfile user={user} setUser={setUser} />}
            {activeTab === 'career' && <CareerTracking user={user} />}
            {activeTab === 'chatbot' && <Chatbot user={user} />}
            {activeTab === 'chat' && <UserChat user={user} />}
          </div>
        </div>
      </main>
    </div>
  )
}
