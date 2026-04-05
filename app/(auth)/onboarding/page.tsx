'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getUser } from '@/lib/auth'
import api from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// Onboarding adaptativo por industria — estilo Airtable
// Cada pantalla se adapta a lo que el usuario seleccionó antes
// Al finalizar llama a /noh/setup y guarda industryType en el perfil
// ─────────────────────────────────────────────────────────────────────────────

const INDUSTRIES = [
  { key: 'GANADERO', label: 'Ganadería / Carne',  icon: '🐄', desc: 'Bovinos, porcinos, ovinos', color: '#b45309', bg: '#fef3e2', modules: ['Hato bovino', 'Historial vet.', 'Producción leche', 'Maquinaria'] },
  { key: 'AVICOLA',  label: 'Avicultura',          icon: '🐔', desc: 'Engorde, postura, reproductoras', color: '#dc2626', bg: '#fef2f2', modules: ['Galpones', 'Lotes de aves', 'FCR y mortalidad', 'Sanidad aviar'] },
  { key: 'PALMA',    label: 'Palma de aceite',     icon: '🌴', desc: 'FFB, extractora, laboratorio', color: '#065f46', bg: '#d1fae5', modules: ['Lotes de palma', 'Cosecha FFB', 'Extractora', 'Laboratorio'] },
  { key: 'AGRICOLA', label: 'Agricultura',         icon: '🌽', desc: 'Maíz, café, cacao, arroz', color: '#036446', bg: '#e8f5ef', modules: ['Cultivos y ciclos', 'Parcelas y lotes', 'Control plagas', 'ODS sostenibilidad'] },
  { key: 'LACTEO',   label: 'Producción láctea',   icon: '🥛', desc: 'Leche, queso, derivados', color: '#185fa5', bg: '#e6f1fb', modules: ['Hato lechero', 'Producción L/día', 'Calidad leche', 'Ordeño registros'] },
  { key: 'MIXTO',    label: 'Operación mixta',     icon: '🏡', desc: 'Varios sectores productivos', color: '#6d28d9', bg: '#ede9fe', modules: ['Todos los módulos', 'IA adaptativa', 'Dashboard multi-sector'] },
]

const SUB_INDUSTRIES: Record<string, { key: string; label: string; desc: string }[]> = {
  GANADERO: [
    { key: 'cria',      label: 'Cría y levante',     desc: 'Producción de terneros y recría' },
    { key: 'ceba',      label: 'Ceba / Engorde',      desc: 'Engorde bovino para carne' },
    { key: 'doble',     label: 'Doble propósito',     desc: 'Carne y leche simultáneamente' },
    { key: 'bufalino',  label: 'Bufalino',            desc: 'Búfalos de agua' },
  ],
  AVICOLA: [
    { key: 'engorde',   label: 'Pollo de engorde',    desc: 'Producción de carne aviar' },
    { key: 'postura',   label: 'Gallina de postura',  desc: 'Producción de huevo' },
    { key: 'reproduct', label: 'Reproductoras',       desc: 'Producción de pollito de 1 día' },
    { key: 'pavo',      label: 'Pavo / Codorniz',     desc: 'Otras especies avícolas' },
  ],
  PALMA: [
    { key: 'extractora',label: 'Con extractora propia', desc: 'Proceso completo FFB → aceite' },
    { key: 'sin_extr',  label: 'Solo producción FFB',   desc: 'Venta de fruto fresco' },
    { key: 'vivero',    label: 'Con vivero',            desc: 'Producción de material vegetal' },
  ],
  AGRICOLA: [
    { key: 'cafe',      label: 'Café / Cacao',        desc: 'Cultivos de exportación' },
    { key: 'cereales',  label: 'Cereales',            desc: 'Maíz, arroz, sorgo' },
    { key: 'hortalizas',label: 'Hortalizas',          desc: 'Tomate, pimentón, lechuga' },
    { key: 'frutales',  label: 'Frutales',            desc: 'Aguacate, cítricos, banano' },
  ],
}

