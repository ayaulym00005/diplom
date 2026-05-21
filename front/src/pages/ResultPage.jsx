import { useEffect, useState } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { analysisAPI } from '../services/api'
import { useLang } from '../context/LangContext'
import BottomNav from '../components/layout/BottomNav'
import LangSwitcher from '../components/ui/LangSwitcher'
import http from '../services/api'

const SKIN_INFO = {
  acne:        { color:'#FF6B6B', bg:'#fff5f5', emoji:'🔴' },
  dry:         { color:'#FFB347', bg:'#fff8f0', emoji:'🌿' },
  normal:      { color:'#4ECDC4', bg:'#f0fafb', emoji:'✨' },
  oily:        { color:'#5DADE2', bg:'#f0f7ff', emoji:'💧' },
  combination: { color:'#B8A9E3', bg:'#f8f5ff', emoji:'⚡' },
  pigmentation:{ color:'#F4D03F', bg:'#fffdf0', emoji:'🌙' },
  pores:       { color:'#5DADE2', bg:'#f0f7ff', emoji:'🔵' },
  wrinkles:    { color:'#A9A9A9', bg:'#f8f8f8', emoji:'〰️' },
}


function StarRating({ value, onChange, readonly }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => !readonly && onChange && onChange(n)}
          style={{
            background: 'none', border: 'none', cursor: readonly ? 'default' : 'pointer',
            fontSize: 28, padding: 2,
            filter: n <= value ? 'none' : 'grayscale(1)',
            transition: 'all 0.15s',
          }}>
          ⭐
        </button>
      ))}
    </div>
  )
}

