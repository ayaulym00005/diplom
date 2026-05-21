import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { analysisAPI } from '../services/api'
import BottomNav from '../components/layout/BottomNav'
import PageHeader from '../components/layout/PageHeader'
import { useLang } from '../context/LangContext'

const STAGES_KK = ['Сурет жүктелуде...','Тері анықталуда...','AI талдауда...','Нәтиже дайын!']

export default function AnalyzePage() {
  const navigate = useNavigate()
  const { t } = useLang()
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [stage, setStage] = useState(0)
  const [mode, setMode] = useState('upload')
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState('user')
  const [flashEffect, setFlashEffect] = useState(false)

  // Камера cleanup
  useEffect(() => {
    return () => { stopStream() }
  }, [])

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraReady(false)
  }

  const startCamera = async (facing) => {
    stopStream()
    setCameraError('')
    setCameraReady(false)
    const useFacing = facing || facingMode

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Камера қолжетімсіз. Телефоннан ашу үшін https:// арқылы кіріңіз.')
      return
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: useFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraReady(true)
          }).catch(err => {
            setCameraError('Видео ойнату қатесі: ' + err.message)
          })
        }
      }
    } catch (err) {
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError') {
        setCameraError('Камераға рұқсат берілмеді. Браузер параметрлерінен рұқсат беріңіз.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('Камера табылмады.')
      } else if (err.name === 'NotReadableError') {
        setCameraError('Камера басқа қолданба пайдаланып жатыр.')
      } else {
        setCameraError('Камера қатесі: ' + err.message)
      }
    }
  }

  const switchCamera = async () => {
    const newFacing = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacing)
    await startCamera(newFacing)
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady) return
    setFlashEffect(true)
    setTimeout(() => setFlashEffect(false), 300)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480

    const ctx = canvas.getContext('2d')
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob(blob => {
      if (!blob) { toast.error('Фото түсіру сәтсіз'); return }
      const f = new File([blob], 'camera.jpg', { type: 'image/jpeg' })
      setFile(f)
      setPreview(URL.createObjectURL(blob))
      stopStream()
      setMode('upload')
    }, 'image/jpeg', 0.92)
  }

  const openCamera = () => {
    setMode('camera')
    setPreview(null)
    setFile(null)
    startCamera()
  }

  const closeCamera = () => {
    stopStream()
    setMode('upload')
    setCameraError('')
  }

  const onDrop = useCallback((accepted, rejected) => {
    if (rejected.length > 0) { toast.error('Сурет форматы дұрыс емес'); return }
    const f = accepted[0]
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg':[], 'image/png':[], 'image/webp':[] },
    maxSize: 10*1024*1024, multiple: false,
  })

  const handleAnalyze = async () => {
    if (!file) return
    setAnalyzing(true); setStage(0)
    let st = 0
    const iv = setInterval(() => { st++; if (st < stages.length) setStage(st); else clearInterval(iv) }, 900)
    try {
      const fd = new FormData(); fd.append('image', file)
      const result = await analysisAPI.analyze(fd)
      clearInterval(iv)
      navigate(`/result/${result.id}`, { state: { result } })
    } catch (err) {
      clearInterval(iv)
      toast.error('Анализ сәтсіз болды')
      setAnalyzing(false); setStage(0)
    }
  }

  const reset = () => {
    setPreview(null); setFile(null)
    setAnalyzing(false); setStage(0)
    closeCamera()
  }

  const stages = t('analyze.stages') || STAGES_KK
  const tips = t('analyze.tipsList') || []

  return (
    <div style={s.root}>
      <style>{`
        * { box-sizing:border-box; }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes flash { 0%{opacity:1} 100%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .drop:hover { border-color:#4ECDC4!important; background:#f0fafb!important; }
      `}</style>

      <PageHeader title={t('analyze.title')||'Тері анализі 🔬'} desc={t('analyze.desc')||'Бетіңіздің суретін жүктеңіз'} />

      <div style={s.content}>
        {analyzing ? (
          <div style={s.analyzeCard}>
            <div style={s.circle}>
              <div style={s.circleInner}><span style={{fontSize:40}}>🔬</span></div>
              <svg style={s.spinRing} viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="54" stroke="#e8f4f3" strokeWidth="5" fill="none"/>
                <circle cx="60" cy="60" r="54" stroke="#4ECDC4" strokeWidth="5" fill="none" strokeDasharray="80 259" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 style={s.stageText}>{stages[Math.min(stage, stages.length-1)]}</h2>
            <div style={s.barWrap}><div style={{...s.barFill, width:`${((stage+1)/stages.length)*100}%`}}/></div>
            <div style={s.dots}>{stages.map((_,i) => <div key={i} style={{...s.dot, background:i<=stage?'#4ECDC4':'#e8f4f3', width:i===stage?24:8}}/>)}</div>
          </div>
        ) : preview ? (
          <div style={s.card}>
            <div style={{position:'relative', borderRadius:16, overflow:'hidden'}}>
              <img src={preview} alt="" style={{width:'100%', maxHeight:300, objectFit:'cover', display:'block'}}/>
              <div style={{position:'absolute', top:10, right:10, background:'rgba(78,205,196,0.9)', color:'white', padding:'5px 12px', borderRadius:20, fontSize:12, fontWeight:700}}>{t('analyze.ready')}</div>
            </div>
            <div style={{display:'flex', gap:10, marginTop:14}}>
              <button onClick={reset} style={s.secBtn}>{t('analyze.changeBtn')}</button>
              <button onClick={handleAnalyze} style={s.primBtn}>{t('analyze.analyzeBtn')}</button>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div style={s.tabs}>
              <button onClick={() => { closeCamera(); setMode('upload') }}
                style={{...s.tab, ...(mode==='upload'?s.tabActive:{})}}>
                {t('analyze.uploadTab')}
              </button>
              <button onClick={openCamera}
                style={{...s.tab, ...(mode==='camera'?s.tabActive:{})}}>
                {t('analyze.cameraTab')}
              </button>
            </div>

            {mode === 'upload' ? (
              <div {...getRootProps()} className="drop" style={{...s.dropZone, ...(isDragActive?s.dropActive:{})}}>
                <input {...getInputProps()}/>
                <div style={s.dropContent}>
                  <div style={{fontSize:56, animation:'float 3s ease-in-out infinite'}}>📸</div>
                  <p style={s.dropTitle}>{isDragActive ? t('analyze.dragActive') : t('analyze.drop')}</p>
                  <p style={s.dropSub}>{t('analyze.dropSub')}</p>
                  <p style={s.dropFormats}>{t('analyze.formats')}</p>
                </div>
              </div>
            ) : (
              <div style={s.cameraBox}>
                {/* Flash effect */}
                {flashEffect && <div style={{position:'absolute', inset:0, background:'white', animation:'flash 0.3s ease', zIndex:10, borderRadius:16, pointerEvents:'none'}}/>}

                {/* Video */}
                <video
                  ref={videoRef}
                  style={{
                    width:'100%', height:280, objectFit:'cover',
                    borderRadius:'16px 16px 0 0', display:'block',
                    background:'#1a1a1a',
                    transform: facingMode==='user' ? 'scaleX(-1)' : 'none',
                  }}
                  autoPlay playsInline muted
                />

                {/* Loading overlay */}
                {!cameraReady && !cameraError && (
                  <div style={{position:'absolute', top:0, left:0, right:0, height:280, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.7)', borderRadius:'16px 16px 0 0'}}>
                    <div style={{width:32, height:32, border:'3px solid rgba(255,255,255,0.3)', borderTop:'3px solid #4ECDC4', borderRadius:'50%', animation:'spin 0.8s linear infinite'}}/>
                    <p style={{color:'white', fontSize:13, fontWeight:600, marginTop:12}}>{t('analyze.cameraLoading')}</p>
                  </div>
                )}

                {/* Error overlay */}
                {cameraError && (
                  <div style={{position:'absolute', top:0, left:0, right:0, height:280, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.85)', borderRadius:'16px 16px 0 0', padding:20}}>
                    <span style={{fontSize:40}}>📷</span>
                    <p style={{color:'white', fontSize:13, fontWeight:600, textAlign:'center', marginTop:12, lineHeight:1.5}}>{cameraError}</p>
                    <button onClick={() => startCamera()} style={{marginTop:14, padding:'10px 20px', background:'#4ECDC4', color:'white', border:'none', borderRadius:10, fontSize:13, fontWeight:700, cursor:'pointer'}}>
                      {t('analyze.cameraRetry')}
                    </button>
                  </div>
                )}

                {/* Face guide */}
                {cameraReady && (
                  <div style={{position:'absolute', top:0, left:0, right:0, height:280, display:'flex', alignItems:'center', justifyContent:'center', pointerEvents:'none'}}>
                    <div style={{width:150, height:190, border:'2px dashed rgba(78,205,196,0.8)', borderRadius:'50%', animation:'pulse 2s ease-in-out infinite'}}/>
                  </div>
                )}

                {/* Controls */}
                <div style={{background:'#1a1a2e', padding:'14px 20px', borderRadius:'0 0 16px 16px', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <button onClick={switchCamera} style={{width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:20, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}} title="Камера ауыстыру">
                    🔄
                  </button>
                  <button
                    onClick={capturePhoto}
                    disabled={!cameraReady}
                    style={{width:68, height:68, borderRadius:'50%', background:'white', border:'4px solid rgba(255,255,255,0.4)', cursor:cameraReady?'pointer':'not-allowed', display:'flex', alignItems:'center', justifyContent:'center', opacity:cameraReady?1:0.5}}>
                    <div style={{width:52, height:52, borderRadius:'50%', background:cameraReady?'linear-gradient(135deg,#4ECDC4,#44b8b0)':'#a0aec0'}}/>
                  </button>
                  <button onClick={closeCamera} style={{width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)', color:'white', fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                    ✕
                  </button>
                </div>
                <canvas ref={canvasRef} style={{display:'none'}}/>
              </div>
            )}

            {/* Tips */}
            {mode === 'upload' && (
              <div style={s.tipsCard}>
                <p style={s.tipsTitle}>{t('analyze.tips')}</p>
                {tips.map((tip,i) => (
                  <div key={i} style={{display:'flex', alignItems:'center', gap:10, marginBottom:8}}>
                    <div style={{width:8, height:8, borderRadius:'50%', background:'#4ECDC4', flexShrink:0}}/>
                    <p style={{fontSize:13, color:'#718096', margin:0}}>{tip}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div style={{height:80}}/>
      <BottomNav/>
    </div>
  )
}

const s = {
  root:{ minHeight:'100vh', background:'#f0fafb', fontFamily:"'Nunito','SF Pro Display',-apple-system,sans-serif", maxWidth:430, margin:'0 auto' },
  content:{ padding:'16px' },
  analyzeCard:{ background:'white', borderRadius:24, padding:'40px 24px', textAlign:'center', boxShadow:'0 4px 20px rgba(78,205,196,0.1)', border:'1px solid #e8f4f3' },
  circle:{ position:'relative', width:120, height:120, margin:'0 auto 24px' },
  circleInner:{ position:'absolute', inset:12, borderRadius:'50%', background:'linear-gradient(135deg,#4ECDC4,#44b8b0)', display:'flex', alignItems:'center', justifyContent:'center' },
  spinRing:{ position:'absolute', inset:0, width:'100%', height:'100%', animation:'spin 2s linear infinite' },
  stageText:{ fontSize:17, fontWeight:800, color:'#2d3748', marginBottom:20 },
  barWrap:{ height:6, background:'#e8f4f3', borderRadius:3, overflow:'hidden', maxWidth:280, margin:'0 auto 16px' },
  barFill:{ height:'100%', background:'linear-gradient(90deg,#4ECDC4,#44b8b0)', borderRadius:3, transition:'width 0.9s ease' },
  dots:{ display:'flex', gap:6, justifyContent:'center', alignItems:'center' },
  dot:{ height:8, borderRadius:4, transition:'all 0.4s' },
  card:{ background:'white', borderRadius:20, overflow:'hidden', border:'1px solid #e8f4f3', padding:14 },
  tabs:{ display:'flex', gap:8, marginBottom:14 },
  tab:{ flex:1, padding:'12px', borderRadius:14, border:'1.5px solid #e8f4f3', background:'white', color:'#718096', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s', fontFamily:"'Nunito',sans-serif" },
  tabActive:{ background:'#4ECDC4', borderColor:'#4ECDC4', color:'white' },
  dropZone:{ background:'white', borderRadius:20, padding:'40px 24px', border:'2px dashed #c8ede8', cursor:'pointer', transition:'all 0.2s', marginBottom:14 },
  dropActive:{ borderColor:'#4ECDC4', background:'#f0fafb' },
  dropContent:{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', gap:8 },
  dropTitle:{ fontSize:18, fontWeight:800, color:'#2d3748', margin:0 },
  dropSub:{ fontSize:13, color:'#a0aec0', margin:0 },
  dropFormats:{ fontSize:11, color:'#cbd5e0', margin:0 },
  cameraBox:{ background:'#1a1a2e', borderRadius:20, overflow:'hidden', marginBottom:14, position:'relative' },
  primBtn:{ flex:1, padding:'15px', background:'#4ECDC4', color:'white', border:'none', borderRadius:14, fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  secBtn:{ flex:1, padding:'15px', background:'white', color:'#718096', border:'1.5px solid #e8f4f3', borderRadius:14, fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Nunito',sans-serif" },
  tipsCard:{ background:'white', borderRadius:18, padding:'16px', border:'1px solid #e8f4f3' },
  tipsTitle:{ fontSize:13, fontWeight:800, color:'#2d3748', margin:'0 0 10px' },
}