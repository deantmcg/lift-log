import { useState } from 'react';
import { storage } from '../services/storage';
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
        entry.targetSets   = te.targetSets;
        entry.targetReps   = te.targetReps;
        entry.targetWeight = te.targetWeight;
        entry.sets = Array.from({length: te.targetSets}, () => makeSet(te.targetReps, te.targetWeight));
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
