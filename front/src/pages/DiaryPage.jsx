import { useState, useEffect } from 'react'
import BottomNav from '../components/layout/BottomNav'
import { useLang } from '../context/LangContext'
import LangSwitcher from '../components/ui/LangSwitcher'
import { diaryAPI } from '../services/api'

const MOOD_KEYS = ['great', 'good', 'ok', 'bad']
const MOOD_COLORS = { great: '#4ECDC4', good: '#98D8C8', ok: '#FFB347', bad: '#FF6B6B' }
const MOOD_EMOJIS = { great: '😄', good: '🙂', ok: '😐', bad: '😔' }

const SKIN_KEYS = ['oily', 'dry', 'normal', 'sensitive']
const SKIN_COLORS = { oily: '#5DADE2', dry: '#FFB347', normal: '#4ECDC4', sensitive: '#FF6B6B' }
const SKIN_EMOJIS = { oily: '💧', dry: '🌿', normal: '✨', sensitive: '🌸' }

export default function DiaryPage() {
  const { t } = useLang()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [mood, setMood] = useState('good')
  const [skinFeel, setSkinFeel] = useState('normal')
  const [water, setWater] = useState('1_2l')
  const [sleep, setSleep] = useState('7_9')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const data = await diaryAPI.list()
      setEntries(data || [])
    } catch (e) {
      console.error('Diary load error:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (saving) return
    setError('')
    setSaving(true)
    try {
      await diaryAPI.create({ mood, skin_feel: skinFeel, water, sleep, note: note || null })
      setShowForm(false)
      setNote('')
      setMood('good')
      setSkinFeel('normal')
      await load()
    } catch (e) {
      setError(e.message || t('common.error'))
    } finally {
      setSaving(false)
    }
  }

  const deleteEntry = async (id) => {
    try {
      await diaryAPI.remove(id)
      setEntries(prev => prev.filter(e => e.id !== id))
    } catch (e) {}
  }

  const streak = (() => {
    if (!entries.length) return 0
    const dates = [...new Set(entries.map(e => e.created_at.split('T')[0]))].sort().reverse()
    let count = 0
    for (let i = 0; i < dates.length; i++) {
      const expected = new Date(Date.now() - i * 86400000).toISOString().split('T')[0]
      if (dates[i] === expected) count++
      else break
    }
    return count
  })()

  const moods = t('diary.moods') || {}
  const skinFeels = t('diary.skinFeels') || {}
  const waterLabels = t('diary.water') || {}
  const sleepLabels = t('diary.sleep') || {}

  return (
    <div style={s.root}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideDown { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        textarea:focus { outline: none; border-color: #FFB347 !important; box-shadow: 0 0 0 3px rgba(255,179,71,0.15); }
        textarea::placeholder { color: #b0bec5; }
        select:focus { outline: none; border-color: #4ECDC4 !important; }
        .mood-btn:hover { opacity: 0.85; }
        .del-btn:hover { color: #FF6B6B !important; }
      `}</style>

      <div style={s.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={s.title}>{t('diary.title')}</h1>
            <p style={s.desc}>{t('diary.desc')}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            {streak > 0 && (
              <div style={s.streakBadge}>🔥 {streak} {t('diary.streak')}</div>
            )}
            <LangSwitcher />
          </div>
        </div>
      </div>

      <div style={s.content}>
        <button
          onClick={() => { setShowForm(!showForm); setError('') }}
          style={{ ...s.addBtn, background: showForm ? '#a0aec0' : '#FFB347' }}
        >
          {showForm ? t('diary.closeBtn') : t('diary.addBtn')}
        </button>

        {showForm && (
          <div style={{ ...s.card, border: '2px solid #FFB347', animation: 'slideDown 0.3s ease', marginBottom: 14 }}>
            <p style={s.cardTitle}>{t('diary.formTitle')}</p>

            <p style={s.label}>{t('diary.moodLabel')}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {MOOD_KEYS.map(k => (
                <button key={k} className="mood-btn"
                  onClick={() => setMood(k)}
                  style={{
                    flex: 1, padding: '10px 4px',
                    borderRadius: 12, border: '2px solid',
                    borderColor: mood === k ? MOOD_COLORS[k] : '#e8f4f3',
                    background: mood === k ? MOOD_COLORS[k] + '20' : 'white',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  <div style={{ fontSize: 22 }}>{MOOD_EMOJIS[k]}</div>
                  <div style={{ fontSize: 10, color: mood === k ? MOOD_COLORS[k] : '#a0aec0', fontWeight: 700, marginTop: 3 }}>
                    {moods[k] || k}
                  </div>
                </button>
              ))}
            </div>

            <p style={s.label}>{t('diary.skinFeelLabel')}</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
              {SKIN_KEYS.map(k => (
                <button key={k}
                  onClick={() => setSkinFeel(k)}
                  style={{
                    padding: '8px 14px', borderRadius: 10,
                    border: '1.5px solid',
                    borderColor: skinFeel === k ? SKIN_COLORS[k] : '#e8f4f3',
                    background: skinFeel === k ? SKIN_COLORS[k] + '15' : 'white',
                    fontSize: 12, fontWeight: 700,
                    color: skinFeel === k ? SKIN_COLORS[k] : '#718096',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                  {SKIN_EMOJIS[k]} {skinFeels[k] || k}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div>
                <p style={s.label}>{t('diary.waterLabel')}</p>
                <select value={water} onChange={e => setWater(e.target.value)} style={s.select}>
                  <option value="less_1l">{waterLabels.less_1l}</option>
                  <option value="1_2l">{waterLabels['1_2l']}</option>
                  <option value="more_2l">{waterLabels.more_2l}</option>
                </select>
              </div>
              <div>
                <p style={s.label}>{t('diary.sleepLabel')}</p>
                <select value={sleep} onChange={e => setSleep(e.target.value)} style={s.select}>
                  <option value="less_6">{sleepLabels.less_6}</option>
                  <option value="6_8">{sleepLabels['6_8']}</option>
                  <option value="more_8">{sleepLabels.more_8}</option>
                </select>
              </div>
            </div>

            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={t('diary.notePlaceholder')}
              rows={2}
              style={s.textarea}
            />

            {error && (
              <p style={{ fontSize: 12, color: '#e53e3e', margin: '0 0 10px', fontWeight: 600 }}>
                ⚠️ {error}
              </p>
            )}

            <button onClick={save} disabled={saving} style={{
              width: '100%', padding: '15px',
              background: saving ? '#a0aec0' : '#FFB347',
              color: 'white', border: 'none',
              borderRadius: 14, fontSize: 15, fontWeight: 800,
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}>
              {saving ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  {t('diary.saving')}
                </>
              ) : t('diary.saveBtn')}
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e8f4f3', borderTop: '3px solid #FFB347', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : entries.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: 48 }}>📔</span>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#2d3748', margin: '12px 0 6px' }}>
              {t('diary.emptyTitle')}
            </p>
            <p style={{ fontSize: 13, color: '#a0aec0', margin: 0 }}>
              {t('diary.emptyDesc')}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {entries.map(entry => {
              const mColor = MOOD_COLORS[entry.mood] || MOOD_COLORS.good
              const mEmoji = MOOD_EMOJIS[entry.mood] || '🙂'
              const mLabel = moods[entry.mood] || entry.mood
              const sfColor = SKIN_COLORS[entry.skin_feel] || SKIN_COLORS.normal
              const sfEmoji = SKIN_EMOJIS[entry.skin_feel] || '✨'
              const sfLabel = skinFeels[entry.skin_feel] || entry.skin_feel
              const date = new Date(entry.created_at)
              return (
                <div key={entry.id} style={s.entryCard}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', background: mColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                        {mEmoji}
                      </div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#2d3748', margin: '0 0 2px' }}>{mLabel}</p>
                        <p style={{ fontSize: 11, color: '#a0aec0', margin: 0 }}>
                          {date.toLocaleDateString(undefined, { day: 'numeric', month: 'long' })} · {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <button className="del-btn"
                      onClick={() => deleteEntry(entry.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#e2e8f0', padding: 4, transition: 'color 0.2s' }}>
                      🗑️
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: entry.note ? 10 : 0 }}>
                    <span style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: sfColor + '15', color: sfColor, border: '1px solid ' + sfColor + '30' }}>
                      {sfEmoji} {sfLabel}
                    </span>
                    {entry.water && (
                      <span style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: '#e8f8f7', color: '#4ECDC4', border: '1px solid #c8ede8' }}>
                        💧 {waterLabels[entry.water] || entry.water}
                      </span>
                    )}
                    {entry.sleep && (
                      <span style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: '#f5f3ff', color: '#B8A9E3', border: '1px solid #d8d0f0' }}>
                        😴 {sleepLabels[entry.sleep] || entry.sleep}
                      </span>
                    )}
                  </div>

                  {entry.note && (
                    <p style={{ fontSize: 13, color: '#718096', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{entry.note}"
                    </p>
                  )}
                </div>
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
  root: { minHeight: '100vh', background: '#f0fafb', maxWidth: 430, margin: '0 auto' },
  header: { background: 'linear-gradient(135deg,#FFB347,#FF8C00)', padding: '48px 20px 24px' },
  title: { fontSize: 24, fontWeight: 800, color: 'white', margin: '0 0 4px' },
  desc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: 600 },
  streakBadge: { background: 'rgba(255,255,255,0.25)', color: 'white', padding: '7px 12px', borderRadius: 12, fontSize: 13, fontWeight: 800, border: '1px solid rgba(255,255,255,0.3)' },
  content: { padding: '16px' },
  addBtn: { width: '100%', padding: '15px', color: 'white', border: 'none', borderRadius: 16, fontSize: 15, fontWeight: 800, cursor: 'pointer', marginBottom: 14, boxShadow: '0 4px 14px rgba(255,179,71,0.25)', transition: 'all 0.2s' },
  card: { background: 'white', borderRadius: 20, padding: '18px', border: '1px solid #e8f4f3', boxShadow: '0 2px 12px rgba(78,205,196,0.06)' },
  cardTitle: { fontSize: 16, fontWeight: 800, color: '#2d3748', margin: '0 0 16px' },
  label: { fontSize: 13, fontWeight: 700, color: '#4a5568', margin: '0 0 8px' },
  select: { width: '100%', padding: '10px 12px', border: '1.5px solid #e8f4f3', borderRadius: 10, fontSize: 13, color: '#2d3748', background: '#f8fdfc', cursor: 'pointer' },
  textarea: { width: '100%', padding: '10px 14px', border: '1.5px solid #e8f4f3', borderRadius: 12, fontSize: 13, color: '#2d3748', background: '#f8fdfc', resize: 'none', marginBottom: 10, transition: 'all 0.2s' },
  empty: { background: 'white', borderRadius: 20, padding: '40px 24px', textAlign: 'center', border: '1px solid #e8f4f3' },
  entryCard: { background: 'white', borderRadius: 18, padding: '16px', border: '1px solid #e8f4f3', boxShadow: '0 2px 10px rgba(255,179,71,0.06)' },
}
