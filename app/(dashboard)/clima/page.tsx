'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'

// ─────────────────────────────────────────────────────────────────────────────
// /clima — Módulo de clima agrícola
// Usa Open-Meteo via backend — sin API key, datos reales de Colombia
// ─────────────────────────────────────────────────────────────────────────────

const CITIES = [
  { key: 'cordoba',       name: 'Montería',      dept: 'Córdoba' },
  { key: 'bogota',        name: 'Bogotá',        dept: 'Cundinamarca' },
  { key: 'medellin',      name: 'Medellín',      dept: 'Antioquia' },
  { key: 'cali',          name: 'Cali',          dept: 'Valle del Cauca' },
  { key: 'barranquilla',  name: 'Barranquilla',  dept: 'Atlántico' },
  { key: 'cartagena',     name: 'Cartagena',     dept: 'Bolívar' },
  { key: 'bucaramanga',   name: 'Bucaramanga',   dept: 'Santander' },
  { key: 'pereira',       name: 'Pereira',       dept: 'Risaralda' },
  { key: 'ibague',        name: 'Ibagué',        dept: 'Tolima' },
  { key: 'villavicencio', name: 'Villavicencio', dept: 'Meta' },
  { key: 'pasto',         name: 'Pasto',         dept: 'Nariño' },
  { key: 'cucuta',        name: 'Cúcuta',        dept: 'N. de Santander' },
]

const DIAS_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

// Recomendaciones agrícolas según condiciones del clima
function getAgriRecommendations(weather: any): string[] {
  if (!weather) return []
  const recs: string[] = []
  const temp  = weather.current.temperature
  const rain  = weather.current.precipitation
  const humid = weather.current.humidity

  if (rain > 5)   recs.push('🚫 No aplicar agroquímicos hoy — hay precipitación activa')
  if (rain === 0 && humid < 40) recs.push('�� Condiciones ideales para riego — baja humedad')
  if (temp > 32)  recs.push('🌡️ Temperatura alta — revisar estrés hídrico en cultivos')
  if (temp < 15)  recs.push('❄️ Temperatura baja — proteger cultivos sensibles a heladas')
  if (humid > 85) recs.push('🍄 Humedad alta — riesgo de hongos y enfermedades foliares')
  if (rain === 0 && humid >= 40 && humid <= 70 && temp >= 18 && temp <= 30)
    recs.push('✅ Condiciones óptimas para labores de campo')

  const mañana = weather.forecast?.[1]
  if (mañana?.rainChance > 70)
    recs.push('🌧️ Mañana hay ' + mañana.rainChance + '% de lluvia — planificar labores para hoy')
  if (mañana?.rainChance < 20 && rain > 0)
    recs.push('☀️ Mañana mejora el clima — buena oportunidad para fumigación')

  if (recs.length === 0) recs.push('✅ Sin alertas climáticas especiales para hoy')
  return recs
}

export default function ClimaPage() {
  const [city,    setCity]    = useState('cordoba')
  const [weather, setWeather] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`).then(r=>r.json())
      .then(r => setWeather(r.data ?? []))
      .catch(() => setError('No se pudo cargar el clima. Intenta de nuevo.'))
      .finally(() => setLoading(false))
  }, [city])

  const recs = getAgriRecommendations(weather)
  const cityData = CITIES.find(c => c.key === city)

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1000px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>Clima agrícola</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            Pronóstico de 7 días y recomendaciones para tu operación
          </p>
        </div>
        {/* Selector de ciudad */}
        <select value={city} onChange={e => setCity(e.target.value)}
          style={{ border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', outline: 'none', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}>
          {CITIES.map(c => (
            <option key={c.key} value={c.key}>{c.name} — {c.dept}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: i === 1 ? '160px' : '80px', background: '#e5e5e3', borderRadius: '12px', animation: 'pulse 1.6s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
        </div>
      ) : error ? (
        <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '10px', padding: '20px', textAlign: 'center', color: '#dc2626', fontSize: '13px' }}>
          {error}
        </div>
      ) : weather && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* ── Clima actual ── */}
          <div style={{ background: 'linear-gradient(135deg, #024d36, #036446)', borderRadius: '16px', padding: '28px 32px', color: 'white' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px', fontWeight: '500' }}>
                  AHORA · {cityData?.name?.toUpperCase()}, {cityData?.dept?.toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '64px', fontWeight: '300', lineHeight: 1, fontFamily: 'monospace' }}>
                    {Math.round(weather.current.temperature)}°
                  </span>
                  <span style={{ fontSize: '32px', marginBottom: '8px' }}>{weather.current.icon}</span>
                </div>
                <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', marginBottom: '16px' }}>
                  {weather.current.condition}
                </div>
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'Humedad',       value: weather.current.humidity + '%',      icon: '💧' },
                    { label: 'Precipitación', value: weather.current.precipitation + ' mm', icon: '🌧️' },
                    { label: 'Viento',        value: weather.current.windSpeed + ' km/h',  icon: '💨' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '2px' }}>{stat.icon} {stat.label}</div>
                      <div style={{ fontSize: '15px', fontWeight: '500', fontFamily: 'monospace' }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Pronóstico 7 días ── */}
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e5e3', fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>
              Pronóstico 7 días
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
              {weather.forecast?.map((day: any, i: number) => {
                const date   = new Date(day.date + 'T12:00:00')
                const diaNom = i === 0 ? 'Hoy' : DIAS_CORTO[date.getDay()]
                const isRainy = day.rainChance > 50
                return (
                  <div key={day.date} style={{
                    padding: '14px 8px', textAlign: 'center',
                    borderRight: i < 6 ? '0.5px solid #f0f0ee' : 'none',
                    background: i === 0 ? '#f9f9f7' : '#fff',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: i === 0 ? '600' : '400', color: i === 0 ? '#036446' : '#9b9b97', marginBottom: '8px', letterSpacing: '0.04em' }}>
                      {diaNom}
                    </div>
                    <div style={{ fontSize: '22px', marginBottom: '8px' }}>{day.icon}</div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a1a18', marginBottom: '2px' }}>
                      {Math.round(day.maxTemp)}°
                    </div>
                    <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '8px' }}>
                      {Math.round(day.minTemp)}°
                    </div>
                    <div style={{ fontSize: '10px', padding: '2px 4px', borderRadius: '4px', background: isRainy ? '#e6f1fb' : '#f9f9f7', color: isRainy ? '#185fa5' : '#9b9b97', fontWeight: isRainy ? '500' : '400' }}>
                      {day.rainChance}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Recomendaciones agrícolas ── */}
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #e5e5e3', fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>
              Recomendaciones para tu operación
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recs.map((rec, i) => {
                const isAlert = rec.startsWith('🚫') || rec.startsWith('🌡️') || rec.startsWith('❄️') || rec.startsWith('🍄')
                const isOk    = rec.startsWith('✅')
                const bg      = isAlert ? '#fef3e2' : isOk ? '#e8f5ef' : '#e6f1fb'
                const border  = isAlert ? '#fed7aa' : isOk ? '#a7f3d0' : '#bfdbfe'
                const color   = isAlert ? '#b45309' : isOk ? '#036446' : '#185fa5'
                return (
                  <div key={i} style={{ padding: '10px 14px', background: bg, border: `0.5px solid ${border}`, borderRadius: '8px', fontSize: '13px', color, lineHeight: 1.5 }}>
                    {rec}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Fuente */}
          <div style={{ fontSize: '11px', color: '#9b9b97', textAlign: 'center' }}>
            Datos: Open-Meteo · Actualizado automáticamente
          </div>
        </div>
      )}
    </div>
  )
}
