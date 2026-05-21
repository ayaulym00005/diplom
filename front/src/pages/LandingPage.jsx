import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useLang } from '../context/LangContext'
import LangSwitcher from '../components/ui/LangSwitcher'
import http from '../services/api'

const SKIN_TYPES = [
  { key: 'oily',   color: '#4ECDC4', emoji: '💧' },
  { key: 'dry',    color: '#FFB347', emoji: '🌿' },
  { key: 'acne',   color: '#FF6B6B', emoji: '🔴' },
  { key: 'normal', color: '#98D8C8', emoji: '✨' },
]

const SKIN_LABELS = {
  kk: { oily:'Майлы тері', dry:'Құрғақ тері', acne:'Акне', normal:'Қалыпты тері' },
  ru: { oily:'Жирная кожа', dry:'Сухая кожа', acne:'Акне', normal:'Нормальная кожа' },
  en: { oily:'Oily Skin', dry:'Dry Skin', acne:'Acne', normal:'Normal Skin' },
}

const TEXTS = {
  kk: {
    badge: '🧬 AI тері анализі',
    title: 'Теріңізді',
    titleAccent: 'танып біл',
    desc: 'Фото жүктеп, AI арқылы тері типіңізді анықтаңыз және жеке күтім кеңестерін алыңыз',
    start: 'Тегін бастау →',
    login: 'Кіру',
    conf: 'сенімділік',
    accuracy: 'Дәлдік',
    types: 'Тері типі',
    time: 'Анализ уақыты',
    how: 'Қалай жұмыс істейді?',
    steps: [
      { icon:'📸', title:'Фото жүктеу', desc:'Бетіңіздің суретін жүктеңіз' },
      { icon:'🤖', title:'AI анализ', desc:'Жасанды интеллект талдайды' },
      { icon:'📊', title:'Нәтиже', desc:'Тері типіңіз анықталады' },
      { icon:'💊', title:'Кеңес', desc:'Жеке күтім бағдарламасы' },
    ],
    skinTitle: 'Тері типтері',
    reviewTitle: 'Пікірлер',
    reviewEmpty: 'Бірінші болып пікір қалдырыңыз!',
    ctaTitle: 'Бүгін бастаңыз!',
    ctaDesc: 'Тегін тіркеліп, алғашқы анализіңізді жасаңыз',
    ctaBtn: 'Тегін тіркелу →',
  },
  ru: {
    badge: '🧬 AI анализ кожи',
    title: 'Познай',
    titleAccent: 'свою кожу',
    desc: 'Загрузите фото, определите тип кожи с помощью ИИ и получите персональные советы по уходу',
    start: 'Начать бесплатно →',
    login: 'Войти',
    conf: 'точность',
    accuracy: 'Точность',
    types: 'Тип кожи',
    time: 'Время анализа',
    how: 'Как это работает?',
    steps: [
      { icon:'📸', title:'Загрузка фото', desc:'Загрузите фото вашего лица' },
      { icon:'🤖', title:'AI анализ', desc:'Искусственный интеллект анализирует' },
      { icon:'📊', title:'Результат', desc:'Определяется тип вашей кожи' },
      { icon:'💊', title:'Советы', desc:'Персональная программа ухода' },
    ],
    skinTitle: 'Типы кожи',
    reviewTitle: 'Отзывы',
    reviewEmpty: 'Станьте первым, кто оставит отзыв!',
    ctaTitle: 'Начните сегодня!',
    ctaDesc: 'Зарегистрируйтесь бесплатно и сделайте первый анализ',
    ctaBtn: 'Зарегистрироваться →',
  },
  en: {
    badge: '🧬 AI Skin Analysis',
    title: 'Know',
    titleAccent: 'Your Skin',
    desc: 'Upload a photo, identify your skin type with AI and get personalized skincare recommendations',
    start: 'Start for Free →',
    login: 'Sign In',
    conf: 'confidence',
    accuracy: 'Accuracy',
    types: 'Skin Type',
    time: 'Analysis Time',
    how: 'How it works?',
    steps: [
      { icon:'📸', title:'Upload Photo', desc:'Upload a photo of your face' },
      { icon:'🤖', title:'AI Analysis', desc:'Artificial intelligence analyzes' },
      { icon:'📊', title:'Result', desc:'Your skin type is identified' },
      { icon:'💊', title:'Advice', desc:'Personal skincare program' },
    ],
    skinTitle: 'Skin Types',
    reviewTitle: 'Reviews',
    reviewEmpty: 'Be the first to share your experience!',
    ctaTitle: 'Start Today!',
    ctaDesc: 'Register for free and make your first analysis',
    ctaBtn: 'Register for Free →',
  }
}

