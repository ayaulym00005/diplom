import { useState } from 'react'
import BottomNav from '../components/layout/BottomNav'
import PageHeader from '../components/layout/PageHeader'
import { useLang } from '../context/LangContext'

// catIdx maps to cosmetics.cats array index (0=all,1=cleanser,2=toner,3=serum,4=moisturizer,5=sunscreen,6=treatment)
const PRODUCTS = [
  { id:1, name:'CeraVe Hydrating Cleanser', brand:'CeraVe', catIdx:1, price:'4 500 ₸', rating:4.8, reviews:1205, for:['dry','normal','combination'], emoji:'🧴',
    desc:'Ceramides + Hyaluronic Acid', desc_ru:'Ceramides + Гиалуроновая кислота', desc_en:'Ceramides + Hyaluronic Acid',
    badge:'Бестселлер', badge_ru:'Бестселлер', badge_en:'Bestseller', color:'#4ECDC4', kaspi:'CeraVe+Hydrating+Cleanser' },
  { id:2, name:'La Roche-Posay Effaclar Gel', brand:'La Roche-Posay', catIdx:1, price:'6 200 ₸', rating:4.7, reviews:892, for:['oily','acne','combination'], emoji:'🧼',
    desc:'Майлы тері үшін BHA тазалаушы', desc_ru:'BHA очищение для жирной кожи', desc_en:'BHA cleanser for oily skin',
    badge:'Акне үшін', badge_ru:'Для акне', badge_en:'For Acne', color:'#5DADE2', kaspi:'La+Roche+Posay+Effaclar+Gel' },
  { id:3, name:'The Ordinary Niacinamide 10%', brand:'The Ordinary', catIdx:3, price:'5 100 ₸', rating:4.9, reviews:2341, for:['oily','acne','combination','pores'], emoji:'💊',
    desc:'Ниацинамид 10% + Мырыш 1%', desc_ru:'Ниацинамид 10% + Цинк 1%', desc_en:'Niacinamide 10% + Zinc 1%',
    badge:'ТОП', badge_ru:'ТОП', badge_en:'TOP', color:'#4ECDC4', kaspi:'The+Ordinary+Niacinamide+10%+Zinc' },
  { id:4, name:'Neutrogena Hydro Boost Gel', brand:'Neutrogena', catIdx:4, price:'5 600 ₸', rating:4.9, reviews:3102, for:['dry','normal','combination'], emoji:'💦',
    desc:'Гиалурон қышқылы. Жеңіл гель-крем', desc_ru:'Гиалуроновая кислота. Лёгкий гель-крем', desc_en:'Hyaluronic Acid. Lightweight gel-cream',
    badge:'Бестселлер', badge_ru:'Бестселлер', badge_en:'Bestseller', color:'#5DADE2', kaspi:'Neutrogena+Hydro+Boost+Gel+Cream' },
  { id:5, name:"Paula's Choice BHA 2%", brand:"Paula's Choice", catIdx:2, price:'8 900 ₸', rating:4.8, reviews:1876, for:['oily','acne','pores'], emoji:'🔬',
    desc:'Salicylic Acid 2%. Кеуектерді тазалайды', desc_ru:'Salicylic Acid 2%. Очищает поры', desc_en:'Salicylic Acid 2%. Unclogs pores',
    badge:'Эксперт', badge_ru:'Эксперт', badge_en:'Expert', color:'#B8A9E3', kaspi:'Paulas+Choice+Skin+Perfecting+2%+BHA' },
  { id:6, name:'Anessa Perfect UV SPF 50+', brand:'Anessa', catIdx:5, price:'12 500 ₸', rating:4.9, reviews:4521, for:['all'], emoji:'☀️',
    desc:'SPF 50+ PA++++. Су өтпейді', desc_ru:'SPF 50+ PA++++. Водостойкий', desc_en:'SPF 50+ PA++++. Water resistant',
    badge:'ТОП SPF', badge_ru:'ТОП SPF', badge_en:'TOP SPF', color:'#F4D03F', kaspi:'Anessa+Perfect+UV+Sunscreen+SPF50' },
  { id:7, name:'EltaMD UV Clear SPF 46', brand:'EltaMD', catIdx:5, price:'14 000 ₸', rating:4.8, reviews:1987, for:['acne','sensitive','oily'], emoji:'🏥',
    desc:'SPF 46. Акне + нәзік тері', desc_ru:'SPF 46. Акне + чувствительная кожа', desc_en:'SPF 46. Acne + sensitive skin',
    badge:'Дерматолог ұсынады', badge_ru:'Дерматолог советует', badge_en:'Derm-recommended', color:'#4ECDC4', kaspi:'EltaMD+UV+Clear+SPF+46' },
  { id:8, name:'Differin Adapalene Gel 0.1%', brand:'Differin', catIdx:6, price:'8 200 ₸', rating:4.7, reviews:1654, for:['acne'], emoji:'💉',
    desc:'Адапален 0.1%. Акнеге №1', desc_ru:'Адапален 0.1%. №1 от акне', desc_en:'Adapalene 0.1%. #1 for acne',
    badge:'Акне №1', badge_ru:'Акне №1', badge_en:'Acne #1', color:'#FF6B6B', kaspi:'Differin+Adapalene+Gel+0.1%' },
  { id:9, name:'The Ordinary Retinol 0.5%', brand:'The Ordinary', catIdx:3, price:'4 900 ₸', rating:4.8, reviews:2341, for:['wrinkles','normal','dry'], emoji:'⭐',
    desc:'Ретинол 0.5% скваланда. Кешке', desc_ru:'Ретинол 0.5% в скваланe. Вечером', desc_en:'Retinol 0.5% in Squalane. PM use',
    badge:'Анти-эйдж', badge_ru:'Антивозраст', badge_en:'Anti-aging', color:'#A9A9A9', kaspi:'The+Ordinary+Retinol+0.5%+in+Squalane' },
  { id:10, name:'COSRX Snail Mucin 96%', brand:'COSRX', catIdx:3, price:'6 300 ₸', rating:4.7, reviews:1876, for:['dry','normal','sensitive','acne'], emoji:'🐌',
    desc:'Улитка муцині 96%. Регенерация', desc_ru:'Муцин улитки 96%. Регенерация', desc_en:'Snail Mucin 96%. Regeneration',
    badge:'К-beauty', badge_ru:'К-beauty', badge_en:'K-beauty', color:'#98D8C8', kaspi:'COSRX+Advanced+Snail+96+Mucin+Power+Essence' },
  { id:11, name:'Biore UV Aqua Rich SPF 50+', brand:'Biore', catIdx:5, price:'5 200 ₸', rating:4.7, reviews:2890, for:['oily','combination','normal'], emoji:'🌊',
    desc:'SPF 50+. Су текстурасы. Майлы тері', desc_ru:'SPF 50+. Водная текстура. Жирная кожа', desc_en:'SPF 50+. Watery texture. Oily skin',
    badge:'', badge_ru:'', badge_en:'', color:'#5DADE2', kaspi:'Biore+UV+Aqua+Rich+Watery+Essence+SPF50' },
  { id:12, name:'The Ordinary Vitamin C 23%', brand:'The Ordinary', catIdx:3, price:'5 800 ₸', rating:4.6, reviews:1123, for:['pigmentation','normal','dry'], emoji:'🍊',
    desc:'Витамин C 23%. Пигментацияны ашады', desc_ru:'Витамин C 23%. Осветляет пигментацию', desc_en:'Vitamin C 23%. Brightens pigmentation',
    badge:'', badge_ru:'', badge_en:'', color:'#F4D03F', kaspi:'The+Ordinary+Ascorbic+Acid+8%+Alpha+Arbutin+2%' },
]

