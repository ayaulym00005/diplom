import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard',    label: 'Басты',     emoji: '🏠' },
  { to: '/analyze',      label: 'Анализ',    emoji: '🔬' },
  { to: '/cosmetics',    label: 'Косметика', emoji: '💄' },
  { to: '/chat',         label: 'Чат',       emoji: '🤖' },
  { to: '/profile',      label: 'Профиль',   emoji: '👤' },
]

export default function BottomNav() {
  const loc = useLocation()
  return (
    <div style={s.wrap}>
      {NAV_ITEMS.map(function(item) {
        var active = loc.pathname === item.to
        return (
          <Link key={item.to} to={item.to} style={s.item}>
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: 22 }}>{item.emoji}</span>
              {active && <div style={s.dot} />}
            </div>
            <span style={{ ...s.label, color: active ? '#4ECDC4' : '#a0aec0' }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

const s = {
  wrap: {
    position: 'fixed', bottom: 0, left: 0, right: 0,
    background: 'white',
    borderTop: '1px solid #e8f4f3',
    display: 'flex',
    zIndex: 100,
    boxShadow: '0 -4px 20px rgba(78,205,196,0.1)',
    maxWidth: 430,
    margin: '0 auto',
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  item: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '8px 2px 6px',
    textDecoration: 'none', transition: 'all 0.2s',
  },
  label: {
    fontSize: 9, fontWeight: 700, marginTop: 2,
    fontFamily: "'Nunito',sans-serif",
  },
  dot: {
    position: 'absolute', top: -2, right: -2,
    width: 6, height: 6, borderRadius: '50%', background: '#4ECDC4',
  },
}