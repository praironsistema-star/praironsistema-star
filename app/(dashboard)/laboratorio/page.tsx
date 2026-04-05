'use client';
import { useEffect, useState } from 'react';

const TEST_TYPES = [
  { value: 'suelo', label: '🌱 Suelo', desc: 'pH, materia orgánica, nutrientes', industries: ['AGRICOLA','PALMA','GANADERO','MIXTO'] },
  { value: 'foliar', label: '🍃 Foliar', desc: 'Análisis de tejido vegetal', industries: ['AGRICOLA','PALMA','MIXTO'] },
  { value: 'agua', label: '💧 Agua', desc: 'Calidad, pH, contaminantes', industries: ['AGRICOLA','PALMA','GANADERO','AVICOLA','MIXTO'] },
  { value: 'aceite', label: '🫙 Aceite', desc: 'Acidez, humedad, impurezas', industries: ['PALMA'] },
  { value: 'genetico', label: '🧬 Genético', desc: 'Trazabilidad genética animal', industries: ['GANADERO','AVICOLA','MIXTO'] },
  { value: 'microbiologico', label: '🦠 Microbiológico', desc: 'Bacterias, hongos, patógenos', industries: ['AVICOLA','GANADERO','MIXTO'] },
];

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  normal:  { bg: '#e8f5ef', text: '#036446' },
  alto:    { bg: '#fef3e2', text: '#b45309' },
  critico: { bg: '#fef2f2', text: '#dc2626' },
};

const empty = { type: 'suelo', date: new Date().toISOString().slice(0,10), laboratory: '', result: '', interpretation: '', notes: '' };

