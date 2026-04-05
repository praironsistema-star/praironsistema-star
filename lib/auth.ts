export interface UserProfile {
  id: string;
  email: string;
  name: string;
  companyId: string;
  companyName: string;
  roleId: string;
  roleName: string;
  industryModules: string[];
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('prairon_token');
}

export function getUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('prairon_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('prairon_token');
}

export function getRole(): string {
  return getUser()?.roleName?.toLowerCase() || '';
}

export function hasModule(module: string): boolean {
  const user = getUser();
  if (!user) return false;
  if (user.industryModules.includes('MIXTO')) return true;
  return user.industryModules.includes(module);
}

export function logout() {
  localStorage.removeItem('prairon_token');
  localStorage.removeItem('prairon_user');
  window.location.href = '/login';
}

export async function login(email: string, password: string) {
  const res = await fetch(
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001') + '/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }
  );
  if (!res.ok) throw new Error('Credenciales incorrectas');
  const data = await res.json();
  localStorage.setItem('prairon_token', data.access_token);
  localStorage.setItem('prairon_user', JSON.stringify(data.user));
  return data.user;
}
