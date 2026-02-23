'use client'
import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion'

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)
const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
)
const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
)

function TiltCard({ children, className = '' }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [6, -6]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-6, 6]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width - 0.5)
    y.set((e.clientY - rect.top) / rect.height - 0.5)
  }
  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function StatCard({ value, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ scale: 1.04, y: -2 }}
      className="flex flex-col items-center p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/40 transition-colors duration-300 hover:bg-purple-500/10 cursor-default"
    >
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, type: 'spring', stiffness: 200 }}
        className={`text-3xl font-bold ${color}`}
      >
        {value}
      </motion.span>
      <span className="text-xs text-gray-400 mt-1 tracking-wide">{label}</span>
    </motion.div>
  )
}

function SkillTag({ skill, onRemove, editing }) {
  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 text-purple-300 rounded-full hover:border-purple-400/60 transition-all duration-200"
    >
      {skill}
      {editing && (
        <button onClick={() => onRemove(skill)} className="text-purple-400 hover:text-red-400 transition-colors ml-0.5">
          <XIcon />
        </button>
      )}
    </motion.span>
  )
}

export default function UserProfile({ user, setUser }) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [formData, setFormData] = useState({
    name: user?.name || '',
    currentRole: user?.currentRole || '',
    experience: user?.experience || '',
    bio: user?.bio || '',
    location: user?.location || '',
    skills: Array.isArray(user?.skills) ? [...user.skills] : []
  })

  const avatarInitials = (user?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const daysActive = user?.createdAt ? Math.floor((Date.now() - new Date(user.createdAt)) / 86400000) : 0

  const addSkill = () => {
    const trimmed = newSkill.trim()
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, trimmed] }))
    }
    setNewSkill('')
  }

  const removeSkill = (skill) => {
    setFormData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        setEditing(false)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      currentRole: user?.currentRole || '',
      experience: user?.experience || '',
      bio: user?.bio || '',
      location: user?.location || '',
      skills: Array.isArray(user?.skills) ? [...user.skills] : []
    })
    setEditing(false)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="max-w-4xl mx-auto space-y-4 pb-10">

      {/* Hero Card */}
      <TiltCard>
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gray-900/80 backdrop-blur-xl"
        >
          {/* Banner */}
          <div className="h-40 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-indigo-700 to-blue-900" />
            <div className="absolute inset-0 opacity-30">
              <motion.div animate={{ x: [0,30,0], y: [0,-20,0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-0 left-0 w-64 h-64 bg-purple-500 rounded-full filter blur-3xl" />
              <motion.div animate={{ x: [0,-20,0], y: [0,30,0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                className="absolute bottom-0 right-0 w-48 h-48 bg-blue-500 rounded-full filter blur-3xl" />
            </div>
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
          </div>

          <div className="px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-14 gap-4">
              {/* Avatar */}
              <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }} className="relative">
                <div className="w-28 h-28 rounded-2xl border-4 border-gray-900 bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-900/50">
                  <span className="text-3xl font-bold text-white">{avatarInitials}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-gray-900" />
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-2 pb-1">
                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.div key="edit-actions" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex gap-2">
                      <button onClick={handleSave} disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-900/40 disabled:opacity-60">
                        <CheckIcon /> {loading ? 'Saving...' : 'Save'}
                      </button>
                      <button onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-gray-300 text-sm font-medium rounded-xl transition-all hover:scale-105">
                        <CloseIcon /> Cancel
                      </button>
                    </motion.div>
                  ) : (
                    <motion.button key="edit-btn" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-purple-600/30 border border-white/20 hover:border-purple-500/50 text-gray-300 hover:text-purple-300 text-sm font-medium rounded-xl transition-all hover:scale-105">
                      <EditIcon /> Edit Profile
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Name & Role */}
            <AnimatePresence mode="wait">
              {editing ? (
                <motion.div key="name-edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Full Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Location</label>
                    <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. New Delhi, India"
                      className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600" />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="name-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3">
                  <h1 className="text-2xl font-bold text-white tracking-tight">{user?.name}</h1>
                  <p className="text-gray-300 mt-0.5">{user?.currentRole || 'Add your role'}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-400">
                    {user?.experience && <span className="text-purple-400 font-medium">{user.experience}</span>}
                    {user?.location && (
                      <span className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {user.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      {user?.email}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </TiltCard>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard value={user?.careerHistory?.length || 0} label="Career Updates" color="text-blue-400" delay={0.1} />
        <StatCard value={user?.skills?.length || 0} label="Skills" color="text-purple-400" delay={0.2} />
        <StatCard value={daysActive} label="Days Active" color="text-green-400" delay={0.3} />
        <StatCard value={user?.status === 'active' ? 'Active' : 'Inactive'} label="Status" color="text-orange-400" delay={0.4} />
      </div>

      {/* About */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4">About</h2>
        <AnimatePresence mode="wait">
          {editing ? (
            <motion.div key="about-edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Current Role</label>
                  <select value={formData.currentRole} onChange={e => setFormData({ ...formData, currentRole: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {['Data Scientist','Software Engineer','Product Manager','Business Analyst','UI/UX Designer','DevOps Engineer','ML Engineer','Full Stack Developer','Other'].map(r => (
                      <option key={r} value={r} className="bg-gray-900">{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Experience Level</label>
                  <select value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                    {[['Entry Level','0-1 years'],['Junior','1-3 years'],['Mid Level','3-5 years'],['Senior','5-8 years'],['Lead','8+ years']].map(([v,l]) => (
                      <option key={v} value={v} className="bg-gray-900">{v} ({l})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Bio</label>
                <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={4}
                  placeholder="Tell people about yourself..."
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600 resize-none" />
              </div>
            </motion.div>
          ) : (
            <motion.div key="about-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {user?.bio ? (
                <p className="text-gray-300 text-sm leading-relaxed">{user.bio}</p>
              ) : (
                <p className="text-gray-500 text-sm italic">No bio added yet. Click Edit Profile to add one.</p>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                {user?.currentRole && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span className="text-blue-300 text-sm font-medium">{user.currentRole}</span>
                  </div>
                )}
                {user?.experience && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-purple-400"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
                    <span className="text-purple-300 text-sm font-medium">{user.experience}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Skills */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Skills</h2>
          <span className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded-full">{(editing ? formData.skills : user?.skills)?.length || 0} skills</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {(editing ? formData.skills : (user?.skills || [])).map((skill) => (
              <SkillTag key={skill} skill={skill} editing={editing} onRemove={removeSkill} />
            ))}
          </AnimatePresence>
          {editing && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-1">
              <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSkill()}
                placeholder="Add skill..." className="px-3 py-1.5 bg-white/5 border border-dashed border-purple-500/40 rounded-full text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-600 w-32" />
              <button onClick={addSkill} className="p-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-400 rounded-full transition-all hover:scale-110">
                <PlusIcon />
              </button>
            </motion.div>
          )}
          {!editing && (!user?.skills || user.skills.length === 0) && (
            <p className="text-gray-500 text-sm italic">No skills added yet.</p>
          )}
        </div>
      </motion.div>

      {/* Contact Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
        className="rounded-2xl border border-white/10 bg-gray-900/80 backdrop-blur-xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-blue-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400">Email</p>
              <p className="text-sm text-white font-medium truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="text-green-400"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-xs text-gray-400">Member Since</p>
              <p className="text-sm text-white font-medium">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

    </motion.div>
  )
}
