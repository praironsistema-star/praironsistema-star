'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import api from '@/lib/api'
import { useI18n } from '@/lib/i18n'

interface Message {
  id: string
  text: string
  isUser: boolean
  time: string
  isTip?: boolean
}

const QUICK_QUESTIONS = [
  { label: '🌾 Mi operación',  q: 'Dame un resumen del estado actual de mi operación' },
  { label: '🐄 Animales',      q: '¿Hay animales que requieran atención veterinaria?' },
  { label: '📦 Stock crítico', q: '¿Qué ítems del inventario están por debajo del mínimo?' },
  { label: '✅ Tareas hoy',    q: '¿Cuáles son las tareas más urgentes de hoy?' },
  { label: '�� ODS',          q: '¿Qué acciones ODS me recomiendas para esta semana?' },
  { label: '💡 Cultivos',     q: 'Dame un consejo agronómico para mejorar mis cultivos' },
]

const FALLBACK: Record<string, string> = {
  'resumen':    'Para ver el resumen de tu operación ve al Dashboard principal.',
  'enferm':     'Cuando un animal enferma: aíslalo, ve a Animales en PRAIRON y agrega un registro veterinario.',
  'inventario': 'Para revisar el stock crítico ve al módulo Inventario. Los ítems en rojo necesitan reposición urgente.',
  'tarea':      'Las tareas pendientes están en el módulo Tareas. Puedes filtrar por estado y completarlas con un clic.',
  'ods':        'Ve al módulo ODS para ver tus indicadores activos y tareas de sostenibilidad.',
  'cultivo':    'Para consejos agrícolas revisa el módulo Cultivos.',
  'maíz':       'El maíz tecnificado tiene ciclo de 120 días. Fertilización en etapa V6 y control de plagas en VT.',
  'café':       'Para café: 2500 plantas/ha, podas cada 2 años, abono en época de lluvia.',
  'palma':      'La palma requiere control de efluentes. Registra en ODS para cumplimiento de sostenibilidad.',
  'vacun':      'Plan bovino Colombia: Aftosa cada 6 meses, Brucela en hembras jóvenes, Carbón sintomático anual.',
  'leche':      'Para aumentar producción láctea: concentrado de alta energía, agua fresca, reducir estrés.',
  'default':    'Soy NOAH, el asistente agroindustrial de PRAIRON. ¿En qué te ayudo?',
}

const TIP_KEYWORDS = ['consejo','recomend','cultiv','palma','café','maíz','arroz','vacun','fertiliz','plaga','cosecha','siembra','ods']

function getFallback(text: string): string {
  const lower = text.toLowerCase()
  for (const [key, resp] of Object.entries(FALLBACK)) {
    if (key !== 'default' && lower.includes(key)) return resp
  }
  return FALLBACK.default
}

function isTipMessage(text: string): boolean {
  return TIP_KEYWORDS.some(k => text.toLowerCase().includes(k))
}

function getPose(typing: boolean, lastMsg: Message | null, isWelcome: boolean): string {
  if (isWelcome)         return '/images/noh-welcome.png'
  if (typing)            return '/images/noh-thinking.png'
  if (lastMsg?.isTip)    return '/images/noh-tip.png'
  return '/images/noh-idle.png'
}