// SKINS_META: key/emoji/color only — labels come from t('cosmetics.skins')
const SKINS_META = [
  {key:'all',   emoji:'✨', color:'#4ECDC4'},
  {key:'acne',  emoji:'🔴', color:'#FF6B6B'},
  {key:'dry',   emoji:'🌿', color:'#FFB347'},
  {key:'normal',emoji:'✨', color:'#4ECDC4'},
  {key:'oily',  emoji:'💧', color:'#5DADE2'},
  {key:'combination',emoji:'⚡',color:'#B8A9E3'},
  {key:'pigmentation',emoji:'🌙',color:'#F4D03F'},
  {key:'pores', emoji:'🔵', color:'#5DADE2'},
  {key:'wrinkles',emoji:'〰️',color:'#A9A9A9'},
  {key:'sensitive',emoji:'🌸',color:'#FFB347'},
]

export default function CosmeticsPage() {
  const { t, lang } = useLang()
  const cats = t('cosmetics.cats') || []
  const skinLabels = t('cosmetics.skins') || []
  const SKINS = SKINS_META.map((s, i) => ({ ...s, label: skinLabels[i] || s.key }))

  const [skinF, setSkinF] = useState('all')
  const [catIdx, setCatIdx] = useState(0)
  const [search, setSearch] = useState('')
  const [sel, setSel] = useState(null)

  const getDesc = p => lang === 'ru' ? p.desc_ru : lang === 'en' ? p.desc_en : p.desc
  const getBadge = p => lang === 'ru' ? p.badge_ru : lang === 'en' ? p.badge_en : p.badge

  const filtered = PRODUCTS.filter(p => {
    const ms = skinF === 'all' || p.for.includes('all') || p.for.includes(skinF)
    const mc = catIdx === 0 || p.catIdx === catIdx
    const mq = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand.toLowerCase().includes(search.toLowerCase())
    return ms && mc && mq
  })

  const kaspiUrl = p => `https://kaspi.kz/shop/search/?q=${p.kaspi}&c=750000000`

  return (
    <div style={{minHeight:'100vh',background:'#f0fafb',fontFamily:"'Plus Jakarta Sans',sans-serif",maxWidth:430,margin:'0 auto'}}>
      <style>{`*{box-sizing:border-box}.pc:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(78,205,196,0.12)!important}input:focus{outline:none;border-color:#4ECDC4!important}::-webkit-scrollbar{height:4px}::-webkit-scrollbar-thumb{background:#c8ede8;border-radius:2px}@keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
      <PageHeader title={t('cosmetics.title')} desc={t('cosmetics.desc')} />
      <div style={{padding:'16px'}}>
        <div style={{position:'relative',marginBottom:12}}>
          <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:16}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t('cosmetics.search')} style={{width:'100%',padding:'12px 14px 12px 38px',border:'1.5px solid #e8f4f3',borderRadius:14,fontSize:14,color:'#2d3748',background:'white',fontFamily:"'Plus Jakarta Sans',sans-serif"}}/>
        </div>
        <p style={{fontSize:11,fontWeight:700,color:'#a0aec0',margin:'0 0 6px',textTransform:'uppercase',letterSpacing:'0.08em'}}>{t('cosmetics.skinLabel')}</p>
        <div style={{display:'flex',gap:6,overflowX:'auto',paddingBottom:4,marginBottom:10}}>
          {SKINS.map(st => (
            <button key={st.key} onClick={() => setSkinF(st.key)} style={{padding:'7px 13px',borderRadius:100,border:'1.5px solid',borderColor:skinF===st.key?st.color:'#e8f4f3',background:skinF===st.key?st.color:'white',color:skinF===st.key?'white':'#718096',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:"'Plus Jakarta Sans',sans-serif",transition:'all 0.2s',flexShrink:0}}>
              {st.emoji} {st.label}
            </button>
          ))}
        </div>
        <div style={{display:'flex',gap:6,overflowX:'auto',marginBottom:14,paddingBottom:4}}>
          {cats.map((c, i) => (
            <button key={i} onClick={() => setCatIdx(i)} style={{padding:'8px 14px',borderRadius:10,border:'1.5px solid #e8f4f3',fontSize:12,fontWeight:700,cursor:'pointer',whiteSpace:'nowrap',fontFamily:"'Plus Jakarta Sans',sans-serif",background:catIdx===i?'#2d3748':'white',color:catIdx===i?'white':'#718096',flexShrink:0,transition:'all 0.2s'}}>
              {c}
            </button>
          ))}
        </div>
        <p style={{fontSize:13,color:'#a0aec0',margin:'0 0 12px',fontWeight:600}}>{filtered.length} {t('cosmetics.productCount')}</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          {filtered.map(p => {
            const badge = getBadge(p)
            return (
              <div key={p.id} className="pc" onClick={() => setSel(p)} style={{background:'white',borderRadius:16,padding:'14px',border:'1px solid #e8f4f3',boxShadow:'0 2px 10px rgba(78,205,196,0.06)',cursor:'pointer',transition:'all 0.2s',position:'relative'}}>
                <div style={{width:48,height:48,borderRadius:12,background:p.color+'15',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:8}}>{p.emoji}</div>
                {badge && <div style={{position:'absolute',top:10,right:10,padding:'3px 7px',borderRadius:8,fontSize:9,fontWeight:700,background:p.color+'20',color:p.color}}>{badge}</div>}
                <p style={{fontSize:10,color:'#a0aec0',margin:'0 0 3px',fontWeight:700,textTransform:'uppercase'}}>{p.brand}</p>
                <p style={{fontSize:12,fontWeight:800,color:'#2d3748',margin:'0 0 4px',lineHeight:1.3}}>{p.name}</p>
                <p style={{fontSize:11,color:'#718096',margin:'0 0 6px',lineHeight:1.4}}>{getDesc(p)}</p>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:14,fontWeight:900,color:'#2d3748'}}>{p.price}</span>
                  <span style={{fontSize:12,color:'#FFB347',fontWeight:700}}>⭐{p.rating}</span>
                </div>
              </div>
            )
          })}
        </div>
        {sel && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:200,backdropFilter:'blur(4px)'}} onClick={() => setSel(null)}>
            <div style={{background:'white',borderRadius:'24px 24px 0 0',padding:'24px 20px 40px',width:'100%',maxWidth:430,animation:'slideUp 0.3s ease'}} onClick={e => e.stopPropagation()}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                <h3 style={{fontSize:18,fontWeight:800,color:'#2d3748',margin:0}}>{t('cosmetics.modalTitle')}</h3>
                <button onClick={() => setSel(null)} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:'#a0aec0'}}>✕</button>
              </div>
              <div style={{display:'flex',gap:14,marginBottom:16}}>
                <div style={{width:64,height:64,borderRadius:14,background:sel.color+'20',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,flexShrink:0}}>{sel.emoji}</div>
                <div>
                  <p style={{fontSize:11,color:'#a0aec0',margin:'0 0 3px',fontWeight:700,textTransform:'uppercase'}}>{sel.brand}</p>
                  <p style={{fontSize:16,fontWeight:800,color:'#2d3748',margin:'0 0 4px',lineHeight:1.3}}>{sel.name}</p>
                  <p style={{fontSize:20,fontWeight:900,color:sel.color,margin:0}}>{sel.price}</p>
                </div>
              </div>
              <p style={{fontSize:14,color:'#4a5568',lineHeight:1.6,margin:'0 0 16px'}}>{getDesc(sel)}</p>
              <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
                {sel.for.map(f => {
                  const st = SKINS.find(s => s.key === f)
                  return st ? <span key={f} style={{padding:'5px 12px',borderRadius:100,background:st.color+'15',color:st.color,fontSize:12,fontWeight:700}}>{st.emoji} {st.label}</span> : null
                })}
              </div>
              <a href={kaspiUrl(sel)} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10,width:'100%',padding:'15px',background:'#EF4444',color:'white',borderRadius:14,textDecoration:'none',fontSize:15,fontWeight:800,marginBottom:10,boxShadow:'0 4px 14px rgba(239,68,68,0.3)'}}>
                {t('cosmetics.kaspiBtn')}
              </a>
              <a href={`https://www.google.com/search?q=${encodeURIComponent(sel.name+' '+sel.brand+' buy Kazakhstan')}`} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,width:'100%',padding:'13px',background:'white',color:'#4a5568',borderRadius:14,textDecoration:'none',fontSize:13,fontWeight:700,border:'1.5px solid #e8f4f3'}}>
                {t('cosmetics.googleBtn')}
              </a>
            </div>
          </div>
        )}
        <div style={{height:80}}/>
      </div>
      <BottomNav/>
    </div>
  )
}
