import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'
import { useLang } from '../context/LangContext'

const TEXTS = {
  kk: {
    title: 'Парольді қалпына келтіру',
    step1Head: 'Email арқылы қалпына келтіру',
    step1Desc: 'Тіркелген email-іңізді енгізіңіз. Код жіберіледі.',
    emailLabel: 'Email',
    emailPh: 'email@example.com',
    sendBtn: 'Код жіберу →',
    sending: 'Жіберілуде...',
    step2Head: 'Жаңа пароль орнату',
    step2DescEmail: 'Email-ге код жіберілді. Поштаңызды тексеріңіз және кодты енгізіңіз.',
    step2DescDemo: 'Demo режімі: Код автоматты толтырылды. Жаңа парольді енгізіңіз.',
    tokenLabel: 'Код',
    tokenPh: 'Кодты енгізіңіз',
    newPassLabel: 'Жаңа пароль',
    newPassPh: 'Кемінде 8 таңба',
    resetBtn: 'Парольді өзгерту →',
    resetting: 'Өзгертілуде...',
    backBtn: '← Артқа',
    backLogin: 'Кіруге оралу',
    successMsg: 'Пароль сәтті өзгертілді! Кіріңіз.',
    emailSent: 'Код email-ге жіберілді! Поштаңызды тексеріңіз.',
    emailReq: 'Email енгізіңіз',
    tokenReq: 'Кодты енгізіңіз',
    passMin: 'Кемінде 8 таңба болуы керек',
    checkEmail: '📬 Поштаңызды тексеріңіз',
    demoMode: '⚙️ Demo режімі — код автоматты енгізілді',
  },
  ru: {
    title: 'Восстановление пароля',
    step1Head: 'Восстановление через email',
    step1Desc: 'Введите ваш зарегистрированный email.',
    emailLabel: 'Email',
    emailPh: 'email@example.com',
    sendBtn: 'Отправить код →',
    sending: 'Отправляется...',
    step2Head: 'Установить новый пароль',
    step2DescEmail: 'Код отправлен на ваш email. Проверьте почту и введите код.',
    step2DescDemo: 'Demo режим: код заполнен автоматически. Введите новый пароль.',
    tokenLabel: 'Код',
    tokenPh: 'Введите код',
    newPassLabel: 'Новый пароль',
    newPassPh: 'Минимум 8 символов',
    resetBtn: 'Изменить пароль →',
    resetting: 'Изменяется...',
    backBtn: '← Назад',
    backLogin: 'Вернуться к входу',
    successMsg: 'Пароль изменён! Войдите.',
    emailSent: 'Код отправлен! Проверьте почту.',
    emailReq: 'Введите email',
    tokenReq: 'Введите код',
    passMin: 'Минимум 8 символов',
    checkEmail: '📬 Проверьте почту',
    demoMode: '⚙️ Demo режим — код заполнен автоматически',
  },
  en: {
    title: 'Reset Password',
    step1Head: 'Reset via Email',
    step1Desc: 'Enter your registered email address.',
    emailLabel: 'Email Address',
    emailPh: 'you@example.com',
    sendBtn: 'Send Code →',
    sending: 'Sending...',
    step2Head: 'Set New Password',
    step2DescEmail: 'Code sent to your email. Check your inbox and enter the code.',
    step2DescDemo: 'Demo mode: code auto-filled. Enter your new password.',
    tokenLabel: 'Code',
    tokenPh: 'Enter code',
    newPassLabel: 'New Password',
    newPassPh: 'At least 8 characters',
    resetBtn: 'Reset Password →',
    resetting: 'Updating...',
    backBtn: '← Back',
    backLogin: 'Back to Sign In',
    successMsg: 'Password reset! Please sign in.',
    emailSent: 'Code sent! Check your email.',
    emailReq: 'Enter your email',
    tokenReq: 'Enter the code',
    passMin: 'At least 8 characters',
    checkEmail: '📬 Check your email',
    demoMode: '⚙️ Demo mode — code auto-filled',
  },
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { lang } = useLang()
  const T = TEXTS[lang] || TEXTS.kk

  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [newPass, setNewPass] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailWasSent, setEmailWasSent] = useState(false) // нақты email жіберілді ме

  const handleSendCode = async () => {
    if (!email.trim()) { setError(T.emailReq); return }
    setLoading(true); setError('')
    try {
      const res = await authAPI.forgotPassword(email.trim())

      if (res.email_sent) {
        // Нақты email жіберілді
        setEmailWasSent(true)
        toast.success(T.emailSent)
      } else if (res.demo_token) {
        // Demo режімі — token автоматты
        setToken(res.demo_token)
        setEmailWasSent(false)
        toast.success('Demo: код автоматты толтырылды')
      } else {
        // Email жоқ немесе жіберілмеді
        setEmailWasSent(false)
        toast.success(T.emailSent)
      }

      setStep(2)
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  const handleResetPass = async () => {
    if (!token.trim()) { setError(T.tokenReq); return }
    if (newPass.length < 8) { setError(T.passMin); return }
    setLoading(true); setError('')
    try {
      await authAPI.resetPassword(token.trim(), newPass)
      toast.success(T.successMsg)
      navigate('/login')
    } catch (e) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        input:focus { outline:none; border-color:#4ECDC4!important; box-shadow:0 0 0 3px rgba(78,205,196,0.15)!important; }
        input::placeholder { color:#b0bec5; }
        .p-btn:hover { opacity:0.9; transform:translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={s.deco1}/><div style={s.deco2}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:22 }}>🧴</span>
              <span style={{ fontSize:20, fontWeight:800, color:'white' }}>Dermiq</span>
            </div>
            <Link to="/login" style={{ fontSize:13, color:'rgba(255,255,255,0.85)', textDecoration:'none', fontWeight:600 }}>
              {T.backLogin}
            </Link>
          </div>

          <p style={{ fontSize:12, color:'rgba(255,255,255,0.75)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>
            {step === 1 ? '📧 Email Recovery' : '🔐 New Password'}
          </p>
          <h1 style={{ fontSize:24, fontWeight:900, color:'white', marginBottom:20 }}>{T.title}</h1>

          {/* Step indicator */}
          <div style={{ display:'flex', alignItems:'center', gap:0 }}>
            {[1, 2].map((n, i) => (
              <>
                <div key={n} style={{
                  width:32, height:32, borderRadius:'50%',
                  background: step >= n ? 'white' : 'rgba(255,255,255,0.3)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.3s',
                }}>
                  <span style={{ fontSize:13, fontWeight:800, color: step >= n ? '#4ECDC4' : 'rgba(255,255,255,0.6)' }}>{n}</span>
                </div>
                {i === 0 && (
                  <div style={{ width:50, height:2, background: step >= 2 ? 'white' : 'rgba(255,255,255,0.3)', transition:'all 0.3s' }}/>
                )}
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={s.card}>
        {step === 1 ? (
          <>
            <h2 style={s.cardTitle}>{T.step1Head}</h2>
            <p style={s.cardDesc}>{T.step1Desc}</p>

            <label style={s.label}>{T.emailLabel}</label>
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSendCode()}
              placeholder={T.emailPh}
              style={s.input}
              autoFocus
            />

            {error && <p style={s.err}>⚠ {error}</p>}

            <button onClick={handleSendCode} disabled={loading} className="p-btn" style={s.primBtn}>
              {loading ? <><span style={s.spin}/> {T.sending}</> : T.sendBtn}
            </button>

            <Link to="/login" style={s.secLink}>{T.backBtn}</Link>
          </>
        ) : (
          <>
            <h2 style={s.cardTitle}>{T.step2Head}</h2>

            {/* Email жіберілді ме? */}
            {emailWasSent ? (
              <div style={s.successBanner}>
                <p style={{ fontSize:14, fontWeight:800, color:'#2C6E4F', margin:'0 0 4px' }}>{T.checkEmail}</p>
                <p style={{ fontSize:12, color:'#5A7A94', margin:0, lineHeight:1.5 }}>
                  {T.step2DescEmail}
                </p>
                <p style={{ fontSize:11, color:'#a0aec0', marginTop:6, fontStyle:'italic' }}>
                  {lang==='kk' ? `${email} поштаны тексеріңіз` :
                   lang==='ru' ? `Проверьте ${email}` :
                   `Check ${email}`}
                </p>
              </div>
            ) : (
              <div style={s.demoBanner}>
                <p style={{ fontSize:13, fontWeight:700, color:'#8B6914', margin:'0 0 3px' }}>{T.demoMode}</p>
                <p style={{ fontSize:11, color:'#718096', margin:0 }}>
                  {lang==='kk' ? 'MAIL_USERNAME орнатылмаған. Код төменде автоматты толтырылды.' :
                   lang==='ru' ? 'MAIL_USERNAME не настроен. Код заполнен автоматически.' :
                   'MAIL_USERNAME not set. Code auto-filled below.'}
                </p>
              </div>
            )}

            <label style={{ ...s.label, marginTop:14 }}>{T.tokenLabel}</label>
            <input
              type="text"
              value={token}
              onChange={e => { setToken(e.target.value); setError('') }}
              placeholder={T.tokenPh}
              style={s.input}
            />

            <label style={{ ...s.label, marginTop:12 }}>{T.newPassLabel}</label>
            <input
              type="password"
              value={newPass}
              onChange={e => { setNewPass(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleResetPass()}
              placeholder={T.newPassPh}
              style={s.input}
            />
            {newPass && newPass.length < 8 && (
              <p style={{ fontSize:11, color:'#e53e3e', marginTop:3 }}>{T.passMin}</p>
            )}

            {error && <p style={{ ...s.err, marginTop:8 }}>⚠ {error}</p>}

            <button onClick={handleResetPass} disabled={loading} className="p-btn"
              style={{ ...s.primBtn, marginTop:14 }}>
              {loading ? <><span style={s.spin}/> {T.resetting}</> : T.resetBtn}
            </button>

            <button onClick={() => { setStep(1); setError(''); setToken('') }} style={s.secBtn}>
              {T.backBtn}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const s = {
  root: { minHeight:'100vh', background:'#f0fafb', fontFamily:"'Nunito',-apple-system,sans-serif", maxWidth:430, margin:'0 auto', display:'flex', flexDirection:'column' },
  header: { background:'linear-gradient(135deg,#4ECDC4,#44b8b0)', padding:'48px 24px 32px', position:'relative', overflow:'hidden', flexShrink:0 },
  deco1: { position:'absolute', top:-60, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.1)', pointerEvents:'none' },
  deco2: { position:'absolute', bottom:-30, left:-20, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' },
  card: { background:'white', borderRadius:'24px 24px 0 0', flex:1, padding:'28px 24px 40px', marginTop:-20, boxShadow:'0 -8px 30px rgba(78,205,196,0.1)', animation:'fadeUp 0.4s ease both', display:'flex', flexDirection:'column' },
  cardTitle: { fontSize:20, fontWeight:800, color:'#2d3748', marginBottom:6 },
  cardDesc: { fontSize:13, color:'#718096', lineHeight:1.6, marginBottom:18 },
  label: { display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#5A7A94', marginBottom:5 },
  input: { width:'100%', padding:'13px 16px', border:'1.5px solid #e8f4f3', borderRadius:14, fontSize:14, color:'#2d3748', background:'#f8fdfc', fontFamily:"'Nunito',sans-serif", transition:'all 0.2s', marginBottom:4 },
  err: { fontSize:12, color:'#e53e3e', fontWeight:600, marginBottom:4 },
  primBtn: { width:'100%', padding:'15px', background:'#4ECDC4', color:'white', border:'none', borderRadius:14, fontSize:15, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(78,205,196,0.3)', fontFamily:"'Nunito',sans-serif", transition:'all 0.2s' },
  secBtn: { width:'100%', padding:'13px', background:'#f0fafb', color:'#718096', border:'1.5px solid #e8f4f3', borderRadius:14, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'Nunito',sans-serif", marginTop:8 },
  secLink: { display:'block', textAlign:'center', color:'#4ECDC4', textDecoration:'none', fontSize:14, fontWeight:700, marginTop:14 },
  spin: { width:18, height:18, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' },
  successBanner: { background:'#EEF7F2', borderRadius:14, padding:'14px 16px', marginBottom:4, border:'1px solid #98D8C8' },
  demoBanner: { background:'#fff8f0', borderRadius:14, padding:'12px 14px', marginBottom:4, border:'1px solid #FFD9A0' },
}