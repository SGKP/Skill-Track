'use client'
import { useState, useEffect } from 'react'

export default function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalCareerChanges: 0,
    recentActivities: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
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
    return <div className="flex justify-center">Loading statistics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">📈</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Career Changes</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCareerChanges}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalUsers > 0 ? Math.round((stats.totalCareerChanges / stats.totalUsers) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent User Activities</h3>
        </div>
        <div className="p-6">
          {stats.recentActivities.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">
                      {activity.type === 'login' && '🔐'}
                      {activity.type === 'career_update' && '📊'}
                      {activity.type === 'profile_update' && '👤'}
                      {activity.type === 'chat' && '💬'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.userName} {activity.description}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent activities</p>
          )}
        </div>
      </div>

      {/* User Growth Chart Placeholder */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">User Growth Overview</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Chart visualization would go here</p>
          <p className="text-sm text-gray-400 ml-2">(Integration with charts library needed)</p>
        </div>
      </div>
    </div>
  )
}
