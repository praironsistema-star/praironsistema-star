'use client';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const SEVERITY_COLOR: Record<string, string> = {
  leve:     '#22c55e',
  moderado: '#f59e0b',
  severo:   '#ef4444',
  critico:  '#7c3aed',
};

const TYPE_EMOJI: Record<string, string> = {
  insecto:   '🪲',
  hongo:     '🍄',
  bacteria:  '🦠',
  virus:     '🧬',
  nematodo:  '🪱',
  maleza:    '🌿',
  otro:      '⚠️',
};

export default function FitosanitarioPage() {
  const { t } = useI18n()
  const [pests, setPests]           = useState<any[]>([]);
  const [diagnostics, setDiagnostics] = useState<any[]>([]);
  const [tab, setTab]               = useState<'pests' | 'diagnostics' | 'new'>('pests');
  const [selected, setSelected]     = useState<any>(null);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState({ symptoms: '', location: '', affectedArea: '', severity: 'moderado', pestId: '' });
  const [saving, setSaving]         = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    Promise.all([
      fetch(`${API}/phytosanitary/pests`, { headers }).then(r => r.json()),
      fetch(`${API}/phytosanitary/diagnostics`, { headers }).then(r => r.json()),
    ]).then(([p, d]) => { setPests(Array.isArray(p) ? p : []); setDiagnostics(Array.isArray(d) ? d : []); setLoading(false); });
  }, []);

  async function submitDiagnostic() {
    setSaving(true);
    await fetch(`${API}/phytosanitary/diagnostics`, { method: 'POST', headers, body: JSON.stringify({ ...form, date: new Date().toISOString() }) });
    const d = await fetch(`${API}/phytosanitary/diagnostics`, { headers }).then(r => r.json());
    setDiagnostics(Array.isArray(d) ? d : []);
    setForm({ symptoms: '', location: '', affectedArea: '', severity: 'moderado', pestId: '' });
    setTab('diagnostics');
    setSaving(false);
  }

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>🔬 Fitosanitario</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>
          Base de plagas, enfermedades y diagnósticos — filtrado por tu industria
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)', paddingBottom: 0 }}>
        {[['pests','🪲 Plagas & Enfermedades'],['diagnostics','📋 Diagnósticos'],['new','+ Nuevo diagnóstico']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)} style={{
            padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
            borderBottom: tab === key ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: tab === key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            background: 'transparent',
          }}>{label}</button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--color-text-secondary)' }}>Cargando...</p>}

      {/* PLAGAS */}
      {!loading && tab === 'pests' && (
        <div>
          {pests.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🌱</div>
              <p>No hay plagas registradas para tu industria aún.</p>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {pests.map(pest => (
              <div key={pest.id} onClick={() => setSelected(selected?.id === pest.id ? null : pest)}
                style={{ background: 'var(--bg-card)', border: `1px solid ${selected?.id === pest.id ? 'var(--color-primary)' : 'var(--border-color)'}`,
                  borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{TYPE_EMOJI[pest.type] ?? '⚠️'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--color-text-primary)' }}>{pest.name}</div>
                    {pest.scientificName && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>{pest.scientificName}</div>}
                  </div>
                  <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                    background: SEVERITY_COLOR[pest.severity] + '22', color: SEVERITY_COLOR[pest.severity] }}>
                    {pest.severity}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 8px', lineHeight: 1.5 }}>{pest.symptoms}</p>
                {pest.affectedPart && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Afecta: <strong>{pest.affectedPart}</strong></div>}
                {selected?.id === pest.id && pest.treatments?.length > 0 && (
                  <div style={{ marginTop: 12, borderTop: '1px solid var(--border-color)', paddingTop: 12 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--color-text-primary)' }}>Tratamientos:</div>
                    {pest.treatments.map((t: any) => (
                      <div key={t.id} style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4, padding: '6px 8px',
                        background: 'var(--bg-secondary)', borderRadius: 6 }}>
                        <strong>{t.method}</strong>{t.product ? ` — ${t.product}` : ''}{t.dose ? ` (${t.dose})` : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DIAGNÓSTICOS */}
      {!loading && tab === 'diagnostics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {diagnostics.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-secondary)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
              <p>No hay diagnósticos registrados.</p>
              <button onClick={() => setTab('new')} style={{ marginTop: 8, padding: '8px 16px', background: 'var(--color-primary)',
                color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                Registrar diagnóstico
              </button>
            </div>
          )}
          {diagnostics.map(d => (
            <div key={d.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 16,
              display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 24 }}>🔍</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>
                    {d.pest?.name ?? 'Plaga no identificada'}
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: SEVERITY_COLOR[d.severity] + '22', color: SEVERITY_COLOR[d.severity] }}>
                    {d.severity ?? 'sin severidad'}
                  </span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20,
                    background: d.status === 'cerrado' ? '#22c55e22' : '#f59e0b22',
                    color: d.status === 'cerrado' ? '#22c55e' : '#f59e0b', marginLeft: 'auto' }}>
                    {d.status}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', margin: '0 0 4px' }}>{d.symptoms}</p>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                  {d.location && <span>�� {d.location} · </span>}
                  {d.affectedArea && <span>📐 {d.affectedArea} ha · </span>}
                  <span>🗓 {new Date(d.date || d.createdAt).toLocaleDateString('es-CO')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NUEVO DIAGNÓSTICO */}
      {tab === 'new' && (
        <div style={{ maxWidth: 600, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: 24 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Registrar diagnóstico</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Plaga identificada (opcional)</label>
              <select value={form.pestId} onChange={e => setForm(f => ({ ...f, pestId: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8,
                  background: 'var(--bg-secondary)', color: 'var(--color-text-primary)', fontSize: 14 }}>
                <option value=''>Sin identificar</option>
                {pests.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Síntomas observados *</label>
              <textarea value={form.symptoms} onChange={e => setForm(f => ({ ...f, symptoms: e.target.value }))} rows={3}
                placeholder='Describe los síntomas observados...'
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8,
                  background: 'var(--bg-secondary)', color: 'var(--color-text-primary)', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Ubicación</label>
                <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder='Lote, parcela, galpón...'
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8,
                    background: 'var(--bg-secondary)', color: 'var(--color-text-primary)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Área afectada (ha)</label>
                <input value={form.affectedArea} onChange={e => setForm(f => ({ ...f, affectedArea: e.target.value }))}
                  type='number' placeholder='0.0'
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8,
                    background: 'var(--bg-secondary)', color: 'var(--color-text-primary)', fontSize: 14, boxSizing: 'border-box' }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Severidad</label>
              <select value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}
                style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8,
                  background: 'var(--bg-secondary)', color: 'var(--color-text-primary)', fontSize: 14 }}>
                <option value='leve'>Leve</option>
                <option value='moderado'>Moderado</option>
                <option value='severo'>Severo</option>
                <option value='critico'>Crítico</option>
              </select>
            </div>
            <button onClick={submitDiagnostic} disabled={saving || !form.symptoms}
              style={{ padding: '10px 20px', background: form.symptoms ? 'var(--color-primary)' : '#ccc',
                color: '#fff', border: 'none', borderRadius: 8, cursor: form.symptoms ? 'pointer' : 'not-allowed',
                fontSize: 14, fontWeight: 600 }}>
              {saving ? 'Guardando...' : 'Guardar diagnóstico'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
