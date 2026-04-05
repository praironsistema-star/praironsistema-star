'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const PRODUCT_TYPES = ['aceite de palma','café pergamino','ganado en pie','leche','frutas','granos','caña','miel','peces','otro']
const CERT_TYPES = ['GlobalG.A.P.','Rainforest Alliance','Orgánico','UTZ','Fairtrade','Sin certificación']

const inputStyle: React.CSSProperties = {
  width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px',
  padding:'9px 12px', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7',
}
const card: React.CSSProperties = {
  background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px',
}

export default function TrazabilidadPage() {
  const [tab, setTab] = useState('dashboard')
  const [lots, setLots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [lotModal, setLotModal] = useState(false)
  const [eventModal, setEventModal] = useState(false)
  const [qrModal, setQrModal] = useState(false)
  const [selLot, setSelLot] = useState<any>(null)

  const [lotForm, setLotForm] = useState({
    code:'', product:'aceite de palma', quantity:'', unit:'kg',
    origin:'', harvestDate: new Date().toISOString().split('T')[0],
    certification:'Sin certificación', destination:'', notes:''
  })
  const [eventForm, setEventForm] = useState({
    date: new Date().toISOString().split('T')[0],
    type:'', description:'', responsible:'', notes:''
  })

  async function loadAll() {
    setLoading(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: res } = await supabase.from('traceability_lots').select('*,events:traceability_events(*)').is('deleted_at',null)
      setLots(res ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  function generateCode() {
    const date = new Date()
    const code = 'LOT-' + date.getFullYear() +
      String(date.getMonth()+1).padStart(2,'0') +
      String(date.getDate()).padStart(2,'0') + '-' +
      Math.random().toString(36).substring(2,6).toUpperCase()
    setLotForm(f => ({...f, code}))
  }

  async function saveLot(e: React.FormEvent) {
    e.preventDefault()
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('traceability_lots').insert({
        ...lotForm,
        quantity: parseFloat(lotForm.quantity),
      })
      setLotModal(false)
      setLotForm({ code:'', product:'aceite de palma', quantity:'', unit:'kg', origin:'', harvestDate: new Date().toISOString().split('T')[0], certification:'Sin certificación', destination:'', notes:'' })
      loadAll(); toastSuccess('Lote de trazabilidad creado')
    } catch { toastError('Error al crear lote') }
  }

  async function saveEvent(e: React.FormEvent) {
    e.preventDefault()
    if (!selLot) return
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('traceability_events').insert({...eventForm,lot_id:selLot.id})
      setEventModal(false)
      setEventForm({ date: new Date().toISOString().split('T')[0], type:'', description:'', responsible:'', notes:'' })
      loadAll(); toastSuccess('Evento registrado en la cadena')
    } catch { toastError('Error al registrar evento') }
  }

  async function deleteLot(id: string, code: string) {
    const ok = await confirm({ title:'Eliminar lote', message:`¿Eliminar el lote "${code}"?`, danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
      const { supabase } = await import('@/lib/supabase')
      await supabase.from('traceability_lots').update({deleted_at:new Date().toISOString()}).eq('id',id)
      loadAll(); toastSuccess('Lote eliminado')
    } catch { toastError('Error al eliminar') }
  }

  // Generar QR como SVG simple (sin librería externa)
  function getQRUrl(lot: any) {
    const text = encodeURIComponent(
      `PRAIRON | Lote: ${lot.code} | Producto: ${lot.product} | Origen: ${lot.origin || 'N/A'} | Cosecha: ${lot.harvestDate} | Cert: ${lot.certification}`
    )
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${text}`
  }

  const certColor: Record<string,string> = {
    'GlobalG.A.P.':'#185fa5', 'Rainforest Alliance':'#036446',
    'Orgánico':'#059669', 'UTZ':'#b45309', 'Fairtrade':'#7c3aed',
    'Sin certificación':'#9b9b97'
  }
  const certBg: Record<string,string> = {
    'GlobalG.A.P.':'#e6f1fb', 'Rainforest Alliance':'#e8f5ef',
    'Orgánico':'#d1fae5', 'UTZ':'#fef3c7', 'Fairtrade':'#f5f3ff',
    'Sin certificación':'#f9f9f7'
  }

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Trazabilidad QR</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Lotes de producción, cadena de custodia y certificaciones</p>
        </div>
        <button onClick={() => { generateCode(); setLotModal(true) }}
          style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
          + Nuevo lote
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','lotes'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t?'500':'400', color: tab===t?'#036446':'#9b9b97', borderBottom: tab===t?'2px solid #036446':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit', textTransform:'capitalize' }}>
            {t === 'dashboard' ? 'Dashboard' : 'Lotes'}
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
                  { label:'Lotes registrados', value: lots.length, color:'#036446' },
                  { label:'Con certificación', value: lots.filter(l => l.certification !== 'Sin certificación').length, color:'#185fa5' },
                  { label:'Productos distintos', value: [...new Set(lots.map(l => l.product))].length, color:'#b45309' },
                  { label:'QR generados', value: lots.length, color:'#7c3aed' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize:'26px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {lots.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🔗</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin lotes de trazabilidad</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Crea lotes para generar QR y registrar la cadena de custodia completa</div>
                  <button onClick={() => { generateCode(); setLotModal(true) }}
                    style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>
                    Crear primer lote
                  </button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {lots.map((l: any) => (
                    <div key={l.id} style={card}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:'600', color:'#1a1a18', fontFamily:'monospace' }}>{l.code}</div>
                          <div style={{ fontSize:'11px', color:'#9b9b97', marginTop:'2px' }}>{l.product}</div>
                        </div>
                        <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'20px', background: certBg[l.certification] || '#f9f9f7', color: certColor[l.certification] || '#9b9b97', fontWeight:'500' }}>
                          {l.certification}
                        </span>
                      </div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'14px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{(l.quantity || 0).toLocaleString()} {l.unit}</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>cantidad</div>
                        </div>
                        <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px' }}>
                          <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>{l._count?.events || 0}</div>
                          <div style={{ fontSize:'10px', color:'#9b9b97' }}>eventos</div>
                        </div>
                      </div>
                      {l.origin && <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'8px' }}>📍 {l.origin}</div>}
                      <div style={{ display:'flex', gap:'4px' }}>
                        <button onClick={() => { setSelLot(l); setQrModal(true) }}
                          style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #d1fae5', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#036446' }}>
                          📱 Ver QR
                        </button>
                        <button onClick={() => { setSelLot(l); setEventModal(true) }}
                          style={{ flex:1, fontSize:'10px', padding:'5px', border:'0.5px solid #bfdbfe', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#185fa5' }}>
                          + Evento
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* LOTES */}
          {tab === 'lotes' && (
            <div>
              {lots.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>📦</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin lotes</div>
                  <button onClick={() => { generateCode(); setLotModal(true) }}
                    style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>
                    Crear lote
                  </button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Código','Producto','Cantidad','Origen','Cosecha','Certificación','Eventos','Acciones'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lots.map((l: any) => (
                        <tr key={l.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px', fontSize:'12px', fontWeight:'600', color:'#1a1a18', fontFamily:'monospace' }}>{l.code}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{l.product}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#1a1a18' }}>{(l.quantity || 0).toLocaleString()} {l.unit}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{l.origin || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{l.harvestDate ? new Date(l.harvestDate).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' }) : '—'}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'20px', background: certBg[l.certification] || '#f9f9f7', color: certColor[l.certification] || '#9b9b97' }}>
                              {l.certification}
                            </span>
                          </td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#1a1a18' }}>{l._count?.events || 0}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:'4px' }}>
                              <button onClick={() => { setSelLot(l); setQrModal(true) }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #d1fae5', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#036446' }}>QR</button>
                              <button onClick={() => { setSelLot(l); setEventModal(true) }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #bfdbfe', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#185fa5' }}>Evento</button>
                              <button onClick={() => deleteLot(l.id, l.code)} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
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

      {/* Modal: Nuevo lote */}
      {lotModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'500px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo lote de trazabilidad</div>
            <form onSubmit={saveLot}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto', gap:'10px', alignItems:'end' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CÓDIGO DE LOTE</label>
                    <input value={lotForm.code} onChange={e => setLotForm({...lotForm, code:e.target.value})} required style={{...inputStyle, fontFamily:'monospace'}} placeholder="LOT-20240101-XXXX" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <button type="button" onClick={generateCode} style={{ fontSize:'11px', padding:'9px 12px', border:'0.5px solid #036446', borderRadius:'7px', background:'transparent', color:'#036446', cursor:'pointer', whiteSpace:'nowrap' }}>
                    🔄 Generar
                  </button>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRODUCTO</label>
                    <select value={lotForm.product} onChange={e => setLotForm({...lotForm, product:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                      {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UNIDAD</label>
                    <select value={lotForm.unit} onChange={e => setLotForm({...lotForm, unit:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                      {['kg','ton','litros','unidades','cajas'].map(u => <option key={u} value={u}>{u}</option>)}
                    </select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD</label>
                    <input type="number" step="0.01" value={lotForm.quantity} onChange={e => setLotForm({...lotForm, quantity:e.target.value})} required style={inputStyle} placeholder="0" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA DE COSECHA</label>
                    <input type="date" value={lotForm.harvestDate} onChange={e => setLotForm({...lotForm, harvestDate:e.target.value})} required style={inputStyle}/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ORIGEN / FINCA</label>
                    <input value={lotForm.origin} onChange={e => setLotForm({...lotForm, origin:e.target.value})} style={inputStyle} placeholder="Finca La Esperanza" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>DESTINO</label>
                    <input value={lotForm.destination} onChange={e => setLotForm({...lotForm, destination:e.target.value})} style={inputStyle} placeholder="Extractora / Exportación" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CERTIFICACIÓN</label>
                  <select value={lotForm.certification} onChange={e => setLotForm({...lotForm, certification:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                    {CERT_TYPES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={lotForm.notes} onChange={e => setLotForm({...lotForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setLotModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo evento */}
      {eventModal && selLot && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'420px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>Registrar evento</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px', fontFamily:'monospace' }}>{selLot.code} · {selLot.product}</div>
            <form onSubmit={saveEvent}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                    <input type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date:e.target.value})} required style={inputStyle}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO DE EVENTO</label>
                    <input value={eventForm.type} onChange={e => setEventForm({...eventForm, type:e.target.value})} required style={inputStyle} placeholder="Cosecha, Transporte, Proceso..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>DESCRIPCIÓN</label>
                  <input value={eventForm.description} onChange={e => setEventForm({...eventForm, description:e.target.value})} required style={inputStyle} placeholder="Descripción del evento en la cadena" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>RESPONSABLE</label>
                  <input value={eventForm.responsible} onChange={e => setEventForm({...eventForm, responsible:e.target.value})} style={inputStyle} placeholder="Nombre o cargo" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={eventForm.notes} onChange={e => setEventForm({...eventForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones adicionales..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setEventModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar evento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Ver QR */}
      {qrModal && selLot && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'32px', width:'360px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)', textAlign:'center' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'4px' }}>📱 Código QR</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px', fontFamily:'monospace' }}>{selLot.code}</div>
            <div style={{ display:'flex', justifyContent:'center', marginBottom:'16px' }}>
              <img
                src={getQRUrl(selLot)}
                alt={`QR ${selLot.code}`}
                width={200} height={200}
                style={{ border:'0.5px solid #e5e5e3', borderRadius:'8px', padding:'8px' }}
              />
            </div>
            <div style={{ background:'#f9f9f7', borderRadius:'8px', padding:'12px', marginBottom:'20px', textAlign:'left' }}>
              <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', letterSpacing:'0.06em' }}>INFORMACIÓN DEL LOTE</div>
              {[
                { label:'Producto', value: selLot.product },
                { label:'Cantidad', value: `${(selLot.quantity || 0).toLocaleString()} ${selLot.unit}` },
                { label:'Origen', value: selLot.origin || 'N/A' },
                { label:'Cosecha', value: selLot.harvestDate ? new Date(selLot.harvestDate).toLocaleDateString('es-CO') : 'N/A' },
                { label:'Certificación', value: selLot.certification },
              ].map(item => (
                <div key={item.label} style={{ display:'flex', justifyContent:'space-between', fontSize:'12px', marginBottom:'4px' }}>
                  <span style={{ color:'#9b9b97' }}>{item.label}</span>
                  <span style={{ color:'#1a1a18', fontWeight:'500' }}>{item.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
              <button onClick={() => window.print()}
                style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #036446', borderRadius:'6px', background:'transparent', color:'#036446', cursor:'pointer' }}>
                🖨️ Imprimir
              </button>
              <button onClick={() => setQrModal(false)}
                style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
