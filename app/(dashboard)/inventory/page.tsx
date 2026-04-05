'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'
import InventorySkeleton from '@/components/ui/InventorySkeleton'

const TYPES = ['insumo','agroquimico','alimento','veterinario','maquinaria','herramienta','semilla','otro']

export default function InventoryPage() {
  const { t } = useI18n()
  const [items, setItems] = useState<any[]>([])
  const [farms, setFarms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name:'', type:'insumo', quantity:'', unit:'', minStock:'', notes:'', farmId:'' })

  const load = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const [inv, f] = await Promise.all([supabase.from('inventory_items').select('*'), supabase.from('farms').select('id, name')])
      setItems(inv.data || []); setFarms(f.data || [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm({ name:'', type:'insumo', quantity:'', unit:'kg', minStock:'', notes:'', farmId: farms[0]?.id||'' })
    setSelected(null); setModal('create')
  }

  function openEdit(item: any) {
    setForm({ name:item.name, type:item.type, quantity:String(item.quantity), unit:item.unit, minStock:String(item.minStock||''), notes:item.notes||'', farmId:item.farmId||'' })
    setSelected(item); setModal('edit')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { ...form, quantity:parseFloat(form.quantity), minStock:parseFloat(form.minStock)||0 }
    const { supabase } = await import('@/lib/supabase')
    if (modal === 'create') await supabase.from('inventory_items').insert({ name:form.name, category:form.type, stock_current:parseFloat(form.quantity), unit:form.unit, stock_min:parseFloat(form.minStock)||0, farm_id:form.farmId })
    else await supabase.from('inventory_items').update({ name:form.name, category:form.type, stock_current:parseFloat(form.quantity), unit:form.unit, stock_min:parseFloat(form.minStock)||0 }).eq('id', selected.id)
    setModal(null); load(); toastSuccess('Guardado correctamente')
  }

  async function handleDelete(id: string) {
    if (!await confirm({ title: 'Eliminar', message: '¿Estás seguro?', danger: true, confirmText: 'Eliminar' })){ return }
    // was: este ítem?')) return
    const { supabase } = await import('@/lib/supabase')
    await supabase.from('inventory_items').update({ deleted_at: new Date().toISOString() }).eq('id', id); load(); toastSuccess('Ítem eliminado')
  }

  const lowStock = items.filter(i => i.minStock > 0 && i.quantity <= i.minStock)
  const filtered = items
    .filter(i => filter === 'all' || i.type === filter)
    .filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()))

  const stockPct = (item: any) => {
    if (!item.minStock) return 100
    return Math.min(100, Math.round((item.quantity / item.minStock) * 100))
  }

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1100px' }}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>{t('inventory.title')}</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>
            {items.length} ítems · {lowStock.length} bajo mínimo
          </p>
        </div>
        <button onClick={openCreate} style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
          + Nuevo ítem
        </button>
      </div>

      {lowStock.length > 0 && (
        <div style={{ background:'#fef3e2', border:'0.5px solid #fed7aa', borderRadius:'8px', padding:'12px 16px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#f59e0b', flexShrink:0 }} />
          <div style={{ fontSize:'13px', color:'#b45309', fontWeight:'500' }}>
            {lowStock.length} ítem{lowStock.length > 1 ? 's' : ''} por debajo del stock mínimo: {lowStock.map(i => i.name).join(', ')}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', alignItems:'center' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          {...{placeholder: t('inventory.search_placeholder')}}
          style={{ flex:1, border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'7px 12px', fontSize:'13px', outline:'none' }} />
        <div style={{ display:'flex', gap:'6px' }}>
          <button onClick={() => setFilter('all')} style={{ fontSize:'12px', padding:'6px 12px', borderRadius:'20px', border:'0.5px solid', cursor:'pointer', borderColor: filter==='all'?'#036446':'#e5e5e3', background: filter==='all'?'#e8f5ef':'transparent', color: filter==='all'?'#036446':'#6b6b67' }}>
            Todos
          </button>
          {['insumo','agroquimico','alimento','veterinario','maquinaria'].map(t => (
            <button key={t} onClick={() => setFilter(t)} style={{ fontSize:'12px', padding:'6px 12px', borderRadius:'20px', border:'0.5px solid', cursor:'pointer', borderColor: filter===t?'#036446':'#e5e5e3', background: filter===t?'#e8f5ef':'transparent', color: filter===t?'#036446':'#6b6b67' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <InventorySkeleton />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>📦</div>
          <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>{t('inventory.no_items')}</div>
          <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>{t('inventory.no_items_sub')}</div>
          <button onClick={openCreate} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>{t('inventory.add_first')}</button>
        </div>
      ) : (
        <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'0.5px solid #e5e5e3', background:'#f9f9f7' }}>
                {[t('inventory.col_name'),t('inventory.col_type'),t('inventory.col_farm'),t('inventory.col_stock'),t('inventory.col_min'),t('inventory.col_status'),''].map(h => (
                  <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item:any) => {
                const pct = stockPct(item)
                const isLow = item.minStock > 0 && item.quantity <= item.minStock
                const isCritical = item.minStock > 0 && item.quantity <= item.minStock * 0.5
                return (
                  <tr key={item.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{item.name}</div>
                      {item.notes && <div style={{ fontSize:'11px', color:'#9b9b97' }}>{item.notes}</div>}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ fontSize:'11px', padding:'2px 8px', borderRadius:'20px', background:'#f1efe8', color:'#5f5e5a' }}>{item.type}</span>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>
                      {item.farm?.name || farms.find(f=>f.id===item.farmId)?.name || '—'}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ fontSize:'13px', fontWeight:'500', color: isCritical ? '#dc2626' : isLow ? '#b45309' : '#036446' }}>
                        {item.quantity} {item.unit}
                      </div>
                    </td>
                    <td style={{ padding:'10px 14px', fontSize:'12px', color:'#9b9b97' }}>
                      {item.minStock ? `${item.minStock} ${item.unit}` : '—'}
                    </td>
                    <td style={{ padding:'10px 14px', minWidth:'100px' }}>
                      {item.minStock > 0 ? (
                        <div>
                          <div style={{ height:'4px', background:'#e5e5e3', borderRadius:'2px', marginBottom:'3px' }}>
                            <div style={{ height:'100%', width:pct+'%', background: isCritical?'#ef4444':isLow?'#f59e0b':'#036446', borderRadius:'2px' }} />
                          </div>
                          <div style={{ fontSize:'10px', color: isCritical?'#dc2626':isLow?'#b45309':'#9b9b97' }}>
                            {isCritical ? t('common.critical') : isLow ? t('common.below_min') : t('common.normal')} {pct}%
                          </div>
                        </div>
                      ) : <span style={{ fontSize:'11px', color:'#9b9b97' }}>{t('common.no_limit')}</span>}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <div style={{ display:'flex', gap:'4px' }}>
                        <button onClick={() => openEdit(item)} style={{ fontSize:'11px', padding:'4px 8px', border:'0.5px solid #e5e5e3', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#6b6b67' }}>{t('common.edit')}</button>
                        <button onClick={() => handleDelete(item.id)} style={{ fontSize:'11px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>×</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>{modal==='create' ? t('inventory.modal_create') : t('inventory.modal_edit')}</div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required placeholder="Ej: Fertilizante NPK"
                  style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO</label>
                  <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', background:'#fff' }}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>GRANJA</label>
                  <select value={form.farmId} onChange={e => setForm({...form, farmId:e.target.value})}
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', background:'#fff' }}>
                    <option value="">Sin granja</option>
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CANTIDAD</label>
                  <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity:e.target.value})} required min="0" step="0.1"
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>UNIDAD</label>
                  <select value={form.unit} onChange={e => setForm({...form, unit:e.target.value})}
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', background:'#fff' }}>
                    {['kg','g','L','mL','ton','gal','dosis','unidad','saco','bulto'].map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>STOCK MÍNIMO</label>
                  <input type="number" value={form.minStock} onChange={e => setForm({...form, minStock:e.target.value})} min="0" step="0.1" placeholder="0"
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom:'20px' }}>
                <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOTAS</label>
                <input value={form.notes} onChange={e => setForm({...form, notes:e.target.value})} placeholder="Opcional"
                  style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setModal(null)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>{t('common.cancel')}</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
                  {modal==='create' ? t('inventory.add_btn') : t('inventory.save_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
