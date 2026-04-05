'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'
import { getUser } from '@/lib/auth'

// ─────────────────────────────────────────────────────────────────────────────
// /profile — Perfil personal del usuario
// Muestra datos del usuario, su rol, empresa y actividad reciente
// ─────────────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const localUser = getUser()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async({data:{user}})=>{ const {data:p} = await supabase.from('profiles').select('*').eq('id',user?.id||'').single(); if(p) setProfile(p); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '28px 32px', maxWidth: '800px' }}>
        <div style={{ height: '22px', width: '160px', background: '#e5e5e3', borderRadius: '6px', marginBottom: '24px', animation: 'pulse 1.6s ease-in-out infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
          <div style={{ height: '300px', background: '#e5e5e3', borderRadius: '10px', animation: 'pulse 1.6s ease-in-out infinite' }} />
          <div style={{ height: '300px', background: '#e5e5e3', borderRadius: '10px', animation: 'pulse 1.6s ease-in-out infinite' }} />
        </div>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.45}}`}</style>
      </div>
    )
  }

  const initials = profile?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '?'
  const createdAt = profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'

  return (
    <div style={{ padding: '28px 32px', maxWidth: '800px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>Mi perfil</h1>
        <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>Tu información personal y de cuenta</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px', alignItems: 'start' }}>

        {/* ── Tarjeta de identidad ── */}
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Banner verde */}
          <div style={{ height: '72px', background: 'linear-gradient(135deg, #036446, #0dac5e)' }} />

          {/* Avatar */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-28px', marginBottom: '12px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#1a1a18', border: '3px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '600', color: 'white' }}>
              {initials}
            </div>
          </div>

          <div style={{ padding: '0 20px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' }}>{profile?.name}</div>
            <div style={{ fontSize: '12px', color: '#9b9b97', marginBottom: '12px' }}>{profile?.email}</div>
            <span style={{ fontSize: '11px', fontWeight: '500', padding: '4px 12px', borderRadius: '20px', background: '#e8f5ef', color: '#036446' }}>
              {profile?.role?.name || localUser?.roleName || '—'}
            </span>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '0.5px solid #f0f0ee' }}>
              <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '4px' }}>EMPRESA</div>
              <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{profile?.company?.name || '—'}</div>
              {profile?.company?.location && (
                <div style={{ fontSize: '11px', color: '#9b9b97', marginTop: '2px' }}>{profile.company.location}</div>
              )}
            </div>

            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '0.5px solid #f0f0ee' }}>
              <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '4px' }}>MIEMBRO DESDE</div>
              <div style={{ fontSize: '12px', color: '#6b6b67' }}>{createdAt}</div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: profile?.status === 'active' ? '#e8f5ef' : '#fef2f2', color: profile?.status === 'active' ? '#036446' : '#dc2626', fontWeight: '500' }}>
                {profile?.status === 'active' ? '● Activo' : '● Inactivo'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Detalles ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Información de cuenta */}
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18', marginBottom: '14px', paddingBottom: '10px', borderBottom: '0.5px solid #e5e5e3' }}>
              Información de cuenta
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Nombre completo', value: profile?.name },
                { label: 'Correo electrónico', value: profile?.email },
                { label: 'Rol', value: profile?.role?.name || localUser?.roleName },
                { label: 'Estado', value: profile?.status === 'active' ? 'Activo' : 'Inactivo' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #f9f9f7' }}>
                  <span style={{ fontSize: '12px', color: '#9b9b97' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: '#1a1a18', fontWeight: '500' }}>{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Información de empresa */}
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18', marginBottom: '14px', paddingBottom: '10px', borderBottom: '0.5px solid #e5e5e3' }}>
              Empresa
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Nombre', value: profile?.company?.name },
                { label: 'Tipo de producción', value: profile?.company?.typeOfFarm },
                { label: 'Ubicación', value: profile?.company?.location || 'No especificada' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #f9f9f7' }}>
                  <span style={{ fontSize: '12px', color: '#9b9b97' }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: '#1a1a18', fontWeight: '500' }}>{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Accesos rápidos */}
          <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '12px', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18', marginBottom: '14px', paddingBottom: '10px', borderBottom: '0.5px solid #e5e5e3' }}>
              Acciones rápidas
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <a href="/settings" style={{ fontSize: '12px', padding: '7px 14px', border: '0.5px solid #e5e5e3', borderRadius: '6px', color: '#036446', textDecoration: 'none', fontWeight: '500' }}>
                ✎ Editar perfil
              </a>
              <a href="/settings?tab=seguridad" style={{ fontSize: '12px', padding: '7px 14px', border: '0.5px solid #e5e5e3', borderRadius: '6px', color: '#6b6b67', textDecoration: 'none' }}>
                🔒 Cambiar contraseña
              </a>
              <a href="/settings?tab=equipo" style={{ fontSize: '12px', padding: '7px 14px', border: '0.5px solid #e5e5e3', borderRadius: '6px', color: '#6b6b67', textDecoration: 'none' }}>
                👥 Ver equipo
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
