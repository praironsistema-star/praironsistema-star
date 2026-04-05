import Skeleton from '@/components/ui/Skeleton'

// ─────────────────────────────────────────────────────────────────────────────
// FarmsSkeleton — simula visualmente la página de granjas mientras carga
// Se muestra en lugar del texto "Cargando..." que había antes
// Replica la estructura real: header + 2 tarjetas con mapa simulado
// ─────────────────────────────────────────────────────────────────────────────

export default function FarmsSkeleton() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>

      {/* ── Header: título + botones ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width={160} height={22} borderRadius={6} />
          <Skeleton width={220} height={13} borderRadius={4} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton width={100} height={32} borderRadius={6} />
          <Skeleton width={120} height={32} borderRadius={6} />
        </div>
      </div>

      {/* ── Simula 2 tarjetas de granja con mapa ── */}
      {[1, 2].map((i) => (
        <div key={i} style={{
          background: '#fff',
          border: '0.5px solid #e5e5e3',
          borderRadius: '12px',
          overflow: 'hidden',
          marginBottom: '16px',
        }}>
          {/* Header de la tarjeta */}
          <div style={{
            padding: '14px 18px',
            borderBottom: '0.5px solid #e5e5e3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              <Skeleton width={180} height={16} borderRadius={5} />
              <Skeleton width={240} height={12} borderRadius={4} />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Skeleton width={80} height={22} borderRadius={20} />
              <Skeleton width={90} height={22} borderRadius={20} />
            </div>
          </div>

          {/* Cuerpo: simula el mapa SVG */}
          <div style={{ padding: '16px 18px' }}>
            <div style={{
              background: '#f9f9f7',
              borderRadius: '8px',
              height: '220px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '10px',
              padding: '16px',
            }}>
              {[1, 2, 3].map((j) => (
                <div key={j} style={{
                  background: '#e5e5e3',
                  borderRadius: '8px',
                  animation: 'skeleton-pulse 1.6s ease-in-out infinite',
                  animationDelay: `${j * 0.15}s`,
                }} />
              ))}
            </div>
          </div>

          {/* Footer con leyenda */}
          <div style={{
            padding: '10px 18px',
            borderTop: '0.5px solid #f0f0ee',
            display: 'flex',
            gap: '16px',
          }}>
            {[1, 2, 3].map((j) => (
              <Skeleton key={j} width={60} height={12} borderRadius={4} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
