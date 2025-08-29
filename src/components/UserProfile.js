'use client'
import { useState, useEffect } from 'react'

export default function UserProfile({ user, setUser }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    currentRole: user?.currentRole || '',
    experience: user?.experience || '',
    skills: Array.isArray(user?.skills) ? user.skills.join(', ') : ''
  })
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          skills: formData.skills.split(',').map(skill => skill.trim())
        })
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUser(updatedUser.user)
        localStorage.setItem('user', JSON.stringify(updatedUser.user))
        setEditing(false)
        alert('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <button
          onClick={() => setEditing(!editing)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {editing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          {editing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="text-gray-900">{user?.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <p className="text-gray-900">{user?.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current Role
          </label>
          {editing ? (
            <select
              value={formData.currentRole}
              onChange={(e) => setFormData({...formData, currentRole: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Data Scientist">Data Scientist</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Business Analyst">Business Analyst</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <p className="text-gray-900">{user?.currentRole}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Level
          </label>
          {editing ? (
            <select
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Entry Level">Entry Level (0-1 years)</option>
              <option value="Junior">Junior (1-3 years)</option>
              <option value="Mid Level">Mid Level (3-5 years)</option>
              <option value="Senior">Senior (5-8 years)</option>
              <option value="Lead">Lead (8+ years)</option>
            </select>
          ) : (
            <p className="text-gray-900">{user?.experience}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills
          </label>
          {editing ? (
            <textarea
              value={formData.skills}
              onChange={(e) => setFormData({...formData, skills: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter skills separated by commas"
            />
          ) : (
            <div className="flex flex-wrap gap-2">
              {user?.skills?.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="mt-6 flex space-x-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {user?.careerHistory?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Career Updates</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {user?.activities?.length || 0}
            </p>
            <p className="text-sm text-gray-600">Activities</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
            </p>
            <p className="text-sm text-gray-600">Days Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {user?.status === 'active' ? '✓' : '✗'}
            </p>
            <p className="text-sm text-gray-600">Status</p>
          </div>
        </div>
      </div>
    </div>
  )
}
