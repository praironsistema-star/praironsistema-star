'use client'
import { useState, useRef } from 'react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// /vision — Análisis de imágenes de cultivos con Claude Vision
// El usuario sube una foto de planta y NOH identifica enfermedades y plagas
// ─────────────────────────────────────────────────────────────────────────────

const URGENCY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  inmediata:      { bg: '#fef2f2', color: '#dc2626', label: 'Atención inmediata' },
  esta_semana:    { bg: '#fef3e2', color: '#b45309', label: 'Esta semana' },
  puede_esperar:  { bg: '#e8f5ef', color: '#036446', label: 'Puede esperar' },
}

const CONFIDENCE_STYLES: Record<string, { color: string; label: string }> = {
  alta:  { color: '#036446', label: 'Alta confianza' },
  media: { color: '#b45309', label: 'Confianza media' },
  baja:  { color: '#9b9b97', label: 'Baja confianza' },
}

export default function VisionPage() {
  const [image,     setImage]     = useState<string | null>(null)
  const [mimeType,  setMimeType]  = useState('image/jpeg')
  const [preview,   setPreview]   = useState<string | null>(null)
  const [loading,   setLoading]   = useState(false)
  const [result,    setResult]    = useState<any>(null)
  const [error,     setError]     = useState('')
  const [dragOver,  setDragOver]  = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Solo se aceptan imágenes (JPG, PNG, WEBP)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB')
      return
    }
    setError('')
    setResult(null)
    setMimeType(file.type)

    const reader = new FileReader()
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string
      setPreview(dataUrl)
      // Extraemos solo el base64 sin el prefijo data:image/...;base64,
      const base64 = dataUrl.split(',')[1]
      setImage(base64)
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  async function analyze() {
    if (!image) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const r = await fetch('/api/vision',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({imageBase64:image,mimeType})}).then(x=>x.json())
      setResult(r.data.analysis)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error analizando la imagen. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  const urgencyStyle  = result ? (URGENCY_STYLES[result.urgencia] || URGENCY_STYLES.puede_esperar) : null
  const confidenceStyle = result ? (CONFIDENCE_STYLES[result.confianza] || CONFIDENCE_STYLES.media) : null

  return (
    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>
          Análisis de cultivos con IA
        </h1>
        <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
          Sube una foto de tu planta y NOH identificará enfermedades, plagas o problemas nutricionales
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Zona de carga ── */}
        <div>
          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => inputRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? '#036446' : '#e5e5e3'}`,
                borderRadius: '12px',
                padding: '48px 24px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragOver ? '#e8f5ef' : '#f9f9f7',
                transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🌿</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>
                Arrastra una imagen aquí
              </div>
              <div style={{ fontSize: '12px', color: '#9b9b97', marginBottom: '16px' }}>
                o haz clic para seleccionar
              </div>
              <div style={{ fontSize: '11px', color: '#9b9b97' }}>
                JPG, PNG o WEBP · Máximo 5MB
              </div>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <img
                src={preview}
                alt="Cultivo a analizar"
                style={{ width: '100%', borderRadius: '12px', border: '0.5px solid #e5e5e3', display: 'block' }}
              />
              <button
                onClick={reset}
                style={{ position: 'absolute', top: '10px', right: '10px', width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#dc2626', marginTop: '12px' }}>
              {error}
            </div>
          )}

          {preview && !result && (
            <button
              onClick={analyze}
              disabled={loading}
              style={{ width: '100%', marginTop: '14px', padding: '12px', background: loading ? '#e5e5e3' : '#036446', color: loading ? '#9b9b97' : 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
              {loading ? '🔍 Analizando imagen...' : '🔍 Analizar con NOH Vision'}
            </button>
          )}

          {result && (
            <button
              onClick={reset}
              style={{ width: '100%', marginTop: '14px', padding: '10px', background: 'transparent', color: '#036446', border: '0.5px solid #036446', borderRadius: '8px', fontSize: '12px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' }}>
              Analizar otra imagen
            </button>
          )}

          {/* Tips */}
          <div style={{ background: '#f9f9f7', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '14px 16px', marginTop: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#9b9b97', letterSpacing: '0.06em', marginBottom: '8px' }}>TIPS PARA MEJOR ANÁLISIS</div>
            {[
              'Fotografía la hoja o parte afectada de cerca',
              'Usa buena iluminación natural',
              'Incluye toda la lesión o síntoma visible',
              'Evita imágenes borrosas o con sombras',
            ].map((tip, i) => (
              <div key={i} style={{ fontSize: '12px', color: '#6b6b67', marginBottom: '4px', display: 'flex', gap: '6px' }}>
                <span style={{ color: '#036446', flexShrink: 0 }}>✓</span> {tip}
              </div>
            ))}
          </div>
        </div>

        {/* ── Resultado del análisis ── */}
        <div>
          {loading && (
            <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'spin 2s linear infinite', display: 'inline-block' }}>🔍</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>NOAH está analizando tu imagen</div>
              <div style={{ fontSize: '12px', color: '#9b9b97' }}>Esto puede tomar unos segundos...</div>
              <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {!loading && !result && !error && (
            <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '40px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌱</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '8px' }}>Listo para analizar</div>
              <div style={{ fontSize: '12px', color: '#9b9b97', lineHeight: 1.6 }}>
                Sube una foto de tu cultivo y NOH identificará cualquier problema usando inteligencia artificial
              </div>
            </div>
          )}

          {result && result.diagnostico !== 'imagen_invalida' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

              {/* Diagnóstico principal */}
              <div style={{ background: '#fff', border: `0.5px solid ${urgencyStyle?.color || '#e5e5e3'}`, borderRadius: '12px', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18' }}>
                    {result.diagnostico}
                  </div>
                  {urgencyStyle && (
                    <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: urgencyStyle.bg, color: urgencyStyle.color, flexShrink: 0, marginLeft: '8px' }}>
                      {urgencyStyle.label}
                    </span>
                  )}
                </div>
                {confidenceStyle && (
                  <div style={{ fontSize: '11px', color: confidenceStyle.color, marginBottom: '10px', fontWeight: '500' }}>
                    {confidenceStyle.label}
                  </div>
                )}
                <p style={{ fontSize: '13px', color: '#6b6b67', lineHeight: 1.6, margin: 0 }}>
                  {result.descripcion}
                </p>
              </div>

              {/* Tratamiento */}
              {result.tratamiento && (
                <div style={{ background: '#e8f5ef', border: '0.5px solid #a7f3d0', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#036446', letterSpacing: '0.06em', marginBottom: '8px' }}>TRATAMIENTO RECOMENDADO</div>
                  <p style={{ fontSize: '13px', color: '#024d36', lineHeight: 1.6, margin: 0 }}>{result.tratamiento}</p>
                </div>
              )}

              {/* Productos */}
              {result.productos && result.productos.length > 0 && (
                <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#9b9b97', letterSpacing: '0.06em', marginBottom: '10px' }}>PRODUCTOS SUGERIDOS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {result.productos.map((p: string, i: number) => (
                      <span key={i} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '20px', background: '#f9f9f7', border: '0.5px solid #e5e5e3', color: '#1a1a18' }}>
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prevención */}
              {result.prevencion && (
                <div style={{ background: '#e6f1fb', border: '0.5px solid #bfdbfe', borderRadius: '10px', padding: '16px' }}>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#185fa5', letterSpacing: '0.06em', marginBottom: '8px' }}>PREVENCIÓN FUTURA</div>
                  <p style={{ fontSize: '13px', color: '#1e3a5f', lineHeight: 1.6, margin: 0 }}>{result.prevencion}</p>
                </div>
              )}
            </div>
          )}

          {result && result.diagnostico === 'imagen_invalida' && (
            <div style={{ background: '#fef3e2', border: '0.5px solid #fed7aa', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#b45309', marginBottom: '6px' }}>Imagen no válida</div>
              <div style={{ fontSize: '12px', color: '#92400e' }}>
                La imagen no muestra un cultivo o planta. Sube una foto clara de la parte afectada de tu planta.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
