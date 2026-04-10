'use client'
import { IndustryGuard } from '@/components/IndustryGuard'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'

const SEED_TYPES = ['Tenera','Dura','Pisífera','híbrido Deli x Ghana','otro']
const inp: React.CSSProperties = { width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7' }

function ViveroPage() {
  const [tab, setTab] = useState('dashboard')
  const [nurseries, setNurseries] = useState<any[]>([])
  const [seedlings, setSeedlings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nurseryModal, setNurseryModal] = useState(false)
  const [seedlingModal, setSeedlingModal] = useState(false)
  const [selNursery, setSelNursery] = useState<any>(null)
  const [nurseryForm, setNurseryForm] = useState({ name:'', location:'', capacity:'', notes:'' })
  const [seedlingForm, setSeedlingForm] = useState({ seedType:'Tenera', quantity:'', geneticOrigin:'', plantingDate: new Date().toISOString().split('T')[0] })

  async function loadAll() {
    setLoading(true)
    try {
      const [n, s] = await Promise.allSettled([api.get('/vivero/lotes'), api.get('/vivero/siembras')])
      if (n.status === 'fulfilled') setNurseries(n.value.data ?? [])
      if (s.status === 'fulfilled') setSeedlings(s.value.data ?? [])
    } finally { setLoading(false) }
  }
  useEffect(() => { loadAll() }, [])

  async function saveNursery(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/vivero/lotes', { ...nurseryForm, capacity: nurseryForm.capacity ? parseInt(nurseryForm.capacity) : null })
      setNurseryModal(false); loadAll(); toastSuccess('Vivero creado')
    } catch { toastError('Error al crear vivero') }
  }

  async function saveSeedling(e: React.FormEvent) {
    e.preventDefault()
    if (!selNursery) return
    try {
      await api.post('/vivero/siembras', { nurseryId: selNursery.id, ...seedlingForm, quantity: parseInt(seedlingForm.quantity) })
      setSeedlingModal(false); loadAll(); toastSuccess('Siembra registrada')
    } catch { toastError('Error al registrar siembra') }
  }

  const totalPlantas = seedlings.reduce((s,i) => s+(i.quantity||0), 0)
  const enVivero = seedlings.filter(s => s.status === 'en_vivero').length
  const trasplantados = seedlings.filter(s => s.status === 'trasplantado').length

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Vivero de Palma 🌱</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Previvero, vivero, siembras y trasplantes</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {tab === 'viveros' && <button onClick={() => setNurseryModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#166534', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Vivero</button>}
          {tab === 'siembras' && <button onClick={() => { if(nurseries.length){ setSelNursery(nurseries[0]); setSeedlingModal(true) } else toastError('Crea un vivero primero') }} style={{ fontSize:'12px', padding:'8px 16px', background:'#166534', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Siembra</button>}
        </div>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','viveros','siembras'].map(t => <button key={t} onClick={() => setTab(t)} style={{ fontSize:'13px', padding:'8px 16px', background:'none', border:'none', borderBottom: tab===t ? '2px solid #166534' : '2px solid transparent', color: tab===t ? '#166534' : '#9b9b97', cursor:'pointer', fontWeight: tab===t ? '500' : '400', textTransform:'capitalize' }}>{t}</button>)}
      </div>

      {loading ? <div style={{ color:'#9b9b97', fontSize:'13px' }}>Cargando...</div> : (
        <>
          {tab === 'dashboard' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
              {[
                { label:'Viveros activos', value: nurseries.length },
                { label:'Total plantas', value: totalPlantas.toLocaleString() },
                { label:'En vivero', value: enVivero },
                { label:'Trasplantadas', value: trasplantados },
              ].map(k => (
                <div key={k.label} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', textTransform:'uppercase' }}>{k.label}</div>
                  <div style={{ fontSize:'24px', fontWeight:'600', color:'#166534', fontFamily:'monospace' }}>{k.value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'viveros' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {nurseries.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay viveros registrados</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Nombre','Ubicación','Capacidad','Plantas','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{nurseries.map((n:any) => (
                    <tr key={n.id} style={{ borderBottom:'0.5px solid #f0f0ee', cursor:'pointer' }} onClick={() => { setSelNursery(n); setSeedlingModal(true) }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{n.name}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{n.location||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#166534' }}>{n.capacity?.toLocaleString()||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace' }}>{n._count?.seedlings||0}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background:'#dcfce7', color:'#166534' }}>{n.status||'activo'}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'siembras' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {seedlings.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay siembras registradas</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Vivero','Tipo','Cantidad','Origen','Fecha','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{seedlings.map((s:any) => (
                    <tr key={s.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{s.nursery?.name||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#166534', fontWeight:'500' }}>{s.seedType}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#166534' }}>{s.quantity?.toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{s.geneticOrigin||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{s.plantingDate ? new Date(s.plantingDate).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background: s.status==='trasplantado'?'#f0f9ff':'#dcfce7', color: s.status==='trasplantado'?'#0369a1':'#166534' }}>{s.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {nurseryModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>🌱 Nuevo vivero</div>
            <form onSubmit={saveNursery}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label><input value={nurseryForm.name} onChange={e=>setNurseryForm({...nurseryForm,name:e.target.value})} required style={inp} placeholder="Vivero La Esperanza"/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UBICACIÓN</label><input value={nurseryForm.location} onChange={e=>setNurseryForm({...nurseryForm,location:e.target.value})} style={inp} placeholder="Finca Norte"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CAPACIDAD</label><input type="number" value={nurseryForm.capacity} onChange={e=>setNurseryForm({...nurseryForm,capacity:e.target.value})} style={inp} placeholder="10000"/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setNurseryModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#166534', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear vivero</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {seedlingModal && selNursery && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>🌱 Nueva siembra</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selNursery.name}</div>
            <form onSubmit={saveSeedling}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO SEMILLA</label>
                    <select value={seedlingForm.seedType} onChange={e=>setSeedlingForm({...seedlingForm,seedType:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {SEED_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD</label><input type="number" value={seedlingForm.quantity} onChange={e=>setSeedlingForm({...seedlingForm,quantity:e.target.value})} required style={inp} placeholder="5000"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ORIGEN GENÉTICO</label><input value={seedlingForm.geneticOrigin} onChange={e=>setSeedlingForm({...seedlingForm,geneticOrigin:e.target.value})} style={inp} placeholder="ASD Costa Rica"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA SIEMBRA</label><input type="date" value={seedlingForm.plantingDate} onChange={e=>setSeedlingForm({...seedlingForm,plantingDate:e.target.value})} style={inp}/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setSeedlingModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#166534', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar siembra</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <IndustryGuard module="PALMA"><ViveroPage /></IndustryGuard>
}
