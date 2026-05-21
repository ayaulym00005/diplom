import { useState, useRef, useEffect } from 'react'
import BottomNav from '../components/layout/BottomNav'
import PageHeader from '../components/layout/PageHeader'
import { chatAPI } from '../services/api'

const QUICK = [
  '💧 Майлы тері',
  '🔴 Безеу себебі',
  '☀️ SPF маңызды ма?',
  '✨ Ретинол не?',
  '💊 Ниацинамид',
  '🧴 Күтім тәртібі',
  '🌿 Құрғақ тері',
  '🌙 Пигментация',
]

export default function ChatPage() {
  const [messages, setMessages] = useState([{
    role: 'bot',
    text: 'Сәлем! 👋 Мен Dermiq AI ассистентімін.\n\nТері күтімі туралы кез келген сұрақ қойыңыз:\n• «Безеу неге шығады?»\n• «Майлы тері үшін қандай крем?»\n• «SPF неге керек?»\n• Немесе өз сұрағыңызды жазыңыз ✍️',
    time: now(),
  }])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  async function sendMessage(text) {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages(prev => [...prev, { role: 'user', text: trimmed, time: now() }])
    setInput('')
    setTyping(true)
    try {
      const data = await chatAPI.send(trimmed)
      setMessages(prev => [...prev, { role: 'bot', text: data.reply, time: now() }])
    } catch {
      setMessages(prev => [...prev, { role: 'bot', text: 'Қате пайда болды. Кейінірек қайталаңыз 🙏', time: now() }])
    } finally {
      setTyping(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input) }
  }

  return (
    <div style={s.root}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes blink { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        textarea:focus { outline: none; border-color: #4ECDC4!important; box-shadow: 0 0 0 3px rgba(78,205,196,0.15); }
        textarea::placeholder { color: #b0bec5; }
        .quick-btn:hover { background: #4ECDC4!important; color: white!important; border-color: #4ECDC4!important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #c8ede8; border-radius: 2px; }
        pre { white-space: pre-wrap; word-break: break-word; font-family: 'Nunito',sans-serif; margin: 0; font-size: 14px; line-height: 1.6; }
      `}</style>

      <PageHeader title="🤖 AI Ассистент" desc="Тері күтімі туралы сұраңыз" />

      <div style={s.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={{ ...s.msgWrap, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animation: 'fadeIn 0.3s ease' }}>
            {msg.role === 'bot' && <div style={s.avatar}>🤖</div>}
            <div style={{ maxWidth: '82%' }}>
              <div style={{
                ...s.bubble,
                background: msg.role === 'user' ? '#4ECDC4' : 'white',
                color: msg.role === 'user' ? 'white' : '#2d3748',
                borderBottomRightRadius: msg.role === 'user' ? 4 : 18,
                borderBottomLeftRadius: msg.role === 'bot' ? 4 : 18,
              }}>
                <pre>{msg.text}</pre>
              </div>
              <p style={{ fontSize: 10, color: '#a0aec0', margin: '3px 4px 0', textAlign: msg.role === 'user' ? 'right' : 'left' }}>{msg.time}</p>
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ ...s.msgWrap, justifyContent: 'flex-start' }}>
            <div style={s.avatar}>🤖</div>
            <div style={{ ...s.bubble, background: 'white' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ECDC4', animation: `blink 1s ease ${i * 0.2}s infinite` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '8px 16px', borderTop: '1px solid #e8f4f3', background: 'white' }}>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
          {QUICK.map((q, i) => (
            <button key={i} className="quick-btn"
              onClick={() => sendMessage(q.replace(/^[^\s]+\s/, ''))}
              style={{ padding: '7px 13px', borderRadius: 100, border: '1.5px solid #e8f4f3', background: '#f8fdfc', color: '#4a5568', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Nunito',sans-serif", flexShrink: 0, transition: 'all 0.2s' }}>
              {q}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: '10px 16px', background: 'white', borderTop: '1px solid #e8f4f3', display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Сұрағыңызды жазыңыз..."
          rows={1}
          style={{ flex: 1, padding: '12px 16px', border: '1.5px solid #e8f4f3', borderRadius: 20, fontSize: 14, color: '#2d3748', background: '#f8fdfc', resize: 'none', fontFamily: "'Nunito',sans-serif", maxHeight: 100, transition: 'all 0.2s' }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || typing}
          style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: (input.trim() && !typing) ? '#4ECDC4' : '#e8f4f3', color: (input.trim() && !typing) ? 'white' : '#a0aec0', fontSize: 18, cursor: (input.trim() && !typing) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', flexShrink: 0 }}>
          ➤
        </button>
      </div>
      <div style={{ height: 80 }} />
      <BottomNav />
    </div>
  )
}

function now() {
  return new Date().toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' })
}

const s = {
  root: { minHeight: '100vh', background: '#f0fafb', fontFamily: "'Nunito','SF Pro Display',-apple-system,sans-serif", maxWidth: 430, margin: '0 auto', display: 'flex', flexDirection: 'column' },
  messages: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 'calc(100vh - 300px)', maxHeight: 'calc(100vh - 300px)' },
  msgWrap: { display: 'flex', alignItems: 'flex-end', gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: '50%', background: '#e8f8f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 },
  bubble: { padding: '12px 16px', borderRadius: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', fontFamily: "'Nunito',sans-serif" },
}
