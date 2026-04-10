'use client'
import { useState } from 'react'
import api from '@/lib/api'

const RENTABILIDAD_STYLES: Record<string, { bg: string; color: string }> = {
  alta:  { bg: '#e8f5ef', color: '#036446' },
  media: { bg: '#fef3e2', color: '#b45309' },
  baja:  { bg: '#f9f9f7', color: '#6b6b67' },
}

const RIESGO_STYLES: Record<string, { bg: string; color: string }> = {
  bajo:  { bg: '#e8f5ef', color: '#036446' },
  medio: { bg: '#fef3e2', color: '#b45309' },
  alto:  { bg: '#fef2f2', color: '#dc2626' },
}

export default function RecomendacionesPage() {
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState<any>(null)
  const [error,   setError]   = useState('')
  const [usage,   setUsage]   = useState<any>(null)

  async function loadRecommendations() {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/noh/chat', {
        message: 'Analiza mi operación actual y dame recomendaciones de cultivos o actividades productivas para la próxima temporada. Incluye rentabilidad estimada, riesgo y consejos prácticos para cada opción.',
        sector: 'recomendaciones'
      })
      // Intentar parsear como JSON estructurado, si no, mostrar como texto
      let parsed: any = null
      try {
        const text = res.data?.response || ''
        const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/)
        if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
      } catch {}

      setResult({
        generatedByAI: true,
        rawResponse: res.data?.response,
        parsed,
        usageToday: res.data?.usageToday,
        limitToday: res.data?.limitToday,
        remaining: res.data?.remaining,
      })
      setUsage({ used: res.data?.usageToday, limit: res.data?.limitToday, remaining: res.data?.remaining })
    } catch (err: any) {
      if (err?.response?.status === 429) {
        setError(`Límite diario alcanzado. ${err.response.data?.message || 'Intenta mañana.'}`)
      } else {
        setError('Error al generar recomendaciones. Intenta de nuevo.')
      }
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>Recomendador de cultivos</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            NOAH analiza tu operación y sugiere qué sembrar la próxima temporada
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <button onClick={loadRecommendations} disabled={loading}
            style={{ fontSize: '12px', padding: '8px 18px', background: loading ? '#e5e5e3' : '#036446', color: loading ? '#9b9b97' : 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
            {loading ? 'Analizando...' : result ? '🔄 Nueva recomendación' : '✨ Generar recomendaciones'}
          </button>
          {usage && (
            <div style={{ fontSize: '11px', color: '#9b9b97' }}>
              {usage.remaining} consultas restantes hoy
            </div>
          )}
        </div>
      </div>

      {!result && !loading && !error && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18', marginBottom: '8px' }}>Descubre qué cultivar esta temporada</div>
          <p style={{ fontSize: '13px', color: '#9b9b97', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.7 }}>
            NOAH analiza tu operación actual, alertas, inventario y condiciones para recomendarte las mejores opciones productivas
          </p>
          <button onClick={loadRecommendations}
            style={{ fontSize: '13px', padding: '12px 28px', background: '#036446', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
            ✨ Generar recomendaciones con NOAH IA
          </button>
        </div>
      )}

      {loading && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>NOAH está analizando tu operación</div>
          <div style={{ fontSize: '12px', color: '#9b9b97' }}>Revisando datos, alertas, inventario y condiciones del mercado...</div>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '10px', padding: '16px', color: '#dc2626', fontSize: '13px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#036446' }} />
            <span style={{ fontSize: '12px', color: '#036446', fontWeight: '500' }}>Análisis personalizado por NOAH IA</span>
          </div>
          <div style={{ fontSize: '14px', color: '#1a1a18', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
            {result.rawResponse}
          </div>
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '0.5px solid #f0f0ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#9b9b97' }}>Consulta {result.usageToday} de {result.limitToday} hoy</span>
            <button onClick={loadRecommendations} style={{ fontSize: '11px', padding: '6px 14px', background: 'transparent', border: '0.5px solid #036446', borderRadius: '5px', color: '#036446', cursor: 'pointer' }}>
              🔄 Actualizar análisis
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
