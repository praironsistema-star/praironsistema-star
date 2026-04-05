import Skeleton from '@/components/ui/Skeleton'

export default function AnimalsSkeleton() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '1200px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width={120} height={22} borderRadius={6} />
          <Skeleton width={200} height={13} borderRadius={4} />
        </div>
        <Skeleton width={130} height={32} borderRadius={6} />
      </div>

      {/* 5 tarjetas de métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginBottom: '24px' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton width={60} height={24} borderRadius={5} />
            <Skeleton width={100} height={11} borderRadius={4} />
          </div>
        ))}
      </div>

      {/* Barra de búsqueda y filtros */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <Skeleton width="100%" height={34} borderRadius={6} />
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1,2,3,4].map(i => (
            <Skeleton key={i} width={90} height={30} borderRadius={20} />
          ))}
        </div>
      </div>

      {/* Grid de tarjetas de animales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Skeleton width={36} height={36} borderRadius={999} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <Skeleton width={100} height={14} borderRadius={4} />
                  <Skeleton width={70} height={11} borderRadius={4} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <Skeleton width={48} height={26} borderRadius={5} />
                <Skeleton width={28} height={26} borderRadius={5} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
              <Skeleton height={44} borderRadius={6} />
              <Skeleton height={44} borderRadius={6} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Skeleton width={80} height={22} borderRadius={20} />
              <Skeleton width={100} height={13} borderRadius={4} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
