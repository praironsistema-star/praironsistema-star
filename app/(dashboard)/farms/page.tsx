'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'
import FarmsSkeleton from '@/components/ui/FarmsSkeleton'

const FARM_TYPES = ['ganadera','agricola','mixta','avicola','lechera','porcicola']

const ZONE_COLORS: Record<string, { fill: string; stroke: string; label: string }> = {
  pasto:      { fill: '#dcfce7', stroke: '#16a34a', label: 'Pasto' },
  maiz:       { fill: '#fef9c3', stroke: '#ca8a04', label: 'Maíz' },
  cafe:       { fill: '#fef3c7', stroke: '#92400e', label: 'Café' },
  palma:      { fill: '#d1fae5', stroke: '#065f46', label: 'Palma' },
  cana:       { fill: '#fce7f3', stroke: '#9d174d', label: 'Caña' },
  arroz:      { fill: '#dbeafe', stroke: '#1e40af', label: 'Arroz' },
  cacao:      { fill: '#ede9fe', stroke: '#6d28d9', label: 'Cacao' },
  hortalizas: { fill: '#ecfccb', stroke: '#3f6212', label: 'Hortalizas' },
  frutales:   { fill: '#ffedd5', stroke: '#c2410c', label: 'Frutales' },
  default:    { fill: '#f1f5f9', stroke: '#64748b', label: 'Sin cultivo' },
}

const HEALTH_COLORS: Record<string, string> = {
  saludable: '#16a34a',
  tratamiento: '#f59e0b',
  enfermo: '#ef4444',
}

