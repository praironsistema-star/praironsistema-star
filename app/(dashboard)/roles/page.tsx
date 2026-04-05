'use client'
import { useI18n } from '@/lib/i18n'
import { useEffect, useState } from 'react'
import { getRole } from '@/lib/auth'
import api from '@/lib/api'
import { toastSuccess, toastError, toastInfo } from '@/components/ui/Toast'
import { confirm } from '@/components/ui/Confirm'

const MODULES_KEYS = ['dashboard','farms','animals','inventory','tasks','reports','alerts','team','performance','roles']

const ACTIONS_KEYS = ['view','create','edit','delete']

function emptyPermissions() {
  const p: any = {}
  MODULES_KEYS.forEach(k => { p[k] = { view: false, create: false, edit: false, delete: false } })
  return p
}

export default function RolesPage() {
  const { t } = useI18n()
  const [roles, setRoles]           = useState<any[]>([])
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(false)
  const [editing, setEditing]       = useState<any>(null)
  const [name, setName]             = useState('')
  const [permissions, setPerms]     = useState<any>(emptyPermissions())
  const [error, setError]           = useState('')
  const [saving, setSaving]         = useState(false)
  const role = getRole()
  const canManage = role === 'dueño' || role === 'gerente'

  useEffect(() => {
    api.get('/roles').then(r => setRoles(r.data||[]))
  }, [])

  function togglePerm(mod: string, action: string) {
    setPerms((prev: any) => ({
      ...prev,
      [mod]: { ...prev[mod], [action]: !prev[mod]?.[action] },
    }))
  }

  // Activa/desactiva todos los permisos de un módulo de una vez
  function toggleModule(mod: string) {
    const current = permissions[mod] || {}
    const allOn = ACTIONS_KEYS.every(ak => current[ak])
    const next: any = {}
    ACTIONS_KEYS.forEach(ak => { next[ak] = !allOn })
    setPerms((prev: any) => ({ ...prev, [mod]: next }))
  }

  function openNew() {
    setEditing(null)
    setName('')
    setPerms(emptyPermissions())
    setError('')
    setModal(true)
  }

  function openEdit(r: any) {
    setEditing(r)
    setName(r.name)
    const p = emptyPermissions()
    if (r.permissions) {
      Object.keys(r.permissions).forEach(mod => {
        if (p[mod] !== undefined) p[mod] = { ...p[mod], ...r.permissions[mod] }
      })
    }
    setPerms(p)
    setError('')
    setModal(true)
  }

  async function handleSave() {
    if (!name.trim()) { setError('El nombre del rol es obligatorio'); return }
    setError(''); setSaving(true)
    try {
      if (editing) {
              const r = await api.patch('/roles/editing.id', {name,permissions})
        setRoles(roles.map(x => x.id === editing.id ? { ...x, ...(r.data ?? {}) } : x))
        toastSuccess('Rol actualizado correctamente')
      } else {
              const r = await api.post('/roles', {name,permissions})
        setRoles([...roles, r.data])
        toastSuccess('Rol creado correctamente')
      }
      setModal(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar')
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string, roleName: string) {
    const ok = await confirm({
      title: 'Eliminar rol',
      message: `¿Estás seguro de eliminar el rol "${roleName}"? Los usuarios con este rol quedarán sin permisos.`,
      danger: true,
      confirmText: 'Eliminar rol',
    })
    if (!ok) return
    try {
            await api.patch('/roles/id', {deleted_at:new Date().toISOString()})
      setRoles(roles.filter(r => r.id !== id))
      toastSuccess('Rol eliminado')
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Error al eliminar')
    }
  }

  // Cuenta cuántos permisos tiene un rol
  function countPerms(r: any) {
    if (r.permissions?.all) return t('roles.total_access')
    let count = 0
    MODULES_KEYS.forEach(mk => {
      const perm = r.permissions?.[mk]
      if (perm) count += Object.values(perm).filter(Boolean).length
    })
    return count + ' ' + t('roles.permissions')
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1100px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: '500', color: '#1a1a18', margin: 0 }}>{t('roles.title')}</h1>
          <p style={{ fontSize: '13px', color: '#9b9b97', margin: '4px 0 0' }}>
            {roles.length} {t('nav.roles')} · {t('roles.subtitle')}
          </p>
        </div>
        {canManage && (
          <button onClick={openNew}
            style={{ fontSize: '12px', padding: '8px 16px', background: '#036446', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>
            + Nuevo rol
          </button>
        )}
      </div>

      {/* Lista de roles */}
      {loading ? (
        <div style={{ color: '#9b9b97', fontSize: '13px', padding: '40px', textAlign: 'center' }}>{t('roles.loading')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {roles.map(r => {
            const isSystem = r.name === 'Dueño'
            return (
              <div key={r.id} style={{ background: '#fff', border: '0.5px solid #e5e5e3', borderRadius: '10px', padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '500', color: '#1a1a18' }}>{r.name}</span>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#f9f9f7', color: '#9b9b97', border: '0.5px solid #e5e5e3' }}>
                        {r._count?.users ?? r.userCount ?? 0} usuarios
                      </span>
                      {isSystem && (
                        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#e8f5ef', color: '#036446', fontWeight: '500' }}>
                          Sistema
                        </span>
                      )}
                      <span style={{ fontSize: '11px', color: '#9b9b97', marginLeft: '4px' }}>
                        {countPerms(r)}
                      </span>
                    </div>

                    {/* Módulos con acceso */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {MODULES_KEYS.map(mk => { const m = { key: mk, label: t(`nav.${mk}`) || mk }
                        const perms = r.permissions?.[m.key]
                        const hasAccess = r.permissions?.all || (perms && Object.values(perms).some(Boolean))
                        if (!hasAccess) return null
                        const actions = r.permissions?.all
                          ? ACTIONS_KEYS.map(ak => t(`roles.action_${ak}`))
                          : ACTIONS_KEYS.filter(ak => perms?.[ak]).map(ak => t(`roles.action_${ak}`))
                        return (
                          <div key={m.key} style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#f9f9f7', color: '#6b6b67', border: '0.5px solid #e5e5e3', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ fontWeight: '500', color: '#1a1a18' }}>{m.label}</span>
                            <span style={{ color: '#9b9b97' }}>· {actions.join(', ')}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {canManage && !isSystem && (
                    <div style={{ display: 'flex', gap: '6px', marginLeft: '16px', flexShrink: 0 }}>
                      <button onClick={() => openEdit(r)}
                        style={{ fontSize: '11px', padding: '5px 10px', border: '0.5px solid #e5e5e3', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: '#6b6b67' }}>
                        Editar
                      </button>
                      <button onClick={() => handleDelete(r.id, r.name)}
                        style={{ fontSize: '11px', padding: '5px 10px', border: '0.5px solid #fecaca', borderRadius: '5px', background: 'transparent', cursor: 'pointer', color: '#ef4444' }}>
                        Eliminar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal crear/editar rol */}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 50, overflowY: 'auto', padding: '40px 20px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '680px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

            {/* Header del modal */}
            <div style={{ padding: '20px 24px', borderBottom: '0.5px solid #e5e5e3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '16px', fontWeight: '500', color: '#1a1a18' }}>
                {editing ? t('roles.modal_edit') : t('roles.modal_create')}
              </div>
              <button onClick={() => setModal(false)}
                style={{ fontSize: '18px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9b9b97', padding: '0 4px' }}>×</button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Nombre del rol */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '11px', color: '#9b9b97', marginBottom: '5px', fontWeight: '500', letterSpacing: '0.06em' }}>{t('roles.role_name')}</label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="Ej: Coordinador de riego"
                  style={{ width: '100%', border: '0.5px solid #e5e5e3', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#036446'}
                  onBlur={e => e.target.style.borderColor = '#e5e5e3'} />
              </div>

              {/* Tabla de permisos */}
              <div style={{ fontSize: '11px', fontWeight: '600', color: '#9b9b97', letterSpacing: '0.06em', marginBottom: '10px' }}>
                PERMISOS POR MÓDULO
              </div>
              <div style={{ border: '0.5px solid #e5e5e3', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                {/* Cabecera */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)', background: '#f9f9f7', borderBottom: '0.5px solid #e5e5e3', padding: '8px 14px' }}>
                  <div style={{ fontSize: '11px', color: '#9b9b97', fontWeight: '500' }}>{t('roles.module')}</div>
                  {ACTIONS_KEYS.map(ak => (
                    <div key={ak} style={{ fontSize: '11px', color: '#9b9b97', fontWeight: '500', textAlign: 'center' }}>{t(`roles.action_${ak}`)}</div>
                  ))}
                </div>
                {/* Filas */}
                {MODULES_KEYS.map((mk, i) => { const m = { key: mk, label: t(`nav.${mk}`) || mk };
                  const allOn = ACTIONS_KEYS.every(ak => permissions[m.key]?.[ak])
                  return (
                    <div key={m.key} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(4, 80px)', padding: '10px 14px', borderBottom: i < MODULES_KEYS.length - 1 ? '0.5px solid #f0f0ee' : 'none', alignItems: 'center' }}>
                      {/* Nombre del módulo — click activa/desactiva todos */}
                      <button onClick={() => toggleModule(m.key)}
                        style={{ fontSize: '13px', color: allOn ? '#036446' : '#1a1a18', fontWeight: allOn ? '500' : '400', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit' }}>
                        {m.label}
                      </button>
                      {ACTIONS_KEYS.map(ak => (
                        <div key={ak} style={{ display: 'flex', justifyContent: 'center' }}>
                          <input type="checkbox"
                            checked={!!permissions[m.key]?.[ak]}
                            onChange={() => togglePerm(m.key, ak)}
                            style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#036446' }} />
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>

              {error && (
                <div style={{ background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#dc2626', marginBottom: '14px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button onClick={() => setModal(false)}
                  style={{ fontSize: '12px', padding: '8px 16px', border: '0.5px solid #e5e5e3', borderRadius: '6px', background: 'transparent', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button onClick={handleSave} disabled={saving}
                  style={{ fontSize: '12px', padding: '8px 16px', background: saving ? '#e5e5e3' : '#036446', color: saving ? '#9b9b97' : 'white', border: 'none', borderRadius: '6px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: '500' }}>
                  {saving ? t('roles.saving') : editing ? t('roles.save_btn') : t('roles.create_btn')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
