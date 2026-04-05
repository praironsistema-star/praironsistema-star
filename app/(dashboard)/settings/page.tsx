'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { toastSuccess, toastError } from '@/components/ui/Toast'
import { getUser } from '@/lib/auth'

const FARM_TYPES = [
  { value: 'ganadera',  label: 'Ganadera / Carne' },
  { value: 'lechera',   label: 'Lechera' },
  { value: 'agricola',  label: 'Agrícola' },
  { value: 'mixta',     label: 'Mixta' },
  { value: 'avicola',   label: 'Avícola' },
  { value: 'porcicola', label: 'Porcícola' },
  { value: 'acuicola',  label: 'Acuícola' },
  { value: 'otro',      label: 'Otro' },
]

const TABS = [
  { key: 'perfil',    labelKey: 'settings.tab_profile',  icon: '👤' },
  { key: 'seguridad', labelKey: 'settings.tab_security', icon: '🔒' },
  { key: 'empresa',   labelKey: 'settings.tab_company',  icon: '🏢' },
  { key: 'equipo',    labelKey: 'settings.tab_team',     icon: '👥' },
  { key: 'actividad', labelKey: 'settings.tab_activity', icon: '📋' },
]

const inputStyle: React.CSSProperties = {
  width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '8px',
  padding: '10px 12px', fontSize: '13px', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit', background: '#f9f9f7',
}

function Label({ children }: { children: React.ReactNode }) {
  return <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500', letterSpacing: '0.06em' }}>{children}</label>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18', marginBottom: '16px', paddingBottom: '10px', borderBottom: '0.5px solid #e5e5e3' }}>{children}</div>
}

