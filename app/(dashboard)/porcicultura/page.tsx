'use client'
import { IndustryGuard } from '@/components/IndustryGuard'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'

const RAZAS = ['landrace','yorkshire','duroc','pietrain','criollo','otro']
const ETAPAS = ['lechon','destete','levante','engorde','reproductor','gestante','lactante']
const TIPOS_LOTE = ['engorde','cria','levante','reproductor']
const TIPOS_EVENTO = ['vacuna','desparasitacion','pesaje','parto','destete','venta','muerte','traslado']
const inp: React.CSSProperties = { width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7' }

function PorciculturaPage() {
  const [tab, setTab] = useState('dashboard')
  const [lotes, setLotes] = useState<any[]>([])
  const [animales, setAnimales] = useState<any[]>([])
  const [eventos, setEventos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loteModal, setLoteModal] = useState(false)
  const [animalModal, setAnimalModal] = useState(false)
  const [eventoModal, setEventoModal] = useState(false)
  const [loteForm, setLoteForm] = useState({ nombre:'', tipo:'engorde', capacidad:'', ubicacion:'' })
  const [animalForm, setAnimalForm] = useState({ loteId:'', arete:'', raza:'landrace', sexo:'macho', etapa:'lechon', pesoKg:'', fechaNac:'' })
  const [eventoForm, setEventoForm] = useState({ loteId:'', tipo:'vacuna', fecha: new Date().toISOString().split('T')[0], descripcion:'', pesoKg:'', costo:'', responsable:'' })

  async function loadAll() {
    setLoading(true)
    try {
      const [l, a, e] = await Promise.allSettled([
        api.get('/porcicultura/lotes'),
        api.get('/porcicultura/animales'),
        api.get('/porcicultura/eventos'),
      ])
      if (l.status === 'fulfilled') setLotes(l.value.data ?? [])
      if (a.status === 'fulfilled') setAnimales(a.value.data ?? [])
      if (e.status === 'fulfilled') setEventos(e.value.data ?? [])
    } finally { setLoading(false) }
  }
  useEffect(() => { loadAll() }, [])

  async function saveLote(ev: React.FormEvent) {
    ev.preventDefault()
    try {
      await api.post('/porcicultura/lotes', { ...loteForm, capacidad: loteForm.capacidad ? parseInt(loteForm.capacidad) : null })
      setLoteModal(false); loadAll(); toastSuccess('Lote creado')
    } catch { toastError('Error al crear lote') }
  }

  async function saveAnimal(ev: React.FormEvent) {
    ev.preventDefault()
    try {
      await api.post('/porcicultura/animales', { ...animalForm, pesoKg: animalForm.pesoKg ? parseFloat(animalForm.pesoKg) : null, fechaNac: animalForm.fechaNac || null })
      setAnimalModal(false); loadAll(); toastSuccess('Animal registrado')
    } catch { toastError('Error al registrar animal') }
  }

  async function saveEvento(ev: React.FormEvent) {
    ev.preventDefault()
    try {
      await api.post('/porcicultura/eventos', { ...eventoForm, pesoKg: eventoForm.pesoKg ? parseFloat(eventoForm.pesoKg) : null, costo: eventoForm.costo ? parseFloat(eventoForm.costo) : null })
      setEventoModal(false); loadAll(); toastSuccess('Evento registrado')
    } catch { toastError('Error al registrar evento') }
  }

  const porEtapa = ETAPAS.map(e => ({ etapa: e, count: animales.filter(a => a.etapa === e).length })).filter(e => e.count > 0)
  const pesoPromedio = animales.length > 0 ? (animales.reduce((s,a) => s+(a.pesoKg||0), 0) / animales.length).toFixed(1) : '0'

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Porcicultura 🐖</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Lotes, animales, eventos sanitarios y productivos</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {tab === 'lotes' && <button onClick={() => setLoteModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Lote</button>}
          {tab === 'animales' && <button onClick={() => { if(lotes.length){ setAnimalForm({...animalForm, loteId:lotes[0].id}); setAnimalModal(true) } else toastError('Crea un lote primero') }} style={{ fontSize:'12px', padding:'8px 16px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Animal</button>}
          {tab === 'eventos' && <button onClick={() => { if(lotes.length){ setEventoForm({...eventoForm, loteId:lotes[0].id}); setEventoModal(true) } else toastError('Crea un lote primero') }} style={{ fontSize:'12px', padding:'8px 16px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Evento</button>}
        </div>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','lotes','animales','eventos'].map(t => <button key={t} onClick={() => setTab(t)} style={{ fontSize:'13px', padding:'8px 16px', background:'none', border:'none', borderBottom: tab===t ? '2px solid #7c3f1e' : '2px solid transparent', color: tab===t ? '#7c3f1e' : '#9b9b97', cursor:'pointer', fontWeight: tab===t ? '500' : '400', textTransform:'capitalize' }}>{t}</button>)}
      </div>

      {loading ? <div style={{ color:'#9b9b97', fontSize:'13px' }}>Cargando...</div> : (
        <>
          {tab === 'dashboard' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                {[
                  { label:'Lotes activos', value: lotes.length, color:'#7c3f1e' },
                  { label:'Total animales', value: animales.length, color:'#7c3f1e' },
                  { label:'Peso promedio (kg)', value: pesoPromedio, color:'#7c3f1e' },
                  { label:'Eventos registrados', value: eventos.length, color:'#6b7280' },
                ].map(k => (
                  <div key={k.label} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                    <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', textTransform:'uppercase' }}>{k.label}</div>
                    <div style={{ fontSize:'24px', fontWeight:'600', color:k.color, fontFamily:'monospace' }}>{k.value}</div>
                  </div>
                ))}
              </div>
              {porEtapa.length > 0 && (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18', marginBottom:'12px' }}>Animales por etapa</div>
                  <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                    {porEtapa.map(e => (
                      <div key={e.etapa} style={{ background:'#fdf2e9', borderRadius:'8px', padding:'10px 16px', textAlign:'center' }}>
                        <div style={{ fontSize:'20px', fontWeight:'600', color:'#7c3f1e', fontFamily:'monospace' }}>{e.count}</div>
                        <div style={{ fontSize:'11px', color:'#9b9b97', textTransform:'capitalize', marginTop:'2px' }}>{e.etapa}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'lotes' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {lotes.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay lotes registrados</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Lote','Tipo','Capacidad','Animales','Ubicación','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{lotes.map((l:any) => (
                    <tr key={l.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{l.nombre}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background:'#fdf2e9', color:'#7c3f1e', textTransform:'capitalize' }}>{l.tipo}</span></td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#7c3f1e' }}>{l.capacidad?.toLocaleString()||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace' }}>{l._count?.animales||0}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{l.ubicacion||'—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background:'#dcfce7', color:'#166534' }}>{l.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'animales' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {animales.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay animales registrados</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Arete','Lote','Raza','Sexo','Etapa','Peso (kg)','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{animales.map((a:any) => (
                    <tr key={a.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{a.arete||'S/N'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{a.lote?.nombre||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#7c3f1e', fontWeight:'500', textTransform:'capitalize' }}>{a.raza}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', textTransform:'capitalize' }}>{a.sexo}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background:'#fdf2e9', color:'#7c3f1e', textTransform:'capitalize' }}>{a.etapa}</span></td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#7c3f1e', fontWeight:'500' }}>{a.pesoKg?.toFixed(1)||'—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background:'#dcfce7', color:'#166534' }}>{a.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'eventos' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {eventos.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay eventos registrados</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Fecha','Tipo','Lote','Descripción','Peso (kg)','Costo','Responsable'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{eventos.map((e:any) => (
                    <tr key={e.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(e.fecha).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background:'#fdf2e9', color:'#7c3f1e', textTransform:'capitalize' }}>{e.tipo}</span></td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{e.lote?.nombre||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#1a1a18' }}>{e.descripcion||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', fontFamily:'monospace', color:'#7c3f1e' }}>{e.pesoKg?.toFixed(1)||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{e.costo ? '$'+e.costo.toLocaleString() : '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{e.responsable||'—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {loteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>🐖 Nuevo lote</div>
            <form onSubmit={saveLote}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label><input value={loteForm.nombre} onChange={e=>setLoteForm({...loteForm,nombre:e.target.value})} required style={inp} placeholder="Lote Engorde 1"/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO</label>
                    <select value={loteForm.tipo} onChange={e=>setLoteForm({...loteForm,tipo:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {TIPOS_LOTE.map(t=><option key={t}>{t}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CAPACIDAD</label><input type="number" value={loteForm.capacidad} onChange={e=>setLoteForm({...loteForm,capacidad:e.target.value})} style={inp} placeholder="50"/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UBICACIÓN</label><input value={loteForm.ubicacion} onChange={e=>setLoteForm({...loteForm,ubicacion:e.target.value})} style={inp} placeholder="Galpón Norte"/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setLoteModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {animalModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>🐖 Registrar animal</div>
            <form onSubmit={saveAnimal}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>LOTE</label>
                  <select value={animalForm.loteId} onChange={e=>setAnimalForm({...animalForm,loteId:e.target.value})} required style={{...inp,cursor:'pointer'}}>
                    {lotes.map(l=><option key={l.id} value={l.id}>{l.nombre}</option>)}</select></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ARETE</label><input value={animalForm.arete} onChange={e=>setAnimalForm({...animalForm,arete:e.target.value})} style={inp} placeholder="PORC-001"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>RAZA</label>
                    <select value={animalForm.raza} onChange={e=>setAnimalForm({...animalForm,raza:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {RAZAS.map(r=><option key={r}>{r}</option>)}</select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>SEXO</label>
                    <select value={animalForm.sexo} onChange={e=>setAnimalForm({...animalForm,sexo:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {['macho','hembra'].map(s=><option key={s}>{s}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ETAPA</label>
                    <select value={animalForm.etapa} onChange={e=>setAnimalForm({...animalForm,etapa:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {ETAPAS.map(e=><option key={e}>{e}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PESO (kg)</label><input type="number" step="0.1" value={animalForm.pesoKg} onChange={e=>setAnimalForm({...animalForm,pesoKg:e.target.value})} style={inp} placeholder="0"/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setAnimalModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {eventoModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>📋 Nuevo evento</div>
            <form onSubmit={saveEvento}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>LOTE</label>
                    <select value={eventoForm.loteId} onChange={e=>setEventoForm({...eventoForm,loteId:e.target.value})} required style={{...inp,cursor:'pointer'}}>
                      {lotes.map(l=><option key={l.id} value={l.id}>{l.nombre}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO</label>
                    <select value={eventoForm.tipo} onChange={e=>setEventoForm({...eventoForm,tipo:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {TIPOS_EVENTO.map(t=><option key={t}>{t}</option>)}</select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label><input type="date" value={eventoForm.fecha} onChange={e=>setEventoForm({...eventoForm,fecha:e.target.value})} required style={inp}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PESO (kg)</label><input type="number" step="0.1" value={eventoForm.pesoKg} onChange={e=>setEventoForm({...eventoForm,pesoKg:e.target.value})} style={inp} placeholder="Opcional"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>COSTO (COP)</label><input type="number" value={eventoForm.costo} onChange={e=>setEventoForm({...eventoForm,costo:e.target.value})} style={inp} placeholder="Opcional"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>RESPONSABLE</label><input value={eventoForm.responsable} onChange={e=>setEventoForm({...eventoForm,responsable:e.target.value})} style={inp} placeholder="Nombre"/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>DESCRIPCIÓN</label><input value={eventoForm.descripcion} onChange={e=>setEventoForm({...eventoForm,descripcion:e.target.value})} style={inp} placeholder="Detalle del evento"/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setEventoModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar evento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <IndustryGuard module="MIXTO"><PorciculturaPage /></IndustryGuard>
}
