'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import { getRole, getUser } from '@/lib/auth'
import api from '@/lib/api'
import { supabase } from '@/lib/supabase'

const ROLES = ['gerente','supervisor','ingeniero','contador','veterinario','trabajador']
const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  'dueño':       { bg: '#e8f5ef', color: '#036446' },
  'gerente':     { bg: '#e6f1fb', color: '#185fa5' },
  'supervisor':  { bg: '#fef3e2', color: '#b45309' },
  'ingeniero':   { bg: '#ede9fe', color: '#6d28d9' },
  'contador':    { bg: '#fce7f3', color: '#9d174d' },
  'veterinario': { bg: '#ecfccb', color: '#3f6212' },
  'trabajador':  { bg: '#f1f5f9', color: '#475569' },
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  'dueño':       'Acceso total al sistema',
  'gerente':     'Gestión operativa y reportes',
  'supervisor':  'Control de tareas y campo',
  'ingeniero':   'Agronomía y cultivos',
  'contador':    'Finanzas e inventario',
  'veterinario': 'Salud animal y registros',
  'trabajador':  'Tareas asignadas',
}

function Avatar({ name, role }: { name: string; role: string }) {
  const rc = ROLE_COLORS[role?.toLowerCase()] || ROLE_COLORS['trabajador']
  return (
    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: rc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '500', color: rc.color, flexShrink: 0 }}>
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  )
}

