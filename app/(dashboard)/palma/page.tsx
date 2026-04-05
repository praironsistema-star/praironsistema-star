'use client'
import { supabase } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast'

const inputStyle: React.CSSProperties = {
  width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px',
  padding:'9px 12px', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7',
}

const LAB_TYPES = ['suelo','aceite','agua','foliar','genetico']

export default function PalmaPage() {
  const [tab, setTab]             = useState('dashboard')
  const [dashboard, setDashboard] = useState<any>(null)
  const [plots, setPlots]         = useState<any[]>([])
  const [harvests, setHarvests]   = useState<any[]>([])
  const [extractions, setExtr]    = useState<any[]>([])
  const [labTests, setLab]        = useState<any[]>([])
  const [loading, setLoading]     = useState(true)

  const [plotModal,    setPlotModal]    = useState(false)
  const [harvestModal, setHarvestModal] = useState(false)
  const [extrModal,    setExtrModal]    = useState(false)
  const [labModal,     setLabModal]     = useState(false)

  const [plotForm,    setPlotForm]    = useState({ name:'', hectares:'', location:'', plantingYear:'', variety:'' })
  const [harvestForm, setHarvestForm] = useState({ plotId:'', date: new Date().toISOString().split('T')[0], weightTons:'', bunches:'', qualityGrade:'', notes:'' })
  const [extrForm,    setExtrForm]    = useState({ date: new Date().toISOString().split('T')[0], inputWeight:'', oilOutput:'', kernelOutput:'', notes:'' })
  const [labForm,     setLabForm]     = useState({ type:'aceite', date: new Date().toISOString().split('T')[0], laboratory:'', interpretation:'', notes:'' })

  async function loadAll() {
    setLoading(true)
    try {
      const [d, p, h, e, l] = await Promise.all([
        supabase.from('palm_plots').select('*').is('deleted_at',null),
        supabase.from('palm_plots').select('*').is('deleted_at',null),
        supabase.from('palm_harvests').select('*').is('deleted_at',null),
        supabase.from('palm_extractions').select('*').is('deleted_at',null),
        supabase.from('palm_lab').select('*').is('deleted_at',null),
      ])
      setDashboard(d.data); setPlots(p.data); setHarvests(h.data)
      setExtr(e.data); setLab(l.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  async function savePlot(e: React.FormEvent) {
    e.preventDefault()
    const { supabase } = await import('@/lib/supabase')
      await supabase.from('palm_plots').insert({...plotForm,hectares:parseFloat(plotForm.hectares),planting_year:plotForm.plantingYear?parseInt(plotForm.plantingYear):null})
    setPlotModal(false); loadAll(); toastSuccess('Lote de palma creado')
  }

  async function saveHarvest(e: React.FormEvent) {
    e.preventDefault()
    const { supabase } = await import('@/lib/supabase')
      await supabase.from('palm_harvests').insert({...harvestForm,weight_tons:parseFloat(harvestForm.weightTons),bunches:harvestForm.bunches?parseInt(harvestForm.bunches):null})
    setHarvestModal(false); loadAll(); toastSuccess('Cosecha FFB registrada')
  }

  async function saveExtraction(e: React.FormEvent) {
    e.preventDefault()
    const { supabase } = await import('@/lib/supabase')
      await supabase.from('palm_extractions').insert({...extrForm,input_weight:parseFloat(extrForm.inputWeight),oil_output:extrForm.oilOutput?parseFloat(extrForm.oilOutput):null,kernel_output:extrForm.kernelOutput?parseFloat(extrForm.kernelOutput):null})
    setExtrModal(false); loadAll(); toastSuccess('Lote de extracción registrado')
  }

  async function saveLab(e: React.FormEvent) {
    e.preventDefault()
    const { supabase } = await import('@/lib/supabase')
      await supabase.from('palm_lab').insert(labForm)
    setLabModal(false); loadAll(); toastSuccess('Análisis de laboratorio guardado')
  }

  const TABS = [
    { key:'dashboard', label:'Dashboard' },
    { key:'plots',     label:'Lotes palma' },
    { key:'harvests',  label:'Cosecha FFB' },
    { key:'extraction',label:'Extractora' },
    { key:'lab',       label:'Laboratorio' },
  ]

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Palma de aceite</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Vivero, lotes, cosecha FFB, extractora y laboratorio</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => setPlotModal(true)} style={{ fontSize:'12px', padding:'8px 14px', border:'0.5px solid #036446', borderRadius:'6px', background:'transparent', color:'#036446', cursor:'pointer', fontWeight:'500' }}>+ Lote</button>
          <button onClick={() => setHarvestModal(true)} disabled={plots.length === 0} style={{ fontSize:'12px', padding:'8px 14px', background: plots.length === 0 ? '#e5e5e3' : '#036446', color: plots.length === 0 ? '#9b9b97' : 'white', border:'none', borderRadius:'6px', cursor: plots.length === 0 ? 'not-allowed' : 'pointer', fontWeight:'500' }}>+ FFB</button>
          <button onClick={() => setExtrModal(true)} style={{ fontSize:'12px', padding:'8px 14px', border:'0.5px solid #185fa5', borderRadius:'6px', background:'transparent', color:'#185fa5', cursor:'pointer', fontWeight:'500' }}>+ Extracción</button>
          <button onClick={() => setLabModal(true)} style={{ fontSize:'12px', padding:'8px 14px', border:'0.5px solid #6d28d9', borderRadius:'6px', background:'transparent', color:'#6d28d9', cursor:'pointer', fontWeight:'500' }}>+ Lab</button>
        </div>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t.key?'500':'400', color: tab===t.key?'#036446':'#9b9b97', borderBottom: tab===t.key?'2px solid #036446':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit' }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color:'#9b9b97', fontSize:'13px', padding:'40px', textAlign:'center' }}>Cargando...</div>
      ) : (
        <>
          {/* ── DASHBOARD ── */}
          {tab === 'dashboard' && dashboard && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                {[
                  { label:'Lotes activos',        value: dashboard.summary.totalPlots, color:'#036446' },
                  { label:'Hectáreas totales',     value: dashboard.summary.totalHa + ' ha', color:'#036446' },
                  { label:'FFB total cosechado',   value: dashboard.summary.totalFFB.toFixed(1) + ' ton', color:'#185fa5' },
                  { label:'Eficiencia extracción', value: dashboard.summary.avgExtractionEfficiency + '%', color: dashboard.summary.avgExtractionEfficiency >= 20 ? '#036446' : '#b45309' },
                ].map(s => (
                  <div key={s.label} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                    <div style={{ fontSize:'24px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {dashboard.summary.totalPlots === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🌴</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin lotes de palma registrados</div>
                  <button onClick={() => setPlotModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear primer lote</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
                  <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                    <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18', marginBottom:'12px' }}>Cosechas recientes</div>
                    {dashboard.recentHarvests.length === 0 ? (
                      <div style={{ fontSize:'12px', color:'#9b9b97', textAlign:'center', padding:'20px 0' }}>Sin cosechas registradas</div>
                    ) : dashboard.recentHarvests.slice(0,5).map((h: any) => (
                      <div key={h.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid #f0f0ee', fontSize:'12px' }}>
                        <div>
                          <div style={{ fontWeight:'500', color:'#1a1a18' }}>{h.plot?.name}</div>
                          <div style={{ color:'#9b9b97' }}>{new Date(h.date).toLocaleDateString('es-CO', { day:'numeric', month:'short' })}</div>
                        </div>
                        <div style={{ fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{h.weightTons} ton</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                    <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18', marginBottom:'12px' }}>Lotes por rendimiento</div>
                    {dashboard.plots.map((p: any) => (
                      <div key={p.id} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'0.5px solid #f0f0ee', fontSize:'12px' }}>
                        <div>
                          <div style={{ fontWeight:'500', color:'#1a1a18' }}>{p.name}</div>
                          <div style={{ color:'#9b9b97' }}>{p.hectares} ha · {p.variety || 'Sin variedad'}</div>
                        </div>
                        <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446', height:'fit-content' }}>{p.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── LOTES ── */}
          {tab === 'plots' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
              {plots.length === 0 ? (
                <div style={{ gridColumn:'span 3', textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🌴</div>
                  <button onClick={() => setPlotModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Crear primer lote</button>
                </div>
              ) : plots.map((p: any) => (
                <div key={p.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'18px' }}>
                  <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18', marginBottom:'4px' }}>{p.name}</div>
                  <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'12px' }}>{p.location || 'Sin ubicación'} · {p.plantingYear || '—'}</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                    <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                      <div style={{ fontSize:'18px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{p.hectares}</div>
                      <div style={{ fontSize:'10px', color:'#9b9b97' }}>hectáreas</div>
                    </div>
                    <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                      <div style={{ fontSize:'18px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>{p._count?.harvests || 0}</div>
                      <div style={{ fontSize:'10px', color:'#9b9b97' }}>cosechas</div>
                    </div>
                  </div>
                  {p.variety && <div style={{ marginTop:'8px', fontSize:'11px', color:'#9b9b97' }}>Variedad: {p.variety}</div>}
                </div>
              ))}
            </div>
          )}

          {/* ── COSECHAS FFB ── */}
          {tab === 'harvests' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {harvests.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🌾</div>
                  <div style={{ fontSize:'14px', color:'#9b9b97' }}>Sin cosechas registradas</div>
                </div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead>
                    <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                      {['Fecha','Lote','Peso FFB (ton)','Racimos','Calidad','Notas'].map(h => (
                        <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {harvests.map((h: any) => (
                      <tr key={h.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                        <td style={{ padding:'10px 14px', fontSize:'13px', color:'#1a1a18' }}>{new Date(h.date).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })}</td>
                        <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{h.plot?.name || '—'}</td>
                        <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{h.weightTons}</td>
                        <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{h.bunches || '—'}</td>
                        <td style={{ padding:'10px 14px' }}>{h.qualityGrade ? <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446' }}>{h.qualityGrade}</span> : '—'}</td>
                        <td style={{ padding:'10px 14px', fontSize:'12px', color:'#9b9b97' }}>{h.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── EXTRACTORA ── */}
          {tab === 'extraction' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {extractions.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🏭</div>
                  <div style={{ fontSize:'14px', color:'#9b9b97', marginBottom:'16px' }}>Sin lotes de extracción registrados</div>
                  <button onClick={() => setExtrModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#185fa5', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar extracción</button>
                </div>
              ) : extractions.map((e: any) => (
                <div key={e.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
                    <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{new Date(e.date).toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' })}</div>
                    {e.efficiency && <span style={{ fontSize:'12px', fontWeight:'500', padding:'3px 12px', borderRadius:'20px', background: e.efficiency >= 20 ? '#e8f5ef' : '#fef3e2', color: e.efficiency >= 20 ? '#036446' : '#b45309' }}>Eficiencia: {e.efficiency}%</span>}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px' }}>
                    {[
                      { label:'Entrada FFB', value: e.inputWeight + ' ton', color:'#1a1a18' },
                      { label:'Aceite crudo', value: e.oilOutput ? e.oilOutput + ' ton' : '—', color:'#036446' },
                      { label:'Palmiste', value: e.kernelOutput ? e.kernelOutput + ' ton' : '—', color:'#185fa5' },
                      { label:'Análisis lab', value: e.labTests?.length + ' tests', color:'#6d28d9' },
                    ].map(s => (
                      <div key={s.label} style={{ background:'#f9f9f7', borderRadius:'6px', padding:'10px' }}>
                        <div style={{ fontSize:'16px', fontWeight:'500', color:s.color, fontFamily:'monospace' }}>{s.value}</div>
                        <div style={{ fontSize:'10px', color:'#9b9b97', marginTop:'2px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── LABORATORIO ── */}
          {tab === 'lab' && (
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {labTests.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🧪</div>
                  <div style={{ fontSize:'14px', color:'#9b9b97', marginBottom:'16px' }}>Sin análisis de laboratorio</div>
                  <button onClick={() => setLabModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#6d28d9', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar análisis</button>
                </div>
              ) : labTests.map((l: any) => (
                <div key={l.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <span style={{ fontSize:'11px', fontWeight:'500', padding:'3px 10px', borderRadius:'20px', background:'#ede9fe', color:'#6d28d9' }}>{l.type}</span>
                    <span style={{ fontSize:'12px', color:'#9b9b97' }}>{new Date(l.date).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })}</span>
                    {l.laboratory && <span style={{ fontSize:'12px', color:'#6b6b67' }}>· {l.laboratory}</span>}
                  </div>
                  {l.interpretation && <div style={{ fontSize:'13px', color:'#1a1a18', lineHeight:1.5 }}>{l.interpretation}</div>}
                  {l.notes && <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'6px' }}>{l.notes}</div>}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal: Nuevo lote de palma */}
      {plotModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'460px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo lote de palma</div>
            <form onSubmit={savePlot}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE DEL LOTE</label>
                  <input value={plotForm.name} onChange={e => setPlotForm({...plotForm, name:e.target.value})} required style={inputStyle} placeholder="Lote 1 Norte" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>HECTÁREAS</label>
                  <input type="number" value={plotForm.hectares} onChange={e => setPlotForm({...plotForm, hectares:e.target.value})} required min="0" step="0.1" style={inputStyle} placeholder="0" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UBICACIÓN</label>
                  <input value={plotForm.location} onChange={e => setPlotForm({...plotForm, location:e.target.value})} style={inputStyle} placeholder="Sector sur" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>AÑO SIEMBRA</label>
                  <input type="number" value={plotForm.plantingYear} onChange={e => setPlotForm({...plotForm, plantingYear:e.target.value})} style={inputStyle} placeholder="2018" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ marginBottom:'16px' }}><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>VARIEDAD</label>
                <input value={plotForm.variety} onChange={e => setPlotForm({...plotForm, variety:e.target.value})} style={inputStyle} placeholder="Ej: Tenera, Dura, Pisífera" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setPlotModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Cosecha FFB */}
      {harvestModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Registrar cosecha FFB</div>
            <form onSubmit={saveHarvest}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>LOTE</label>
                  <select value={harvestForm.plotId} onChange={e => setHarvestForm({...harvestForm, plotId:e.target.value})} required style={{...inputStyle, cursor:'pointer'}}>
                    <option value="">Seleccionar...</option>
                    {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                  <input type="date" value={harvestForm.date} onChange={e => setHarvestForm({...harvestForm, date:e.target.value})} required style={inputStyle}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PESO FFB (ton)</label>
                  <input type="number" value={harvestForm.weightTons} onChange={e => setHarvestForm({...harvestForm, weightTons:e.target.value})} required min="0" step="0.01" style={inputStyle} placeholder="0.00" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>RACIMOS</label>
                  <input type="number" value={harvestForm.bunches} onChange={e => setHarvestForm({...harvestForm, bunches:e.target.value})} min="0" style={inputStyle} placeholder="Opcional" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ marginBottom:'16px' }}><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CALIDAD</label>
                <input value={harvestForm.qualityGrade} onChange={e => setHarvestForm({...harvestForm, qualityGrade:e.target.value})} style={inputStyle} placeholder="Ej: A, B, Extra" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setHarvestModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar FFB</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Extracción */}
      {extrModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Lote de extracción</div>
            <form onSubmit={saveExtraction}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                  <input type="date" value={extrForm.date} onChange={e => setExtrForm({...extrForm, date:e.target.value})} required style={inputStyle}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ENTRADA FFB (ton)</label>
                  <input type="number" value={extrForm.inputWeight} onChange={e => setExtrForm({...extrForm, inputWeight:e.target.value})} required min="0" step="0.01" style={inputStyle} placeholder="0.00" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ACEITE CRUDO (ton)</label>
                  <input type="number" value={extrForm.oilOutput} onChange={e => setExtrForm({...extrForm, oilOutput:e.target.value})} min="0" step="0.001" style={inputStyle} placeholder="Opcional" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PALMISTE (ton)</label>
                  <input type="number" value={extrForm.kernelOutput} onChange={e => setExtrForm({...extrForm, kernelOutput:e.target.value})} min="0" step="0.001" style={inputStyle} placeholder="Opcional" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setExtrModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#185fa5', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar extracción</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Laboratorio */}
      {labModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Análisis de laboratorio</div>
            <form onSubmit={saveLab}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO DE ANÁLISIS</label>
                  <select value={labForm.type} onChange={e => setLabForm({...labForm, type:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {LAB_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                  <input type="date" value={labForm.date} onChange={e => setLabForm({...labForm, date:e.target.value})} required style={inputStyle}/></div>
              </div>
              <div style={{ marginBottom:'12px' }}><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>LABORATORIO</label>
                <input value={labForm.laboratory} onChange={e => setLabForm({...labForm, laboratory:e.target.value})} style={inputStyle} placeholder="Nombre del laboratorio" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              <div style={{ marginBottom:'16px' }}><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>INTERPRETACIÓN / RESULTADOS</label>
                <textarea value={labForm.interpretation} onChange={e => setLabForm({...labForm, interpretation:e.target.value})} rows={3} style={{...inputStyle, resize:'vertical'}} placeholder="Resultados e interpretación del análisis" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setLabModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#6d28d9', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar análisis</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
