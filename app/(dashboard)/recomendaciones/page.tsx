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
  const [loading,  setLoading]  = useState(false)
  const [result,   setResult]   = useState<any>(null)
  const [error,    setError]    = useState('')

  async function loadRecommendations() {
    setLoading(true)
    setError('')
    try {
      const r = { data: { recommendations: [] } } // pendiente edge function
      setResult(r.data ?? [])
    } catch {
      setError('Error cargando recomendaciones. Intenta de nuevo.')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1000px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>Recomendador de cultivos</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            NOH analiza tu operación y sugiere qué sembrar la próxima temporada
          </p>
        </div>
        <button onClick={loadRecommendations} disabled={loading}
          style={{ fontSize: '12px', padding: '8px 18px', background: loading ? '#e5e5e3' : '#036446', color: loading ? '#9b9b97' : 'white', border: 'none', borderRadius: '6px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
          {loading ? 'Analizando...' : result ? '🔄 Nueva recomendación' : '✨ Generar recomendaciones'}
        </button>
      </div>

      {!result && !loading && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
          <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18', marginBottom: '8px' }}>
            Descubre qué cultivar esta temporada
          </div>
          <p style={{ fontSize: '13px', color: '#9b9b97', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.7 }}>
            NOH analiza tu ubicación, tipo de suelo, operación actual y condiciones del mercado para recomendarte los cultivos más rentables
          </p>
          <button onClick={loadRecommendations}
            style={{ fontSize: '13px', padding: '12px 28px', background: '#036446', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
            ✨ Generar recomendaciones con IA
          </button>
        </div>
      )}

      {loading && (
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '16px', padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>🤖</div>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>NOAH está analizando tu operación</div>
          <div style={{ fontSize: '12px', color: '#9b9b97' }}>Revisando ubicación, cultivos actuales y condiciones del mercado...</div>
        </div>
      )}

      {error && (
        <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '10px', padding: '16px', color: '#dc2626', fontSize: '13px' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Info de la empresa analizada */}
          <div style={{ background: '#e8f5ef', border: '0.5px solid #a7f3d0', borderRadius: '10px', padding: '14px 20px', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', color: '#036446', fontWeight: '500' }}>
              {result.generatedByAI ? '🤖 Análisis personalizado por NOAH IA' : '📋 Recomendaciones base'}
            </div>
            {result.companyInfo && (
              <>
                {result.companyInfo.location && <div style={{ fontSize: '12px', color: '#0f6e56' }}>📍 {result.companyInfo.location}</div>}
                {result.companyInfo.totalHa > 0 && <div style={{ fontSize: '12px', color: '#0f6e56' }}>🌿 {result.companyInfo.totalHa} ha</div>}
                {result.companyInfo.currentCrops && result.companyInfo.currentCrops !== 'ninguno' && (
                  <div style={{ fontSize: '12px', color: '#0f6e56' }}>Cultivos actuales: {result.companyInfo.currentCrops}</div>
                )}
              </>
            )}
          </div>

          {/* Grid de recomendaciones */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            {result.recommendations?.map((rec: any, i: number) => {
              const rent = RENTABILIDAD_STYLES[rec.rentabilidad] || RENTABILIDAD_STYLES.media
              const risk = RIESGO_STYLES[rec.riesgo] || RIESGO_STYLES.medio
              return (
                <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18' }}>{rec.cultivo}</div>
                    <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: rent.bg, color: rent.color }}>
                      Rentabilidad {rec.rentabilidad}
                    </span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#6b6b67', lineHeight: 1.5, marginBottom: '14px' }}>{rec.razon}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', fontFamily: 'monospace' }}>{rec.ciclo}d</div>
                      <div style={{ fontSize: '10px', color: '#9b9b97' }}>ciclo</div>
                    </div>
                    <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', fontFamily: 'monospace' }}>${rec.inversionPorHa}</div>
                      <div style={{ fontSize: '10px', color: '#9b9b97' }}>USD/ha</div>
                    </div>
                    <div style={{ background: risk.bg, borderRadius: '6px', padding: '8px 10px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: '500', color: risk.color }}>Riesgo {rec.riesgo}</div>
                      <div style={{ fontSize: '10px', color: risk.color, opacity: 0.7 }}>estimado</div>
                    </div>
                  </div>

                  {rec.consejo && (
                    <div style={{ background: '#f9f9f7', borderRadius: '6px', padding: '10px 12px', fontSize: '12px', color: '#6b6b67', lineHeight: 1.5, borderLeft: '3px solid #036446' }}>
                      💡 {rec.consejo}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
