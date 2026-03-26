import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { analysisAPI } from '../services/api'
import { SKIN_TYPES } from '../utils/skinData'
import PageLayout from '../components/layout/PageLayout'
import { useLang } from '../context/LangContext'
import { FadeUp, SectionTag, Skeleton, EmptyState } from '../components/ui'

function HistoryCard({ item, index, skinTypesTrans, confidenceLabel }) {
  const skin = SKIN_TYPES[item.skin_type] || SKIN_TYPES.normal
  const label = skinTypesTrans?.[item.skin_type]?.label || skin.label
  const date = new Date(item.created_at)
  const dateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  const timeStr = date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
      <Link to={`/result/${item.id}`} state={{ result: item }}
        className="block card hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${skin.color}80, ${skin.color}20)` }} />
        <div className="p-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0"
              style={{ background: skin.bg, color: skin.color }}>{skin.emoji}</div>
            <div>
              <p className="font-display text-lg text-bark-600 leading-tight">{label}</p>
              <p className="font-body text-xs text-bark-300 mt-0.5">{dateStr} · {timeStr}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="text-right hidden sm:block">
              <p className="font-mono text-sm text-bark-400">{item.confidence}%</p>
              <p className="text-2xs font-body text-bark-200 tracking-wide">{confidenceLabel}</p>
            </div>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
              className="text-bark-200 group-hover:text-blush-400 group-hover:translate-x-0.5 transition-all duration-200">
              <path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function groupByMonth(items) {
  const groups = {}
  items.forEach((item) => {
    const key = new Date(item.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
    if (!groups[key]) groups[key] = []
    groups[key].push(item)
  })
  return groups
}

export default function HistoryPage() {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    analysisAPI.history().then(setHistory).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const grouped = groupByMonth(history)
  const skinTypesTrans = t('skinTypes')

  const mostCommon = (() => {
    const counts = {}
    history.forEach(h => { counts[h.skin_type] = (counts[h.skin_type] || 0) + 1 })
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    if (!top) return '—'
    const label = skinTypesTrans?.[top[0]]?.label || SKIN_TYPES[top[0]]?.label || '—'
    return label.split(' ')[0]
  })()

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <FadeUp>
          <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <SectionTag>{t('history.tag')}</SectionTag>
              <h1 className="font-display text-4xl md:text-5xl text-bark-600 leading-tight">{t('history.title')}</h1>
            </div>
            {!loading && history.length > 0 && (
              <Link to="/analyze" className="btn-primary text-xs tracking-widest uppercase shrink-0">{t('history.newAnalysis')}</Link>
            )}
          </div>
        </FadeUp>

        {!loading && history.length > 0 && (
          <FadeUp delay={0.1}>
            <div className="flex gap-6 mb-10 px-2">
              {[
                [t('history.totalAnalyses'), history.length],
                [t('history.mostCommon'), mostCommon],
                [t('history.avgConfidence'), `${Math.round(history.reduce((s, h) => s + h.confidence, 0) / history.length)}%`],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="font-display text-2xl text-bark-600">{val}</p>
                  <p className="text-2xs font-body text-bark-300 tracking-wide">{label}</p>
                </div>
              ))}
            </div>
          </FadeUp>
        )}

        {loading ? (
          <div className="space-y-4">{[1,2,3].map((i) => <Skeleton key={i} className="h-24 rounded-3xl" />)}</div>
        ) : history.length === 0 ? (
          <EmptyState icon="◈" title={t('history.empty.title')} description={t('history.empty.desc')}
            action={<Link to="/analyze" className="btn-primary">{t('history.empty.btn')}</Link>} />
        ) : (
          <div className="space-y-10">
            {Object.entries(grouped).map(([month, items], gi) => (
              <div key={month}>
                <p className="text-2xs font-body font-medium tracking-widest uppercase text-bark-300 mb-4 px-1">{month}</p>
                <div className="space-y-3">
                  {items.map((item, i) => (
                    <HistoryCard key={item.id} item={item} index={gi * 3 + i}
                      skinTypesTrans={skinTypesTrans} confidenceLabel={t('history.confidence')} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
