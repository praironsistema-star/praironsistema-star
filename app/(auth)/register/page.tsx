'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const API = process.env.NEXT_PUBLIC_API_URL || 'https://prairon-backend.onrender.com'

const INDUSTRIES = [
  { key:'GANADERO',    label:'Ganadería',       emoji:'🐄', desc:'Bovinos, porcinos, ovinos',       modules:['Hato bovino','Historial vet.','Producción leche','Maquinaria'] },
  { key:'CAFE',        label:'Caficultura',      emoji:'☕', desc:'Café especial y comercial',        modules:['Lotes de café','Fenología','Cosecha','Fitosanitario'] },
  { key:'AVICOLA',     label:'Avicultura',       emoji:'🐔', desc:'Engorde, postura, reproductoras', modules:['Galpones','Lotes de aves','FCR y mortalidad','Sanidad aviar'] },
  { key:'PALMA',       label:'Palma de aceite',  emoji:'🌴', desc:'FFB, extractora, laboratorio',    modules:['Lotes de palma','Cosecha FFB','Extractora','Laboratorio'] },
  { key:'CACAO',       label:'Cacao',            emoji:'🍫', desc:'Fino de aroma y comercial',       modules:['Lotes','Fermentación','Secado','Trazabilidad'] },
  { key:'ACUICULTURA', label:'Acuicultura',       emoji:'🐟', desc:'Tilapia, trucha, camarón',        modules:['Estanques','Ciclos','Calidad agua','Cosecha'] },
  { key:'APICULTURA',  label:'Apicultura',        emoji:'🍯', desc:'Miel, cera, polinización',        modules:['Apiarios','Colmenas','Inspecciones','Cosecha miel'] },
  { key:'ARROZ',       label:'Arroz',             emoji:'🌾', desc:'Riego, secano, inundado',         modules:['Lotes','Ciclos','Lámina de agua','Cosecha'] },
  { key:'CANA',        label:'Caña de azúcar',    emoji:'🌿', desc:'Panelera e industrial',            modules:['Lotes','Socas','Maduración','Cosecha TCH'] },
  { key:'HORTICULTURA',label:'Horticultura',      emoji:'🥬', desc:'Campo abierto e invernadero',     modules:['Lotes','Ciclos','Fenología','Trazabilidad BPA'] },
  { key:'LACTEO',      label:'Lácteos',           emoji:'🥛', desc:'Leche, queso, derivados',         modules:['Hato lechero','L/día','Calidad leche','Ordeño'] },
  { key:'MIXTO',       label:'Operación mixta',   emoji:'🏡', desc:'Varios sectores productivos',     modules:['Todos los módulos','IA adaptativa','Multi-sector'] },
]

const SUB: Record<string,{key:string;label:string;desc:string}[]> = {
  GANADERO:    [{key:'cria',label:'Cría y levante',desc:'Terneros y recría'},{key:'ceba',label:'Ceba / Engorde',desc:'Bovino para carne'},{key:'doble',label:'Doble propósito',desc:'Carne y leche'},{key:'bufalino',label:'Bufalino',desc:'Búfalos de agua'}],
  AVICOLA:     [{key:'engorde',label:'Pollo de engorde',desc:'Producción de carne'},{key:'postura',label:'Gallina postura',desc:'Producción de huevo'},{key:'reproduct',label:'Reproductoras',desc:'Pollito de 1 día'},{key:'pavo',label:'Pavo / Codorniz',desc:'Otras especies'}],
  PALMA:       [{key:'extractora',label:'Con extractora',desc:'Proceso FFB → aceite'},{key:'sin_extr',label:'Solo FFB',desc:'Venta fruto fresco'},{key:'vivero',label:'Con vivero',desc:'Material vegetal'}],
  CAFE:        [{key:'especial',label:'Café especial',desc:'Exportación y taza'},{key:'comercial',label:'Café comercial',desc:'Mercado interno'},{key:'organico',label:'Orgánico',desc:'Sin agroquímicos'}],
  CACAO:       [{key:'fino',label:'Fino de aroma',desc:'Exportación premium'},{key:'corriente',label:'Comercial',desc:'Mercado local'},{key:'organico',label:'Orgánico',desc:'Certificado'}],
  ACUICULTURA: [{key:'tilapia',label:'Tilapia',desc:'Especie más cultivada'},{key:'trucha',label:'Trucha',desc:'Agua fría'},{key:'camaron',label:'Camarón',desc:'Salada o dulce'},{key:'cachama',label:'Cachama',desc:'Especie nativa'}],
}

