import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import LangSwitcher from '../ui/LangSwitcher'

const Logo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <div className="w-8 h-8 rounded-full bg-blush-300 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5" stroke="#5C4A3A" strokeWidth="1.2" />
        <circle cx="8" cy="8" r="2" fill="#C47D62" />
      </svg>
    </div>
    <span className="font-display font-medium text-xl text-bark-600 tracking-wide">
      Derm<span className="text-blush-500 italic">iq</span>
    </span>
  </Link>
)

export default function Navbar() {
  const { user, logout } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setMenuOpen(false)
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream-50/80 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
        <Logo />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link to="/dashboard"
                className={`btn-ghost text-xs tracking-widest uppercase ${isActive('/dashboard') ? 'bg-cream-100 text-bark-600' : ''}`}>
                {t('nav.dashboard')}
              </Link>
              <Link to="/analyze"
                className={`btn-ghost text-xs tracking-widest uppercase ${isActive('/analyze') ? 'bg-cream-100 text-bark-600' : ''}`}>
                {t('nav.analyse')}
              </Link>
              <Link to="/history"
                className={`btn-ghost text-xs tracking-widest uppercase ${isActive('/history') ? 'bg-cream-100 text-bark-600' : ''}`}>
                {t('nav.history')}
              </Link>
              <div className="w-px h-4 bg-cream-300 mx-1" />
              <div className="w-8 h-8 rounded-full bg-blush-200 flex items-center justify-center text-bark-500 font-body text-xs font-medium">
                {user.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button onClick={handleLogout} className="btn-ghost text-xs tracking-widest uppercase">
                {t('nav.signOut')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-xs tracking-widest uppercase">
                {t('nav.signIn')}
              </Link>
              <Link to="/register" className="btn-primary text-xs tracking-widest uppercase">
                {t('nav.getStarted')}
              </Link>
            </>
          )}
          <div className="ml-2">
            <LangSwitcher />
          </div>
        </nav>

        {/* Mobile right side */}
        <div className="md:hidden flex items-center gap-2">
          <LangSwitcher compact />
          <button
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span className={`block w-5 h-px bg-bark-500 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-px bg-bark-500 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-px bg-bark-500 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-cream-200 bg-cream-50"
          >
            <div className="px-5 py-4 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center gap-3 py-3 border-b border-cream-200 mb-2">
                    <div className="w-9 h-9 rounded-full bg-blush-200 flex items-center justify-center text-bark-500 font-body text-sm font-medium">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-bark-600">{user.name}</div>
                      <div className="text-2xs text-bark-300">{user.email}</div>
                    </div>
                  </div>
                  {[
                    [t('nav.dashboard'), '/dashboard'],
                    [t('nav.analyse'), '/analyze'],
                    [t('nav.history'), '/history'],
                  ].map(([label, path]) => (
                    <Link key={path} to={path} onClick={() => setMenuOpen(false)}
                      className="py-2.5 px-3 text-sm font-medium text-bark-500 rounded-xl hover:bg-cream-100">
                      {label}
                    </Link>
                  ))}
                  <button onClick={handleLogout}
                    className="py-2.5 px-3 text-sm font-medium text-bark-300 rounded-xl hover:bg-cream-100 text-left">
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary w-full">
                    {t('nav.signIn')}
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary w-full">
                    {t('nav.getStarted')}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
