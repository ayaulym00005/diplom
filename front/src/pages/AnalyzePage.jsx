import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { analysisAPI } from '../services/api'
import PageLayout from '../components/layout/PageLayout'
import { useLang } from '../context/LangContext'
import { FadeUp, SectionTag } from '../components/ui'

function AnalysisLoader({ stageIndex, stages, analysing }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center py-16 px-8 text-center">
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 rounded-full bg-blush-100 animate-pulse-soft" />
        <div className="absolute inset-3 rounded-full bg-blush-200 animate-pulse-soft" style={{ animationDelay: '0.3s' }} />
        <div className="absolute inset-6 rounded-full bg-blush-300 flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="4" fill="white" opacity="0.6" />
          </svg>
        </div>
        <svg className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="52" stroke="#E8C1B0" strokeWidth="1.5" fill="none" strokeDasharray="80 246" strokeLinecap="round" />
        </svg>
      </div>
      <p className="font-body text-xs tracking-widest uppercase text-bark-300 mb-3">{analysing}</p>
      <AnimatePresence mode="wait">
        <motion.p key={stageIndex}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
          className="font-display text-xl text-bark-500">
          {stages[Math.min(stageIndex, stages.length - 1)]}
        </motion.p>
      </AnimatePresence>
      <div className="flex gap-2 mt-6">
        {stages.map((_, i) => (
          <div key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= stageIndex ? 'bg-blush-400 w-6' : 'bg-cream-300 w-1.5'}`} />
        ))}
      </div>
    </motion.div>
  )
}

export default function AnalyzePage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [stage, setStage] = useState(0)

  const stages = t('analyze.stages')

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) { toast.error(t('common.noPhoto')); return }
    const f = accepted[0]
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [t])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file) return
    setAnalyzing(true); setStage(0)
    let s = 0
    const interval = setInterval(() => { s++; if (s < stages.length) setStage(s); else clearInterval(interval) }, 900)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const result = await analysisAPI.analyze(formData)
      clearInterval(interval)
      navigate(`/result/${result.id}`, { state: { result } })
    } catch (err) {
      clearInterval(interval)
      toast.error(t('common.analysisFailed'))
      setAnalyzing(false); setStage(0)
    }
  }

  const reset = () => { setPreview(null); setFile(null); setAnalyzing(false); setStage(0) }

  return (
    <PageLayout>
      <div className="max-w-2xl mx-auto">
        <FadeUp>
          <div className="mb-8">
            <SectionTag>{t('analyze.tag')}</SectionTag>
            <h1 className="font-display text-4xl md:text-5xl text-bark-600 leading-tight">{t('analyze.title')}</h1>
            <p className="font-body text-sm text-bark-300 mt-2 leading-relaxed">{t('analyze.desc')}</p>
          </div>
        </FadeUp>

        <FadeUp delay={0.1}>
          <div className="card overflow-hidden">
            {analyzing ? (
              <AnalysisLoader stageIndex={stage} stages={Array.isArray(stages) ? stages : []} analysing={t('analyze.analysing')} />
            ) : (
              <>
                <div {...getRootProps()}
                  className={`relative cursor-pointer transition-all duration-300 ${isDragActive ? 'bg-blush-100' : 'bg-white hover:bg-cream-50'}`}>
                  <input {...getInputProps()} />
                  {preview ? (
                    <div className="relative">
                      <img src={preview} alt="Uploaded face" className="w-full aspect-[4/3] object-cover" />
                      <div className="absolute inset-0 bg-bark-600/0 hover:bg-bark-600/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl">
                          <p className="text-xs font-body text-bark-500">{t('analyze.change').replace('← ', '')}</p>
                        </div>
                      </div>
                      <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blush-400/60 to-transparent scan-line pointer-events-none" />
                      {[['top-3 left-3', 'border-t border-l'], ['top-3 right-3', 'border-t border-r'], ['bottom-3 left-3', 'border-b border-l'], ['bottom-3 right-3', 'border-b border-r']].map(([pos, borders]) => (
                        <div key={pos} className={`absolute ${pos} w-6 h-6 ${borders} border-blush-400 opacity-70`} />
                      ))}
                    </div>
                  ) : (
                    <div className={`flex flex-col items-center justify-center py-20 px-8 text-center border-2 border-dashed m-4 rounded-2xl transition-all duration-300 ${isDragActive ? 'border-blush-400 bg-blush-50' : 'border-cream-300'}`}>
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                        className="w-16 h-16 rounded-full bg-cream-100 flex items-center justify-center mb-5">
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                          <path d="M14 6v10M10 10l4-4 4 4" stroke="#C47D62" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <rect x="4" y="18" width="20" height="6" rx="2" stroke="#E8C1B0" strokeWidth="1.2" />
                        </svg>
                      </motion.div>
                      <p className="font-display text-xl text-bark-500 mb-1">
                        {isDragActive ? t('analyze.dragActive') : t('analyze.dropTitle')}
                      </p>
                      <p className="font-body text-sm text-bark-300 mb-4">{t('analyze.dropSub')}</p>
                      <span className="text-2xs font-body text-bark-200 tracking-widest uppercase">{t('analyze.dropFormats')}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 border-t border-cream-100">
                  {preview ? (
                    <div className="flex gap-3">
                      <button onClick={reset} className="btn-secondary flex-1">{t('analyze.change')}</button>
                      <button onClick={handleAnalyze} className="btn-primary flex-1">{t('analyze.analyseBtn')}</button>
                    </div>
                  ) : (
                    <button onClick={() => document.querySelector('input[type=file]')?.click()} className="btn-primary w-full">
                      {t('analyze.selectBtn')}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </FadeUp>

        {!analyzing && !preview && (
          <FadeUp delay={0.2}>
            <div className="bg-cream-100 rounded-2xl p-5 mt-6">
              <p className="text-2xs font-body font-medium tracking-widest uppercase text-bark-300 mb-3">{t('analyze.tipsTag')}</p>
              <ul className="space-y-2">
                {(t('analyze.tips') || []).map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm font-body text-bark-400">
                    <span className="w-1 h-1 rounded-full bg-blush-400 mt-2 shrink-0" />{tip}
                  </li>
                ))}
              </ul>
            </div>
          </FadeUp>
        )}

        <FadeUp delay={0.3}>
          <p className="text-center text-2xs font-body text-bark-200 mt-6 tracking-wide leading-relaxed whitespace-pre-line">
            {t('analyze.privacy')}
          </p>
        </FadeUp>
      </div>
    </PageLayout>
  )
}
