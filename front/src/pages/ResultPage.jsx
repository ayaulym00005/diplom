import { useEffect, useState } from 'react'
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { analysisAPI } from '../services/api'
import { SKIN_TYPES } from '../utils/skinData'
import PageLayout from '../components/layout/PageLayout'
import { useLang } from '../context/LangContext'
import { FadeUp, SectionTag, Skeleton } from '../components/ui'

function ConfidenceRing({ value, color }) {
  const r = 36, circ = 2 * Math.PI * r, offset = circ - (value / 100) * circ
  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="absolute inset-0">
        <circle cx="48" cy="48" r={r} stroke="#EDE0CC" strokeWidth="6" fill="none" />
        <motion.circle cx="48" cy="48" r={r} stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
      </svg>
      <div className="text-center">
        <p className="font-display text-xl text-bark-600 leading-none">{value}%</p>
        <p className="text-2xs font-body text-bark-300 tracking-wide" style={{ fontSize: '9px' }}></p>
      </div>
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

  useEffect(() => {
    if (!result && id) {
      analysisAPI.get(id).then(setResult).catch(() => navigate('/analyze')).finally(() => setLoading(false))
    }
  }, [id])

  if (loading) return (
    <PageLayout><div className="max-w-2xl mx-auto space-y-5">
      <Skeleton className="h-48 rounded-3xl" /><Skeleton className="h-32 rounded-3xl" /><Skeleton className="h-48 rounded-3xl" />
    </div></PageLayout>
  )

  const skinKey = result?.skin_type || 'normal'
  const skin = SKIN_TYPES[skinKey] || SKIN_TYPES.normal
  const skinTrans = t(`skinTypes.${skinKey}`)
  const label = skinTrans?.label || skin.label
  const description = skinTrans?.description || skin.description
  const traits = skinTrans?.traits || skin.traits
  const tips = skinTrans?.tips || skin.tips
  const confidence = result?.confidence || 87
  const date = result?.created_at
    ? new Date(result.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <FadeUp>
          <div className="mb-8">
            <SectionTag>{t('result.tag')}</SectionTag>
            <h1 className="font-display text-4xl md:text-5xl text-bark-600 leading-tight">{t('result.title')}</h1>
            <p className="font-body text-sm text-bark-300 mt-1">{date}</p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="rounded-3xl p-7 md:p-10 mb-5 border" style={{ background: skin.bg, borderColor: `${skin.color}30` }}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <p className="text-2xs font-body font-medium tracking-widest uppercase mb-2" style={{ color: skin.accent }}>
                  {t('result.detected')}
                </p>
                <h2 className="font-display text-4xl md:text-5xl text-bark-600 mb-3 leading-tight">{label}</h2>
                <p className="font-body text-sm text-bark-400 leading-relaxed max-w-sm">{description}</p>
              </div>
              <ConfidenceRing value={confidence} color={skin.color} />
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {(traits || []).map((trait, i) => (
                <span key={i} className="text-2xs font-body px-3 py-1.5 rounded-full border"
                  style={{ borderColor: `${skin.color}30`, color: skin.accent, background: `${skin.color}10` }}>
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="card p-7 md:p-8 mb-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: skin.color }} />
              <h3 className="font-display text-2xl text-bark-600">{t('result.careTitle')}</h3>
            </div>
            <ol className="space-y-4">
              {(tips || []).map((tip, i) => (
                <motion.li key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }} className="flex items-start gap-4">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-2xs font-body font-medium shrink-0 mt-0.5"
                    style={{ background: `${skin.color}20`, color: skin.accent }}>{i + 1}</span>
                  <p className="font-body text-sm text-bark-400 leading-relaxed">{tip}</p>
                </motion.li>
              ))}
            </ol>
          </div>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="card p-7 md:p-8 mb-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-5 rounded-full" style={{ background: skin.color }} />
              <h3 className="font-display text-2xl text-bark-600">{t('result.ingredientsTitle')}</h3>
            </div>
            <p className="font-body text-sm text-bark-300 mb-4 leading-relaxed">{t('result.ingredientsDesc')}</p>
            <div className="flex flex-wrap gap-2">
              {(skin.ingredients || []).map((ing, i) => (
                <motion.span key={ing} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-2xs font-body font-medium tracking-wide border"
                  style={{ borderColor: `${skin.color}40`, color: skin.color, background: `${skin.color}10` }}>
                  {ing}
                </motion.span>
              ))}
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.4}>
          <div className="rounded-3xl bg-cream-100 border border-cream-200 p-6 mb-8">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-cream-200 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="#A8927F" strokeWidth="1.2" />
                  <path d="M8 5v4M8 11v.5" stroke="#A8927F" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="font-body text-sm font-medium text-bark-500 mb-1">{t('result.lifestyleTitle')}</p>
                <p className="font-body text-xs text-bark-300 leading-relaxed">{t('result.lifestyleDesc')}</p>
              </div>
            </div>
          </div>
        </FadeUp>

        <FadeUp delay={0.5}>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/analyze" className="btn-primary flex-1 justify-center">{t('result.analyseAgain')}</Link>
            <Link to="/history" className="btn-secondary flex-1 justify-center">{t('result.viewHistory')}</Link>
          </div>
        </FadeUp>
      </div>
    </PageLayout>
  )
}
