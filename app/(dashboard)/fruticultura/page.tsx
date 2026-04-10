'use client'
import { IndustryGuard } from '@/components/IndustryGuard'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'

const ESPECIES = ['mango','aguacate','maracuyá','mora','fresa','banano','cítricos','mandarina','piña','papaya','otro']
const CALIBRES = ['extra','primera','segunda','tercera']
const DESTINOS = ['exportacion','mercado_local','industria','descarte']
const inp: React.CSSProperties = { width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7' }

function FruticulturaPage() {
  const [tab, setTab] = useState('dashboard')
  const [parcelas, setParcelas] = useState<any[]>([])
  const [cosechas, setCosechas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [parcelaModal, setParcelaModal] = useState(false)
  const [cosechaModal, setCosechaModal] = useState(false)
  const [selParcela, setSelParcela] = useState<any>(null)
  const [parcelaForm, setParcelaForm] = useState({ nombre:'', especie:'mango', variedad:'', areaHa:'', plantYear:'', plantCount:'', sistemaRiego:'goteo' })
  const [cosechaForm, setCosechaForm] = useState({ fecha: new Date().toISOString().split('T')[0], kgCosechados:'', cajasUnidades:'', calibre:'primera', destino:'mercado_local', precioKg:'', operarios:'' })

  async function loadAll() {
    setLoading(true)
    try {
      const [p, c] = await Promise.allSettled([api.get('/fruticultura/parcelas'), api.get('/fruticultura/cosechas')])
      if (p.status === 'fulfilled') setParcelas(p.value.data ?? [])
      if (c.status === 'fulfilled') setCosechas(c.value.data ?? [])
    } finally { setLoading(false) }
  }
  useEffect(() => { loadAll() }, [])

  async function saveParcela(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/fruticultura/parcelas', { ...parcelaForm, areaHa: parseFloat(parcelaForm.areaHa), plantYear: parcelaForm.plantYear ? parseInt(parcelaForm.plantYear) : null, plantCount: parcelaForm.plantCount ? parseInt(parcelaForm.plantCount) : null })
      setParcelaModal(false); loadAll(); toastSuccess('Parcela creada')
    } catch { toastError('Error al crear parcela') }
  }

  async function saveCosecha(e: React.FormEvent) {
    e.preventDefault()
    if (!selParcela) return
    try {
      await api.post('/fruticultura/cosechas', { parcelaId: selParcela.id, ...cosechaForm, kgCosechados: parseFloat(cosechaForm.kgCosechados), cajasUnidades: cosechaForm.cajasUnidades ? parseInt(cosechaForm.cajasUnidades) : null, precioKg: cosechaForm.precioKg ? parseFloat(cosechaForm.precioKg) : null, operarios: cosechaForm.operarios ? parseInt(cosechaForm.operarios) : null })
      setCosechaModal(false); loadAll(); toastSuccess('Cosecha registrada')
    } catch { toastError('Error al registrar cosecha') }
  }

  const totalAreaHa = parcelas.reduce((s,p) => s+(p.areaHa||0), 0)
  const totalKg = cosechas.reduce((s,c) => s+(c.kgCosechados||0), 0)
  const totalRevenue = cosechas.reduce((s,c) => s+((c.kgCosechados||0)*(c.precioKg||0)), 0)
  const rendimiento = totalAreaHa > 0 ? Math.round(totalKg/totalAreaHa) : 0

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Fruticultura 🍓</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Parcelas, especies, cosechas y calidad</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {tab === 'parcelas' && <button onClick={() => setParcelaModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#b45309', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Parcela</button>}
          {tab === 'cosechas' && <button onClick={() => { if(parcelas.length){ setSelParcela(parcelas[0]); setCosechaModal(true) } else toastError('Crea una parcela primero') }} style={{ fontSize:'12px', padding:'8px 16px', background:'#b45309', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Cosecha</button>}
        </div>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','parcelas','cosechas'].map(t => <button key={t} onClick={() => setTab(t)} style={{ fontSize:'13px', padding:'8px 16px', background:'none', border:'none', borderBottom: tab===t ? '2px solid #b45309' : '2px solid transparent', color: tab===t ? '#b45309' : '#9b9b97', cursor:'pointer', fontWeight: tab===t ? '500' : '400', textTransform:'capitalize' }}>{t}</button>)}
      </div>

      {loading ? <div style={{ color:'#9b9b97', fontSize:'13px' }}>Cargando...</div> : (
        <>
          {tab === 'dashboard' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
              {[
                { label:'Parcelas activas', value: parcelas.length, color:'#b45309' },
                { label:'Área total (ha)', value: totalAreaHa.toFixed(1), color:'#b45309' },
                { label:'Kg cosechados', value: totalKg.toLocaleString(), color:'#b45309' },
                { label:'Rendimiento kg/ha', value: rendimiento.toLocaleString(), color:'#036446' },
              ].map(k => (
                <div key={k.label} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', textTransform:'uppercase' }}>{k.label}</div>
                  <div style={{ fontSize:'24px', fontWeight:'600', color:k.color, fontFamily:'monospace' }}>{k.value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'parcelas' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {parcelas.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay parcelas registradas</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Parcela','Especie','Variedad','Área (ha)','Plantas','Riego','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{parcelas.map((p:any) => (
                    <tr key={p.id} style={{ borderBottom:'0.5px solid #f0f0ee', cursor:'pointer' }} onClick={() => { setSelParcela(p); setCosechaModal(true) }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{p.nombre}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#b45309', fontWeight:'500', textTransform:'capitalize' }}>{p.especie}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{p.variedad||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#b45309' }}>{p.areaHa}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace' }}>{p.plantCount?.toLocaleString()||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', textTransform:'capitalize' }}>{p.sistemaRiego||'—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background:'#fef9c3', color:'#b45309' }}>{p.status}</span></td>
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
                    {['Fecha','Parcela','Kg','Calibre','Destino','Precio/kg','Total COP'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{cosechas.map((c:any) => (
                    <tr key={c.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(c.fecha).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{c.parcela?.nombre||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#b45309', fontWeight:'500' }}>{(c.kgCosechados||0).toLocaleString()}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', textTransform:'capitalize' }}>{c.calibre||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', textTransform:'capitalize' }}>{c.destino||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{c.precioKg ? '$'+c.precioKg.toLocaleString() : '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#036446', fontFamily:'monospace' }}>{c.precioKg&&c.kgCosechados ? '$'+Math.round(c.precioKg*c.kgCosechados).toLocaleString() : '—'}</td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}
        </>
      )}

      {parcelaModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'480px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>🍓 Nueva parcela</div>
            <form onSubmit={saveParcela}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label><input value={parcelaForm.nombre} onChange={e=>setParcelaForm({...parcelaForm,nombre:e.target.value})} required style={inp} placeholder="Parcela El Mango"/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESPECIE</label>
                    <select value={parcelaForm.especie} onChange={e=>setParcelaForm({...parcelaForm,especie:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {ESPECIES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>VARIEDAD</label><input value={parcelaForm.variedad} onChange={e=>setParcelaForm({...parcelaForm,variedad:e.target.value})} style={inp} placeholder="Tommy Atkins"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ÁREA (ha)</label><input type="number" step="0.01" value={parcelaForm.areaHa} onChange={e=>setParcelaForm({...parcelaForm,areaHa:e.target.value})} required style={inp} placeholder="2.0"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PLANTAS</label><input type="number" value={parcelaForm.plantCount} onChange={e=>setParcelaForm({...parcelaForm,plantCount:e.target.value})} style={inp} placeholder="200"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>AÑO SIEMBRA</label><input type="number" value={parcelaForm.plantYear} onChange={e=>setParcelaForm({...parcelaForm,plantYear:e.target.value})} style={inp} placeholder="2020"/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setParcelaModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#b45309', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear parcela</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cosechaModal && selParcela && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>🍓 Registrar cosecha</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selParcela.nombre} · {selParcela.especie}</div>
            <form onSubmit={saveCosecha}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label><input type="date" value={cosechaForm.fecha} onChange={e=>setCosechaForm({...cosechaForm,fecha:e.target.value})} required style={inp}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>KG COSECHADOS</label><input type="number" step="0.1" value={cosechaForm.kgCosechados} onChange={e=>setCosechaForm({...cosechaForm,kgCosechados:e.target.value})} required style={inp} placeholder="0"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CALIBRE</label>
                    <select value={cosechaForm.calibre} onChange={e=>setCosechaForm({...cosechaForm,calibre:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {CALIBRES.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>DESTINO</label>
                    <select value={cosechaForm.destino} onChange={e=>setCosechaForm({...cosechaForm,destino:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {DESTINOS.map(d=><option key={d}>{d}</option>)}</select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRECIO/KG (COP)</label><input type="number" value={cosechaForm.precioKg} onChange={e=>setCosechaForm({...cosechaForm,precioKg:e.target.value})} style={inp} placeholder="Opcional"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>OPERARIOS</label><input type="number" value={cosechaForm.operarios} onChange={e=>setCosechaForm({...cosechaForm,operarios:e.target.value})} style={inp} placeholder="Opcional"/></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setCosechaModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#b45309', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar cosecha</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <IndustryGuard module="MIXTO"><FruticulturaPage /></IndustryGuard>
}
