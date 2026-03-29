const API_BASE = import.meta.env.VITE_API_URL || '';

const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('ll_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(API_BASE + url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('ll_token');
    window.location.reload(); 
  }
  return res;
};

export const storage = {
  login: async (username, password) => {
    const r = await fetch(API_BASE + '/api/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username, password}) });
    const data = await r.json();
    if (data.success) {
      localStorage.setItem('ll_token', data.token);
      return data;
    }
    throw new Error(data.error || 'Login failed');
  },
  
  logout: () => {
    localStorage.removeItem('ll_token');
    window.location.reload();
  },

  getSettings: async () => { const r = await authFetch('/api/settings'); return r.json(); },
  saveSettings: async (s) => await authFetch('/api/settings', { method: 'PUT', body: JSON.stringify(s) }),
  
  getSessions: async () => { const r = await authFetch('/api/sessions'); return r.json(); },
  saveSession: async (s) => await authFetch('/api/sessions', { method: 'POST', body: JSON.stringify(s) }),
  
  getExercises: async () => { const r = await authFetch('/api/exercises'); return r.json(); },
  saveCustomExercise: async (ex) => await authFetch('/api/exercises', { method: 'POST', body: JSON.stringify(ex) }),
  
  getUserTemplates: async () => { const r = await authFetch('/api/workouts'); return r.json(); },
  saveUserTemplate: async (t) => {
    const method = t.id ? 'PUT' : 'POST';
    const url = t.id ? `/api/workouts/${t.id}` : '/api/workouts';
    const r = await authFetch(url, { method, body: JSON.stringify(t) });
    return r.json();
  },
  deleteUserTemplate: async (id) => await authFetch(`/api/workouts/${id}`, { method: 'DELETE' }),

  deleteSession: async (id) => await authFetch(`/api/sessions/${id}`, { method: 'DELETE' }),

  adminUpdateExercise: async (id, data) => { const r = await authFetch(`/api/admin/exercises/${id}`, { method: 'PUT', body: JSON.stringify(data) }); if (!r.ok) { const e = await r.json(); throw new Error(e.error); } return r.json(); },
  adminCreateExercise: async (data) => { const r = await authFetch('/api/admin/exercises', { method: 'POST', body: JSON.stringify(data) }); if (!r.ok) { const e = await r.json(); throw new Error(e.error); } return r.json(); },
  adminDeleteExercise: async (id) => await authFetch(`/api/admin/exercises/${id}`, { method: 'DELETE' }),
};
