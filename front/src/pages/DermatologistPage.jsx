import { useState, useEffect, useRef } from 'react'
import BottomNav from '../components/layout/BottomNav'
import PageHeader from '../components/layout/PageHeader'

const MOCK_CLINICS = [
  { id:1, name:'Дерматология клиникасы "DermaCare"', address:'Алматы, Абай даңғылы 150', phone:'+7 727 123 45 67', rating:4.8, reviews:124, distance:'0.8 км', lat:43.238, lng:76.945, open:true },
  { id:2, name:'Медицина орталығы "HealthPlus"', address:'Алматы, Достық даңғылы 89', phone:'+7 727 234 56 78', rating:4.6, reviews:89, distance:'1.2 км', lat:43.235, lng:76.952, open:true },
  { id:3, name:'Тері ауруларының клиникасы', address:'Алматы, Сейфуллин к-сі 45', phone:'+7 727 345 67 89', rating:4.9, reviews:203, distance:'2.1 км', lat:43.241, lng:76.938, open:false },
  { id:4, name:'"SkinExpert" клиникасы', address:'Алматы, Назарбаев к-сі 100', phone:'+7 727 456 78 90', rating:4.7, reviews:156, distance:'2.8 км', lat:43.232, lng:76.960, open:true },
  { id:5, name:'Косметология орталығы "Beauty"', address:'Алматы, Панфилов к-сі 20', phone:'+7 727 567 89 01', rating:4.5, reviews:67, distance:'3.2 км', lat:43.246, lng:76.942, open:true },
]

export default function DermatologistPage() {
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  const filtered = MOCK_CLINICS.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.address.toLowerCase().includes(search.toLowerCase())
    const matchOpen = !filterOpen || c.open
    return matchSearch && matchOpen
  })

  useEffect(() => {
    if (mapLoaded || mapInstanceRef.current) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      if (!mapRef.current || mapInstanceRef.current) return
      const L = window.L
      const map = L.map(mapRef.current, { zoomControl: true }).setView([43.238, 76.945], 13)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)
      mapInstanceRef.current = map

      MOCK_CLINICS.forEach(clinic => {
        const icon = L.divIcon({
          html: `<div style="background:${clinic.open ? '#4ECDC4' : '#a0aec0'};color:white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.2);border:2px solid white">🏥</div>`,
          className: '', iconSize: [32, 32], iconAnchor: [16, 16],
        })
        const marker = L.marker([clinic.lat, clinic.lng], { icon })
          .addTo(map)
          .bindPopup(`<b>${clinic.name}</b><br>${clinic.address}<br>⭐ ${clinic.rating}`)
        marker.on('click', () => setSelected(clinic))
        markersRef.current.push(marker)
      })
      setMapLoaded(true)
    }
    document.head.appendChild(script)
  }, [])

  const flyToClinic = (clinic) => {
    setSelected(clinic)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([clinic.lat, clinic.lng], 16, { duration: 1 })
    }
  }

  return (
    <div style={s.root}>
      <style>{`
        * { box-sizing:border-box; }
        .clinic-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(78,205,196,0.12)!important; }
        input:focus { outline:none; border-color:#4ECDC4!important; }
        input::placeholder { color:#b0bec5; }
        .leaflet-container { font-family:'Nunito',sans-serif!important; }
      `}</style>

      <PageHeader title="🗺️ Дерматологтар" desc="Жақын клиникаларды табыңыз" />

      <div style={s.content}>
        {/* Search */}
        <div style={s.searchRow}>
          <div style={s.searchWrap}>
            <span style={s.searchIcon}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Клиника іздеу..."
              style={s.searchInput}
            />
          </div>
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            style={{ ...s.filterBtn, background: filterOpen ? '#4ECDC4' : 'white', color: filterOpen ? 'white' : '#718096' }}>
            {filterOpen ? '🟢 Ашық' : '⚪ Барлығы'}
          </button>
        </div>

        {/* Map */}
        <div style={s.mapContainer}>
          <div ref={mapRef} style={s.map} />
          {!mapLoaded && (
            <div style={s.mapLoading}>
              <div style={s.spinner} />
              <p style={{ fontSize: 13, color: '#718096', marginTop: 10 }}>Карта жүктелуде...</p>
            </div>
          )}
        </div>

        {/* Selected clinic */}
        {selected && (
          <div style={s.selectedCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ ...s.openBadge, background: selected.open ? '#e8f8f7' : '#f8f8f8', color: selected.open ? '#4ECDC4' : '#a0aec0' }}>
                    {selected.open ? '🟢 Ашық' : '🔴 Жабық'}
                  </span>
                  <span style={s.distBadge}>📍 {selected.distance}</span>
                </div>
                <h3 style={s.clinicName}>{selected.name}</h3>
                <p style={s.clinicAddr}>📍 {selected.address}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#FFB347' }}>⭐ {selected.rating}</span>
                  <span style={{ fontSize: 12, color: '#a0aec0' }}>{selected.reviews} пікір</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#a0aec0' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <a href={`tel:${selected.phone}`} style={{ ...s.callBtn }}>
                📞 Қоңырау
              </a>
              <a
                href={`https://www.openstreetmap.org/directions?from=&to=${selected.lat}%2C${selected.lng}`}
                target="_blank" rel="noreferrer"
                style={s.routeBtn}>
                🗺️ Жол
              </a>
            </div>
          </div>
        )}

        {/* Clinics list */}
        <p style={s.listTitle}>{filtered.length} клиника табылды</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(clinic => (
            <div key={clinic.id} className="clinic-card"
              onClick={() => flyToClinic(clinic)}
              style={s.clinicCard}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ ...s.clinicIcon, background: clinic.open ? '#e8f8f7' : '#f8f8f8' }}>
                  🏥
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={s.clinicName}>{clinic.name}</h4>
                    <span style={{ ...s.openBadge, background: clinic.open ? '#e8f8f7' : '#f8f8f8', color: clinic.open ? '#4ECDC4' : '#a0aec0', flexShrink: 0, marginLeft: 8 }}>
                      {clinic.open ? 'Ашық' : 'Жабық'}
                    </span>
                  </div>
                  <p style={s.clinicAddr}>{clinic.address}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#FFB347' }}>⭐ {clinic.rating}</span>
                    <span style={{ fontSize: 11, color: '#a0aec0' }}>{clinic.reviews} пікір</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#4ECDC4' }}>📍 {clinic.distance}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ height: 80 }} />
      </div>
      <BottomNav />
    </div>
  )
}

