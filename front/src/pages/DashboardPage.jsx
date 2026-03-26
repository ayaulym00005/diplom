import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { analysisAPI } from '../services/api'
import { SKIN_TYPES } from '../utils/skinData'
import PageLayout from '../components/layout/PageLayout'
import { FadeUp, SectionTag, Skeleton, EmptyState } from '../components/ui'

function StatCard({ label, value, sub, color, delay }) {
  return (
    <FadeUp delay={delay}>
      <div className="card p-6 hover:shadow-hover transition-all duration-300">
        <p className="text-2xs font-body font-medium tracking-widest uppercase text-bark-300 mb-3">{label}</p>
        <p className="font-display text-3xl text-bark-600 mb-1" style={{ color }}>{value}</p>
        {sub && <p className="font-body text-xs text-bark-300">{sub}</p>}
      </div>
    </FadeUp>
  )
}

function HistoryRow({ item, delay, confidenceLabel, skinTypesTrans }) {
  const skin = SKIN_TYPES[item.skin_type] || SKIN_TYPES.normal
  const label = skinTypesTrans?.[item.skin_type]?.label || skin.label
  const date = new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Link to={`/result/${item.id}`} state={{ result: item }}
        className="flex items-center justify-between px-5 py-4 hover:bg-cream-50 transition-colors rounded-2xl group">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-base shrink-0"
            style={{ background: skin.bg, color: skin.color }}>{skin.emoji}</div>
          <div>
            <p className="font-body text-sm font-medium text-bark-500">{label}</p>
            <p className="font-body text-xs text-bark-300">{date}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-bark-300">{item.confidence}%</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            className="text-bark-200 group-hover:text-blush-400 group-hover:translate-x-0.5 transition-all">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Link>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { t } = useLang()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analysisAPI.history().then(setHistory).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const latest = history[0]
  const latestSkin = latest ? (SKIN_TYPES[latest.skin_type] || SKIN_TYPES.normal) : null
  const skinTypesTrans = t('skinTypes')
  const latestLabel = latest ? (skinTypesTrans?.[latest.skin_type]?.label?.split(' ')[0] || latestSkin?.label?.split(' ')[0]) : '—'
  const firstName = user?.name?.split(' ')[0] || 'there'

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t('dashboard.greetingMorning') : hour < 18 ? t('dashboard.greetingAfternoon') : t('dashboard.greetingEvening')

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        <FadeUp>
          <div className="mb-10">
            <p className="font-body text-sm text-bark-300 mb-1">{greeting},</p>
            <h1 className="font-display text-4xl md:text-5xl text-bark-600">
              {firstName}<span className="text-blush-400 italic">.</span>
            </h1>
          </div>
        </FadeUp>

        {!loading && history.length === 0 && (
          <FadeUp delay={0.1}>
            <div className="card p-8 md:p-12 mb-8 text-center border-2 border-dashed border-cream-300">
              <div className="w-16 h-16 rounded-full bg-blush-100 flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <circle cx="14" cy="12" r="6" stroke="#C47D62" strokeWidth="1.5" />
                  <path d="M4 26c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#C47D62" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <SectionTag>{t('dashboard.noAnalysis')}</SectionTag>
              <h2 className="font-display text-3xl text-bark-600 mb-3">{t('dashboard.noAnalysisTitle')}</h2>
              <p className="font-body text-sm text-bark-300 mb-6 max-w-xs mx-auto leading-relaxed">{t('dashboard.noAnalysisDesc')}</p>
              <Link to="/analyze" className="btn-primary px-8">{t('dashboard.noAnalysisBtn')}</Link>
            </div>
          </FadeUp>
        )}

        {!loading && history.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard label={t('dashboard.totalAnalyses')} value={history.length} sub={t('dashboard.totalSub')} delay={0.1} />
            <StatCard label={t('dashboard.skinType')} value={latestLabel} sub={t('dashboard.skinTypeSub')} color={latestSkin?.color} delay={0.15} />
            <StatCard label={t('dashboard.confidence')} value={`${latest?.confidence || 0}%`} sub={t('dashboard.confidenceSub')} color="#6E9465" delay={0.2} />
          </div>
        )}

        {!loading && latest && (
          <FadeUp delay={0.25}>
            <Link to={`/result/${latest.id}`} state={{ result: latest }} className="block mb-8 group">
              <div className="rounded-3xl p-7 border transition-all duration-300 group-hover:shadow-hover group-hover:-translate-y-0.5"
                style={{ background: latestSkin.bg, borderColor: `${latestSkin.color}30` }}>
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-2xs font-body font-medium tracking-widest uppercase mb-2" style={{ color: latestSkin.accent }}>
                      {t('dashboard.latestTag')}
                    </p>
                    <h2 className="font-display text-3xl md:text-4xl text-bark-600 mb-1">
                      {skinTypesTrans?.[latest.skin_type]?.label || latestSkin.label}
                    </h2>
                    <p className="font-body text-sm text-bark-400">
                      {new Date(latest.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                      style={{ background: `${latestSkin.color}20`, color: latestSkin.color }}>{latestSkin.emoji}</div>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                      className="group-hover:translate-x-1 transition-transform" style={{ color: latestSkin.accent }}>
                      <path d="M4 10h12M12 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </FadeUp>
        )}

        <FadeUp delay={0.3}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Link to="/analyze" className="card p-6 flex items-center gap-4 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-2xl bg-blush-100 flex items-center justify-center shrink-0 group-hover:bg-blush-200 transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="8" r="5" stroke="#C47D62" strokeWidth="1.3" />
                  <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="#C47D62" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-medium text-bark-500">{t('dashboard.newAnalysis')}</p>
                <p className="font-body text-xs text-bark-300">{t('dashboard.newAnalysisSub')}</p>
              </div>
            </Link>
            <Link to="/onboarding" className="card p-6 flex items-center gap-4 hover:shadow-hover hover:-translate-y-0.5 transition-all duration-300 group">
              <div className="w-10 h-10 rounded-2xl bg-cream-100 flex items-center justify-center shrink-0 group-hover:bg-cream-200 transition-colors">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12M4 6h12M4 14h8" stroke="#A8927F" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-medium text-bark-500">{t('dashboard.updateProfile')}</p>
                <p className="font-body text-xs text-bark-300">{t('dashboard.updateProfileSub')}</p>
              </div>
            </Link>
          </div>
        </FadeUp>

        {(loading || history.length > 0) && (
          <FadeUp delay={0.35}>
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-5 border-b border-cream-100">
                <h3 className="font-display text-xl text-bark-600">{t('dashboard.recentTitle')}</h3>
                <Link to="/history" className="text-2xs font-body text-blush-400 hover:text-blush-500 tracking-widest uppercase">
                  {t('dashboard.seeAll')}
                </Link>
              </div>
              <div className="p-3">
                {loading ? (
                  <div className="space-y-2 p-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
                ) : (
                  history.slice(0, 4).map((item, i) => (
                    <HistoryRow key={item.id} item={item} delay={0.4 + i * 0.06}
                      confidenceLabel={t('history.confidence')} skinTypesTrans={skinTypesTrans} />
                  ))
                )}
              </div>
            </div>
          </FadeUp>
        )}
      </div>
    </PageLayout>
  )
}
