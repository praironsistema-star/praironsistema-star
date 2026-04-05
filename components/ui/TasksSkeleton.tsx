import Skeleton from '@/components/ui/Skeleton'

export default function TasksSkeleton() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '1300px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width={100} height={22} borderRadius={6} />
          <Skeleton width={260} height={13} borderRadius={4} />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton width={120} height={32} borderRadius={6} />
          <Skeleton width={120} height={32} borderRadius={6} />
        </div>
      </div>

      {/* Filtros de tipo */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        {[1,2,3,4,5].map(i => (
          <Skeleton key={i} width={80} height={28} borderRadius={20} />
        ))}
      </div>

      {/* Kanban — 3 columnas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {[1,2,3].map(col => (
          <div key={col} style={{ background: '#f9f9f7', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '14px' }}>
            {/* Cabecera de columna */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Skeleton width={8} height={8} borderRadius={999} />
                <Skeleton width={90} height={13} borderRadius={4} />
              </div>
              <Skeleton width={28} height={20} borderRadius={20} />
            </div>
            {/* Tarjetas de tarea */}
            {[1,2,3].map(i => (
              <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Skeleton width={100} height={14} borderRadius={4} />
                  <div style={{ display: 'flex', gap: '3px' }}>
                    <Skeleton width={24} height={22} borderRadius={4} />
                    <Skeleton width={24} height={22} borderRadius={4} />
                  </div>
                </div>
                <Skeleton width="90%" height={11} borderRadius={4} style={{ marginBottom: '8px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Skeleton width={60} height={11} borderRadius={4} />
                  <Skeleton width={70} height={24} borderRadius={20} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
