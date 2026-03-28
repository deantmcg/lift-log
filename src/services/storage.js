import { EXERCISES_JSON } from '../data/exercises';

export const storage = {
  getSettings: () => { try { return JSON.parse(localStorage.getItem("ll_settings")) || { theme: "green", defaultRest: 120, showTimer: true }; } catch { return { theme: "green", defaultRest: 120, showTimer: true }; } },
  saveSettings: (s) => localStorage.setItem("ll_settings", JSON.stringify(s)),
  getSessions: () => { try { return JSON.parse(localStorage.getItem("ll_sessions") || "[]"); } catch { return []; } },
  saveSession: (s) => { const all = storage.getSessions().filter(x => x.id !== s.id); localStorage.setItem("ll_sessions", JSON.stringify([...all, s])); },
  getExercises: () => {
    const custom = (() => { try { return JSON.parse(localStorage.getItem("ll_custom_exercises") || "[]"); } catch { return []; } })();
    return [...EXERCISES_JSON, ...custom];
  },
  saveCustomExercise: (ex) => {
    const cur = (() => { try { return JSON.parse(localStorage.getItem("ll_custom_exercises") || "[]"); } catch { return []; } })();
    localStorage.setItem("ll_custom_exercises", JSON.stringify([...cur, ex]));
  },
  getUserTemplates: () => { try { return JSON.parse(localStorage.getItem("ll_user_templates") || "[]"); } catch { return []; } },
  saveUserTemplate: (t) => {
    const all = storage.getUserTemplates().filter(x => x.id !== t.id);
    localStorage.setItem("ll_user_templates", JSON.stringify([...all, t]));
  },
  deleteUserTemplate: (id) => {
    const all = storage.getUserTemplates().filter(x => x.id !== id);
    localStorage.setItem("ll_user_templates", JSON.stringify(all));
  },
};
