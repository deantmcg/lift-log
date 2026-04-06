import { constants } from '../data/constants';

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
export const pad = (n) => (n < 10 ? "0" + n : String(n));
export const fmtMs = (ms) => { const s = Math.floor(Math.abs(ms) / 1000); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
export const fmtDate = (d = new Date()) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export const makeSet = (reps, weight) => ({ id: uid(), reps, weight: weight !== undefined ? weight : constants.DEFAULT_TARGET_WEIGHT, done: false });

export const makeEntry = (ex) => {
  const lw = ex.lastWeight ?? ex.lastweight ?? ex.last_weight;
  const weight = (lw !== undefined && lw !== null && Number(lw) > 0) ? Number(lw) : constants.DEFAULT_TARGET_WEIGHT;
  return {
    entryId: uid(),
    exerciseId: ex.id,
    name: ex.name,
    muscleGroup: ex.muscleGroup,
    category: ex.category,
    equipment: ex.equipment,
    similarExercises: ex.similarExercises || [],
    targetSets: constants.DEFAULT_TARGET_SETS,
    targetReps: constants.DEFAULT_TARGET_REPS,
    targetWeight: weight,
    sets: Array.from({ length: constants.DEFAULT_TARGET_SETS }, () => makeSet(constants.DEFAULT_TARGET_REPS, weight)),
    expanded: true,
    showSwap: false,
    notes: "",
  };
};