const SKIN_DATA = [
  { key:'acne',color:'#FF6B6B',bg:'#fff5f5',emoji:'🔴',kk:'Теріде акне байқалады. Тазарту және емдеу күтімі маңызды.',ru:'Обнаружены признаки акне. Необходим очищающий уход.',en:'Acne detected. Cleansing treatment care is important.' },
  { key:'dry',color:'#FFB347',bg:'#fff8f0',emoji:'🌿',kk:'Теріңіз ылғалдылықтан айрылған. Нәрлендіруші күтім қажет.',ru:'Коже не хватает увлажнения. Необходим питательный уход.',en:'Skin lacks moisture. Nourishing care is needed.' },
  { key:'normal',color:'#4ECDC4',bg:'#f0fafb',emoji:'✨',kk:'Теріңіз балансты. Алдын алу күтімін жалғастырыңыз.',ru:'Кожа в балансе. Продолжайте профилактический уход.',en:'Skin is balanced. Continue preventive care.' },
  { key:'oily',color:'#5DADE2',bg:'#f0f7ff',emoji:'💧',kk:'Артық мөлшерде кожное сало өндіріледі. Матирлеуші күтім қажет.',ru:'Избыточное выделение кожного сала. Нужен матирующий уход.',en:'Excess sebum production. Mattifying care is needed.' },
  { key:'combination',color:'#B8A9E3',bg:'#f8f5ff',emoji:'⚡',kk:'Теріңіздің әр аймағы әртүрлі күтімді қажет етеді.',ru:'Разные зоны лица требуют разного ухода.',en:'Different areas require different care.' },
  { key:'pigmentation',color:'#F4D03F',bg:'#fffdf0',emoji:'🌙',kk:'Пигментті дақтар байқалады. SPF қорғанысы маңызды.',ru:'Обнаружены пигментные пятна. Важна защита SPF.',en:'Pigmentation spots detected. SPF protection is important.' },
  { key:'pores',color:'#5DADE2',bg:'#f0f7ff',emoji:'🔵',kk:'Кеуектер кеңейген. Тазарту күтімі қажет.',ru:'Поры расширены. Необходим очищающий уход.',en:'Pores are enlarged. Cleansing care is needed.' },
  { key:'wrinkles',color:'#A9A9A9',bg:'#f8f8f8',emoji:'〰️',kk:'Қартаю белгілері байқалады. Антиэйдж күтім ұсынылады.',ru:'Признаки старения. Рекомендуется антивозрастной уход.',en:'Signs of aging detected. Anti-aging care is recommended.' },
]

