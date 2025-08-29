'use client'
import { useState, useEffect } from 'react'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId))
        alert('User deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      alert('Failed to delete user')
    }
  }

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile) return

    setUploading(true)
    const formData = new FormData()
    formData.append('csvFile', selectedFile)

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Successfully imported ${data.count} users`)
        fetchUsers()
        setSelectedFile(null)
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.message}`)
      }
    } catch (error) {
      console.error('Error uploading CSV:', error)
      alert('Failed to upload CSV file')
    } finally {
      setUploading(false)
    }
  }

  const exportUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/export-csv', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting users:', error)
      alert('Failed to export users')
    }
  }

  if (loading) {
    return <div className="flex justify-center">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      {/* CSV Upload/Export Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">CSV Management</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleFileUpload} className="flex gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
          
          <button
            onClick={exportUsers}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Export Users CSV
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Registered Users ({users.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.currentRole}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.experience}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
