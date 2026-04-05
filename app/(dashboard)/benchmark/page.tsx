'use client'
import { useState } from 'react'
import api from '@/lib/api'

export default function BenchmarkPage() {
  const [loading, setLoading] = useState(false)
  const [data,    setData]    = useState<any>(null)
  const [error,   setError]   = useState('')

  async function load() {
    setLoading(true); setError('')
    try {
      const r = { data: { metrics: [] } } // pendiente edge function
      setData(r.data)
    } catch { setError('Error cargando benchmark') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>Benchmark regional</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            Compara tu operación con el promedio anónimo de empresas en PRAIRON
          </p>
        </div>
        <button onClick={load} disabled={loading}
          style={{ fontSize: '12px', padding: '8px 18px', background: loading ? '#e5e5e3' : '#036446', color: loading ? '#9b9b97' : 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
          {loading ? 'Calculando...' : data ? '🔄 Actualizar' : '📊 Ver benchmark'}
        </button>
      </div>

      {!data && !loading && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18', marginBottom: '8px' }}>Descubre cómo estás vs el mercado</div>
          <p style={{ fontSize: '13px', color: '#9b9b97', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.7 }}>
            Comparación anónima con otras empresas agroindustriales que usan PRAIRON en Colombia
          </p>
          <button onClick={load}
            style={{ fontSize: '13px', padding: '12px 28px', background: '#036446', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
            Ver mi posición
          </button>
        </div>
      )}

      {loading && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#9b9b97' }}>Calculando comparativas...</div>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '14px', color: '#dc2626', fontSize: '13px' }}>{error}</div>
      )}

      {data && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Info del sistema */}
          <div style={{ background: '#e8f5ef', border: '0.5px solid #a7f3d0', borderRadius: '10px', padding: '12px 18px', fontSize: '12px', color: '#036446' }}>
            🔒 {data.systemInfo?.note} · {data.systemInfo?.totalCompanies} empresa{data.systemInfo?.totalCompanies !== 1 ? 's' : ''} en el sistema
          </div>

          {/* Métricas */}
          {data.companyMetrics?.map((m: any) => {
            const pct = m.avgValue > 0 ? Math.min(100, Math.round((Math.min(m.myValue, m.avgValue * 2) / (m.avgValue * 2)) * 100)) : 50
            const myPct = m.avgValue > 0 ? Math.min(100, Math.round((m.myValue / (m.avgValue * 2)) * 100)) : 50
            const avgPct = 50
            return (
              <div key={m.key} style={{ background: '#fff', border: `0.5px solid ${m.isBetter ? '#a7f3d0' : '#fecaca'}`, borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '3px' }}>{m.label}</div>
                    <div style={{ fontSize: '12px', color: '#9b9b97' }}>{m.description}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: m.isBetter ? '#e8f5ef' : '#fef2f2', color: m.isBetter ? '#036446' : '#dc2626', flexShrink: 0, marginLeft: '12px' }}>
                    {m.isBetter ? '↑ Por encima' : '↓ Por debajo'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ background: '#f9f9f7', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '4px' }}>TU EMPRESA</div>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: m.isBetter ? '#036446' : '#dc2626', fontFamily: 'monospace' }}>
                      {m.myValue}{m.unit !== 'ítems' && m.unit !== 'L/día' ? m.unit : ''}
                      <span style={{ fontSize: '13px', fontWeight: '400', color: '#9b9b97' }}> {m.unit === 'ítems' || m.unit === 'L/día' ? m.unit : ''}</span>
                    </div>
                  </div>
                  <div style={{ background: '#f9f9f7', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '4px' }}>PROMEDIO SISTEMA</div>
                    <div style={{ fontSize: '24px', fontWeight: '600', color: '#6b6b67', fontFamily: 'monospace' }}>
                      {m.avgValue}{m.unit !== 'ítems' && m.unit !== 'L/día' ? m.unit : ''}
                      <span style={{ fontSize: '13px', fontWeight: '400', color: '#9b9b97' }}> {m.unit === 'ítems' || m.unit === 'L/día' ? m.unit : ''}</span>
                    </div>
                  </div>
                </div>

                {/* Barra comparativa */}
                <div style={{ position: 'relative', height: '8px', background: '#f0f0ee', borderRadius: '4px' }}>
                  <div style={{ position: 'absolute', left: myPct + '%', transform: 'translateX(-50%)', top: 0, height: '8px', width: '12px', background: m.isBetter ? '#036446' : '#dc2626', borderRadius: '3px' }} />
                  <div style={{ position: 'absolute', left: avgPct + '%', transform: 'translateX(-50%)', top: '-3px', height: '14px', width: '2px', background: '#9b9b97' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span style={{ fontSize: '10px', color: '#9b9b97' }}>0</span>
                  <span style={{ fontSize: '10px', color: '#9b9b97' }}>Promedio</span>
                  <span style={{ fontSize: '10px', color: '#9b9b97' }}>Máximo</span>
                </div>

                {m.diff !== 0 && (
                  <div style={{ marginTop: '10px', fontSize: '12px', color: m.isBetter ? '#036446' : '#dc2626', fontWeight: '500' }}>
                    {m.diff > 0 ? '+' : ''}{m.diff}% vs promedio del sistema
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