export default function LaboratorioPage() {
  const [tests, setTests]     = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [tab, setTab]         = useState<'tests'|'new'>('tests');
  const [form, setForm]       = useState(empty);
  const [editId, setEditId]   = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [filter, setFilter]   = useState('todos');

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  async function load() {
    setLoading(true);
    const [t, s] = await Promise.all([
      fetch(`${API}/laboratory`, { headers }).then(r => r.json()),
      fetch(`${API}/laboratory/summary`, { headers }).then(r => r.json()),
    ]);
    setTests(Array.isArray(t) ? t : []);
    setSummary(s);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function save() {
    setSaving(true);
    const resultJson = form.result ? { value: form.result } : null;
    const url = editId ? `${API}/laboratory/${editId}` : `${API}/laboratory`;
    const method = editId ? 'PATCH' : 'POST';
    await fetch(url, { method, headers, body: JSON.stringify({ ...form, result: resultJson, date: new Date(form.date).toISOString() }) });
    await load();
    setForm(empty);
    setEditId(null);
    setTab('tests');
    setSaving(false);
  }

  async function remove(id: string) {
    if (!confirm('¿Eliminar este análisis?')) return;
    await fetch(`${API}/laboratory/${id}`, { method: 'DELETE', headers });
    await load();
  }

  const filtered = filter === 'todos' ? tests : tests.filter(t => t.type === filter);
  const inp = { padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--color-text-primary)', fontSize: 14, width: '100%', boxSizing: 'border-box' as const };
  const lbl = { fontSize: 13, fontWeight: 500 as const, display: 'block' as const, marginBottom: 6 };

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>🔬 Agrolab</h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>Análisis de suelo, agua, foliar y más — trazabilidad completa</p>
      </div>

      {/* KPIs */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '16px 20px' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>🧪</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{summary.total}</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Análisis totales</div>
          </div>
          {Object.entries(summary.byType || {}).map(([type, count]: any) => {
            const tt = TEST_TYPES.find(t => t.value === type);
            return (
              <div key={type} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '16px 20px' }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>{tt?.label.split(' ')[0] || '🧪'}</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{count}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{tt?.label.split(' ').slice(1).join(' ') || type}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 8, borderBottom: '1px solid var(--border-color)' }}>
          {[['tests','📋 Análisis'],['new', editId ? '✏️ Editar' : '➕ Nuevo análisis']].map(([key,label]) => (
            <button key={key} onClick={() => { setTab(key as any); if (key==='tests') { setEditId(null); setForm(empty); } }}
              style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, borderBottom: tab===key ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab===key ? 'var(--color-primary)' : 'var(--color-text-secondary)', background: 'transparent' }}>{label}</button>
          ))}
        </div>
        {tab === 'tests' && (
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ ...inp, width: 'auto' }}>
            <option value="todos">Todos los tipos</option>
            {TEST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        )}
      </div>

      {loading && <p style={{ color: 'var(--color-text-secondary)' }}>Cargando...</p>}

      {/* ── LISTA ── */}
      {!loading && tab === 'tests' && (
        <div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🧪</div>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>No hay análisis registrados aún.</p>
              <button onClick={() => setTab('new')} style={{ padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Registrar primer análisis
              </button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(test => {
              const tt = TEST_TYPES.find(t => t.value === test.type);
              const resultVal = test.result?.value || '';
              return (
                <div key={test.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 12, padding: '18px 22px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flex: 1 }}>
                      <span style={{ fontSize: 28 }}>{tt?.label.split(' ')[0] || '🧪'}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>{tt?.label.split(' ').slice(1).join(' ') || test.type}</span>
                          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--bg-secondary)', color: 'var(--color-text-secondary)' }}>
                            {new Date(test.date).toLocaleDateString('es-CO')}
                          </span>
                          {test.laboratory && <span style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>· {test.laboratory}</span>}
                        </div>
                        {resultVal && <div style={{ fontSize: 13, color: 'var(--color-text-primary)', marginBottom: 4 }}>Resultado: <strong>{resultVal}</strong></div>}
                        {test.interpretation && (
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '6px 10px', background: 'var(--bg-secondary)', borderRadius: 6, marginTop: 4 }}>
                            💡 {test.interpretation}
                          </div>
                        )}
                        {test.notes && <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>📝 {test.notes}</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      <button onClick={() => { setForm({ type: test.type, date: test.date?.slice(0,10), laboratory: test.laboratory||'', result: test.result?.value||'', interpretation: test.interpretation||'', notes: test.notes||'' }); setEditId(test.id); setTab('new'); }}
                        style={{ padding: '5px 10px', border: '1px solid var(--border-color)', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 12 }}>✏️</button>
                      <button onClick={() => remove(test.id)}
                        style={{ padding: '5px 10px', border: '1px solid #fecaca', borderRadius: 6, background: 'transparent', cursor: 'pointer', fontSize: 12, color: '#dc2626' }}>🗑️</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── FORMULARIO ── */}
      {tab === 'new' && (
        <div style={{ maxWidth: 680, background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, padding: 28 }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 16, fontWeight: 700 }}>{editId ? 'Editar análisis' : 'Nuevo análisis de laboratorio'}</h3>

          {/* Selector de tipo */}
          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Tipo de análisis *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {TEST_TYPES.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({ ...f, type: t.value }))}
                  style={{ padding: '10px 12px', border: `1.5px solid ${form.type===t.value ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: 10, background: form.type===t.value ? 'var(--color-primary)10' : 'transparent', cursor: 'pointer', textAlign: 'left' as const }}>
                  <div style={{ fontSize: 18, marginBottom: 2 }}>{t.label.split(' ')[0]}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: form.type===t.value ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>{t.label.split(' ').slice(1).join(' ')}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)', marginTop: 2 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={lbl}>Fecha del análisis *</label>
              <input type="date" value={form.date} onChange={e => setForm(f=>({...f,date:e.target.value}))} style={inp} />
            </div>
            <div>
              <label style={lbl}>Laboratorio</label>
              <input value={form.laboratory} onChange={e => setForm(f=>({...f,laboratory:e.target.value}))} placeholder="Nombre del laboratorio" style={inp} />
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Resultado</label>
            <textarea value={form.result} onChange={e => setForm(f=>({...f,result:e.target.value}))} rows={3}
              placeholder="pH: 6.2, MO: 3.5%, N: 45 ppm, P: 23 ppm..."
              style={{ ...inp, resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={lbl}>Interpretación / Recomendación</label>
            <textarea value={form.interpretation} onChange={e => setForm(f=>({...f,interpretation:e.target.value}))} rows={3}
              placeholder="El suelo presenta acidez moderada. Se recomienda encalar con 2 ton/ha..."
              style={{ ...inp, resize: 'vertical' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={lbl}>Notas adicionales</label>
            <textarea value={form.notes} onChange={e => setForm(f=>({...f,notes:e.target.value}))} rows={2}
              placeholder="Muestra tomada en lote 3, parcela norte..."
              style={{ ...inp, resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={save} disabled={saving || !form.date}
              style={{ flex: 1, padding: '10px 20px', background: form.date ? 'var(--color-primary)' : '#ccc', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              {saving ? 'Guardando...' : editId ? 'Guardar cambios' : 'Registrar análisis'}
            </button>
            {editId && <button onClick={() => { setEditId(null); setForm(empty); setTab('tests'); }}
              style={{ padding: '10px 16px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'transparent', cursor: 'pointer', fontSize: 14 }}>
              Cancelar
            </button>}
          </div>
        </div>
      )}
    </div>
  );
}
