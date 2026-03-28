import { constants } from '../data/constants';

export const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
export const pad = (n) => (n < 10 ? "0" + n : String(n));
export const fmtMs = (ms) => { const s = Math.floor(Math.abs(ms) / 1000); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
export const fmtDate = (d = new Date()) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

export const makeSet = (reps, weight) => ({ id: uid(), reps, weight, done: false });

export const makeEntry = (ex) => ({
  entryId: uid(),
  exerciseId: ex.id,
  name: ex.name,
  muscleGroup: ex.muscleGroup,
  category: ex.category,
  equipment: ex.equipment,
  similarExercises: ex.similarExercises || [],
  targetSets: constants.DEFAULT_TARGET_SETS,
  targetReps: constants.DEFAULT_TARGET_REPS,
  targetWeight: constants.DEFAULT_TARGET_WEIGHT,
  sets: [
    makeSet(constants.DEFAULT_TARGET_REPS, constants.DEFAULT_TARGET_WEIGHT),
    makeSet(constants.DEFAULT_TARGET_REPS, constants.DEFAULT_TARGET_WEIGHT),
    makeSet(constants.DEFAULT_TARGET_REPS, constants.DEFAULT_TARGET_WEIGHT)
  ],
  expanded: true,
  showSwap: false,
});
