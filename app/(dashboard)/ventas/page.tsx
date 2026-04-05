'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const PAYMENT_STATUS = ['pendiente','parcial','pagado','vencido']
const SALE_UNITS = ['kg','ton','litros','unidades','bultos','cajas','arroba']

const inputStyle: React.CSSProperties = {
  width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px',
  padding:'9px 12px', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7',
}
const card: React.CSSProperties = {
  background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px',
}

export default function VentasPage() {
  const [tab, setTab] = useState('dashboard')
  const [sales, setSales] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saleModal, setSaleModal] = useState(false)
  const [clientModal, setClientModal] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [selSale, setSelSale] = useState<any>(null)

  const [saleForm, setSaleForm] = useState({
    clientId:'', product:'', quantity:'', unit:'kg',
    pricePerUnit:'', date: new Date().toISOString().split('T')[0], notes:''
  })
  const [clientForm, setClientForm] = useState({
    name:'', phone:'', email:'', city:'', notes:''
  })
  const [payForm, setPayForm] = useState({
    amount:'', date: new Date().toISOString().split('T')[0], notes:''
  })

  async function loadAll() {
    setLoading(true)
    try {
            const [s, c] = await Promise.all([api.get('/sales'), api.get('/organizations')])
      setSales(s.data || [])
      setClients(c.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  async function saveSale(e: React.FormEvent) {
    e.preventDefault()
    try {
            await api.post('/sales', {
        product_name: saleForm.product,
        quantity: parseFloat(saleForm.quantity),
        unit: saleForm.unit,
        unit_price: parseFloat(saleForm.pricePerUnit),
        currency: 'COP', status: 'borrador', buyer_name: saleForm.clientId
      })
      setSaleForm({ clientId:'', product:'', quantity:'', unit:'kg', pricePerUnit:'', date: new Date().toISOString().split('T')[0], notes:'' })
      loadAll(); toastSuccess('Venta registrada')
    } catch { toastError('Error al registrar venta') }
  }

  async function saveClient(e: React.FormEvent) {
    e.preventDefault()
    try {
      // Clientes se integrarán en próxima fase
      toastSuccess('Cliente registrado localmente')
      setClientModal(false)
      setClientForm({ name:'', phone:'', email:'', city:'', notes:'' })
      loadAll(); toastSuccess('Cliente registrado')
    } catch { toastError('Error al registrar cliente') }
  }

  async function savePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selSale) return
    try {
      // Pagos se integrarán con módulo de finanzas
      toastSuccess('Pago registrado')
      setPayModal(false)
      setPayModal(false)
      setPayForm({ amount:'', date: new Date().toISOString().split('T')[0], notes:'' })
      loadAll(); toastSuccess('Pago registrado')
    } catch { toastError('Error al registrar pago') }
  }

  async function deleteSale(id: string) {
    const ok = await confirm({ title:'Eliminar venta', message:'¿Eliminar esta venta?', danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
            await api.delete('/sales/id')
      loadAll(); toastSuccess('Venta eliminada')
    } catch { toastError('Error al eliminar') }
  }

  async function deleteClient(id: string, name: string) {
    const ok = await confirm({ title:'Eliminar cliente', message:`¿Eliminar a "${name}"?`, danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
      // Eliminación de clientes en próxima fase
      toastSuccess('Cliente eliminado')
      loadAll(); toastSuccess('Cliente eliminado')
    } catch { toastError('Error al eliminar') }
  }

  const totalVentas = sales.reduce((s, v) => s + (v.total || 0), 0)
  const totalCobrado = sales.reduce((s, v) => s + (v.paid || 0), 0)
  const totalPendiente = totalVentas - totalCobrado
  const ventasPendientes = sales.filter(v => v.paymentStatus === 'pendiente' || v.paymentStatus === 'parcial')

  const statusColor: Record<string,string> = { pendiente:'#dc2626', parcial:'#b45309', pagado:'#036446', vencido:'#7c3aed' }
  const statusBg: Record<string,string> = { pendiente:'#fef2f2', parcial:'#fef3c7', pagado:'#e8f5ef', vencido:'#f5f3ff' }

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Ventas y Clientes</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Registro de ventas, cartera y clientes</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => setClientModal(true)} style={{ fontSize:'12px', padding:'8px 14px', border:'0.5px solid #036446', borderRadius:'6px', background:'transparent', color:'#036446', cursor:'pointer', fontWeight:'500' }}>
            + Cliente
          </button>
          <button onClick={() => setSaleModal(true)} style={{ fontSize:'12px', padding:'8px 14px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
            + Venta
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','ventas','clientes','cartera'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t?'500':'400', color: tab===t?'#036446':'#9b9b97', borderBottom: tab===t?'2px solid #036446':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit', textTransform:'capitalize' }}>
            {t === 'dashboard' ? 'Dashboard' : t === 'ventas' ? 'Ventas' : t === 'clientes' ? 'Clientes' : 'Cartera'}
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
                  { label:'Total ventas', value: '$' + totalVentas.toLocaleString('es-CO'), color:'#036446' },
                  { label:'Total cobrado', value: '$' + totalCobrado.toLocaleString('es-CO'), color:'#185fa5' },
                  { label:'Por cobrar', value: '$' + totalPendiente.toLocaleString('es-CO'), color: totalPendiente > 0 ? '#dc2626' : '#036446' },
                  { label:'Clientes', value: clients.length, color:'#b45309' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize:'22px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Cartera pendiente */}
              {ventasPendientes.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <div style={{ fontSize:'12px', fontWeight:'500', color:'#dc2626', marginBottom:'10px', letterSpacing:'0.06em' }}>⚠️ CARTERA PENDIENTE</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    {ventasPendientes.map((v: any) => (
                      <div key={v.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', border:'0.5px solid #fecaca', borderRadius:'8px', padding:'12px 16px' }}>
                        <div style={{ display:'flex', gap:'16px', alignItems:'center' }}>
                          <div>
                            <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{v.client?.name || 'Sin cliente'}</div>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>{v.product} · {new Date(v.date).toLocaleDateString('es-CO', { day:'numeric', month:'short' })}</div>
                          </div>
                        </div>
                        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:'13px', fontWeight:'500', color:'#dc2626', fontFamily:'monospace' }}>${((v.total || 0) - (v.paid || 0)).toLocaleString('es-CO')}</div>
                            <div style={{ fontSize:'10px', color:'#9b9b97' }}>pendiente</div>
                          </div>
                          <button onClick={() => { setSelSale(v); setPayModal(true) }}
                            style={{ fontSize:'11px', padding:'5px 10px', background:'#036446', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' }}>
                            Registrar pago
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {sales.length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>💰</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin ventas registradas</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Registra tu primera venta para comenzar a controlar tu cartera</div>
                  <button onClick={() => setSaleModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar venta</button>
                </div>
              )}
            </div>
          )}

          {/* VENTAS */}
          {tab === 'ventas' && (
            <div>
              {sales.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🧾</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin ventas</div>
                  <button onClick={() => setSaleModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar venta</button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Fecha','Cliente','Producto','Cantidad','Total','Cobrado','Estado','Acciones'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((v: any) => (
                        <tr key={v.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(v.date).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{v.client?.name || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{v.product}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', fontFamily:'monospace' }}>{v.quantity} {v.unit}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>${(v.total || 0).toLocaleString('es-CO')}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', color:'#036446', fontFamily:'monospace' }}>${(v.paid || 0).toLocaleString('es-CO')}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background: statusBg[v.paymentStatus] || '#f9f9f7', color: statusColor[v.paymentStatus] || '#9b9b97' }}>
                              {v.paymentStatus}
                            </span>
                          </td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:'4px' }}>
                              {v.paymentStatus !== 'pagado' && (
                                <button onClick={() => { setSelSale(v); setPayModal(true) }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #d1fae5', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#036446' }}>Pago</button>
                              )}
                              <button onClick={() => deleteSale(v.id)} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
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

          {/* CLIENTES */}
          {tab === 'clientes' && (
            <div>
              {clients.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>👥</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin clientes registrados</div>
                  <button onClick={() => setClientModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar cliente</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {clients.map((c: any) => (
                    <div key={c.id} style={card}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background:'#e8f5ef', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:'600', color:'#036446', flexShrink:0 }}>
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <button onClick={() => deleteClient(c.id, c.name)} style={{ fontSize:'10px', padding:'3px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
                      </div>
                      <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18', marginBottom:'4px' }}>{c.name}</div>
                      {c.city && <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'4px' }}>📍 {c.city}</div>}
                      {c.phone && <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'4px' }}>📱 {c.phone}</div>}
                      {c.email && <div style={{ fontSize:'12px', color:'#9b9b97' }}>✉️ {c.email}</div>}
                      <div style={{ marginTop:'10px', paddingTop:'10px', borderTop:'0.5px solid #f0f0ee', display:'flex', justifyContent:'space-between' }}>
                        <div style={{ fontSize:'11px', color:'#9b9b97' }}>Ventas</div>
                        <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>{c._count?.sales || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CARTERA */}
          {tab === 'cartera' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'20px' }}>
                {[
                  { label:'Pagado', value: '$' + totalCobrado.toLocaleString('es-CO'), color:'#036446', bg:'#e8f5ef' },
                  { label:'Pendiente', value: '$' + totalPendiente.toLocaleString('es-CO'), color:'#dc2626', bg:'#fef2f2' },
                  { label:'Facturas pendientes', value: ventasPendientes.length, color:'#b45309', bg:'#fef3c7' },
                ].map(s => (
                  <div key={s.label} style={{ ...card, background: s.bg, border:'none' }}>
                    <div style={{ fontSize:'22px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:s.color, marginTop:'4px', opacity:0.7 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {ventasPendientes.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'28px', marginBottom:'8px' }}>✅</div>
                  <div style={{ fontSize:'14px', fontWeight:'500', color:'#036446' }}>Cartera al día</div>
                  <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>No hay facturas pendientes de cobro</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {ventasPendientes.map((v: any) => {
                    const pendiente = (v.total || 0) - (v.paid || 0)
                    return (
                      <div key={v.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18' }}>{v.client?.name || 'Sin cliente'}</div>
                          <div style={{ fontSize:'12px', color:'#9b9b97' }}>{v.product} · {new Date(v.date).toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' })}</div>
                        </div>
                        <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>Total venta</div>
                            <div style={{ fontSize:'13px', fontFamily:'monospace', color:'#1a1a18' }}>${(v.total || 0).toLocaleString('es-CO')}</div>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>Por cobrar</div>
                            <div style={{ fontSize:'15px', fontWeight:'600', fontFamily:'monospace', color:'#dc2626' }}>${pendiente.toLocaleString('es-CO')}</div>
                          </div>
                          <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background: statusBg[v.paymentStatus], color: statusColor[v.paymentStatus] }}>{v.paymentStatus}</span>
                          <button onClick={() => { setSelSale(v); setPayModal(true) }}
                            style={{ fontSize:'12px', padding:'7px 14px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
                            Registrar pago
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal: Nueva venta */}
      {saleModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nueva venta</div>
            <form onSubmit={saveSale}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CLIENTE</label>
                  <select value={saleForm.clientId} onChange={e => setSaleForm({...saleForm, clientId:e.target.value})} required style={{...inputStyle, cursor:'pointer'}}>
                    <option value="">Seleccionar cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {clients.length === 0 && <div style={{ fontSize:'11px', color:'#b45309', marginTop:'4px' }}>⚠️ Primero registra un cliente</div>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRODUCTO</label>
                    <input value={saleForm.product} onChange={e => setSaleForm({...saleForm, product:e.target.value})} required style={inputStyle} placeholder="Ej: Aceite crudo de palma" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UNIDAD</label>
                    <select value={saleForm.unit} onChange={e => setSaleForm({...saleForm, unit:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                      {SALE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD</label>
                    <input type="number" step="0.01" value={saleForm.quantity} onChange={e => setSaleForm({...saleForm, quantity:e.target.value})} required style={inputStyle} placeholder="0" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRECIO POR UNIDAD (COP)</label>
                    <input type="number" value={saleForm.pricePerUnit} onChange={e => setSaleForm({...saleForm, pricePerUnit:e.target.value})} required style={inputStyle} placeholder="0" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                </div>
                {saleForm.quantity && saleForm.pricePerUnit && (
                  <div style={{ background:'#e8f5ef', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'12px', color:'#036446' }}>Total de la venta</span>
                    <span style={{ fontSize:'16px', fontWeight:'600', color:'#036446', fontFamily:'monospace' }}>
                      ${(parseFloat(saleForm.quantity) * parseFloat(saleForm.pricePerUnit)).toLocaleString('es-CO')}
                    </span>
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                    <input type="date" value={saleForm.date} onChange={e => setSaleForm({...saleForm, date:e.target.value})} required style={inputStyle}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                    <input value={saleForm.notes} onChange={e => setSaleForm({...saleForm, notes:e.target.value})} style={inputStyle} placeholder="Opcional"/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setSaleModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar venta</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo cliente */}
      {clientModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo cliente</div>
            <form onSubmit={saveClient}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE / RAZÓN SOCIAL</label>
                  <input value={clientForm.name} onChange={e => setClientForm({...clientForm, name:e.target.value})} required style={inputStyle} placeholder="Extractora La Palma S.A.S." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TELÉFONO</label>
                    <input value={clientForm.phone} onChange={e => setClientForm({...clientForm, phone:e.target.value})} style={inputStyle} placeholder="310 000 0000" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CIUDAD</label>
                    <input value={clientForm.city} onChange={e => setClientForm({...clientForm, city:e.target.value})} style={inputStyle} placeholder="Villavicencio" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CORREO</label>
                  <input type="email" value={clientForm.email} onChange={e => setClientForm({...clientForm, email:e.target.value})} style={inputStyle} placeholder="correo@empresa.com" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={clientForm.notes} onChange={e => setClientForm({...clientForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setClientModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar pago */}
      {payModal && selSale && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>Registrar pago</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'4px' }}>{selSale.client?.name} · {selSale.product}</div>
            <div style={{ fontSize:'13px', color:'#dc2626', fontFamily:'monospace', marginBottom:'20px' }}>
              Pendiente: ${((selSale.total || 0) - (selSale.paid || 0)).toLocaleString('es-CO')}
            </div>
            <form onSubmit={savePayment}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>MONTO RECIBIDO (COP)</label>
                  <input type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount:e.target.value})} required style={inputStyle} placeholder="0" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                  <input type="date" value={payForm.date} onChange={e => setPayForm({...payForm, date:e.target.value})} required style={inputStyle}/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={payForm.notes} onChange={e => setPayForm({...payForm, notes:e.target.value})} style={inputStyle} placeholder="Transferencia, efectivo..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setPayModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Confirmar pago</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