const SIZES: Record<string, { key: string; label: string }[]> = {
  GANADERO: [
    { key: 'pequeno', label: '1 — 50 animales' },
    { key: 'mediano', label: '51 — 200 animales' },
    { key: 'grande',  label: '201 — 500 animales' },
    { key: 'empresa', label: '500+ animales' },
  ],
  AVICOLA: [
    { key: 'pequeno', label: 'Hasta 5,000 aves' },
    { key: 'mediano', label: '5,001 — 20,000 aves' },
    { key: 'grande',  label: '20,001 — 100,000 aves' },
    { key: 'empresa', label: '100,000+ aves' },
  ],
  PALMA: [
    { key: 'pequeno', label: 'Hasta 50 ha' },
    { key: 'mediano', label: '51 — 200 ha' },
    { key: 'grande',  label: '201 — 500 ha' },
    { key: 'empresa', label: '500+ ha' },
  ],
  AGRICOLA: [
    { key: 'pequeno', label: 'Hasta 20 ha' },
    { key: 'mediano', label: '21 — 100 ha' },
    { key: 'grande',  label: '101 — 500 ha' },
    { key: 'empresa', label: '500+ ha' },
  ],
}

function NohAvatar() {
  return (
    <div style={{ width:'40px', height:'40px', borderRadius:'50%', background:'#036446', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:'700', color:'white', flexShrink:0, fontFamily:'monospace' }}>N</div>
  )
}

const NOH_MESSAGES: Record<number, string> = {
  1: 'Hola! Soy NOH, tu asistente agroindustrial. Para configurar PRAIRON correctamente para ti, necesito saber: ¿cuál es tu tipo de producción principal?',
  2: 'Perfecto. Ahora dime un poco más sobre tu operación para activar los módulos exactos que necesitas.',
  3: 'Excelente. Cuéntame sobre tu operación principal — esto configura tu dashboard y precarga datos específicos.',
  4: 'Ya casi. ¿Cómo está estructurado tu equipo? Esto configura los roles y permisos automáticamente.',
  5: 'Listo. PRAIRON está configurado para tu operación. ¡Bienvenido!',
}

