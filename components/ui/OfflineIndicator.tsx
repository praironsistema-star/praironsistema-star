'use client'
import { useEffect, useState } from 'react'

export default function OfflineIndicator() {
  const [online, setOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)
  const [showBack, setShowBack] = useState(false)

  useEffect(() => {
    setOnline(navigator.onLine)
    const goOffline = () => { setOnline(false); setWasOffline(true) }
    const goOnline  = () => { setOnline(true); if (wasOffline) { setShowBack(true); setTimeout(() => setShowBack(false), 4000) } }
    window.addEventListener('offline', goOffline)
    window.addEventListener('online',  goOnline)
    return () => { window.removeEventListener('offline', goOffline); window.removeEventListener('online', goOnline) }
  }, [wasOffline])

  // Pill de "volviste online"
  if (showBack) return (
    <div style={{ position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', zIndex:9999, background:'#059669', color:'white', padding:'10px 20px', borderRadius:'99px', fontSize:'13px', fontWeight:'500', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 20px rgba(5,150,105,0.4)', animation:'slideup .3s ease', whiteSpace:'nowrap' }}>
      <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#6ee7b7', display:'inline-block' }}/>
      Conexión restaurada — datos sincronizados
    </div>
  )

  // Banner offline prominente
  if (!online) return (
    <>
      <style>{`@keyframes slideup{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {/* Barra top */}
      <div style={{ position:'fixed', top:0, left:0, right:0, zIndex:9999, background:'#92400e', color:'white', padding:'8px 20px', display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', fontSize:'13px', fontWeight:'500' }}>
        <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#fbbf24', display:'inline-block', animation:'pulse 1.5s infinite' }}/>
        Sin conexión a internet — modo offline activo. Tus datos se guardan localmente y se sincronizan al reconectar.
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>
      {/* Badge flotante esquina */}
      <div style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:9999, background:'#78350f', color:'white', padding:'8px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:'500', display:'flex', alignItems:'center', gap:'8px', boxShadow:'0 4px 16px rgba(0,0,0,0.2)', animation:'slideup .3s ease' }}>
        <span style={{ fontSize:'16px' }}>📶</span>
        <div>
          <div style={{ fontWeight:'600' }}>Modo Offline</div>
          <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.7)' }}>Funcionando sin señal</div>
        </div>
      </div>
    </>
  )

  // Online — badge discreto en esquina
  return (
    <div style={{ position:'fixed', bottom:'16px', right:'16px', zIndex:9998, background:'rgba(5,150,105,0.1)', border:'0.5px solid rgba(5,150,105,0.3)', color:'#059669', padding:'5px 10px', borderRadius:'99px', fontSize:'11px', fontWeight:'500', display:'flex', alignItems:'center', gap:'5px' }}>
      <span style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#059669', display:'inline-block' }}/>
      Online
    </div>
  )
}
