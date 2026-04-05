'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const card: React.CSSProperties = { background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }
const inp: React.CSSProperties = { width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7' }

const ESTADO_REINA = ['Presente activa','Presente inactiva','Huérfana','No verificada']
const ESTADO_COLMENA = ['Fuerte','Media','Débil','Enjambre','Cuarentena']

export default function ApiculturaPage() {
  const [tab, setTab] = useState('dashboard')
  const [colmenas, setColmenas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [revModal, setRevModal] = useState(false)
  const [selCol, setSelCol] = useState<any>(null)
  const [form, setForm] = useState({ codigo:'', ubicacion:'', fechaInstalacion: new Date().toISOString().split('T')[0], estadoReina:'Presente activa', estado:'Fuerte', notas:'' })
  const [revForm, setRevForm] = useState({ fecha: new Date().toISOString().split('T')[0], estadoReina:'Presente activa', estadoColmena:'Fuerte', produccionMiel:'', varroa:'', tratamiento:'', notas:'' })

  async function loadAll() {
    setLoading(true)
    try {       const { data } = await api.get('/hives'); setColmenas(data||[]) }
    finally { setLoading(false) }
  }
  useEffect(() => { loadAll() }, [])

  async function saveColmena(e: React.FormEvent) {
    e.preventDefault()
    try {       await api.post('/hives', form); setModal(false); loadAll(); toastSuccess('Colmena registrada') }
    catch { toastError('Error al registrar colmena') }
  }

  async function saveRevision(e: React.FormEvent) {
    e.preventDefault()
    if (!selCol) return
    try {       await api.post('/inspections', {...revForm,hive_id:selCol.id}); setRevModal(false); loadAll(); toastSuccess('Revisión registrada') }
    catch { toastError('Error al registrar revisión') }
  }

  async function deleteColmena(id: string, codigo: string) {
    const ok = await confirm({ title:'Eliminar colmena', message:`¿Eliminar colmena "${codigo}"?`, danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {       await api.patch('/hives/id', {deleted_at:new Date().toISOString()}); loadAll(); toastSuccess('Colmena eliminada') }
    catch { toastError('Error al eliminar') }
  }

  const estadoColor: Record<string,string> = { 'Fuerte':'#059669','Media':'#d97706','Débil':'#dc2626','Enjambre':'#7c3aed','Cuarentena':'#6b7280' }
  const estadoBg: Record<string,string>    = { 'Fuerte':'#d1fae5','Media':'#fef3c7','Débil':'#fee2e2','Enjambre':'#ede9fe','Cuarentena':'#f3f4f6' }

  const totalMiel = colmenas.reduce((s,c) => s + (c.ultimaProduccion || 0), 0)
  const colFuertes = colmenas.filter(c => c.estado === 'Fuerte').length
  const conVarroa  = colmenas.filter(c => c.varroaDetectada).length

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>🍯 Apicultura</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Colmenas, revisiones, producción de miel y sanidad</p>
        </div>
        <button onClick={() => setModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#d97706', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Nueva colmena</button>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','colmenas'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight:tab===t?'500':'400', color:tab===t?'#d97706':'#9b9b97', borderBottom:tab===t?'2px solid #d97706':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit', textTransform:'capitalize' }}>{t}</button>
        ))}
      </div>

      {loading ? <div style={{ color:'#9b9b97', fontSize:'13px', padding:'40px', textAlign:'center' }}>Cargando...</div> : (
        <>
          {tab === 'dashboard' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px', marginBottom:'20px' }}>
                {[
                  { label:'Total colmenas', value: colmenas.length, color:'#d97706' },
                  { label:'Colmenas fuertes', value: colFuertes, color:'#059669' },
                  { label:'Miel total (kg)', value: totalMiel.toFixed(1), color:'#d97706' },
                  { label:'Con varroa', value: conVarroa, color:'#dc2626' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize:'26px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              {colmenas.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'40px', marginBottom:'12px' }}>🐝</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin colmenas registradas</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Registra tus colmenas para hacer seguimiento de revisiones, producción de miel y sanidad varroa</div>
                  <button onClick={() => setModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#d97706', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar primera colmena</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'12px' }}>
                  {colmenas.map((c: any) => (
                    <div key={c.id} style={card}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:'600', color:'#1a1a18', fontFamily:'monospace' }}>{c.codigo}</div>
                          <div style={{ fontSize:'11px', color:'#9b9b97', marginTop:'2px' }}>{c.ubicacion || 'Sin ubicación'}</div>
                        </div>
                        <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'20px', background: estadoBg[c.estado]||'#f9f9f7', color: estadoColor[c.estado]||'#9b9b97', fontWeight:'500' }}>{c.estado}</span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                        <div style={{ background:'#fef9c3', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'14px', fontWeight:'500', color:'#d97706', fontFamily:'monospace' }}>{(c.ultimaProduccion||0).toFixed(1)} kg</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>última cosecha</div>
                        </div>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{c.estadoReina || '—'}</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>estado reina</div>
                        </div>
                      </div>
                      {c.varroaDetectada && <div style={{ fontSize:'11px', color:'#dc2626', marginBottom:'8px', background:'#fee2e2', padding:'4px 8px', borderRadius:'4px' }}>⚠️ Varroa detectada</div>}
                      <div style={{ display:'flex', gap:'4px' }}>
                        <button onClick={() => { setSelCol(c); setRevModal(true) }} style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #fde68a', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#d97706' }}>+ Revisión</button>
                        <button onClick={() => deleteColmena(c.id, c.codigo)} style={{ fontSize:'10px', padding:'5px 8px', border:'0.5px solid #fecaca', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'colmenas' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {colmenas.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px', color:'#9b9b97', fontSize:'13px' }}>Sin colmenas. <button onClick={()=>setModal(true)} style={{ color:'#d97706', background:'none', border:'none', cursor:'pointer', fontSize:'13px' }}>Registrar ahora →</button></div>
              ) : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Código','Ubicación','Estado','Reina','Última miel','Varroa','Acciones'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {colmenas.map((c:any) => (
                      <tr key={c.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                        <td style={{ padding:'10px 14px', fontSize:'12px', fontWeight:'600', fontFamily:'monospace' }}>{c.codigo}</td>
                        <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{c.ubicacion||'—'}</td>
                        <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:'20px', background:estadoBg[c.estado]||'#f9f9f7', color:estadoColor[c.estado]||'#9b9b97' }}>{c.estado}</span></td>
                        <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{c.estadoReina||'—'}</td>
                        <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace' }}>{(c.ultimaProduccion||0).toFixed(1)} kg</td>
                        <td style={{ padding:'10px 14px', fontSize:'12px' }}>{c.varroaDetectada ? <span style={{ color:'#dc2626' }}>⚠️ Sí</span> : <span style={{ color:'#059669' }}>✓ No</span>}</td>
                        <td style={{ padding:'10px 14px' }}>
                          <div style={{ display:'flex', gap:'4px' }}>
                            <button onClick={() => { setSelCol(c); setRevModal(true) }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fde68a', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#d97706' }}>Revisión</button>
                            <button onClick={() => deleteColmena(c.id, c.codigo)} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal nueva colmena */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nueva colmena</div>
            <form onSubmit={saveColmena}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CÓDIGO</label><input required value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})} style={inp} placeholder="COL-001"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UBICACIÓN / APIARIO</label><input value={form.ubicacion} onChange={e=>setForm({...form,ubicacion:e.target.value})} style={inp} placeholder="Apiario Norte"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESTADO REINA</label>
                    <select value={form.estadoReina} onChange={e=>setForm({...form,estadoReina:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {ESTADO_REINA.map(s=><option key={s}>{s}</option>)}
                    </select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESTADO COLMENA</label>
                    <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {ESTADO_COLMENA.map(s=><option key={s}>{s}</option>)}
                    </select></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA DE INSTALACIÓN</label><input type="date" value={form.fechaInstalacion} onChange={e=>setForm({...form,fechaInstalacion:e.target.value})} style={inp}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label><input value={form.notas} onChange={e=>setForm({...form,notas:e.target.value})} style={inp} placeholder="Observaciones..."/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#d97706', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar colmena</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal revisión */}
      {revModal && selCol && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'4px' }}>Registrar revisión</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px', fontFamily:'monospace' }}>{selCol.codigo} · {selCol.ubicacion}</div>
            <form onSubmit={saveRevision}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label><input type="date" value={revForm.fecha} onChange={e=>setRevForm({...revForm,fecha:e.target.value})} required style={inp}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRODUCCIÓN MIEL (kg)</label><input type="number" step="0.1" value={revForm.produccionMiel} onChange={e=>setRevForm({...revForm,produccionMiel:e.target.value})} style={inp} placeholder="0.0"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESTADO REINA</label>
                    <select value={revForm.estadoReina} onChange={e=>setRevForm({...revForm,estadoReina:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {ESTADO_REINA.map(s=><option key={s}>{s}</option>)}
                    </select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESTADO COLMENA</label>
                    <select value={revForm.estadoColmena} onChange={e=>setRevForm({...revForm,estadoColmena:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {ESTADO_COLMENA.map(s=><option key={s}>{s}</option>)}
                    </select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NIVEL VARROA</label><input value={revForm.varroa} onChange={e=>setRevForm({...revForm,varroa:e.target.value})} style={inp} placeholder="%, conteo..."/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TRATAMIENTO</label><input value={revForm.tratamiento} onChange={e=>setRevForm({...revForm,tratamiento:e.target.value})} style={inp} placeholder="Oxálico, Amitraz..."/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label><input value={revForm.notas} onChange={e=>setRevForm({...revForm,notas:e.target.value})} style={inp} placeholder="Observaciones de la revisión..."/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setRevModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#d97706', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar revisión</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
