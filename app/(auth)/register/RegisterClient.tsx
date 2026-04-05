'use client'
import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/api'
import { login } from '@/lib/auth'

// ─────────────────────────────────────────────────────────────────────────────
// Registro PRAIRON — 6 pasos estilo Airtable
// 1. Email  2. Nombre  3. Sector  4. Operación  5. OTP + Password  6. Listo
// ─────────────────────────────────────────────────────────────────────────────

const SECTORS = [
  { key:'GANADERO', label:'Ganadería',      icon:'🐄', desc:'Bovinos, porcinos, ovinos',    color:'#b45309', bg:'#fef3e2', modules:['Hato bovino','Historial vet.','Leche/día','ODS ganadero'] },
  { key:'AVICOLA',  label:'Avicultura',     icon:'🐔', desc:'Engorde, postura, reproductoras', color:'#dc2626', bg:'#fef2f2', modules:['Galpones','Lotes de aves','FCR y mortalidad','Sanidad aviar'] },
  { key:'PALMA',    label:'Palma de aceite',icon:'🌴', desc:'FFB, extractora, laboratorio', color:'#065f46', bg:'#d1fae5', modules:['Lotes de palma','Cosecha FFB','Extractora','Laboratorio'] },
  { key:'AGRICOLA', label:'Agricultura',    icon:'🌽', desc:'Maíz, café, cacao, arroz',     color:'#036446', bg:'#e8f5ef', modules:['Cultivos y ciclos','Control plagas','ODS','Recomendaciones IA'] },
  { key:'MIXTO',    label:'Operación mixta',icon:'🏡', desc:'Varios sectores productivos',  color:'#6d28d9', bg:'#ede9fe', modules:['Todos los módulos','IA adaptativa','Multi-sector'] },
]

const SIZES = [
  { key:'pequeno', label:'1 — 50' },
  { key:'mediano', label:'51 — 200' },
  { key:'grande',  label:'201 — 500' },
  { key:'empresa', label:'500+' },
]

const inp: React.CSSProperties = {
  width:'100%', height:'42px', border:'0.5px solid #e5e5e3', borderRadius:'8px',
  padding:'0 14px', fontSize:'14px', outline:'none', fontFamily:'inherit',
  background:'#f9f9f7', boxSizing:'border-box', transition:'border-color .15s',
}

function Progress({ step }: { step: number }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'24px' }}>
      {[1,2,3,4,5].map((s, i) => (
        <div key={s} style={{ display:'flex', alignItems:'center', gap:'6px', flex: i < 4 ? 1 : 'none' }}>
          <div style={{
            width:'26px', height:'26px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'11px', fontWeight:'500', flexShrink:0, transition:'all .25s',
            background: s < step ? '#036446' : s === step ? '#036446' : '#e5e5e3',
            color: s <= step ? 'white' : '#9b9b97',
            boxShadow: s === step ? '0 0 0 3px #a7f3d0' : 'none',
          }}>
            {s < step ? '✓' : s}
          </div>
          {i < 4 && <div style={{ flex:1, height:'2px', background: s < step ? '#036446' : '#e5e5e3', borderRadius:'1px', transition:'background .25s' }} />}
        </div>
      ))}
    </div>
  )
}

