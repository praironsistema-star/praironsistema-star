'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toastInfo } from '@/components/ui/Toast'

const ALERT_STYLES: Record<string,{bg:string,color:string,border:string,dot:string}> = {
  stock_critico:      { bg:'#fef2f2', color:'#dc2626', border:'#fecaca', dot:'#ef4444' },
  animal_enfermo:     { bg:'#fef2f2', color:'#dc2626', border:'#fecaca', dot:'#ef4444' },
  stock_bajo:         { bg:'#fef3e2', color:'#b45309', border:'#fed7aa', dot:'#f59e0b' },
  animal_tratamiento: { bg:'#fef3e2', color:'#b45309', border:'#fed7aa', dot:'#f59e0b' },
  tarea_proxima:      { bg:'#e6f1fb', color:'#185fa5', border:'#bfdbfe', dot:'#378add' },
  default:            { bg:'#e8f5ef', color:'#036446', border:'#a7f3d0', dot:'#0dac5e' },
}

const TYPE_LABELS: Record<string,string> = {
  stock_critico:'Stock crítico', stock_bajo:'Stock bajo', animal_enfermo:'Animal enfermo',
  animal_tratamiento:'Animal en tratamiento', tarea_proxima:'Tarea próxima',
}

export default function AlertsPage() {
  const { t } = useI18n()
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase.from('alerts').select('*').order('created_at', { ascending: false })
      .then(r => setAlerts(r.data || []))
      .finally(() => setLoading(false))
  }, [])

  async function markRead(id: string) {
    await supabase.from('alerts').update({ read_at: new Date().toISOString() }).eq('id', id)
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, readStatus: true } : a))
  }

  async function deleteAlert(id: string) {
    await supabase.from('alerts').delete().eq('id', id)
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const filtered = filter === 'all' ? alerts
    : filter === 'unread' ? alerts.filter(a => !a.readStatus)
    : alerts.filter(a => a.type === filter)

  const critical = alerts.filter(a => a.type === 'stock_critico' || a.type === 'animal_enfermo').length
  const unread   = alerts.filter(a => !a.readStatus).length

  return (
    <div style={{ padding:'28px 32px', maxWidth:'900px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h1 style={{ fontSize:'20px', fontWeight:'500', color:'#1a1a18', margin:0 }}>{t('alerts.title')}</h1>
          <p style={{ fontSize:'13px', color:'#9b9b97', margin:'4px 0 0' }}>
            {alerts.length} alertas · {critical} críticas · {unread} sin leer
          </p>
        </div>
      </div>

      {critical > 0 && (
        <div style={{ background:'#fef2f2', border:'0.5px solid #fecaca', borderRadius:'8px', padding:'12px 16px', marginBottom:'20px', display:'flex', alignItems:'center', gap:'10px' }}>
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#ef4444', flexShrink:0 }} />
          <div style={{ fontSize:'13px', color:'#dc2626', fontWeight:'500' }}>
            {critical} {critical > 1 ? t('alerts.critical_banner_pl') : t('alerts.critical_banner')}
          </div>
        </div>
      )}

      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {[
          { key:'all',          label: t('alerts.all') },
          { key:'unread',       label: `${t('alerts.unread')} (${unread})` },
          { key:'stock_critico',label: t('alerts.critical') },
          { key:'stock_bajo',   label: t('alerts.low_stock') },
          { key:'animal_enfermo',label:t('alerts.animals') },
        ].map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            style={{ fontSize:'12px', padding:'6px 14px', borderRadius:'20px', border:'0.5px solid', cursor:'pointer',
              borderColor: filter===tab.key ? '#036446' : '#e5e5e3',
              background:  filter===tab.key ? '#e8f5ef'  : 'transparent',
              color:       filter===tab.key ? '#036446'  : '#6b6b67',
              fontWeight:  filter===tab.key ? '500'      : '400' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color:'#9b9b97', fontSize:'13px', padding:'40px', textAlign:'center' }}>{t('alerts.loading')}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', border:'0.5px dashed #e5e5e3', borderRadius:'12px' }}>
          <div style={{ fontSize:'32px', marginBottom:'12px' }}>✓</div>
          <div style={{ fontSize:'15px', fontWeight:'500', color:'#1a1a18', marginBottom:'6px' }}>{t('alerts.no_alerts')}</div>
          <div style={{ fontSize:'13px', color:'#9b9b97' }}>{t('alerts.no_alerts_sub')}</div>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
          {filtered.map((a:any) => {
            const style = ALERT_STYLES[a.type] || ALERT_STYLES.default
            return (
              <div key={a.id} style={{ background:style.bg, border:`0.5px solid ${style.border}`, borderRadius:'8px', padding:'14px 16px', display:'flex', alignItems:'flex-start', gap:'12px', opacity: a.readStatus ? 0.6 : 1 }}>
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:style.dot, flexShrink:0, marginTop:'4px' }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                    <span style={{ fontSize:'12px', fontWeight:'500', color:style.color }}>{TYPE_LABELS[a.type] || a.type}</span>
                    {a.readStatus && <span style={{ fontSize:'10px', color:'#9b9b97' }}>{t('alerts.read')}</span>}
                  </div>
                  <div style={{ fontSize:'13px', color:'#1a1a18', lineHeight:1.5 }}>{a.message}</div>
                  <div style={{ fontSize:'11px', color:'#9b9b97', marginTop:'4px' }}>
                    {new Date(a.created_at).toLocaleDateString('es-CO', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>
                <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
                  {!a.readStatus && (
                    <button onClick={() => markRead(a.id)} style={{ fontSize:'11px', padding:'4px 8px', border:`0.5px solid ${style.border}`, borderRadius:'5px', background:'transparent', cursor:'pointer', color:style.color }}>
                      {t('alerts.mark_read')}
                    </button>
                  )}
                  <button onClick={() => deleteAlert(a.id)} style={{ fontSize:'11px', padding:'4px 8px', border:'0.5px solid #e5e5e3', borderRadius:'5px', background:'transparent', cursor:'pointer', color:'#9b9b97' }}>×</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
