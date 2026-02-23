'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Icons ────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
  </svg>
)
const DownloadIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
  </svg>
)
const UploadIcon = () => (
  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
  </svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/>
  </svg>
)
const EyeIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  </svg>
)
const MailIcon = () => (
  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/>
  </svg>
)

// ─── Full LinkedIn-Style User Profile Modal ────────────
function UserProfileModal({ user, onClose }) {
  if (!user) return null

  const skills = user.skills || []
  const careerHistory = user.careerHistory || []
  const activities = user.activities || []
  const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'
  const lastActive = user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never'

  const timeAgo = (timestamp) => {
    if (!timestamp) return ''
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
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const careerTypeConfig = {
    achievement: { icon: '🏆', label: 'Achievement', color: 'from-amber-500/20 to-yellow-500/10', border: 'border-amber-500/20', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    promotion: { icon: '🚀', label: 'Promotion', color: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/20', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    skill: { icon: '🛠', label: 'New Skill', color: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-500/20', text: 'text-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    project: { icon: '📁', label: 'Project', color: 'from-violet-500/20 to-purple-500/10', border: 'border-violet-500/20', text: 'text-violet-400', badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
    certification: { icon: '📜', label: 'Certification', color: 'from-indigo-500/20 to-blue-500/10', border: 'border-indigo-500/20', text: 'text-indigo-400', badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    role_change: { icon: '🔄', label: 'Role Change', color: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/20', text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  }

  const activityTypeConfig = {
    login: { icon: '🔐', label: 'Login', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    career_update: { icon: '📊', label: 'Career Update', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    profile_update: { icon: '👤', label: 'Profile Update', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    chat: { icon: '💬', label: 'Chat', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    registration: { icon: '🆕', label: 'Registered', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20' },
  }

  // Stats
  const totalActivities = activities.length
  const careerUpdates = activities.filter(a => a.type === 'career_update').length
  const profileUpdates = activities.filter(a => a.type === 'profile_update').length
  const loginCount = activities.filter(a => a.type === 'login').length

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto py-8 px-4 bg-black/80 backdrop-blur-lg"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 30 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-2xl border border-white/[0.08] shadow-2xl my-auto"
        style={{ background: 'linear-gradient(145deg, #111118 0%, #0a0a10 100%)' }}
      >
        {/* ═══ COVER BANNER ═══ */}
        <div className="relative h-40 rounded-t-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 via-indigo-600/30 to-blue-600/40" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIvPjwvc3ZnPg==')] opacity-60" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a10] to-transparent" />
          
          {/* Close button on banner */}
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-xl bg-black/30 backdrop-blur-md text-white/50 hover:text-white/90 hover:bg-black/50 transition-all border border-white/[0.08]">
            <CloseIcon />
          </button>

          {/* Status indicator on banner */}
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl backdrop-blur-md ${
              user.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {user.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* ═══ PROFILE HEADER (overlapping banner) ═══ */}
        <div className="px-6 -mt-12 relative z-10">
          <div className="flex items-end gap-5">
            {/* Large Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500/40 to-indigo-500/40 border-4 border-[#0a0a10] flex items-center justify-center text-4xl font-bold text-purple-200 flex-shrink-0 shadow-xl">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h2 className="text-2xl font-bold text-white truncate">{user.name}</h2>
              <p className="text-sm text-white/40 flex items-center gap-1.5 mt-0.5">
                <MailIcon /> {user.email}
              </p>
            </div>
          </div>

          {/* Role & Experience Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            {user.currentRole && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-500/10 text-blue-300 border border-blue-500/20">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z"/></svg>
                {user.currentRole}
              </span>
            )}
            {user.experience && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {user.experience}
              </span>
            )}
            {user.desiredRole && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>
                Goal: {user.desiredRole}
              </span>
            )}
          </div>
        </div>

        {/* ═══ QUICK STATS BAR ═══ */}
        <div className="mx-6 mt-5 grid grid-cols-4 gap-3">
          {[
            { label: 'Career Updates', value: careerHistory.length, color: 'text-purple-400', icon: '📈' },
            { label: 'Skills', value: skills.length, color: 'text-blue-400', icon: '🛠' },
            { label: 'Activities', value: totalActivities, color: 'text-emerald-400', icon: '⚡' },
            { label: 'Logins', value: loginCount, color: 'text-amber-400', icon: '🔑' },
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <span className="text-lg">{stat.icon}</span>
              <p className={`text-lg font-bold ${stat.color} mt-0.5`}>{stat.value}</p>
              <p className="text-[10px] text-white/25 font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ═══ INFO CARDS ═══ */}
        <div className="mx-6 mt-5 grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider flex items-center gap-1.5">📅 Member Since</p>
            <p className="text-sm font-medium text-white/70 mt-1">{joinDate}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider flex items-center gap-1.5">🕐 Last Active</p>
            <p className="text-sm font-medium text-white/70 mt-1">{lastActive}</p>
          </div>
          {user.updatedAt && (
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider flex items-center gap-1.5">✏️ Last Updated</p>
              <p className="text-sm font-medium text-white/70 mt-1">{new Date(user.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          )}
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-[10px] font-semibold text-white/25 uppercase tracking-wider flex items-center gap-1.5">📊 Profile Updates</p>
            <p className="text-sm font-medium text-white/70 mt-1">{profileUpdates} changes</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ═══ ABOUT / BIO ═══ */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
              About
            </h4>
            {user.bio ? (
              <p className="text-sm text-white/60 leading-relaxed">{user.bio}</p>
            ) : (
              <p className="text-sm text-white/20 italic">No bio provided</p>
            )}
          </div>

          {/* ═══ EDUCATION ═══ */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"/></svg>
              Education
            </h4>
            {user.education ? (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-lg flex-shrink-0">🎓</div>
                <div>
                  <p className="text-sm font-medium text-white/70">{user.education}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/20 italic">No education details provided</p>
            )}
          </div>

          {/* ═══ SKILLS ═══ */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"/></svg>
              Skills ({skills.length})
            </h4>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-3.5 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-600/15 to-blue-600/15 border border-purple-500/20 text-purple-300 rounded-xl hover:border-purple-400/40 hover:from-purple-600/25 hover:to-blue-600/25 transition-all duration-200"
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/20 italic">No skills added yet</p>
            )}
          </div>

          {/* ═══ CAREER TIMELINE ═══ */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"/></svg>
              Career Timeline ({careerHistory.length})
            </h4>
            {careerHistory.length > 0 ? (
              <div className="relative">
                {/* Timeline Vertical Line */}
                <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-purple-500/30 via-blue-500/20 to-transparent" />
                
                <div className="space-y-4">
                  {careerHistory.slice().reverse().map((entry, i) => {
                    const cfg = careerTypeConfig[entry.type] || { icon: '📌', label: entry.type || 'Update', color: 'from-white/10 to-white/5', border: 'border-white/10', text: 'text-white/50', badge: 'bg-white/5 text-white/40 border-white/10' }
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="relative pl-12"
                      >
                        {/* Timeline Dot */}
                        <div className={`absolute left-3 top-3 w-4 h-4 rounded-full bg-gradient-to-br ${cfg.color} border-2 ${cfg.border} z-10`} />
                        
                        <div className={`p-4 rounded-xl bg-gradient-to-br ${cfg.color} border ${cfg.border} hover:border-opacity-60 transition-all duration-200`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 flex-1 min-w-0">
                              <span className="text-xl flex-shrink-0">{cfg.icon}</span>
                              <div className="min-w-0 flex-1">
                                <h5 className="text-sm font-semibold text-white/80">{entry.title}</h5>
                                {entry.description && (
                                  <p className="text-xs text-white/45 mt-1 leading-relaxed">{entry.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-lg border ${cfg.badge}`}>
                                {cfg.label}
                              </span>
                              {entry.date && (
                                <span className="text-[10px] text-white/25">
                                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-3xl">📭</span>
                <p className="text-sm text-white/20 mt-2">No career updates yet</p>
              </div>
            )}
          </div>

          {/* ═══ ACTIVITY LOG ═══ */}
          <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Activity Log ({activities.length})
            </h4>
            {activities.length > 0 ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
                {activities.slice().reverse().map((act, i) => {
                  const cfg = activityTypeConfig[act.type] || activityTypeConfig.profile_update
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.015] border border-white/[0.04] hover:bg-white/[0.03] transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-lg ${cfg.bg} border ${cfg.border} flex items-center justify-center text-sm flex-shrink-0`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/60">{act.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded-md ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                            {cfg.label}
                          </span>
                          <span className="text-[10px] text-white/20">{timeAgo(act.timestamp)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-3xl">📭</span>
                <p className="text-sm text-white/20 mt-2">No activities recorded</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Main Component ──────────────────────────────────
export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [toast, setToast] = useState(null)

  useEffect(() => { fetchUsers() }, [])

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/users', { headers: { 'Authorization': `Bearer ${token}` } })
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
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setUsers(users.filter(user => user._id !== userId))
        showToast('User deleted successfully')
      }
    } catch (error) {
      showToast('Failed to delete user', 'error')
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
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })
      if (response.ok) {
        const data = await response.json()
        showToast(`Imported ${data.count} users successfully`)
        fetchUsers()
        setSelectedFile(null)
      } else {
        const error = await response.json()
        showToast(error.message || 'Upload failed', 'error')
      }
    } catch (error) {
      showToast('Failed to upload CSV', 'error')
    } finally {
      setUploading(false)
    }
  }

  const exportUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/admin/export-csv', { headers: { 'Authorization': `Bearer ${token}` } })
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
        showToast('CSV exported successfully')
      }
    } catch (error) {
      showToast('Failed to export', 'error')
    }
  }

  const viewUserProfile = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/admin/users/${userId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      if (response.ok) {
        const data = await response.json()
        setSelectedUser(data.user)
      }
    } catch (error) {
      // fallback to local data
      const user = users.find(u => u._id === userId)
      if (user) setSelectedUser(user)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = !search ||
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase()) ||
      user.currentRole?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-20 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
        <div className="h-96 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[200] px-4 py-3 rounded-xl text-sm font-medium shadow-lg border ${
              toast.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            }`}
            style={{ backdropFilter: 'blur(12px)' }}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Profile Modal */}
      <AnimatePresence>
        {selectedUser && <UserProfileModal user={selectedUser} onClose={() => setSelectedUser(null)} />}
      </AnimatePresence>

      {/* Toolbar */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-4">
        <div className="flex flex-col lg:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20">
              <SearchIcon />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or role..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-white/20 bg-white/[0.03] border border-white/[0.06] focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/20 transition-all"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {['all', 'active', 'inactive'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  filterStatus === status
                    ? 'bg-purple-500/15 text-purple-300 border border-purple-500/20'
                    : 'bg-white/[0.02] text-white/30 border border-white/[0.05] hover:text-white/50'
                }`}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* CSV Actions */}
          <div className="flex gap-2">
            <form onSubmit={handleFileUpload} className="flex gap-2">
              <label className="cursor-pointer px-3 py-2 rounded-xl text-xs font-medium bg-white/[0.03] text-white/40 border border-white/[0.06] hover:text-white/60 hover:border-white/[0.1] transition-all flex items-center gap-1.5">
                <UploadIcon />
                {selectedFile ? selectedFile.name.slice(0, 15) + '...' : 'CSV'}
                <input type="file" accept=".csv" className="hidden" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </label>
              {selectedFile && (
                <button type="submit" disabled={uploading}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20 hover:bg-purple-500/25 transition-all disabled:opacity-50">
                  {uploading ? 'Uploading...' : 'Upload'}
                </button>
              )}
            </form>
            <button onClick={exportUsers}
              className="px-3 py-2 rounded-xl text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5">
              <DownloadIcon /> Export
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
        <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white/80">Users</h3>
            <p className="text-xs text-white/25 mt-0.5">{filteredUsers.length} of {users.length} users</p>
          </div>
          <button onClick={fetchUsers} className="text-xs font-medium text-purple-400/60 hover:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-500/10 transition-all">
            Refresh
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-white/[0.04]">
                {['User', 'Role', 'Experience', 'Skills', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-white/25 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="hover:bg-white/[0.015] transition-colors duration-150 group"
                >
                  {/* User */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/15 flex items-center justify-center text-xs font-bold text-purple-300 flex-shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white/80 truncate">{user.name}</p>
                        <p className="text-xs text-white/25 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-white/50">{user.currentRole || '-'}</span>
                  </td>

                  {/* Experience */}
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-white/40">{user.experience || '-'}</span>
                  </td>

                  {/* Skills */}
                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {(user.skills || []).slice(0, 3).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-medium bg-white/[0.04] text-white/35 rounded-md border border-white/[0.05]">
                          {skill}
                        </span>
                      ))}
                      {(user.skills?.length || 0) > 3 && (
                        <span className="px-2 py-0.5 text-[10px] font-medium text-white/20">
                          +{user.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold rounded-lg ${
                      user.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                        : 'bg-red-500/10 text-red-400 border border-red-500/15'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'active' ? 'bg-emerald-400' : 'bg-red-400'}`} />
                      {user.status || 'active'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 opacity-50 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => viewUserProfile(user._id)}
                        className="p-2 rounded-lg text-blue-400/70 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        title="View Profile"
                      >
                        <EyeIcon />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="p-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete User"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-white/20 text-sm">No users found</p>
            <p className="text-white/10 text-xs mt-1">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
