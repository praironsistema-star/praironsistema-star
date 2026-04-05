'use client'

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton — barra gris animada que simula contenido mientras carga
//
// USO BÁSICO:
//   <Skeleton width="100%" height={16} />
//
// USO CON VARIANTES:
//   <Skeleton variant="title" />        → barra ancha para títulos
//   <Skeleton variant="text" />         → barra para texto normal
//   <Skeleton variant="text-short" />   → barra corta para subtítulos
//   <Skeleton variant="circle" />       → círculo para avatares/íconos
//   <Skeleton variant="button" />       → barra para botones
//   <Skeleton variant="card" />         → rectángulo grande para tarjetas
// ─────────────────────────────────────────────────────────────────────────────

interface SkeletonProps {
  width?: string | number
  height?: number
  borderRadius?: number
  variant?: 'title' | 'text' | 'text-short' | 'circle' | 'button' | 'card'
  style?: React.CSSProperties
}

const VARIANTS = {
  title:       { width: '60%',  height: 20, borderRadius: 6  },
  text:        { width: '100%', height: 13, borderRadius: 4  },
  'text-short':{ width: '40%',  height: 13, borderRadius: 4  },
  circle:      { width: 36,     height: 36, borderRadius: 999},
  button:      { width: 120,    height: 32, borderRadius: 6  },
  card:        { width: '100%', height: 120,borderRadius: 10 },
}

export default function Skeleton({ width, height, borderRadius = 6, variant, style }: SkeletonProps) {
  // Si se pasa un variant, usamos sus valores predeterminados
  // Si se pasan width/height directamente, esos tienen prioridad
  const base = variant ? VARIANTS[variant] : {}
  const finalWidth        = width        ?? (base as any).width        ?? '100%'
  const finalHeight       = height       ?? (base as any).height       ?? 16
  const finalBorderRadius = borderRadius ?? (base as any).borderRadius ?? 6

  return (
    <>
      <style>{`
        @keyframes skeleton-pulse {
          0%   { opacity: 1;    }
          50%  { opacity: 0.45; }
          100% { opacity: 1;    }
        }
      `}</style>
      <div style={{
        width: finalWidth,
        height: finalHeight,
        borderRadius: finalBorderRadius,
        background: '#e5e5e3',
        animation: 'skeleton-pulse 1.6s ease-in-out infinite',
        flexShrink: 0,
        ...style,
      }} />
    </>
  )
}