export default function TeamPage() {
  const { t } = useI18n()
  const [members, setMembers] = useState<any[]>([])
  const [invitations, setInvitations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ email: '', role: 'supervisor' })
  const [submitting, setSubmitting] = useState(false)
  const [inviteResult, setInviteResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'miembros'|'invitaciones'>('miembros')
  const [copied, setCopied] = useState(false)
  const role = getRole()
  const user = getUser()
  const canInvite = ['dueño','gerente'].includes(role)

  async function load() {
    try {
      const [nom, inv] = await Promise.allSettled([
        supabase.from('labor_records').select('*').order('created_at',{ascending:false}),
        supabase.from('invitations').select('*').eq('status','pending'),
      ])
      if (nom.status === 'fulfilled') setMembers(nom.value.data ?? [])
      if (inv.status === 'fulfilled') setInvitations(inv.value.data ?? [])
    } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setError(''); setSubmitting(true)
    try {
      const { supabase } = await import('@/lib/supabase')
      const res = await supabase.from('invitations').insert(form)
      setInviteResult(res.data)
      load()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al enviar invitación')
    } finally { setSubmitting(false) }
  }

  async function handleCancel(id: string) {
    if (!confirm(t('team.cancel_confirm'))) return
    const { supabase } = await import('@/lib/supabase')
      await supabase.from('invitations').update({status:'cancelled'}).eq('id',id)
    load()
  }

  function copyLink() {
    if (!inviteResult?.link) return
    navigator.clipboard.writeText(inviteResult.link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const pendingInvitations = invitations.filter(i => i.status === 'pending' || !i.acceptedAt)

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1000px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>{t('team.title')}</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            {members.length} miembros · {pendingInvitations.length} invitaciones pendientes
          </p>
        </div>
        {canInvite && (
          <button onClick={() => { setModal(true); setInviteResult(null); setError(''); setForm({ email: '', role: 'supervisor' }) }}
            style={{ fontSize: '12px', padding: '8px 16px', background: '#036446', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            + Invitar persona
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '24px' }}>
        {[
          { label: t('team.total_members'), value: members.length },
          { label: t('team.active_invitations'), value: pendingInvitations.length },
          { label: t('team.different_roles'), value: [...new Set(members.map((m:any) => m.role?.toLowerCase()))].length },
          { label: t('team.my_role'), value: role || '—' },
        ].map(m => (
          <div key={m.label} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '14px' }}>
            <div style={{ fontSize: '20px', fontWeight: '500', color: '#036446', textTransform: 'capitalize' }}>{m.value}</div>
            <div style={{ fontSize: '11px', color: '#9b9b97', marginTop: '4px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0', marginBottom: '20px', border: '0.5px solid #e5e5e3', borderRadius: '8px', overflow: 'hidden', width: 'fit-content' }}>
        <button onClick={() => setTab('miembros')} style={{ padding: '8px 20px', fontSize: '13px', border: 'none', cursor: 'pointer', background: tab === 'miembros' ? '#036446' : '#fff', color: tab === 'miembros' ? 'white' : '#6b6b67', fontWeight: tab === 'miembros' ? '500' : '400' }}>
          {t('team.members')} ({members.length})
        </button>
        <button onClick={() => setTab('invitaciones')} style={{ padding: '8px 20px', fontSize: '13px', border: 'none', cursor: 'pointer', background: tab === 'invitaciones' ? '#036446' : '#fff', color: tab === 'invitaciones' ? 'white' : '#6b6b67', fontWeight: tab === 'invitaciones' ? '500' : '400' }}>
          {t('team.invitations')} ({pendingInvitations.length})
        </button>
      </div>

      {loading ? (
        <div style={{ color: '#9b9b97', fontSize: '13px', padding: '40px', textAlign: 'center' }}>{t('team.loading')}</div>
      ) : tab === 'miembros' ? (
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', overflow: 'hidden' }}>
          {members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#9b9b97', fontSize: '13px' }}>{t('team.no_members')}</div>
          ) : members.map((m:any, i:number) => {
            const rc = ROLE_COLORS[m.role?.toLowerCase()] || ROLE_COLORS['trabajador']
            const isMe = m.email === user?.email
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: i < members.length - 1 ? '0.5px solid #f0f0ee' : 'none' }}>
                <Avatar name={m.name} role={m.role?.toLowerCase()} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18' }}>{m.name}</div>
                    {isMe && <span style={{ fontSize: '10px', fontWeight: '500', padding: '1px 6px', borderRadius: '10px', background: '#e8f5ef', color: '#036446' }}>Tú</span>}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9b9b97', marginTop: '2px' }}>{m.email}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: rc.bg, color: rc.color }}>
                      {m.role}
                    </span>
                    <div style={{ fontSize: '10px', color: '#9b9b97', marginTop: '3px' }}>{ROLE_DESCRIPTIONS[m.role?.toLowerCase()] || 'Miembro del equipo'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#9b9b97' }}>Desde</div>
                    <div style={{ fontSize: '11px', color: '#6b6b67', fontWeight: '500' }}>{new Date(m.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div>
          {pendingInvitations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', border: '0.5px dashed #e5e5e3', borderRadius: '12px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>✉️</div>
              <div style={{ fontSize: '15px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>{t('team.no_invitations')}</div>
              <div style={{ fontSize: '13px', color: '#9b9b97', marginBottom: '20px' }}>{t('team.no_invitations_sub')}</div>
              {canInvite && (
                <button onClick={() => setModal(true)} style={{ fontSize: '12px', padding: '8px 20px', background: '#036446', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Enviar primera invitación
                </button>
              )}
            </div>
          ) : (
            <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', overflow: 'hidden' }}>
              {pendingInvitations.map((inv:any, i:number) => {
                const rc = ROLE_COLORS[inv.role?.toLowerCase()] || ROLE_COLORS['trabajador']
                const isExpired = inv.expiresAt && new Date(inv.expiresAt) < new Date()
                return (
                  <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderBottom: i < pendingInvitations.length - 1 ? '0.5px solid #f0f0ee' : 'none', opacity: isExpired ? 0.5 : 1 }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f9f9f7', border: '0.5px dashed #e5e5e3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', flexShrink: 0 }}>✉️</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18' }}>{inv.email}</div>
                      <div style={{ fontSize: '11px', color: '#9b9b97', marginTop: '2px' }}>
                        Enviada {new Date(inv.createdAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        {inv.expiresAt && ' · Vence ' + new Date(inv.expiresAt).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                        {isExpired && ' · Expirada'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: rc.bg, color: rc.color }}>{inv.role}</span>
                      <span style={{ fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', background: isExpired ? '#fef2f2' : '#fef3e2', color: isExpired ? '#dc2626' : '#b45309' }}>
                        {isExpired ? t('team.expired_label') : t('team.pending_label')}
                      </span>
                      {canInvite && (
                        <button onClick={() => handleCancel(inv.id)} style={{ fontSize: '11px', padding: '4px 8px', border: '0.5px solid #fecaca', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                          Cancelar
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '24px', background: '#f9f9f7', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: '500', color: '#9b9b97', letterSpacing: '0.07em', marginBottom: '12px' }}>{t('team.available_roles')}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
          {Object.entries(ROLE_DESCRIPTIONS).filter(([r]) => r !== 'dueño').map(([r, desc]) => {
            const rc = ROLE_COLORS[r] || ROLE_COLORS['trabajador']
            return (
              <div key={r} style={{ padding: '10px 12px', background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: rc.bg, color: rc.color, textTransform: 'capitalize' }}>{r}</span>
                <div style={{ fontSize: '10px', color: '#9b9b97', marginTop: '6px' }}>{desc}</div>
              </div>
            )
          })}
        </div>
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            {!inviteResult ? (
              <>
                <div style={{ fontSize: '17px', fontWeight: '500', color: '#1a1a18', marginBottom: '6px' }}>{t('team.invite_title')}</div>
                <div style={{ fontSize: '13px', color: '#9b9b97', marginBottom: '24px' }}>{t('team.invite_sub')}</div>
                {error && (
                  <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#dc2626', marginBottom: '16px' }}>{error}</div>
                )}
                <form onSubmit={handleInvite}>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>{t('team.email')}</label>
                    <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                      placeholder="trabajador@empresa.com"
                      style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => e.target.style.borderColor = '#036446'}
                      onBlur={e => e.target.style.borderColor = '#e5e5e3'} />
                  </div>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500' }}>{t('team.role_label')}</label>
                    <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                      style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', outline: 'none', background: '#fff' }}>
                      {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)} — {ROLE_DESCRIPTIONS[r]}</option>)}
                    </select>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button type="button" onClick={() => setModal(false)} style={{ fontSize: '12px', padding: '10px 16px', border: '0.5px solid #e5e5e3', borderRadius: '8px', background: 'transparent', cursor: 'pointer' }}>{t('team.cancel_inv')}</button>
                    <button type="submit" disabled={submitting}
                      style={{ fontSize: '12px', padding: '10px 20px', background: submitting ? '#e5e5e3' : '#036446', color: submitting ? '#9b9b97' : 'white', border: 'none', borderRadius: '8px', cursor: submitting ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                      {submitting ? t('team.sending') : t('team.send_invite')}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🎉</div>
                  <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18', marginBottom: '4px' }}>{t('team.invite_created')}</div>
                  <div style={{ fontSize: '13px', color: '#9b9b97' }}>{t('team.share_link')} <strong>{inviteResult.email}</strong></div>
                </div>
                <div style={{ background: '#f9f9f7', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '12px 14px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#9b9b97', marginBottom: '6px', fontWeight: '500' }}>{t('team.invite_link')}</div>
                  <div style={{ fontSize: '12px', color: '#1a1a18', wordBreak: 'break-all', lineHeight: 1.5 }}>{inviteResult.link}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={copyLink}
                    style={{ flex: 1, padding: '10px', background: copied ? '#e8f5ef' : '#036446', color: copied ? '#036446' : 'white', border: copied ? '0.5px solid #036446' : 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s' }}>
                    {copied ? t('team.copied') : t('team.copy_link')}
                  </button>
                  <button onClick={() => { setModal(false); setInviteResult(null) }}
                    style={{ padding: '10px 16px', border: '0.5px solid #e5e5e3', borderRadius: '8px', background: 'transparent', fontSize: '12px', cursor: 'pointer', color: '#6b6b67' }}>
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