const s = {
  root: { minHeight: '100vh', background: '#f0fafb', fontFamily: "'Nunito','SF Pro Display',-apple-system,sans-serif", maxWidth: 430, margin: '0 auto' },
  content: { padding: '16px' },
  searchRow: { display: 'flex', gap: 8, marginBottom: 14 },
  searchWrap: { flex: 1, position: 'relative' },
  searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16 },
  searchInput: { width: '100%', padding: '12px 14px 12px 38px', border: '1.5px solid #e8f4f3', borderRadius: 14, fontSize: 14, color: '#2d3748', background: 'white', fontFamily: "'Nunito',sans-serif", transition: 'all 0.2s' },
  filterBtn: { padding: '12px 14px', borderRadius: 14, border: '1.5px solid #e8f4f3', fontSize: 12, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito',sans-serif", transition: 'all 0.2s' },
  mapContainer: { borderRadius: 20, overflow: 'hidden', height: 220, marginBottom: 14, position: 'relative', border: '1px solid #e8f4f3', boxShadow: '0 4px 16px rgba(78,205,196,0.1)' },
  map: { width: '100%', height: '100%' },
  mapLoading: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'white' },
  spinner: { width: 32, height: 32, border: '3px solid #e8f4f3', borderTop: '3px solid #4ECDC4', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  selectedCard: { background: 'white', borderRadius: 20, padding: '16px', marginBottom: 14, border: '2px solid #4ECDC4', boxShadow: '0 4px 16px rgba(78,205,196,0.12)' },
  clinicName: { fontSize: 14, fontWeight: 800, color: '#2d3748', margin: '0 0 3px', fontFamily: "'Poppins',sans-serif", lineHeight: 1.3 },
  clinicAddr: { fontSize: 12, color: '#718096', margin: '0 0 4px' },
  openBadge: { padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700 },
  distBadge: { padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700, background: '#eff6ff', color: '#5DADE2' },
  callBtn: { flex: 1, padding: '12px', background: '#4ECDC4', color: 'white', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  routeBtn: { flex: 1, padding: '12px', background: 'white', color: '#718096', borderRadius: 12, textDecoration: 'none', fontSize: 13, fontWeight: 700, textAlign: 'center', border: '1.5px solid #e8f4f3', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  listTitle: { fontSize: 13, fontWeight: 700, color: '#718096', margin: '0 0 10px' },
  clinicCard: { background: 'white', borderRadius: 16, padding: '14px', border: '1px solid #e8f4f3', cursor: 'pointer', transition: 'all 0.2s' },
  clinicIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 },
}