export default function SettingsPage() {
  const { t } = useI18n()
  const localUser = getUser()
  const [activeTab, setActiveTab] = useState('perfil')
  const [profile, setProfile]     = useState({ name: '', email: '' })
  const [savingProfile, setSaving] = useState(false)
  const [passwords, setPasswords]  = useState({ current: '', nuevo: '', confirmar: '' })
  const [savingPass, setSavingPass] = useState(false)
  const [company, setCompany]      = useState({ name: '', typeOfFarm: 'mixta', location: '' })
  const [savingCompany, setSavingC]= useState(false)
  const [team, setTeam]            = useState<any[]>([])
  const [loadingTeam, setLoadingTeam] = useState(false)
  const [activity, setActivity]    = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data: p } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (p) {
        setProfile({ name: p.full_name || p.name || '', email: user.email || '' })
      }
      const { data: org } = await supabase.from('organizations').select('*').eq('id', user.user_metadata?.org_id || '').single()
      if (org) setCompany({ name: org.name || '', typeOfFarm: org.type_of_farm || 'mixta', location: org.location || '' })
    })
  }, [])

  useEffect(() => {
    if (activeTab === 'actividad' && activity.length === 0) {
      setLoadingActivity(true)
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(30)
        .then((r) => { setActivity(r.data || []); setLoadingActivity(false) })
    }
    if (activeTab === 'equipo' && team.length === 0) {
      setLoadingTeam(true)
      supabase.from('profiles').select('*')
        .then((r) => { setTeam(r.data || []); setLoadingTeam(false) })
    }
  }, [activeTab])

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('profiles').update({ full_name: profile.name }).eq('id', user?.id || '')
      toastSuccess('Perfil actualizado correctamente')
    } catch { toastError('Error al actualizar el perfil') }
    finally { setSaving(false) }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (passwords.nuevo !== passwords.confirmar) { toastError('Las contraseñas nuevas no coinciden'); return }
    if (passwords.nuevo.length < 6) { toastError('Mínimo 6 caracteres'); return }
    setSavingPass(true)
    try {
      await supabase.auth.updateUser({ password: passwords.nuevo })
      setPasswords({ current: '', nuevo: '', confirmar: '' })
      toastSuccess('Contraseña actualizada correctamente')
    } catch { toastError('Error al cambiar la contraseña') }
    finally { setSavingPass(false) }
  }

  async function saveCompany(e: React.FormEvent) {
    e.preventDefault()
    setSavingC(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('organizations').update({ name: company.name, type_of_farm: company.typeOfFarm, location: company.location }).eq('id', user?.user_metadata?.org_id || '')
      toastSuccess('Empresa actualizada correctamente')
    } catch { toastError('Error al actualizar la empresa') }
    finally { setSavingC(false) }
  }

  const btnStyle = (saving: boolean): React.CSSProperties => ({
    padding: '9px 20px', background: saving ? '#e5e5e3' : '#036446',
    color: saving ? '#9b9b97' : 'white', border: 'none', borderRadius: '7px',
    fontSize: '13px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
  })

  return (
    <div style={{ padding: '28px 32px', maxWidth: '900px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>{t('settings.title')}</h1>
        <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>{t('settings.subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', overflow: 'hidden' }}>
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              style={{ width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                border: 'none', borderBottom: '0.5px solid #f0f0ee',
                background: activeTab === tab.key ? '#e8f5ef' : '#fff',
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}>
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              <span style={{ fontSize: '13px', fontWeight: activeTab === tab.key ? '500' : '400', color: activeTab === tab.key ? '#036446' : '#1a1a18' }}>
                {t(tab.labelKey)}
              </span>
            </button>
          ))}
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '24px' }}>

          {activeTab === 'perfil' && (
            <form onSubmit={saveProfile}>
              <SectionTitle>{t('settings.personal_info')}</SectionTitle>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#036446', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '600', color: 'white' }}>
                  {profile.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18' }}>{profile.name || '—'}</div>
                  <div style={{ fontSize: '12px', color: '#9b9b97' }}>{localUser?.roleName || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <Label>{t('settings.full_name')}</Label>
                  <input value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#036446'} onBlur={e => e.target.style.borderColor = '#e5e5e3'} />
                </div>
                <div>
                  <Label>{t('settings.email')}</Label>
                  <input type="email" value={profile.email} disabled style={{ ...inputStyle, opacity: 0.6 }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={savingProfile} style={btnStyle(savingProfile)}>
                  {savingProfile ? t('settings.saving') : t('settings.save_profile')}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'seguridad' && (
            <form onSubmit={savePassword}>
              <SectionTitle>{t('settings.change_password')}</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <Label>{t('settings.current_password')}</Label>
                  <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} required placeholder="Tu contraseña actual" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#036446'} onBlur={e => e.target.style.borderColor = '#e5e5e3'} />
                </div>
                <div>
                  <Label>{t('settings.new_password')}</Label>
                  <input type="password" value={passwords.nuevo} onChange={e => setPasswords({ ...passwords, nuevo: e.target.value })} required minLength={6} placeholder="Mínimo 6 caracteres" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#036446'} onBlur={e => e.target.style.borderColor = '#e5e5e3'} />
                </div>
                <div>
                  <Label>{t('settings.confirm_password')}</Label>
                  <input type="password" value={passwords.confirmar} onChange={e => setPasswords({ ...passwords, confirmar: e.target.value })} required placeholder="Repite la nueva contraseña" style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#036446'} onBlur={e => e.target.style.borderColor = '#e5e5e3'} />
                </div>
              </div>
              <div style={{ background: '#f9f9f7', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '12px 14px', marginBottom: '20px', fontSize: '12px', color: '#6b6b67' }}>
                ¿Olvidaste tu contraseña? <a href="/forgot-password" style={{ color: '#036446', fontWeight: '500' }}>Recupérala aquí</a>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={savingPass} style={btnStyle(savingPass)}>
                  {savingPass ? t('settings.updating') : t('settings.update_password')}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'empresa' && (
            <form onSubmit={saveCompany}>
              <SectionTitle>{t('settings.company_data')}</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                <div>
                  <Label>{t('settings.company_name')}</Label>
                  <input value={company.name} onChange={e => setCompany({ ...company, name: e.target.value })} required style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#036446'} onBlur={e => e.target.style.borderColor = '#e5e5e3'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <Label>{t('settings.production_type')}</Label>
                    <select value={company.typeOfFarm} onChange={e => setCompany({ ...company, typeOfFarm: e.target.value })} style={{ ...inputStyle, cursor: 'pointer' }}>
                      {FARM_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>{t('settings.location')}</Label>
                    <input value={company.location} onChange={e => setCompany({ ...company, location: e.target.value })} placeholder="Ej: Córdoba, Colombia" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = '#036446'} onBlur={e => e.target.style.borderColor = '#e5e5e3'} />
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" disabled={savingCompany} style={btnStyle(savingCompany)}>
                  {savingCompany ? t('settings.saving') : t('settings.save_company')}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'actividad' && (
            <div>
              <SectionTitle>{t('settings.activity_log')}</SectionTitle>
              {loadingActivity ? (
                <div style={{ color: '#9b9b97', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>{t('common.loading')}</div>
              ) : activity.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                  <div style={{ fontSize: '14px', color: '#9b9b97' }}>{t('settings.no_activity')}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#f0f0ee', borderRadius: '8px', overflow: 'hidden' }}>
                  {activity.map((log: any) => {
                    const actionColors: Record<string, { bg: string; color: string; label: string }> = {
                      created: { bg: '#e8f5ef', color: '#036446', label: t('settings.action_created') },
                      updated: { bg: '#e6f1fb', color: '#185fa5', label: t('settings.action_updated') },
                      deleted: { bg: '#fef2f2', color: '#dc2626', label: t('settings.action_deleted') },
                    }
                    const ac = actionColors[log.action] || actionColors.updated
                    const date = new Date(log.created_at)
                    return (
                      <div key={log.id} style={{ background: '#fff', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', background: ac.bg, color: ac.color, flexShrink: 0 }}>{ac.label}</span>
                        <div style={{ flex: 1, fontSize: '12px', color: '#1a1a18' }}>{log.description}</div>
                        <div style={{ fontSize: '11px', color: '#9b9b97', flexShrink: 0, textAlign: 'right' }}>
                          <div>{log.user_name}</div>
                          <div>{date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })} {date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'equipo' && (
            <div>
              <SectionTitle>{t('settings.team_members')}</SectionTitle>
              {loadingTeam ? (
                <div style={{ color: '#9b9b97', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>{t('common.loading')}</div>
              ) : team.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
                  <div style={{ fontSize: '14px', color: '#9b9b97' }}>{t('settings.no_team')}</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {team.map((member: any) => (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '0.5px solid #e5e5e3', borderRadius: '8px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#036446', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: 'white', flexShrink: 0 }}>
                        {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '500', color: '#1a1a18' }}>{member.full_name || member.name}</div>
                        <div style={{ fontSize: '11px', color: '#9b9b97' }}>{member.email}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#e8f5ef', color: '#036446', fontWeight: '500' }}>
                          {member.role?.name || '—'}
                        </span>
                        <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: member.status === 'active' ? '#e8f5ef' : '#f9f9f7', color: member.status === 'active' ? '#036446' : '#9b9b97' }}>
                          {member.status === 'active' ? t('settings.active') : t('settings.inactive')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
