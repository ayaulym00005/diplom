import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { analysisAPI } from '../services/api'
import BottomNav from '../components/layout/BottomNav'
import PageHeader from '../components/layout/PageHeader'
import { useLang } from '../context/LangContext'

const SKIN_INFO = {
  acne:        { color: '#FF6B6B', bg: '#fff5f5', emoji: '🔴' },
  dry:         { color: '#FFB347', bg: '#fff8f0', emoji: '🌿' },
  normal:      { color: '#4ECDC4', bg: '#f0fafb', emoji: '✨' },
  oily:        { color: '#5DADE2', bg: '#f0f7ff', emoji: '💧' },
  combination: { color: '#B8A9E3', bg: '#f8f5ff', emoji: '⚡' },
  pigmentation:{ color: '#F4D03F', bg: '#fffdf0', emoji: '🌙' },
  pores:       { color: '#5DADE2', bg: '#f0f7ff', emoji: '🔵' },
  wrinkles:    { color: '#A9A9A9', bg: '#f8f8f8', emoji: '〰️' },
}

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const { t, lang } = useLang()
  const dateLocale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'kk-KZ'

  useEffect(() => {
    analysisAPI.history().then(setHistory).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const avgConf = history.length
    ? Math.round(history.reduce((s, h) => s + h.confidence, 0) / history.length)
    : 0

  const topSkin = (() => {
    const c = {}
    history.forEach(h => { c[h.skin_type] = (c[h.skin_type] || 0) + 1 })
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0]
    return top ? (SKIN_INFO[top[0]] || SKIN_INFO.normal) : null
  })()

  const h = t('history') || {}

  return (
    <div style={s.root}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .hist-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(78,205,196,0.12) !important; }
      `}</style>

      <PageHeader
        title={h.title || 'Тарих 📋'}
        desc={h.desc || 'Барлық анализдеріңіз'}
      />

      <div style={s.content}>
        {!loading && history.length > 0 && (
          <div style={s.statsRow}>
            <div>
              <p style={s.statVal}>{history.length}</p>
              <p style={s.statLabel}>{h.total || 'Жалпы анализ'}</p>
            </div>
            {topSkin && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ ...s.statVal, color: topSkin.color }}>
                  {topSkin.emoji} {(t('skinTypes.' + Object.entries(
                    history.reduce((c, h) => { c[h.skin_type] = (c[h.skin_type] || 0) + 1; return c }, {})
                  ).sort((a, b) => b[1] - a[1])[0]?.[0]) || {}).label?.split(' ')[0] || '—'}
                </p>
                <p style={s.statLabel}>{h.mostCommon || 'Жиі кездесетін'}</p>
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <p style={{ ...s.statVal, color: '#4ECDC4' }}>{avgConf}%</p>
              <p style={s.statLabel}>{h.avgConf || 'Орташа сенімділік'}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 36, height: 36, border: '3px solid #e8f4f3', borderTop: '3px solid #4ECDC4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : history.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: 64 }}>📋</span>
            <h2 style={s.emptyTitle}>{h.empty || 'Тарих бос'}</h2>
            <p style={s.emptyDesc}>{h.emptyDesc || 'Алғашқы анализіңізді жасаңыз'}</p>
            <Link to="/analyze" style={s.emptyBtn}>{h.emptyBtn || '🔬 Анализ жасау'}</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map(item => {
              const sk = SKIN_INFO[item.skin_type] || SKIN_INFO.normal
              const skinLabel = (t('skinTypes.' + item.skin_type) || {}).label || item.skin_type
              const date = new Date(item.created_at)
              return (
                <Link key={item.id} to={`/result/${item.id}`} state={{ result: item }}
                  className="hist-card"
                  style={{ ...s.histCard, borderLeft: `4px solid ${sk.color}`, textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 14, background: sk.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                      {sk.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 15, fontWeight: 800, color: '#2d3748', margin: '0 0 3px' }}>{skinLabel}</p>
                      <p style={{ fontSize: 12, color: '#a0aec0', margin: 0 }}>
                        {date.toLocaleDateString(dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}
                        {date.toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 18, fontWeight: 900, color: sk.color, margin: '0 0 2px' }}>{item.confidence}%</p>
                      <p style={{ fontSize: 10, color: '#a0aec0', margin: 0 }}>{t('result.confidence')}</p>
                    </div>
                    <span style={{ color: '#cbd5e0', fontSize: 20, marginLeft: 4 }}>›</span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
        <div style={{ height: 80 }} />
      </div>
      <BottomNav />
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', background: '#f0fafb', fontFamily: "'Nunito','SF Pro Display',-apple-system,sans-serif", maxWidth: 430, margin: '0 auto' },
  content: { padding: '16px' },
  statsRow: { background: 'white', borderRadius: 20, padding: '16px 20px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e8f4f3', boxShadow: '0 2px 12px rgba(78,205,196,0.06)' },
  statVal: { fontSize: 18, fontWeight: 900, color: '#2d3748', margin: '0 0 2px', fontFamily: "'Poppins',sans-serif" },
  statLabel: { fontSize: 11, color: '#a0aec0', margin: 0, fontWeight: 600 },
  empty: { background: 'white', borderRadius: 24, padding: '48px 24px', textAlign: 'center', border: '1px solid #e8f4f3' },
  emptyTitle: { fontSize: 22, fontWeight: 800, color: '#2d3748', margin: '12px 0 8px', fontFamily: "'Poppins',sans-serif" },
  emptyDesc: { fontSize: 14, color: '#718096', margin: '0 0 20px' },
  emptyBtn: { display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 26px', background: '#4ECDC4', color: 'white', borderRadius: 14, textDecoration: 'none', fontSize: 14, fontWeight: 700 },
  histCard: { background: 'white', borderRadius: 18, padding: '14px 16px', border: '1px solid #e8f4f3', boxShadow: '0 2px 10px rgba(78,205,196,0.06)', transition: 'all 0.2s', display: 'block' },
}