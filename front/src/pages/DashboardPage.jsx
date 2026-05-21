import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { analysisAPI } from '../services/api'
import http from '../services/api'
import BottomNav from '../components/layout/BottomNav'
import LangSwitcher from '../components/ui/LangSwitcher'

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

const MOOD_VALS = ['great', 'good', 'ok', 'bad']
const MOOD_EMOJIS = ['😄', '🙂', '😐', '😔']

function MiniChart({ data, noData }) {
  if (!data || data.length === 0) return (
    <div style={{ textAlign:'center', padding:'20px 0', color:'#a0aec0', fontSize:13 }}>
      {noData || 'Деректер жоқ'}
    </div>
  )
  const max = 100
  const barW = Math.floor(280 / Math.max(data.length, 1)) - 4
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:4, height:80, padding:'0 4px' }}>
      {data.slice(-14).map((d, i) => {
        const sk = SKIN_INFO[d.skin_type] || SKIN_INFO.normal
        const h = Math.max(8, (d.confidence / max) * 72)
        return (
          <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:1, gap:3 }}>
            <div style={{
              width:'100%', height:h,
              background:sk.color, borderRadius:'4px 4px 0 0',
              opacity:0.85, transition:'height 0.5s',
              minWidth:8,
            }} title={`${d.date}: ${d.skin_type} ${d.confidence}%`} />
            {data.length <= 7 && (
              <span style={{ fontSize:9, color:'#a0aec0', whiteSpace:'nowrap' }}>{d.date}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [stats, setStats] = useState(null)
  const [showDiary, setShowDiary] = useState(false)
  const [mood, setMood] = useState('good')
  const [skinFeel, setSkinFeel] = useState('')
  const [diaryNote, setDiaryNote] = useState('')
  const [diarySaved, setDiarySaved] = useState(false)
  const [diaryLoading, setDiaryLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      analysisAPI.history(),
      http.get('/progress/chart?days=14'),
      http.get('/progress/stats'),
    ]).then(([hist, chart, st]) => {
      setHistory(hist || [])
      setChartData(chart || [])
      setStats(st)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const latest = history[0]
  const latestSkin = latest ? (SKIN_INFO[latest.skin_type] || SKIN_INFO.normal) : null
  const firstName = user?.name?.split(' ')[0] || ''
  const hour = new Date().getHours()
  const greetings = t('dashboard.greeting') || {}
  const greeting = hour < 12 ? greetings.morning : hour < 18 ? greetings.afternoon : greetings.evening
  const moodLabels = t('dashboard.moodOptions') || ['Керемет', 'Жақсы', 'Қалыпты', 'Нашар']
  const moodOptions = MOOD_VALS.map((val, i) => ({ val, emoji: MOOD_EMOJIS[i], label: moodLabels[i] }))

  const saveDiary = async () => {
    if (!mood) return
    setDiaryLoading(true)
    try {
      await http.post('/diary/', { mood, skin_feel: skinFeel, note: diaryNote })
      setDiarySaved(true)
      setShowDiary(false)
      setDiaryNote('')
    } catch(e) {}
    finally { setDiaryLoading(false) }
  }

  return (
    <div style={s.root}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .hist-row:hover { background: #f8fdfc !important; }
        .quick-btn:hover { transform: translateY(-2px); }
        textarea:focus { outline: none; border-color: #4ECDC4 !important; }
        textarea::placeholder { color: #b0bec5; }
        @media (max-width: 360px) {
          .dash-header-row { flex-wrap: wrap !important; gap: 10px !important; }
          .dash-lang { align-self: flex-start !important; }
        }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div className="dash-header-row" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <p style={s.greeting}>{greeting} 👋</p>
            <h1 style={s.name}>{firstName}</h1>
          </div>
          <div className="dash-lang" style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
            <div style={s.avatar}>{user?.name?.[0]?.toUpperCase() || 'A'}</div>
            <LangSwitcher />
          </div>
        </div>
        {stats && stats.streak > 1 && (
          <div style={s.streakBadge}>
            🔥 {stats.streak} {t('dashboard.streakBadge')}
          </div>
        )}
      </div>

      <div style={s.content}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}>
            <div style={s.spinner} />
          </div>
        ) : (
          <>
            {/* Stats */}
            {history.length > 0 && (
              <div style={s.statsRow}>
                {[
                  { emoji:'📊', val:history.length, label: t('dashboard.totalAnalyses') || 'Анализ' },
                  { emoji: latestSkin?.emoji||'✨', val: (t('skinTypes.' + (latest?.skin_type||'normal')) || {label:'—'}).label?.split(' ')[0] || '—', label: t('dashboard.skinType') || 'Тері типі', color: latestSkin?.color },
                  { emoji:'🎯', val:`${latest?.confidence||0}%`, label: t('dashboard.confidence') || 'Сенімділік', color:'#4ECDC4' },
                ].map((st,i) => (
                  <div key={i} style={s.statCard}>
                    <span style={{ fontSize:24 }}>{st.emoji}</span>
                    <p style={{ ...s.statVal, color:st.color||'#2d3748' }}>{st.val}</p>
                    <p style={s.statLabel}>{st.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Improvement badge */}
            {stats?.improvement !== null && stats?.improvement !== undefined && (
              <div style={{
                ...s.card,
                background: stats.improvement >= 0
                  ? 'linear-gradient(135deg,#4ECDC4,#44b8b0)'
                  : 'linear-gradient(135deg,#FFB347,#FF8C00)',
                marginBottom:14,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <span style={{ fontSize:32 }}>{stats.improvement >= 0 ? '📈' : '📉'}</span>
                  <div>
                    <p style={{ fontSize:12, color:'rgba(255,255,255,0.85)', margin:'0 0 3px', fontWeight:700 }}>
                      {t('dashboard.progressLabel')}
                    </p>
                    <p style={{ fontSize:18, fontWeight:900, color:'white', margin:0 }}>
                      {stats.improvement >= 0 ? '+' : ''}{stats.improvement}% {t('dashboard.progressImproved')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Latest result */}
            {latest && (
              <Link to={`/result/${latest.id}`} state={{ result:latest }} style={{ textDecoration:'none' }}>
                <div style={{
                  ...s.card,
                  background:`linear-gradient(135deg,${latestSkin.color}20,${latestSkin.color}08)`,
                  borderColor:`${latestSkin.color}30`,
                  borderWidth:1.5,
                  marginBottom:14,
                }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <p style={{ fontSize:11, fontWeight:700, color:latestSkin.color, letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 4px' }}>
                        {t('dashboard.latestTag') || 'СОҢҒЫ АНАЛИЗ'}
                      </p>
                      <h2 style={{ fontSize:22, fontWeight:900, color:'#2d3748', margin:'0 0 4px', fontFamily:"'Poppins',sans-serif" }}>
                        {(t('skinTypes.' + latest.skin_type) || {label:latest.skin_type}).label}
                      </h2>
                      <p style={{ fontSize:12, color:'#a0aec0', margin:0 }}>
                        {new Date(latest.created_at).toLocaleDateString('kk-KZ', { day:'numeric', month:'long' })}
                      </p>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:40 }}>{latestSkin.emoji}</div>
                      <p style={{ fontSize:20, fontWeight:900, color:latestSkin.color, margin:0 }}>{latest.confidence}%</p>
                    </div>
                  </div>
                </div>
              </Link>
            )}

            {/* Progress chart */}
            {chartData.length > 0 && (
              <div style={{ ...s.card, marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <h3 style={s.cardTitle}>{t('dashboard.chartTitle')}</h3>
                  <span style={{ fontSize:11, color:'#a0aec0' }}>{t('dashboard.confidencePercent')}</span>
                </div>
                <MiniChart data={chartData} noData={t('dashboard.noData')} />
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
                  {Object.entries(SKIN_INFO).map(([k,v]) => (
                    chartData.some(d => d.skin_type === k) && (
                      <span key={k} style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:'#718096' }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:v.color, display:'inline-block' }}/>
                        {(t('skinTypes.' + k) || {label:k}).label}
                      </span>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Quick actions */}
            <div style={s.quickRow}>
              <Link to="/analyze" className="quick-btn" style={{ ...s.quickBtn, background:'#4ECDC4' }}>
                <span style={{ fontSize:24 }}>🔬</span>
                <span style={s.quickLabel}>{t('dashboard.newAnalysis') || 'Жаңа анализ'}</span>
              </Link>
              <button
                className="quick-btn"
                onClick={() => setShowDiary(!showDiary)}
                style={{ ...s.quickBtn, background: diarySaved ? '#98D8C8' : '#FFB347', border:'none', cursor:'pointer' }}
              >
                <span style={{ fontSize:24 }}>{diarySaved ? '✅' : '📔'}</span>
                <span style={s.quickLabel}>{t('dashboard.diaryBtn')}</span>
              </button>
              <Link to="/history" className="quick-btn" style={{ ...s.quickBtn, background:'#B8A9E3' }}>
                <span style={{ fontSize:24 }}>📋</span>
                <span style={s.quickLabel}>{t('dashboard.history') || 'Тарих'}</span>
              </Link>
            </div>

            {/* Diary form */}
            {showDiary && (
              <div style={{ ...s.card, marginBottom:14, border:'2px solid #FFB347' }}>
                <h3 style={{ ...s.cardTitle, marginBottom:14 }}>{t('dashboard.diaryTitle')}</h3>
                <p style={s.qLabel}>{t('dashboard.moodLabel')}</p>
                <div style={{ display:'flex', gap:8, marginBottom:14 }}>
                  {moodOptions.map(m => (
                    <button key={m.val} onClick={() => setMood(m.val)}
                      style={{
                        flex:1, padding:'10px 4px',
                        borderRadius:12, border:'2px solid',
                        borderColor: mood===m.val ? '#FFB347' : '#e8f4f3',
                        background: mood===m.val ? '#fff8f0' : 'white',
                        cursor:'pointer', transition:'all 0.2s',
                        fontFamily:"'Nunito',sans-serif",
                      }}>
                      <div style={{ fontSize:22 }}>{m.emoji}</div>
                      <div style={{ fontSize:10, color:'#718096', fontWeight:600, marginTop:3 }}>{m.label}</div>
                    </button>
                  ))}
                </div>
                <p style={s.qLabel}>{t('dashboard.skinFeelLabel')}</p>
                <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
                  {(t('dashboard.skinFeelOptions') || ['Майлы','Құрғақ','Қалыпты','Сезімтал']).map((feel,i) => {
                    const vals = ['oily','dry','normal','sensitive']
                    return (
                      <button key={i} onClick={() => setSkinFeel(vals[i])}
                        style={{
                          padding:'8px 14px', borderRadius:10,
                          border:'1.5px solid', cursor:'pointer',
                          borderColor: skinFeel===vals[i] ? '#4ECDC4' : '#e8f4f3',
                          background: skinFeel===vals[i] ? '#f0fafb' : 'white',
                          fontSize:12, fontWeight:600, color:'#4a5568',
                          fontFamily:"'Nunito',sans-serif",
                        }}>
                        {feel}
                      </button>
                    )
                  })}
                </div>
                <textarea
                  value={diaryNote}
                  onChange={e => setDiaryNote(e.target.value)}
                  placeholder={t('dashboard.notePlaceholder')}
                  rows={2}
                  style={{
                    width:'100%', padding:'10px 14px',
                    border:'1.5px solid #e8f4f3', borderRadius:12,
                    fontSize:13, color:'#2d3748',
                    background:'#f8fdfc', resize:'none',
                    fontFamily:"'Nunito',sans-serif",
                    marginBottom:10,
                  }}
                />
                <button onClick={saveDiary} disabled={diaryLoading}
                  style={{
                    width:'100%', padding:'14px',
                    background:'#FFB347', color:'white',
                    border:'none', borderRadius:12,
                    fontSize:14, fontWeight:700, cursor:'pointer',
                    fontFamily:"'Nunito',sans-serif",
                  }}>
                  {diaryLoading ? '...' : t('dashboard.saveBtn')}
                </button>
              </div>
            )}

            {/* Skin distribution */}
            {stats?.skin_distribution && Object.keys(stats.skin_distribution).length > 0 && (
              <div style={{ ...s.card, marginBottom:14 }}>
                <h3 style={{ ...s.cardTitle, marginBottom:12 }}>{t('dashboard.distributionTitle')}</h3>
                {Object.entries(stats.skin_distribution)
                  .sort((a,b) => b[1]-a[1])
                  .map(([type, count]) => {
                    const sk = SKIN_INFO[type] || SKIN_INFO.normal
                    const pct = Math.round((count / stats.total) * 100)
                    return (
                      <div key={type} style={{ marginBottom:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                          <span style={{ fontSize:13, fontWeight:600, color:'#4a5568' }}>
                            {sk.emoji} {(t('skinTypes.'+type)||{label:type}).label}
                          </span>
                          <span style={{ fontSize:12, fontWeight:700, color:sk.color }}>{pct}%</span>
                        </div>
                        <div style={{ height:6, background:'#f0fafb', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${pct}%`, background:sk.color, borderRadius:3, transition:'width 0.8s' }}/>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            )}

            {/* Empty state */}
            {history.length === 0 && (
              <div style={s.emptyCard}>
                <span style={{ fontSize:64 }}>🔬</span>
                <h2 style={s.emptyTitle}>{t('dashboard.empty') || 'Анализ жоқ'}</h2>
                <p style={s.emptyDesc}>{t('dashboard.emptyDesc') || 'Фото жүктеп анализ жасаңыз'}</p>
                <Link to="/analyze" style={s.emptyBtn}>{t('dashboard.emptyBtn') || 'Анализ бастау →'}</Link>
              </div>
            )}

            {/* Recent history */}
            {history.length > 0 && (
              <div style={s.histCard}>
                <div style={s.histHeader}>
                  <h3 style={s.histTitle}>{t('dashboard.recentTitle') || 'Соңғы анализдер'}</h3>
                  <Link to="/history" style={s.seeAll}>{t('dashboard.seeAll') || 'Барлығы →'}</Link>
                </div>
                {history.slice(0, 5).map((item) => {
                  const sk = SKIN_INFO[item.skin_type] || SKIN_INFO.normal
                  return (
                    <Link key={item.id} to={`/result/${item.id}`} state={{ result:item }}
                      className="hist-row" style={s.histRow}>
                      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                        <div style={{ ...s.histEmoji, background:sk.bg }}>{sk.emoji}</div>
                        <div>
                          <p style={{ fontSize:14, fontWeight:700, color:'#2d3748', margin:'0 0 2px' }}>
                            {(t('skinTypes.'+item.skin_type)||{label:item.skin_type}).label}
                          </p>
                          <p style={{ fontSize:12, color:'#a0aec0', margin:0 }}>
                            {new Date(item.created_at).toLocaleDateString('kk-KZ')}
                          </p>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{ fontSize:13, fontWeight:700, color:sk.color }}>{item.confidence}%</span>
                        <span style={{ color:'#cbd5e0', fontSize:18 }}>›</span>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </>
        )}
        <div style={{ height:80 }} />
      </div>
      <BottomNav />
    </div>
  )
}

const s = {
  root: { minHeight:'100vh', background:'#f0fafb', fontFamily:"'Nunito','SF Pro Display',-apple-system,sans-serif", maxWidth:430, margin:'0 auto' },
  header: { background:'linear-gradient(135deg,#4ECDC4,#44b8b0)', padding:'48px 20px 24px' },
  greeting: { fontSize:14, color:'rgba(255,255,255,0.85)', margin:'0 0 2px', fontWeight:600 },
  name: { fontSize:26, fontWeight:900, color:'white', margin:0, fontFamily:"'Poppins',sans-serif" },
  avatar: { width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:800, color:'white', border:'2px solid rgba(255,255,255,0.4)' },
  streakBadge: { background:'rgba(255,255,255,0.2)', borderRadius:12, padding:'8px 14px', fontSize:13, color:'white', fontWeight:700, border:'1px solid rgba(255,255,255,0.3)' },
  content: { padding:'16px' },
  spinner: { width:36, height:36, border:'3px solid #e8f4f3', borderTop:'3px solid #4ECDC4', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  statsRow: { display:'flex', gap:10, marginBottom:14 },
  statCard: { flex:1, background:'white', borderRadius:18, padding:'14px 10px', textAlign:'center', boxShadow:'0 2px 12px rgba(78,205,196,0.08)', border:'1px solid #e8f4f3' },
  statVal: { fontSize:17, fontWeight:900, margin:'6px 0 2px', fontFamily:"'Poppins',sans-serif" },
  statLabel: { fontSize:10, color:'#a0aec0', margin:0, fontWeight:600 },
  card: { background:'white', borderRadius:20, padding:'18px', border:'1px solid #e8f4f3', boxShadow:'0 2px 12px rgba(78,205,196,0.06)' },
  cardTitle: { fontSize:16, fontWeight:800, color:'#2d3748', margin:'0 0 8px', fontFamily:"'Poppins',sans-serif" },
  quickRow: { display:'flex', gap:10, marginBottom:14 },
  quickBtn: { flex:1, borderRadius:18, padding:'14px 6px', display:'flex', flexDirection:'column', alignItems:'center', gap:5, textDecoration:'none', boxShadow:'0 4px 14px rgba(0,0,0,0.08)', transition:'all 0.2s' },
  quickLabel: { fontSize:11, fontWeight:700, color:'white' },
  qLabel: { fontSize:13, fontWeight:700, color:'#4a5568', margin:'0 0 8px' },
  emptyCard: { background:'white', borderRadius:24, padding:'48px 24px', textAlign:'center', border:'1px solid #e8f4f3' },
  emptyTitle: { fontSize:20, fontWeight:800, color:'#2d3748', margin:'12px 0 8px', fontFamily:"'Poppins',sans-serif" },
  emptyDesc: { fontSize:13, color:'#718096', margin:'0 0 20px' },
  emptyBtn: { display:'inline-flex', padding:'13px 26px', background:'#4ECDC4', color:'white', borderRadius:14, textDecoration:'none', fontSize:14, fontWeight:700 },
  histCard: { background:'white', borderRadius:20, border:'1px solid #e8f4f3', overflow:'hidden', boxShadow:'0 2px 12px rgba(78,205,196,0.06)' },
  histHeader: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 18px', borderBottom:'1px solid #f0fafb' },
  histTitle: { fontSize:15, fontWeight:800, color:'#2d3748', margin:0, fontFamily:"'Poppins',sans-serif" },
  seeAll: { fontSize:12, color:'#4ECDC4', textDecoration:'none', fontWeight:700 },
  histRow: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 18px', borderBottom:'1px solid #f8fdfc', textDecoration:'none', transition:'all 0.15s' },
  histEmoji: { width:38, height:38, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 },
}