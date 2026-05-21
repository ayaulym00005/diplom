// src/components/layout/PageHeader.jsx
// Барлық беттің header-ында қолданылады
import LangSwitcher from '../ui/LangSwitcher'

export default function PageHeader({ title, desc, color = 'linear-gradient(135deg,#4ECDC4,#44b8b0)', right, children }) {
  return (
    <div style={{ background: color, padding: '48px 20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: children ? 12 : 0 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 900, color: 'white',
            margin: '0 0 4px',
            fontFamily: "'Poppins','Nunito',-apple-system,sans-serif",
          }}>
            {title}
          </h1>
          {desc && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: 0, fontWeight: 600 }}>
              {desc}
            </p>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
          {right}
          <LangSwitcher />
        </div>
      </div>
      {children}
    </div>
  )
}