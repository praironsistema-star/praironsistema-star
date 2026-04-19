'use client';
import { useI18n } from '@/lib/i18n';
import { useEffect, useState } from 'react';

const TYPE_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  obligatoria: { bg: '#fef2f2', text: '#dc2626', label: 'Obligatoria' },
  voluntaria:  { bg: '#fef3e2', text: '#b45309', label: 'Voluntaria' },
  exportacion: { bg: '#e6f1fb', text: '#185fa5', label: 'Exportación' },
  premium:     { bg: '#ede9fe', text: '#6d28d9', label: 'Premium' },
  organica:    { bg: '#e8f5ef', text: '#036446', label: 'Orgánica' },
};

const COUNTRY_FLAG: Record<string, string> = { CO: '🇨🇴', VE: '🇻🇪', INT: '🌍' };

export default function CertificacionesPage() {
  const { t } = useI18n()
  const [certs, setCerts]         = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [tab, setTab]             = useState<'catalogo' | 'mis'>('catalogo');
  const [selected, setSelected]   = useState<any>(null);
  const [loading, setLoading]     = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  async function load() {
    setLoading(true);
    const [c, e] = await Promise.all([
      fetch(`${API}/certifications`, { headers }).then(r => r.json()),
      fetch(`${API}/certifications/my`, { headers }).then(r => r.json()),
    ]);
    setCerts(Array.isArray(c) ? c : []);
    setEnrollments(Array.isArray(e) ? e : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function seedAndLoad() {
    await fetch(`${API}/certifications/seed`, { method: 'POST', headers });
    await load();
  }

  async function enroll(certificationId: string) {
    setEnrolling(certificationId);
    await fetch(`${API}/certifications/enroll/${certificationId}`, { method: 'POST', headers });
    await load();
    setEnrolling(null);
    setTab('mis');
  }

  async function toggleStep(enrollmentId: string, stepId: string, completed: boolean) {
    await fetch(`${API}/certifications/progress/${enrollmentId}/${stepId}`, {
      method: 'PATCH', headers,
      body: JSON.stringify({ completed: !completed }),
    });
    await load();
  }

  function getEnrollment(certId: string) {
    return enrollments.find(e => e.certificationId === certId);
  }

  function getProgress(enrollment: any) {
    if (!enrollment?.progress) return 0;
    const total = enrollment.progress.length;
    const done = enrollment.progress.filter((p: any) => p.completed).length;
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  const s = { input: { width: '100%', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-secondary)', color: 'var(--color-text-primary)', fontSize: 14, boxSizing: 'border-box' as const } };

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>🏅 Certificaciones</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: 4, fontSize: 14 }}>Colombia & Venezuela — Guía paso a paso hacia cada sello</p>
        </div>
        {certs.length === 0 && !loading && (
          <button onClick={seedAndLoad} style={{ padding: '8px 16px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Cargar catálogo
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-color)' }}>
        {[['catalogo', '📋 Catálogo'], ['mis', `🎯 Mis certificaciones ${enrollments.length > 0 ? `(${enrollments.length})` : ''}`]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key as any)} style={{ padding: '8px 16px', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, borderBottom: tab === key ? '2px solid var(--color-primary)' : '2px solid transparent', color: tab === key ? 'var(--color-primary)' : 'var(--color-text-secondary)', background: 'transparent' }}>{label}</button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--color-text-secondary)' }}>Cargando...</p>}

      {/* ── CATÁLOGO ── */}
      {!loading && tab === 'catalogo' && (
        <div>
          {certs.length === 0 && (
            <div style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🏅</div>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>No hay certificaciones cargadas aún.</p>
              <button onClick={seedAndLoad} style={{ padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Cargar catálogo de certificaciones
              </button>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {certs.map(cert => {
              const enrollment = getEnrollment(cert.id);
              const progress = enrollment ? getProgress(enrollment) : 0;
              const tc = TYPE_COLOR[cert.type] ?? TYPE_COLOR.voluntaria;
              return (
                <div key={cert.id} style={{ background: 'var(--bg-card)', border: `1px solid ${selected?.id === cert.id ? 'var(--color-primary)' : 'var(--border-color)'}`, borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => setSelected(selected?.id === cert.id ? null : cert)}>
                  {/* Card header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--color-text-primary)', flex: 1, paddingRight: 8 }}>{cert.name}</div>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: tc.bg, color: tc.text, flexShrink: 0 }}>{tc.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {cert.countries?.map((c: string) => <span key={c} style={{ fontSize: 12 }}>{COUNTRY_FLAG[c] ?? c}</span>)}
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>· {cert.duration} · <strong style={{ color: '#036446' }}>{cert.priceImpact}</strong></span>
                    </div>
                  </div>
                  {/* Card body */}
                  <div style={{ padding: '14px 20px' }}>
                    <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.6, margin: '0 0 12px' }}>{cert.description}</p>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                      {cert.steps?.length} pasos · {cert.steps?.filter((s: any) => s.isRequired).length} obligatorios
                    </div>
                    {/* Progress bar si está enrolado */}
                    {enrollment && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: 'var(--color-text-secondary)' }}>Progreso</span>
                          <span style={{ fontWeight: 600, color: progress === 100 ? '#036446' : 'var(--color-text-primary)' }}>{progress}%</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--border-color)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#036446' : 'var(--color-primary)', borderRadius: 3, transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); enrollment ? setTab('mis') : enroll(cert.id); }}
                      disabled={enrolling === cert.id}
                      style={{ width: '100%', padding: '8px', border: enrollment ? '1px solid var(--color-primary)' : 'none', borderRadius: 8, background: enrollment ? 'transparent' : 'var(--color-primary)', color: enrollment ? 'var(--color-primary)' : '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      {enrolling === cert.id ? 'Activando...' : enrollment ? `Ver progreso (${progress}%)` : 'Iniciar certificación →'}
                    </button>
                  </div>
                  {/* Pasos expandidos */}
                  {selected?.id === cert.id && (
                    <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 20px', background: 'var(--bg-secondary)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Pasos del proceso:</div>
                      {cert.steps?.map((step: any, i: number) => (
                        <div key={step.id} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{i + 1}</div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>{step.title}</div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{step.description}</div>
                            {step.tips && <div style={{ fontSize: 11, color: '#036446', marginTop: 4, padding: '4px 8px', background: '#e8f5ef', borderRadius: 6 }}>💡 {step.tips}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MIS CERTIFICACIONES ── */}
      {!loading && tab === 'mis' && (
        <div>
          {enrollments.length === 0 && (
            <div style={{ textAlign: 'center', padding: 64 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 16 }}>No has iniciado ninguna certificación aún.</p>
              <button onClick={() => setTab('catalogo')} style={{ padding: '10px 20px', background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Ver catálogo →</button>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {enrollments.map(enrollment => {
              const cert = enrollment.certification;
              const progress = getProgress(enrollment);
              const tc = TYPE_COLOR[cert.type] ?? TYPE_COLOR.voluntaria;
              return (
                <div key={enrollment.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 14, overflow: 'hidden' }}>
                  {/* Header */}
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)' }}>{cert.name}</span>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: tc.bg, color: tc.text }}>{tc.label}</span>
                        <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: enrollment.status === 'completado' ? '#e8f5ef' : '#fef3e2', color: enrollment.status === 'completado' ? '#036446' : '#b45309' }}>
                          {enrollment.status === 'completado' ? '✅ Completado' : '🔄 En progreso'}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                        Iniciado: {new Date(enrollment.startedAt).toLocaleDateString('es-CO')} · {cert.duration}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 28, fontWeight: 700, color: progress === 100 ? '#036446' : 'var(--color-primary)' }}>{progress}%</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>completado</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: 'var(--border-color)' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: progress === 100 ? '#036446' : 'var(--color-primary)', transition: 'width 0.3s' }} />
                  </div>
                  {/* Steps checklist */}
                  <div style={{ padding: '20px 24px' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: 'var(--color-text-primary)' }}>Pasos del proceso</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {cert.steps?.map((step: any) => {
                        const stepProgress = enrollment.progress?.find((p: any) => p.stepId === step.id);
                        const done = stepProgress?.completed ?? false;
                        return (
                          <div key={step.id} style={{ display: 'flex', gap: 12, padding: '12px 16px', background: done ? '#e8f5ef' : 'var(--bg-secondary)', borderRadius: 10, border: `1px solid ${done ? '#6ee7b7' : 'var(--border-color)'}`, alignItems: 'flex-start' }}>
                            <button onClick={() => toggleStep(enrollment.id, step.id, done)}
                              style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${done ? '#036446' : 'var(--border-color)'}`, background: done ? '#036446' : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                              {done && <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>}
                            </button>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: done ? '#036446' : 'var(--color-text-primary)', textDecoration: done ? 'line-through' : 'none' }}>
                                  Paso {step.order}: {step.title}
                                </div>
                                {!step.isRequired && <span style={{ fontSize: 10, padding: '2px 6px', background: '#fef3e2', color: '#b45309', borderRadius: 10 }}>Opcional</span>}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 3, lineHeight: 1.5 }}>{step.description}</div>
                              {step.documents?.length > 0 && (
                                <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                  {step.documents.map((doc: string) => (
                                    <span key={doc} style={{ fontSize: 10, padding: '2px 8px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 10, color: 'var(--color-text-secondary)' }}>📄 {doc}</span>
                                  ))}
                                </div>
                              )}
                              {step.tips && <div style={{ fontSize: 11, color: '#036446', marginTop: 6, padding: '4px 8px', background: done ? 'rgba(255,255,255,0.5)' : '#e8f5ef', borderRadius: 6 }}>💡 {step.tips}</div>}
                              {done && stepProgress?.completedAt && (
                                <div style={{ fontSize: 11, color: '#036446', marginTop: 4 }}>
                                  ✅ Completado el {new Date(stepProgress.completedAt).toLocaleDateString('es-CO')}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
