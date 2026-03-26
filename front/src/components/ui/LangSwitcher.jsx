import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../../context/LangContext'
import { LANGUAGE_OPTIONS } from '../../utils/translations'

export default function LangSwitcher({ compact = false }) {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGUAGE_OPTIONS.find((l) => l.code === lang) || LANGUAGE_OPTIONS[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded-xl border border-cream-300 bg-white/70 backdrop-blur-sm
          text-bark-400 font-body font-medium transition-all duration-200
          hover:border-blush-300 hover:text-bark-600 hover:bg-white
          ${open ? 'border-blush-400 text-bark-600 shadow-glow bg-white' : ''}
          ${compact ? 'px-2.5 py-1.5 text-xs' : 'px-3 py-2 text-xs'}`}
        aria-label="Select language"
      >
        <span className="tracking-widest uppercase">{current.label}</span>
        <motion.svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-32 bg-white rounded-2xl border border-cream-200 shadow-card overflow-hidden z-[200]"
          >
            {LANGUAGE_OPTIONS.map((option) => {
              const isActive = option.code === lang
              return (
                <button
                  key={option.code}
                  onClick={() => { setLang(option.code); setOpen(false) }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-body transition-colors
                    ${isActive
                      ? 'bg-blush-100 text-bark-600'
                      : 'text-bark-400 hover:bg-cream-50 hover:text-bark-600'
                    }`}
                >
                  <span>{option.full}</span>
                  <span className={`text-2xs tracking-widest font-medium
                    ${isActive ? 'text-blush-500' : 'text-bark-200'}`}>
                    {option.label}
                  </span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
