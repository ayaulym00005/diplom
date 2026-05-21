import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'

export default function NotFoundPage() {
  const { t } = useLang()
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f0fafb 0%, #e8f4f3 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 20px',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <p style={{
          fontSize: 100,
          fontWeight: 800,
          color: '#4ECDC4',
          margin: '0 0 8px',
          lineHeight: 1,
          opacity: 0.25,
        }}>404</p>
        <h1 style={{
          fontSize: 26,
          fontWeight: 800,
          color: '#2d3748',
          margin: '0 0 12px',
        }}>{t('common.notFound')}</h1>
        <p style={{
          fontSize: 14,
          color: '#718096',
          margin: '0 0 32px',
          lineHeight: 1.6,
        }}>{t('common.notFoundDesc')}</p>
        <Link to="/" style={{
          display: 'inline-block',
          padding: '14px 28px',
          background: '#4ECDC4',
          color: 'white',
          borderRadius: 14,
          fontSize: 14,
          fontWeight: 700,
          textDecoration: 'none',
        }}>{t('common.returnHome')}</Link>
      </div>
    </div>
  )
}
