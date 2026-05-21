import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import LangSwitcher from '../components/ui/LangSwitcher'
import { useLang } from '../context/LangContext'

const TEXTS = {
  kk: {
    badge: 'Skin Analysis App',
    welcome: 'Жаңа аккаунт жасаңыз',
    title: 'Тіркелу',
    nameLabel: 'Аты-жөні',
    namePh: 'Атыңызды енгізіңіз',
    emailLabel: 'Email',
    emailPh: 'email@example.com',
    passLabel: 'Құпия сөз',
    passPh: 'Кемінде 8 таңба',
    confirmLabel: 'Құпия сөзді растаңыз',
    confirmPh: 'Қайта енгізіңіз',
    terms: 'Пайдалану шарттарымен келісемін',
    termsLink: 'Шарттар',
    btn: 'Тіркелу →',
    loading: 'Тіркелуде...',
    hasAccount: 'Аккаунт бар ма?',
    loginLink: 'Кіру',
    motto: 'Теріңіздің денсаулығын бақылаңыз!',
    success: 'Тіркелу сәтті! 🎉',
    errors: {
      name: 'Атыңызды енгізіңіз',
      nameMin: 'Тым қысқа',
      email: 'Email енгізіңіз',
      emailBad: 'Email дұрыс емес',
      pass: 'Құпия сөз енгізіңіз',
      passMin: 'Кемінде 8 таңба',
      confirm: 'Растаңыз',
      confirmMatch: 'Парольдер сәйкес емес',
      terms: 'Шарттармен келісіңіз',
    },
  },
  ru: {
    badge: 'Skin Analysis App',
    welcome: 'Создать новый аккаунт',
    title: 'Регистрация',
    nameLabel: 'Полное имя',
    namePh: 'Ваше имя',
    emailLabel: 'Email',
    emailPh: 'email@example.com',
    passLabel: 'Пароль',
    passPh: 'Минимум 8 символов',
    confirmLabel: 'Подтвердите пароль',
    confirmPh: 'Повторите пароль',
    terms: 'Я принимаю условия использования',
    termsLink: 'Условия',
    btn: 'Зарегистрироваться →',
    loading: 'Регистрация...',
    hasAccount: 'Уже есть аккаунт?',
    loginLink: 'Войти',
    motto: 'Следите за здоровьем вашей кожи!',
    success: 'Регистрация успешна! 🎉',
    errors: {
      name: 'Введите имя',
      nameMin: 'Слишком короткое',
      email: 'Введите email',
      emailBad: 'Неверный email',
      pass: 'Введите пароль',
      passMin: 'Минимум 8 символов',
      confirm: 'Подтвердите пароль',
      confirmMatch: 'Пароли не совпадают',
      terms: 'Примите условия',
    },
  },
  en: {
    badge: 'Skin Analysis App',
    welcome: 'Create a new account',
    title: 'Sign Up',
    nameLabel: 'Full Name',
    namePh: 'Your full name',
    emailLabel: 'Email',
    emailPh: 'you@example.com',
    passLabel: 'Password',
    passPh: 'Min. 8 characters',
    confirmLabel: 'Confirm Password',
    confirmPh: 'Repeat password',
    terms: 'I agree to the Terms of Service',
    termsLink: 'Terms',
    btn: 'Create Account →',
    loading: 'Creating...',
    hasAccount: 'Already have an account?',
    loginLink: 'Sign In',
    motto: 'Take control of your skin health today!',
    success: 'Account created! 🎉',
    errors: {
      name: 'Enter your name',
      nameMin: 'Too short',
      email: 'Enter your email',
      emailBad: 'Invalid email',
      pass: 'Enter your password',
      passMin: 'At least 8 characters',
      confirm: 'Please confirm',
      confirmMatch: 'Passwords do not match',
      terms: 'Please accept the terms',
    },
  },
}

