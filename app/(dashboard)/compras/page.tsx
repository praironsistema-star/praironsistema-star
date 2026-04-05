'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const PURCHASE_UNITS = ['kg','ton','litros','unidades','bultos','cajas','galones','sacos']
const PAYMENT_STATUS = ['pendiente','pagado','parcial']

const inputStyle: React.CSSProperties = {
  width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px',
  padding:'9px 12px', fontSize:'13px', outline:'none',
  boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7',
}
const card: React.CSSProperties = {
  background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px',
}

export default function ComprasPage() {
  const [tab, setTab] = useState('dashboard')
  const [purchases, setPurchases] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [purchaseModal, setPurchaseModal] = useState(false)
  const [supplierModal, setSupplierModal] = useState(false)
  const [payModal, setPayModal] = useState(false)
  const [selPurchase, setSelPurchase] = useState<any>(null)

  const [purchaseForm, setPurchaseForm] = useState({
    supplierId:'', product:'', quantity:'', unit:'kg',
    pricePerUnit:'', date: new Date().toISOString().split('T')[0],
    updateInventory: true, notes:''
  })
  const [supplierForm, setSupplierForm] = useState({
    name:'', phone:'', email:'', city:'', nit:'', notes:''
  })
  const [payForm, setPayForm] = useState({
    amount:'', date: new Date().toISOString().split('T')[0], notes:''
  })

  async function loadAll() {
    setLoading(true)
    try {
            const [p, s] = await Promise.all([api.get('/purchases'), api.get('/organizations')])
      setPurchases(p.data || [])
      setSuppliers(s.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  async function savePurchase(e: React.FormEvent) {
    e.preventDefault()
    try {
            await api.post('/purchases', {
        supplier_name: purchaseForm.supplierId,
        total_amount: parseFloat(purchaseForm.pricePerUnit) * parseFloat(purchaseForm.quantity),
        currency: 'COP',
        status: 'pendiente',
      })
      setPurchaseForm({ supplierId:'', product:'', quantity:'', unit:'kg', pricePerUnit:'', date: new Date().toISOString().split('T')[0], updateInventory: true, notes:'' })
      loadAll(); toastSuccess('Compra registrada')
    } catch { toastError('Error al registrar compra') }
  }

  async function saveSupplier(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/compras/suppliers', supplierForm)
      setSupplierModal(false)
      setSupplierForm({ name:'', phone:'', email:'', city:'', nit:'', notes:'' })
      loadAll(); toastSuccess('Proveedor registrado')
    } catch { toastError('Error al registrar proveedor') }
  }

  async function savePayment(e: React.FormEvent) {
    e.preventDefault()
    if (!selPurchase) return
    try {
      await api.post('/compras/purchases/' + selPurchase.id + '/payments', {
        amount: parseFloat(payForm.amount),
        date: payForm.date,
        notes: payForm.notes,
      })
      setPayModal(false)
      setPayForm({ amount:'', date: new Date().toISOString().split('T')[0], notes:'' })
      loadAll(); toastSuccess('Pago registrado')
    } catch { toastError('Error al registrar pago') }
  }

  async function deletePurchase(id: string) {
    const ok = await confirm({ title:'Eliminar compra', message:'¿Eliminar esta compra?', danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
      await api.delete('/compras/purchases/' + id)
      loadAll(); toastSuccess('Compra eliminada')
    } catch { toastError('Error al eliminar') }
  }

  async function deleteSupplier(id: string, name: string) {
    const ok = await confirm({ title:'Eliminar proveedor', message:`¿Eliminar a "${name}"?`, danger:true, confirmText:'Eliminar' })
    if (!ok) return
    try {
      await api.delete('/compras/suppliers/' + id)
      loadAll(); toastSuccess('Proveedor eliminado')
    } catch { toastError('Error al eliminar') }
  }

  const totalCompras = purchases.reduce((s, p) => s + (p.total || 0), 0)
  const totalPagado = purchases.reduce((s, p) => s + (p.paid || 0), 0)
  const totalPendiente = totalCompras - totalPagado
  const comprasPendientes = purchases.filter(p => p.paymentStatus === 'pendiente' || p.paymentStatus === 'parcial')

  const statusColor: Record<string,string> = { pendiente:'#dc2626', parcial:'#b45309', pagado:'#036446' }
  const statusBg: Record<string,string> = { pendiente:'#fef2f2', parcial:'#fef3c7', pagado:'#e8f5ef' }

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Compras y Proveedores</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Órdenes de compra, proveedores y cuentas por pagar</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={() => setSupplierModal(true)} style={{ fontSize:'12px', padding:'8px 14px', border:'0.5px solid #036446', borderRadius:'6px', background:'transparent', color:'#036446', cursor:'pointer', fontWeight:'500' }}>
            + Proveedor
          </button>
          <button onClick={() => setPurchaseModal(true)} style={{ fontSize:'12px', padding:'8px 14px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
            + Compra
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','compras','proveedores','cuentas'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ fontSize:'13px', padding:'8px 16px', border:'none', background:'transparent', cursor:'pointer', fontWeight: tab===t?'500':'400', color: tab===t?'#036446':'#9b9b97', borderBottom: tab===t?'2px solid #036446':'2px solid transparent', marginBottom:'-0.5px', fontFamily:'inherit', textTransform:'capitalize' }}>
            {t === 'dashboard' ? 'Dashboard' : t === 'compras' ? 'Compras' : t === 'proveedores' ? 'Proveedores' : 'Cuentas por pagar'}
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
                  { label:'Total compras', value: '$' + totalCompras.toLocaleString('es-CO'), color:'#1a1a18' },
                  { label:'Total pagado', value: '$' + totalPagado.toLocaleString('es-CO'), color:'#036446' },
                  { label:'Por pagar', value: '$' + totalPendiente.toLocaleString('es-CO'), color: totalPendiente > 0 ? '#dc2626' : '#036446' },
                  { label:'Proveedores', value: suppliers.length, color:'#185fa5' },
                ].map(s => (
                  <div key={s.label} style={card}>
                    <div style={{ fontSize:'22px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Cuentas por pagar urgentes */}
              {comprasPendientes.length > 0 && (
                <div style={{ marginBottom:'20px' }}>
                  <div style={{ fontSize:'12px', fontWeight:'500', color:'#dc2626', marginBottom:'10px', letterSpacing:'0.06em' }}>⚠️ CUENTAS POR PAGAR</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
                    {comprasPendientes.map((p: any) => (
                      <div key={p.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#fff', border:'0.5px solid #fecaca', borderRadius:'8px', padding:'12px 16px' }}>
                        <div>
                          <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{p.supplier?.name || 'Sin proveedor'}</div>
                          <div style={{ fontSize:'11px', color:'#9b9b97' }}>{p.product} · {new Date(p.date).toLocaleDateString('es-CO', { day:'numeric', month:'short' })}</div>
                        </div>
                        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:'13px', fontWeight:'500', color:'#dc2626', fontFamily:'monospace' }}>${((p.total || 0) - (p.paid || 0)).toLocaleString('es-CO')}</div>
                            <div style={{ fontSize:'10px', color:'#9b9b97' }}>pendiente</div>
                          </div>
                          <button onClick={() => { setSelPurchase(p); setPayModal(true) }}
                            style={{ fontSize:'11px', padding:'5px 10px', background:'#036446', color:'white', border:'none', borderRadius:'5px', cursor:'pointer' }}>
                            Pagar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {purchases.length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>📦</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin compras registradas</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>Registra tus compras para controlar el costo de producción</div>
                  <button onClick={() => setPurchaseModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar compra</button>
                </div>
              )}
            </div>
          )}

          {/* COMPRAS */}
          {tab === 'compras' && (
            <div>
              {purchases.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🧾</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin compras</div>
                  <button onClick={() => setPurchaseModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar compra</button>
                </div>
              ) : (
                <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse' }}>
                    <thead>
                      <tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                        {['Fecha','Proveedor','Producto','Cantidad','Total','Pagado','Estado','Acciones'].map(h => (
                          <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {purchases.map((p: any) => (
                        <tr key={p.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(p.date).toLocaleDateString('es-CO', { day:'numeric', month:'short', year:'numeric' })}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{p.supplier?.name || '—'}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{p.product}</td>
                          <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', fontFamily:'monospace' }}>{p.quantity} {p.unit}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>${(p.total || 0).toLocaleString('es-CO')}</td>
                          <td style={{ padding:'10px 14px', fontSize:'13px', color:'#036446', fontFamily:'monospace' }}>${(p.paid || 0).toLocaleString('es-CO')}</td>
                          <td style={{ padding:'10px 14px' }}>
                            <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background: statusBg[p.paymentStatus] || '#f9f9f7', color: statusColor[p.paymentStatus] || '#9b9b97' }}>
                              {p.paymentStatus}
                            </span>
                          </td>
                          <td style={{ padding:'10px 14px' }}>
                            <div style={{ display:'flex', gap:'4px' }}>
                              {p.paymentStatus !== 'pagado' && (
                                <button onClick={() => { setSelPurchase(p); setPayModal(true) }} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #d1fae5', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#036446' }}>Pagar</button>
                              )}
                              <button onClick={() => deletePurchase(p.id)} style={{ fontSize:'10px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
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

          {/* PROVEEDORES */}
          {tab === 'proveedores' && (
            <div>
              {suppliers.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'32px', marginBottom:'12px' }}>🏭</div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>Sin proveedores registrados</div>
                  <button onClick={() => setSupplierModal(true)} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>Registrar proveedor</button>
                </div>
              ) : (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                  {suppliers.map((s: any) => (
                    <div key={s.id} style={card}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                        <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:'#e6f1fb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', fontWeight:'600', color:'#185fa5', flexShrink:0 }}>
                          {s.name?.charAt(0).toUpperCase()}
                        </div>
                        <button onClick={() => deleteSupplier(s.id, s.name)} style={{ fontSize:'10px', padding:'3px 8px', border:'0.5px solid #fecaca', borderRadius:'4px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>Eliminar</button>
                      </div>
                      <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18', marginBottom:'4px' }}>{s.name}</div>
                      {s.nit && <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'4px' }}>NIT: {s.nit}</div>}
                      {s.city && <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'4px' }}>📍 {s.city}</div>}
                      {s.phone && <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'4px' }}>�� {s.phone}</div>}
                      {s.email && <div style={{ fontSize:'12px', color:'#9b9b97' }}>✉️ {s.email}</div>}
                      <div style={{ marginTop:'10px', paddingTop:'10px', borderTop:'0.5px solid #f0f0ee', display:'flex', justifyContent:'space-between' }}>
                        <div style={{ fontSize:'11px', color:'#9b9b97' }}>Compras</div>
                        <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18', fontFamily:'monospace' }}>{s._count?.purchases || 0}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CUENTAS POR PAGAR */}
          {tab === 'cuentas' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'20px' }}>
                {[
                  { label:'Total pagado', value: '$' + totalPagado.toLocaleString('es-CO'), color:'#036446', bg:'#e8f5ef' },
                  { label:'Por pagar', value: '$' + totalPendiente.toLocaleString('es-CO'), color:'#dc2626', bg:'#fef2f2' },
                  { label:'Facturas pendientes', value: comprasPendientes.length, color:'#b45309', bg:'#fef3c7' },
                ].map(s => (
                  <div key={s.label} style={{ ...card, background: s.bg, border:'none' }}>
                    <div style={{ fontSize:'22px', fontWeight:'500', color:s.color, fontFamily:'monospace', lineHeight:1 }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:s.color, marginTop:'4px', opacity:0.7 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {comprasPendientes.length === 0 ? (
                <div style={{ textAlign:'center', padding:'40px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
                  <div style={{ fontSize:'28px', marginBottom:'8px' }}>✅</div>
                  <div style={{ fontSize:'14px', fontWeight:'500', color:'#036446' }}>Sin deudas pendientes</div>
                  <div style={{ fontSize:'12px', color:'#9b9b97', marginTop:'4px' }}>Todas las compras están pagadas</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {comprasPendientes.map((p: any) => {
                    const pendiente = (p.total || 0) - (p.paid || 0)
                    return (
                      <div key={p.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        <div>
                          <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18' }}>{p.supplier?.name || 'Sin proveedor'}</div>
                          <div style={{ fontSize:'12px', color:'#9b9b97' }}>{p.product} · {new Date(p.date).toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' })}</div>
                        </div>
                        <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>Total compra</div>
                            <div style={{ fontSize:'13px', fontFamily:'monospace', color:'#1a1a18' }}>${(p.total || 0).toLocaleString('es-CO')}</div>
                          </div>
                          <div style={{ textAlign:'right' }}>
                            <div style={{ fontSize:'11px', color:'#9b9b97' }}>Por pagar</div>
                            <div style={{ fontSize:'15px', fontWeight:'600', fontFamily:'monospace', color:'#dc2626' }}>${pendiente.toLocaleString('es-CO')}</div>
                          </div>
                          <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background: statusBg[p.paymentStatus], color: statusColor[p.paymentStatus] }}>{p.paymentStatus}</span>
                          <button onClick={() => { setSelPurchase(p); setPayModal(true) }}
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

      {/* Modal: Nueva compra */}
      {purchaseModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nueva compra</div>
            <form onSubmit={savePurchase}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PROVEEDOR</label>
                  <select value={purchaseForm.supplierId} onChange={e => setPurchaseForm({...purchaseForm, supplierId:e.target.value})} required style={{...inputStyle, cursor:'pointer'}}>
                    <option value="">Seleccionar proveedor...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  {suppliers.length === 0 && <div style={{ fontSize:'11px', color:'#b45309', marginTop:'4px' }}>⚠️ Primero registra un proveedor</div>}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRODUCTO / INSUMO</label>
                    <input value={purchaseForm.product} onChange={e => setPurchaseForm({...purchaseForm, product:e.target.value})} required style={inputStyle} placeholder="Ej: Fertilizante 15-15-15" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UNIDAD</label>
                    <select value={purchaseForm.unit} onChange={e => setPurchaseForm({...purchaseForm, unit:e.target.value})} style={{...inputStyle, cursor:'pointer'}}>
                      {PURCHASE_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD</label>
                    <input type="number" step="0.01" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity:e.target.value})} required style={inputStyle} placeholder="0" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRECIO POR UNIDAD (COP)</label>
                    <input type="number" value={purchaseForm.pricePerUnit} onChange={e => setPurchaseForm({...purchaseForm, pricePerUnit:e.target.value})} required style={inputStyle} placeholder="0" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                </div>
                {purchaseForm.quantity && purchaseForm.pricePerUnit && (
                  <div style={{ background:'#e6f1fb', borderRadius:'8px', padding:'10px 14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'12px', color:'#185fa5' }}>Total de la compra</span>
                    <span style={{ fontSize:'16px', fontWeight:'600', color:'#185fa5', fontFamily:'monospace' }}>
                      ${(parseFloat(purchaseForm.quantity) * parseFloat(purchaseForm.pricePerUnit)).toLocaleString('es-CO')}
                    </span>
                  </div>
                )}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label>
                    <input type="date" value={purchaseForm.date} onChange={e => setPurchaseForm({...purchaseForm, date:e.target.value})} required style={inputStyle}/></div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', paddingTop:'20px' }}>
                    <input type="checkbox" id="updateInv" checked={purchaseForm.updateInventory} onChange={e => setPurchaseForm({...purchaseForm, updateInventory:e.target.checked})} style={{ width:'16px', height:'16px', cursor:'pointer' }}/>
                    <label htmlFor="updateInv" style={{ fontSize:'12px', color:'#1a1a18', cursor:'pointer' }}>Actualizar inventario</label>
                  </div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={purchaseForm.notes} onChange={e => setPurchaseForm({...purchaseForm, notes:e.target.value})} style={inputStyle} placeholder="Opcional" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setPurchaseModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar compra</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Nuevo proveedor */}
      {supplierModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>Nuevo proveedor</div>
            <form onSubmit={saveSupplier}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE / RAZÓN SOCIAL</label>
                  <input value={supplierForm.name} onChange={e => setSupplierForm({...supplierForm, name:e.target.value})} required style={inputStyle} placeholder="Agroquímicos del Llano S.A.S." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NIT</label>
                    <input value={supplierForm.nit} onChange={e => setSupplierForm({...supplierForm, nit:e.target.value})} style={inputStyle} placeholder="900.000.000-1" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CIUDAD</label>
                    <input value={supplierForm.city} onChange={e => setSupplierForm({...supplierForm, city:e.target.value})} style={inputStyle} placeholder="Villavicencio" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TELÉFONO</label>
                    <input value={supplierForm.phone} onChange={e => setSupplierForm({...supplierForm, phone:e.target.value})} style={inputStyle} placeholder="310 000 0000" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CORREO</label>
                    <input type="email" value={supplierForm.email} onChange={e => setSupplierForm({...supplierForm, email:e.target.value})} style={inputStyle} placeholder="ventas@proveedor.com" onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                  <input value={supplierForm.notes} onChange={e => setSupplierForm({...supplierForm, notes:e.target.value})} style={inputStyle} placeholder="Observaciones..." onFocus={e=>e.target.style.borderColor='#036446'} onBlur={e=>e.target.style.borderColor='#e5e5e3'}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setSupplierModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Registrar proveedor</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Registrar pago */}
      {payModal && selPurchase && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'400px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>Registrar pago</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'4px' }}>{selPurchase.supplier?.name} · {selPurchase.product}</div>
            <div style={{ fontSize:'13px', color:'#dc2626', fontFamily:'monospace', marginBottom:'20px' }}>
              Por pagar: ${((selPurchase.total || 0) - (selPurchase.paid || 0)).toLocaleString('es-CO')}
            </div>
            <form onSubmit={savePayment}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>MONTO PAGADO (COP)</label>
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
