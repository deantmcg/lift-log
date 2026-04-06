import { useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { constants } from '../data/constants';
import { uid, makeEntry, makeSet, fmtDate } from '../utils/helpers';

const STORAGE_KEY_SESSION = 'll_active_session';
const STORAGE_KEY_EXERCISES = 'll_active_exercises';

export function useWorkouts(allExercises) {
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSION);
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      // Only restore active (unfinished) sessions
      return parsed && !parsed.endTime ? parsed : null;
    } catch (e) { console.error('Failed to restore session from localStorage', e); return null; }
  });

  const [saving, setSaving] = useState(false);

  const [exercises, setExercises] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXERCISES);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { console.error('Failed to restore exercises from localStorage', e); return []; }
  });

  // Persist active session to localStorage whenever it changes
  useEffect(() => {
    if (session && !session.endTime) {
      localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY_SESSION);
    }
  }, [session]);

  // Persist active exercises to localStorage whenever they change
  useEffect(() => {
    if (session && !session.endTime) {
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
    } else {
      localStorage.removeItem(STORAGE_KEY_EXERCISES);
    }
  }, [exercises, session]);

  const startSession = (template) => {
    const now = Date.now();
    const name = template ? template.name + " · " + fmtDate() : "Workout · " + fmtDate();
    const s = { id:uid(), name, startTime:now, exercises:[] };
    let entries = [];
    if (template) {
      entries = template.exercises.map(te => {
        const ex = allExercises.find(e => e.id===te.exerciseId);
        if (!ex) return null;
        const entry = makeEntry(ex);
        entry.targetSets   = te.targetSets ?? te.targetsets ?? te.target_sets ?? 3;
        entry.targetReps   = te.targetReps ?? te.targetreps ?? te.target_reps ?? 10;
        
        const lw = ex.lastWeight ?? ex.lastweight ?? ex.last_weight;
        const tw = te.targetWeight ?? te.targetweight ?? te.target_weight;
        
        // Priority: History > Template > Default
        let w = constants.DEFAULT_TARGET_WEIGHT;
        if (lw !== undefined && lw !== null && Number(lw) > 0) {
          w = Number(lw);
        } else if (tw !== undefined && tw !== null && Number(tw) > 0) {
          w = Number(tw);
        }
        
        entry.targetWeight = w;
        entry.sets = Array.from({length: entry.targetSets}, () => makeSet(entry.targetReps, w));
        return entry;
      }).filter(Boolean);
    }
    setSession(s); 
    setExercises(entries);
  };

  const addExercise    = (ex) => setExercises(p=>[...p, makeEntry(ex)]);
  const updateExercise = (u)  => setExercises(p=>p.map(e=>e.entryId===u.entryId?u:e));
  const removeExercise = (id) => setExercises(p=>p.filter(e=>e.entryId!==id));
  const moveExercise   = (idx, dir) => setExercises(p => {
    const next = [...p];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return next;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    return next;
  });

  const finish = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const done = { ...session, exercises, endTime:Date.now() };
      setSession(done);
      localStorage.removeItem(STORAGE_KEY_SESSION);
      localStorage.removeItem(STORAGE_KEY_EXERCISES);
      await storage.saveSession(done);
      return done;
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setExercises([]);
    setSession(null);
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem(STORAGE_KEY_EXERCISES);
  };

  return { session, setSession, exercises, startSession, addExercise, updateExercise, removeExercise, moveExercise, finish, saving, cancel };
}

