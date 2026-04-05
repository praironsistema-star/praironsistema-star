'use client';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const CONTRACT_LABEL: Record<string, string> = {
  indefinido: 'Indefinido', fijo: 'Término fijo', obra: 'Obra/labor', jornal: 'Jornal',
};
const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  activo:      { bg: '#e8f5ef', text: '#036446' },
  inactivo:    { bg: '#f5f5f5', text: '#9b9b97' },
  vacaciones:  { bg: '#e6f1fb', text: '#185fa5' },
  incapacidad: { bg: '#fef3e2', text: '#b45309' },
};

const emptyWorker = { firstName: '', lastName: '', documentType: 'CC', documentId: '', phone: '', position: '', contractType: 'indefinido', salary: '', currency: 'COP', startDate: '' };

export default function RrhhPage() {
  const { t } = useI18n()
  const [tab, setTab]             = useState<'workers'|'attendance'|'payroll'>('workers');
  const [workers, setWorkers]     = useState<any[]>([]);
  const [payrolls, setPayrolls]   = useState<any[]>([]);
  const [summary, setSummary]     = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState(emptyWorker);
  const [editId, setEditId]       = useState<string|null>(null);
  const [saving, setSaving]       = useState(false);
  const [period, setPeriod]       = useState(new Date().toISOString().slice(0,7));
  const [attendance, setAttendance] = useState<any[]>([]);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  async function load() {
    setLoading(true);
    const [w, p, s, a] = await Promise.all([
      fetch(`${API}/rrhh/workers`, { headers }).then(r => r.json()),
      fetch(`${API}/rrhh/payrolls`, { headers }).then(r => r.json()),
      fetch(`${API}/rrhh/summary`, { headers }).then(r => r.json()),
      fetch(`${API}/rrhh/attendance?month=${period}`, { headers }).then(r => r.json()),
    ]);
    setWorkers(Array.isArray(w) ? w : []);
    setPayrolls(Array.isArray(p) ? p : []);
    setSummary(s);
    setAttendance(Array.isArray(a) ? a : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [period]);

  async function saveWorker() {
    setSaving(true);
    const url = editId ? `${API}/rrhh/workers/${editId}` : `${API}/rrhh/workers`;
    const method = editId ? 'PATCH' : 'POST';
    await fetch(url, { method, headers, body: JSON.stringify({ ...form, salary: parseFloat(form.salary), startDate: new Date(form.startDate).toISOString() }) });
    await load();
    setForm(emptyWorker);
    setEditId(null);
    setShowForm(false);
    setSaving(false);
  }

  async function generatePayroll() {
    setSaving(true);
    await fetch(`${API}/rrhh/payrolls/generate`, { method: 'POST', headers, body: JSON.stringify({ period }) });
    await load();
    setSaving(false);
  }

  async function markPaid(id: string) {
    await fetch(`${API}/rrhh/payrolls/${id}/pay`, { method: 'PATCH', headers });
    await load();
  }

  async function registerAttendance(workerId: string, status: string) {
    await fetch(`${API}/rrhh/attendance`, { method: 'POST', headers, body: JSON.stringify({ workerId, date: new Date().toISOString().slice(0,10), status, hoursWorked: status === 'presente' ? 8 : 0 }) });
    await load();
  }

  const inp = { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--color-text-primary)', fontSize: 14, width: '100%', boxSizing: 'border-box' as const };
  const lbl = { fontSize: 13, fontWeight: 500 as const, display: 'block' as const, marginBottom: 6 };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>{t('rrhh.title')}</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>{t('rrhh.subtitle')}</p>
      </div>

      {/* KPIs */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: t('rrhh.active_workers'), value: summary.totalWorkers, icon: '👷' },
            { label: t('rrhh.pending_payrolls'), value: summary.pendingPayrolls, icon: '📄' },
            { label: t('rrhh.total_payroll'), value: `$${(summary.totalNomina||0).toLocaleString('es-CO')}`, icon: '💰' },
          ].map(k => (
            <div key={k.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ fontSize: 24, marginBottom: 4 }}>{k.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)' }}>{k.value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
        {[["workers",`👷 ${t('rrhh.workers')}`],["attendance",`📋 ${t('rrhh.attendance')}`],["payroll",`💰 ${t('rrhh.payroll')}`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)} style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, borderBottom: tab===key ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab===key ? 'var(--color-primary)' : 'var(--color-text-secondary)', background: 'transparent' }}>{label}</button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--color-text-secondary)' }}>{t('common.loading')}</p>}

      {/* ── TRABAJADORES ── */}
      {!loading && tab === 'workers' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyWorker); }}
              style={{ padding: '8px 16px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              {showForm ? t('common.cancel') : `+ ${t('rrhh.new_worker')}`}
            </button>
          </div>

          {showForm && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 600 }}>{editId ? t('rrhh.workers') : t('rrhh.new_worker')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div><label style={lbl}>Nombre *</label><input value={form.firstName} onChange={e => setForm(f=>({...f,firstName:e.target.value}))} style={inp} placeholder="Nombre" /></div>
                <div><label style={lbl}>Apellido *</label><input value={form.lastName} onChange={e => setForm(f=>({...f,lastName:e.target.value}))} style={inp} placeholder="Apellido" /></div>
                <div><label style={lbl}>Tipo doc.</label>
                  <select value={form.documentType} onChange={e => setForm(f=>({...f,documentType:e.target.value}))} style={inp}>
                    {['CC','CE','PAS','RIF','CI'].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>N° documento *</label><input value={form.documentId} onChange={e => setForm(f=>({...f,documentId:e.target.value}))} style={inp} placeholder="123456789" /></div>
                <div><label style={lbl}>Cargo *</label><input value={form.position} onChange={e => setForm(f=>({...f,position:e.target.value}))} style={inp} placeholder="Jornalero, operario..." /></div>
                <div><label style={lbl}>Teléfono</label><input value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} style={inp} placeholder="+57 300..." /></div>
                <div><label style={lbl}>Tipo contrato</label>
                  <select value={form.contractType} onChange={e => setForm(f=>({...f,contractType:e.target.value}))} style={inp}>
                    {Object.entries(CONTRACT_LABEL).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Salario *</label><input value={form.salary} onChange={e => setForm(f=>({...f,salary:e.target.value}))} style={inp} type="number" placeholder="1300000" /></div>
                <div><label style={lbl}>Moneda</label>
                  <select value={form.currency} onChange={e => setForm(f=>({...f,currency:e.target.value}))} style={inp}>
                    {['COP','VES','USD'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div><label style={lbl}>Fecha inicio *</label><input value={form.startDate} onChange={e => setForm(f=>({...f,startDate:e.target.value}))} style={inp} type="date" /></div>
              </div>
              <button onClick={saveWorker} disabled={saving || !form.firstName || !form.documentId || !form.salary}
                style={{ marginTop: 16, padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                {saving ? t('common.saving') : editId ? t('common.save') : t('rrhh.new_worker')}
              </button>
            </div>
          )}

          {workers.length === 0 && !showForm && (
            <div style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>👷</div>
              <p style={{ color: 'var(--color-text-secondary)' }}>{t('rrhh.workers')} — {t('common.no_data')}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {workers.map(w => {
              const sc = STATUS_COLOR[w.status] ?? STATUS_COLOR.activo;
              return (
                <div key={w.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>
                      {w.firstName[0]}{w.lastName[0]}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{w.firstName} {w.lastName}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{w.position} · {CONTRACT_LABEL[w.contractType]} · {w.documentType} {w.documentId}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text-primary)' }}>${w.salary?.toLocaleString('es-CO')} {w.currency}</div>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: sc.bg, color: sc.text }}>{w.status}</span>
                    </div>
                    <button onClick={() => { setForm({ firstName: w.firstName, lastName: w.lastName, documentType: w.documentType, documentId: w.documentId, phone: w.phone||'', position: w.position, contractType: w.contractType, salary: w.salary, currency: w.currency, startDate: w.startDate?.slice(0,10) }); setEditId(w.id); setShowForm(true); }}
                      style={{ padding: '6px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 12 }}>✏️</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── ASISTENCIA ── */}
      {!loading && tab === 'attendance' && (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>Asistencia de hoy — {new Date().toLocaleDateString('es-CO')}</h3>
          </div>
          {workers.length === 0 && <p style={{ color: 'var(--color-text-secondary)' }}>Registra trabajadores primero.</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {workers.map(w => {
              const todayRecord = attendance.find(a => a.workerId === w.id && a.date?.slice(0,10) === new Date().toISOString().slice(0,10));
              return (
                <div key={w.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{w.firstName} {w.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{w.position}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {todayRecord ? (
                      <span style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: STATUS_COLOR[todayRecord.status]?.bg || '#f5f5f5', color: STATUS_COLOR[todayRecord.status]?.text || '#666' }}>
                        {todayRecord.status} · {todayRecord.hoursWorked}h
                      </span>
                    ) : (
                      <>
                        {['presente','ausente','permiso'].map(s => (
                          <button key={s} onClick={() => registerAttendance(w.id, s)}
                            style={{ padding: '5px 12px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            {s}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── NÓMINA ── */}
      {!loading && tab === 'payroll' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="month" value={period} onChange={e => setPeriod(e.target.value)} style={{ ...inp, width: 'auto' }} />
            </div>
            <button onClick={generatePayroll} disabled={saving}
              style={{ padding: '8px 16px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              {saving ? t('common.loading') : `⚡ ${t('rrhh.generate_payroll')}`}
            </button>
          </div>

          {payrolls.filter(p => p.period === period).length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>💰</div>
              <p>No hay nómina generada para {period}.</p>
              <p style={{ fontSize: 13 }}>Haz clic en "Generar nómina" para calcular automáticamente.</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {payrolls.filter(p => p.period === period).map(p => (
              <div key={p.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: '16px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>{p.worker?.firstName} {p.worker?.lastName}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                      Salario base: ${p.baseSalary?.toLocaleString('es-CO')} · 
                      Salud: -${p.healthDeduction?.toLocaleString('es-CO')} · 
                      Pensión: -${p.pensionDeduction?.toLocaleString('es-CO')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: p.status === 'pagado' ? '#036446' : 'var(--color-text-primary)' }}>
                      ${p.netPay?.toLocaleString('es-CO')} {p.currency}
                    </div>
                    {p.status === 'pendiente' ? (
                      <button onClick={() => markPaid(p.id)}
                        style={{ marginTop: 6, padding: '4px 12px', background: '#036446', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
                        Marcar pagado
                      </button>
                    ) : (
                      <span style={{ fontSize: 11, color: '#036446' }}>✅ Pagado {p.paidAt ? new Date(p.paidAt).toLocaleDateString('es-CO') : ''}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
