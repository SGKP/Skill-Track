'use client'
import { useState, useEffect } from 'react'

export default function CareerTracking({ user }) {
  const [careerHistory, setCareerHistory] = useState([])
  const [activities, setActivities] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newUpdate, setNewUpdate] = useState({
    title: '',
    description: '',
    type: 'achievement'
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCareerData()
  }, [])

  const fetchCareerData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/career', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCareerHistory(data.careerHistory || [])
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Error fetching career data:', error)
    }
  }

  const handleAddUpdate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/career', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUpdate)
      })

      if (response.ok) {
        const data = await response.json()
        setCareerHistory(data.careerHistory)
        setActivities(data.activities)
        setNewUpdate({ title: '', description: '', type: 'achievement' })
        setShowAddForm(false)
        alert('Career update added successfully!')
      }
    } catch (error) {
      console.error('Error adding career update:', error)
      alert('Failed to add career update')
    } finally {
      setLoading(false)
    }
  }

  const updateTypes = [
    { value: 'achievement', label: '🏆 Achievement', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'promotion', label: '📈 Promotion', color: 'bg-green-100 text-green-800' },
    { value: 'skill', label: '🎓 New Skill', color: 'bg-blue-100 text-blue-800' },
    { value: 'project', label: '💼 Project', color: 'bg-purple-100 text-purple-800' },
    { value: 'certification', label: '📜 Certification', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'role_change', label: '🔄 Role Change', color: 'bg-pink-100 text-pink-800' }
  ]

  const getTypeInfo = (type) => {
    return updateTypes.find(t => t.value === type) || updateTypes[0]
  }

  return (
    <div className="space-y-6">
      {/* Add New Update */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Career Updates</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {showAddForm ? 'Cancel' : 'Add Update'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddUpdate} className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Update Type
              </label>
              <select
                value={newUpdate.type}
                onChange={(e) => setNewUpdate({...newUpdate, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {updateTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={newUpdate.title}
                onChange={(e) => setNewUpdate({...newUpdate, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Completed Python Certification"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                required
                value={newUpdate.description}
                onChange={(e) => setNewUpdate({...newUpdate, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your achievement, what you learned, impact, etc."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Adding...' : 'Add Update'}
            </button>
          </form>
        )}
      </div>

      {/* Career Timeline */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-6">Career Timeline</h3>
        
        {careerHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No career updates yet. Add your first update above!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {careerHistory.map((item, index) => {
              const typeInfo = getTypeInfo(item.type)
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">{typeInfo.label.split(' ')[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{item.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
                        {typeInfo.label.split(' ').slice(1).join(' ')}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{item.description}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
        
        {activities.length === 0 ? (
          <p className="text-center py-4 text-gray-500">No activities recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {activities.slice(0, 10).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <span className="text-lg">
                    {activity.type === 'login' && '🔐'}
                    {activity.type === 'profile_update' && '👤'}
                    {activity.type === 'career_update' && '📊'}
                    {activity.type === 'chat' && '💬'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {careerHistory.length}
          </div>
          <p className="text-gray-600">Total Updates</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {careerHistory.filter(item => item.type === 'achievement').length}
          </div>
          <p className="text-gray-600">Achievements</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {careerHistory.filter(item => item.type === 'skill').length}
          </div>
          <p className="text-gray-600">Skills Learned</p>
        </div>
      </div>
    </div>
  )
}