export default function NohAssistant() {
  const { t } = useI18n()
  const welcomeMsg: Message = {
    id: '0',
    text: '¡Hola! Soy NOAH 👨‍�� tu asistente agroindustrial de PRAIRON. ¿En qué te ayudo hoy?',
    isUser: false,
    time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
  }

  const [messages, setMessages]     = useState<Message[]>([welcomeMsg])
  const [input, setInput]           = useState('')
  const [typing, setTyping]         = useState(false)
  const [floatY, setFloatY]         = useState(0)
  const [isWelcome, setIsWelcome]   = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef       = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let frame: number
    let start: number
    const animate = (ts: number) => {
      if (!start) start = ts
      setFloatY(Math.sin((ts - start) / 1800) * 5)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setIsWelcome(false), 3000)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const lastNohMsg  = [...messages].reverse().find(m => !m.isUser) ?? null
  const currentPose = getPose(typing, lastNohMsg, isWelcome)

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || typing) return
    setInput('')
    setIsWelcome(false)

    setMessages(prev => [...prev, {
      id: Date.now().toString(), text: trimmed, isUser: true,
      time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
    }])
    setTyping(true)

    try {
      const res   = await api.post('/noh/chat', { message: trimmed })
      const reply = res.data?.response || res.data?.message || getFallback(trimmed)
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'r', text: reply, isUser: false,
        isTip: isTipMessage(trimmed) || isTipMessage(reply),
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      }])
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString() + 'f', text: getFallback(trimmed), isUser: false,
        isTip: isTipMessage(trimmed),
        time: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
      }])
    } finally {
      setTyping(false)
      inputRef.current?.focus()
    }
  }

  return (
    <>
      <style>{`
        @keyframes noah-msg  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes noah-dot  { 0%,60%,100%{opacity:0.2} 30%{opacity:1} }
        @keyframes noah-glow { 0%,100%{box-shadow:0 0 0 0 rgba(3,100,70,0.15)} 50%{box-shadow:0 0 0 6px rgba(3,100,70,0)} }
        @keyframes noah-pose { from{opacity:0;transform:scale(0.95) translateY(4px)} to{opacity:1;transform:scale(1) translateY(0)} }
        .noah-msg  { animation: noah-msg 0.25s ease }
        .noah-pose { animation: noah-pose 0.4s ease }
        .noah-dot  { width:6px;height:6px;border-radius:50%;background:#9b9b97;display:inline-block }
        .noah-dot:nth-child(1){animation:noah-dot 1.2s ease infinite 0s}
        .noah-dot:nth-child(2){animation:noah-dot 1.2s ease infinite 0.2s}
        .noah-dot:nth-child(3){animation:noah-dot 1.2s ease infinite 0.4s}
        .noah-quick:hover { border-color:#036446 !important; color:#036446 !important; background:#e8f5ef !important }
        .noah-input:focus { border-color:#036446 !important; outline:none }
        .noah-send:hover  { background:#024d36 !important }
        .noah-scroll::-webkit-scrollbar { width:4px }
        .noah-scroll::-webkit-scrollbar-thumb { background:#e5e5e3;border-radius:4px }
      `}</style>

      <div style={{
        width: '320px', minWidth: '320px', height: '100vh',
        position: 'sticky', top: 0,
        borderLeft: '0.5px solid var(--border-color, #e5e5e3)',
        background: 'var(--bg-primary, #ffffff)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden', flexShrink: 0,
      }}>

        {/* Header con personaje */}
        <div style={{
          padding: '12px 16px 0',
          background: 'linear-gradient(180deg, #e8f5ef 0%, #ffffff 100%)',
          borderBottom: '0.5px solid #e5e5e3',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}>
          <div key={currentPose} className="noah-pose" style={{
            transform: `translateY(${floatY}px)`,
            transition: 'transform 0.1s ease-out',
            width: '120px', height: '120px', position: 'relative',
            filter: 'drop-shadow(0 8px 20px rgba(3,100,70,0.2))',
          }}>
            <Image src={currentPose} alt="NOAH" width={120} height={120}
              style={{ objectFit: 'contain', width: '100%', height: '100%' }} priority />
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '10px' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#1a1a18', letterSpacing: '-.2px' }}>
              NOAH
            </div>
            <div style={{ fontSize: '10px', color: '#9b9b97', marginBottom: '4px' }}>
              {t('common.noah_subtitle')}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0dac5e', animation: 'noah-glow 2s ease infinite' }} />
              <span style={{ fontSize: '11px', color: '#0dac5e', fontWeight: '600' }}>
                {typing ? t('common.noah_thinking') : isWelcome ? t('common.noah_welcome_status') : t('common.noah_online')}
              </span>
            </div>
          </div>
        </div>

        {/* Preguntas rápidas */}
        <div style={{ padding: '8px 12px', borderBottom: '0.5px solid #f0f0ee', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {QUICK_QUESTIONS.map(q => (
            <button key={q.label} className="noah-quick" onClick={() => sendMessage(q.q)}
              style={{
                fontSize: '11px', padding: '4px 10px', borderRadius: '20px',
                border: '0.5px solid #e5e5e3', background: '#f9f9f7',
                cursor: 'pointer', color: '#6b6b67', transition: 'all 0.15s', fontFamily: 'inherit',
              }}>
              {q.label}
            </button>
          ))}
        </div>

        {/* Mensajes */}
        <div className="noah-scroll" style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {messages.map(msg => (
            <div key={msg.id} className="noah-msg" style={{
              display: 'flex', gap: '8px',
              flexDirection: msg.isUser ? 'row-reverse' : 'row',
              alignItems: 'flex-end',
            }}>
              {!msg.isUser && (
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: '#036446', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                  fontSize: '9px', fontWeight: '700', color: 'white',
                }}>N</div>
              )}
              <div style={{
                maxWidth: '220px', padding: '8px 11px',
                borderRadius: msg.isUser ? '12px 12px 3px 12px' : '12px 12px 12px 3px',
                background: msg.isUser ? '#036446' : msg.isTip ? '#e8f5ef' : '#f9f9f7',
                color: msg.isUser ? 'white' : '#1a1a18',
                fontSize: '12.5px', lineHeight: '1.55',
                border: msg.isUser ? 'none' : msg.isTip ? '0.5px solid #0dac5e' : '0.5px solid #e5e5e3',
              }}>
                {msg.isTip && !msg.isUser && (
                  <div style={{ fontSize: '10px', fontWeight: '700', color: '#036446', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    💡 Recomendación NOAH
                  </div>
                )}
                {msg.text}
                <div style={{
                  fontSize: '9px', marginTop: '4px',
                  color: msg.isUser ? 'rgba(255,255,255,0.55)' : '#9b9b97',
                  textAlign: msg.isUser ? 'right' : 'left',
                }}>{msg.time}</div>
              </div>
            </div>
          ))}

          {typing && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#036446', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: 'white' }}>N</div>
              <div style={{ padding: '10px 14px', background: '#f9f9f7', border: '0.5px solid #e5e5e3', borderRadius: '12px 12px 12px 3px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span className="noah-dot" /><span className="noah-dot" /><span className="noah-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '10px 12px', borderTop: '0.5px solid #e5e5e3', background: '#fafafa', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input ref={inputRef} className="noah-input" value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) sendMessage(input) }}
            {...{placeholder: t("common.noah_input_placeholder")}}
            style={{
              flex: 1, border: '0.5px solid #e5e5e3', borderRadius: '8px',
              padding: '8px 11px', fontSize: '12.5px', background: '#fff',
              color: '#1a1a18', fontFamily: 'inherit', transition: 'border-color 0.15s',
            }}
          />
          <button className="noah-send" onClick={() => sendMessage(input)}
            disabled={!input.trim() || typing}
            style={{
              width: '34px', height: '34px', borderRadius: '8px', border: 'none',
              background: input.trim() && !typing ? '#036446' : '#e5e5e3',
              color: input.trim() && !typing ? 'white' : '#9b9b97',
              cursor: input.trim() && !typing ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'background 0.15s', fontSize: '14px',
            }}>↑</button>
        </div>

        {/* Footer */}
        <div style={{ padding: '6px 12px 8px', background: '#fafafa', borderTop: '0.5px solid #f0f0ee', textAlign: 'center' }}>
          <button onClick={() => { setMessages([welcomeMsg]); setIsWelcome(true) }}
            style={{ fontSize: '11px', color: '#9b9b97', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
            Limpiar conversación
          </button>
        </div>

      </div>
    </>
  )
}
