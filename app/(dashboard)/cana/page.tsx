'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const VARIETY_TYPES = ['CC 85-92','CC 93-4418','CC 01-1940','CP 57-614','B 76-78','RD 75-11','otro']
const CUT_TYPES = ['mecanizado','manual','mixto']

const inputStyle: React.CSSProperties = {
  width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px',
  padding:'9px 12px', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7',
}
const card: React.CSSProperties = {
  background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px',
}

export default function CanaPage() {
  const [tab, setTab] = useState('dashboard')
  const [suertes, setSuertes] = useState<any[]>([])
  const [cuts, setCuts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [suerteModal, setSuerteModal] = useState(false)
  const [cutModal, setCutModal] = useState(false)
  const [simModal, setSimModal] = useState(false)
  const [selSuerte, setSelSuerte] = useState<any>(null)

  const [suerteForm, setSuerteForm] = useState({ name:'', variety:'CC 85-92', area:'', plantDate: new Date().toISOString().split('T')[0], notes:'' })
  const [cutForm, setCutForm] = useState({ date: new Date().toISOString().split('T')[0], toneladas:'', pol:'', tch:'', cutType:'manual', contractor:'', cost:'', notes:'' })
  const [sim, setSim] = useState({ pol:'14', tch:'120', priceTon:'180000', area:'1' })
  const [simResult, setSimResult] = useState<number|null>(null)

  async function loadAll() {
    setLoading(true)
    try {
      const [s, c] = await Promise.allSettled([
        supabase.from('plots').select('*,cuts(*)').eq('crop_type','cana').is('deleted_at',null),
        supabase.from('cuts').select('*').is('deleted_at',null),
      ])
      if (s.status === 'fulfilled') setSuertes(s.value.data)
      if (c.status === 'fulfilled') setCuts(c.value.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  async function saveSuerte(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('plots').insert({...suerteForm,crop_type:'cana',area:parseFloat(suerteForm.area)})
      setSuerteModal(false); loadAll(); toastSuccess('Suerte registrada')
    } catch { toastError('Error al registrar suerte') }
  }

  async function saveCut(e: React.FormEvent) {
    e.preventDefault()
    if (!selSuerte) return
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('cuts').insert({plot_id:selSuerte.id,
        ...cutForm,
        toneladas: parseFloat(cutForm.toneladas),
        pol: cutForm.pol ? parseFloat(cutForm.pol) : null,
        tch: cutForm.tch ? parseFloat(cutForm.tch) : null,
        cost: cutForm.cost ? parseFloat(cutForm.cost) : null,
      })
      setCutModal(false); loadAll(); toastSuccess('Corte registrado')
    } catch { toastError('Error al registrar corte') }
  }

  async function deleteSuerte(id: string, name: string) {
    const ok = await confirm({ title:'Eliminar suerte', message:`¿Eliminar "${name}"?`, danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('plots').update({deleted_at:new Date().toISOString()}).eq('id',id)
      loadAll(); toastSuccess('Suerte eliminada')
    } catch { toastError('Error al eliminar') }
  }

  function calcularSimulacion() {
    const pol = parseFloat(sim.pol)
    const tch = parseFloat(sim.tch)
    const price = parseFloat(sim.priceTon)
    const area = parseFloat(sim.area)
    if (!pol || !tch || !price || !area) return
    // Fórmula simplificada: toneladas = TCH × área, valor = toneladas × precio
    const toneladas = tch * area
    const valor = toneladas * price
    setSimResult(valor)
  }

  const totalArea = suertes.reduce((s, x) => s + (x.area || 0), 0)
  const totalTon = cuts.reduce((s, c) => s + (c.toneladas || 0), 0)

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Caña de Azúcar</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Suertes, cortes, POL/TCH y simulador de liquidación</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => setSimModal(true)} style={{ fontSize:'12px', padding:'8px 14px', border:'0.5px solid #185fa5', borderRadius:'6px', background:'transparent', color:'#185fa5', cursor:'pointer', fontWeight:'500' }}>
            🧮 Simulador
          </button>
          <button onClick={() => setSuerteModal(true)} style={{ fontSize:'12px', padding:'8px 14px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
            + Suerte
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','suertes','cortes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t?'500':'400', color: tab===t?'#036446':'#9b9b97', borderBottom: tab===t?'2px solid #036446':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit', textTransform:'capitalize' }}>
            {t === 'dashboard' ? 'Dashboard' : t === 'suertes' ? 'Suertes' : 'Cortes'}
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
                  { label:'Suertes registradas', value: suertes.length, color:'#036446' },
                  { label:'Área total (ha)', value: totalArea.toFixed(1), color:'#185fa5' },
                  { label:'Toneladas cortadas', value: totalTon.toLocaleString(), color:'#b45309' },
                  { label:'Cortes registrados', value: cuts.length, color:'#036446' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize:'26px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {suertes.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🌾</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin suertes registradas</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Registra tu primera suerte de caña para comenzar</div>
                  <button onClick={() => setSuerteModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar suerte</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {suertes.map((s: any) => {
                    const age = s.plantDate ? Math.floor((new Date().getTime() - new Date(s.plantDate).getTime()) / (1000*60*60*24*30)) : null
                    return (
                      <div key={s.id} style={card}>
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                          <div>
                            <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18' }}>{s.name}</div>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>{s.variety} · {age !== null ? age + ' meses' : 'Sin fecha'}</div>
                          </div>
                          <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446', fontWeight:'500', height:'fit-content' }}>{s.area}ha</span>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                          <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                            <div style={{ fontSize:'16px', fontWeight:'500', color:'#b45309', fontFamily:'monospace' }}>{s._count?.cuts || 0}</div>
                            <div style={{ fontSize:'10px', color:'#9b9b97' }}>cortes</div>
                          </div>
                          <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                            <div style={{ fontSize:'16px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{(s.totalToneladas || 0).toFixed(0)}t</div>
                            <div style={{ fontSize:'10px', color:'#9b9b97' }}>toneladas</div>
                          </div>
                        </div>
                        <button onClick={() => { setSelSuerte(s); setCutModal(true) }}
                          style={{ width:'100%', fontSize:'11px', padding:'6px', border:'0.5px solid #d1fae5', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#036446', fontWeight:'500' }}>
                          🌾 Registrar corte
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* SUERTES */}
          {tab === 'suertes' && (
            <div>
              {suertes.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🌾</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin suertes</div>
                  <button onClick={() => setSuerteModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar suerte</button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Suerte','Variedad','Área (ha)','Siembra','Cortes','Toneladas','Acciones'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {suertes.map((s: any) => (
                        <tr key={s.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{s.name}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446' }}>{s.variety}</span></td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#1a1a18' }}>{s.area}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{s.plantDate ? new Date(s.plantDate).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' }) : '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#1a1a18' }}>{s._count?.cuts || 0}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#b45309', fontFamily:'monospace' }}>{(s.totalToneladas || 0).toFixed(1)}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button onClick={() => { setSelSuerte(s); setCutModal(true) }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #d1fae5', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#036446' }}>Corte</button>
                              <button onClick={() => deleteSuerte(s.id, s.name)} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
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

          {/* CORTES */}
          {tab === 'cortes' && (
            <div>
              {cuts.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>✂️</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin cortes registrados</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97' }}>Selecciona una suerte desde el Dashboard para registrar un corte</div>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Fecha','Suerte','Toneladas','POL (%)','TCH','Tipo','Contratista','Costo'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {cuts.map((c: any) => (
                        <tr key={c.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(c.date).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{c.suerte?.name || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#b45309', fontFamily:'monospace' }}>{c.toneladas}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', fontFamily:'monospace' }}>{c.pol || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', fontFamily:'monospace' }}>{c.tch || '—'}</td>
                          <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446' }}>{c.cutType}</span></td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{c.contractor || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{c.cost ? '$' + parseFloat(c.cost).toLocaleString() : '—'}</td>
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

      {/* Modal: Nueva suerte */}
      {suerteModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nueva suerte</div>
            <form onSubmit={saveSuerte}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE / CÓDIGO</label>
                  <input value={suerteForm.name} onChange={e => setSuerteForm({...suerteForm, name:e.target.value})} required style={inputStyle} placeholder="Suerte 1-A" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>VARIEDAD</label>
                  <select value={suerteForm.variety} onChange={e => setSuerteForm({...suerteForm, variety:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {VARIETY_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'12px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ÁREA (ha)</label>
                  <input type="number" step="0.01" value={suerteForm.area} onChange={e => setSuerteForm({...suerteForm, area:e.target.value})} required style={inputStyle} placeholder="5.0" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA DE SIEMBRA</label>
                  <input type="date" value={suerteForm.plantDate} onChange={e => setSuerteForm({...suerteForm, plantDate:e.target.value})} style={inputStyle}/></div>
              </div>
              <div style={{ marginBottom:'16px' }}><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                <input value={suerteForm.notes} onChange={e => setSuerteForm({...suerteForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setSuerteModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Corte */}
      {cutModal && selSuerte && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>🌾 Registrar corte</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selSuerte.name} · {selSuerte.variety} · {selSuerte.area}ha</div>
            <form onSubmit={saveCut}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                    <input type="date" value={cutForm.date} onChange={e => setCutForm({...cutForm, date:e.target.value})} required style={inputStyle}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO DE CORTE</label>
                    <select value={cutForm.cutType} onChange={e => setCutForm({...cutForm, cutType:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                      {CUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TONELADAS</label>
                    <input type="number" step="0.1" value={cutForm.toneladas} onChange={e => setCutForm({...cutForm, toneladas:e.target.value})} required style={inputStyle} placeholder="0"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>POL (%)</label>
                    <input type="number" step="0.01" value={cutForm.pol} onChange={e => setCutForm({...cutForm, pol:e.target.value})} style={inputStyle} placeholder="14.0"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TCH</label>
                    <input type="number" step="0.1" value={cutForm.tch} onChange={e => setCutForm({...cutForm, tch:e.target.value})} style={inputStyle} placeholder="120"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CONTRATISTA</label>
                    <input value={cutForm.contractor} onChange={e => setCutForm({...cutForm, contractor:e.target.value})} style={inputStyle} placeholder="Nombre contratista"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>COSTO (COP)</label>
                    <input type="number" value={cutForm.cost} onChange={e => setCutForm({...cutForm, cost:e.target.value})} style={inputStyle} placeholder="Opcional"/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={cutForm.notes} onChange={e => setCutForm({...cutForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones..."/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setCutModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar corte</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Simulador liquidación */}
      {simModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'420px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'4px' }}>🧮 Simulador de liquidación</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>Estima el valor de tu cosecha antes del ingenio</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>POL (%)</label>
                  <input type="number" step="0.1" value={sim.pol} onChange={e => setSim({...sim, pol:e.target.value})} style={inputStyle} placeholder="14.0"/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TCH (ton/ha)</label>
                  <input type="number" step="0.1" value={sim.tch} onChange={e => setSim({...sim, tch:e.target.value})} style={inputStyle} placeholder="120"/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRECIO/TON (COP)</label>
                  <input type="number" value={sim.priceTon} onChange={e => setSim({...sim, priceTon:e.target.value})} style={inputStyle} placeholder="180000"/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ÁREA (ha)</label>
                  <input type="number" step="0.1" value={sim.area} onChange={e => setSim({...sim, area:e.target.value})} style={inputStyle} placeholder="1"/></div>
              </div>
              <button onClick={calcularSimulacion} style={{ padding:'10px', background:'#185fa5', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontSize:'13px', fontWeight:'500' }}>
                Calcular liquidación estimada
              </button>
              {simResult !== null && (
                <div style={{ background:'#e8f5ef', borderRadius:'8px', padding:'16px', textAlign:'center' }}>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'4px' }}>VALOR ESTIMADO</div>
                  <div style={{ fontSize:'28px', fontWeight:'600', color:'#036446', fontFamily:'monospace' }}>
                    ${simResult.toLocaleString('es-CO')}
                  </div>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginTop:'4px' }}>
                    {(parseFloat(sim.tch) * parseFloat(sim.area)).toFixed(1)} toneladas × ${parseFloat(sim.priceTon).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end' }}>
              <button onClick={() => { setSimModal(false); setSimResult(null) }} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
