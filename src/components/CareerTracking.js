'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

//  Type Config 
const TYPE_CONFIG = {
  achievement: {
    label: 'Achievement', gradient: 'from-amber-500 to-yellow-500',
    bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400',
    dot: 'bg-amber-500', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  },
  promotion: {
    label: 'Promotion', gradient: 'from-emerald-500 to-green-500',
    bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400',
    dot: 'bg-emerald-500', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  skill: {
    label: 'New Skill', gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400',
    dot: 'bg-blue-500', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    )
  },
  project: {
    label: 'Project', gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400',
    dot: 'bg-violet-500', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  certification: {
    label: 'Certification', gradient: 'from-indigo-500 to-blue-500',
    bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400',
    dot: 'bg-indigo-500', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  },
  role_change: {
    label: 'Role Change', gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400',
    dot: 'bg-rose-500', icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }
}

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

//  Timeline Item 
function TimelineItem({ item, index, isLast }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.achievement
  const date = new Date(item.date)

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="relative flex gap-5"
    >
      {/* Line */}
      {!isLast && (
        <div className="absolute left-5 top-10 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent" />
      )}

      {/* Dot */}
      <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg} border ${cfg.border} ${cfg.text}`}>
        {cfg.icon}
      </div>

      {/* Card */}
      <div
        onClick={() => setExpanded(!expanded)}
        className={`flex-1 mb-6 rounded-xl border bg-slate-900/60 backdrop-blur-sm cursor-pointer transition-all duration-200 hover:border-white/20 ${expanded ? 'border-white/15' : 'border-white/8'}`}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.bg} border ${cfg.border} ${cfg.text}`}>
                  {cfg.label}
                </span>
                <span className="text-xs text-slate-500">
                  {date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h4 className="font-semibold text-white text-sm">{item.title}</h4>
            </div>
            <motion.div
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-500 flex-shrink-0 mt-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <p className="mt-3 text-sm text-slate-400 leading-relaxed border-t border-white/5 pt-3">
                  {item.description}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

//  Main Component 
export default function CareerTracking({ user }) {
  const [careerHistory, setCareerHistory] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [newUpdate, setNewUpdate] = useState({ title: '', description: '', type: 'achievement' })

  useEffect(() => { fetchCareerData() }, [])

  const fetchCareerData = async () => {
    setFetching(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/user/career', { headers: { 'Authorization': `Bearer ${token}` } })
      if (res.ok) {
        const data = await res.json()
        setCareerHistory(data.careerHistory || [])
      }
    } catch (err) { console.error(err) }
    finally { setFetching(false) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/user/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newUpdate)
      })
      if (res.ok) {
        const data = await res.json()
        setCareerHistory(data.careerHistory || [])
        setNewUpdate({ title: '', description: '', type: 'achievement' })
        setShowForm(false)
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  //  Group by year 
  const filtered = activeFilter === 'all' ? careerHistory : careerHistory.filter(i => i.type === activeFilter)
  const byYear = filtered.reduce((acc, item) => {
    const y = new Date(item.date).getFullYear()
    if (!acc[y]) acc[y] = []
    acc[y].push(item)
    return acc
  }, {})
  const sortedYears = Object.keys(byYear).sort((a, b) => b - a)

  //  Stats 
  const total = careerHistory.length
  const typeCounts = Object.fromEntries(Object.keys(TYPE_CONFIG).map(k => [k, careerHistory.filter(i => i.type === k).length]))

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="max-w-4xl mx-auto space-y-5 pb-10">

      {/*  Header  */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Career Journey</h1>
          <p className="text-sm text-slate-400 mt-0.5">{total} milestone{total !== 1 ? 's' : ''} tracked</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showForm
              ? 'bg-white/10 text-slate-300 border border-white/15'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-900/30'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            {showForm
              ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            }
          </svg>
          {showForm ? 'Cancel' : 'Add Milestone'}
        </motion.button>
      </div>

      {/*  Add Form  */}
      <AnimatePresence>
        {showForm && (
          <motion.form
            onSubmit={handleAdd}
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-violet-500/30 bg-slate-900/80 backdrop-blur-xl p-6 shadow-xl shadow-violet-900/10 space-y-4"
          >
            <h3 className="text-white font-semibold text-base">New Career Milestone</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Type</label>
                <select
                  value={newUpdate.type}
                  onChange={e => setNewUpdate({ ...newUpdate, type: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {Object.entries(TYPE_CONFIG).map(([val, cfg]) => (
                    <option key={val} value={val} className="bg-slate-900">{cfg.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Title</label>
                <input
                  type="text" required
                  value={newUpdate.title}
                  onChange={e => setNewUpdate({ ...newUpdate, title: e.target.value })}
                  placeholder="e.g. Completed AWS Certification"
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-600"
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Description</label>
              <textarea
                required rows={3}
                value={newUpdate.description}
                onChange={e => setNewUpdate({ ...newUpdate, description: e.target.value })}
                placeholder="Describe the impact, what you learned, why it matters..."
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 placeholder-slate-600 resize-none"
              />
            </div>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-violet-500 hover:to-indigo-500 transition-all disabled:opacity-50 shadow-lg shadow-violet-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {loading ? 'Saving...' : 'Save Milestone'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/*  Stats Row  */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
          { label: 'Achievements', value: typeCounts.achievement || 0, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
          { label: 'Skills', value: typeCounts.skill || 0, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
          { label: 'Certifications', value: typeCounts.certification || 0, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            whileHover={{ y: -2 }}
            className={`flex flex-col items-center p-4 rounded-xl border ${s.bg} ${s.border}`}>
            <span className={`text-2xl font-bold ${s.color}`}>{s.value}</span>
            <span className="text-xs text-slate-400 mt-0.5">{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/*  Filter Chips  */}
      {total > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              activeFilter === 'all' ? 'bg-white/15 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
            }`}
          >All</button>
          {Object.entries(TYPE_CONFIG).filter(([k]) => typeCounts[k] > 0).map(([val, cfg]) => (
            <button key={val} onClick={() => setActiveFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                activeFilter === val ? `${cfg.bg} ${cfg.border} ${cfg.text}` : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200'
              }`}>
              {cfg.label}
            </button>
          ))}
        </div>
      )}

      {/*  Timeline  */}
      <div className="rounded-2xl border border-white/8 bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl">
        {fetching ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : total === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="text-violet-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="text-slate-300 font-medium">No milestones yet</p>
            <p className="text-slate-500 text-sm mt-1">Add your first career milestone to get started</p>
          </motion.div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">No entries for this filter.</div>
        ) : (
          <div>
            {sortedYears.map((year, yi) => (
              <div key={year}>
                {/* Year Badge */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: yi * 0.1 }}
                  className="flex items-center gap-3 mb-5"
                >
                  <div className="px-3 py-1 rounded-full bg-gradient-to-r from-violet-600/30 to-indigo-600/30 border border-violet-500/30 text-violet-300 text-sm font-bold">
                    {year}
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-violet-500/20 to-transparent" />
                  <span className="text-xs text-slate-500">{byYear[year].length} event{byYear[year].length !== 1 ? 's' : ''}</span>
                </motion.div>

                {/* Items */}
                {byYear[year].map((item, idx) => (
                  <TimelineItem
                    key={item._id || item.id || `${year}-${idx}`}
                    item={item}
                    index={idx}
                    isLast={idx === byYear[year].length - 1 && yi === sortedYears.length - 1}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/*  Type Breakdown  */}
      {total > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/8 bg-slate-900/40 backdrop-blur-xl p-6 shadow-xl">
          <h3 className="text-white font-semibold mb-4">Breakdown by Type</h3>
          <div className="space-y-3">
            {Object.entries(TYPE_CONFIG).filter(([k]) => typeCounts[k] > 0).map(([key, cfg]) => {
              const pct = total > 0 ? Math.round((typeCounts[key] / total) * 100) : 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} border ${cfg.border} ${cfg.text}`}>
                    {cfg.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-medium">{cfg.label}</span>
                      <span className="text-slate-500">{typeCounts[key]}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${cfg.gradient}`}
                      />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-9 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

    </motion.div>
  )
}
