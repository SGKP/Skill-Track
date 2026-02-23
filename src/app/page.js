'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useMotionTemplate, AnimatePresence } from 'framer-motion'

const FEATURES = [
  { label: 'Real-time Chat', color: 'from-blue-500 to-cyan-500' },
  { label: 'Progress Analytics', color: 'from-violet-500 to-purple-500' },
  { label: 'Career Goals', color: 'from-emerald-500 to-teal-500' },
  { label: 'AI Guidance', color: 'from-rose-500 to-pink-500' },
]

const BUTTONS = [
  {
    label: 'Login as User',
    href: '/auth/login?role=user',
    gradient: 'from-blue-600 to-indigo-600',
    shadow: 'shadow-blue-900/40',
    glow: 'rgba(99,102,241,0.35)',
    delay: 0.5,
  },
  {
    label: 'Login as Admin',
    href: '/auth/login?role=admin',
    gradient: 'from-violet-600 to-purple-600',
    shadow: 'shadow-purple-900/40',
    glow: 'rgba(139,92,246,0.35)',
    delay: 0.65,
  },
  {
    label: 'Create New Account',
    href: '/auth/register',
    gradient: null,
    shadow: '',
    glow: 'rgba(255,255,255,0.08)',
    delay: 0.8,
  },
]

export default function Home() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 60, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 60, damping: 20 })
  const containerRef = useRef(null)
  const [hovered, setHovered] = useState(null)
  const [particles, setParticles] = useState([])

  const spotlightBg = useMotionTemplate`radial-gradient(700px circle at calc(50% + ${springX}px) calc(50% + ${springY}px), rgba(160,110,255,0.16), rgba(80,50,200,0.06) 45%, transparent 70%)`

  useEffect(() => {
    // Generate particles only on client to avoid hydration mismatch
    setParticles(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        duration: Math.random() * 20 + 15,
        delay: Math.random() * 10,
      }))
    )
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

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{ background: '#000000' }}
    >
      {/* Deep black base vignette */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 80% 70% at 50% 50%, #0a0a12 0%, #000000 100%)',
        }}
      />

      {/* Cursor spotlight — reactive, large, intense */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{ background: spotlightBg }}
      />

      {/* Sweeping light beams */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', repeatDelay: 5 }}
          className="absolute top-1/4 -left-1/2 w-1/3 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(180,140,255,0.6), rgba(255,255,255,0.8), rgba(180,140,255,0.6), transparent)',
            filter: 'blur(0.5px)',
          }}
        />
        <motion.div
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', repeatDelay: 8, delay: 3 }}
          className="absolute top-2/3 -left-1/2 w-1/4 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(120,80,255,0.5), rgba(200,180,255,0.7), rgba(120,80,255,0.5), transparent)',
            filter: 'blur(0.5px)',
          }}
        />
        <motion.div
          animate={{ x: ['200%', '-100%'] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', repeatDelay: 7, delay: 6 }}
          className="absolute top-1/2 -left-1/2 w-2/5 h-[1px]"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(100,60,255,0.3), rgba(160,120,255,0.5), rgba(100,60,255,0.3), transparent)',
            filter: 'blur(1px)',
          }}
        />
      </div>

      {/* Strong ambient glows */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.25, 0.45, 0.25] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-48 -left-48 w-[650px] h-[650px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(109,40,217,0.35) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.38, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute -bottom-48 -right-48 w-[700px] h-[700px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(37,99,235,0.3) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }}
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.28, 0.15] }}
          transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(79,70,229,0.2) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
        {/* Extra shiny center highlight */}
        <motion.div
          animate={{ opacity: [0.06, 0.14, 0.06] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200,180,255,0.25) 0%, transparent 60%)',
            filter: 'blur(20px)',
          }}
        />
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className="absolute rounded-full"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              opacity: 0,
              background: p.id % 3 === 0 ? 'rgba(180,140,255,0.9)' : 'rgba(255,255,255,0.75)',
            }}
            animate={{
              y: [0, -80, -160],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Grid lines */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      {/* Diagonal gloss streaks */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent, transparent 80px, rgba(255,255,255,0.5) 80px, rgba(255,255,255,0.5) 81px)',
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Shiny card border */}
        <div
          className="absolute -inset-px rounded-3xl z-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.03) 40%, rgba(140,90,255,0.22) 100%)',
          }}
        />

        <div
          className="relative z-10 rounded-3xl p-10 overflow-hidden"
          style={{
            background:
              'linear-gradient(145deg, rgba(12,12,18,0.99) 0%, rgba(5,5,8,1) 100%)',
            boxShadow:
              '0 0 0 1px rgba(255,255,255,0.09), 0 40px 80px -20px rgba(0,0,0,0.95), 0 0 80px rgba(120,80,255,0.22), 0 0 200px rgba(80,40,200,0.12)',
          }}
        >
          {/* Inner top shine — bright white line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
          {/* Diagonal gloss overlay */}
          <div
            className="absolute inset-0 pointer-events-none rounded-3xl"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 45%, rgba(130,80,255,0.05) 100%)',
            }}
          />

          {/* Logo / Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            className="text-center mb-10"
          >
            {/* Icon mark */}
            <motion.div
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, delay: 0.15, type: 'spring', stiffness: 200 }}
              className="w-14 h-14 mx-auto mb-5 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </motion.div>

            <h1
              className="text-4xl font-bold tracking-tight mb-2"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SkillTrack
            </h1>
            <p className="text-sm font-medium text-white/40 tracking-widest uppercase mb-1">
              Career Tracking Platform
            </p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="text-white/50 text-sm mt-3"
            >
              Track your career journey with real-time AI guidance
            </motion.p>
          </motion.div>

          {/* Buttons */}
          <div className="space-y-3">
            {BUTTONS.map((btn, i) => (
              <motion.div
                key={btn.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: btn.delay, ease: 'easeOut' }}
                onHoverStart={() => setHovered(i)}
                onHoverEnd={() => setHovered(null)}
              >
                <Link href={btn.href} className="block group relative">
                  {/* Glow on hover */}
                  <AnimatePresence>
                    {hovered === i && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute -inset-1 rounded-2xl blur-lg z-0"
                        style={{ background: btn.glow }}
                      />
                    )}
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.025, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className={`relative z-10 w-full py-3.5 px-6 rounded-xl text-sm font-semibold flex items-center justify-between overflow-hidden ${
                      btn.gradient
                        ? `bg-gradient-to-r ${btn.gradient} text-white shadow-lg ${btn.shadow}`
                        : 'text-white/80 border border-white/10 bg-white/[0.04]'
                    }`}
                  >
                    {/* Shimmer sweep */}
                    <motion.div
                      className="absolute inset-0 z-0"
                      style={{
                        background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
                        translateX: '-100%',
                      }}
                      whileHover={{ translateX: '200%' }}
                      transition={{ duration: 0.6, ease: 'easeInOut' }}
                    />
                    <span className="relative z-10">{btn.label}</span>
                    <motion.svg
                      className="relative z-10 w-4 h-4 opacity-60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      whileHover={{ x: 3 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </motion.svg>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="mt-9 pt-7 border-t border-white/[0.06]"
          >
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.05 + i * 0.08 }}
                  className="flex items-center gap-2.5 group"
                >
                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${f.color} flex-shrink-0`} />
                  <span className="text-xs text-white/40 group-hover:text-white/70 transition-colors duration-200">
                    {f.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Bottom inner shine */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      </motion.div>
    </div>
  )
}