export default function RegisterPage() {
  const { register: doReg } = useAuth()
  const { lang } = useLang()
  const T = TEXTS[lang] || TEXTS.kk
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await doReg({ name: data.name, email: data.email, password: data.password })
      toast.success(T.success)
      navigate('/onboarding')
    } catch (err) {
      toast.error(err.message)
    } finally { setLoading(false) }
  }

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        input:focus { outline:none; border-color:#4ECDC4!important; box-shadow:0 0 0 3px rgba(78,205,196,0.15)!important; }
        input::placeholder { color:#b0bec5; }
        .reg-btn:hover { opacity:0.9; transform:translateY(-1px); }
        @media (max-width:480px) {
          .reg-header { padding:40px 16px 28px!important; min-height:160px!important; }
          .reg-card { padding:20px 16px 36px!important; }
        }
      `}</style>

      {/* Header */}
      <div className="reg-header" style={s.header}>
        <div style={s.deco1}/><div style={s.deco2}/>
        <div style={{ position:'relative' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:22 }}>🧴</span>
              <span style={{ fontSize:20, fontWeight:800, color:'white' }}>Dermiq</span>
            </div>
            <LangSwitcher light />
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:4 }}>
            <div style={{ position:'relative', width:64, height:64 }}>
              <div style={s.illCircle1}/><div style={s.illCircle2}/>
              <span style={{ position:'relative', zIndex:1, fontSize:28, display:'block', textAlign:'center', lineHeight:'64px', animation:'float 3s ease-in-out infinite' }}>✨</span>
            </div>
            <div>
              <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.7)', marginBottom:6 }}>{T.badge}</p>
              <p style={{ fontSize:15, fontWeight:700, color:'white', lineHeight:1.4 }}>{T.welcome}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="reg-card" style={s.card}>
        <p style={s.cardBadge}>New Account</p>
        <h1 style={s.cardTitle}>{T.title}</h1>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {/* Аты */}
          <div>
            <label style={s.label}>{T.nameLabel}</label>
            <input
              type="text"
              placeholder={T.namePh}
              style={{ ...s.input, ...(errors.name ? s.inputErr : {}) }}
              {...register('name', {
                required: T.errors.name,
                minLength: { value: 2, message: T.errors.nameMin },
              })}
            />
            {errors.name && <p style={s.err}>{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label style={s.label}>{T.emailLabel}</label>
            <input
              type="email"
              placeholder={T.emailPh}
              style={{ ...s.input, ...(errors.email ? s.inputErr : {}) }}
              {...register('email', {
                required: T.errors.email,
                pattern: { value:/\S+@\S+\.\S+/, message: T.errors.emailBad },
              })}
            />
            {errors.email && <p style={s.err}>{errors.email.message}</p>}
          </div>

          {/* Пароль */}
          <div>
            <label style={s.label}>{T.passLabel}</label>
            <input
              type="password"
              placeholder={T.passPh}
              style={{ ...s.input, ...(errors.password ? s.inputErr : {}) }}
              {...register('password', {
                required: T.errors.pass,
                minLength: { value: 8, message: T.errors.passMin },
              })}
            />
            {errors.password && <p style={s.err}>{errors.password.message}</p>}
          </div>

          {/* Растау */}
          <div>
            <label style={s.label}>{T.confirmLabel}</label>
            <input
              type="password"
              placeholder={T.confirmPh}
              style={{ ...s.input, ...(errors.confirm ? s.inputErr : {}) }}
              {...register('confirm', {
                required: T.errors.confirm,
                validate: v => v === watch('password') || T.errors.confirmMatch,
              })}
            />
            {errors.confirm && <p style={s.err}>{errors.confirm.message}</p>}
          </div>

          {/* Terms */}
          <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginTop:2 }}>
            <input
              id="terms"
              type="checkbox"
              style={{ width:16, height:16, marginTop:2, accentColor:'#4ECDC4', cursor:'pointer', flexShrink:0 }}
              {...register('terms', { required: T.errors.terms })}
            />
            <label htmlFor="terms" style={{ fontSize:12, color:'#718096', lineHeight:1.5, cursor:'pointer' }}>
              <span style={{ color:'#4ECDC4', fontWeight:700 }}>{T.termsLink}</span>
              {lang === 'kk' ? 'тармен келісемін' : lang === 'ru' ? ' — принимаю' : ' — I agree'}
            </label>
          </div>
          {errors.terms && <p style={s.err}>{errors.terms.message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="reg-btn"
            style={{ ...s.primBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading
              ? <><span style={s.spin}/> {T.loading}</>
              : T.btn}
          </button>
        </form>

        <div style={s.divider}>
          <span style={s.divLine}/><span style={s.divText}>or</span><span style={s.divLine}/>
        </div>

        <p style={{ textAlign:'center', fontSize:13, color:'#a0aec0' }}>
          {T.hasAccount}{' '}
          <Link to="/login" style={{ color:'#4ECDC4', fontWeight:700, textDecoration:'none' }}>
            {T.loginLink}
          </Link>
        </p>

        <p style={s.motto}>{T.motto}</p>
      </div>
    </div>
  )
}

const s = {
  root: { minHeight:'100vh', background:'#f0fafb', fontFamily:"'Nunito',-apple-system,sans-serif", maxWidth:430, margin:'0 auto', display:'flex', flexDirection:'column' },
  header: { background:'linear-gradient(135deg,#4ECDC4,#44b8b0)', padding:'48px 24px 28px', position:'relative', overflow:'hidden', flexShrink:0, minHeight:180 },
  deco1: { position:'absolute', top:-60, right:-40, width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.1)', pointerEvents:'none' },
  deco2: { position:'absolute', bottom:-30, left:-20, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.08)', pointerEvents:'none' },
  illCircle1: { position:'absolute', width:64, height:64, borderRadius:'50%', background:'rgba(255,255,255,0.2)' },
  illCircle2: { position:'absolute', width:48, height:48, borderRadius:'50%', background:'rgba(255,255,255,0.15)', top:8, left:8 },
  card: { background:'white', borderRadius:'24px 24px 0 0', flex:1, padding:'24px 22px 40px', marginTop:-20, boxShadow:'0 -8px 30px rgba(78,205,196,0.1)', animation:'fadeUp 0.4s ease both' },
  cardBadge: { fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'#4ECDC4', marginBottom:4 },
  cardTitle: { fontSize:22, fontWeight:900, color:'#2d3748', marginBottom:18 },
  label: { display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#5A7A94', marginBottom:5 },
  input: { width:'100%', padding:'12px 14px', border:'1.5px solid #e8f4f3', borderRadius:12, fontSize:14, color:'#2d3748', background:'#f8fdfc', fontFamily:"'Nunito',sans-serif", transition:'all 0.2s' },
  inputErr: { borderColor:'#e53e3e', background:'#fff5f5' },
  err: { fontSize:11, color:'#e53e3e', marginTop:3 },
  primBtn: { width:'100%', padding:'14px', background:'#4ECDC4', color:'white', border:'none', borderRadius:14, fontSize:15, fontWeight:800, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:'0 4px 16px rgba(78,205,196,0.3)', transition:'all 0.2s', fontFamily:"'Nunito',sans-serif", marginTop:4 },
  spin: { width:18, height:18, border:'2px solid rgba(255,255,255,0.4)', borderTop:'2px solid white', borderRadius:'50%', animation:'spin 0.8s linear infinite', display:'inline-block' },
  divider: { display:'flex', alignItems:'center', gap:10, margin:'16px 0' },
  divLine: { flex:1, height:1, background:'#e8f4f3' },
  divText: { fontSize:12, color:'#a0aec0' },
  motto: { textAlign:'center', fontSize:10, fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', color:'#b0bec5', marginTop:16, paddingTop:14, borderTop:'1px solid #f0fafb' },
}