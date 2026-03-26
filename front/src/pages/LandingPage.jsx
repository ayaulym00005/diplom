import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FadeUp, SectionTag } from '../components/ui'
import PageLayout from '../components/layout/PageLayout'
import { useLang } from '../context/LangContext'

const SKIN_CIRCLES = [
  { key: 'oily',  bg: '#E8EDE6', dot: '#6E9465', x: '15%', y: '20%', delay: 0 },
  { key: 'dry',   bg: '#F9EDE8', dot: '#C47D62', x: '70%', y: '10%', delay: 0.2 },
  { key: 'normal',bg: '#FAF5EE', dot: '#8A7260', x: '80%', y: '65%', delay: 0.4 },
  { key: 'combo', bg: '#E8F0F5', dot: '#4A7A9B', x: '5%',  y: '70%', delay: 0.6 },
]
const CIRCLE_LABELS = { en: ['Oily','Dry','Normal','Combo'], ru: ['Жирная','Сухая','Норм.','Комби'], kk: ['Майлы','Құрғақ','Қалыпты','Аралас'] }

const FEATURE_ICONS = ['◈', '◇', '✦', '⬡']

export default function LandingPage() {
  const { t, lang } = useLang()
  const features = t('landing.features')
  const circleLabels = CIRCLE_LABELS[lang] || CIRCLE_LABELS.en

  return (
    <PageLayout noPadding>
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-5 pt-24 pb-16 overflow-hidden">
        {SKIN_CIRCLES.map((c, i) => (
          <motion.div key={c.key}
            className="absolute hidden lg:flex flex-col items-center gap-1.5 pointer-events-none"
            style={{ left: c.x, top: c.y }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: c.delay + 0.8, duration: 0.6 }}>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4 + c.delay, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-full flex items-center justify-center shadow-card"
              style={{ background: c.bg, border: `1px solid ${c.dot}30` }}>
              <div className="w-5 h-5 rounded-full" style={{ background: c.dot, opacity: 0.5 }} />
            </motion.div>
            <span className="text-2xs font-body text-bark-300 tracking-widest uppercase">{circleLabels[i]}</span>
          </motion.div>
        ))}

        <div className="max-w-2xl text-center relative z-10">
          <FadeUp delay={0.1}><SectionTag>{t('landing.tag')}</SectionTag></FadeUp>
          <FadeUp delay={0.2}>
            <h1 className="font-display text-5xl md:text-7xl text-bark-600 leading-[0.95] tracking-tight mb-6">
              {t('landing.heroTitle1')}{' '}
              <span className="italic text-blush-400">{t('landing.heroTitleItalic')}</span>
            </h1>
          </FadeUp>
          <FadeUp delay={0.3}>
            <p className="font-body text-base md:text-lg text-bark-300 leading-relaxed max-w-md mx-auto mb-10">
              {t('landing.heroDesc')}
            </p>
          </FadeUp>
          <FadeUp delay={0.4}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="btn-primary px-8 py-3.5 text-xs tracking-widest uppercase">
                {t('landing.ctaStart')}
              </Link>
              <Link to="/login" className="btn-secondary px-8 py-3.5 text-xs tracking-widest uppercase">
                {t('landing.ctaSignIn')}
              </Link>
            </div>
          </FadeUp>
          <FadeUp delay={0.5}>
            <p className="mt-6 text-2xs font-body text-bark-300 tracking-wide">{t('landing.trust')}</p>
          </FadeUp>
        </div>

        <FadeUp delay={0.6} className="mt-16 relative max-w-sm w-full mx-auto">
          <div className="card p-4 shadow-hover">
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-cream-200 to-blush-100 flex items-center justify-center relative overflow-hidden">
              <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blush-400 to-transparent scan-line opacity-60" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blush-200 mx-auto mb-3 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <circle cx="14" cy="12" r="6" stroke="#C47D62" strokeWidth="1.5" />
                    <path d="M4 24c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="#C47D62" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="text-2xs font-body text-bark-300 tracking-widest uppercase">{t('landing.scanLabel')}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-2xs font-body text-bark-300 tracking-widest uppercase mb-0.5">{t('landing.resultLabel')}</p>
                <p className="font-display text-lg text-bark-600">Normal Skin</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center">
                <span className="text-sage-400 text-sm">◇</span>
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div className="text-center mb-16">
              <SectionTag>{t('landing.howItWorksTag')}</SectionTag>
              <h2 className="font-display text-4xl md:text-5xl text-bark-600">
                {t('landing.howItWorksTitle1')}{' '}
                <span className="italic text-blush-400">{t('landing.howItWorksItalic')}</span>
              </h2>
            </div>
          </FadeUp>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {Array.isArray(features) && features.map((f, i) => (
              <FadeUp key={i} delay={i * 0.08}>
                <div className="card p-7 hover:shadow-hover transition-all duration-300 hover:-translate-y-0.5 group">
                  <div className="w-10 h-10 rounded-xl bg-cream-100 flex items-center justify-center mb-4 text-blush-400 group-hover:bg-blush-100 transition-colors">
                    <span className="font-display text-lg">{FEATURE_ICONS[i]}</span>
                  </div>
                  <h3 className="font-display text-xl text-bark-600 mb-2">{f.title}</h3>
                  <p className="font-body text-sm text-bark-300 leading-relaxed">{f.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <FadeUp>
            <div className="card p-10 md:p-16">
              <SectionTag>{t('landing.beginTag')}</SectionTag>
              <h2 className="font-display text-4xl md:text-5xl text-bark-600 mb-4">
                {t('landing.ctaCardTitle1')}{' '}
                <span className="italic text-blush-400">{t('landing.ctaCardItalic')}</span>
              </h2>
              <p className="font-body text-sm text-bark-300 mb-8 leading-relaxed">{t('landing.ctaCardDesc')}</p>
              <Link to="/register" className="btn-primary px-10 py-4 text-xs tracking-widest uppercase">
                {t('landing.ctaCardBtn')}
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      <footer className="border-t border-cream-200 py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg text-bark-400">Derm<span className="italic text-blush-400">iq</span></span>
          <p className="text-2xs font-body text-bark-200 tracking-widest uppercase">{t('landing.footer')}</p>
        </div>
      </footer>
    </PageLayout>
  )
}
