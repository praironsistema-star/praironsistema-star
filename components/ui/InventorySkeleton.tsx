import Skeleton from '@/components/ui/Skeleton'

export default function InventorySkeleton() {
  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width={130} height={22} borderRadius={6} />
          <Skeleton width={180} height={13} borderRadius={4} />
        </div>
        <Skeleton width={120} height={32} borderRadius={6} />
      </div>

      {/* Barra búsqueda + filtros */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <Skeleton width="100%" height={34} borderRadius={6} />
        <div style={{ display: 'flex', gap: '6px' }}>
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} width={80} height={30} borderRadius={20} />
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', overflow: 'hidden' }}>
        {/* Cabecera */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 80px', gap: '0', background: '#f9f9f7', borderBottom: '0.5px solid #e5e5e3', padding: '10px 14px' }}>
          {[160, 80, 90, 80, 70, 100, 60].map((w, i) => (
            <Skeleton key={i} width={w} height={11} borderRadius={4} />
          ))}
        </div>
        {/* Filas */}
        {[1,2,3,4,5,6,7,8].map(i => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 80px', gap: '0', padding: '12px 14px', borderBottom: '0.5px solid #f0f0ee', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <Skeleton width={160} height={13} borderRadius={4} />
              <Skeleton width={100} height={11} borderRadius={4} />
            </div>
            <Skeleton width={70} height={20} borderRadius={20} />
            <Skeleton width={80} height={13} borderRadius={4} />
            <Skeleton width={70} height={16} borderRadius={4} />
            <Skeleton width={50} height={13} borderRadius={4} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Skeleton width={90} height={4} borderRadius={2} />
              <Skeleton width={60} height={10} borderRadius={4} />
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <Skeleton width={44} height={26} borderRadius={5} />
              <Skeleton width={26} height={26} borderRadius={5} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
