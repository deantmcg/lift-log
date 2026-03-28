const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('ll_token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('ll_token');
    window.location.reload(); 
  }
  return res;
};

export const storage = {
  login: async (username, password) => {
    const r = await fetch('/api/login', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({username, password}) });
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
  
  getUserTemplates: async () => { const r = await authFetch('/api/workouts'); const ws = await r.json(); return ws.filter(w => w.isCustom); },
  saveUserTemplate: async (t) => await authFetch('/api/workouts', { method: 'POST', body: JSON.stringify(t) }),
  deleteUserTemplate: async (id) => await authFetch(`/api/workouts/${id}`, { method: 'DELETE' })
};
