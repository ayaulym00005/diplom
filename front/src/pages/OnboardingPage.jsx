import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { profileAPI } from '../services/api'

const STEPS = [
  {
    title: 'Су ішу & Ұйқы',
    emoji: '💧',
    questions: [
      { id:'water_intake', label:'Күніне қанша су ішесіз?', options:[
        {val:'less_1l',label:'1 литрден аз'},
        {val:'1_2l',label:'1-2 литр'},
        {val:'2_3l',label:'2-3 литр'},
        {val:'more_3l',label:'3 литрден көп'},
      ]},
      { id:'sleep_hours', label:'Күніне қанша сағат ұйықтайсыз?', options:[
        {val:'less_5',label:'5 сағаттан аз'},
        {val:'5_7',label:'5-7 сағат'},
        {val:'7_9',label:'7-9 сағат'},
        {val:'more_9',label:'9 сағаттан көп'},
      ]},
    ]
  },
  {
    title: 'Тамақтану & Белсенділік',
    emoji: '🥗',
    questions: [
      { id:'diet', label:'Тамақтану стиліңіз қандай?', options:[
        {val:'processed',label:'Өңделген тамақ'},
        {val:'mixed',label:'Аралас'},
        {val:'balanced',label:'Теңгерімді'},
        {val:'plant_based',label:'Өсімдіктен'},
      ]},
      { id:'exercise', label:'Қаншалықты жиі жаттығасыз?', options:[
        {val:'rarely',label:'Сирек'},
        {val:'1_2pw',label:'Аптасына 1-2 рет'},
        {val:'3_5pw',label:'Аптасына 3-5 рет'},
        {val:'daily',label:'Күнделікті'},
      ]},
      { id:'stress_level', label:'Стресс деңгейіңіз (1-5)?', type:'scale' },
    ]
  },
  {
    title: 'Тері күтімі',
    emoji: '🧴',
    questions: [
      { id:'current_routine', label:'Қазіргі тері күтіміңіз?', options:[
        {val:'none',label:'Жоқ'},
        {val:'basic',label:'Базалық (жуу ғана)'},
        {val:'moderate',label:'Орташа'},
        {val:'advanced',label:'Кешенді'},
      ]},
      { id:'spf_use', label:'SPF қолданасыз ба?', options:[
        {val:'never',label:'Ешқашан'},
        {val:'sometimes',label:'Кейде'},
        {val:'often',label:'Жиі'},
        {val:'always',label:'Әрдайым'},
      ]},
      { id:'sun_exposure', label:'Күнде қанша уақыт күн астында боласыз?', options:[
        {val:'minimal',label:'Аз (30 мин-нан аз)'},
        {val:'30_60min',label:'30-60 минут'},
        {val:'1_3h',label:'1-3 сағат'},
        {val:'more_3h',label:'3 сағаттан көп'},
      ]},
    ]
  }
]