export default function ResultPage() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { t } = useLang()
  const [result, setResult] = useState(location.state?.result || null)
  const [loading, setLoading] = useState(!result)
  const [animated, setAnimated] = useState(false)
  const [activeTab, setActiveTab] = useState('morning')

  // Review state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewSent, setReviewSent] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    if (!result && id) {
      analysisAPI.get(id).then(setResult).catch(() => navigate('/analyze')).finally(() => setLoading(false))
    }
    setTimeout(() => setAnimated(true), 200)
    loadReviews()
  }, [id])

  const loadReviews = async () => {
    try {
      const data = await http.get('/reviews/')
      setReviews(data.slice(0, 5))
    } catch (e) {}
  }

  const submitReview = async () => {
    if (!comment.trim()) return
    setReviewLoading(true)
    try {
      await http.post('/reviews/', {
        rating,
        comment,
        analysis_id: id,
        skin_type: result?.skin_type,
      })
      setReviewSent(true)
      setComment('')
      loadReviews()
    } catch (e) {}
    finally { setReviewLoading(false) }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f0fafb' }}>
      <div style={{ width: 44, height: 44, border: '4px solid #e8f4f3', borderTop: '4px solid #4ECDC4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  )

  const skinKey = result?.skin_type || 'normal'
  const sk = SKIN_INFO[skinKey] || SKIN_INFO.normal
  const skinTrans = t('skinTypes.' + skinKey) || {}
  const label = skinTrans.label || skinKey
  const desc = skinTrans.desc || ''
  const tips = t('tips.' + skinKey) || t('tips.normal') || { morning: [], evening: [], ingredients: [] }
  const conf = result?.confidence || 0
  const circ = 2 * Math.PI * 38
  const offset = circ - (conf / 100) * circ

  return (
    <div style={s.root}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .tab-btn:hover { opacity: 0.8; }
        .tip-item:hover { background: ${sk.bg} !important; }
        textarea:focus { outline: none; border-color: #4ECDC4 !important; }
        textarea::placeholder { color: #b0bec5; }
      `}</style>

      {/* Header */}
      <div style={{ ...s.header, background: `linear-gradient(135deg,${sk.color},${sk.color}cc)` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Link to="/dashboard" style={s.back}>{t('result.back')}</Link>
          <LangSwitcher />
        </div>
        <div style={s.headerContent}>
          <span style={{ fontSize: 52 }}>{sk.emoji}</span>
          <div style={{ flex: 1 }}>
            <p style={s.headerTag}>{t('result.detected')}</p>
            <h1 style={s.headerTitle}>{label}</h1>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
          </div>
          {/* Ring */}
          <div style={{ position: 'relative', width: 88, height: 88, flexShrink: 0 }}>
            <svg width="88" height="88" viewBox="0 0 88 88">
              <circle cx="44" cy="44" r="38" stroke="rgba(255,255,255,0.3)" strokeWidth="6" fill="none" />
              <circle cx="44" cy="44" r="38" stroke="white" strokeWidth="6" fill="none"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={animated ? offset : circ}
                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1.2s ease 0.3s' }} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: 0 }}>{conf}%</p>
            </div>
          </div>
        </div>
      </div>

      <div style={s.content}>
        {/* Probabilities */}
        {result?.probabilities && (
          <div style={s.card}>
            <h3 style={s.cardTitle}>{t('result.analysis')}</h3>
            {Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([cls, prob]) => {
              const info = SKIN_INFO[cls] || SKIN_INFO.normal
              const clsTrans = t('skinTypes.' + cls) || {}
              return (
                <div key={cls} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: 110, flexShrink: 0 }}>
                    <span style={{ fontSize: 14 }}>{info.emoji}</span>
                    <span style={{ fontSize: 12, color: '#4a5568', fontWeight: 600 }}>{clsTrans.label || cls}</span>
                  </div>
                  <div style={{ flex: 1, height: 8, background: '#f0fafb', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${prob * 100}%`, background: info.color, borderRadius: 4, transition: 'width 1s ease 0.5s' }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: info.color, minWidth: 36, textAlign: 'right' }}>{Math.round(prob * 100)}%</span>
                </div>
              )
            })}
          </div>
        )}

        {/* Skincare Routine Tabs */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>{t('result.care')}</h3>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[
              { key: 'morning', label: t('result.tabMorning') },
              { key: 'evening', label: t('result.tabEvening') },
              { key: 'ingredients', label: t('result.tabIngredients') },
            ].map(tab => (
              <button key={tab.key} className="tab-btn"
                onClick={() => setActiveTab(tab.key)}
                style={{
                  flex: 1, padding: '10px 6px',
                  borderRadius: 12, border: 'none',
                  background: activeTab === tab.key ? sk.color : '#f0fafb',
                  color: activeTab === tab.key ? 'white' : '#718096',
                  fontSize: 12, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.2s',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'morning' && tips.morning.map((tip, i) => (
            <div key={i} className="tip-item" style={s.tipItem}>
              <div style={{ ...s.tipNum, background: sk.color }}>{i + 1}</div>
              <p style={{ fontSize: 14, color: '#4a5568', margin: 0, lineHeight: 1.5, flex: 1 }}>{tip}</p>
            </div>
          ))}

          {activeTab === 'evening' && tips.evening.map((tip, i) => (
            <div key={i} className="tip-item" style={s.tipItem}>
              <div style={{ ...s.tipNum, background: '#5DADE2' }}>{i + 1}</div>
              <p style={{ fontSize: 14, color: '#4a5568', margin: 0, lineHeight: 1.5, flex: 1 }}>{tip}</p>
            </div>
          ))}

          {activeTab === 'ingredients' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tips.ingredients.map((ing, i) => (
                <span key={i} style={{
                  padding: '8px 14px', borderRadius: 100,
                  background: sk.bg, color: sk.color,
                  fontSize: 12, fontWeight: 700,
                  border: `1.5px solid ${sk.color}40`,
                }}>
                  {ing}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Link to="/analyze" style={{ ...s.primBtn, background: sk.color }}>{t('result.again')}</Link>
          <Link to="/history" style={s.secBtn}>{t('result.historyBtn')}</Link>
        </div>

        {/* Reviews section */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>{t('result.reviewTitle')}</h3>

          {reviewSent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <span style={{ fontSize: 48 }}>🙏</span>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#4ECDC4', marginTop: 8 }}>
                {t('result.reviewSuccess')}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <StarRating value={rating} onChange={setRating} />
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={t('result.reviewPlaceholder')}
                rows={3}
                style={{
                  width: '100%', padding: '12px 16px',
                  border: '1.5px solid #e8f4f3', borderRadius: 14,
                  fontSize: 14, color: '#2d3748',
                  background: '#f8fdfc', resize: 'none',
                  fontFamily: "'Nunito', sans-serif",
                  transition: 'all 0.2s',
                }}
              />
              <button onClick={submitReview} disabled={reviewLoading || !comment.trim()}
                style={{
                  padding: '13px', background: comment.trim() ? '#4ECDC4' : '#e8f4f3',
                  color: comment.trim() ? 'white' : '#a0aec0',
                  border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700,
                  cursor: comment.trim() ? 'pointer' : 'not-allowed',
                  fontFamily: "'Nunito', sans-serif",
                }}>
                {reviewLoading ? '...' : t('result.reviewBtn')}
              </button>
            </div>
          )}

          {/* Existing reviews */}
          {reviews.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#718096', marginBottom: 12 }}>
                {t('result_reviews_title')}
              </p>
              {reviews.map((r, i) => (
                <div key={i} style={{ padding: '12px 0', borderTop: '1px solid #f0fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#4ECDC4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700 }}>
                      {r.user_name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#2d3748' }}>{r.user_name}</span>
                    <span style={{ fontSize: 12 }}>{'⭐'.repeat(r.rating)}</span>
                  </div>
                  {r.comment && <p style={{ fontSize: 13, color: '#718096', margin: '0 0 0 36px', lineHeight: 1.5 }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 80 }} />
      </div>
      <BottomNav />
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', background: '#f0fafb', fontFamily: "'Nunito','SF Pro Display',-apple-system,sans-serif", maxWidth: 430, margin: '0 auto' },
  header: { padding: '48px 20px 28px' },
  back: { fontSize: 14, color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontWeight: 700 },
  headerContent: { display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' },
  headerTag: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' },
  headerTitle: { fontSize: 26, fontWeight: 900, color: 'white', margin: '0 0 6px', fontFamily: "'Poppins',sans-serif" },
  content: { padding: '16px' },
  card: { background: 'white', borderRadius: 20, padding: '18px', marginBottom: 14, border: '1px solid #e8f4f3', boxShadow: '0 2px 12px rgba(78,205,196,0.06)' },
  cardTitle: { fontSize: 16, fontWeight: 800, color: '#2d3748', margin: '0 0 14px', fontFamily: "'Poppins',sans-serif" },
  tipItem: { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px', borderRadius: 12, marginBottom: 4, transition: 'all 0.15s', cursor: 'default' },
  tipNum: { width: 28, height: 28, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white', flexShrink: 0 },
  primBtn: { flex: 1, padding: '14px', color: 'white', borderRadius: 14, textDecoration: 'none', fontSize: 13, fontWeight: 800, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  secBtn: { flex: 1, padding: '14px', background: 'white', color: '#718096', borderRadius: 14, textDecoration: 'none', fontSize: 13, fontWeight: 700, textAlign: 'center', border: '1.5px solid #e8f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
}