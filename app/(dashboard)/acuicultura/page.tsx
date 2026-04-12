'use client'
import { IndustryGuard } from '@/components/IndustryGuard'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const SPECIES_TYPES = ['tilapia','trucha','cachama','carpa','bagre','camarón','otro']
const WATER_QUALITY = ['excelente','buena','regular','mala']

const inputStyle: React.CSSProperties = {
  width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px',
  padding:'9px 12px', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7',
}

const card: React.CSSProperties = {
  background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px',
}

function AcuiculturaPage() {
  const [tab, setTab] = useState('dashboard')
  const [ponds, setPonds] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [pondModal, setPondModal] = useState(false)
  const [batchModal, setBatchModal] = useState(false)
  const [recModal, setRecModal] = useState<'water'|'feed'|'harvest'|null>(null)
  const [selBatch, setSelBatch] = useState<any>(null)

  const [pondForm, setPondForm] = useState({ name:'', volume:'', area:'', location:'', notes:'' })
  const [batchForm, setBatchForm] = useState({ pondId:'', species:'tilapia', initialQuantity:'', weightGrams:'', startDate: new Date().toISOString().split('T')[0] })
  const [recForm, setRecForm] = useState<any>({ date: new Date().toISOString().split('T')[0], ph:'', oxygen:'', temperature:'', quantity:'', weightKg:'', feedKg:'', cost:'', notes:'' })

  async function loadAll() {
    setLoading(true)
    try {
      const [p, b] = await Promise.allSettled([
        api.get('/acuicultura/estanques'),
        api.get('/acuicultura/ciclos'),
      ])
      if (p.status === 'fulfilled') setPonds(p.value.data ?? [])
      if (b.status === 'fulfilled') setBatches(b.value.data ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  async function savePond(e: React.FormEvent) {
    e.preventDefault()
    try {
            await api.post('/acuicultura/estanques', {...pondForm,volume:parseFloat(pondForm.volume),area:parseFloat(pondForm.area)})
      setPondModal(false); loadAll(); toastSuccess('Estanque creado')
    } catch { toastError('Error al crear estanque') }
  }

  async function saveBatch(e: React.FormEvent) {
    e.preventDefault()
    try {
            await api.post('/acuicultura/ciclos', {...batchForm,initialCount:parseInt(batchForm.initialQuantity),initialWeightG:parseFloat(batchForm.weightGrams)})
      setBatchModal(false); loadAll(); toastSuccess('Lote creado')
    } catch { toastError('Error al crear lote') }
  }

  async function saveRecord(e: React.FormEvent) {
    e.preventDefault()
    if (!selBatch) return
    try {
      if (recModal === 'water') {
              await api.post(`/acuicultura/estanques/${selBatch.pondId}/agua`, {...recForm})
        toastSuccess('Calidad de agua registrada')
      } else if (recModal === 'feed') {
              await api.post(`/acuicultura/ciclos/${selBatch.id}/alimentacion`, {...recForm,quantity:parseFloat(recForm.feedKg),cost:recForm.cost?parseFloat(recForm.cost):null})
        toastSuccess('Alimentación registrada')
      } else if (recModal === 'harvest') {
              await api.post(`/acuicultura/ciclos/${selBatch.id}/cosecha`, {...recForm,quantity:parseInt(recForm.quantity),totalKg:parseFloat(recForm.weightKg)})
        toastSuccess('Cosecha registrada')
      }
      setRecModal(null); loadAll()
    } catch { toastError('Error al guardar registro') }
  }

  async function deletePond(id: string, name: string) {
    const ok = await confirm({ title:'Eliminar estanque', message:`¿Eliminar "${name}"?`, danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
            await api.put(`/acuicultura/estanques/${ponds[0]?.id}`, {deletedAt:new Date().toISOString()})
      loadAll(); toastSuccess('Estanque eliminado')
    } catch { toastError('Error al eliminar') }
  }

  const totalPeces = batches.reduce((s, b) => s + (b.currentQuantity || 0), 0)
  const activeBatches = batches.filter(b => b.status === 'activo')

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Acuicultura</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>
            Estanques, lotes, calidad del agua y cosecha
          </p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => setPondModal(true)} style={{ fontSize:'12px', padding:'8px 14px', border:'0.5px solid #036446', borderRadius:'6px', background:'transparent', color:'#036446', cursor:'pointer', fontWeight:'500' }}>
            + Estanque
          </button>
          <button onClick={() => setBatchModal(true)} disabled={ponds.length === 0}
            style={{ fontSize:'12px', padding:'8px 14px', background: ponds.length === 0 ? '#e5e5e3' : '#036446', color: ponds.length === 0 ? '#9b9b97' : 'white', border:'none', borderRadius:'6px', cursor: ponds.length === 0 ? 'not-allowed' : 'pointer', fontWeight:'500' }}>
            + Lote
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','estanques','lotes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t?'500':'400', color: tab===t?'#036446':'#9b9b97', borderBottom: tab===t?'2px solid #036446':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit', textTransform:'capitalize' }}>
            {t === 'dashboard' ? 'Dashboard' : t === 'estanques' ? 'Estanques' : 'Lotes'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color:'#9b9b97', fontSize:'13px', padding:'40px', textAlign:'center' }}>Cargando...</div>
      ) : (
        <>
          {/* DASHBOARD */}
          {tab === 'dashboard' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                {[
                  { label:'Estanques', value: ponds.length, color:'#036446' },
                  { label:'Lotes activos', value: activeBatches.length, color:'#185fa5' },
                  { label:'Peces en agua', value: totalPeces.toLocaleString(), color:'#036446' },
                  { label:'Especies', value: [...new Set(batches.map(b => b.species))].length, color:'#b45309' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize:'26px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {activeBatches.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🐟</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin lotes activos</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Crea un estanque y luego registra tu primer lote de peces</div>
                  <button onClick={() => setPondModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>
                    Crear primer estanque
                  </button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {activeBatches.map((b: any) => {
                    const days = Math.ceil((new Date().getTime() - new Date(b.startDate).getTime()) / (1000*60*60*24))
                    return (
                      <div key={b.id} style={card}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{b.pond?.name || '—'}</div>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>{b.species} · {days} días</div>
                          </div>
                          <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e6f1fb', color:'#185fa5', fontWeight:'500', height:'fit-content' }}>{b.species}</span>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                          <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                            <div style={{ fontSize:'16px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{(b.currentQuantity || 0).toLocaleString()}</div>
                            <div style={{ fontSize:'10px', color:'#9b9b97' }}>peces actuales</div>
                          </div>
                          <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                            <div style={{ fontSize:'16px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>{b.weightGrams || 0}g</div>
                            <div style={{ fontSize:'10px', color:'#9b9b97' }}>peso inicial</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:'4px' }}>
                          <button onClick={() => { setSelBatch(b); setRecModal('water') }}
                            style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #bfdbfe', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#185fa5' }}>💧 Agua</button>
                          <button onClick={() => { setSelBatch(b); setRecModal('feed') }}
                            style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #e5e5e3', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#6b6b67' }}>+ Alim.</button>
                          <button onClick={() => { setSelBatch(b); setRecModal('harvest') }}
                            style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #d1fae5', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#036446' }}>🎣 Cosecha</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ESTANQUES */}
          {tab === 'estanques' && (
            <div>
              {ponds.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🏊</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin estanques registrados</div>
                  <button onClick={() => setPondModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear primer estanque</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {ponds.map((p: any) => (
                    <div key={p.id} style={card}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18' }}>{p.name}</div>
                          <div style={{ fontSize:'11px', color:'#9b9b97' }}>{p.location || 'Sin ubicación'}</div>
                        </div>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'16px', fontWeight:'500', color:'#185fa5', fontFamily:'monospace' }}>{p.volume || '—'}m³</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>volumen</div>
                        </div>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'16px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{p.area || '—'}m²</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>área</div>
                        </div>
                      </div>
                      <button onClick={() => deletePond(p.id, p.name)}
                        style={{ width:'100%', fontSize:'11px', padding:'6px', border:'0.5px solid #fecaca', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>
                        Eliminar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LOTES */}
          {tab === 'lotes' && (
            <div>
              {batches.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🐠</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin lotes registrados</div>
                  <button onClick={() => setBatchModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear primer lote</button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Estanque','Especie','Inicio','Cant. inicial','Actuales','Estado','Acciones'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((b: any) => (
                        <tr key={b.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{b.pond?.name || '—'}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e6f1fb', color:'#185fa5' }}>{b.species}</span></td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(b.startDate).toLocaleDateString('es-CO', { day:'numeric', month:'short' })}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1a1a18', fontFamily:'monospace' }}>{(b.initialQuantity || 0).toLocaleString()}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{(b.currentQuantity || 0).toLocaleString()}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background: b.status==='activo'?'#e8f5ef':'#f9f9f7', color: b.status==='activo'?'#036446':'#9b9b97' }}>{b.status}</span></td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button onClick={() => { setSelBatch(b); setRecModal('water') }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #bfdbfe', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#185fa5' }}>💧</button>
                              <button onClick={() => { setSelBatch(b); setRecModal('feed') }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #e5e5e3', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#6b6b67' }}>Alim.</button>
                              <button onClick={() => { setSelBatch(b); setRecModal('harvest') }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #d1fae5', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#036446' }}>Cosecha</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal: Nuevo estanque */}
      {pondModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo estanque</div>
            <form onSubmit={savePond}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label>
                  <input value={pondForm.name} onChange={e => setPondForm({...pondForm, name:e.target.value})} required style={inputStyle} placeholder="Estanque 1" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>VOLUMEN (m³)</label>
                  <input type="number" value={pondForm.volume} onChange={e => setPondForm({...pondForm, volume:e.target.value})} style={inputStyle} placeholder="500" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ÁREA (m²)</label>
                  <input type="number" value={pondForm.area} onChange={e => setPondForm({...pondForm, area:e.target.value})} style={inputStyle} placeholder="200" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UBICACIÓN</label>
                  <input value={pondForm.location} onChange={e => setPondForm({...pondForm, location:e.target.value})} style={inputStyle} placeholder="Sector sur" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'16px' }}>
                <button type="button" onClick={() => setPondModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear estanque</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo lote */}
      {batchModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo lote de peces</div>
            <form onSubmit={saveBatch}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESTANQUE</label>
                  <select value={batchForm.pondId} onChange={e => setBatchForm({...batchForm, pondId:e.target.value})} required style={{...inputStyle, cursor:'pointer'}}>
                    <option value="">Seleccionar...</option>
                    {ponds.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESPECIE</label>
                  <select value={batchForm.species} onChange={e => setBatchForm({...batchForm, species:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {SPECIES_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD INICIAL</label>
                  <input type="number" value={batchForm.initialQuantity} onChange={e => setBatchForm({...batchForm, initialQuantity:e.target.value})} required style={inputStyle} placeholder="1000" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PESO INICIAL (g)</label>
                  <input type="number" value={batchForm.weightGrams} onChange={e => setBatchForm({...batchForm, weightGrams:e.target.value})} style={inputStyle} placeholder="5" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ marginBottom:'16px' }}><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA DE SIEMBRA</label>
                <input type="date" value={batchForm.startDate} onChange={e => setBatchForm({...batchForm, startDate:e.target.value})} required style={inputStyle}/></div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setBatchModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registros */}
      {recModal && selBatch && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>
              {recModal === 'water' ? '💧 Calidad del agua' : recModal === 'feed' ? 'Registrar alimentación' : '�� Registrar cosecha'}
            </div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selBatch.pond?.name} · {selBatch.species}</div>
            <form onSubmit={saveRecord}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                  <input type="date" value={recForm.date} onChange={e => setRecForm({...recForm, date:e.target.value})} required style={inputStyle}/></div>
                {recModal === 'water' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>pH</label>
                      <input type="number" step="0.1" value={recForm.ph} onChange={e => setRecForm({...recForm, ph:e.target.value})} style={inputStyle} placeholder="7.0"/></div>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>O₂ (mg/L)</label>
                      <input type="number" step="0.1" value={recForm.oxygen} onChange={e => setRecForm({...recForm, oxygen:e.target.value})} style={inputStyle} placeholder="6.0"/></div>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>°C</label>
                      <input type="number" step="0.1" value={recForm.temperature} onChange={e => setRecForm({...recForm, temperature:e.target.value})} style={inputStyle} placeholder="25"/></div>
                  </div>
                )}
                {recModal === 'feed' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ALIMENTO (kg)</label>
                      <input type="number" step="0.1" value={recForm.feedKg} onChange={e => setRecForm({...recForm, feedKg:e.target.value})} required style={inputStyle} placeholder="0"/></div>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>COSTO (COP)</label>
                      <input type="number" value={recForm.cost} onChange={e => setRecForm({...recForm, cost:e.target.value})} style={inputStyle} placeholder="Opcional"/></div>
                  </div>
                )}
                {recModal === 'harvest' && (
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD (peces)</label>
                      <input type="number" value={recForm.quantity} onChange={e => setRecForm({...recForm, quantity:e.target.value})} required style={inputStyle} placeholder="0"/></div>
                    <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PESO TOTAL (kg)</label>
                      <input type="number" step="0.1" value={recForm.weightKg} onChange={e => setRecForm({...recForm, weightKg:e.target.value})} style={inputStyle} placeholder="0"/></div>
                  </div>
                )}
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={recForm.notes} onChange={e => setRecForm({...recForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones..."/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setRecModal(null)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return (
    <IndustryGuard module='ACUICULTURA'>
      <AcuiculturaPage />
    </IndustryGuard>
  )
}