export default function OnboardingPage() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)

  const currentStep = STEPS[step]

  const setAnswer = (id, val) => setAnswers(prev => ({...prev, [id]: val}))

  const isValid = () => currentStep.questions.every(q => {
    if (q.type === 'scale') return answers[q.id]
    return answers[q.id]
  })

  const handleNext = () => {
    if (!isValid()) { toast.error('Барлық сұрақтарға жауап беріңіз'); return }
    if (step < STEPS.length-1) { setStep(s=>s+1); window.scrollTo({top:0,behavior:'smooth'}) }
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await profileAPI.saveLifestyle(answers)
      updateUser({onboarding_complete:true})
      toast.success('Профиль сақталды! 🎉')
      navigate('/analyze')
    } catch(err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.root}>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}
        .opt-btn:hover{border-color:#4ECDC4!important;background:#f0fafb!important}
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.logoRow}>
          <span style={{fontSize:22}}>🧴</span>
          <span style={s.logoText}>Dermiq</span>
        </div>
        <p style={s.headerSub}>Профильді толтырыңыз</p>

        {/* Progress */}
        <div style={s.progress}>
          {STEPS.map((_,i)=>(
            <div key={i} style={{...s.progressDot,background:i<=step?'white':'rgba(255,255,255,0.4)',width:i===step?28:10}}/>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{...s.card,animation:'slideIn 0.3s ease forwards'}}>
        <div style={s.stepHeader}>
          <div style={s.stepEmoji}>{currentStep.emoji}</div>
          <div>
            <p style={s.stepNum}>Қадам {step+1}/{STEPS.length}</p>
            <h2 style={s.stepTitle}>{currentStep.title}</h2>
          </div>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:20}}>
          {currentStep.questions.map(q=>(
            <div key={q.id}>
              <p style={s.qLabel}>{q.label}</p>
              {q.type==='scale' ? (
                <div style={s.scaleRow}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} type="button"
                      onClick={()=>setAnswer(q.id,String(n))}
                      style={{...s.scaleBtn,...(answers[q.id]===String(n)?s.scaleBtnActive:{})}}>
                      {n}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={s.optGrid}>
                  {q.options.map(opt=>(
                    <button key={opt.val} type="button" className="opt-btn"
                      onClick={()=>setAnswer(q.id,opt.val)}
                      style={{...s.optBtn,...(answers[q.id]===opt.val?s.optBtnActive:{})}}>
                      {answers[q.id]===opt.val && <span style={s.optCheck}>✓</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={s.btnRow}>
          {step>0 && (
            <button onClick={()=>setStep(s=>s-1)} style={s.secBtn}>← Артқа</button>
          )}
          <button onClick={handleNext} disabled={loading} style={s.primBtn}>
            {loading ? <span style={s.spinner}/> : step<STEPS.length-1 ? 'Келесі →' : 'Сақтау 🎉'}
          </button>
        </div>
      </div>
    </div>
  )
}

const s = {
  root:{minHeight:'100vh',background:'#f0fafb',fontFamily:"'Nunito','SF Pro Display',-apple-system,sans-serif",maxWidth:430,margin:'0 auto'},
  header:{background:'linear-gradient(135deg,#4ECDC4,#44b8b0)',padding:'48px 20px 28px'},
  logoRow:{display:'flex',alignItems:'center',gap:8,marginBottom:8},
  logoText:{fontSize:22,fontWeight:800,color:'white'},
  headerSub:{fontSize:14,color:'rgba(255,255,255,0.85)',margin:'0 0 16px',fontWeight:600},
  progress:{display:'flex',gap:6,alignItems:'center'},
  progressDot:{height:10,borderRadius:5,transition:'all 0.3s'},
  card:{background:'white',borderRadius:28,padding:'24px 20px',margin:'16px',boxShadow:'0 8px 30px rgba(78,205,196,0.1)',border:'1px solid #e8f4f3'},
  stepHeader:{display:'flex',alignItems:'center',gap:14,marginBottom:24,paddingBottom:20,borderBottom:'1px solid #f0fafb'},
  stepEmoji:{width:52,height:52,borderRadius:16,background:'#f0fafb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,flexShrink:0},
  stepNum:{fontSize:11,color:'#4ECDC4',fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase',margin:'0 0 2px'},
  stepTitle:{fontSize:20,fontWeight:800,color:'#2d3748',margin:0},
  qLabel:{fontSize:14,fontWeight:700,color:'#4a5568',margin:'0 0 10px'},
  optGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8},
  optBtn:{padding:'12px 10px',border:'1.5px solid #e8f4f3',borderRadius:14,fontSize:13,fontWeight:600,cursor:'pointer',textAlign:'left',background:'white',color:'#4a5568',transition:'all 0.2s',position:'relative'},
  optBtnActive:{borderColor:'#4ECDC4',background:'#f0fafb',color:'#2d3748'},
  optCheck:{position:'absolute',top:8,right:10,color:'#4ECDC4',fontWeight:800,fontSize:14},
  scaleRow:{display:'flex',gap:8},
  scaleBtn:{flex:1,aspectRatio:'1',borderRadius:14,border:'1.5px solid #e8f4f3',fontSize:16,fontWeight:800,cursor:'pointer',background:'white',color:'#718096',transition:'all 0.2s'},
  scaleBtnActive:{background:'#4ECDC4',borderColor:'#4ECDC4',color:'white'},
  btnRow:{display:'flex',gap:12,marginTop:24},
  primBtn:{flex:1,padding:'16px',background:'#4ECDC4',color:'white',border:'none',borderRadius:16,fontSize:15,fontWeight:800,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6,transition:'all 0.2s'},
  secBtn:{padding:'16px 20px',background:'white',color:'#718096',border:'1.5px solid #e8f4f3',borderRadius:16,fontSize:14,fontWeight:700,cursor:'pointer'},
  spinner:{width:20,height:20,border:'2px solid rgba(255,255,255,0.4)',borderTop:'2px solid white',borderRadius:'50%',animation:'spin 0.8s linear infinite',display:'inline-block'},
}