const SIZES: Record<string,{key:string;label:string}[]> = {
  GANADERO: [{key:'p',label:'1–50 animales'},{key:'m',label:'51–200 animales'},{key:'g',label:'201–500 animales'},{key:'e',label:'500+ animales'}],
  AVICOLA:  [{key:'p',label:'Hasta 5,000 aves'},{key:'m',label:'5,001–20,000 aves'},{key:'g',label:'20,001–100,000 aves'},{key:'e',label:'100,000+ aves'}],
  PALMA:    [{key:'p',label:'Hasta 50 ha'},{key:'m',label:'51–200 ha'},{key:'g',label:'201–500 ha'},{key:'e',label:'500+ ha'}],
  DEFAULT:  [{key:'p',label:'Hasta 20 ha'},{key:'m',label:'21–100 ha'},{key:'g',label:'101–500 ha'},{key:'e',label:'500+ ha'}],
}

const TEAM = [{val:'1',label:'Solo yo',icon:'👤'},{val:'3',label:'2–5',icon:'👥'},{val:'8',label:'6–15',icon:'🏘️'},{val:'20',label:'16+',icon:'🏢'}]

const NOAH_MSGS: Record<number,string> = {
  1:'¡Hola! Soy NOAH. Primero necesito algunos datos básicos para crear tu cuenta en PRAIRON.',
  2:'Perfecto. ¿Cuál es tu tipo de producción principal? Esto configura todos los módulos automáticamente.',
  3:'Bien. Ahora cuéntame un poco más sobre tu tipo específico de operación.',
  4:'Excelente. Datos de tu finca o empresa — esto precarga el dashboard con información de tu región.',
  5:'¿Cuál es el tamaño de tu operación? Esto ajusta los KPIs y métricas que verás en tu dashboard.',
  6:'¿Cómo está estructurado tu equipo? Configuro los roles y permisos automáticamente.',
  7:'Todo listo. Revisa los datos antes de crear tu cuenta — ¡en segundos estarás dentro!',
}

const STEPS = ['Cuenta','Industria','Sub-sector','Operación','Tamaño','Equipo','Confirmar']

