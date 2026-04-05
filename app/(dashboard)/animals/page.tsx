'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'
import AnimalsSkeleton from '@/components/ui/AnimalsSkeleton'

const HEALTH_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  saludable:   { bg: '#e8f5ef', color: '#036446', label: 'Saludable' },
  tratamiento: { bg: '#fef3e2', color: '#b45309', label: 'En tratamiento' },
  enfermo:     { bg: '#fef2f2', color: '#dc2626', label: 'Enfermo' },
}

const ANIMAL_ICONS: Record<string, string> = {
  bovino: '🐄', equino: '🐴', porcino: '🐷', ovino: '🐑', caprino: '🐐', aviar: '🐔',
}

export default function AnimalsPage() {
  const { t } = useI18n()
  const [animals, setAnimals] = useState<any[]>([])
  const [farms, setFarms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [vetRecords, setVetRecords] = useState<any[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [modal, setModal] = useState<'create'|'edit'|'vet'|null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ type:'bovino', breed:'', age:'', healthStatus:'saludable', milkProduction:'', farmId:'' })
  const [vetForm, setVetForm] = useState({ observations:'', treatments:'', date:'' })
  const [savingVet, setSavingVet] = useState(false)

  const load = async () => {
    try {
      const { data: a } = await supabase.from('animals').select('*').is('deleted_at',null)
      const { data: f } = await supabase.from('farms').select('id,name').is('deleted_at',null)
      setAnimals(a||[]); setFarms(f||[])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function openAnimal(animal: any) {
    setSelected(animal)
    setLoadingRecords(true)
    try {
      const { data: r } = await supabase.from('animals').select('*,vet_records(*)').eq('id',animal.id).single()
      setVetRecords(r?.vet_records || [])
    } catch { setVetRecords([]) }
    finally { setLoadingRecords(false) }
    setModal('vet')
  }

  function openCreate() {
    setForm({ type:'bovino', breed:'', age:'', healthStatus:'saludable', milkProduction:'', farmId: farms[0]?.id||'' })
    setSelected(null); setModal('create')
  }

  function openEdit(a: any, e: React.MouseEvent) {
    e.stopPropagation()
    setForm({ type:a.type, breed:a.breed, age:String(a.age), healthStatus:a.healthStatus, milkProduction:String(a.milkProduction||''), farmId:a.farmId })
    setSelected(a); setModal('edit')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { ...form, age:parseInt(form.age), milkProduction:parseFloat(form.milkProduction)||0 }
    if (modal === 'create') await supabase.from('animals').insert(body)
    else await supabase.from('animals').update(body).eq('id',selected.id)
    setModal(null); load(); toastSuccess('Guardado correctamente')
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!await confirm({ title: 'Eliminar', message: '¿Estás seguro?', danger: true, confirmText: 'Eliminar' })){ return }
    // was: este animal?')) return
    await supabase.from('animals').update({deleted_at:new Date().toISOString()}).eq('id',id); load(); toastSuccess('Animal eliminado')
  }

  async function handleVetRecord(e: React.FormEvent) {
    e.preventDefault()
    setSavingVet(true)
    try {
      await supabase.from('vet_records').insert({
        animal_id: selected.id,
        ...vetForm,
        date: vetForm.date || new Date().toISOString(),
      })
      const { data: r } = await supabase.from('animals').select('*,vet_records(*)').eq('id',selected.id).single()
      setVetRecords(r?.vet_records || [])
      setVetForm({ observations:'', treatments:'', date:'' })
    } finally { setSavingVet(false) }
  }

  async function updateHealth(animalId: string, healthStatus: string) {
    await supabase.from('animals').update({health_status:healthStatus}).eq('id',animalId)
    load()
    if (selected?.id === animalId) setSelected((prev: any) => ({ ...prev, healthStatus }))
  }

  const filtered = animals
    .filter(a => filter === 'all' || a.healthStatus === filter)
    .filter(a => !search || a.breed.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase()))

  const counts = {
    all: animals.length,
    saludable: animals.filter(a => a.healthStatus === 'saludable').length,
    tratamiento: animals.filter(a => a.healthStatus === 'tratamiento').length,
    enfermo: animals.filter(a => a.healthStatus === 'enfermo').length,
  }

  const totalMilk = animals.filter(a => a.milkProduction > 0).reduce((s, a) => s + a.milkProduction, 0)
  const avgMilk = animals.filter(a => a.milkProduction > 0).length > 0
    ? (totalMilk / animals.filter(a => a.milkProduction > 0).length).toFixed(1)
    : '0'

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Animales</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>{animals.length} animales registrados</p>
        </div>
        <button onClick={openCreate} style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
          + Nuevo animal
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:'10px', marginBottom:'24px' }}>
        {[
          { label:'Total animales', value:animals.length, color:'#036446' },
          { label:'Saludables', value:counts.saludable, color:'#036446' },
          { label:'En tratamiento', value:counts.tratamiento, color:'#b45309' },
          { label:'Enfermos', value:counts.enfermo, color: counts.enfermo > 0 ? '#dc2626' : '#036446' },
          { label:'Prod. leche prom.', value:avgMilk+' L/día', color:'#036446' },
        ].map(m => (
          <div key={m.label} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'8px', padding:'14px' }}>
            <div style={{ fontSize:'22px', fontWeight:'500', color:m.color }}>{loading ? '—' : m.value}</div>
            <div style={{ fontSize:'11px', color:'#9b9b97', marginTop:'4px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {counts.enfermo > 0 && (
        <div style={{ background:'#fef2f2', border:'0.5px solid #fecaca', borderRadius:'8px', padding:'12px 16px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444', flexShrink:0 }} />
          <div style={{ fontSize:'13px', color:'#dc2626', fontWeight:'500' }}>
            {counts.enfermo} animal{counts.enfermo > 1 ? 'es' : ''} enfermo{counts.enfermo > 1 ? 's' : ''} — requiere{counts.enfermo > 1 ? 'n' : ''} atención veterinaria urgente
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', alignItems:'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por raza o tipo..."
          style={{ flex:1, border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'7px 12px', fontSize:'13px', outline:'none' }} />
        <div style={{ display:'flex', gap:'6px' }}>
          {[
            { key:'all', label:`Todos (${counts.all})` },
            { key:'saludable', label:`Saludables (${counts.saludable})` },
            { key:'tratamiento', label:`Tratamiento (${counts.tratamiento})` },
            { key:'enfermo', label:`Enfermos (${counts.enfermo})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              style={{ fontSize:'12px', padding:'6px 12px', borderRadius:'20px', border:'0.5px solid', cursor:'pointer',
                borderColor: filter===tab.key?'#036446':'#e5e5e3',
                background: filter===tab.key?'#e8f5ef':'transparent',
                color: filter===tab.key?'#036446':'#6b6b67',
                fontWeight: filter===tab.key?'500':'400' }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <AnimalsSkeleton />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>🐄</div>
          <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>{t('animals.no_animals')}</div>
          <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>{t('animals.no_animals_sub')}</div>
          {filter === 'all' && <button onClick={openCreate} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>{t('animals.register_first')}</button>}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px' }}>
          {filtered.map((a:any) => {
            const hs = HEALTH_STYLES[a.healthStatus] || HEALTH_STYLES.saludable
            const icon = ANIMAL_ICONS[a.type] || '🐾'
            const farmName = a.farm?.name || farms.find(f => f.id === a.farmId)?.name || '—'
            return (
              <div key={a.id} onClick={() => openAnimal(a)}
                style={{ background:'#fff', border:`0.5px solid ${a.healthStatus === 'enfermo' ? '#fecaca' : '#e5e5e3'}`, borderRadius:'10px', padding:'16px', cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#036446'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = a.healthStatus === 'enfermo' ? '#fecaca' : '#e5e5e3'}>
                <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <div style={{ fontSize:'28px', lineHeight:1 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{a.breed}</div>
                      <div style={{ fontSize:'11px', color:'#9b9b97', textTransform:'capitalize' }}>{a.type}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', gap:'4px' }}>
                    <button onClick={e => openEdit(a, e)} style={{ fontSize:'11px', padding:'4px 8px', border:'0.5px solid #e5e5e3', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#6b6b67' }}>{t('common.edit')}</button>
                    <button onClick={e => handleDelete(a.id, e)} style={{ fontSize:'11px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>×</button>
                  </div>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px' }}>
                  <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'6px 10px' }}>
                    <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18' }}>{a.age} meses</div>
                    <div style={{ fontSize:'10px', color:'#9b9b97' }}>edad</div>
                  </div>
                  <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'6px 10px' }}>
                    <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18' }}>{a.milkProduction > 0 ? a.milkProduction+' L' : '—'}</div>
                    <div style={{ fontSize:'10px', color:'#9b9b97' }}>leche/día</div>
                  </div>
                </div>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <span style={{ fontSize:'11px', fontWeight:'500', padding:'3px 10px', borderRadius:'20px', background:hs.bg, color:hs.color }}>{hs.label}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                    <span style={{ fontSize:'11px', color:'#9b9b97' }}>{farmName}</span>
                    {a._count?.vetRecords > 0 && (
                      <span style={{ fontSize:'10px', color:'#036446', fontWeight:'500' }}>· {a._count.vetRecords} registros</span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal === 'vet' && selected && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'flex-start', justifyContent:'flex-end', zIndex:50 }}>
          <div style={{ background:'#fff', width:'480px', height:'100vh', overflowY:'auto', boxShadow:'-4px 0 40px rgba(0,0,0,0.15)', display:'flex', flexDirection:'column' }}>

            <div style={{ padding:'20px 24px', borderBottom:'0.5px solid #e5e5e3', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                <div style={{ fontSize:'28px' }}>{ANIMAL_ICONS[selected.type] || '🐾'}</div>
                <div>
                  <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18' }}>{selected.breed}</div>
                  <div style={{ fontSize:'12px', color:'#9b9b97', textTransform:'capitalize' }}>{selected.type} · {selected.age} meses</div>
                </div>
              </div>
              <button onClick={() => setModal(null)} style={{ fontSize:'16px', background:'transparent', border:'none', cursor:'pointer', color:'#9b9b97', padding:'4px 8px' }}>×</button>
            </div>

            <div style={{ padding:'16px 24px', borderBottom:'0.5px solid #e5e5e3', flexShrink:0 }}>
              <div style={{ fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.07em', marginBottom:'10px' }}>{t('animals.health_status')}</div>
              <div style={{ display:'flex', gap:'8px' }}>
                {['saludable','tratamiento','enfermo'].map(status => {
                  const hs = HEALTH_STYLES[status]
                  return (
                    <button key={status} onClick={() => updateHealth(selected.id, status)}
                      style={{ flex:1, padding:'8px', border:`1.5px solid ${selected.healthStatus === status ? hs.color : '#e5e5e3'}`, borderRadius:'8px', background: selected.healthStatus === status ? hs.bg : '#fff', cursor:'pointer', fontSize:'12px', fontWeight: selected.healthStatus === status ? '500' : '400', color: selected.healthStatus === status ? hs.color : '#6b6b67' }}>
                      {hs.label}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={{ padding:'16px 24px', borderBottom:'0.5px solid #e5e5e3', flexShrink:0 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px' }}>
                <div style={{ background:'#f9f9f7', borderRadius:'8px', padding:'10px 12px' }}>
                  <div style={{ fontSize:'14px', fontWeight:'500', color:'#036446' }}>{selected.age}</div>
                  <div style={{ fontSize:'10px', color:'#9b9b97' }}>meses</div>
                </div>
                <div style={{ background:'#f9f9f7', borderRadius:'8px', padding:'10px 12px' }}>
                  <div style={{ fontSize:'14px', fontWeight:'500', color:'#036446' }}>{selected.milkProduction > 0 ? selected.milkProduction+' L' : '—'}</div>
                  <div style={{ fontSize:'10px', color:'#9b9b97' }}>leche/día</div>
                </div>
                <div style={{ background:'#f9f9f7', borderRadius:'8px', padding:'10px 12px' }}>
                  <div style={{ fontSize:'14px', fontWeight:'500', color:'#036446' }}>{vetRecords.length}</div>
                  <div style={{ fontSize:'10px', color:'#9b9b97' }}>registros vet.</div>
                </div>
              </div>
            </div>

            <div style={{ padding:'16px 24px', borderBottom:'0.5px solid #e5e5e3', flexShrink:0 }}>
              <div style={{ fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.07em', marginBottom:'12px' }}>{t('animals.vet_new')}</div>
              <form onSubmit={handleVetRecord}>
                <div style={{ marginBottom:'10px' }}>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'4px', fontWeight:'500' }}>FECHA</label>
                  <input type="date" value={vetForm.date} onChange={e => setVetForm({...vetForm, date:e.target.value})}
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'7px 10px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
                <div style={{ marginBottom:'10px' }}>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'4px', fontWeight:'500' }}>OBSERVACIONES</label>
                  <textarea value={vetForm.observations} onChange={e => setVetForm({...vetForm, observations:e.target.value})} required rows={3}
                    placeholder="Descripción del estado del animal, síntomas observados..."
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'7px 10px', fontSize:'13px', outline:'none', resize:'vertical', boxSizing:'border-box' }} />
                </div>
                <div style={{ marginBottom:'12px' }}>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'4px', fontWeight:'500' }}>TRATAMIENTO APLICADO</label>
                  <textarea value={vetForm.treatments} onChange={e => setVetForm({...vetForm, treatments:e.target.value})} required rows={2}
                    placeholder="Medicamentos, dosis, procedimientos realizados..."
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'7px 10px', fontSize:'13px', outline:'none', resize:'vertical', boxSizing:'border-box' }} />
                </div>
                <button type="submit" disabled={savingVet}
                  style={{ width:'100%', padding:'9px', background: savingVet ? '#e5e5e3' : '#036446', color: savingVet ? '#9b9b97' : 'white', border:'none', borderRadius:'6px', fontSize:'12px', fontWeight:'500', cursor: savingVet ? 'not-allowed' : 'pointer' }}>
                  {savingVet ? t('common.saving') : t('animals.vet_save')}
                </button>
              </form>
            </div>

            <div style={{ flex:1, padding:'16px 24px', overflowY:'auto' }}>
              <div style={{ fontSize:'11px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.07em', marginBottom:'12px' }}>
                {t('animals.vet_history')} ({vetRecords.length})
              </div>
              {loadingRecords ? (
                <div style={{ color:'#9b9b97', fontSize:'12px', textAlign:'center', padding:'20px' }}>{t('animals.vet_loading')}</div>
              ) : vetRecords.length === 0 ? (
                <div style={{ textAlign:'center', padding:'30px 0' }}>
                  <div style={{ fontSize:'24px', marginBottom:'8px' }}>📋</div>
                  <div style={{ fontSize:'13px', color:'#9b9b97' }}>{t('animals.vet_empty')}</div>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginTop:'4px' }}>{t('animals.vet_empty_sub')}</div>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {vetRecords.map((rec: any, i: number) => (
                    <div key={rec.id} style={{ border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'14px', position:'relative' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'8px' }}>
                        <div style={{ fontSize:'12px', fontWeight:'500', color:'#036446' }}>
                          {rec.date ? new Date(rec.date).toLocaleDateString('es-CO',{ day:'numeric', month:'long', year:'numeric' }) : 'Sin fecha'}
                        </div>
                        {i === 0 && (
                          <span style={{ fontSize:'10px', fontWeight:'500', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446' }}>{t('common.last')}</span>
                        )}
                      </div>
                      {rec.veterinarian && (
                        <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'8px' }}>
                          {t('animals.vet_doctor')}: {rec.veterinarian.name}
                        </div>
                      )}
                      <div style={{ marginBottom:'8px' }}>
                        <div style={{ fontSize:'10px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em', marginBottom:'3px' }}>OBSERVACIONES</div>
                        <div style={{ fontSize:'12px', color:'#1a1a18', lineHeight:1.5 }}>{rec.observations}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:'10px', fontWeight:'500', color:'#9b9b97', letterSpacing:'0.06em', marginBottom:'3px' }}>TRATAMIENTO</div>
                        <div style={{ fontSize:'12px', color:'#1a1a18', lineHeight:1.5 }}>{rec.treatments}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'460px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>{modal==='create' ? t('animals.modal_create') : t('animals.modal_edit')}</div>
            <form onSubmit={handleSubmit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO</label>
                  <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', background:'#fff' }}>
                    {['bovino','equino','porcino','ovino','caprino','aviar'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>RAZA</label>
                  <input value={form.breed} onChange={e => setForm({...form, breed:e.target.value})} required placeholder="Ej: Holstein"
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>EDAD (meses)</label>
                  <input type="number" value={form.age} onChange={e => setForm({...form, age:e.target.value})} required min="0"
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESTADO DE SALUD</label>
                  <select value={form.healthStatus} onChange={e => setForm({...form, healthStatus:e.target.value})}
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', background:'#fff' }}>
                    <option value="saludable">Saludable</option>
                    <option value="tratamiento">En tratamiento</option>
                    <option value="enfermo">Enfermo</option>
                  </select>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'20px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRODUCCIÓN LECHE (L/día)</label>
                  <input type="number" value={form.milkProduction} onChange={e => setForm({...form, milkProduction:e.target.value})} min="0" step="0.1" placeholder="0"
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>GRANJA</label>
                  <select value={form.farmId} onChange={e => setForm({...form, farmId:e.target.value})} required
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', background:'#fff' }}>
                    <option value="">Seleccionar...</option>
                    {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setModal(null)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>{t('common.cancel')}</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
                  {modal==='create' ? t('animals.register_btn') : t('animals.save_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
