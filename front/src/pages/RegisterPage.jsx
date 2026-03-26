import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { useLang } from '../context/LangContext'
import { FadeUp, Spinner, Divider } from '../components/ui'

export default function RegisterPage() {
  const { register: doRegister } = useAuth()
  const { t } = useLang()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await doRegister({ name: data.name, email: data.email, password: data.password })
      toast.success(t('common.registerSuccess'))
      navigate('/onboarding')
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
          <Link to="/" className="flex items-center justify-center gap-2 mb-10 group">
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
              <h1 className="font-display text-3xl text-bark-600 mb-1.5">{t('auth.createTitle')}</h1>
              <p className="font-body text-sm text-bark-300">{t('auth.createSub')}</p>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">{t('auth.fullName')}</label>
                <input type="text" placeholder="Anna Karenina" className={inputCls}
                  {...register('name', {
                    required: t('auth.errors.nameRequired'),
                    minLength: { value: 2, message: t('auth.errors.nameMin') },
                  })} />
                {errors.name && <p className={errCls}>{errors.name.message}</p>}
              </div>
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
                <label className="label">{t('auth.password')}</label>
                <input type="password" placeholder="••••••••" className={inputCls}
                  {...register('password', {
                    required: t('auth.errors.passwordRequired'),
                    minLength: { value: 8, message: t('auth.errors.passwordMin') },
                  })} />
                {errors.password && <p className={errCls}>{errors.password.message}</p>}
              </div>
              <div>
                <label className="label">{t('auth.confirmPassword')}</label>
                <input type="password" placeholder="••••••••" className={inputCls}
                  {...register('confirm', {
                    required: t('auth.errors.confirmRequired'),
                    validate: (v) => v === watch('password') || t('auth.errors.confirmMatch'),
                  })} />
                {errors.confirm && <p className={errCls}>{errors.confirm.message}</p>}
              </div>
              <div className="flex items-start gap-3 pt-1">
                <input id="terms" type="checkbox"
                  className="mt-0.5 w-4 h-4 accent-blush-400 rounded cursor-pointer"
                  {...register('terms', { required: t('auth.errors.termsRequired') })} />
                <label htmlFor="terms" className="text-xs font-body text-bark-300 leading-relaxed cursor-pointer">
                  {t('auth.terms1')}{' '}
                  <span className="text-blush-500 hover:underline cursor-pointer">{t('auth.termsLink')}</span>
                  {' '}{t('auth.terms2')}{' '}
                  <span className="text-blush-500 hover:underline cursor-pointer">{t('auth.privacyLink')}</span>
                </label>
              </div>
              {errors.terms && <p className={errCls}>{errors.terms.message}</p>}
              <div className="pt-2">
                <button type="submit" disabled={loading}
                  className="btn-primary w-full py-3.5 text-xs tracking-widest uppercase disabled:opacity-50">
                  {loading ? <Spinner size="sm" /> : t('auth.createBtn')}
                </button>
              </div>
            </form>
            <Divider label={t('auth.orDivider')} />
            <p className="text-center text-sm font-body text-bark-300">
              {t('auth.haveAccount')}{' '}
              <Link to="/login" className="text-blush-500 hover:text-blush-400 font-medium">
                {t('nav.signIn')}
              </Link>
            </p>
          </div>
        </FadeUp>
      </div>
    </div>
  )
}