const IND_MAP: Record<string,string> = {
  GANADERO:'GANADERIA',CAFE:'CAFE',AVICOLA:'AVICULTURA',PALMA:'PALMA',
  CACAO:'CACAO',ACUICULTURA:'ACUICULTURA',APICULTURA:'APICULTURA',
  ARROZ:'ARROZ',CANA:'CANA',HORTICULTURA:'HORTICULTURA',
  LACTEO:'GANADERIA',MIXTO:'MIXTO',
}

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep]         = useState(1)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [showPass, setShowPass] = useState(false)
  const [noahText, setNoahText] = useState('')
  const [typing, setTyping]     = useState(false)
  const noahRef = useRef<ReturnType<typeof setTimeout>|null>(null)

  const [form, setForm] = useState({
    adminName:'', adminEmail:'', adminPassword:'',
    industry:'', subInd:'', size:'',
    companyName:'', farmArea:'', location:'', teamSize:'1',
  })

  const set = (k:string, v:string) => setForm(f=>({...f,[k]:v}))
  const ind = INDUSTRIES.find(i=>i.key===form.industry)
  const subs = SUB[form.industry]||[]
  const sizes = SIZES[form.industry]||SIZES.DEFAULT
  const pct = Math.round(((step-1)/(STEPS.length-1))*100)

  useEffect(()=>{
    const msg = NOAH_MSGS[step]||''
    let i=0; setNoahText(''); setTyping(true)
    if(noahRef.current) clearTimeout(noahRef.current)
    const type=()=>{ if(i<=msg.length){setNoahText(msg.slice(0,i));i++;noahRef.current=setTimeout(type,18)}else{setTyping(false)} }
    noahRef.current=setTimeout(type,250)
    return ()=>{ if(noahRef.current) clearTimeout(noahRef.current) }
  },[step])

  const next = ()=>{ setError(''); setStep(s=>s+1) }
  const back = ()=>{ setError(''); setStep(s=>s-1) }

  const validate1 = ()=>{
    if(!form.adminName.trim()) return 'Ingresa tu nombre completo'
    if(!form.adminEmail.includes('@')) return 'Email inválido'
    if(form.adminPassword.length<6) return 'Contraseña mínimo 6 caracteres'
    return ''
  }

  const handleSubmit = async ()=>{
    setLoading(true); setError('')
    try {
      const r1 = await fetch(`${API}/companies/setup`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          companyName: form.companyName||`${form.adminName.split(' ')[0]}'s Farm`,
          typeOfFarm:  IND_MAP[form.industry]||'MIXTO',
          location:    form.location,
          adminName:   form.adminName,
          adminEmail:  form.adminEmail,
          adminPassword: form.adminPassword,
          industryModules: form.industry ? [IND_MAP[form.industry]||'MIXTO'] : ['MIXTO'],
        }),
      })
      if(!r1.ok){ const e=await r1.json(); throw new Error(e.message||'Error al crear la cuenta') }

      const r2 = await fetch(`${API}/auth/login`,{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:form.adminEmail,password:form.adminPassword}),
      })
      const {access_token, user} = await r2.json()
      const industryModule = IND_MAP[form.industry]||'MIXTO'
      localStorage.setItem('prairon_token', access_token)
      localStorage.setItem('prairon_user', JSON.stringify({
        ...user,
        industryType: form.industry,
        industryModules: user.industryModules?.length ? user.industryModules : [industryModule],
      }))

      await fetch(`${API}/noh/setup`,{
        method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${access_token}`},
        body:JSON.stringify({
          productionType: IND_MAP[form.industry]||'mixta',
          farmName: form.companyName,
          farmArea: parseFloat(form.farmArea)||0,
          farmLocation: form.location,
          teamSize: parseInt(form.teamSize)||1,
        }),
      })
      router.push('/dashboard')
    } catch(e:any){
      setError(e.message||'Error al crear la cuenta. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#0a1a0f;--bg2:#0d1f14;--bg3:#112218;
          --green:#22c55e;--green-dim:#16a34a;--glow:rgba(34,197,94,.12);--gborder:rgba(34,197,94,.28);--gtext:#4ade80;
          --text:#f0fdf4;--text2:rgba(240,253,244,.65);--text3:rgba(240,253,244,.32);
          --border:rgba(255,255,255,.07);--border2:rgba(255,255,255,.13);
          --font:'DM Sans',system-ui,sans-serif;--mono:'DM Mono',monospace;
        }
        html,body{min-height:100%}
        body{background:var(--bg);color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased}

        .page{min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:24px 16px 48px;
          background:radial-gradient(ellipse 600px 400px at 50% -5%,rgba(34,197,94,.07) 0%,transparent 70%)}
        .wrap{width:100%;max-width:520px}

        /* header */
        .hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
        .logo{display:flex;align-items:center;text-decoration:none}
        .logo img{height:26px;width:auto;object-fit:contain}
        .hdr-link{font-size:13px;color:var(--text3);text-decoration:none;transition:color .2s}
        .hdr-link:hover{color:var(--text2)}

        /* progress */
        .prog-wrap{margin-bottom:22px}
        .prog-bg{height:3px;background:rgba(255,255,255,.08);border-radius:2px;margin-bottom:12px;overflow:hidden}
        .prog-fill{height:100%;background:var(--green);border-radius:2px;transition:width .4s ease}
        .steps-row{display:flex;align-items:flex-start;gap:0}
        .sdot-wrap{display:flex;flex-direction:column;align-items:center;gap:5px;flex:1;min-width:0}
        .sdot-wrap:last-child{flex:none}
        .sdot{width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;
          font-size:10px;font-family:var(--mono);font-weight:500;border:1.5px solid rgba(255,255,255,.12);
          color:var(--text3);background:transparent;transition:all .3s;flex-shrink:0}
        .sdot.done{background:var(--green);border-color:var(--green);color:#0a1a0f;font-size:11px}
        .sdot.active{border-color:var(--green);color:var(--green);box-shadow:0 0 0 3px rgba(34,197,94,.18)}
        .sline{flex:1;height:1px;background:rgba(255,255,255,.08);margin:11px 2px 0;transition:background .3s}
        .sline.done{background:rgba(34,197,94,.45)}
        .slbl{font-size:9px;font-family:var(--mono);color:var(--text3);letter-spacing:.05em;white-space:nowrap;transition:color .3s;text-align:center}
        .slbl.active{color:var(--green)}

        /* card */
        .card{background:var(--bg2);border:1px solid var(--border2);border-radius:20px;overflow:hidden;margin-bottom:16px}

        /* noah */
        .noah{padding:16px 18px;border-bottom:1px solid var(--border);
          background:linear-gradient(160deg,rgba(34,197,94,.06) 0%,transparent 60%);
          display:flex;gap:11px;align-items:flex-start}
        .nav{width:32px;height:32px;border-radius:8px;background:var(--green);display:flex;align-items:center;
          justify-content:center;font-family:var(--mono);font-size:12px;color:#0a1a0f;font-weight:500;flex-shrink:0}
        .nlbl{font-size:10px;font-family:var(--mono);color:var(--green);letter-spacing:.06em;margin-bottom:5px}
        .nbubble{font-size:13px;color:var(--text2);line-height:1.6;padding:10px 13px;
          background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px;min-height:40px}
        .cursor{display:inline-block;width:2px;height:12px;background:var(--green);margin-left:1px;
          vertical-align:middle;animation:blink .8s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}

        /* body */
        .sbody{padding:22px 18px;animation:sin .3s ease}
        @keyframes sin{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        .slabel{font-size:10px;font-family:var(--mono);color:var(--text3);text-transform:uppercase;
          letter-spacing:.1em;margin-bottom:14px}

        /* fields */
        .field{margin-bottom:13px}
        .field label{display:block;font-size:11px;font-family:var(--mono);color:var(--text3);
          text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px}
        .field input,.field select{width:100%;background:var(--bg3);border:1px solid var(--border2);
          border-radius:10px;padding:12px 14px;font-size:14px;color:var(--text);font-family:var(--font);
          outline:none;transition:border-color .2s,box-shadow .2s;-webkit-appearance:none;appearance:none}
        .field input:focus,.field select:focus{border-color:rgba(34,197,94,.5);box-shadow:0 0 0 3px rgba(34,197,94,.08)}
        .field input::placeholder{color:var(--text3)}
        .pwr{position:relative}
        .pwr input{padding-right:42px}
        .ptog{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;
          cursor:pointer;font-size:15px;color:var(--text3);padding:0}
        .frow{display:grid;grid-template-columns:1fr 1fr;gap:12px}

        /* industry grid */
        .igrid{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:16px}
        .ibtn{padding:13px 11px;border:1px solid var(--border2);border-radius:12px;background:var(--bg3);
          cursor:pointer;text-align:left;transition:all .15s;font-family:var(--font)}
        .ibtn:hover{border-color:rgba(34,197,94,.3);background:rgba(34,197,94,.04)}
        .ibtn.sel{border-color:var(--green);background:rgba(34,197,94,.08);box-shadow:0 0 0 1px rgba(34,197,94,.18)}
        .iemoji{font-size:20px;margin-bottom:7px;display:block}
        .iname{font-size:13px;font-weight:500;color:var(--text);margin-bottom:2px}
        .idesc{font-size:11px;color:var(--text3);line-height:1.4}
        .imods{display:flex;flex-wrap:wrap;gap:4px;margin-top:7px}
        .imod{font-size:10px;padding:2px 6px;border-radius:5px;background:rgba(34,197,94,.1);
          color:var(--gtext);border:1px solid rgba(34,197,94,.2)}

        /* sub */
        .slist{display:flex;flex-direction:column;gap:8px;margin-bottom:16px}
        .sbtn{padding:12px 14px;border:1px solid var(--border2);border-radius:10px;background:var(--bg3);
          cursor:pointer;display:flex;align-items:center;gap:11px;font-family:var(--font);
          transition:all .15s;text-align:left}
        .sbtn:hover{border-color:rgba(34,197,94,.3)}
        .sbtn.sel{border-color:var(--green);background:rgba(34,197,94,.07)}
        .srad{width:15px;height:15px;border-radius:50%;border:2px solid var(--border2);flex-shrink:0;
          transition:all .15s;position:relative}
        .srad.on{border-color:var(--green);background:var(--green)}
        .srad.on::after{content:'';position:absolute;top:3px;left:3px;width:5px;height:5px;border-radius:50%;background:#0a1a0f}
        .sname{font-size:13px;font-weight:500;color:var(--text);margin-bottom:2px}
        .sdesc2{font-size:11px;color:var(--text3)}
        .sskip{font-size:12px;color:var(--text3);text-align:center;margin-bottom:14px;padding:12px;
          background:rgba(34,197,94,.05);border-radius:8px;border:1px solid rgba(34,197,94,.15)}

        /* size */
        .szgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}
        .szbtn{padding:13px 10px;border:1px solid var(--border2);border-radius:10px;background:var(--bg3);
          cursor:pointer;font-size:13px;font-family:var(--font);color:var(--text2);
          transition:all .15s;text-align:center}
        .szbtn:hover{border-color:rgba(34,197,94,.3);color:var(--text)}
        .szbtn.sel{border-color:var(--green);background:rgba(34,197,94,.08);color:var(--gtext);font-weight:500}

        /* team */
        .tgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
        .tbtn{padding:14px 6px;border:1px solid var(--border2);border-radius:10px;background:var(--bg3);
          cursor:pointer;font-family:var(--font);text-align:center;transition:all .15s}
        .tbtn:hover{border-color:rgba(34,197,94,.3)}
        .tbtn.sel{border-color:var(--green);background:rgba(34,197,94,.08)}
        .ticon{font-size:18px;margin-bottom:5px;display:block}
        .tlbl{font-size:12px;color:var(--text2)}
        .tbtn.sel .tlbl{color:var(--gtext);font-weight:500}
        .roles-box{background:rgba(255,255,255,.03);border-radius:10px;padding:12px 14px;margin-bottom:14px}
        .roles-ttl{font-size:10px;font-family:var(--mono);color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:9px}
        .roles-pills{display:flex;flex-wrap:wrap;gap:6px}
        .rpill{font-size:11px;padding:4px 10px;border-radius:20px;background:rgba(255,255,255,.05);
          border:1px solid var(--border);color:var(--text2)}

        /* confirm */
        .csec{margin-bottom:16px}
        .cttl{font-size:10px;font-family:var(--mono);color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:9px}
        .crow{display:flex;justify-content:space-between;align-items:center;padding:9px 13px;
          background:rgba(255,255,255,.03);border-radius:8px;margin-bottom:4px;font-size:13px}
        .ckey{color:var(--text3)}
        .cval{color:var(--text);font-weight:500;text-align:right;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
        .mpills{display:flex;flex-wrap:wrap;gap:6px;margin-top:9px}
        .mpill{font-size:11px;padding:4px 10px;border-radius:20px;background:rgba(34,197,94,.08);
          border:1px solid rgba(34,197,94,.2);color:var(--gtext)}

        /* buttons */
        .brow{display:flex;gap:10px}
        .bback{padding:13px 16px;border-radius:10px;border:1px solid var(--border2);background:none;
          color:var(--text2);font-size:14px;font-family:var(--font);cursor:pointer;transition:background .2s;white-space:nowrap}
        .bback:hover{background:rgba(255,255,255,.05)}
        .bnext{flex:1;padding:13px;border-radius:10px;border:none;background:var(--green);color:#0a1a0f;
          font-size:14px;font-weight:500;font-family:var(--font);cursor:pointer;transition:background .2s,opacity .2s;
          display:flex;align-items:center;justify-content:center;gap:8px}
        .bnext:hover:not(:disabled){background:var(--green-dim)}
        .bnext:disabled{opacity:.45;cursor:not-allowed}
        .spin{width:16px;height:16px;border:2px solid rgba(10,26,15,.25);border-top-color:#0a1a0f;
          border-radius:50%;animation:sp .7s linear infinite}
        @keyframes sp{to{transform:rotate(360deg)}}

        /* error */
        .err{font-size:13px;color:#f87171;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.2);
          border-radius:8px;padding:10px 13px;margin-bottom:13px}

        /* footer */
        .foot{text-align:center;font-size:12px;color:var(--text3)}
        .foot a{color:var(--text3);text-decoration:none}

        /* responsive */
        @media(max-width:480px){
          .page{padding:16px 12px 36px}
          .igrid{grid-template-columns:1fr 1fr}
          .frow{grid-template-columns:1fr}
          .tgrid{grid-template-columns:1fr 1fr}
          .sbody{padding:18px 14px}
          .noah{padding:13px 14px}
        }
        @media(max-width:340px){.igrid{grid-template-columns:1fr}}
      `}</style>

      <div className="page">
        <div className="wrap">

          {/* Header */}
          <div className="hdr">
            <Link href="/" className="logo">
              <img src="/images/logo-white.png" alt="PRAIRON" />
            </Link>
            <Link href="/login" className="hdr-link">¿Ya tienes cuenta? →</Link>
          </div>

          {/* Progress */}
          <div className="prog-wrap">
            <div className="prog-bg"><div className="prog-fill" style={{width:`${pct}%`}} /></div>
            <div className="steps-row">
              {STEPS.map((lbl,i)=>(
                <>{/* dot */}
                  <div key={`d${i}`} className="sdot-wrap">
                    <div className={`sdot${i+1<step?' done':i+1===step?' active':''}`}>
                      {i+1<step?'✓':i+1}
                    </div>
                    <span className={`slbl${i+1===step?' active':''}`}>{lbl}</span>
                  </div>
                  {i<STEPS.length-1&&<div key={`l${i}`} className={`sline${i+1<step?' done':''}`}/>}
                </>
              ))}
            </div>
          </div>

          {/* Card */}
          <div className="card">

            {/* NOAH */}
            <div className="noah">
              <div className="nav">N</div>
              <div style={{flex:1}}>
                <div className="nlbl">NOAH · IA activa</div>
                <div className="nbubble">
                  {noahText}{typing&&<span className="cursor"/>}
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="sbody" key={step}>
              {error&&<div className="err">⚠ {error}</div>}

              {/* PASO 1 — CUENTA */}
              {step===1&&<>
                <div className="slabel">Crea tu cuenta</div>
                <div className="field">
                  <label>Nombre completo</label>
                  <input type="text" placeholder="Carlos Rodríguez" autoFocus autoComplete="name"
                    value={form.adminName} onChange={e=>set('adminName',e.target.value)}/>
                </div>
                <div className="field">
                  <label>Correo electrónico</label>
                  <input type="email" placeholder="carlos@finca.com" autoComplete="email"
                    value={form.adminEmail} onChange={e=>set('adminEmail',e.target.value)}/>
                </div>
                <div className="field">
                  <label>Contraseña</label>
                  <div className="pwr">
                    <input type={showPass?'text':'password'} placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      value={form.adminPassword} onChange={e=>set('adminPassword',e.target.value)}/>
                    <button className="ptog" type="button" onClick={()=>setShowPass(s=>!s)}>
                      {showPass?'🙈':'👁'}
                    </button>
                  </div>
                </div>
                <div className="brow">
                  <button className="bnext" onClick={()=>{const e=validate1();if(e){setError(e);return;}next()}}>
                    Continuar →
                  </button>
                </div>
              </>}

              {/* PASO 2 — INDUSTRIA */}
              {step===2&&<>
                <div className="slabel">Tipo de producción</div>
                <div className="igrid">
                  {INDUSTRIES.map(i=>(
                    <button key={i.key} className={`ibtn${form.industry===i.key?' sel':''}`}
                      onClick={()=>set('industry',i.key)}>
                      <span className="iemoji">{i.emoji}</span>
                      <div className="iname">{i.label}</div>
                      <div className="idesc">{i.desc}</div>
                      {form.industry===i.key&&(
                        <div className="imods">
                          {i.modules.slice(0,3).map(m=><span key={m} className="imod">{m}</span>)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="brow">
                  <button className="bback" onClick={back}>← Atrás</button>
                  <button className="bnext" disabled={!form.industry} onClick={next}>
                    Con {ind?.label||'...'} →
                  </button>
                </div>
              </>}

              {/* PASO 3 — SUB-SECTOR */}
              {step===3&&<>
                <div className="slabel">Tipo de operación</div>
                {subs.length>0?(
                  <div className="slist">
                    {subs.map(s=>(
                      <button key={s.key} className={`sbtn${form.subInd===s.key?' sel':''}`}
                        onClick={()=>set('subInd',s.key)}>
                        <div className={`srad${form.subInd===s.key?' on':''}`}/>
                        <div>
                          <div className="sname">{s.label}</div>
                          <div className="sdesc2">{s.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                ):(
                  <div className="sskip">Operación mixta — todos los módulos disponibles desde el inicio.</div>
                )}
                <div className="brow">
                  <button className="bback" onClick={back}>← Atrás</button>
                  <button className="bnext" disabled={subs.length>0&&!form.subInd} onClick={next}>
                    Continuar →
                  </button>
                </div>
              </>}

              {/* PASO 4 — OPERACIÓN */}
              {step===4&&<>
                <div className="slabel">Tu operación</div>
                <div className="field">
                  <label>Nombre de la finca / empresa</label>
                  <input placeholder="Hacienda El Progreso"
                    value={form.companyName} onChange={e=>set('companyName',e.target.value)}/>
                </div>
                <div className="frow">
                  <div className="field" style={{marginBottom:0}}>
                    <label>Área (hectáreas)</label>
                    <input type="number" placeholder="150" min="0"
                      value={form.farmArea} onChange={e=>set('farmArea',e.target.value)}/>
                  </div>
                  <div className="field" style={{marginBottom:0}}>
                    <label>Ubicación</label>
                    <input placeholder="Córdoba, Colombia"
                      value={form.location} onChange={e=>set('location',e.target.value)}/>
                  </div>
                </div>
                <div style={{height:14}}/>
                <div className="brow">
                  <button className="bback" onClick={back}>← Atrás</button>
                  <button className="bnext" disabled={!form.companyName} onClick={next}>Continuar →</button>
                </div>
              </>}

              {/* PASO 5 — TAMAÑO */}
              {step===5&&<>
                <div className="slabel">Tamaño de la operación</div>
                <div className="szgrid">
                  {sizes.map(s=>(
                    <button key={s.key} className={`szbtn${form.size===s.key?' sel':''}`}
                      onClick={()=>set('size',s.key)}>{s.label}</button>
                  ))}
                </div>
                <div className="brow">
                  <button className="bback" onClick={back}>← Atrás</button>
                  <button className="bnext" disabled={!form.size} onClick={next}>Continuar →</button>
                </div>
              </>}

              {/* PASO 6 — EQUIPO */}
              {step===6&&<>
                <div className="slabel">Tamaño del equipo</div>
                <div className="tgrid">
                  {TEAM.map(t=>(
                    <button key={t.val} className={`tbtn${form.teamSize===t.val?' sel':''}`}
                      onClick={()=>set('teamSize',t.val)}>
                      <span className="ticon">{t.icon}</span>
                      <div className="tlbl">{t.label}</div>
                    </button>
                  ))}
                </div>
                <div className="roles-box">
                  <div className="roles-ttl">Roles que se activarán</div>
                  <div className="roles-pills">
                    {['Dueño / Admin','Gerente','Supervisor de campo',
                      form.industry==='AVICOLA'?'Técnico avícola':
                      form.industry==='PALMA'?'Ingeniero agrónomo':'Veterinario / Agrónomo',
                      'Contador','Trabajador de campo'].map(r=>(
                      <span key={r} className="rpill">{r}</span>
                    ))}
                  </div>
                </div>
                <div className="brow">
                  <button className="bback" onClick={back}>← Atrás</button>
                  <button className="bnext" onClick={next}>Revisar y crear →</button>
                </div>
              </>}

              {/* PASO 7 — CONFIRMAR */}
              {step===7&&<>
                <div className="slabel">Confirmación</div>
                <div className="csec">
                  <div className="cttl">Tu cuenta</div>
                  <div className="crow"><span className="ckey">Nombre</span><span className="cval">{form.adminName}</span></div>
                  <div className="crow"><span className="ckey">Email</span><span className="cval">{form.adminEmail}</span></div>
                </div>
                <div className="csec">
                  <div className="cttl">Tu operación</div>
                  <div className="crow"><span className="ckey">Empresa / Finca</span><span className="cval">{form.companyName}</span></div>
                  <div className="crow"><span className="ckey">Sector</span><span className="cval">{ind?.emoji} {ind?.label}</span></div>
                  {form.location&&<div className="crow"><span className="ckey">Ubicación</span><span className="cval">{form.location}</span></div>}
                  {form.farmArea&&<div className="crow"><span className="ckey">Área</span><span className="cval">{form.farmArea} ha</span></div>}
                </div>
                <div className="csec">
                  <div className="cttl">Módulos activados</div>
                  <div className="mpills">
                    {(ind?.modules||[]).map(m=><span key={m} className="mpill">✓ {m}</span>)}
                    <span className="mpill">✓ NOAH IA</span>
                    <span className="mpill">✓ ODS</span>
                  </div>
                </div>
                <div className="brow">
                  <button className="bback" onClick={back}>← Atrás</button>
                  <button className="bnext" disabled={loading} onClick={handleSubmit}>
                    {loading?<><div className="spin"/>Creando cuenta…</>:'Crear cuenta gratis →'}
                  </button>
                </div>
                <p style={{fontSize:'11px',color:'var(--text3)',textAlign:'center',marginTop:'13px',lineHeight:1.6}}>
                  Al continuar aceptas los{' '}
                  <Link href="/terminos" style={{color:'var(--text3)'}}>Términos</Link> y la{' '}
                  <Link href="/privacidad" style={{color:'var(--text3)'}}>Política de privacidad</Link>.
                  Cumplimos GDPR y Habeas Data (Ley 1581).
                </p>
              </>}

            </div>
          </div>

          <div className="foot">
            <p>© 2026 PRAIRON · Agroindustrial OS · Hecho en LATAM</p>
          </div>
        </div>
      </div>
    </>
  )
}
