'use client'
import { IndustryGuard } from '@/components/IndustryGuard'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'

const ESPECIES = ['bovino_carne','bovino_leche','porcino','ovino','caprino','equino','otro']
const RAZAS: Record<string,string[]> = {
  bovino_carne: ['Brahman','Angus','Hereford','Simmental','Gyr','Romosinuano','Blanco Orejinegro','Criollo'],
  bovino_leche: ['Holstein','Jersey','Pardo Suizo','Normando','Ayrshire','Girolando'],
  porcino: ['Landrace','Yorkshire','Duroc','Pietrain','Criollo'],
  ovino: ['Dorper','Pelibuey','Katahdin','Santa Inés','Criollo'],
  caprino: ['Nubia','Boer','Alpino','Saanen','Criollo'],
  equino: ['Criollo colombiano','Paso fino','Cuarto de milla','Árabe'],
  otro: ['Otro'],
}
const TIPOS_VET = ['vacuna','desparasitacion','tratamiento','diagnostico','cirugia']
const inp: React.CSSProperties = { width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7' }

function GanaderiaPage() {
  const [tab, setTab] = useState('dashboard')
  const [animals, setAnimals] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [animalModal, setAnimalModal] = useState(false)
  const [vetModal, setVetModal] = useState(false)
  const [selAnimal, setSelAnimal] = useState<any>(null)
  const [animalForm, setAnimalForm] = useState({
    tag:'', name:'', species:'bovino_carne', breed:'Brahman', sex:'macho',
    birthDate:'', currentWeight:'', status:'sano', notes:''
  })
  const [vetForm, setVetForm] = useState({
    type:'vacuna', date: new Date().toISOString().split('T')[0],
    description:'', product:'', dose:'', nextDate:'', cost:''
  })

  async function loadAll() {
    setLoading(true)
    try {
      const [a, s] = await Promise.allSettled([api.get('/animals'), api.get('/animals/health-summary')])
      if (a.status === 'fulfilled') setAnimals(a.value.data ?? [])
      if (s.status === 'fulfilled') setSummary(s.value.data)
    } finally { setLoading(false) }
  }
  useEffect(() => { loadAll() }, [])

  async function saveAnimal(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/animals', {
        ...animalForm,
        currentWeight: animalForm.currentWeight ? parseFloat(animalForm.currentWeight) : null,
        birthDate: animalForm.birthDate || null
      })
      setAnimalModal(false); loadAll(); toastSuccess('Animal registrado')
    } catch { toastError('Error al registrar animal') }
  }

  async function saveVet(e: React.FormEvent) {
    e.preventDefault()
    if (!selAnimal) return
    try {
      await api.post('/animals/vet-records', {
        animalId: selAnimal.id,
        ...vetForm,
        cost: vetForm.cost ? parseFloat(vetForm.cost) : null
      })
      setVetModal(false); toastSuccess('Registro veterinario guardado')
    } catch { toastError('Error al guardar registro') }
  }

  async function deleteAnimal(id: string, tag: string) {
    if (!confirm(`¿Eliminar animal ${tag}?`)) return
    try {
      await api.delete(`/animals/${id}`)
      loadAll(); toastSuccess('Animal eliminado')
    } catch { toastError('Error al eliminar') }
  }

  const sanos = animals.filter(a => a.status === 'sano').length
  const enTratamiento = animals.filter(a => a.status === 'en_tratamiento').length
  const bovinos = animals.filter(a => a.species?.startsWith('bovino')).length

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Ganadería 🐄</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Inventario animal, pesajes, sanidad y reproducción</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {tab === 'inventario' && <button onClick={() => setAnimalModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#854d0e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Animal</button>}
        </div>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','inventario','sanidad'].map(t => <button key={t} onClick={() => setTab(t)} style={{ fontSize:'13px', padding:'8px 16px', background:'none', border:'none', borderBottom: tab===t ? '2px solid #854d0e' : '2px solid transparent', color: tab===t ? '#854d0e' : '#9b9b97', cursor:'pointer', fontWeight: tab===t ? '500' : '400', textTransform:'capitalize' }}>{t}</button>)}
      </div>

      {loading ? <div style={{ color:'#9b9b97', fontSize:'13px' }}>Cargando...</div> : (
        <>
          {tab === 'dashboard' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
              {[
                { label:'Total animales', value: animals.length },
                { label:'Bovinos', value: bovinos },
                { label:'Sanos', value: sanos },
                { label:'En tratamiento', value: enTratamiento },
              ].map(k => (
                <div key={k.label} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', textTransform:'uppercase' }}>{k.label}</div>
                  <div style={{ fontSize:'24px', fontWeight:'600', color:'#854d0e', fontFamily:'monospace' }}>{k.value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'inventario' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {animals.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay animales registrados</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Arete','Nombre','Especie','Raza','Sexo','Peso (kg)','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{animals.map((a:any) => (
                    <tr key={a.id} style={{ borderBottom:'0.5px solid #f0f0ee', cursor:'pointer' }} onClick={() => { setSelAnimal(a); setVetModal(true) }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'600', color:'#854d0e', fontFamily:'monospace' }}>{a.tag}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1a1a18' }}>{a.name||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', textTransform:'capitalize' }}>{a.species?.replace('_',' ')||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{a.breed||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', textTransform:'capitalize' }}>{a.sex||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#854d0e' }}>{a.currentWeight?.toLocaleString()||'—'}</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px',
                          background: a.status==='sano'?'#dcfce7':a.status==='en_tratamiento'?'#fef3c7':'#fee2e2',
                          color: a.status==='sano'?'#166534':a.status==='en_tratamiento'?'#b45309':'#dc2626'
                        }}>{a.status?.replace('_',' ')||'sano'}</span>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'sanidad' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'24px' }}>
              <div style={{ fontSize:'14px', fontWeight:'500', marginBottom:'16px' }}>Resumen sanitario</div>
              {summary ? (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {Object.entries(summary).map(([k,v]:any) => (
                    <div key={k} style={{ background:'#f9f9f7', borderRadius:'8px', padding:'12px' }}>
                      <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'4px', textTransform:'uppercase' }}>{k.replace(/_/g,' ')}</div>
                      <div style={{ fontSize:'18px', fontWeight:'600', color:'#854d0e', fontFamily:'monospace' }}>{typeof v === 'number' ? v.toLocaleString() : String(v)}</div>
                    </div>
                  ))}
                </div>
              ) : <div style={{ color:'#9b9b97', fontSize:'13px' }}>Sin datos de sanidad</div>}
            </div>
          )}
        </>
      )}

      {animalModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'520px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>🐄 Registrar animal</div>
            <form onSubmit={saveAnimal}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ARETE *</label><input value={animalForm.tag} onChange={e=>setAnimalForm({...animalForm,tag:e.target.value})} required style={inp} placeholder="BOV-001"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label><input value={animalForm.name} onChange={e=>setAnimalForm({...animalForm,name:e.target.value})} style={inp} placeholder="Opcional"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESPECIE</label>
                    <select value={animalForm.species} onChange={e=>setAnimalForm({...animalForm,species:e.target.value,breed:(RAZAS[e.target.value]||['Otro'])[0]})} style={{...inp,cursor:'pointer'}}>
                      {ESPECIES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>RAZA</label>
                    <select value={animalForm.breed} onChange={e=>setAnimalForm({...animalForm,breed:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {(RAZAS[animalForm.species]||['Otro']).map(r=><option key={r}>{r}</option>)}</select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>SEXO</label>
                    <select value={animalForm.sex} onChange={e=>setAnimalForm({...animalForm,sex:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      <option value="macho">Macho</option><option value="hembra">Hembra</option></select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PESO (kg)</label><input type="number" step="0.1" value={animalForm.currentWeight} onChange={e=>setAnimalForm({...animalForm,currentWeight:e.target.value})} style={inp} placeholder="350"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA NAC.</label><input type="date" value={animalForm.birthDate} onChange={e=>setAnimalForm({...animalForm,birthDate:e.target.value})} style={inp}/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESTADO SANITARIO</label>
                  <select value={animalForm.status} onChange={e=>setAnimalForm({...animalForm,status:e.target.value})} style={{...inp,cursor:'pointer'}}>
                    {['sano','en_tratamiento','cuarentena','baja'].map(s=><option key={s}>{s}</option>)}</select></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label><input value={animalForm.notes} onChange={e=>setAnimalForm({...animalForm,notes:e.target.value})} style={inp} placeholder="Opcional"/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setAnimalModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#854d0e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar animal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vetModal && selAnimal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>💉 Registro veterinario</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selAnimal.tag} {selAnimal.name ? `· ${selAnimal.name}` : ''}</div>
            <form onSubmit={saveVet}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO</label>
                    <select value={vetForm.type} onChange={e=>setVetForm({...vetForm,type:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {TIPOS_VET.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label><input type="date" value={vetForm.date} onChange={e=>setVetForm({...vetForm,date:e.target.value})} required style={inp}/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>DESCRIPCIÓN</label><input value={vetForm.description} onChange={e=>setVetForm({...vetForm,description:e.target.value})} required style={inp} placeholder="Ej: Vacuna aftosa ciclo 1"/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRODUCTO</label><input value={vetForm.product} onChange={e=>setVetForm({...vetForm,product:e.target.value})} style={inp} placeholder="Aftopor 2ml"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>DOSIS</label><input value={vetForm.dose} onChange={e=>setVetForm({...vetForm,dose:e.target.value})} style={inp} placeholder="2ml IM"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRÓXIMA FECHA</label><input type="date" value={vetForm.nextDate} onChange={e=>setVetForm({...vetForm,nextDate:e.target.value})} style={inp}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>COSTO (COP)</label><input type="number" value={vetForm.cost} onChange={e=>setVetForm({...vetForm,cost:e.target.value})} style={inp} placeholder="Opcional"/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setVetModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#854d0e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <IndustryGuard module="GANADERIA"><GanaderiaPage /></IndustryGuard>
}
