export const storage = {
  getSettings: async () => { const r = await fetch('/api/settings'); return r.json(); },
  saveSettings: async (s) => await fetch('/api/settings', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(s) }),
  
  getSessions: async () => { const r = await fetch('/api/sessions'); return r.json(); },
  saveSession: async (s) => await fetch('/api/sessions', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(s) }),
  
  getExercises: async () => { const r = await fetch('/api/exercises'); return r.json(); },
  saveCustomExercise: async (ex) => await fetch('/api/exercises', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(ex) }),
  
  // Note: /api/workouts returns ALL workouts. For custom only, we can filter or update backend. Let's filter here for safety.
  getUserTemplates: async () => { const r = await fetch('/api/workouts'); const ws = await r.json(); return ws.filter(w => w.isCustom); },
  saveUserTemplate: async (t) => await fetch('/api/workouts', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(t) }),
  deleteUserTemplate: async (id) => await fetch(`/api/workouts/${id}`, { method: 'DELETE' })
};
