import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { FadeUp, Spinner, Divider } from '../components/ui'

export default function LoginPage() {
  const { login } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async ({ email, password }) => {
    setLoading(true)
    try {
      const data = await login(email, password)
      toast.success(`${t('common.loginSuccess')}, ${data.user.name.split(' ')[0]} ✦`)
      navigate(data.user.onboardingComplete ? from : '/onboarding')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'input-field'
  const errCls = 'text-2xs text-blush-500 mt-1 font-body'

  return (
    <div className="grain-overlay min-h-screen mesh-bg flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <FadeUp>
          <Link to="/" className="flex items-center justify-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-full bg-blush-300 flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="5" stroke="#5C4A3A" strokeWidth="1.2" />
                <circle cx="8" cy="8" r="2" fill="#C47D62" />
              </svg>
            </div>
            <span className="font-display font-medium text-xl text-bark-600 tracking-wide">
              Derm<span className="text-blush-500 italic">iq</span>
            </span>
          </Link>
        </FadeUp>
        <FadeUp delay={0.05}>
          <div className="card p-8 md:p-10">
            <div className="mb-8">
              <h1 className="font-display text-3xl text-bark-600 mb-1.5">{t('auth.welcomeBack')}</h1>
              <p className="font-body text-sm text-bark-300">{t('auth.signInSub')}</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">{t('auth.email')}</label>
                <input type="email" placeholder="you@example.com" className={inputCls}
                  {...register('email', {
                    required: t('auth.errors.emailRequired'),
                    pattern: { value: /\S+@\S+\.\S+/, message: t('auth.errors.emailInvalid') },
                  })} />
                {errors.email && <p className={errCls}>{errors.email.message}</p>}
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">{t('auth.password')}</label>
                  <Link to="/forgot-password" className="text-2xs font-body text-blush-400 hover:text-blush-500 tracking-wide">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>
                <input type="password" placeholder="••••••••" className={inputCls}
                  {...register('password', { required: t('auth.errors.passwordRequired') })} />
                {errors.password && <p className={errCls}>{errors.password.message}</p>}
              </div>
              <div className="pt-2">
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 text-xs tracking-widest uppercase disabled:opacity-50">
                  {loading ? <Spinner size="sm" /> : t('auth.signInBtn')}
                </button>
              </div>
            </form>
            <Divider label={t('auth.orDivider')} />
            <p className="text-center text-sm font-body text-bark-300">
              {t('auth.noAccount')}{' '}
              <Link to="/register" className="text-blush-500 hover:text-blush-400 font-medium">
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>
        </FadeUp>
      </div>
    </div>
  )
}
