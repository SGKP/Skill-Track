'use client'
import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, useMotionValue, useSpring, useMotionTemplate } from 'framer-motion'

function LoginForm() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [role, setRole] = useState('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [particles, setParticles] = useState([])

  const router = useRouter()
  const searchParams = useSearchParams()
  const containerRef = useRef(null)

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 })
  const spotlightBg = useMotionTemplate`radial-gradient(700px circle at calc(50% + ${springX}px) calc(50% + ${springY}px), rgba(160,110,255,0.16), rgba(80,50,200,0.06) 45%, transparent 70%)`

  useEffect(() => {
    const roleParam = searchParams.get('role')
    if (roleParam === 'admin' || roleParam === 'user') setRole(roleParam)
  }, [searchParams])

  useEffect(() => {
    setParticles(Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 10,
    })))
  }, [])

  useEffect(() => {
    const move = (e) => {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      mouseX.set(e.clientX - rect.left - rect.width / 2)
      mouseY.set(e.clientY - rect.top - rect.height / 2)
    }
    window.addEventListener('mousemove', move)
    return () => window.removeEventListener('mousemove', move)
  }, [mouseX, mouseY])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))
        router.push(role === 'admin' ? '/admin/dashboard' : '/user/dashboard')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = role === 'admin'

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: '#000000' }}
    >
      {/* Black base */}
      <div className="pointer-events-none absolute inset-0 z-0"
        style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 50%, #0a0a12 0%, #000000 100%)' }} />

      {/* Cursor spotlight */}
      <motion.div className="pointer-events-none absolute inset-0 z-0" style={{ background: spotlightBg }} />

      {/* Sweeping beams */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div animate={{ x: ['-100%', '200%'] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 5 }}
          className="absolute top-1/4 -left-1/2 w-1/3 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(180,140,255,0.6), rgba(255,255,255,0.8), rgba(180,140,255,0.6), transparent)', filter: 'blur(0.5px)' }} />
        <motion.div animate={{ x: ['200%', '-100%'] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', repeatDelay: 8, delay: 4 }}
          className="absolute top-2/3 -left-1/2 w-2/5 h-[1px]"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(100,60,255,0.4), rgba(180,150,255,0.6), rgba(100,60,255,0.4), transparent)', filter: 'blur(0.5px)' }} />
      </div>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full"
          style={{ background: isAdmin ? 'radial-gradient(circle, rgba(139,40,217,0.35) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <motion.div animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.38, 0.2] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full"
          style={{ background: isAdmin ? 'radial-gradient(circle, rgba(109,40,217,0.28) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(37,99,235,0.28) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <motion.div animate={{ opacity: [0.06, 0.16, 0.06] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(200,180,255,0.25) 0%, transparent 60%)', filter: 'blur(20px)' }} />
      </div>

      {/* Particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div key={p.id} className="absolute rounded-full"
            style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: 0,
              background: p.id % 3 === 0 ? 'rgba(180,140,255,0.9)' : 'rgba(255,255,255,0.75)' }}
            animate={{ y: [0, -80, -160], opacity: [0, 0.7, 0] }}
            transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }} />
        ))}
      </div>

      {/* Grid */}
      <div className="pointer-events-none absolute inset-0 z-0"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.025]"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(255,255,255,0.5) 80px, rgba(255,255,255,0.5) 81px)' }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Shiny border */}
        <div className="absolute -inset-px rounded-3xl z-0"
          style={{ background: isAdmin
            ? 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 40%, rgba(180,80,255,0.22) 100%)'
            : 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 40%, rgba(100,140,255,0.22) 100%)' }} />

        <div className="relative z-10 rounded-3xl p-10 overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, rgba(12,12,18,0.99) 0%, rgba(5,5,8,1) 100%)',
            boxShadow: `0 0 0 1px rgba(255,255,255,0.09), 0 40px 80px -20px rgba(0,0,0,0.95), 0 0 80px ${isAdmin ? 'rgba(139,80,255,0.22)' : 'rgba(80,100,255,0.22)'}, 0 0 200px ${isAdmin ? 'rgba(100,40,200,0.12)' : 'rgba(60,80,200,0.12)'}`,
          }}>

          {/* Top shine */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          <div className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 45%, rgba(130,80,255,0.05) 100%)' }} />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, delay: 0.15, type: 'spring', stiffness: 200 }}
            className="w-12 h-12 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{
              background: isAdmin ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
              boxShadow: isAdmin ? '0 8px 32px rgba(139,40,217,0.5)' : '0 8px 32px rgba(79,70,229,0.5)',
            }}>
            {isAdmin ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            )}
          </motion.div>

          {/* Title */}
          <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-1.5"
              style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, #ffffff 0%, #d8b4fe 50%, #a855f7 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
              {isAdmin ? 'Admin Portal' : 'Welcome Back'}
            </h1>
            <p className="text-white/40 text-sm">Sign in to your {isAdmin ? 'admin' : ''} dashboard</p>
          </motion.div>

          {/* Error */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm">
              {error}
            </motion.div>
          )}

          {/* Form */}
          <motion.form onSubmit={handleSubmit} className="space-y-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Email Address</label>
              <input type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  '--tw-ring-color': isAdmin ? 'rgba(168,85,247,0.5)' : 'rgba(99,102,241,0.5)',
                }}
                placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2">Password</label>
              <input type="password" required value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none focus:ring-2 transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
                placeholder="••••••••" />
            </div>

            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white relative overflow-hidden mt-2"
              style={{
                background: isAdmin
                  ? 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                boxShadow: isAdmin ? '0 8px 32px rgba(139,40,217,0.35)' : '0 8px 32px rgba(79,70,229,0.35)',
                opacity: loading ? 0.6 : 1,
              }}>
              <motion.div className="absolute inset-0 z-0"
                style={{ background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.15) 50%, transparent 70%)', translateX: '-100%' }}
                whileHover={{ translateX: '200%' }}
                transition={{ duration: 0.6, ease: 'easeInOut' }} />
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign In'}
              </span>
            </motion.button>
          </motion.form>

          {/* Links */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }} className="mt-7 flex flex-col items-center gap-3">
            <Link href="/" className="text-xs text-white/30 hover:text-white/70 transition-colors duration-200">
              ← Back to Home
            </Link>
            {role === 'user' && (
              <Link href="/auth/register" className="text-xs text-white/30 hover:text-white/70 transition-colors duration-200">
                Don't have an account? Register here
              </Link>
            )}
          </motion.div>

          {/* Bottom shine */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </motion.div>
    </div>
  )
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  )
}
