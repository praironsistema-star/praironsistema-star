'use client'
import { IndustryGuard } from '@/components/IndustryGuard'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const VARIETY_TYPES = ['castillo','caturra','colombia','geisha','bourbon','tabi','cenicafé 1','otro']
const PROCESS_TYPES = ['lavado','natural','honey','anaeróbico']
const HARVEST_TYPES = ['selectiva','por pase','strip picking']

const inputStyle: React.CSSProperties = {
  width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px',
  padding:'9px 12px', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7',
}
const card: React.CSSProperties = {
  background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px',
}

function CaficulturaPage() {
  const [tab, setTab] = useState('dashboard')
  const [plots, setPlots] = useState<any[]>([])
  const [harvests, setHarvests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [plotModal, setPlotModal] = useState(false)
  const [harvestModal, setHarvestModal] = useState(false)
  const [selPlot, setSelPlot] = useState<any>(null)

  const [plotForm, setPlotForm] = useState({ name:'', variety:'castillo', area:'', plants:'', altitude:'', process:'lavado', plantDate: new Date().toISOString().split('T')[0], notes:'' })
  const [harvestForm, setHarvestForm] = useState({ date: new Date().toISOString().split('T')[0], kgCereza:'', kgPergamino:'', harvestType:'selectiva', pickers:'', cost:'', notes:'' })

  async function loadAll() {
    setLoading(true)
    try {
      const [p, h] = await Promise.allSettled([
        api.get('/plots'),
        api.get('/harvests'),
      ])
      if (p.status === 'fulfilled') setPlots(p.value.data ?? [])
      if (h.status === 'fulfilled') setHarvests(h.value.data ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  async function savePlot(e: React.FormEvent) {
    e.preventDefault()
    try {
            await api.post('/plots', {crop_type:'cafe',
        ...plotForm,
        area: parseFloat(plotForm.area),
        plants: parseInt(plotForm.plants),
        altitude: plotForm.altitude ? parseInt(plotForm.altitude) : null,
      })
      setPlotModal(false); loadAll(); toastSuccess('Lote cafetero creado')
    } catch { toastError('Error al crear lote') }
  }

  async function saveHarvest(e: React.FormEvent) {
    e.preventDefault()
    if (!selPlot) return
    try {
            await api.post('/harvests', {plot_id:selPlot.id,
        ...harvestForm,
        kgCereza: parseFloat(harvestForm.kgCereza),
        kgPergamino: harvestForm.kgPergamino ? parseFloat(harvestForm.kgPergamino) : null,
        pickers: harvestForm.pickers ? parseInt(harvestForm.pickers) : null,
        cost: harvestForm.cost ? parseFloat(harvestForm.cost) : null,
      })
      setHarvestModal(false); loadAll(); toastSuccess('Cosecha registrada')
    } catch { toastError('Error al registrar cosecha') }
  }

  async function deletePlot(id: string, name: string) {
    const ok = await confirm({ title:'Eliminar lote', message:`¿Eliminar "${name}"?`, danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
            await api.patch('/plots/id', {deleted_at:new Date().toISOString()})
      loadAll(); toastSuccess('Lote eliminado')
    } catch { toastError('Error al eliminar') }
  }

  const totalArea = plots.reduce((s, p) => s + (p.area || 0), 0)
  const totalPlants = plots.reduce((s, p) => s + (p.plants || 0), 0)
  const totalKg = harvests.reduce((s, h) => s + (h.kgCereza || 0), 0)

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Caficultura</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Lotes cafeteros, variedades, cosecha y beneficio</p>
        </div>
        <button onClick={() => setPlotModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
          + Lote cafetero
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','lotes','cosechas'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t?'500':'400', color: tab===t?'#036446':'#9b9b97', borderBottom: tab===t?'2px solid #036446':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit', textTransform:'capitalize' }}>
            {t === 'dashboard' ? 'Dashboard' : t === 'lotes' ? 'Lotes' : 'Cosechas'}
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
                  { label:'Lotes registrados', value: plots.length, color:'#036446' },
                  { label:'Área total (ha)', value: totalArea.toFixed(1), color:'#185fa5' },
                  { label:'Plantas totales', value: totalPlants.toLocaleString(), color:'#036446' },
                  { label:'Kg cereza cosechados', value: totalKg.toLocaleString(), color:'#b45309' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize:'26px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {plots.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>☕</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin lotes cafeteros</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Registra tu primer lote para comenzar el seguimiento</div>
                  <button onClick={() => setPlotModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear primer lote</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {plots.map((p: any) => (
                    <div key={p.id} style={card}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18' }}>{p.name}</div>
                          <div style={{ fontSize:'11px', color:'#9b9b97' }}>{p.variety} · {p.altitude ? p.altitude + ' msnm' : 'Sin altitud'}</div>
                        </div>
                        <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446', fontWeight:'500', height:'fit-content' }}>{p.process}</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'16px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{p.area}ha</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>área</div>
                        </div>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'16px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>{(p.plants || 0).toLocaleString()}</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>plantas</div>
                        </div>
                      </div>
                      <button onClick={() => { setSelPlot(p); setHarvestModal(true) }}
                        style={{ width:'100%', fontSize:'11px', padding:'6px', border:'0.5px solid #d1fae5', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#036446', fontWeight:'500' }}>
                        ☕ Registrar cosecha
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
              {plots.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🌱</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin lotes registrados</div>
                  <button onClick={() => setPlotModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear lote</button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Lote','Variedad','Área (ha)','Plantas','Altitud','Proceso','Acciones'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {plots.map((p: any) => (
                        <tr key={p.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{p.name}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#fef9c3', color:'#b45309' }}>{p.variety}</span></td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#1a1a18' }}>{p.area}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#1a1a18' }}>{(p.plants || 0).toLocaleString()}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{p.altitude ? p.altitude + ' msnm' : '—'}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446' }}>{p.process}</span></td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button onClick={() => { setSelPlot(p); setHarvestModal(true) }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #d1fae5', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#036446' }}>Cosecha</button>
                              <button onClick={() => deletePlot(p.id, p.name)} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
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

          {/* COSECHAS */}
          {tab === 'cosechas' && (
            <div>
              {harvests.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>☕</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin cosechas registradas</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97' }}>Selecciona un lote desde el Dashboard para registrar una cosecha</div>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Fecha','Lote','Tipo cosecha','Kg cereza','Kg pergamino','Recolectores','Costo'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {harvests.map((h: any) => (
                        <tr key={h.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(h.date).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{h.plot?.name || '—'}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446' }}>{h.harvestType}</span></td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#b45309', fontFamily:'monospace' }}>{(h.kgCereza || 0).toLocaleString()}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1a1a18', fontFamily:'monospace' }}>{h.kgPergamino ? h.kgPergamino.toLocaleString() : '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{h.pickers || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{h.cost ? '$' + h.cost.toLocaleString() : '—'}</td>
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

      {/* Modal: Nuevo lote */}
      {plotModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo lote cafetero</div>
            <form onSubmit={savePlot}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE DEL LOTE</label>
                  <input value={plotForm.name} onChange={e => setPlotForm({...plotForm, name:e.target.value})} required style={inputStyle} placeholder="Lote La Esperanza" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>VARIEDAD</label>
                  <select value={plotForm.variety} onChange={e => setPlotForm({...plotForm, variety:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {VARIETY_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ÁREA (ha)</label>
                  <input type="number" step="0.01" value={plotForm.area} onChange={e => setPlotForm({...plotForm, area:e.target.value})} required style={inputStyle} placeholder="2.5" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PLANTAS</label>
                  <input type="number" value={plotForm.plants} onChange={e => setPlotForm({...plotForm, plants:e.target.value})} style={inputStyle} placeholder="5000" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ALTITUD (msnm)</label>
                  <input type="number" value={plotForm.altitude} onChange={e => setPlotForm({...plotForm, altitude:e.target.value})} style={inputStyle} placeholder="1800" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'16px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PROCESO DE BENEFICIO</label>
                  <select value={plotForm.process} onChange={e => setPlotForm({...plotForm, process:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {PROCESS_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA DE SIEMBRA</label>
                  <input type="date" value={plotForm.plantDate} onChange={e => setPlotForm({...plotForm, plantDate:e.target.value})} style={inputStyle}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setPlotModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cosecha */}
      {harvestModal && selPlot && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>☕ Registrar cosecha</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selPlot.name} · {selPlot.variety}</div>
            <form onSubmit={saveHarvest}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                    <input type="date" value={harvestForm.date} onChange={e => setHarvestForm({...harvestForm, date:e.target.value})} required style={inputStyle}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO DE COSECHA</label>
                    <select value={harvestForm.harvestType} onChange={e => setHarvestForm({...harvestForm, harvestType:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                      {HARVEST_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>KG CEREZA</label>
                    <input type="number" step="0.1" value={harvestForm.kgCereza} onChange={e => setHarvestForm({...harvestForm, kgCereza:e.target.value})} required style={inputStyle} placeholder="0"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>KG PERGAMINO</label>
                    <input type="number" step="0.1" value={harvestForm.kgPergamino} onChange={e => setHarvestForm({...harvestForm, kgPergamino:e.target.value})} style={inputStyle} placeholder="Opcional"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>RECOLECTORES</label>
                    <input type="number" value={harvestForm.pickers} onChange={e => setHarvestForm({...harvestForm, pickers:e.target.value})} style={inputStyle} placeholder="0"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>COSTO (COP)</label>
                    <input type="number" value={harvestForm.cost} onChange={e => setHarvestForm({...harvestForm, cost:e.target.value})} style={inputStyle} placeholder="Opcional"/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={harvestForm.notes} onChange={e => setHarvestForm({...harvestForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones..."/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setHarvestModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar cosecha</button>
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
    <IndustryGuard module='CAFE'>
      <CaficulturaPage />
    </IndustryGuard>
  )
}
