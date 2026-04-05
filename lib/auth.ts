import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  org_id: string;
  role: string;
  companyName: string;
  companyId: string;
  roleId: string;
  roleName: string;
  industryType: string;
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

export function getRole(): string {
  return getUser()?.roleName?.toLowerCase() || '';
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const user = data.user;
  const session = data.session;
  localStorage.setItem('prairon_token', session.access_token);
  localStorage.setItem('prairon_user', JSON.stringify({
    id: user.id,
    email: user.email,
    name: user.user_metadata?.full_name || email,
    org_id: '',
    role: 'owner',
    companyName: '',
    companyId: '',
    roleId: '',
    roleName: 'dueño',
    industryType: 'MIXTO',
  }));
  return user;
}

export async function register(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } }
  });
  if (error) throw new Error(error.message);
  return data.user;
}

export function logout() {
  supabase.auth.signOut();
  localStorage.removeItem('prairon_token');
  localStorage.removeItem('prairon_user');
  window.location.href = '/login';
}
