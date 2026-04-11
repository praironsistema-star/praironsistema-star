'use client'
import { IndustryGuard } from '@/components/IndustryGuard'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { toastSuccess, toastError } from '@/components/ui/Toast'

const CERTIFICADORAS = ['USDA Organic','UE Orgánico','BCS','CERES','IMO','Rainforest Alliance','Fair Trade','otro']
const RESULTADOS = ['aprobado','observaciones','rechazado']
const inp: React.CSSProperties = { width:'100%', border:'0.5px solid #e5e5e3', borderRadius:'7px', padding:'9px 12px', fontSize:'13px', outline:'none', boxSizing:'border-box', fontFamily:'inherit', background:'#f9f9f7' }

function OrganicaPage() {
  const [tab, setTab] = useState('dashboard')
  const [parcelas, setParcelas] = useState<any[]>([])
  const [certs, setCerts] = useState<any[]>([])
  const [inspecciones, setInspecciones] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [parcelaModal, setParcelaModal] = useState(false)
  const [certModal, setCertModal] = useState(false)
  const [inspeccionModal, setInspeccionModal] = useState(false)
  const [selParcela, setSelParcela] = useState<any>(null)
  const [parcelaForm, setParcelaForm] = useState({ nombre:'', cultivo:'', areaHa:'', anoConversion:'', status:'en_conversion' })
  const [certForm, setCertForm] = useState({ entidad:'USDA Organic', tipo:'organico', fechaEmision: new Date().toISOString().split('T')[0], fechaVencimiento:'', numeroDoc:'' })
  const [inspeccionForm, setInspeccionForm] = useState({ fecha: new Date().toISOString().split('T')[0], inspector:'', entidad:'', resultado:'aprobado', observaciones:'', proximaFecha:'' })

  async function loadAll() {
    setLoading(true)
    try {
      const [p, c, i] = await Promise.allSettled([api.get('/organica/parcelas'), api.get('/organica/certificaciones'), api.get('/organica/inspecciones')])
      if (p.status === 'fulfilled') setParcelas(p.value.data ?? [])
      if (c.status === 'fulfilled') setCerts(c.value.data ?? [])
      if (i.status === 'fulfilled') setInspecciones(i.value.data ?? [])
    } finally { setLoading(false) }
  }
  useEffect(() => { loadAll() }, [])

  async function saveParcela(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/organica/parcelas', { ...parcelaForm, areaHa: parseFloat(parcelaForm.areaHa), anoConversion: parcelaForm.anoConversion ? parseInt(parcelaForm.anoConversion) : null })
      setParcelaModal(false); loadAll(); toastSuccess('Parcela creada')
    } catch { toastError('Error al crear parcela') }
  }

  async function saveCert(e: React.FormEvent) {
    e.preventDefault()
    if (!selParcela) return
    try {
      await api.post('/organica/certificaciones', { parcelaId: selParcela.id, ...certForm })
      setCertModal(false); loadAll(); toastSuccess('Certificación registrada')
    } catch { toastError('Error al registrar certificación') }
  }

  async function saveInspeccion(e: React.FormEvent) {
    e.preventDefault()
    if (!selParcela) return
    try {
      await api.post('/organica/inspecciones', { parcelaId: selParcela.id, ...inspeccionForm })
      setInspeccionModal(false); loadAll(); toastSuccess('Inspección registrada')
    } catch { toastError('Error al registrar inspección') }
  }

  const certsVigentes = certs.filter(c => c.status === 'vigente').length
  const certsVencidas = certs.filter(c => c.status === 'vencida').length
  const totalAreaHa = parcelas.reduce((s,p) => s+(p.areaHa||0), 0)

  return (
    <div style={{ padding:'28px 32px', maxWidth:'1200px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>Agricultura Orgánica 🌿</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>Parcelas en conversión, certificaciones e inspecciones</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          {tab === 'parcelas' && <button onClick={() => setParcelaModal(true)} style={{ fontSize:'12px', padding:'8px 16px', background:'#15803d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Parcela</button>}
          {tab === 'certificaciones' && <button onClick={() => { if(parcelas.length){ setSelParcela(parcelas[0]); setCertModal(true) } else toastError('Crea una parcela primero') }} style={{ fontSize:'12px', padding:'8px 16px', background:'#15803d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Certificación</button>}
          {tab === 'inspecciones' && <button onClick={() => { if(parcelas.length){ setSelParcela(parcelas[0]); setInspeccionModal(true) } else toastError('Crea una parcela primero') }} style={{ fontSize:'12px', padding:'8px 16px', background:'#15803d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>+ Inspección</button>}
        </div>
      </div>

      <div style={{ display:'flex', gap:'4px', marginBottom:'20px', borderBottom:'0.5px solid #e5e5e3' }}>
        {['dashboard','parcelas','certificaciones','inspecciones'].map(t => <button key={t} onClick={() => setTab(t)} style={{ fontSize:'13px', padding:'8px 16px', background:'none', border:'none', borderBottom: tab===t ? '2px solid #15803d' : '2px solid transparent', color: tab===t ? '#15803d' : '#9b9b97', cursor:'pointer', fontWeight: tab===t ? '500' : '400', textTransform:'capitalize' }}>{t}</button>)}
      </div>

      {loading ? <div style={{ color:'#9b9b97', fontSize:'13px' }}>Cargando...</div> : (
        <>
          {tab === 'dashboard' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
              {[
                { label:'Parcelas orgánicas', value: parcelas.length },
                { label:'Área total (ha)', value: Math.round(totalAreaHa*10)/10 },
                { label:'Certs. vigentes', value: certsVigentes },
                { label:'Certs. vencidas', value: certsVencidas },
              ].map(k => (
                <div key={k.label} style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', padding:'16px' }}>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginBottom:'6px', fontWeight:'500', textTransform:'uppercase' }}>{k.label}</div>
                  <div style={{ fontSize:'24px', fontWeight:'600', color:'#15803d', fontFamily:'monospace' }}>{k.value}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'parcelas' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {parcelas.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay parcelas registradas</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Nombre','Cultivo','Área (ha)','Año conversión','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{parcelas.map((p:any) => (
                    <tr key={p.id} style={{ borderBottom:'0.5px solid #f0f0ee', cursor:'pointer' }} onClick={() => { setSelParcela(p); setCertModal(true) }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{p.nombre}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#15803d', fontWeight:'500' }}>{p.cultivo}</td>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontFamily:'monospace', color:'#15803d' }}>{p.areaHa}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{p.anoConversion||'—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background: p.status==='certificado'?'#dcfce7':'#fef3c7', color: p.status==='certificado'?'#15803d':'#b45309' }}>{p.status?.replace('_',' ')}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'certificaciones' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {certs.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay certificaciones registradas</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Parcela','Entidad','Tipo','Emisión','Vencimiento','N° Doc','Estado'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{certs.map((c:any) => (
                    <tr key={c.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{c.parcela?.nombre||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#15803d', fontWeight:'500' }}>{c.entidad}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67', textTransform:'capitalize' }}>{c.tipo?.replace('_',' ')}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(c.fechaEmision).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{c.fechaVencimiento ? new Date(c.fechaVencimiento).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{c.numeroDoc||'—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background: c.status==='vigente'?'#dcfce7':c.status==='vencida'?'#fee2e2':'#fef3c7', color: c.status==='vigente'?'#15803d':c.status==='vencida'?'#dc2626':'#b45309' }}>{c.status}</span></td>
                    </tr>
                  ))}</tbody>
                </table>
              )}
            </div>
          )}

          {tab === 'inspecciones' && (
            <div style={{ background:'#fff', border:'0.5px solid #e5e5e3', borderRadius:'10px', overflow:'hidden' }}>
              {inspecciones.length === 0 ? <div style={{ padding:'40px', textAlign:'center', color:'#9b9b97', fontSize:'13px' }}>No hay inspecciones registradas</div> : (
                <table style={{ width:'100%', borderCollapse:'collapse' }}>
                  <thead><tr style={{ background:'#f9f9f7', borderBottom:'0.5px solid #e5e5e3' }}>
                    {['Parcela','Fecha','Inspector','Entidad','Resultado','Próxima'].map(h => <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:'11px', fontWeight:'500', color:'#9b9b97' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{inspecciones.map((i:any) => (
                    <tr key={i.id} style={{ borderBottom:'0.5px solid #f0f0ee' }}>
                      <td style={{ padding:'10px 14px', fontSize:'13px', fontWeight:'500', color:'#1a1a18' }}>{i.parcela?.nombre||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{new Date(i.fecha).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'})}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{i.inspector||'—'}</td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{i.entidad||'—'}</td>
                      <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'11px', padding:'3px 8px', borderRadius:'4px', background: i.resultado==='aprobado'?'#dcfce7':i.resultado==='rechazado'?'#fee2e2':'#fef3c7', color: i.resultado==='aprobado'?'#15803d':i.resultado==='rechazado'?'#dc2626':'#b45309' }}>{i.resultado||'—'}</span></td>
                      <td style={{ padding:'10px 14px', fontSize:'12px', color:'#6b6b67' }}>{i.proximaFecha ? new Date(i.proximaFecha).toLocaleDateString('es-CO',{day:'numeric',month:'short',year:'numeric'}) : '—'}</td>
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
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'20px' }}>🌿 Nueva parcela orgánica</div>
            <form onSubmit={saveParcela}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>NOMBRE</label><input value={parcelaForm.nombre} onChange={e=>setParcelaForm({...parcelaForm,nombre:e.target.value})} required style={inp} placeholder="Parcela Orgánica Norte"/></div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>CULTIVO</label><input value={parcelaForm.cultivo} onChange={e=>setParcelaForm({...parcelaForm,cultivo:e.target.value})} required style={inp} placeholder="Café, cacao, hortalizas..."/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ÁREA (ha)</label><input type="number" step="0.01" value={parcelaForm.areaHa} onChange={e=>setParcelaForm({...parcelaForm,areaHa:e.target.value})} required style={inp} placeholder="1.5"/></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>AÑO CONVERSIÓN</label><input type="number" value={parcelaForm.anoConversion} onChange={e=>setParcelaForm({...parcelaForm,anoConversion:e.target.value})} style={inp} placeholder="2022"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ESTADO</label>
                    <select value={parcelaForm.status} onChange={e=>setParcelaForm({...parcelaForm,status:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      <option value="en_conversion">En conversión</option>
                      <option value="certificado">Certificado</option>
                      <option value="suspendido">Suspendido</option>
                    </select></div>
                </div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setParcelaModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#15803d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Crear parcela</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {certModal && selParcela && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>🏆 Nueva certificación</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selParcela.nombre}</div>
            <form onSubmit={saveCert}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ENTIDAD</label>
                    <select value={certForm.entidad} onChange={e=>setCertForm({...certForm,entidad:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {CERTIFICADORAS.map(c=><option key={c}>{c}</option>)}</select></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>TIPO</label>
                    <select value={certForm.tipo} onChange={e=>setCertForm({...certForm,tipo:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {['organico','transicion','fair_trade','rainforest'].map(t=><option key={t}>{t}</option>)}</select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA EMISIÓN</label><input type="date" value={certForm.fechaEmision} onChange={e=>setCertForm({...certForm,fechaEmision:e.target.value})} required style={inp}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA VENCIMIENTO</label><input type="date" value={certForm.fechaVencimiento} onChange={e=>setCertForm({...certForm,fechaVencimiento:e.target.value})} style={inp}/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>N° DOCUMENTO</label><input value={certForm.numeroDoc} onChange={e=>setCertForm({...certForm,numeroDoc:e.target.value})} style={inp} placeholder="Opcional"/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setCertModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#15803d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar certificación</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inspeccionModal && selParcela && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50 }}>
          <div style={{ background:'#fff', borderRadius:'12px', padding:'24px', width:'440px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'16px', fontWeight:'500', marginBottom:'6px' }}>🔍 Nueva inspección</div>
            <div style={{ fontSize:'12px', color:'#9b9b97', marginBottom:'20px' }}>{selParcela.nombre}</div>
            <form onSubmit={saveInspeccion}>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>FECHA</label><input type="date" value={inspeccionForm.fecha} onChange={e=>setInspeccionForm({...inspeccionForm,fecha:e.target.value})} required style={inp}/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>RESULTADO</label>
                    <select value={inspeccionForm.resultado} onChange={e=>setInspeccionForm({...inspeccionForm,resultado:e.target.value})} style={{...inp,cursor:'pointer'}}>
                      {RESULTADOS.map(r=><option key={r}>{r}</option>)}</select></div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>INSPECTOR</label><input value={inspeccionForm.inspector} onChange={e=>setInspeccionForm({...inspeccionForm,inspector:e.target.value})} style={inp} placeholder="Nombre inspector"/></div>
                  <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>ENTIDAD</label><input value={inspeccionForm.entidad} onChange={e=>setInspeccionForm({...inspeccionForm,entidad:e.target.value})} style={inp} placeholder="BCS, CERES..."/></div>
                </div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>OBSERVACIONES</label><input value={inspeccionForm.observaciones} onChange={e=>setInspeccionForm({...inspeccionForm,observaciones:e.target.value})} style={inp} placeholder="Opcional"/></div>
                <div><label style={{ display:'block', fontSize:'11px', color:'#9b9b97', marginBottom:'5px', fontWeight:'500' }}>PRÓXIMA INSPECCIÓN</label><input type="date" value={inspeccionForm.proximaFecha} onChange={e=>setInspeccionForm({...inspeccionForm,proximaFecha:e.target.value})} style={inp}/></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
                <button type="button" onClick={()=>setInspeccionModal(false)} style={{ fontSize:'12px', padding:'8px 16px', border:'0.5px solid #e5e5e3', borderRadius:'6px', background:'transparent', cursor:'pointer' }}>Cancelar</button>
                <button type="submit" style={{ fontSize:'12px', padding:'8px 16px', background:'#15803d', color:'white', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'500' }}>Guardar inspección</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  return <IndustryGuard module="ORGANICA"><OrganicaPage /></IndustryGuard>
}
