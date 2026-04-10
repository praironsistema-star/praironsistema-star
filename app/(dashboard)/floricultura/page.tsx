'use client'
import { IndustryGuard } from '@/components/IndustryGuard'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'

const ESPECIES = ['rosa','clavel','crisantemo','lirio','gypsophila','alstroemeria','otro']
const CLASIFICACION = ['exportacion','nacional','descarte']
const inp: React.CSSProperties = { width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7' }

function FloriculturaPage() {
  const [tab, setTab] = useState('dashboard')
  const [bloques, setBloques] = useState<any[]>([])
  const [cosechas, setCosechas] = useState<any[]>([])
  const [pedidos, setPedidos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [bloqueModal, setBloqueModal] = useState(false)
  const [cosechaModal, setCosechaModal] = useState(false)
  const [pedidoModal, setPedidoModal] = useState(false)
  const [selBloque, setSelBloque] = useState<any>(null)
  const [bloqueForm, setBloqueForm] = useState({ nombre:'', especie:'rosa', variedad:'', areaM2:'', camas:'', plantYear:'' })
  const [cosechaForm, setCosechaForm] = useState({ fecha: new Date().toISOString().split('T')[0], tallosCorte:'', clasificacion:'exportacion', longitudCm:'', calidad:'premium', precioTallo:'' })
  const [pedidoForm, setPedidoForm] = useState({ cliente:'', especie:'rosa', variedad:'', tallosSolicitados:'', fechaPedido: new Date().toISOString().split('T')[0], fechaEntrega:'', precioUnitario:'' })

  async function loadAll() {
    setLoading(true)
    try {
      const [b, c, p] = await Promise.allSettled([api.get('/floricultura/bloques'), api.get('/floricultura/cosechas'), api.get('/floricultura/pedidos')])
      if (b.status === 'fulfilled') setBloques(b.value.data ?? [])
      if (c.status === 'fulfilled') setCosechas(c.value.data ?? [])
      if (p.status === 'fulfilled') setPedidos(p.value.data ?? [])
    } finally { setLoading(false) }
  }
  useEffect(() => { loadAll() }, [])

  async function saveBloque(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/floricultura/bloques', { ...bloqueForm, areaM2: parseFloat(bloqueForm.areaM2), camas: bloqueForm.camas ? parseInt(bloqueForm.camas) : null, plantYear: bloqueForm.plantYear ? parseInt(bloqueForm.plantYear) : null })
      setBloqueModal(false); loadAll(); toastSuccess('Bloque creado')
    } catch { toastError('Error al crear bloque') }
  }

  async function saveCosecha(e: React.FormEvent) {
    e.preventDefault()
    if (!selBloque) return
    try {
      await api.post('/floricultura/cosechas', { bloqueId: selBloque.id, ...cosechaForm, tallosCorte: parseInt(cosechaForm.tallosCorte), longitudCm: cosechaForm.longitudCm ? parseFloat(cosechaForm.longitudCm) : null, precioTallo: cosechaForm.precioTallo ? parseFloat(cosechaForm.precioTallo) : null })
      setCosechaModal(false); loadAll(); toastSuccess('Cosecha registrada')
    } catch { toastError('Error al registrar cosecha') }
  }

  async function savePedido(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/floricultura/pedidos', { ...pedidoForm, tallosSolicitados: parseInt(pedidoForm.tallosSolicitados), precioUnitario: pedidoForm.precioUnitario ? parseFloat(pedidoForm.precioUnitario) : null })
      setPedidoModal(false); loadAll(); toastSuccess('Pedido registrado')
    } catch { toastError('Error al registrar pedido') }
  }

  const totalTallos = cosechas.reduce((s,c) => s+(c.tallosCorte||0), 0)
  const totalAreaM2 = bloques.reduce((s,b) => s+(b.areaM2||0), 0)
  const pedidosPendientes = pedidos.filter(p => p.status === 'pendiente').length

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Floricultura 💐</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Bloques, cosechas y pedidos de flores de corte</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {tab === 'bloques' && <button onClick={() => setBloqueModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#be185d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Bloque</button>}
          {tab === 'cosechas' && <button onClick={() => { if(bloques.length){ setSelBloque(bloques[0]); setCosechaModal(true) } else toastError('Crea un bloque primero') }} style={{ fontSize:'12px', padding:'8px 16px', background:'#be185d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Cosecha</button>}
          {tab === 'pedidos' && <button onClick={() => setPedidoModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#be185d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Pedido</button>}
        </div>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','bloques','cosechas','pedidos'].map(t => <button key={t} onClick={() => setTab(t)} style={{ fontSize:'13px', padding:'8px 16px', background:'none', border:'none', borderBottom: tab===t ? '2px solid #be185d' : '2px solid transparent', color: tab===t ? '#be185d' : '#9b9b97', cursor:'pointer', fontWeight: tab===t ? '500' : '400', textTransform:'capitalize' }}>{t}</button>)}
      </div>

      {loading ? <div style={{ color:'#9b9b97', fontSize:'13px' }}>Cargando...</div> : (
        <>
          {tab === 'dashboard' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
              {[
                { label:'Bloques activos', value: bloques.length },
                { label:'Área total (m²)', value: Math.round(totalAreaM2).toLocaleString() },
                { label:'Tallos cosechados', value: totalTallos.toLocaleString() },
                { label:'Pedidos pendientes', value: pedidosPendientes },
              ].map(k => (
                <div key={k.label} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', textTransform:'uppercase' }}>{k.label}</div>
                  <div style={{ fontSize:'24px', fontWeight:'600', color:'#be185d', fontFamily:'monospace' }}>{k.value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'bloques' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {bloques.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay bloques registrados</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Nombre','Especie','Variedad','Área m²','Camas','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{bloques.map((b:any) => (
                    <tr key={b.id} style={{ borderBottom:'0.5px solid #f0f0ee', cursor:'pointer' }} onClick={() => { setSelBloque(b); setCosechaModal(true) }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{b.nombre}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#be185d', fontWeight:'500', textTransform:'capitalize' }}>{b.especie}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{b.variedad||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#be185d' }}>{b.areaM2?.toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace' }}>{b.camas||'—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background:'#fce7f3', color:'#be185d' }}>{b.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'cosechas' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {cosechas.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay cosechas registradas</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Fecha','Bloque','Tallos','Clasificación','Longitud','Calidad','Precio/tallo'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{cosechas.map((c:any) => (
                    <tr key={c.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(c.fecha).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{c.bloque?.nombre||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#be185d', fontWeight:'500' }}>{(c.tallosCorte||0).toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', textTransform:'capitalize' }}>{c.clasificacion||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{c.longitudCm ? c.longitudCm+'cm' : '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', textTransform:'capitalize' }}>{c.calidad||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{c.precioTallo ? '$'+c.precioTallo.toLocaleString() : '—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'pedidos' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {pedidos.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay pedidos registrados</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Cliente','Especie','Tallos','Fecha pedido','Fecha entrega','Precio/tallo','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{pedidos.map((p:any) => (
                    <tr key={p.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{p.cliente}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#be185d', textTransform:'capitalize' }}>{p.especie}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#be185d' }}>{(p.tallosSolicitados||0).toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(p.fechaPedido).toLocaleDateString('es-CO',{day:'numeric',month:'short'})}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{p.fechaEntrega ? new Date(p.fechaEntrega).toLocaleDateString('es-CO',{day:'numeric',month:'short'}) : '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{p.precioUnitario ? '$'+p.precioUnitario.toLocaleString() : '—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background: p.status==='entregado'?'#dcfce7':p.status==='cancelado'?'#fee2e2':'#fce7f3', color: p.status==='entregado'?'#166534':p.status==='cancelado'?'#dc2626':'#be185d' }}>{p.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {bloqueModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>💐 Nuevo bloque</div>
            <form onSubmit={saveBloque}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label><input value={bloqueForm.nombre} onChange={e=>setBloqueForm({...bloqueForm,nombre:e.target.value})} required style={inp} placeholder="Bloque A-1"/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESPECIE</label>
                    <select value={bloqueForm.especie} onChange={e=>setBloqueForm({...bloqueForm,especie:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {ESPECIES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>VARIEDAD</label><input value={bloqueForm.variedad} onChange={e=>setBloqueForm({...bloqueForm,variedad:e.target.value})} style={inp} placeholder="Freedom"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ÁREA (m²)</label><input type="number" step="0.1" value={bloqueForm.areaM2} onChange={e=>setBloqueForm({...bloqueForm,areaM2:e.target.value})} required style={inp} placeholder="1000"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CAMAS</label><input type="number" value={bloqueForm.camas} onChange={e=>setBloqueForm({...bloqueForm,camas:e.target.value})} style={inp} placeholder="20"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>AÑO SIEMBRA</label><input type="number" value={bloqueForm.plantYear} onChange={e=>setBloqueForm({...bloqueForm,plantYear:e.target.value})} style={inp} placeholder="2024"/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setBloqueModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#be185d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear bloque</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cosechaModal && selBloque && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>💐 Registrar cosecha</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selBloque.nombre} · {selBloque.especie}</div>
            <form onSubmit={saveCosecha}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label><input type="date" value={cosechaForm.fecha} onChange={e=>setCosechaForm({...cosechaForm,fecha:e.target.value})} required style={inp}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TALLOS CORTADOS</label><input type="number" value={cosechaForm.tallosCorte} onChange={e=>setCosechaForm({...cosechaForm,tallosCorte:e.target.value})} required style={inp} placeholder="500"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CLASIFICACIÓN</label>
                    <select value={cosechaForm.clasificacion} onChange={e=>setCosechaForm({...cosechaForm,clasificacion:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {CLASIFICACION.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>LONGITUD (cm)</label><input type="number" value={cosechaForm.longitudCm} onChange={e=>setCosechaForm({...cosechaForm,longitudCm:e.target.value})} style={inp} placeholder="60"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CALIDAD</label>
                    <select value={cosechaForm.calidad} onChange={e=>setCosechaForm({...cosechaForm,calidad:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {['premium','first','select'].map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRECIO/TALLO (COP)</label><input type="number" step="0.01" value={cosechaForm.precioTallo} onChange={e=>setCosechaForm({...cosechaForm,precioTallo:e.target.value})} style={inp} placeholder="Opcional"/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setCosechaModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#be185d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar cosecha</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pedidoModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>📦 Nuevo pedido</div>
            <form onSubmit={savePedido}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CLIENTE</label><input value={pedidoForm.cliente} onChange={e=>setPedidoForm({...pedidoForm,cliente:e.target.value})} required style={inp} placeholder="Exportadora La Rosa"/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESPECIE</label>
                    <select value={pedidoForm.especie} onChange={e=>setPedidoForm({...pedidoForm,especie:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {ESPECIES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TALLOS SOLICITADOS</label><input type="number" value={pedidoForm.tallosSolicitados} onChange={e=>setPedidoForm({...pedidoForm,tallosSolicitados:e.target.value})} required style={inp} placeholder="1000"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA PEDIDO</label><input type="date" value={pedidoForm.fechaPedido} onChange={e=>setPedidoForm({...pedidoForm,fechaPedido:e.target.value})} required style={inp}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA ENTREGA</label><input type="date" value={pedidoForm.fechaEntrega} onChange={e=>setPedidoForm({...pedidoForm,fechaEntrega:e.target.value})} style={inp}/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setPedidoModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#be185d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear pedido</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <IndustryGuard module="FLORICULTURA"><FloriculturaPage /></IndustryGuard>
}
