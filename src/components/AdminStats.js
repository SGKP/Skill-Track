'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function StatCard({ title, value, change, icon, color, delay }) {
  const colorMap = {
    blue: { bg: 'from-blue-600/20 to-blue-500/5', border: 'border-blue-500/20', text: 'text-blue-400', glow: 'shadow-blue-500/10' },
    green: { bg: 'from-emerald-600/20 to-emerald-500/5', border: 'border-emerald-500/20', text: 'text-emerald-400', glow: 'shadow-emerald-500/10' },
    purple: { bg: 'from-purple-600/20 to-purple-500/5', border: 'border-purple-500/20', text: 'text-purple-400', glow: 'shadow-purple-500/10' },
    amber: { bg: 'from-amber-600/20 to-amber-500/5', border: 'border-amber-500/20', text: 'text-amber-400', glow: 'shadow-amber-500/10' },
  }
  const c = colorMap[color] || colorMap.blue

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${c.bg} border ${c.border} p-5 shadow-lg ${c.glow}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</p>
          {change !== undefined && (
            <p className={`text-xs font-medium mt-2 ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change)}% from last month
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>
      {/* Decorative corner blur */}
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-20 bg-gradient-to-br ${c.bg}`} />
    </motion.div>
  )
}

function ActivityItem({ activity, index }) {
  const typeConfig = {
    login: { icon: '🔐', label: 'Logged In', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    career_update: { icon: '📊', label: 'Career Update', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    profile_update: { icon: '👤', label: 'Profile Update', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    chat: { icon: '💬', label: 'Chat Message', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    registration: { icon: '🆕', label: 'New User', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
    skill_added: { icon: '🛠', label: 'Skill Added', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
  }
  const cfg = typeConfig[activity.type] || typeConfig.profile_update

  const timeAgo = (timestamp) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-start gap-4 p-3.5 rounded-xl hover:bg-white/[0.02] transition-colors duration-200 group"
    >
      <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0 text-lg`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white/80 font-medium">
          <span className="text-white/95 font-semibold">{activity.userName}</span>
        </p>
        <p className="text-xs text-white/50 mt-0.5">{activity.description}</p>
        {activity.userRole && activity.userRole !== 'Not set' && (
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-medium rounded-md bg-white/[0.04] text-white/30 border border-white/[0.06]">
            {activity.userRole}
          </span>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[10px] font-medium ${cfg.color} px-2 py-0.5 rounded-lg ${cfg.bg} border ${cfg.border}`}>
          {cfg.label}
        </span>
        <span className="text-[10px] text-white/20">
          {timeAgo(activity.timestamp)}
        </span>
      </div>
    </motion.div>
  )
}

function MiniBar({ value, max, color }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`h-full rounded-full ${color}`}
      />
    </div>
  )
}

export default function AdminStats() {
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, totalCareerChanges: 0, recentActivities: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${token}` } })
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
      </div>
    )
  }

  const successRate = stats.totalUsers > 0 ? Math.round((stats.totalCareerChanges / stats.totalUsers) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <StatCard
          title="Total Users" value={stats.totalUsers} delay={0.05} color="blue"
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>}
        />
        <StatCard
          title="Active Users" value={stats.activeUsers} delay={0.1} color="green"
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
        />
        <StatCard
          title="Career Updates" value={stats.totalCareerChanges} delay={0.15} color="purple"
          icon={<svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>}
        />
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active vs Total */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5"
        >
          <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">User Activity</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/50">Active</span>
                <span className="text-emerald-400 font-medium">{stats.activeUsers}</span>
              </div>
              <MiniBar value={stats.activeUsers} max={stats.totalUsers} color="bg-gradient-to-r from-emerald-500 to-emerald-400" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-white/50">Inactive</span>
                <span className="text-white/40 font-medium">{stats.totalUsers - stats.activeUsers}</span>
              </div>
              <MiniBar value={stats.totalUsers - stats.activeUsers} max={stats.totalUsers} color="bg-gradient-to-r from-white/20 to-white/10" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/[0.05] flex items-center justify-between">
            <span className="text-xs text-white/30">{stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% active</span>
            <span className="text-xs text-white/20">{stats.totalUsers} total</span>
          </div>
        </motion.div>

        {/* Career Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5"
        >
          <h4 className="text-xs font-semibold text-white/30 uppercase tracking-wider mb-4">Career Tracking</h4>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                <motion.path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="url(#purpleGrad)" strokeWidth="3" strokeLinecap="round"
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${successRate}, 100` }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-white">{successRate}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-white/60">{stats.totalCareerChanges} career updates</p>
              <p className="text-xs text-white/30">across {stats.totalUsers} users</p>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white/80">Recent Activity</h3>
            <p className="text-xs text-white/25 mt-0.5">Latest user actions across the platform</p>
          </div>
          <button onClick={fetchStats} className="text-xs font-medium text-purple-400/70 hover:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-all duration-200">
            Refresh
          </button>
        </div>
        <div className="p-3">
          {stats.recentActivities.length > 0 ? (
            <div className="divide-y divide-white/[0.03]">
              {stats.recentActivities.map((activity, index) => (
                <ActivityItem key={activity._id || activity.id || `activity-${index}`} activity={activity} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <p className="text-white/20 text-sm">No recent activities</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
