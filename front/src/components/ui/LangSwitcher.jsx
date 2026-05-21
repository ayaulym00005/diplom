import { useLang } from '../../context/LangContext'

const LANGS = [
  { code: 'kk', label: 'ҚАЗ', flag: '🇰🇿' },
  { code: 'ru', label: 'РУС', flag: '🇷🇺' },
  { code: 'en', label: 'ENG', flag: '🇬🇧' },
]

// light=true  → ақ (dark/teal) фон үшін (Dashboard header сияқты)
// light=false → жарық/ақ фон үшін (Landing nav сияқты)
export default function LangSwitcher({ style, light = true }) {
  const { lang, setLang } = useLang()

  return (
    <div style={{ display: 'flex', gap: 6, ...style }}>
      {LANGS.map((l) => {
        const active = lang === l.code
        const activeStyle = {
          background: light ? 'white' : '#f0fafb',
          border: '2px solid #4ECDC4',
          color: '#4ECDC4',
        }
        const inactiveStyle = {
          background: light ? 'rgba(255,255,255,0.15)' : 'transparent',
          border: '1.5px solid ' + (light ? 'rgba(255,255,255,0.35)' : '#c8e6e4'),
          color: light ? 'white' : '#4a5568',
        }
        return (
          <button
            key={l.code}
            onClick={() => setLang(l.code)}
            style={{
              padding: '5px 10px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 700,
              transition: 'all 0.2s',
              fontFamily: "'Nunito', sans-serif",
              letterSpacing: '0.05em',
              ...(active ? activeStyle : inactiveStyle),
            }}
          >
            {l.flag} {l.label}
          </button>
        )
      })}
    </div>
  )
}
