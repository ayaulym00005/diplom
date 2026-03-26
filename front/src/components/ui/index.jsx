import { motion } from 'framer-motion'
import clsx from 'clsx'

// ─── Spinner ──────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }
  return (
    <div className={clsx('relative', sizes[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-cream-300" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blush-400 animate-spin" />
    </div>
  )
}

// ─── Fade wrapper ─────────────────────────────────────
export function FadeUp({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── Section tag ─────────────────────────────────────
export function SectionTag({ children }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-2xs font-body font-medium tracking-widest uppercase text-blush-500 mb-3">
      <span className="w-3 h-px bg-blush-400 inline-block" />
      {children}
    </span>
  )
}

// ─── Progress steps ───────────────────────────────────
export function StepIndicator({ steps, current }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-xs mx-auto mb-10">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={step} className="flex items-center flex-1">
            <div className={clsx(
              'w-7 h-7 rounded-full flex items-center justify-center text-2xs font-body font-medium transition-all duration-300 shrink-0',
              done ? 'bg-sage-400 text-white' : active ? 'bg-blush-400 text-white shadow-glow' : 'bg-cream-200 text-bark-300'
            )}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={clsx('flex-1 h-px transition-all duration-500', done ? 'bg-sage-400' : 'bg-cream-300')} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Card ────────────────────────────────────────────
export function Card({ children, className = '', hover = false }) {
  return (
    <div className={clsx(
      'card',
      hover && 'transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5',
      className
    )}>
      {children}
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────
export function Skeleton({ className = '' }) {
  return <div className={clsx('skeleton rounded-xl', className)} />
}

// ─── Tag / badge ─────────────────────────────────────
export function Badge({ children, color = 'blush' }) {
  const colors = {
    blush: 'bg-blush-100 text-blush-500',
    sage: 'bg-sage-100 text-sage-400',
    bark: 'bg-cream-200 text-bark-400',
  }
  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-2xs font-body font-medium tracking-wide', colors[color])}>
      {children}
    </span>
  )
}

// ─── Divider ─────────────────────────────────────────
export function Divider({ label }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-cream-200" />
      {label && <span className="text-2xs font-body text-bark-300 tracking-widest uppercase">{label}</span>}
      <div className="flex-1 h-px bg-cream-200" />
    </div>
  )
}

// ─── Empty state ─────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      <div className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-4 text-2xl">
        {icon}
      </div>
      <h3 className="font-display text-xl text-bark-500 mb-2">{title}</h3>
      <p className="font-body text-sm text-bark-300 max-w-xs mb-6">{description}</p>
      {action}
    </div>
  )
}