function FarmMap({ farm }: { farm: any }) {
  const [hoveredParcel, setHoveredParcel] = useState<string | null>(null)
  const parcels = farm.parcels || []
  const animals = farm.animals || []
  const totalArea = farm.totalArea || 1

  const SVG_W = 560
  const SVG_H = 320
  const PAD = 20

  const buildLayout = () => {
    if (parcels.length === 0) return []
    const availW = SVG_W - PAD * 2
    const availH = SVG_H - PAD * 2 - 40
    const cols = parcels.length <= 2 ? parcels.length : parcels.length <= 4 ? 2 : 3
    const rows = Math.ceil(parcels.length / cols)
    const cellW = availW / cols
    const cellH = availH / rows

    return parcels.map((p: any, i: number) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const ratio = (p.totalArea || 50) / totalArea
      const w = Math.max(cellW * 0.85, 80)
      const h = Math.max(cellH * 0.8 * (0.5 + ratio * 2), 60)
      const x = PAD + col * cellW + (cellW - w) / 2
      const y = PAD + 40 + row * cellH + (cellH - h) / 2
      return { parcel: p, x, y, w, h }
    })
  }

  const layout = buildLayout()
  const sickCount = animals.filter((a: any) => a.healthStatus === 'enfermo').length
  const treatCount = animals.filter((a: any) => a.healthStatus === 'tratamiento').length

  return (
    <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ padding: '14px 18px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18' }}>{farm.name}</div>
          <div style={{ fontSize: '12px', color: '#9b9b97', marginTop: '2px' }}>
            {farm.totalArea} ha · {farm.location} · {parcels.length} parcelas
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: '#e8f5ef', color: '#036446' }}>
            {animals.length} animales
          </span>
          {sickCount > 0 && (
            <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: '#fef2f2', color: '#dc2626' }}>
              {sickCount} enfermos
            </span>
          )}
          {treatCount > 0 && (
            <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: '#fef3e2', color: '#b45309' }}>
              {treatCount} en tratamiento
            </span>
          )}
        </div>
      </div>

      <div style={{ position: 'relative' }}>
        <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ display: 'block' }}>
          <defs>
            <pattern id={`grid-${farm.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0ee" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width={SVG_W} height={SVG_H} fill={`url(#grid-${farm.id})`} />

          <text x={PAD} y={PAD + 18} fontSize="11" fontWeight="500" fill="#9b9b97" letterSpacing="1">
            MAPA DE FINCA — {farm.name.toUpperCase()}
          </text>

          {layout.length === 0 && (
            <text x={SVG_W/2} y={SVG_H/2} fontSize="13" fill="#9b9b97" textAnchor="middle">
              Sin parcelas registradas
            </text>
          )}

          {layout.map(({ parcel, x, y, w, h }: any) => {
            const cropKey = parcel.cropType?.toLowerCase() || 'default'
            const colors = ZONE_COLORS[cropKey] || ZONE_COLORS.default
            const isHovered = hoveredParcel === parcel.id
            const farmAnimals = animals.filter((a: any) => a.farmId === farm.id)

            return (
              <g key={parcel.id}
                onMouseEnter={() => setHoveredParcel(parcel.id)}
                onMouseLeave={() => setHoveredParcel(null)}
                style={{ cursor: 'pointer' }}>
                <rect
                  x={x} y={y} width={w} height={h} rx="8"
                  fill={colors.fill}
                  stroke={isHovered ? colors.stroke : colors.stroke + '88'}
                  strokeWidth={isHovered ? 2 : 1}
                  style={{ transition: 'all 0.15s' }}
                />
                <text x={x + w/2} y={y + h/2 - 10} fontSize="12" fontWeight="500"
                  fill="#1a1a18" textAnchor="middle" dominantBaseline="middle">
                  {parcel.name.length > 14 ? parcel.name.slice(0, 13) + '…' : parcel.name}
                </text>
                <text x={x + w/2} y={y + h/2 + 8} fontSize="10"
                  fill="#6b6b67" textAnchor="middle" dominantBaseline="middle">
                  {parcel.totalArea} ha
                </text>
                {parcel.cropType && (
                  <text x={x + w/2} y={y + h/2 + 22} fontSize="9"
                    fill={colors.stroke} textAnchor="middle" dominantBaseline="middle">
                    {colors.label}
                  </text>
                )}
                {isHovered && parcel.soilType && (
                  <text x={x + w/2} y={y + h - 10} fontSize="9"
                    fill="#9b9b97" textAnchor="middle" dominantBaseline="middle">
                    Suelo: {parcel.soilType}
                  </text>
                )}
              </g>
            )
          })}

          {animals.length > 0 && (
            <g>
              {animals.slice(0, 8).map((a: any, i: number) => {
                const dotX = PAD + 20 + i * 22
                const dotY = SVG_H - 18
                return (
                  <g key={a.id}>
                    <circle cx={dotX} cy={dotY} r="7"
                      fill={HEALTH_COLORS[a.healthStatus] || '#9b9b97'}
                      stroke="white" strokeWidth="1.5" />
                    <title>{a.breed} · {a.healthStatus}</title>
                  </g>
                )
              })}
              {animals.length > 8 && (
                <text x={PAD + 20 + 8 * 22} y={SVG_H - 14} fontSize="10" fill="#9b9b97">
                  +{animals.length - 8}
                </text>
              )}
              <text x={PAD} y={SVG_H - 28} fontSize="9" fill="#9b9b97" fontWeight="500" letterSpacing="0.5">
                ANIMALES
              </text>
            </g>
          )}
        </svg>

        {hoveredParcel && (() => {
          const item = layout.find((l: any) => l.parcel.id === hoveredParcel)
          if (!item) return null
          const parcel = item.parcel
          const lots = parcel.lots || []
          return (
            <div style={{
              position: 'absolute', top: '12px', right: '12px',
              background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px',
              padding: '12px 14px', minWidth: '180px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              pointerEvents: 'none',
            }}>
              <div style={{ fontSize: '12px', fontWeight: '500', color: '#1a1a18', marginBottom: '8px' }}>{parcel.name}</div>
              <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '3px' }}>Área: {parcel.totalArea} ha</div>
              {parcel.cropType && <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '3px' }}>Cultivo: {parcel.cropType}</div>}
              {parcel.soilType && <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '3px' }}>Suelo: {parcel.soilType}</div>}
              <div style={{ fontSize: '11px', color: '#9b9b97' }}>Estado: {parcel.status}</div>
              {lots.length > 0 && <div style={{ fontSize: '11px', color: '#036446', marginTop: '4px' }}>{lots.length} lotes</div>}
            </div>
          )
        })()}
      </div>

      <div style={{ padding: '10px 18px', borderTop: '0.5px solid #f0f0ee', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {Object.entries(ZONE_COLORS).filter(([k]) => k !== 'default' && parcels.some((p: any) => p.cropType?.toLowerCase() === k)).map(([key, val]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: val.fill, border: `1px solid ${val.stroke}` }} />
            <span style={{ fontSize: '11px', color: '#6b6b67' }}>{val.label}</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }} />
          <span style={{ fontSize: '11px', color: '#6b6b67' }}>Saludable</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ fontSize: '11px', color: '#6b6b67' }}>Tratamiento</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
          <span style={{ fontSize: '11px', color: '#6b6b67' }}>Enfermo</span>
        </div>
      </div>
    </div>
  )
}