function NohBubble({ text }: { text: string }) {
  const [shown, setShown] = useState(false)
  const [dots, setDots] = useState(true)
  useEffect(() => {
    setShown(false); setDots(true)
    const t = setTimeout(() => { setDots(false); setShown(true) }, 700)
    return () => clearTimeout(t)
  }, [text])
  return (
    <div style={{ display:'flex', gap:'10px', alignItems:'flex-start', marginBottom:'20px' }}>
      <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'#036446', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'white', flexShrink:0, fontFamily:'monospace' }}>N</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:'11px', fontWeight:'500', color:'#036446', marginBottom:'5px' }}>NOAH</div>
        {dots ? (
          <div style={{ display:'flex', gap:'4px', alignItems:'center', padding:'10px 14px', background:'#e8f5ef', borderRadius:'0 10px 10px 10px', width:'fit-content', border:'0.5px solid #a7f3d0' }}>
            {[0,1,2].map(i => <div key={i} style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#036446', opacity:.4, animation:'noh-pulse 1.2s ease-in-out infinite', animationDelay:`${i*.2}s` }} />)}
          </div>
        ) : shown ? (
          <div style={{ padding:'10px 14px', background:'#e8f5ef', border:'0.5px solid #a7f3d0', borderRadius:'0 10px 10px 10px', fontSize:'13px', color:'#024d36', lineHeight:1.6, animation:'noh-in .2s ease' }}>
            {text}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default function RegisterClient() {
  const router = useRouter()
  const [step,      setStep]      = useState(1)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  // Step 1
  const [email,     setEmail]     = useState('')
  // Step 2
  const [name,      setName]      = useState('')
  const [company,   setCompany]   = useState('')
  // Step 3
  const [sector,    setSector]    = useState('')
  // Step 4
  const [size,      setSize]      = useState('')
  const [location,  setLocation]  = useState('')
  // Step 5
  const [otp,       setOtp]       = useState(['','','','','',''])
  const [password,  setPassword]  = useState('')
  const [passConf,  setPassConf]  = useState('')
  const otpRefs = useRef<(HTMLInputElement|null)[]>([])

  const sectorData = SECTORS.find(s => s.key === sector)

  function handleOtp(idx: number, val: string) {
    if (!/^[0-9]?$/.test(val)) return
    const next = [...otp]; next[idx] = val; setOtp(next)
    if (val && idx < 5) otpRefs.current[idx+1]?.focus()
  }

  function handleOtpKey(idx: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx-1]?.focus()
  }

  async function sendOtp() {
    setLoading(true); setError('')
    try {
      await api.post('/auth/send-otp', { email }).catch(() => {})
    } finally { setLoading(false) }
  }

  async function handleFinish() {
    setLoading(true); setError('')
    const otpCode = otp.join('')
    if (otpCode.length < 6) { setError('Ingresa el código completo'); setLoading(false); return }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); setLoading(false); return }
    if (password !== passConf) { setError('Las contraseñas no coinciden'); setLoading(false); return }
    try {
      const SECTOR_MAP: Record<string,string> = {
        GANADERO:'ganadero', AVICOLA:'avicola', PALMA:'palma', AGRICOLA:'agricultura', MIXTO:'mixta'
      }
      await api.post('/companies/setup', {
        companyName:   company || name + ' Operación',
        adminName:     name,
        adminEmail:    email,
        adminPassword: password,
        typeOfFarm:    SECTOR_MAP[sector] || 'mixta',
        location:      location || 'Colombia',
        industryType:  sector,
      })
      const user = await login(email, password)
      // Guardar industryType localmente
      const saved = JSON.parse(localStorage.getItem('prairon_user') || '{}')
      saved.industryType = sector
      localStorage.setItem('prairon_user', JSON.stringify(saved))
      setStep(6)
    } catch (e: any) {
      setError(e.response?.data?.message || 'Error en el registro. Intenta de nuevo.')
    } finally { setLoading(false) }
  }

  const nohMessages: Record<number, string> = {
    1: '¡Hola! Soy NOAH, tu asistente agroindustrial. Para empezar, ¿cuál es tu correo?',
    2: `Perfecto. ¿Cómo te llamas y cuál es el nombre de tu operación?`,
    3: `${name ? 'Hola ' + name.split(' ')[0] + ',' : ''} ¿cuál es tu sector productivo? Esto activa los módulos exactos para ti.`,
    4: `Cuéntame sobre el tamaño de tu operación para configurar tu dashboard.`,
    5: `Casi listo. Verifica tu email y crea tu contraseña.`,
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f9f9f7', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'Figtree, system-ui, sans-serif' }}>
      <style>{`
        @keyframes noh-pulse{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes noh-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes step-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .step-in{animation:step-in .25s ease both;}
        .inp-field:focus{border-color:#036446 !important;background:#fff !important;}
      `}</style>

      {step < 6 ? (
        <div style={{ width:'100%', maxWidth:'480px' }}>
          {/* Logo */}
          <a href="/" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', marginBottom:'28px', textDecoration:'none' }}>
            <div style={{ width:'28px', height:'28px', background:'#036446', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ color:'white', fontSize:'12px', fontWeight:'700' }}>P</span>
            </div>
            <span style={{ fontSize:'15px', fontWeight:'600', letterSpacing:'.06em', color:'#036446' }}>PRAIRON</span>
          </a>

          <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'20px', padding:'28px 28px 24px' }}>
            {step > 1 && <Progress step={step-1} />}
            {step > 1 && <NohBubble text={nohMessages[step] || ''} />}

            {/* PASO 1 — EMAIL */}
            {step === 1 && (
              <div className="step-in">
                <div style={{ textAlign:'center', marginBottom:'24px' }}>
                  <div style={{ fontSize:'22px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Empieza gratis hoy</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97' }}>Sin tarjeta · 14 días completos</div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
                  <div onClick={() => window.location.href = 'https://prairon-backend-1.onrender.com/auth/google'} style={{ height:'44px', border:'1px solid #dadce0', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', cursor:'pointer', background:'#fff', fontSize:'14px', color:'#3c4043', fontWeight:'500', transition:'box-shadow .15s' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow='0 1px 3px rgba(0,0,0,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow='none')}>
                    <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
                    Continuar con Google
                  </div>
                  <div style={{ height:'40px', border:'0.5px solid #e5e5e3', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', cursor:'pointer', background:'#fff', fontSize:'13px', color:'#6b6b67' }}>
                    <div style={{ width:'16px', height:'16px', borderRadius:'50%', background:'#1a1a18', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'white', fontWeight:'700' }}>A</div>
                    Continuar con Apple
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                  <div style={{ flex:1, height:'0.5px', background:'#e5e5e3' }} />
                  <span style={{ fontSize:'11px', color:'#9b9b97' }}>o con email</span>
                  <div style={{ flex:1, height:'0.5px', background:'#e5e5e3' }} />
                </div>
                <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500', letterSpacing:'.04em' }}>CORREO ELECTRÓNICO</label>
                <input className="inp-field" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && email && setStep(2)}
                  placeholder="tu@operacion.com" style={{...inp, marginBottom:'12px'}}
                  autoFocus />
                {error && <div style={{ fontSize:'12px', color:'#dc2626', marginBottom:'10px', padding:'8px 12px', background:'#fef2f2', borderRadius:'6px' }}>{error}</div>}
                <button onClick={() => { if (!email) return; setError(''); setStep(2) }} disabled={!email}
                  style={{ width:'100%', height:'44px', background: email ? '#036446' : '#e5e5e3', color: email ? 'white' : '#9b9b97', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'500', cursor: email ? 'pointer' : 'not-allowed', fontFamily:'inherit', transition:'all .15s' }}>
                  Continuar →
                </button>
                <div style={{ textAlign:'center', marginTop:'14px', fontSize:'12px', color:'#9b9b97' }}>
                  ¿Ya tienes cuenta? <Link href="/login" style={{ color:'#036446', fontWeight:'500' }}>Ingresar</Link>
                </div>
              </div>
            )}

            {/* PASO 2 — NOMBRE */}
            {step === 2 && (
              <div className="step-in">
                <div style={{ fontSize:'17px', fontWeight:'500', color:'#1a1a18', marginBottom:'16px' }}>¿Cómo te llamas?</div>
                <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500', letterSpacing:'.04em' }}>TU NOMBRE COMPLETO</label>
                <input className="inp-field" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Carlos Restrepo" style={{...inp, marginBottom:'12px'}} autoFocus />
                <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500', letterSpacing:'.04em' }}>NOMBRE DE TU EMPRESA U OPERACIÓN</label>
                <input className="inp-field" value={company} onChange={e => setCompany(e.target.value)}
                  placeholder="Hacienda El Progreso" style={{...inp, marginBottom:'16px'}} />
                {error && <div style={{ fontSize:'12px', color:'#dc2626', marginBottom:'10px', padding:'8px 12px', background:'#fef2f2', borderRadius:'6px' }}>{error}</div>}
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => setStep(1)} style={{ height:'44px', padding:'0 20px', border:'0.5px solid #e5e5e3', borderRadius:'8px', background:'transparent', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>← Atrás</button>
                  <button onClick={() => { if (!name) { setError('Ingresa tu nombre'); return } setError(''); setStep(3) }}
                    style={{ flex:1, height:'44px', background: name ? '#036446' : '#e5e5e3', color: name ? 'white' : '#9b9b97', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'500', cursor: name ? 'pointer' : 'not-allowed', fontFamily:'inherit' }}>
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 3 — SECTOR */}
            {step === 3 && (
              <div className="step-in">
                <div style={{ fontSize:'17px', fontWeight:'500', color:'#1a1a18', marginBottom:'14px' }}>Tu tipo de producción</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
                  {SECTORS.map(s => (
                    <button key={s.key} onClick={() => setSector(s.key)}
                      style={{ padding:'14px 12px', border:`1.5px solid ${sector===s.key ? s.color : '#e5e5e3'}`, borderRadius:'10px', background: sector===s.key ? s.bg : '#fff', cursor:'pointer', textAlign:'left', fontFamily:'inherit', transition:'all .15s' }}>
                      <div style={{ fontSize:'22px', marginBottom:'6px' }}>{s.icon}</div>
                      <div style={{ fontSize:'13px', fontWeight:'500', color: sector===s.key ? s.color : '#1a1a18' }}>{s.label}</div>
                      <div style={{ fontSize:'11px', color:'#9b9b97', marginTop:'2px' }}>{s.desc}</div>
                    </button>
                  ))}
                </div>
                {sector && sectorData && (
                  <div style={{ padding:'10px 12px', background:sectorData.bg, borderRadius:'8px', fontSize:'11px', color:sectorData.color, marginBottom:'12px', fontWeight:'500', animation:'noh-in .2s ease' }}>
                    {sectorData.label} seleccionado — activando {sectorData.modules.slice(0,3).join(', ')} y más
                  </div>
                )}
                {error && <div style={{ fontSize:'12px', color:'#dc2626', marginBottom:'10px', padding:'8px 12px', background:'#fef2f2', borderRadius:'6px' }}>{error}</div>}
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => setStep(2)} style={{ height:'44px', padding:'0 20px', border:'0.5px solid #e5e5e3', borderRadius:'8px', background:'transparent', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>← Atrás</button>
                  <button onClick={() => { if (!sector) { setError('Selecciona tu sector'); return } setError(''); setStep(4) }}
                    style={{ flex:1, height:'44px', background: sector ? '#036446' : '#e5e5e3', color: sector ? 'white' : '#9b9b97', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'500', cursor: sector ? 'pointer' : 'not-allowed', fontFamily:'inherit' }}>
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 4 — OPERACIÓN */}
            {step === 4 && (
              <div className="step-in">
                <div style={{ fontSize:'17px', fontWeight:'500', color:'#1a1a18', marginBottom:'14px' }}>Tu operación</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                  <div>
                    <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', letterSpacing:'.04em' }}>TAMAÑO</label>
                    <div style={{ display:'flex', flexDirection:'column', gap:'5px' }}>
                      {SIZES.map(s => (
                        <button key={s.key} onClick={() => setSize(s.key)}
                          style={{ height:'36px', border:`1.5px solid ${size===s.key ? '#036446' : '#e5e5e3'}`, borderRadius:'7px', background: size===s.key ? '#e8f5ef' : '#fff', cursor:'pointer', fontSize:'12px', fontWeight: size===s.key ? '500' : '400', color: size===s.key ? '#036446' : '#6b6b67', fontFamily:'inherit', transition:'all .15s' }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', letterSpacing:'.04em' }}>DEPARTAMENTO</label>
                    <input className="inp-field" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="Córdoba, Colombia" style={{...inp, height:'36px', fontSize:'12px'}} />
                    <div style={{ marginTop:'6px', fontSize:'11px', color:'#9b9b97', lineHeight:1.4 }}>
                      Pre-carga clima y alertas regionales
                    </div>
                  </div>
                </div>
                {error && <div style={{ fontSize:'12px', color:'#dc2626', marginBottom:'10px', padding:'8px 12px', background:'#fef2f2', borderRadius:'6px' }}>{error}</div>}
                <div style={{ display:'flex', gap:'8px' }}>
                  <button onClick={() => setStep(3)} style={{ height:'44px', padding:'0 20px', border:'0.5px solid #e5e5e3', borderRadius:'8px', background:'transparent', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>← Atrás</button>
                  <button onClick={async () => { setError(''); setStep(5); await sendOtp() }}
                    style={{ flex:1, height:'44px', background:'#036446', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'500', cursor:'pointer', fontFamily:'inherit' }}>
                    Continuar →
                  </button>
                </div>
              </div>
            )}

            {/* PASO 5 — OTP + PASSWORD */}
            {step === 5 && (
              <div className="step-in">
                <div style={{ fontSize:'17px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Verifica tu email</div>
                <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Código enviado a {email}</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:'8px', marginBottom:'20px' }}>
                  {otp.map((val, i) => (
                    <input key={i} ref={el => { otpRefs.current[i] = el }}
                      value={val} maxLength={1} inputMode="numeric"
                      onChange={e => handleOtp(i, e.target.value)}
                      onKeyDown={e => handleOtpKey(i, e)}
                      style={{ height:'52px', border:`1.5px solid ${val ? '#036446' : '#e5e5e3'}`, borderRadius:'8px', textAlign:'center', fontSize:'22px', fontWeight:'500', color:'#036446', background: val ? '#e8f5ef' : '#f9f9f7', outline:'none', fontFamily:'monospace', width:'100%', boxSizing:'border-box', transition:'all .15s' }} />
                  ))}
                </div>
                <div style={{ background:'#f9f9f7', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'14px', marginBottom:'14px' }}>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', letterSpacing:'.04em' }}>CREA TU CONTRASEÑA</label>
                  <input className="inp-field" type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres" style={{...inp, marginBottom:'8px', background:'#fff'}} />
                  <input className="inp-field" type="password" value={passConf} onChange={e => setPassConf(e.target.value)}
                    placeholder="Confirmar contraseña" style={{...inp, background:'#fff'}} />
                </div>
                {error && <div style={{ fontSize:'12px', color:'#dc2626', marginBottom:'10px', padding:'8px 12px', background:'#fef2f2', borderRadius:'6px' }}>{error}</div>}
                <button onClick={handleFinish} disabled={loading}
                  style={{ width:'100%', height:'44px', background: loading ? '#e5e5e3' : '#036446', color: loading ? '#9b9b97' : 'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'500', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                  {loading ? 'Creando tu cuenta...' : 'Crear mi cuenta →'}
                </button>
                <div style={{ textAlign:'center', marginTop:'10px', fontSize:'11px', color:'#9b9b97' }}>
                  ¿No llegó el código? <span onClick={sendOtp} style={{ color:'#036446', cursor:'pointer', fontWeight:'500' }}>Reenviar</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ textAlign:'center', marginTop:'20px', fontSize:'11px', color:'#9b9b97' }}>
            Al registrarte aceptas los <span style={{ color:'#036446', cursor:'pointer' }}>Términos de servicio</span> y la <span style={{ color:'#036446', cursor:'pointer' }}>Política de privacidad</span>
          </div>
        </div>
      ) : (
        /* PASO 6 — LISTO */
        <div style={{ width:'100%', maxWidth:'480px' }} className="step-in">
          <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'20px', padding:'32px 28px', textAlign:'center' }}>
            <div style={{ width:'60px', height:'60px', background:'#e8f5ef', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'26px' }}>✓</div>
            <div style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>
              Bienvenido{name ? ', ' + name.split(' ')[0] : ''}
            </div>
            <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'24px' }}>
              {company || 'Tu operación'} · {sectorData?.label} · {location || 'Colombia'}
            </div>

            {sectorData && (
              <div style={{ background:sectorData.bg, borderRadius:'10px', padding:'14px', marginBottom:'16px', textAlign:'left' }}>
                <div style={{ fontSize:'11px', fontWeight:'600', color:sectorData.color, letterSpacing:'.06em', marginBottom:'8px' }}>ACTIVADO PARA TI</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'5px' }}>
                  {sectorData.modules.map(m => (
                    <span key={m} style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', background:'#fff', border:`0.5px solid ${sectorData.color}50`, color:sectorData.color, fontWeight:'500' }}>✓ {m}</span>
                  ))}
                  <span style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', background:'#fff', border:'0.5px solid #bfdbfe', color:'#185fa5', fontWeight:'500' }}>✓ NOAH IA</span>
                </div>
              </div>
            )}

            <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', border:'0.5px solid #a7f3d0', borderRadius:'10px', background:'#e8f5ef', marginBottom:'20px', textAlign:'left' }}>
              <div style={{ width:'32px', height:'32px', background:'#036446', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:'700', color:'white', flexShrink:0, fontFamily:'monospace' }}>N</div>
              <div style={{ fontSize:'12px', color:'#024d36', lineHeight:1.5 }}>
                {`"Hola ${name?.split(' ')[0] || 'productor'}, ya configuré PRAIRON para ${company || 'tu operación'}. ¿Empezamos registrando tu primera ${sectorData?.key === 'AVICOLA' ? 'galpón' : sectorData?.key === 'PALMA' ? 'lote de palma' : 'finca'}?"`}
              </div>
            </div>

            <button onClick={() => router.push('/onboarding')}
              style={{ width:'100%', height:'46px', background:'#036446', color:'white', border:'none', borderRadius:'10px', fontSize:'14px', fontWeight:'500', cursor:'pointer', fontFamily:'inherit', marginBottom:'8px' }}>
              Ir a mi dashboard →
            </button>
            <div style={{ fontSize:'11px', color:'#9b9b97' }}>O <span onClick={() => router.push('/dashboard')} style={{ color:'#036446', cursor:'pointer' }}>saltar por ahora</span></div>
          </div>
        </div>
      )}
    </div>
  )
}
