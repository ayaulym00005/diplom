import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { profileAPI } from '../services/api'
import { LIFESTYLE_QUESTIONS } from '../utils/skinData'
import { FadeUp, StepIndicator, Spinner, SectionTag } from '../components/ui'

const SECTION_MAP = {
  0: ['Hydration', 'Sleep'],
  1: ['Diet', 'Stress', 'Activity', 'Sun & Environment'],
  2: ['Skincare'],
}

function SelectOption({ label, selected, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-body transition-all duration-200
        ${selected ? 'border-blush-400 bg-blush-100 text-bark-600 shadow-glow' : 'border-cream-300 bg-white text-bark-400 hover:border-blush-300 hover:bg-cream-50'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${selected ? 'border-blush-400 bg-blush-400' : 'border-cream-300'}`}>
          {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
        {label}
      </div>
    </button>
  )
}

function ScaleInput({ labels, value, onChange }) {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {[1,2,3,4,5].map((n) => (
          <button key={n} type="button" onClick={() => onChange(String(n))}
            className={`flex-1 aspect-square rounded-xl border text-sm font-display font-medium transition-all duration-200
              ${value === String(n) ? 'border-blush-400 bg-blush-400 text-white shadow-glow' : 'border-cream-300 bg-white text-bark-400 hover:border-blush-300'}`}>
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-2xs font-body text-bark-300">{labels[0]}</span>
        <span className="text-2xs font-body text-bark-300">{labels[4]}</span>
      </div>
    </div>
  )
}

function MultiSelect({ options, value = [], onChange }) {
  const toggle = (v) => {
    if (v === 'none') return onChange(['none'])
    const next = value.includes(v)
      ? value.filter((x) => x !== v)
      : [...value.filter((x) => x !== 'none'), v]
    onChange(next.length ? next : [])
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {options.map((opt) => {
        const selected = value.includes(opt.value)
        return (
          <button key={opt.value} type="button" onClick={() => toggle(opt.value)}
            className={`text-left px-4 py-3 rounded-xl border text-sm font-body transition-all duration-200
              ${selected ? 'border-blush-400 bg-blush-100 text-bark-600 shadow-glow' : 'border-cream-300 bg-white text-bark-400 hover:border-blush-300 hover:bg-cream-50'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${selected ? 'border-blush-400 bg-blush-400' : 'border-cream-300'}`}>
                {selected && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span className="text-xs">{opt.label}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default function OnboardingPage() {
  const { updateUser } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  const steps = t('onboarding.steps')
  const currentSections = SECTION_MAP[step]

  const currentQuestions = LIFESTYLE_QUESTIONS.filter((q) =>
    currentSections.includes(q.section)
  )

  const setAnswer = (id, val) => setAnswers((prev) => ({ ...prev, [id]: val }))

  const isStepValid = () =>
    currentQuestions.every((q) => {
      const a = answers[q.id]
      if (q.type === 'multi') return a && a.length > 0
      return a !== undefined && a !== ''
    })

  const handleNext = () => {
    if (!isStepValid()) { toast.error(t('common.answersRequired')); return }
    if (step < 2) { setStep((s) => s + 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await profileAPI.saveLifestyle(answers)
      updateUser({ onboardingComplete: true })
      toast.success(t('common.saveSuccess'))
      navigate('/analyze')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grain-overlay min-h-screen mesh-bg px-5 py-16">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-full bg-blush-300 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="5" stroke="#5C4A3A" strokeWidth="1.2" />
              <circle cx="8" cy="8" r="2" fill="#C47D62" />
            </svg>
          </div>
          <span className="font-display font-medium text-lg text-bark-600">Derm<span className="text-blush-500 italic">iq</span></span>
        </div>

        <FadeUp>
          <StepIndicator steps={Array.isArray(steps) ? steps : []} current={step} />
        </FadeUp>

        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <div className="card p-7 md:p-10">
              <div className="mb-8">
                <SectionTag>{Array.isArray(steps) ? steps[step] : ''}</SectionTag>
                <h2 className="font-display text-2xl text-bark-600">
                  {t(`onboarding.stepTitles.${step}`) || t('onboarding.stepTitles')[step]}
                </h2>
                <p className="font-body text-sm text-bark-300 mt-1.5">{t('onboarding.stepDesc')}</p>
              </div>

              <div className="space-y-8">
                {currentQuestions.map((q) => {
                  const qTrans = t(`onboarding.questions.${q.id}`)
                  const question = qTrans?.question || q.question
                  return (
                    <div key={q.id}>
                      <p className="font-body text-sm font-medium text-bark-500 mb-3">{question}</p>

                      {q.type === 'select' && (
                        <div className="space-y-2">
                          {q.options.map((opt) => {
                            const label = qTrans?.options?.[opt.value] || opt.label
                            return (
                              <SelectOption key={opt.value} label={label}
                                selected={answers[q.id] === opt.value}
                                onClick={() => setAnswer(q.id, opt.value)} />
                            )
                          })}
                        </div>
                      )}

                      {q.type === 'scale' && (
                        <ScaleInput
                          labels={qTrans?.labels || q.labels}
                          value={answers[q.id]}
                          onChange={(v) => setAnswer(q.id, v)} />
                      )}

                      {q.type === 'multi' && (
                        <MultiSelect
                          options={q.options.map((opt) => ({
                            ...opt,
                            label: qTrans?.options?.[opt.value] || opt.label,
                          }))}
                          value={answers[q.id]}
                          onChange={(v) => setAnswer(q.id, v)} />
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-10">
                {step > 0 && (
                  <button onClick={() => { setStep((s) => s - 1); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                    className="btn-secondary flex-1">{t('onboarding.back')}</button>
                )}
                <button onClick={handleNext} disabled={loading}
                  className="btn-primary flex-1 disabled:opacity-50">
                  {loading ? <Spinner size="sm" /> : step < 2 ? t('onboarding.continue') : t('onboarding.save')}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-2xs font-body text-bark-200 mt-6 tracking-widest uppercase">
          {t('onboarding.stepOf')} {step + 1} {t('onboarding.of')} {Array.isArray(steps) ? steps.length : 3}
        </p>
      </div>
    </div>
  )
}