export default function FarmsPage() {
  const { t } = useI18n()
  const [farms, setFarms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'create'|'edit'|null>(null)
  const [selected, setSelected] = useState<any>(null)
  const [deleting, setDeleting] = useState<string|null>(null)
  const [view, setView] = useState<'map'|'list'>('map')
  const [form, setForm] = useState({ name:'', type:'mixta', totalArea:'', location:'' })

  const load = async () => {
    try { ; const r = await api.get('/farms'); setFarms(r.data || []) }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setForm({ name:'', type:'mixta', totalArea:'', location:'' })
    setSelected(null); setModal('create')
  }

  function openEdit(f: any) {
    setForm({ name:f.name, type:f.type, totalArea:String(f.totalArea), location:f.location||'' })
    setSelected(f); setModal('edit')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = { ...form, totalArea: parseFloat(form.totalArea) } as any
        if (modal === 'create') await api.post('/farms', { name:body.name, sector:body.sector?.toLowerCase()||'ganaderia', hectares:body.hectares, country_code:'CO' })
    else await api.patch('/farms/selected.id', { name:body.name, sector:body.sector?.toLowerCase()||'ganaderia', hectares:body.hectares })
    setModal(null); load(); toastSuccess('Guardado correctamente')
  }

  async function handleDelete(id: string) {
    setDeleting(id)
        await api.patch('/farms/id', { deleted_at: new Date().toISOString() })
    setDeleting(null); load(); toastSuccess('Granja eliminada')
  }

  const totalHa = farms.reduce((s, f) => s + (f.totalArea||0), 0)

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>

      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>{t('farms.title')}</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>
            {farms.length} granjas · {totalHa.toLocaleString()} ha totales
          </p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <div style={{ display:'flex', border:'0.5px solid #e5e5e3', borderRadius:'6px', overflow:'hidden' }}>
            <button onClick={() => setView('map')} style={{ padding:'7px 14px', fontSize:'12px', border:'none', cursor:'pointer', background: view==='map'?'#036446':'transparent', color: view==='map'?'white':'#6b6b67', fontWeight: view==='map'?'500':'400' }}>
              Mapa
            </button>
            <button onClick={() => setView('list')} style={{ padding:'7px 14px', fontSize:'12px', border:'none', cursor:'pointer', background: view==='list'?'#036446':'transparent', color: view==='list'?'white':'#6b6b67', fontWeight: view==='list'?'500':'400' }}>
              Lista
            </button>
          </div>
          <button onClick={openCreate} style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
            + Nueva granja
          </button>
        </div>
      </div>

      {loading ? (
        <FarmsSkeleton />
      ) : farms.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>🌾</div>
          <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>{t('farms.no_farms')}</div>
          <div style={{ fontSize:'13px', color:'#9b9b97', marginBottom:'20px' }}>{t('farms.no_farms_sub')}</div>
          <button onClick={openCreate} style={{ fontSize:'12px', padding:'8px 20px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer' }}>
            Crear primera granja
          </button>
        </div>
      ) : view === 'map' ? (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {farms.map(f => <FarmMap key={f.id} farm={f} />)}
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'12px' }}>
          {farms.map((f:any) => (
            <div key={f.id} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'18px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'12px' }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'14px', fontWeight:'500', color:'#1a1a18', marginBottom:'4px' }}>{f.name}</div>
                  <span style={{ fontSize:'10px', fontWeight:'500', padding:'2px 8px', borderRadius:'20px', background:'#e8f5ef', color:'#036446' }}>
                    {f.type}
                  </span>
                </div>
                <div style={{ display:'flex', gap:'4px', flexShrink:0, marginLeft:'8px' }}>
                  <button onClick={() => openEdit(f)} style={{ fontSize:'11px', padding:'4px 8px', border:'0.5px solid #e5e5e3', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#6b6b67' }}>Editar</button>
                  <button onClick={() => handleDelete(f.id)} disabled={deleting===f.id} style={{ fontSize:'11px', padding:'4px 8px', border:'0.5px solid #fecaca', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#ef4444' }}>
                    {deleting===f.id ? '...' : t('common.delete')}
                  </button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px 10px' }}>
                  <div style={{ fontSize:'16px', fontWeight:'500', color:'#036446' }}>{f.totalArea}</div>
                  <div style={{ fontSize:'10px', color:'#9b9b97' }}>hectáreas</div>
                </div>
                <div style={{ background:'#f9f9f7', borderRadius:'6px', padding:'8px 10px' }}>
                  <div style={{ fontSize:'12px', fontWeight:'500', color:'#1a1a18', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.location||'—'}</div>
                  <div style={{ fontSize:'10px', color:'#9b9b97' }}>ubicación</div>
                </div>
              </div>
              {f.parcels && f.parcels.length > 0 && (
                <div style={{ marginTop:'10px', paddingTop:'10px', borderTop:'0.5px solid #f0f0ee', fontSize:'11px', color:'#9b9b97' }}>
                  {f.parcels.length} parcelas · {f.animals?.length||0} animales
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>
              {modal==='create' ? t('farms.modal_create') : t('farms.modal_edit')}
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom:'14px' }}>
                <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{t('farms.farm_name')}</label>
                <input value={form.name} onChange={e => setForm({...form, name:e.target.value})} required placeholder="Ej: Hacienda El Progreso"
                  style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px', marginBottom:'14px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{t('farms.type')}</label>
                  <select value={form.type} onChange={e => setForm({...form, type:e.target.value})}
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', background:'#fff' }}>
                    {FARM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{t('farms.area')}</label>
                  <input type="number" value={form.totalArea} onChange={e => setForm({...form, totalArea:e.target.value})} required min="0"
                    style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom:'20px' }}>
                <label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>{t('farms.location_label')}</label>
                <input value={form.location} onChange={e => setForm({...form, location:e.target.value})} placeholder="Ej: Córdoba, Colombia"
                  style={{ width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'6px', padding:'8px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={() => setModal(null)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>{t('common.cancel')}</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#036446', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>
                  {modal==='create' ? t('farms.create_btn') : t('farms.save_btn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
