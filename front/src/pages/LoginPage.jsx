import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const data = await login(email, password)
      
      // Проверяем, есть ли данные пользователя
      if (!data || !data.user) {
        throw new Error('Неверные учётные данные')
      }
      
      toast.success(`Сәлем, ${data.user.name.split(' ')[0]}! 👋`)
      
      // Перенаправляем на нужную страницу
      const redirectPath = data.user.onboarding_complete ? from : '/onboarding'
      navigate(redirectPath)
    } catch (err) {
      // Обработка разных типов ошибок
      const errorMsg = err.message || 'Ошибка при входе'
      
      if (err.response?.status === 401) {
        toast.error('Email или пароль неверны')
      } else if (err.response?.status === 404) {
        toast.error('Пользователь не найден. Пожалуйста, зарегистрируйтесь')
      } else {
        toast.error(errorMsg)
      }
      
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={s.root}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        .inp:focus { border-color: #4ECDC4 !important; outline: none; box-shadow: 0 0 0 3px rgba(78,205,196,0.2); }
        .inp::placeholder { color: #b0bec5; }
        .btn-main:hover { background: #3dbdb5 !important; transform: translateY(-1px); }
        .link-reg:hover { text-decoration: underline; }
        @media (max-width: 375px) {
          .login-top { padding: 32px 20px 28px !important; min-height: 220px !important; }
          .login-card { margin: 16px 12px !important; padding: 24px 18px !important; }
        }
      `}</style>

      {/* Top teal header */}
      <div className="login-top" style={s.topSection}>
        <div style={s.logo}>
          <span style={s.logoEmoji}>🧴</span>
          <span style={s.logoText}>Dermiq</span>
        </div>
        <div style={s.illustration}>
          <div style={s.illCircle1} />
          <div style={s.illCircle2} />
          <div style={s.illCircle3} />
          <div style={{...s.illIcon, animation:'float 3s ease-in-out infinite'}}>
            <span style={{fontSize:48}}>💆‍♀️</span>
          </div>
        </div>
        <div style={s.welcomeBox}>
          <h2 style={s.welcomeTitle}>Dermiq-ке қош келдіңіз!</h2>
          <p style={s.welcomeDesc}>Тері анализіңіз бен күтім кеңестері осында</p>
        </div>
      </div>

      {/* Bottom white card */}
      <div className="login-card" style={s.card}>
        <h1 style={s.title}>Кіру</h1>

        <form onSubmit={handleSubmit(onSubmit)} style={s.form}>
          <div style={s.field}>
            <input
              className="inp"
              type="email"
              placeholder="Email енгізіңіз"
              style={{...s.inp, ...(errors.email ? s.inpErr : {})}}
              {...register('email', {
                required: 'Email енгізіңіз',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Email дұрыс емес' }
              })}
            />
            {errors.email && <p style={s.err}>{errors.email.message}</p>}
          </div>

          <div style={s.field}>
            <div style={{position:'relative'}}>
              <input
                className="inp"
                type={showPass ? 'text' : 'password'}
                placeholder="Құпия сөз"
                style={{...s.inp, paddingRight:44, ...(errors.password ? s.inpErr : {})}}
                {...register('password', { required: 'Құпия сөз енгізіңіз' })}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={s.eyeBtn}>
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.password && <p style={s.err}>{errors.password.message}</p>}
          </div>

          <div style={s.forgotRow}>
            <Link to="/forgot-password" style={s.forgot}>Құпия сөзді ұмыттым?</Link>
          </div>

          <button type="submit" disabled={loading} className="btn-main" style={s.btnMain}>
            {loading
              ? <span style={s.spinner} />
              : 'Кіру'}
          </button>
        </form>

        <p style={s.bottomText}>
          Аккаунт жоқ па?{' '}
          <Link to="/register" className="link-reg" style={s.regLink}>Тіркелу</Link>
        </p>
      </div>
    </div>
  )
}

const s = {
  root: {
    minHeight: '100vh',
    background: '#f0fafb',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Nunito', 'SF Pro Display', -apple-system, sans-serif",
    maxWidth: 430,
    margin: '0 auto',
  },
  topSection: {
    background: 'linear-gradient(160deg, #4ECDC4 0%, #44b8b0 100%)',
    padding: '48px 32px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 280,
    animation: 'fadeUp 0.5s ease forwards',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    marginBottom: 24, alignSelf: 'flex-start',
  },
  logoEmoji: { fontSize: 28 },
  logoText: { fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' },
  illustration: {
    position: 'relative', width: 120, height: 120,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
  },
  illCircle1: {
    position: 'absolute', width: 120, height: 120, borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
  },
  illCircle2: {
    position: 'absolute', width: 90, height: 90, borderRadius: '50%',
    background: 'rgba(255,255,255,0.15)',
  },
  illCircle3: {
    position: 'absolute', width: 60, height: 60, borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
  },
  illIcon: { position: 'relative', zIndex: 1 },
  welcomeBox: { textAlign: 'center' },
  welcomeTitle: { fontSize: 20, fontWeight: 800, color: 'white', marginBottom: 6 },
  welcomeDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 },
  card: {
    background: 'white',
    borderRadius: 28,
    padding: '32px 28px',
    margin: '24px 20px',
    boxShadow: '0 8px 40px rgba(78,205,196,0.12)',
    animation: 'fadeUp 0.5s ease 0.1s both forwards',
  },
  title: { fontSize: 24, fontWeight: 800, color: '#2d3748', marginBottom: 24, textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 4 },
  inp: {
    width: '100%', padding: '14px 16px',
    border: '1.5px solid #e8f4f3',
    borderRadius: 14, fontSize: 14,
    color: '#2d3748', background: '#f8fdfc',
    transition: 'all 0.2s',
  },
  inpErr: { borderColor: '#fc8181', background: '#fff5f5' },
  eyeBtn: {
    position: 'absolute', right: 12, top: '50%',
    transform: 'translateY(-50%)',
    background: 'none', border: 'none',
    cursor: 'pointer', fontSize: 16, padding: 4,
  },
  err: { fontSize: 11, color: '#e53e3e', marginTop: 2 },
  forgotRow: { textAlign: 'right' },
  forgot: { fontSize: 12, color: '#4ECDC4', textDecoration: 'none', fontWeight: 600 },
  btnMain: {
    width: '100%', padding: '15px',
    background: '#4ECDC4', color: 'white',
    border: 'none', borderRadius: 14,
    fontSize: 15, fontWeight: 700,
    cursor: 'pointer', marginTop: 4,
    transition: 'all 0.2s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: 52,
  },
  spinner: {
    width: 20, height: 20,
    border: '2px solid rgba(255,255,255,0.4)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
    display: 'inline-block',
  },
  bottomText: { textAlign: 'center', fontSize: 14, color: '#718096', marginTop: 20 },
  regLink: { color: '#4ECDC4', fontWeight: 700, textDecoration: 'none' },
}