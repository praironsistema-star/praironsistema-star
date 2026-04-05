'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const CROP_TYPES = ['maiz','cafe','cacao','palma','cana','arroz','pasto','soya','frijol','tomate','papa','yuca','platano','frutales','hortalizas','flores','otro']

export default function CropsPage() {
  const { t } = useI18n()
  const [crops, setCrops] = useState<any[]>([])
  const [farms, setFarms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [predictions, setPredictions] = useState<any[]>([])
  const [loadingPred, setLoadingPred] = useState(false)
  const [showPred, setShowPred] = useState(false)
  const [form, setForm] = useState({ name:'', type:'maiz', plantedAt:'', harvestAt:'', farmId:'' })

  const load = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { data: c } = await supabase.from('crops').select('*').is('deleted_at',null)
      const { data: f } = await supabase.from('farms').select('id,name').is('deleted_at',null)
      setCrops(c||[]); setFarms(f||[])
      setCrops(c.data); setFarms(f.data)
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function loadPredictions() {
    setLoadingPred(true)
    try {
      const r = { data: { suggestions: [] } } // pendiente edge function
      setPredictions(r.data)
      setShowPred(true)
    } catch {
      toastError('Error cargando predicciones')
    } finally { setLoadingPred(false) }
  }

  function openCreate() {
    setForm({ name:'', type:'maiz', plantedAt: new Date().toISOString().split('T')[0], harvestAt:'', farmId: farms[0]?.id||'' })
    setSelected(null); setModal('create')
  }

  function openEdit(c: any) {
    setForm({ name:c.name, type:c.type||'maiz', plantedAt: c.plantedAt?.split('T')[0]||'', harvestAt: c.harvestAt?.split('T')[0]||'', farmId:c.farmId })
    setSelected(c); setModal('edit')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { ...form, harvestAt: form.harvestAt || null }
    const { supabase } = await import('@/lib/supabase')
      if (modal === 'create') await supabase.from('crops').insert(body)
    else await supabase.from('crops').update(body).eq('id',selected.id)
    setModal(null); load()
  }

  async function handleDelete(id: string) {
    const ok = await confirm({ title: 'Eliminar cultivo', message: '¿Eliminar este cultivo?', danger: true, confirmText: 'Eliminar' })
    if (!ok) return
    const { supabase } = await import('@/lib/supabase')
      await supabase.from('crops').update({deleted_at:new Date().toISOString()}).eq('id',id); load()
  }

  const now = new Date()
  const getStatus = (crop: any) => {
    if (!crop.harvestAt) return { label:t('crops.status_active'), bg:'#e8f5ef', color:'#036446' }
    const harvest = new Date(crop.harvestAt)
    if (harvest < now) return { label:t('crops.status_harvested'), bg:'#f1efe8', color:'#5f5e5a' }
    const days = Math.ceil((harvest.getTime() - now.getTime()) / (1000*60*60*24))
    if (days <= 15) return { label:`${days}d ${t('crops.harvest')}`, bg:'#fef3e2', color:'#b45309' }
    return { label:t('crops.status_growing'), bg:'#e8f5ef', color:'#036446' }
  }

  const getProgress = (crop: any) => {
    if (!crop.harvestAt) return 50
    const planted = new Date(crop.plantedAt)
    const harvest = new Date(crop.harvestAt)
    const total = harvest.getTime() - planted.getTime()
    const elapsed = now.getTime() - planted.getTime()
    return Math.min(100, Math.max(0, Math.round((elapsed/total)*100)))
  }

  const filtered = filter === 'all' ? crops : crops.filter(c => c.type === filter)
  const active = crops.filter(c => !c.harvestAt || new Date(c.harvestAt) >= now)
  const harvested = crops.filter(c => c.harvestAt && new Date(c.harvestAt) < now)

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1100px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>{t('crops.title')}</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>
            {crops.length} cultivos · {active.length} activos · {harvested.length} cosechados
          </p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
        <button onClick={loadPredictions} disabled={loadingPred}
          style={{ fontSize:'12px', padding:'8px 14px', background: loadingPred ? '#e5e5e3' : '#e8f5ef', color: loadingPred ? '#9b9b97' : '#036446', border:'0.5px solid #a7f3d0', borderRadius:'6px', cursor: loadingPred ? 'not-allowed' : 'pointer', fontWeight:'500' }}>
          {loadingPred ? t('crops.predicting') : t('crops.predict')}
        </button>
        <button onClick={openCreate} style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
          + Nuevo cultivo
        </button>
        </div>
      </div>

      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        <button onClick={() => setFilter('all')} style={{ fontSize:'12px', padding:'6px 14px', borderRadius:'20px', border:'0.5px solid', cursor:'pointer', borderColor: filter==='all'?'#036446':'#e5e5e3', background: filter==='all'?'#e8f5ef':'transparent', color: filter==='all'?'#036446':'#6b6b67', fontWeight: filter==='all'?'500':'400' }}>
          {t('crops.all')} ({crops.length})
        </button>
        {CROP_TYPES.filter(t => crops.some(c => c.type === t)).map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{ fontSize:'12px', padding:'6px 14px', borderRadius:'20px', border:'0.5px solid', cursor:'pointer', borderColor: filter===t?'#036446':'#e5e5e3', background: filter===t?'#e8f5ef':'transparent', color: filter===t?'#036446':'#6b6b67', fontWeight: filter===t?'500':'400' }}>
            {t} ({crops.filter(c=>c.type===t).length})
          </button>
        ))}
      </div>


      {/* ── Panel de prediccion de cosecha ── */}
      {showPred && predictions.length > 0 && (
        <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'12px', overflow:'hidden', marginBottom:'20px' }}>
          <div style={{ padding:'14px 20px', borderBottom:'0.5px solid #e5e5e3', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{t('crops.predict_title')}</div>
            <button onClick={() => setShowPred(false)}
              style={{ fontSize:'12px', color:'#9b9b97', background:'none', border:'none', cursor:'pointer' }}>×</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0' }}>
            {predictions.slice(0,6).map((p: any, i: number) => {
              const priorityColors: Record<string, { bg: string; color: string }> = {
                high:   { bg:'#fef2f2', color:'#dc2626' },
                medium: { bg:'#fef3e2', color:'#b45309' },
                low:    { bg:'#e8f5ef', color:'#036446' },
              }
              const pc = priorityColors[p.priority] || priorityColors.low
              return (
                <div key={p.cropId} style={{ padding:'14px 16px', borderRight: i%3<2 ? '0.5px solid #f0f0ee' : 'none', borderBottom: i<predictions.length-1 ? '0.5px solid #f0f0ee' : 'none' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'6px' }}>
                    <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18' }}>{p.cropName}</div>
                    <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:'20px', background:pc.bg, color:pc.color, fontWeight:'500' }}>
                      {p.priority === 'high' ? t('crops.urgent') : p.priority === 'medium' ? t('crops.upcoming') : t('crops.normal')}
                    </span>
                  </div>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'6px' }}>{p.farmName} · {p.cropType}</div>
                  <div style={{ height:'4px', background:'#e5e5e3', borderRadius:'2px', marginBottom:'6px' }}>
                    <div style={{ height:'100%', width: p.progress+'%', background: p.priority==='high'?'#ef4444':p.priority==='medium'?'#f59e0b':'#036446', borderRadius:'2px' }} />
                  </div>
                  <div style={{ fontSize:'11px', color:'#6b6b67', lineHeight:1.4 }}>{p.recommendation}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color:'#9b9b97', fontSize:'13px', padding:'40px', textAlign:'center' }}>Cargando...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>🌱</div>
          <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>{t('crops.no_crops')}</div>
          <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>{t('crops.no_crops_sub')}</div>
          <button onClick={openCreate} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>{t('crops.register_first')}</button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px' }}>
          {filtered.map((c:any) => {
            const status = getStatus(c)
            const progress = getProgress(c)
            return (
              <div key={c.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18', marginBottom:'4px' }}>{c.name}</div>
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                      <span style={{ fontSize:'10px', fontWeight:'500', padding:'2px 8px', borderRadius:'20px', background:'#f1efe8', color:'#5f5e5a' }}>{c.type}</span>
                      <span style={{ fontSize:'10px', fontWeight:'500', padding:'2px 8px', borderRadius:'20px', background:status.bg, color:status.color }}>{status.label}</span>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'4px', flexShrink:0, marginLeft:'8px' }}>
                    <button onClick={() => openEdit(c)} style={{ fontSize:'11px', padding:'4px 8px', border:'0.5px solid #e5e5e3', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#6b6b67' }}>{t('common.edit')}</button>
                    <button onClick={() => handleDelete(c.id)} style={{ fontSize:'11px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>×</button>
                  </div>
                </div>

                <div style={{ marginBottom:'10px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#9b9b97', marginBottom:'4px' }}>
                    <span>{t('crops.progress')}</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height:'4px', background:'#e5e5e3', borderRadius:'2px' }}>
                    <div style={{ height:'100%', width:progress+'%', background:'#036446', borderRadius:'2px', transition:'width 0.3s' }} />
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px' }}>
                  <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'6px 10px' }}>
                    <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'2px' }}>{t('crops.planted')}</div>
                    <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18' }}>
                      {c.plantedAt ? new Date(c.plantedAt).toLocaleDateString('es-CO',{day:'numeric',month:'short'}) : '—'}
                    </div>
                  </div>
                  <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'6px 10px' }}>
                    <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'2px' }}>{t('crops.harvest')}</div>
                    <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18' }}>
                      {c.harvestAt ? new Date(c.harvestAt).toLocaleDateString('es-CO',{day:'numeric',month:'short'}) : t('crops.no_date')}
                    </div>
                  </div>
                </div>

                {c.farm && (
                  <div style={{ marginTop:'8px', fontSize:'11px', color:'#9b9b97', paddingTop:'8px', borderTop:'0.5px solid #f0f0ee' }}>
                    {c.farm.name || farms.find(f=>f.id===c.farmId)?.name || '—'}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>{modal==='create' ? t('crops.modal_create') : t('crops.modal_edit')}</div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{t('crops.crop_name')}</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required placeholder="Ej: Maíz Tecnificado Lote Norte"
                  style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{t('crops.crop_type')}</label>
                  <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', background:'#fff' }}>
                    {CROP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{t('crops.farm')}</label>
                  <select value={form.farmId} onChange={e => setForm({...form, farmId:e.target.value})} required
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', background:'#fff' }}>
                    <option value="">{t('crops.select_farm')}</option>
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{t('crops.planted_date')}</label>
                  <input type="date" value={form.plantedAt} onChange={e => setForm({...form, plantedAt:e.target.value})} required
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{t('crops.harvest_date')}</label>
                  <input type="date" value={form.harvestAt} onChange={e => setForm({...form, harvestAt:e.target.value})}
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setModal(null)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>{t('common.cancel')}</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
                  {modal==='create' ? t('crops.create_btn') : t('crops.save_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
