'use client'
import { IndustryGuard } from '@/components/IndustryGuard'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const VARIETY_TYPES = ['CCN-51','ICS-60','ICS-95','TSH-565','FSV-41','EET-96','híbrido local','otro']
const FERMENTATION_TYPES = ['cajón de madera','saco de fique','montón','otro']
const DRYING_TYPES = ['solar','marquesina','secador mecánico']

const inp: React.CSSProperties = { width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7' }
const card: React.CSSProperties = { background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }

function CacaoPage() {
  const [tab, setTab] = useState('dashboard')
  const [plots, setPlots] = useState<any[]>([])
  const [harvests, setHarvests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [plotModal, setPlotModal] = useState(false)
  const [harvestModal, setHarvestModal] = useState(false)
  const [selPlot, setSelPlot] = useState<any>(null)
  const [plotForm, setPlotForm] = useState({ name:'', variety:'CCN-51', area:'', plants:'', plantDate: new Date().toISOString().split('T')[0], notes:'' })
  const [harvestForm, setHarvestForm] = useState({ date: new Date().toISOString().split('T')[0], kgFresh:'', kgDry:'', fermentationType:'cajón de madera', fermentationDays:'', dryingType:'solar', dryingDays:'', pricePerKg:'', notes:'' })

  async function loadAll() {
    setLoading(true)
    try {
      const [p, h] = await Promise.allSettled([api.get('/cacao/plots'), api.get('/cacao/harvests')])
      if (p.status === 'fulfilled') setPlots(p.value.data ?? [])
      if (h.status === 'fulfilled') setHarvests(h.value.data ?? [])
    } finally { setLoading(false) }
  }
  useEffect(() => { loadAll() }, [])

  async function savePlot(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/cacao/plots', { ...plotForm, area: parseFloat(plotForm.area), plants: parseInt(plotForm.plants) })
      setPlotModal(false); loadAll(); toastSuccess('Parcela de cacao creada')
    } catch { toastError('Error al crear parcela') }
  }

  async function saveHarvest(e: React.FormEvent) {
    e.preventDefault()
    if (!selPlot) return
    try {
      await api.post('/cacao/harvests', { plotId: selPlot.id, ...harvestForm, kgFresh: parseFloat(harvestForm.kgFresh), kgDry: harvestForm.kgDry ? parseFloat(harvestForm.kgDry) : null, fermentationDays: harvestForm.fermentationDays ? parseInt(harvestForm.fermentationDays) : null, dryingDays: harvestForm.dryingDays ? parseInt(harvestForm.dryingDays) : null, pricePerKg: harvestForm.pricePerKg ? parseFloat(harvestForm.pricePerKg) : null })
      setHarvestModal(false); loadAll(); toastSuccess('Cosecha registrada')
    } catch { toastError('Error al registrar cosecha') }
  }

  async function deletePlot(id: string, name: string) {
    const ok = await confirm({ title:'Eliminar', message:`¿Eliminar "${name}"?`, danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
      await api.delete(`/cacao/plots/${id}`)
      loadAll()
      toastSuccess('Parcela eliminada')
    } catch {
      toastError('Error al eliminar')
    }
  }

  const totalArea = plots.reduce((s,p) => s+(p.area||0), 0)
  const totalPlants = plots.reduce((s,p) => s+(p.plants||0), 0)
  const totalKgFresh = harvests.reduce((s,h) => s+(h.kgFresh||0), 0)
  const totalKgDry = harvests.reduce((s,h) => s+(h.kgDry||0), 0)

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Cacao</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Parcelas, variedades, cosecha, fermentación y secado</p>
        </div>
        <button onClick={() => setPlotModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Parcela cacao</button>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {[['dashboard','Dashboard'],['parcelas','Parcelas'],['cosechas','Cosechas']].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t?'500':'400', color: tab===t?'#7c3f1e':'#9b9b97', borderBottom: tab===t?'2px solid #7c3f1e':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit' }}>{l}</button>
        ))}
      </div>

      {loading ? <div style={{ color:'#9b9b97', fontSize:'13px', padding:'40px', textAlign:'center' }}>Cargando...</div> : (
        <>
          {tab === 'dashboard' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                {[
                  { label:'Parcelas', value: plots.length, color:'#7c3f1e' },
                  { label:'Área total (ha)', value: totalArea.toFixed(1), color:'#185fa5' },
                  { label:'Plantas totales', value: totalPlants.toLocaleString(), color:'#7c3f1e' },
                  { label:'Kg baba cosechados', value: totalKgFresh.toLocaleString(), color:'#b45309' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize:'26px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {plots.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🍫</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin parcelas de cacao</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Registra tu primera parcela para comenzar</div>
                  <button onClick={() => setPlotModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear primera parcela</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {plots.map((p:any) => (
                    <div key={p.id} style={card}>
                      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18' }}>{p.name}</div>
                          <div style={{ fontSize:'11px', color:'#9b9b97' }}>{p.variety}</div>
                        </div>
                        <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#fdf2e9', color:'#7c3f1e', fontWeight:'500', height:'fit-content' }}>{p.area}ha</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'16px', fontWeight:'500', color:'#7c3f1e', fontFamily:'monospace' }}>{(p.plants||0).toLocaleString()}</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>plantas</div>
                        </div>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'16px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>{totalKgDry.toFixed(0)}</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>kg seco total</div>
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'4px' }}>
                        <button onClick={() => { setSelPlot(p); setHarvestModal(true) }} style={{ flex:1, fontSize:'11px', padding:'6px', border:'0.5px solid #fdf2e9', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#7c3f1e', fontWeight:'500' }}>🍫 Registrar cosecha</button>
                        <button onClick={() => deletePlot(p.id, p.name)} style={{ fontSize:'11px', padding:'6px 10px', border:'0.5px solid #fecaca', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'parcelas' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {plots.length === 0 ? <div style={{ textAlign:'center', padding:'60px', color:'#9b9b97', fontSize:'13px' }}>Sin parcelas registradas</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Parcela','Variedad','Área (ha)','Plantas','Fecha siembra','Acciones'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{plots.map((p:any) => (
                    <tr key={p.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{p.name}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#fdf2e9', color:'#7c3f1e' }}>{p.variety}</span></td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace' }}>{p.area}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace' }}>{(p.plants||0).toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{p.plantDate ? new Date(p.plantDate).toLocaleDateString('es-CO') : '—'}</td>
                      <td style={{ padding:'10px 14px' }}><div style={{ display:'flex', gap:'4px' }}>
                        <button onClick={() => { setSelPlot(p); setHarvestModal(true) }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fdf2e9', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#7c3f1e' }}>Cosecha</button>
                        <button onClick={() => deletePlot(p.id, p.name)} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
                      </div></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'cosechas' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {harvests.length === 0 ? <div style={{ textAlign:'center', padding:'60px', color:'#9b9b97', fontSize:'13px' }}>Sin cosechas registradas</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Fecha','Parcela','Kg baba','Kg seco','Fermentación','Secado','Precio/kg'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{harvests.map((h:any) => (
                    <tr key={h.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(h.date).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{h.plot?.name||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#7c3f1e', fontFamily:'monospace' }}>{(h.kgFresh||0).toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1a1a18', fontFamily:'monospace' }}>{h.kgDry?h.kgDry.toLocaleString():'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{h.fermentationType||'—'} {h.fermentationDays?'('+h.fermentationDays+'d)':''}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{h.dryingType||'—'} {h.dryingDays?'('+h.dryingDays+'d)':''}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{h.pricePerKg?'$'+h.pricePerKg.toLocaleString():'—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {plotModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nueva parcela de cacao</div>
            <form onSubmit={savePlot}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label>
                  <input value={plotForm.name} onChange={e=>setPlotForm({...plotForm,name:e.target.value})} required style={inp} placeholder="Parcela El Porvenir"/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>VARIEDAD</label>
                  <select value={plotForm.variety} onChange={e=>setPlotForm({...plotForm,variety:e.target.value})} style={{...inp,cursor:'pointer'}}>
                    {VARIETY_TYPES.map(v=><option key={v}>{v}</option>)}</select></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'16px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ÁREA (ha)</label>
                  <input type="number" step="0.01" value={plotForm.area} onChange={e=>setPlotForm({...plotForm,area:e.target.value})} required style={inp} placeholder="1.5"/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PLANTAS</label>
                  <input type="number" value={plotForm.plants} onChange={e=>setPlotForm({...plotForm,plants:e.target.value})} style={inp} placeholder="1000"/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA SIEMBRA</label>
                  <input type="date" value={plotForm.plantDate} onChange={e=>setPlotForm({...plotForm,plantDate:e.target.value})} style={inp}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setPlotModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear parcela</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {harvestModal && selPlot && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>🍫 Registrar cosecha</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selPlot.name} · {selPlot.variety}</div>
            <form onSubmit={saveHarvest}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                    <input type="date" value={harvestForm.date} onChange={e=>setHarvestForm({...harvestForm,date:e.target.value})} required style={inp}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>KG BABA (fresco)</label>
                    <input type="number" step="0.1" value={harvestForm.kgFresh} onChange={e=>setHarvestForm({...harvestForm,kgFresh:e.target.value})} required style={inp} placeholder="0"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>KG SECO</label>
                    <input type="number" step="0.1" value={harvestForm.kgDry} onChange={e=>setHarvestForm({...harvestForm,kgDry:e.target.value})} style={inp} placeholder="Opcional"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRECIO/KG (COP)</label>
                    <input type="number" value={harvestForm.pricePerKg} onChange={e=>setHarvestForm({...harvestForm,pricePerKg:e.target.value})} style={inp} placeholder="Opcional"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FERMENTACIÓN</label>
                    <select value={harvestForm.fermentationType} onChange={e=>setHarvestForm({...harvestForm,fermentationType:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {FERMENTATION_TYPES.map(f=><option key={f}>{f}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>DÍAS FERMENTACIÓN</label>
                    <input type="number" value={harvestForm.fermentationDays} onChange={e=>setHarvestForm({...harvestForm,fermentationDays:e.target.value})} style={inp} placeholder="5"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO SECADO</label>
                    <select value={harvestForm.dryingType} onChange={e=>setHarvestForm({...harvestForm,dryingType:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {DRYING_TYPES.map(d=><option key={d}>{d}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>DÍAS SECADO</label>
                    <input type="number" value={harvestForm.dryingDays} onChange={e=>setHarvestForm({...harvestForm,dryingDays:e.target.value})} style={inp} placeholder="7"/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setHarvestModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#7c3f1e', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar cosecha</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <IndustryGuard module="CACAO"><CacaoPage /></IndustryGuard>
}
