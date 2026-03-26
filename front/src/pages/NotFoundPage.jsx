import { Link } from 'react-router-dom'
import { FadeUp } from '../components/ui'
import { useLang } from '../context/LangContext'

export default function NotFoundPage() {
  const { t } = useLang()
  return (
    <div className="grain-overlay min-h-screen mesh-bg flex items-center justify-center px-5">
      <div className="text-center max-w-sm">
        <FadeUp>
          <p className="font-display text-8xl text-cream-300 mb-4">404</p>
          <h1 className="font-display text-3xl text-bark-600 mb-3">{t('common.notFound')}</h1>
          <p className="font-body text-sm text-bark-300 mb-8 leading-relaxed">{t('common.notFoundDesc')}</p>
          <Link to="/" className="btn-primary">{t('common.returnHome')}</Link>
        </FadeUp>
      </div>
    </div>
  )
}
