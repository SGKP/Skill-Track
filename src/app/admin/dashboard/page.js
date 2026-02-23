'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import AdminSidebar from '@/components/AdminSidebar'
import UserManagement from '@/components/UserManagement'
import AdminChat from '@/components/AdminChat'
import AdminStats from '@/components/AdminStats'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#08080e' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/20 flex items-center justify-center animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="w-32 h-1 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              className="h-full bg-purple-500/40 rounded-full"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
      </div>
    )
  }

  const titles = {
    stats: { title: 'Dashboard', sub: 'Overview of platform metrics and activity' },
    users: { title: 'Users', sub: 'Manage, view profiles, and track user progress' },
    chat: { title: 'Chat', sub: 'Real-time messaging with connected users' },
  }

  const current = titles[activeTab] || titles.stats

  return (
    <div className="min-h-screen flex" style={{ background: '#08080e' }}>
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        user={user}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden border-b border-white/[0.06] p-4 flex items-center justify-between" style={{ background: 'rgba(10,10,16,0.95)', backdropFilter: 'blur(12px)' }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
            </svg>
          </button>
          <h1 className="text-sm font-semibold text-white/80">{current.title}</h1>
          <div className="w-9" />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8">
            {/* Page Header */}
            <div className="mb-6 hidden lg:flex items-end justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{current.title}</h1>
                <p className="text-sm text-white/25 mt-1">{current.sub}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/20">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'stats' && <AdminStats />}
                {activeTab === 'users' && <UserManagement />}
                {activeTab === 'chat' && <AdminChat />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  )
}
