export default function UserSidebar({ activeTab, setActiveTab, onLogout, user }) {
  const menuItems = [
    { id: 'profile', name: 'Profile', icon: '👤' },
    { id: 'career', name: 'Career Tracking', icon: '📈' },
  { id: 'chatbot', name: 'Career Assistant', icon: '🤖' },
    { id: 'chat', name: 'Admin Chat', icon: '💬' },
  ]

  return (
    <div className="w-64 bg-white shadow-lg h-screen">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">User Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
        <p className="text-xs text-gray-500">{user?.currentRole}</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
              activeTab === item.id ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600' : 'text-gray-700'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </button>
        ))}
      </nav>
      
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={onLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