export default function OnboardingPage() {
  const router  = useRouter()
  const user    = getUser()
  const nombre  = user?.name?.split(' ')[0] || 'productor'

  const [step,      setStep]      = useState(1)
  const [typing,    setTyping]    = useState(true)
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState<any>(null)

  const [industry,  setIndustry]  = useState('')
  const [subInd,    setSubInd]    = useState('')
  const [size,      setSize]      = useState('')
  const [farmName,  setFarmName]  = useState('')
  const [farmArea,  setFarmArea]  = useState('')
  const [location,  setLocation]  = useState('')
  const [teamSize,  setTeamSize]  = useState('1')

  useEffect(() => {
    setTyping(true)
    const t = setTimeout(() => setTyping(false), 900)
    return () => clearTimeout(t)
  }, [step])

  const industryData  = INDUSTRIES.find(i => i.key === industry)
  const subOptions    = SUB_INDUSTRIES[industry] || []
  const sizeOptions   = SIZES[industry] || SIZES.GANADERO

  async function handleFinish() {
    setLoading(true)
    try {
      // Mapeo de keys del onboarding a industryType del backend
      const INDUSTRY_MAP: Record<string, string> = {
        GANADERO: 'ganadero',
        AVICOLA:  'avicola',
        PALMA:    'palma',
        AGRICOLA: 'agricultura',
        LACTEO:   'ganadero',
        MIXTO:    'mixta',
      }
      const productionType = INDUSTRY_MAP[industry] || 'mixta'

      await api.post('/noh/setup', {
        productionType,
        farmName:     farmName || user?.companyName || 'Mi Operación',
        farmArea:     parseFloat(farmArea) || 0,
        farmLocation: location,
        teamSize:     parseInt(teamSize) || 1,
      })

      // Actualizar el perfil local con el industryType para que el sidebar
      // se adapte inmediatamente sin necesidad de re-login
      const savedUser = JSON.parse(localStorage.getItem('prairon_user') || '{}')
      savedUser.industryType = industry
      localStorage.setItem('prairon_user', JSON.stringify(savedUser))
      setResult({ industry, subInd, size })
      setStep(5)
    } catch (e) {
      console.error(e)
      setStep(5)
    } finally { setLoading(false) }
  }

  const stepLabels = ['Industria', 'Sub-sector', 'Operación', 'Equipo', 'Listo']

  return (
    <div style={{ minHeight:'100vh', background:'#f9f9f7', display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', fontFamily:'Figtree, sans-serif' }}>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}} @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .step-in{animation:fadein .3s ease}`}</style>

      <div style={{ width:'100%', maxWidth:'640px' }}>
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ fontSize:'11px', color:'#9b9b97', letterSpacing:'.1em', fontWeight:'500', marginBottom:'2px' }}>PRAIRON</div>
          <div style={{ fontSize:'10px', color:'#0dac5e', fontWeight:'500', letterSpacing:'.06em' }}>Configuración inicial</div>
        </div>

        <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'20px', overflow:'hidden' }}>

          {/* Progress */}
          <div style={{ padding:'16px 24px', borderBottom:'0.5px solid #e5e5e3' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
              {stepLabels.map((lbl, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:'6px', flex: i < stepLabels.length - 1 ? 1 : 'none' }}>
                  <div style={{ width:'26px', height:'26px', borderRadius:'50%', background: i+1 < step ? '#036446' : i+1 === step ? '#036446' : '#e5e5e3', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:'500', color: i+1 <= step ? 'white' : '#9b9b97', transition:'all .3s', flexShrink:0, boxShadow: i+1 === step ? '0 0 0 3px #a7f3d0' : 'none' }}>
                    {i+1 < step ? '✓' : i+1}
                  </div>
                  {i < stepLabels.length - 1 && <div style={{ flex:1, height:'2px', background: i+1 < step ? '#036446' : '#e5e5e3', borderRadius:'1px', transition:'background .3s' }} />}
                </div>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              {stepLabels.map((lbl, i) => (
                <div key={i} style={{ fontSize:'9px', color: i+1 === step ? '#036446' : '#9b9b97', fontWeight: i+1 === step ? '600' : '400', letterSpacing:'.04em', width: i < stepLabels.length-1 ? 'auto' : 'auto' }}>{lbl.toUpperCase()}</div>
              ))}
            </div>
          </div>

          {/* NOH bubble */}
          <div style={{ padding:'20px 24px', borderBottom:'0.5px solid #e5e5e3', display:'flex', gap:'12px', alignItems:'flex-start', background:'linear-gradient(160deg,#e8f5ef 0%,#f9f9f7 100%)' }}>
            <NohAvatar />
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'12px', fontWeight:'500', color:'#036446', marginBottom:'6px' }}>NOAH</div>
              {typing ? (
                <div style={{ display:'flex', gap:'4px', alignItems:'center', padding:'10px 14px', background:'#fff', borderRadius:'12px', width:'fit-content', border:'0.5px solid #e5e5e3' }}>
                  {[0,1,2].map(i => <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#9b9b97', animation:'pulse 1.2s ease-in-out infinite', animationDelay:`${i*.2}s` }} />)}
                </div>
              ) : (
                <div style={{ fontSize:'14px', color:'#1a1a18', lineHeight:1.6, padding:'12px 16px', background:'#fff', borderRadius:'12px', border:'0.5px solid #e5e5e3' }}>
                  {step === 1 ? `¡Hola ${nombre}! ${NOH_MESSAGES[1]}` : NOH_MESSAGES[step]}
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          {!typing && (
            <div className="step-in" style={{ padding:'24px' }}>

              {/* PASO 1 — INDUSTRIA */}
              {step === 1 && (
                <div>
                  <div style={{ fontSize:'11px', fontWeight:'600', color:'#9b9b97', letterSpacing:'.08em', marginBottom:'14px' }}>SELECCIONA TU TIPO DE PRODUCCIÓN</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
                    {INDUSTRIES.map(ind => (
                      <button key={ind.key} onClick={() => setIndustry(ind.key)}
                        style={{ padding:'16px', border:`1.5px solid ${industry===ind.key ? ind.color : '#e5e5e3'}`, borderRadius:'12px', background: industry===ind.key ? ind.bg : '#fff', cursor:'pointer', textAlign:'left', transition:'all .15s', fontFamily:'inherit' }}>
                        <div style={{ fontSize:'24px', marginBottom:'8px' }}>{ind.icon}</div>
                        <div style={{ fontSize:'13px', fontWeight:'600', color: industry===ind.key ? ind.color : '#1a1a18', marginBottom:'3px' }}>{ind.label}</div>
                        <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'8px' }}>{ind.desc}</div>
                        {industry===ind.key && (
                          <div style={{ display:'flex', flexWrap:'wrap', gap:'4px' }}>
                            {ind.modules.map(m => <span key={m} style={{ fontSize:'10px', padding:'2px 6px', borderRadius:'10px', background: ind.bg, color: ind.color, border:`0.5px solid ${ind.color}40` }}>{m}</span>)}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setStep(2)} disabled={!industry}
                    style={{ width:'100%', padding:'12px', background: industry ? '#036446' : '#e5e5e3', color: industry ? 'white' : '#9b9b97', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor: industry ? 'pointer' : 'not-allowed', fontFamily:'inherit' }}>
                    Continuar con {industryData?.label || '...'} →
                  </button>
                </div>
              )}

              {/* PASO 2 — SUB-INDUSTRIA */}
              {step === 2 && (
                <div>
                  <div style={{ fontSize:'11px', fontWeight:'600', color:'#9b9b97', letterSpacing:'.08em', marginBottom:'14px' }}>ESPECIFICA TU TIPO DE OPERACIÓN</div>
                  {subOptions.length > 0 ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px', marginBottom:'16px' }}>
                      {subOptions.map(s => (
                        <button key={s.key} onClick={() => setSubInd(s.key)}
                          style={{ padding:'14px 16px', border:`1.5px solid ${subInd===s.key ? '#036446' : '#e5e5e3'}`, borderRadius:'10px', background: subInd===s.key ? '#e8f5ef' : '#fff', cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', fontFamily:'inherit' }}>
                          <div style={{ width:'10px', height:'10px', borderRadius:'50%', border:`2px solid ${subInd===s.key ? '#036446' : '#e5e5e3'}`, background: subInd===s.key ? '#036446' : 'transparent', flexShrink:0, transition:'all .15s' }} />
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:'500', color: subInd===s.key ? '#036446' : '#1a1a18' }}>{s.label}</div>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>{s.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding:'20px', background:'#e8f5ef', borderRadius:'8px', fontSize:'13px', color:'#036446', marginBottom:'16px' }}>
                      Operación mixta seleccionada — todos los módulos estarán disponibles.
                    </div>
                  )}
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => setStep(1)} style={{ padding:'12px 20px', border:'0.5px solid #e5e5e3', borderRadius:'8px', background:'transparent', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>← Atrás</button>
                    <button onClick={() => setStep(3)} disabled={subOptions.length > 0 && !subInd}
                      style={{ flex:1, padding:'12px', background: (subOptions.length === 0 || subInd) ? '#036446' : '#e5e5e3', color: (subOptions.length === 0 || subInd) ? 'white' : '#9b9b97', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor: (subOptions.length === 0 || subInd) ? 'pointer' : 'not-allowed', fontFamily:'inherit' }}>
                      Continuar →
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 3 — OPERACIÓN */}
              {step === 3 && (
                <div>
                  <div style={{ fontSize:'11px', fontWeight:'600', color:'#9b9b97', letterSpacing:'.08em', marginBottom:'14px' }}>DATOS DE TU OPERACIÓN</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                    <div style={{ gridColumn:'span 2' }}>
                      <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE DE LA FINCA / EMPRESA</label>
                      <input value={farmName} onChange={e => setFarmName(e.target.value)} placeholder="Hacienda El Progreso"
                        style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                        onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ÁREA (hectáreas)</label>
                      <input type="number" value={farmArea} onChange={e => setFarmArea(e.target.value)} placeholder="0" min="0"
                        style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                        onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'} />
                    </div>
                    <div>
                      <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UBICACIÓN</label>
                      <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Córdoba, Colombia"
                        style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit' }}
                        onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'} />
                    </div>
                  </div>
                  <div style={{ marginBottom:'16px' }}>
                    <div style={{ fontSize:'11px', fontWeight:'600', color:'#9b9b97', letterSpacing:'.08em', marginBottom:'10px' }}>TAMAÑO DE LA OPERACIÓN</div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                      {sizeOptions.map(s => (
                        <button key={s.key} onClick={() => setSize(s.key)}
                          style={{ padding:'10px', border:`1.5px solid ${size===s.key ? '#036446' : '#e5e5e3'}`, borderRadius:'8px', background: size===s.key ? '#e8f5ef' : '#fff', cursor:'pointer', fontSize:'12px', fontWeight: size===s.key ? '500' : '400', color: size===s.key ? '#036446' : '#1a1a18', fontFamily:'inherit' }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => setStep(2)} style={{ padding:'12px 20px', border:'0.5px solid #e5e5e3', borderRadius:'8px', background:'transparent', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>← Atrás</button>
                    <button onClick={() => setStep(4)} disabled={!farmName}
                      style={{ flex:1, padding:'12px', background: farmName ? '#036446' : '#e5e5e3', color: farmName ? 'white' : '#9b9b97', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor: farmName ? 'pointer' : 'not-allowed', fontFamily:'inherit' }}>
                      Continuar →
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 4 — EQUIPO */}
              {step === 4 && (
                <div>
                  <div style={{ fontSize:'11px', fontWeight:'600', color:'#9b9b97', letterSpacing:'.08em', marginBottom:'14px' }}>ESTRUCTURA DEL EQUIPO</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'20px' }}>
                    {[{ label:'Solo yo', val:'1' }, { label:'2 – 5', val:'3' }, { label:'6 – 15', val:'8' }, { label:'16+', val:'20' }].map(opt => (
                      <button key={opt.val} onClick={() => setTeamSize(opt.val)}
                        style={{ padding:'14px 8px', border:`1.5px solid ${teamSize===opt.val ? '#036446' : '#e5e5e3'}`, borderRadius:'8px', background: teamSize===opt.val ? '#e8f5ef' : '#fff', cursor:'pointer', fontSize:'13px', fontWeight: teamSize===opt.val ? '500' : '400', color: teamSize===opt.val ? '#036446' : '#1a1a18', fontFamily:'inherit' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ background:'#f9f9f7', borderRadius:'8px', padding:'14px', marginBottom:'16px' }}>
                    <div style={{ fontSize:'11px', fontWeight:'500', color:'#9b9b97', marginBottom:'8px' }}>ROLES QUE SE ACTIVARÁN</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {['Dueño', 'Gerente', 'Supervisor', industry==='AVICOLA' ? 'Técnico avícola' : industry==='PALMA' ? 'Ingeniero agrónomo' : 'Veterinario', 'Contador', 'Trabajador de campo'].map(r => (
                        <span key={r} style={{ fontSize:'11px', padding:'3px 10px', borderRadius:'20px', background:'#fff', border:'0.5px solid #e5e5e3', color:'#6b6b67' }}>{r}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button onClick={() => setStep(3)} style={{ padding:'12px 20px', border:'0.5px solid #e5e5e3', borderRadius:'8px', background:'transparent', fontSize:'13px', cursor:'pointer', fontFamily:'inherit' }}>← Atrás</button>
                    <button onClick={handleFinish} disabled={loading}
                      style={{ flex:1, padding:'12px', background: loading ? '#e5e5e3' : '#036446', color: loading ? '#9b9b97' : 'white', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:'500', cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit' }}>
                      {loading ? 'Configurando PRAIRON...' : 'Finalizar configuración →'}
                    </button>
                  </div>
                </div>
              )}

              {/* PASO 5 — LISTO */}
              {step === 5 && (
                <div style={{ textAlign:'center' }}>
                  <div style={{ width:'56px', height:'56px', background:'#e8f5ef', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'24px' }}>✓</div>
                  <div style={{ fontSize:'18px', fontWeight:'500', color:'#1a1a18', marginBottom:'8px' }}>PRAIRON configurado</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'24px' }}>
                    {industryData?.label} · {farmName || 'Tu operación'} · {location || 'Colombia'}
                  </div>
                  <div style={{ background:'#e8f5ef', borderRadius:'10px', padding:'16px', marginBottom:'20px', textAlign:'left' }}>
                    <div style={{ fontSize:'11px', fontWeight:'600', color:'#036446', letterSpacing:'.06em', marginBottom:'10px' }}>MÓDULOS ACTIVADOS PARA TI</div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                      {(industryData?.modules || []).map(m => (
                        <span key={m} style={{ fontSize:'12px', padding:'4px 10px', borderRadius:'20px', background:'#fff', border:'0.5px solid #a7f3d0', color:'#036446', fontWeight:'500' }}>✓ {m}</span>
                      ))}
                      <span style={{ fontSize:'12px', padding:'4px 10px', borderRadius:'20px', background:'#fff', border:'0.5px solid #bfdbfe', color:'#185fa5', fontWeight:'500' }}>✓ NOAH IA</span>
                      <span style={{ fontSize:'12px', padding:'4px 10px', borderRadius:'20px', background:'#fff', border:'0.5px solid #c4b5fd', color:'#6d28d9', fontWeight:'500' }}>✓ ODS sostenibilidad</span>
                    </div>
                  </div>
                  <button onClick={() => router.push('/dashboard')}
                    style={{ width:'100%', padding:'14px', background:'#036446', color:'white', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:'500', cursor:'pointer', fontFamily:'inherit' }}>
                    Ir a mi dashboard →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign:'center', marginTop:'20px', fontSize:'11px', color:'#9b9b97' }}>
          PRAIRON · Agroindustrial OS · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  )
}
