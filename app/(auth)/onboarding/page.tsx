'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { getUser, getToken } from '@/lib/auth'

const MODULES = [
  { id:'CAFE', label:'Caficultura', emoji:'☕' },
  { id:'PALMA', label:'Palma de aceite', emoji:'🌴' },
  { id:'AVICULTURA', label:'Avicultura', emoji:'🐔' },
  { id:'GANADERIA', label:'Ganadería', emoji:'🐄' },
  { id:'CANA', label:'Caña de azúcar', emoji:'🌾' },
  { id:'ACUICULTURA', label:'Acuicultura', emoji:'🐟' },
  { id:'APICULTURA', label:'Apicultura', emoji:'🍯' },
  { id:'CACAO', label:'Cacao', emoji:'🍫' },
  { id:'ARROZ', label:'Arroz', emoji:'🌾' },
  { id:'HORTICULTURA', label:'Horticultura', emoji:'🥬' },
  { id:'FLORICULTURA', label:'Floricultura', emoji:'💐' },
  { id:'FRUTICULTURA', label:'Fruticultura', emoji:'🍓' },
  { id:'ORGANICA', label:'Agricultura Orgánica', emoji:'🌿' },
  { id:'VIVERO', label:'Vivero Palma', emoji:'🌱' },
]

const inp: React.CSSProperties = { width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'8px', padding:'10px 14px', fontSize:'14px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7' }

export default function OnboardingPage() {
  const router = useRouter()
  const user = getUser()
  const [selected, setSelected] = useState<string[]>([])
  const [farmName, setFarmName] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggle(id: string) {
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selected.length === 0) { setError('Selecciona al menos un sector'); return }
    setLoading(true)
    setError('')
    try {
      await api.patch('/companies/industry-modules', {
        industryModules: selected,
        farmName,
        location,
      })
      // Actualizar user en localStorage con los nuevos módulos
      const stored = localStorage.getItem('prairon_user')
      if (stored) {
        const u = JSON.parse(stored)
        u.industryModules = selected
        localStorage.setItem('prairon_user', JSON.stringify(u))
      }
      router.replace('/dashboard')
    } catch {
      setError('Error al guardar. Intenta de nuevo.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#f5f5f3', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
      <div style={{ background:'#fff', borderRadius:'16px', padding:'40px', width:'100%', maxWidth:'640px', boxShadow:'0 4px 24px rgba(0,0,0,0.06)' }}>
        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'22px', fontWeight:'600', color:'#1a1a18', marginBottom:'8px' }}>
            Bienvenido a PRAIRON 🌱
          </div>
          <p style={{ fontSize:'14px', color:'#9b9b97', margin:0 }}>
            Cuéntanos sobre tu operación para personalizar tu experiencia
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom:'24px' }}>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#6b6b67', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'.04em' }}>Nombre de tu finca / empresa</label>
            <input value={farmName} onChange={e=>setFarmName(e.target.value)} style={inp} placeholder="Finca La Esperanza" required />
          </div>

          <div style={{ marginBottom:'24px' }}>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#6b6b67', marginBottom:'8px', textTransform:'uppercase', letterSpacing:'.04em' }}>Ubicación</label>
            <input value={location} onChange={e=>setLocation(e.target.value)} style={inp} placeholder="Córdoba, Colombia" />
          </div>

          <div style={{ marginBottom:'28px' }}>
            <label style={{ display:'block', fontSize:'12px', fontWeight:'600', color:'#6b6b67', marginBottom:'12px', textTransform:'uppercase', letterSpacing:'.04em' }}>
              Sectores productivos — selecciona todos los que aplican
            </label>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
              {MODULES.map(m => (
                <button key={m.id} type="button" onClick={() => toggle(m.id)} style={{
                  padding:'10px 12px', borderRadius:'8px', border: selected.includes(m.id) ? '1.5px solid #166534' : '0.5px solid #e5e5e3',
                  background: selected.includes(m.id) ? '#f0fdf4' : '#f9f9f7',
                  color: selected.includes(m.id) ? '#166534' : '#6b6b67',
                  fontSize:'12px', fontWeight: selected.includes(m.id) ? '600' : '400',
                  cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'6px',
                  transition:'all .15s'
                }}>
                  <span>{m.emoji}</span>{m.label}
                </button>
              ))}
            </div>
            {selected.length > 0 && <div style={{ fontSize:'12px', color:'#166534', marginTop:'8px', fontWeight:'500' }}>{selected.length} sector{selected.length>1?'es':''} seleccionado{selected.length>1?'s':''}</div>}
          </div>

          {error && <div style={{ fontSize:'13px', color:'#dc2626', marginBottom:'16px', padding:'10px 14px', background:'#fef2f2', borderRadius:'8px' }}>{error}</div>}

          <button type="submit" disabled={loading || selected.length===0} style={{
            width:'100%', padding:'13px', borderRadius:'10px', border:'none', cursor:'pointer',
            background: selected.length===0 ? '#e5e5e3' : '#166534',
            color: selected.length===0 ? '#9b9b97' : 'white',
            fontSize:'15px', fontWeight:'500', fontFamily:'inherit',
            transition:'background .2s'
          }}>
            {loading ? 'Guardando...' : 'Continuar al dashboard →'}
          </button>
        </form>
      </div>
    </div>
  )
}