export default function LandingPage() {
  const { lang } = useLang()
  const T = TEXTS[lang] || TEXTS.kk
  const skinLabels = SKIN_LABELS[lang] || SKIN_LABELS.kk
  const [activeIdx, setActiveIdx] = useState(0)
  const [reviews, setReviews] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => setActiveIdx(p => (p + 1) % 4), 2500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    http.get('/reviews/').then(d => setReviews(d || [])).catch(() => {})
  }, [])

  const activeSkin = SKIN_TYPES[activeIdx]

  return (
    <div style={s.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
        .step-card:hover { transform:translateY(-4px); box-shadow:0 12px 30px rgba(78,205,196,0.15)!important; }
        .skin-card:hover { transform:translateY(-3px); }
        .cta-btn:hover { opacity:0.9; transform:translateY(-1px); }
        .out-btn:hover { background:rgba(255,255,255,0.15)!important; }
        .rev-card:hover { box-shadow:0 6px 20px rgba(78,205,196,0.12)!important; }
        @media (max-width: 768px) {
          .hero-inner { flex-direction: column !important; }
          .hero-left { max-width: 100% !important; }
          .phone-mock { display: none !important; }
          .hero-title { font-size: 32px !important; }
          .nav-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .steps-grid { grid-template-columns: 1fr 1fr !important; }
          .skin-grid { grid-template-columns: 1fr 1fr !important; }
          .rev-grid { grid-template-columns: 1fr !important; }
          .stats-row { gap: 20px !important; }
          .cta-btns { flex-wrap: wrap !important; }
        }
        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr !important; }
          .skin-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-section { padding: 80px 16px 48px !important; }
          .hero-title { font-size: 28px !important; }
          .section-pad { padding: 48px 16px !important; }
          .cta-card { padding: 40px 20px !important; }
        }
      `}</style>

      {/* NAV */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <span style={{ fontSize: 22 }}>🧴</span>
            <span style={s.logoText}>Derm<span style={{ color: '#4ECDC4' }}>iq</span></span>
          </div>

          {/* Desktop nav */}
          <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LangSwitcher light={false} />
            <Link to="/login" style={s.navLink}>{T.login}</Link>
            <Link to="/register" style={s.navCta}>{T.start}</Link>
          </div>

          {/* Mobile menu btn */}
          <button className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: '#4ECDC4', padding: 4, flexDirection: 'column', gap: 5, alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ display: 'block', width: 22, height: 2, background: '#2d3748', borderRadius: 1 }} />
            <span style={{ display: 'block', width: 22, height: 2, background: '#2d3748', borderRadius: 1 }} />
            <span style={{ display: 'block', width: 22, height: 2, background: '#2d3748', borderRadius: 1 }} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div style={{ background: 'white', borderTop: '1px solid #e8f4f3', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ marginBottom: 8 }}><LangSwitcher light={false} /></div>
            <Link to="/login" style={{ ...s.navLink, padding: '10px 0' }} onClick={() => setMenuOpen(false)}>{T.login}</Link>
            <Link to="/register" style={{ ...s.navCta, textAlign: 'center' }} onClick={() => setMenuOpen(false)}>{T.start}</Link>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section className="hero-section" style={s.hero}>
        <div className="hero-inner" style={s.heroInner}>
          <div className="hero-left" style={s.heroLeft}>
            <div style={s.heroBadge}>{T.badge}</div>
            <h1 className="hero-title" style={s.heroTitle}>
              {T.title}{' '}
              <span style={{ color: '#FFE66D' }}>{T.titleAccent}</span>
            </h1>
            <p style={s.heroDesc}>{T.desc}</p>
            <div className="cta-btns" style={s.ctaBtns}>
              <Link to="/register" className="cta-btn" style={s.ctaBtn}>{T.start}</Link>
              <Link to="/login" className="out-btn" style={s.outBtn}>{T.login}</Link>
            </div>
            <div className="stats-row" style={s.statsRow}>
              {[
                { val: '97%', label: T.accuracy },
                { val: '8', label: T.types },
                { val: '30с', label: T.time },
              ].map((st, i) => (
                <div key={i} style={s.stat}>
                  <p style={s.statVal}>{st.val}</p>
                  <p style={s.statLabel}>{st.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="phone-mock" style={{ position: 'relative', flexShrink: 0 }}>
            <div style={s.phone}>
              <div style={s.phoneTop}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Dermiq</span>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#98D8C8' }} />
              </div>
              <div style={s.phoneCam}>
                <span style={{ fontSize: 36, animation: 'float 3s ease-in-out infinite', display: 'block' }}>💆‍♀️</span>
              </div>
              <div style={{ ...s.phoneResult, background: activeSkin.color + '20', transition: 'all 0.5s' }}>
                <span style={{ fontSize: 22 }}>{activeSkin.emoji}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#2d3748', margin: 0 }}>
                    {skinLabels[activeSkin.key]}
                  </p>
                  <div style={{ height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '87%', background: activeSkin.color, borderRadius: 2, transition: 'all 0.8s' }} />
                  </div>
                  <p style={{ fontSize: 10, color: '#a0aec0', margin: '3px 0 0' }}>87% {T.conf}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section-pad" style={{ padding: '64px 24px', background: 'white' }}>
        <div style={s.sectionHdr}>
          <span style={s.badge2}>{T.how}</span>
          <h2 style={s.sectionTitle}>{T.how}</h2>
        </div>
        <div className="steps-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {T.steps.map((step, i) => (
            <div key={i} className="step-card" style={s.stepCard}>
              <div style={s.stepNum}>{i + 1}</div>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{step.icon}</div>
              <h3 style={s.stepTitle}>{step.title}</h3>
              <p style={s.stepDesc}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SKIN TYPES */}
      <section className="section-pad" style={{ padding: '64px 24px', background: '#f0fafb' }}>
        <div style={s.sectionHdr}>
          <span style={s.badge2}>{T.skinTitle}</span>
          <h2 style={s.sectionTitle}>{T.skinTitle}</h2>
        </div>
        <div className="skin-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {SKIN_DATA.map((sk, i) => {
            const desc = lang === 'ru' ? sk.ru : lang === 'en' ? sk.en : sk.kk
            const label = (SKIN_LABELS[lang] || SKIN_LABELS.kk)[sk.key] || sk.key
            return (
              <div key={i} className="skin-card" style={{ ...s.skinCard, borderColor: sk.color + '40', transition: 'all 0.3s' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: sk.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 10px' }}>
                  {sk.emoji}
                </div>
                <p style={{ fontSize: 13, fontWeight: 800, color: sk.color, margin: '0 0 4px', textAlign: 'center' }}>{label}</p>
                <p style={{ fontSize: 11, color: '#718096', lineHeight: 1.4, margin: 0, textAlign: 'center' }}>{desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="section-pad" style={{ padding: '64px 24px', background: 'white' }}>
        <div style={s.sectionHdr}>
          <span style={s.badge2}>{T.reviewTitle}</span>
          <h2 style={s.sectionTitle}>{T.reviewTitle}</h2>
        </div>
        {reviews.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#a0aec0', fontSize: 14, padding: '20px 0' }}>{T.reviewEmpty}</p>
        ) : (
          <div className="rev-grid" style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {reviews.slice(0, 6).map((r, i) => (
              <div key={i} className="rev-card" style={s.revCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={s.revAvatar}>{r.user_name?.[0]?.toUpperCase() || 'A'}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#2d3748', margin: 0 }}>{r.user_name}</p>
                    <p style={{ fontSize: 12, margin: 0 }}>{'⭐'.repeat(r.rating)}</p>
                  </div>
                </div>
                {r.comment && <p style={{ fontSize: 13, color: '#718096', fontStyle: 'italic', margin: 0, lineHeight: 1.6 }}>"{r.comment}"</p>}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 24px' }}>
        <div className="cta-card" style={s.ctaCard}>
          <h2 style={s.ctaTitle}>{T.ctaTitle}</h2>
          <p style={s.ctaDesc}>{T.ctaDesc}</p>
          <Link to="/register" className="cta-btn" style={{ ...s.ctaBtn, background: 'white', color: '#2d3748', marginTop: 16, display: 'inline-flex' }}>
            {T.ctaBtn}
          </Link>
        </div>
      </section>

      <footer style={s.footer}>
        <span style={{ fontSize: 16, fontWeight: 800, color: '#4ECDC4' }}>🧴 Dermiq</span>
        <p style={{ fontSize: 12, color: '#a0aec0' }}>© 2026 Dermiq</p>
      </footer>
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', background: 'white', fontFamily: "'Nunito', -apple-system, sans-serif" },
  nav: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'white', boxShadow: '0 2px 20px rgba(78,205,196,0.1)', borderBottom: '1px solid #e8f4f3' },
  navInner: { maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { display: 'flex', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 20, fontWeight: 800, color: '#2d3748' },
  navLink: { padding: '8px 16px', color: '#4ECDC4', textDecoration: 'none', fontSize: 14, fontWeight: 700, border: '1.5px solid #4ECDC4', borderRadius: 12 },
  navCta: { padding: '8px 18px', background: '#4ECDC4', color: 'white', borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none' },
  hero: { background: 'linear-gradient(135deg,#4ECDC4 0%,#44b8b0 60%,#3aa8a0 100%)', padding: '90px 24px 60px', minHeight: '90vh', display: 'flex', alignItems: 'center' },
  heroInner: { maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, width: '100%' },
  heroLeft: { flex: 1, minWidth: 280, maxWidth: 520 },
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 100, padding: '7px 14px', fontSize: 13, color: 'white', marginBottom: 18, fontWeight: 600 },
  heroTitle: { fontSize: 'clamp(32px,5vw,56px)', fontWeight: 900, color: 'white', lineHeight: 1.15, margin: '0 0 14px' },
  heroDesc: { fontSize: 15, color: 'rgba(255,255,255,0.9)', lineHeight: 1.7, margin: '0 0 24px', maxWidth: 420 },
  ctaBtns: { display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', padding: '13px 24px', background: 'white', color: '#1d9e75', borderRadius: 14, fontSize: 15, fontWeight: 800, textDecoration: 'none', boxShadow: '0 4px 18px rgba(0,0,0,0.15)', transition: 'all 0.2s' },
  outBtn: { display: 'inline-flex', alignItems: 'center', padding: '13px 24px', background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: 14, fontSize: 15, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s' },
  statsRow: { display: 'flex', gap: 32 },
  stat: {},
  statVal: { fontSize: 28, fontWeight: 900, color: 'white', margin: '0 0 2px' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  phone: { width: 220, background: 'white', borderRadius: 28, padding: 10, boxShadow: '0 30px 60px rgba(0,0,0,0.25)', border: '6px solid rgba(255,255,255,0.25)' },
  phoneTop: { background: 'linear-gradient(135deg,#4ECDC4,#44b8b0)', padding: '10px 12px', borderRadius: '20px 20px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  phoneCam: { height: 110, background: 'linear-gradient(135deg,#2d3748,#4a5568)', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  phoneResult: { padding: '10px 12px 12px', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.5s' },
  sectionHdr: { textAlign: 'center', marginBottom: 36 },
  badge2: { display: 'inline-block', background: '#e8f8f7', color: '#4ECDC4', padding: '5px 14px', borderRadius: 100, fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 },
  sectionTitle: { fontSize: 28, fontWeight: 900, color: '#2d3748', margin: 0 },
  stepCard: { background: '#f8fdfc', borderRadius: 18, padding: '20px 16px', border: '1.5px solid #e8f4f3', transition: 'all 0.3s', cursor: 'default', position: 'relative' },
  stepNum: { position: 'absolute', top: 12, right: 12, width: 24, height: 24, borderRadius: '50%', background: '#4ECDC4', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 },
  stepTitle: { fontSize: 14, fontWeight: 800, color: '#2d3748', margin: '0 0 5px' },
  stepDesc: { fontSize: 12, color: '#718096', lineHeight: 1.5, margin: 0 },
  skinCard: { background: 'white', borderRadius: 16, padding: '16px 12px', border: '1.5px solid' },
  revCard: { background: 'white', borderRadius: 16, padding: '18px', border: '1px solid #e8f4f3', boxShadow: '0 2px 12px rgba(78,205,196,0.06)', transition: 'all 0.2s' },
  revAvatar: { width: 36, height: 36, borderRadius: '50%', background: '#4ECDC4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'white', flexShrink: 0 },
  ctaCard: { maxWidth: 600, margin: '0 auto', background: 'linear-gradient(135deg,#4ECDC4,#44b8b0)', borderRadius: 24, padding: '50px 32px', textAlign: 'center', boxShadow: '0 20px 60px rgba(78,205,196,0.3)' },
  ctaTitle: { fontSize: 28, fontWeight: 900, color: 'white', margin: '0 0 8px' },
  ctaDesc: { fontSize: 15, color: 'rgba(255,255,255,0.9)' },
  footer: { padding: '20px 24px', background: '#f8fdfc', borderTop: '1px solid #e8f4f3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
}