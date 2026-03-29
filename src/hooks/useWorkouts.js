import { useState } from 'react';
import { storage } from '../services/storage';
import { constants } from '../data/constants';
import { uid, makeEntry, makeSet, fmtDate } from '../utils/helpers';

export function useWorkouts(allExercises) {
  const [session, setSession] = useState(null);
  const [exercises, setExercises] = useState([]);
  
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
    const done = { ...session, exercises, endTime:Date.now() };
    setSession(done);
    await storage.saveSession(done);
    return done;
  };

  const cancel = () => {
    setExercises([]);
    setSession(null);
  };

  return { session, setSession, exercises, startSession, addExercise, updateExercise, removeExercise, moveExercise, finish, cancel };
}
