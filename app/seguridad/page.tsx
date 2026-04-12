export default function SeguridadPage() {
  return (
    <div style={{ maxWidth:'800px', margin:'80px auto', padding:'0 24px', fontFamily:'system-ui, sans-serif' }}>
      <h1 style={{ fontSize:'28px', fontWeight:'600', marginBottom:'16px' }}>Seguridad</h1>
      <p style={{ color:'#666', marginBottom:'24px' }}>Última actualización: Abril 2026</p>
      <p style={{ lineHeight:'1.7', marginBottom:'16px' }}>PRAIRON utiliza encriptación AES-256 para datos en reposo y TLS 1.3 para datos en tránsito. Todos los passwords se almacenan con bcrypt.</p>
      <h2 style={{ fontSize:'18px', fontWeight:'600', margin:'24px 0 12px' }}>Autenticación</h2>
      <p style={{ lineHeight:'1.7', marginBottom:'16px' }}>JWT con expiración configurable. Soporte para autenticación con Google OAuth 2.0.</p>
      <h2 style={{ fontSize:'18px', fontWeight:'600', margin:'24px 0 12px' }}>Infraestructura</h2>
      <p style={{ lineHeight:'1.7', marginBottom:'16px' }}>Desplegado en Render (Oregon, US-West) con base de datos PostgreSQL en Supabase con backups automáticos diarios.</p>
      <h2 style={{ fontSize:'18px', fontWeight:'600', margin:'24px 0 12px' }}>Reporte de vulnerabilidades</h2>
      <p style={{ lineHeight:'1.7' }}>seguridad@prairon.com</p>
    </div>
  )
}
