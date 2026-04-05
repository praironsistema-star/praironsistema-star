import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
});

// ─── REQUEST: adjunta el token en cada llamada ───────────────────────────────
api.interceptors.request.use((config) => {
  // Solo leemos localStorage si estamos en el browser, no en el servidor (SSR)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('prairon_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── RESPONSE: maneja errores globales ───────────────────────────────────────
api.interceptors.response.use(
  // Respuesta exitosa: la dejamos pasar sin tocar nada
  (res) => res,

  // Error: entramos aquí
  (err) => {
    const status = err.response?.status;

    // 401 significa que el token expiró o es inválido
    if (status === 401 && typeof window !== 'undefined' && !localStorage.getItem('sb-mgucyxevyyddrpfxxfni-auth-token')) {
      // Páginas públicas donde NO debemos redirigir (evita loops)
      const paginasPublicas = ['/login', '/register', '/forgot-password', '/reset-password'];
      const estaEnPaginaPublica = paginasPublicas.some((p) =>
        window.location.pathname.startsWith(p)
      );

      if (!estaEnPaginaPublica) {
        // Borramos el token inválido
        localStorage.removeItem('prairon_token');

        // Lanzamos un evento para que ToastProvider muestre el mensaje
        // (no podemos llamar toast() directamente desde aquí porque no es React)
        window.dispatchEvent(
          new CustomEvent('prairon:toast', {
            detail: {
              type: 'warning',
              message: 'Tu sesión expiró. Por favor inicia sesión de nuevo.',
            },
          })
        );

        // Esperamos 1.5s para que el usuario vea el mensaje antes de redirigir
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }

    // Propagamos el error para que cada módulo lo maneje si quiere
    return Promise.reject(err);
  }
);

export default api;
