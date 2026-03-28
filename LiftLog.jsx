import { useState, useEffect, useRef } from "react";

// ── Exercise data ─────────────────────────────────────────────────────────────
const EXERCISES_JSON = [
  // --- PUSH: CHEST ---
  { id: "e001", name: "Bench Press", category: "push", muscleGroup: "chest", equipment: "barbell", similarExercises: ["e002", "e030", "e032"], description: "Lie flat on a bench, grip the bar slightly wider than shoulders. Lower the bar to mid-chest under control, then press back up to full arm extension. The cornerstone chest mass builder." },
  { id: "e002", name: "Incline Bench Press", category: "push", muscleGroup: "chest", equipment: "barbell", similarExercises: ["e001", "e031", "e003"], description: "Set bench to 30–45°. Grip bar wider than shoulders and press from upper chest. Emphasises the upper pec and anterior deltoid for a full chest shape." },
  { id: "e003", name: "Dumbbell Fly", category: "push", muscleGroup: "chest", equipment: "dumbbell", similarExercises: ["e004", "e030", "e031"], description: "Lie flat, hold dumbbells above chest with a slight elbow bend. Open arms wide in an arc, then squeeze chest to bring them back. Great chest isolation with a deep stretch." },
  { id: "e004", name: "Cable Crossover", category: "push", muscleGroup: "chest", equipment: "cable", similarExercises: ["e003", "e032", "e033"], description: "Stand between cable towers with handles at shoulder height. Draw handles down and across in a wide arc, squeezing chest hard at the bottom. Provides constant tension throughout." },
  { id: "e030", name: "Dumbbell Bench Press", category: "push", muscleGroup: "chest", equipment: "dumbbell", similarExercises: ["e001", "e031", "e032"], description: "Lie flat on a bench with dumbbells. Press weights upward until arms are extended, then lower until elbows are slightly below the bench. Allows for a greater range of motion than the barbell." },
  { id: "e031", name: "Incline Dumbbell Press", category: "push", muscleGroup: "chest", equipment: "dumbbell", similarExercises: ["e002", "e030", "e003"], description: "Bench set to 30-45°. Press dumbbells from upper chest level to full extension. Targets the clavicular head of the pectoralis major with more freedom of movement for the shoulders." },
  { id: "e032", name: "Chest Press Machine", category: "push", muscleGroup: "chest", equipment: "machine", similarExercises: ["e001", "e030", "e004"], description: "Sit in the machine and push handles forward until arms are straight. Excellent for safely pushing to failure without needing a spotter." },
  { id: "e033", name: "Push-up", category: "push", muscleGroup: "chest", equipment: "bodyweight", similarExercises: ["e001", "e010", "e032"], description: "Start in a plank position, lower your chest to the floor, and push back up. The fundamental horizontal pushing movement for chest, shoulders, and triceps." },

  // --- PUSH: SHOULDERS ---
  { id: "e005", name: "Overhead Press", category: "push", muscleGroup: "shoulders", equipment: "barbell", similarExercises: ["e034", "e035", "e007"], description: "Stand or sit, grip bar at shoulder width just outside the neck. Press directly overhead to lockout, then lower back to the front delts. The primary shoulder mass builder; also works triceps heavily." },
  { id: "e006", name: "Lateral Raise", category: "push", muscleGroup: "shoulders", equipment: "dumbbell", similarExercises: ["e005", "e007", "e036"], description: "Hold dumbbells at sides, raise arms out to shoulder height with a slight elbow bend. Pause at top, lower slowly. Isolates the lateral deltoid — key for building shoulder width." },
  { id: "e007", name: "Arnold Press", category: "push", muscleGroup: "shoulders", equipment: "dumbbell", similarExercises: ["e034", "e005", "e035"], description: "Start with dumbbells at chin height, palms facing you. Rotate palms outward as you press overhead, then reverse on the way down. Named after Schwarzenegger — hits all three deltoid heads." },
  { id: "e034", name: "Dumbbell Shoulder Press", category: "push", muscleGroup: "shoulders", equipment: "dumbbell", similarExercises: ["e005", "e007", "e035"], description: "Sit or stand with dumbbells at shoulder height. Press upward until arms are straight. Requires more stabilization than the barbell version and allows for a natural path of motion." },
  { id: "e035", name: "Machine Shoulder Press", category: "push", muscleGroup: "shoulders", equipment: "machine", similarExercises: ["e034", "e005", "e037"], description: "Seated overhead press using a fixed-path machine. Ideal for isolating the deltoids with constant tension and minimal stability requirements." },
  { id: "e037", name: "Front Raise", category: "push", muscleGroup: "shoulders", equipment: "dumbbell", similarExercises: ["e005", "e006", "e034"], description: "Lift dumbbells in front of you to shoulder height with a slight elbow bend. Isolates the anterior (front) deltoid." },

  // --- PUSH: ARMS (TRICEPS) ---
  { id: "e008", name: "Tricep Pushdown", category: "push", muscleGroup: "arms", equipment: "cable", similarExercises: ["e009", "e038", "e010"], description: "Attach a rope or bar to a high cable. Keeping elbows pinned to your sides, push the handle down to full extension, then slowly return. Classic tricep isolation for the lateral and medial heads." },
  { id: "e009", name: "Skull Crusher", category: "push", muscleGroup: "arms", equipment: "barbell", similarExercises: ["e008", "e038", "e039"], description: "Lie on a bench and hold a barbell above your forehead with arms extended. Bend only at the elbows, lowering the bar toward your forehead, then extend back up. Directly targets the long head of triceps." },
  { id: "e010", name: "Dips", category: "push", muscleGroup: "arms", equipment: "bodyweight", similarExercises: ["e008", "e033", "e039"], description: "Support yourself on parallel bars. Lower your body by bending elbows until upper arms are parallel to the floor, then press back up to lockout. Compounds chest and triceps; lean forward for more chest emphasis." },
  { id: "e038", name: "Overhead Dumbbell Extension", category: "push", muscleGroup: "arms", equipment: "dumbbell", similarExercises: ["e008", "e009"], description: "Hold a dumbbell with both hands overhead. Lower it behind your neck by bending elbows, then extend back up. Heavily emphasizes the triceps' long head." },
  { id: "e039", name: "Close Grip Bench Press", category: "push", muscleGroup: "arms", equipment: "barbell", similarExercises: ["e001", "e009", "e010"], description: "Standard bench press but with hands placed shoulder-width or closer. Shifts the primary load from the chest to the triceps." },

  // --- PULL: BACK & REAR DELTS ---
  { id: "e011", name: "Deadlift", category: "pull", muscleGroup: "back", equipment: "barbell", similarExercises: ["e012", "e022", "e048"], description: "Stand over the bar, feet hip-width. Grip just outside your legs, brace your core, then drive through your heels and hips to stand tall. The ultimate full-body strength movement — builds the entire posterior chain." },
  { id: "e012", name: "Barbell Row", category: "pull", muscleGroup: "back", equipment: "barbell", similarExercises: ["e040", "e041", "e015"], description: "Hinge forward to near-horizontal with a neutral spine. Pull the bar to your lower chest, driving elbows back and squeezing shoulder blades together at the top. The core back thickness builder." },
  { id: "e013", name: "Pull-up", category: "pull", muscleGroup: "back", equipment: "bodyweight", similarExercises: ["e014", "e040", "e012"], description: "Dead hang from a bar with an overhand grip wider than shoulders. Pull yourself up until chin clears the bar, then lower under control. The ultimate bodyweight back exercise; also develops biceps and grip strength." },
  { id: "e014", name: "Lat Pulldown", category: "pull", muscleGroup: "back", equipment: "cable", similarExercises: ["e013", "e042", "e015"], description: "Sit at a cable machine with a wide overhand grip. Pull the bar down to your upper chest, driving elbows toward your hips. Excellent lat isolator and a more accessible alternative to pull-ups." },
  { id: "e015", name: "Seated Cable Row", category: "pull", muscleGroup: "back", equipment: "cable", similarExercises: ["e012", "e041", "e036"], description: "Sit upright at a low cable station, feet on the pads. Pull the handle into your lower chest keeping your back neutral, then return with a full arm extension. Develops mid-back thickness and rear deltoids." },
  { id: "e036", name: "Face Pull", category: "pull", muscleGroup: "shoulders", equipment: "cable", similarExercises: ["e015", "e006", "e012"], description: "Pull a rope attachment toward your forehead, pulling the ends apart. Essential for rear deltoid development and rotator cuff health." },
  { id: "e040", name: "Single Arm Dumbbell Row", category: "pull", muscleGroup: "back", equipment: "dumbbell", similarExercises: ["e012", "e015", "e041"], description: "Rest one hand and knee on a bench, pull a dumbbell to your hip with the other. Allows for deep lats stretch and corrects muscle imbalances." },
  { id: "e041", name: "T-Bar Row", category: "pull", muscleGroup: "back", equipment: "barbell", similarExercises: ["e012", "e015", "e040"], description: "Straddle a landmine bar or T-bar machine. Pull the weight toward your chest. Targets mid-back thickness and allows for heavy loading." },
  { id: "e042", name: "Straight Arm Pulldown", category: "pull", muscleGroup: "back", equipment: "cable", similarExercises: ["e014", "e036"], description: "Using a lat bar or rope, pull down with straight arms to your thighs. Isolates the lats by removing bicep involvement." },

  // --- PULL: ARMS (BICEPS) ---
  { id: "e016", name: "Barbell Curl", category: "pull", muscleGroup: "arms", equipment: "barbell", similarExercises: ["e043", "e017", "e018"], description: "Stand holding a barbell with an underhand grip. Curl from full extension to peak bicep contraction, then lower slowly. The classic bicep mass builder with the highest loading potential." },
  { id: "e017", name: "Hammer Curl", category: "pull", muscleGroup: "arms", equipment: "dumbbell", similarExercises: ["e016", "e043", "e044"], description: "Hold dumbbells with a neutral (hammer) grip, thumbs pointing up. Curl both arms simultaneously. Targets the brachialis and brachioradialis alongside the biceps for overall arm thickness." },
  { id: "e018", name: "Preacher Curl", category: "pull", muscleGroup: "arms", equipment: "cable", similarExercises: ["e016", "e044", "e017"], description: "Rest your upper arms on the preacher bench pad, curl the bar up to full contraction. The pad eliminates shoulder involvement for isolated bicep work — great for building the peak." },
  { id: "e043", name: "Dumbbell Curl", category: "pull", muscleGroup: "arms", equipment: "dumbbell", similarExercises: ["e016", "e017", "e044"], description: "Stand or sit, curling dumbbells toward shoulders. Allows for wrist supination (turning palms up) which maximizes bicep peak contraction." },
  { id: "e044", name: "Concentration Curl", category: "pull", muscleGroup: "arms", equipment: "dumbbell", similarExercises: ["e018", "e043"], description: "Sit on a bench, lean forward, and brace your elbow against your inner thigh. Eliminates momentum for pure bicep isolation." },

  // --- LEGS ---
  { id: "e019", name: "Squat", category: "legs", muscleGroup: "legs", equipment: "barbell", similarExercises: ["e020", "e021", "e047"], description: "Barbell across upper back, feet shoulder-width. Break at hips and knees, descend until thighs are parallel to the floor, then drive back up. The king of leg exercises." },
  { id: "e020", name: "Leg Press", category: "legs", muscleGroup: "legs", equipment: "machine", similarExercises: ["e019", "e021", "e024"], description: "Sit in the machine with feet shoulder-width on the platform. Push the platform away to near full extension, then lower slowly. High-volume leg training with reduced spinal load." },
  { id: "e021", name: "Hack Squat", category: "legs", muscleGroup: "legs", equipment: "machine", similarExercises: ["e019", "e020", "e047"], description: "Shoulders in the pads, feet low on the platform. Squat down until thighs reach 90°, then drive back up. Emphasises the quads while reducing lower back involvement." },
  { id: "e022", name: "Romanian Deadlift", category: "legs", muscleGroup: "legs", equipment: "barbell", similarExercises: ["e023", "e048", "e011"], description: "Hold the bar at hip height, push hips back and hinge forward while keeping legs nearly straight. Feel the deep hamstring stretch at the bottom. The best hamstring builder." },
  { id: "e023", name: "Leg Curl", category: "legs", muscleGroup: "legs", equipment: "machine", similarExercises: ["e022", "e048"], description: "Lie face down on the machine with the pad behind your ankles. Curl your heels toward your glutes against resistance. Direct hamstring isolation." },
  { id: "e024", name: "Leg Extension", category: "legs", muscleGroup: "legs", equipment: "machine", similarExercises: ["e020", "e021"], description: "Sit on the machine with the pad across your shins. Extend legs to full lockout, squeezing quads hard at the top. Pure quad isolation." },
  { id: "e025", name: "Calf Raise", category: "legs", muscleGroup: "legs", equipment: "machine", similarExercises: ["e026"], description: "Stand on the calf raise machine, balls of feet on the edge. Rise up as high as possible, squeeze hard, then lower below the platform for a full stretch." },
  { id: "e026", name: "Standing Calf Raise", category: "legs", muscleGroup: "legs", equipment: "dumbbell", similarExercises: ["e025"], description: "Hold dumbbells and stand with the balls of your feet on a step edge. Raise heels as high as possible, then lower below step level for a full range of motion." },
  { id: "e045", name: "Bulgarian Split Squat", category: "legs", muscleGroup: "legs", equipment: "dumbbell", similarExercises: ["e019", "e046", "e047"], description: "One foot elevated on a bench behind you, squat down with the lead leg. Incredible for glute and quad development while improving balance." },
  { id: "e046", name: "Lunges", category: "legs", muscleGroup: "legs", equipment: "dumbbell", similarExercises: ["e045", "e019"], description: "Step forward and lower hips until both knees are bent at 90 degrees. Can be done walking or stationary. Builds functional leg strength." },
  { id: "e047", name: "Goblet Squat", category: "legs", muscleGroup: "legs", equipment: "dumbbell", similarExercises: ["e019", "e021", "e045"], description: "Hold a single dumbbell against your chest like a goblet and squat. Great for teaching proper squat form and heavy quad emphasis." },
  { id: "e048", name: "Hip Thrust", category: "legs", muscleGroup: "legs", equipment: "barbell", similarExercises: ["e022", "e011", "e023"], description: "Upper back on a bench, barbell across hips. Drive hips toward the ceiling. The gold standard for glute isolation and strength." },

  // --- FULL BODY / CORE ---
  { id: "e027", name: "Plank", category: "full body", muscleGroup: "core", equipment: "bodyweight", similarExercises: ["e028", "e029", "e050"], description: "Forearms and toes on the floor, body forming a straight line. Hold the position while breathing steadily. Builds anti-extension core stability and endurance." },
  { id: "e028", name: "Ab Rollout", category: "full body", muscleGroup: "core", equipment: "bodyweight", similarExercises: ["e027", "e049", "e029"], description: "Kneel with an ab wheel. Roll forward until your body is nearly flat, bracing core. Contract abs to pull back. An advanced anti-extension exercise." },
  { id: "e029", name: "Cable Crunch", category: "full body", muscleGroup: "core", equipment: "cable", similarExercises: ["e027", "e050", "e028"], description: "Kneel at a high cable with a rope attachment behind your head. Crunch down, bringing elbows toward knees. Allows progressive overload on abs." },
  { id: "e049", name: "Hanging Leg Raise", category: "full body", muscleGroup: "core", equipment: "bodyweight", similarExercises: ["e028", "e029"], description: "Hang from a pull-up bar and lift legs to waist height. High-intensity exercise for the lower abdominals and hip flexors." },
  { id: "e050", name: "Russian Twist", category: "full body", muscleGroup: "core", equipment: "dumbbell", similarExercises: ["e027", "e029"], description: "Sit on the floor, lean back slightly, and rotate a weight from side to side. Targets the obliques and rotational core strength." }
];

// ── Preset Templates ──────────────────────────────────────────────────────────
const TEMPLATES = [
  {
    id: "t001", name: "Push Day",
    exercises: [
      { exerciseId: "e001", targetSets: 4, targetReps: 8,  targetWeight: 80 },
      { exerciseId: "e002", targetSets: 3, targetReps: 10, targetWeight: 70 },
      { exerciseId: "e005", targetSets: 4, targetReps: 8,  targetWeight: 60 },
      { exerciseId: "e006", targetSets: 3, targetReps: 12, targetWeight: 10 },
      { exerciseId: "e008", targetSets: 3, targetReps: 12, targetWeight: 25 },
    ],
  },
  {
    id: "t002", name: "Pull Day",
    exercises: [
      { exerciseId: "e011", targetSets: 4, targetReps: 5,  targetWeight: 100 },
      { exerciseId: "e012", targetSets: 4, targetReps: 8,  targetWeight: 70  },
      { exerciseId: "e014", targetSets: 3, targetReps: 10, targetWeight: 55  },
      { exerciseId: "e015", targetSets: 3, targetReps: 12, targetWeight: 50  },
      { exerciseId: "e016", targetSets: 3, targetReps: 10, targetWeight: 35  },
    ],
  },
  {
    id: "t003", name: "Leg Day",
    exercises: [
      { exerciseId: "e019", targetSets: 4, targetReps: 6,  targetWeight: 100 },
      { exerciseId: "e022", targetSets: 3, targetReps: 10, targetWeight: 80  },
      { exerciseId: "e020", targetSets: 3, targetReps: 12, targetWeight: 120 },
      { exerciseId: "e023", targetSets: 3, targetReps: 12, targetWeight: 50  },
      { exerciseId: "e025", targetSets: 4, targetReps: 15, targetWeight: 60  },
    ],
  },
  {
    id: "t004", name: "Upper Body",
    exercises: [
      { exerciseId: "e001", targetSets: 3, targetReps: 8,  targetWeight: 80 },
      { exerciseId: "e012", targetSets: 3, targetReps: 8,  targetWeight: 70 },
      { exerciseId: "e005", targetSets: 3, targetReps: 10, targetWeight: 55 },
      { exerciseId: "e013", targetSets: 3, targetReps: 8,  targetWeight: 0  },
      { exerciseId: "e016", targetSets: 3, targetReps: 10, targetWeight: 35 },
    ],
  },
  {
    id: "t005", name: "Lower Body",
    exercises: [
      { exerciseId: "e019", targetSets: 4, targetReps: 8,  targetWeight: 90 },
      { exerciseId: "e020", targetSets: 3, targetReps: 12, targetWeight: 120},
      { exerciseId: "e022", targetSets: 3, targetReps: 10, targetWeight: 75 },
      { exerciseId: "e023", targetSets: 3, targetReps: 12, targetWeight: 50 },
      { exerciseId: "e027", targetSets: 3, targetReps: 45, targetWeight: 0  },
    ],
  },
  {
    id: "t006", name: "Full Body",
    exercises: [
      { exerciseId: "e019", targetSets: 3, targetReps: 8,  targetWeight: 90 },
      { exerciseId: "e001", targetSets: 3, targetReps: 8,  targetWeight: 80 },
      { exerciseId: "e012", targetSets: 3, targetReps: 8,  targetWeight: 70 },
      { exerciseId: "e005", targetSets: 3, targetReps: 10, targetWeight: 55 },
      { exerciseId: "e027", targetSets: 3, targetReps: 45, targetWeight: 0  },
    ],
  },
];

// ── Storage ───────────────────────────────────────────────────────────────────
const storage = {
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

// ── Helpers ───────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2) + Date.now().toString(36);
const pad = (n) => (n < 10 ? "0" + n : String(n));
const fmtMs = (ms) => { const s = Math.floor(Math.abs(ms) / 1000); return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`; };
const fmtDate = (d = new Date()) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const DEFAULT_TARGET_SETS   = 3;
const DEFAULT_TARGET_REPS   = 8;
const DEFAULT_TARGET_WEIGHT = 60;
const USER_TEMPLATE_ID_PREFIX = "ut_";

const makeSet = (reps, weight) => ({ id: uid(), reps, weight, done: false });
const makeEntry = (ex) => ({
  entryId: uid(), exerciseId: ex.id, name: ex.name,
  muscleGroup: ex.muscleGroup, category: ex.category, equipment: ex.equipment,
  similarExercises: ex.similarExercises || [],
  targetSets: DEFAULT_TARGET_SETS, targetReps: DEFAULT_TARGET_REPS, targetWeight: DEFAULT_TARGET_WEIGHT,
  sets: [makeSet(DEFAULT_TARGET_REPS, DEFAULT_TARGET_WEIGHT), makeSet(DEFAULT_TARGET_REPS, DEFAULT_TARGET_WEIGHT), makeSet(DEFAULT_TARGET_REPS, DEFAULT_TARGET_WEIGHT)],
  expanded: true, showSwap: false,
});

const MUSCLE_COLORS = {
  chest:     { bg: "#0f2a18", border: "#1e5c32", text: "#3dff6e" },
  back:      { bg: "#0f1f2a", border: "#1e4a5c", text: "#3db8ff" },
  shoulders: { bg: "#1a2a0f", border: "#3d5c1e", text: "#8fff3d" },
  arms:      { bg: "#1f0f2a", border: "#4a1e5c", text: "#c03dff" },
  legs:      { bg: "#0f2a1f", border: "#1e5c4a", text: "#3dffb8" },
  core:      { bg: "#2a1f0f", border: "#5c4a1e", text: "#ffb83d" },
};

const REST_PRESETS = [60, 90, 120, 180];

// ── CSS ───────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Share+Tech+Mono&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #050805;
    --surface:  #090e09;
    --surf2:    #0e160e;
    --surf3:    #131c13;
    --border:   #162016;
    --border2:  #1e301e;
    --accent:   #3dff6e;
    --accent2:  #2dd45c;
    --adim:     #3dff6e18;
    --aglow:    #3dff6e28;
    --text:     #c8e8c8;
    --muted:    #3a5a3a;
    --dim:      #6a8a6a;
    --danger:   #ff4040;
    --warn:     #ffaa33;
    --r:        5px;
    --rsm:      3px;
  }

  body { background: var(--bg); color: var(--text); font-family: 'Rajdhani', sans-serif; min-height: 100vh; }

  body::before {
    content: ''; position: fixed; inset: 0; pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,8,0,0.04) 3px, rgba(0,8,0,0.04) 4px);
  }

  .app { max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; }
  @media (min-width: 768px) { .app { max-width: 620px; border-left: 1px solid var(--border); border-right: 1px solid var(--border); } }

  /* ── TOPBAR ── */
  .topbar {
    position: sticky; top: 0; z-index: 50;
    display: grid; grid-template-columns: auto 1fr auto; align-items: center;
    gap: 8px; padding: 8px 12px; background: var(--surface);
    border-bottom: 1px solid var(--border2);
  }
  .logo { font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; letter-spacing: 5px; color: var(--accent); text-transform: uppercase; }
  .topbar-r { display: flex; align-items: center; gap: 8px; }
  .live-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--accent); animation: blink 1s step-end infinite; flex-shrink: 0; }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  .clock { font-family: 'Share Tech Mono', monospace; font-size: 15px; color: var(--accent); }
  .sname-input {
    background: transparent; border: none; outline: none;
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
    color: var(--dim); letter-spacing: 2px; text-transform: uppercase;
    width: 100%; text-align: center; cursor: text;
  }
  .sname-input:focus { color: var(--text); }
  .sname-input::placeholder { color: var(--muted); }

  /* ── REST OVERLAY ── */
  .rest-overlay {
    position: fixed; inset: 0; z-index: 200; background: rgba(0,3,0,0.94);
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .rest-lbl { font-size: 12px; letter-spacing: 5px; text-transform: uppercase; color: var(--muted); margin-bottom: 10px; font-weight: 700; }
  .rest-ring { position: relative; width: 170px; height: 170px; margin-bottom: 18px; }
  .rest-svg { transform: rotate(-90deg); }
  .rest-bg  { fill: none; stroke: var(--border2); stroke-width: 5; }
  .rest-arc { fill: none; stroke: var(--accent); stroke-width: 5; stroke-linecap: round; transition: stroke-dashoffset 1s linear, stroke 0.3s; }
  .rest-arc.urgent { stroke: var(--warn); }
  .rest-arc.overtime { stroke: var(--danger); }
  .rest-num {
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    font-family: 'Share Tech Mono', monospace; font-size: 44px; color: var(--accent); letter-spacing: 1px;
  }
  .rest-num.urgent { color: var(--warn); }
  .rest-num.overtime { color: var(--danger); }
  .rest-presets { display: flex; gap: 6px; margin-bottom: 14px; }
  .rp-btn {
    background: var(--surf2); border: 1px solid var(--border2); color: var(--dim);
    font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700;
    padding: 4px 12px; border-radius: var(--r); cursor: pointer; letter-spacing: 1px; transition: all 0.12s;
  }
  .rp-btn:hover, .rp-btn.active { background: var(--adim); border-color: var(--accent); color: var(--accent); }
  .rest-btns { display: flex; gap: 8px; }
  .rb {
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 2px;
    padding: 9px 22px; border-radius: var(--r); cursor: pointer; text-transform: uppercase; border: 1px solid; transition: all 0.12s;
  }
  .rb-close { background: transparent; border-color: var(--border2); color: var(--dim); }
  .rb-close:hover { border-color: var(--danger); color: var(--danger); }
  .rb-skip  { background: var(--adim); border-color: var(--accent); color: var(--accent); }
  .rb-skip:hover { background: var(--accent); color: #000; }
  .rest-done { font-size: 12px; color: var(--accent); letter-spacing: 3px; text-transform: uppercase; margin-top: 6px; }

  /* ── EXERCISES SECTION ── */
  .exsec { padding: 6px 10px 0; flex: 1; }
  .secbar { display: flex; align-items: center; justify-content: space-between; padding: 2px 2px 5px; }
  .seclbl { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); font-weight: 700; }
  .secstat { font-size: 11px; color: var(--accent); letter-spacing: 2px; font-weight: 700; }

  /* ── EXERCISE CARD ── */
  .excard { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r); margin-bottom: 6px; overflow: hidden; transition: border-color 0.15s; }
  .excard.open { border-color: var(--border2); }

  .exhdr { display: flex; align-items: center; gap: 7px; padding: 8px 10px; cursor: pointer; min-height: 40px; }
  .exname { font-size: 15px; font-weight: 700; color: var(--text); flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.3px; }
  .mtag { font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 2px 6px; border-radius: 2px; border: 1px solid; flex-shrink: 0; }
  .hdr-r { display: flex; align-items: center; gap: 6px; flex-shrink: 0; }
  .pips { display: flex; gap: 3px; align-items: center; }
  .pip { width: 5px; height: 5px; border-radius: 50%; background: var(--border2); transition: background 0.15s; }
  .pip.on { background: var(--accent); box-shadow: 0 0 3px var(--aglow); }
  .hbtn { background: none; border: none; cursor: pointer; color: var(--muted); font-size: 14px; padding: 3px 4px; border-radius: 2px; line-height: 1; transition: color 0.12s; }
  .hbtn:hover { color: var(--dim); }
  .hbtn.sw:hover { color: var(--accent); }
  .hbtn.dl:hover { color: var(--danger); }

  /* ── TARGET ROW ── */
  .trow { display: flex; align-items: center; gap: 5px; padding: 6px 10px; border-top: 1px solid var(--border); }
  .tlbl { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); white-space: nowrap; font-weight: 700; }
  .nin {
    width: 42px; background: var(--surf2); border: 1px solid var(--border2);
    border-radius: var(--rsm); color: var(--text); font-family: 'Share Tech Mono', monospace;
    font-size: 16px; padding: 4px 3px; text-align: center; outline: none; transition: border-color 0.12s;
    -webkit-appearance: none;
  }
  .nin:focus { border-color: var(--accent); }
  .nin::-webkit-inner-spin-button { -webkit-appearance: none; }
  .nin.w { width: 54px; }
  .sp { font-size: 11px; color: var(--muted); }
  .apbtn {
    margin-left: auto; background: var(--adim); border: 1px solid rgba(61,255,110,0.3);
    color: var(--accent); font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700;
    padding: 4px 10px; border-radius: var(--rsm); cursor: pointer; letter-spacing: 1px;
    text-transform: uppercase; transition: background 0.12s; white-space: nowrap;
  }
  .apbtn:hover { background: rgba(61,255,110,0.2); }

  /* ── SET ROWS ── */
  .slist { padding: 2px 10px 8px; display: flex; flex-direction: column; gap: 4px; }
  .srow {
    display: flex; align-items: center; gap: 6px;
    background: var(--surf2); border-radius: var(--rsm);
    padding: 6px 8px; border: 1px solid transparent; transition: border-color 0.12s;
  }
  .srow.done { border-color: rgba(61,255,110,0.2); background: #0a150a; }
  .snum { font-size: 10px; font-weight: 700; color: var(--muted); width: 18px; letter-spacing: 1px; flex-shrink: 0; }
  .sinputs { display: flex; align-items: center; gap: 4px; flex: 1; }
  .sin {
    width: 42px; background: var(--surf3); border: 1px solid var(--border2);
    border-radius: 2px; color: var(--text); font-family: 'Share Tech Mono', monospace;
    font-size: 16px; padding: 3px 3px; text-align: center; outline: none;
    -webkit-appearance: none;
  }
  .sin:focus { border-color: var(--accent); }
  .sin::-webkit-inner-spin-button { -webkit-appearance: none; }
  .sin.w { width: 52px; }
  .ssep { font-size: 11px; color: var(--muted); }
  .sunit { font-size: 10px; color: var(--muted); }
  .restbtn {
    background: var(--surf3); border: 1px solid var(--border2);
    color: var(--muted); font-size: 12px; padding: 4px 8px;
    border-radius: var(--rsm); cursor: pointer;
    font-family: 'Rajdhani', sans-serif; font-weight: 700; letter-spacing: 0.5px;
    transition: all 0.12s; white-space: nowrap;
  }
  .restbtn:hover { border-color: var(--accent); color: var(--accent); }
  .rmbtn { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 13px; padding: 2px 3px; line-height: 1; transition: color 0.12s; }
  .rmbtn:hover { color: var(--danger); }
  .tickbtn {
    width: 28px; height: 28px; border-radius: 50%;
    border: 2px solid var(--border2); background: none;
    cursor: pointer; color: var(--muted); font-size: 13px;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.12s; flex-shrink: 0;
  }
  .tickbtn.on { background: var(--accent); border-color: var(--accent); color: #000; box-shadow: 0 0 6px var(--aglow); }
  .addbtn {
    width: 100%; background: none; border: 1px dashed var(--border2);
    border-radius: var(--rsm); color: var(--muted);
    font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700;
    padding: 6px; cursor: pointer; letter-spacing: 1.5px; text-transform: uppercase;
    transition: all 0.12s; margin-top: 2px;
  }
  .addbtn:hover { border-color: var(--accent); color: var(--accent); }

  /* ── SWAP PANEL ── */
  .swappanel { padding: 3px 10px 8px; border-top: 1px solid var(--border); }
  .swaplbl { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 5px; font-weight: 700; }
  .swaplist { display: flex; flex-direction: column; gap: 3px; }
  .swapitem {
    display: flex; align-items: center; justify-content: space-between;
    background: var(--surf2); border-radius: var(--rsm); padding: 8px 10px;
    cursor: pointer; border: 1px solid var(--border); transition: all 0.12s;
    font-size: 14px; font-weight: 600;
  }
  .swapitem:hover { border-color: rgba(61,255,110,0.5); color: var(--accent); }
  .swarr { font-size: 13px; color: var(--accent); }

  /* ── ADD EXERCISE ── */
  .addwrap { padding: 5px 10px 3px; }
  .addexbtn {
    width: 100%; background: var(--surface); border: 1px dashed var(--border2);
    border-radius: var(--r); color: var(--muted);
    font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700;
    padding: 11px; cursor: pointer; letter-spacing: 2px; text-transform: uppercase;
    transition: all 0.12s; display: flex; align-items: center; justify-content: center; gap: 5px;
  }
  .addexbtn:hover { border-color: var(--accent); color: var(--accent); background: var(--adim); }

  /* ── BOTTOM BAR ── */
  .botbar { padding: 6px 10px 18px; display: flex; gap: 6px; }
  .finbtn {
    flex: 1; background: var(--accent); color: #000;
    font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700;
    letter-spacing: 3px; border: none; border-radius: var(--r);
    padding: 11px; cursor: pointer; text-transform: uppercase;
    transition: opacity 0.12s; box-shadow: 0 0 12px var(--aglow);
  }
  .finbtn:hover { opacity: 0.88; }
  .finbtn:disabled { opacity: 0.2; cursor: not-allowed; box-shadow: none; }
  .discbtn {
    background: var(--surface); border: 1px solid var(--border2); color: var(--muted);
    font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700;
    border-radius: var(--r); padding: 11px 12px; cursor: pointer;
    letter-spacing: 1px; transition: all 0.12s; text-transform: uppercase;
  }
  .discbtn:hover { border-color: var(--danger); color: var(--danger); }

  /* ── BROWSER MODAL ── */
  .moverlay { position: fixed; inset: 0; background: rgba(0,0,0,0.88); z-index: 100; display: flex; align-items: flex-end; }
  .modal {
    width: 100%; max-width: 480px; margin: 0 auto;
    background: var(--surface); border-radius: 7px 7px 0 0;
    max-height: 88vh; display: flex; flex-direction: column;
    border-top: 1px solid var(--border2);
    animation: sup 0.2s cubic-bezier(0.16,1,0.3,1);
  }
  @media (min-width: 768px) { .modal { max-width: 620px; } }
  @keyframes sup { from { transform: translateY(100%); } to { transform: translateY(0); } }
  .mhandle { width: 28px; height: 3px; background: var(--border2); border-radius: 2px; margin: 7px auto 5px; }
  .mhdr { padding: 0 12px 7px; display: flex; align-items: center; justify-content: space-between; }
  .mtitle { font-size: 15px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); }
  .mclosebtn { background: var(--surf2); border: 1px solid var(--border2); color: var(--muted); width: 24px; height: 24px; border-radius: 3px; cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; }
  .msearch { margin: 0 12px 5px; position: relative; }
  .searchin {
    width: 100%; background: var(--surf2); border: 1px solid var(--border2);
    border-radius: var(--r); color: var(--text);
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 600;
    padding: 6px 10px 6px 28px; outline: none; letter-spacing: 0.5px;
  }
  .searchin:focus { border-color: var(--accent); }
  .searchic { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: var(--muted); font-size: 11px; }
  .frow { display: flex; gap: 4px; padding: 0 12px 5px; overflow-x: auto; scrollbar-width: none; }
  .frow::-webkit-scrollbar { display: none; }
  .fchip {
    flex-shrink: 0; background: var(--surf2); border: 1px solid var(--border);
    border-radius: 2px; color: var(--muted); font-size: 11px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; cursor: pointer;
    transition: all 0.1s; font-family: 'Rajdhani', sans-serif;
  }
  .fchip.on { background: var(--adim); border-color: var(--accent); color: var(--accent); }
  .blist { flex: 1; overflow-y: auto; padding: 0 12px 14px; }
  .grplbl { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); padding: 7px 0 4px; font-weight: 700; }
  .bitem {
    display: flex; align-items: center; gap: 8px; padding: 7px 9px;
    background: var(--surf2); border-radius: var(--rsm); margin-bottom: 3px;
    cursor: pointer; border: 1px solid var(--border); transition: all 0.1s;
  }
  .bitem:hover { border-color: rgba(61,255,110,0.4); }
  .bitem.added { border-color: var(--accent); opacity: 0.55; cursor: default; }
  .binfo { flex: 1; min-width: 0; }
  .bname { font-size: 14px; font-weight: 700; }
  .bmeta { display: flex; gap: 6px; margin-top: 2px; align-items: center; }
  .bequip { font-size: 11px; color: var(--muted); }
  .bstatus { font-size: 14px; color: var(--accent); font-weight: 700; }

  /* ── CUSTOM EXERCISE ── */
  .cmodal {
    background: var(--surface); border-radius: 7px 7px 0 0;
    width: 100%; max-width: 480px; margin: 0 auto; padding: 12px 12px 20px;
    animation: sup 0.2s cubic-bezier(0.16,1,0.3,1); border-top: 1px solid var(--border2);
  }
  @media (min-width: 768px) { .cmodal { max-width: 620px; } }
  .ctitle { font-size: 15px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
  .flbl { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; font-weight: 700; }
  .fin {
    width: 100%; background: var(--surf2); border: 1px solid var(--border2);
    border-radius: var(--r); color: var(--text);
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 600;
    padding: 7px 9px; outline: none; margin-bottom: 10px;
  }
  .fin:focus { border-color: var(--accent); }
  .chipgrp { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 10px; }
  .selchip {
    background: var(--surf2); border: 1px solid var(--border);
    border-radius: 2px; color: var(--muted); font-size: 10px; font-weight: 700;
    padding: 3px 9px; cursor: pointer; transition: all 0.1s; text-transform: capitalize;
    font-family: 'Rajdhani', sans-serif; letter-spacing: 1px;
  }
  .selchip.on { background: var(--adim); border-color: var(--accent); color: var(--accent); }
  .creatbtn {
    width: 100%; background: var(--accent); color: #000;
    font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; border: none;
    border-radius: var(--r); padding: 10px; cursor: pointer; margin-top: 3px;
  }
  .cancbtn { width: 100%; background: none; border: none; color: var(--muted); font-family: 'Rajdhani', sans-serif; font-size: 11px; padding: 8px; cursor: pointer; letter-spacing: 1px; }

  /* ── SUMMARY ── */
  .summary { padding: 12px; flex: 1; display: flex; flex-direction: column; }
  .sumhdr { text-align: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border); }
  .sumicon { font-size: 30px; margin-bottom: 3px; }
  .sumtitle { font-size: 24px; font-weight: 700; letter-spacing: 4px; color: var(--accent); text-transform: uppercase; }
  .sumdate { font-size: 10px; color: var(--muted); letter-spacing: 2px; margin-top: 1px; text-transform: uppercase; }
  .statgrid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin-bottom: 12px; }
  .statcard { background: var(--surface); border: 1px solid var(--border2); border-radius: var(--r); padding: 10px; text-align: center; }
  .statval { font-family: 'Share Tech Mono', monospace; font-size: 24px; color: var(--accent); }
  .statlbl { font-size: 10px; color: var(--muted); letter-spacing: 2px; text-transform: uppercase; margin-top: 1px; font-weight: 700; }
  .prsec { margin-bottom: 10px; }
  .pritem { display: flex; align-items: center; gap: 7px; background: var(--surface); border: 1px solid rgba(61,255,110,0.25); border-radius: var(--rsm); padding: 6px 9px; margin-bottom: 3px; }
  .prname { font-size: 12px; font-weight: 700; flex: 1; }
  .prw { font-size: 12px; color: var(--accent); font-weight: 700; font-family: 'Share Tech Mono', monospace; }
  .sumexes { margin-bottom: 12px; }
  .seitem { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rsm); padding: 7px 9px; margin-bottom: 3px; display: flex; align-items: center; justify-content: space-between; }
  .sename { font-size: 14px; font-weight: 700; }
  .semeta { font-size: 11px; color: var(--muted); }
  .newbtn { width: 100%; background: var(--accent); color: #000; font-family: 'Rajdhani', sans-serif; font-size: 15px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; border: none; border-radius: var(--r); padding: 12px; cursor: pointer; margin-top: auto; box-shadow: 0 0 12px var(--aglow); }

  /* ── HOME ── */
  .home { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 28px 16px; text-align: center; }
  .homelogo { font-family: 'Rajdhani', sans-serif; font-size: 52px; font-weight: 700; letter-spacing: 8px; color: var(--accent); text-transform: uppercase; line-height: 0.95; text-shadow: 0 0 40px var(--aglow); }
  .homesub { font-size: 9px; color: var(--muted); letter-spacing: 6px; text-transform: uppercase; margin-bottom: 36px; margin-top: 6px; }
  .startbtn {
    background: var(--accent); color: #000;
    font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700;
    letter-spacing: 4px; text-transform: uppercase; border: none;
    border-radius: var(--r); padding: 13px 40px; cursor: pointer;
    box-shadow: 0 0 20px var(--aglow); transition: all 0.12s;
  }
  .startbtn:hover { box-shadow: 0 0 32px var(--aglow); opacity: 0.9; }
  .recent { width: 100%; margin-top: 24px; text-align: left; }
  .reclbl { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; font-weight: 700; }
  .recitem { background: var(--surface); border: 1px solid var(--border); border-radius: var(--rsm); padding: 8px 10px; margin-bottom: 3px; display: flex; align-items: center; justify-content: space-between; }
  .recname { font-size: 14px; font-weight: 700; }
  .recmeta { font-size: 11px; color: var(--muted); margin-top: 1px; }
  .recvol { font-size: 12px; color: var(--accent); font-weight: 700; font-family: 'Share Tech Mono', monospace; }

  /* ── EMPTY ── */
  .empty { text-align: center; padding: 24px 12px; color: var(--muted); }
  .emico { font-size: 24px; margin-bottom: 6px; opacity: 0.3; }
  .emtxt { font-size: 11px; letter-spacing: 1px; }

  /* ── HOME ACTIONS ── */
  .home-actions { display: flex; gap: 8px; margin-top: 12px; width: 100%; }
  .homebtn {
    flex: 1; background: var(--surface); border: 1px solid var(--border2);
    color: var(--dim); font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 1.5px; text-transform: uppercase; border-radius: var(--r);
    padding: 10px 8px; cursor: pointer; transition: all 0.12s;
  }
  .homebtn:hover { border-color: var(--accent); color: var(--accent); background: var(--adim); }
  .resumebtn {
    width: 100%; background: var(--adim); border: 1px solid rgba(61,255,110,0.4);
    color: var(--accent); font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; border-radius: var(--r);
    padding: 10px; cursor: pointer; margin-bottom: 10px; transition: all 0.12s;
    animation: pulse-border 2s ease-in-out infinite;
  }
  .resumebtn:hover { background: rgba(61,255,110,0.18); }
  @keyframes pulse-border { 0%,100%{border-color:rgba(61,255,110,0.4)} 50%{border-color:rgba(61,255,110,0.8)} }

  /* ── FULL SCREENS (Explore / History) ── */
  .xscreen { display: flex; flex-direction: column; flex: 1; min-height: 0; overflow: hidden; }
  .xhdr {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px; background: var(--surface);
    border-bottom: 1px solid var(--border2); flex-shrink: 0;
  }
  .backbtn {
    background: none; border: none; color: var(--dim); cursor: pointer;
    font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700;
    letter-spacing: 1px; padding: 4px 0; transition: color 0.12s; flex-shrink: 0;
  }
  .backbtn:hover { color: var(--accent); }
  .xtitle { font-size: 15px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: var(--accent); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .xscroll { flex: 1; overflow-y: auto; padding: 8px 12px 20px; }
  .xitem {
    display: flex; align-items: center; gap: 8px; padding: 9px 9px;
    background: var(--surf2); border-radius: var(--rsm); margin-bottom: 3px;
    cursor: pointer; border: 1px solid var(--border); transition: all 0.1s;
  }
  .xitem:hover { border-color: rgba(61,255,110,0.4); }
  .xarr { color: var(--muted); font-size: 14px; flex-shrink: 0; }

  /* ── EXERCISE DETAIL MODAL ── */
  .exdetail { padding: 0 12px 24px; }
  .exdetail-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
  .equiptag {
    font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 2px 7px; border-radius: 2px; border: 1px solid var(--border2); color: var(--dim);
    background: var(--surf2);
  }
  .exdetail-desc { font-size: 13px; color: var(--text); line-height: 1.6; }

  /* ── HISTORY ── */
  .histitem {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--rsm);
    padding: 10px; margin-bottom: 4px; cursor: pointer; transition: all 0.1s;
  }
  .histitem:hover { border-color: var(--border2); }
  .histdate { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .hist-edit-btn {
    background: var(--surf2); border: 1px solid var(--border2); color: var(--dim);
    font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 1px; padding: 5px 12px; border-radius: var(--rsm); cursor: pointer;
    text-transform: uppercase; transition: all 0.12s; flex-shrink: 0;
  }
  .hist-edit-btn:hover { border-color: var(--accent); color: var(--accent); }
  .hist-save-btn {
    background: var(--accent); color: #000;
    font-family: 'Rajdhani', sans-serif; font-size: 12px; font-weight: 700;
    letter-spacing: 1px; padding: 5px 12px; border-radius: var(--rsm);
    cursor: pointer; border: none; text-transform: uppercase; transition: all 0.12s; flex-shrink: 0;
  }
  .hist-save-btn:hover { opacity: 0.88; }

  /* ── TOPBAR HOME BUTTON ── */
  .homebtn-topbar {
    background: none; border: none; color: var(--muted); cursor: pointer;
    font-family: 'Rajdhani', sans-serif; font-size: 11px; font-weight: 700;
    letter-spacing: 1px; padding: 3px 6px; border-radius: var(--rsm);
    transition: color 0.12s; text-transform: uppercase;
  }
  .homebtn-topbar:hover { color: var(--dim); }

  /* ── TEMPLATE MODAL ── */
  .tmpl-item {
    display: flex; align-items: center; gap: 8px; padding: 9px 9px;
    background: var(--surf2); border-radius: var(--rsm); margin-bottom: 4px;
    cursor: pointer; border: 1px solid var(--border); transition: all 0.1s;
  }
  .tmpl-item:hover { border-color: rgba(61,255,110,0.4); }
  .tmpl-info { flex: 1; min-width: 0; }
  .tmpl-name { font-size: 13px; font-weight: 700; color: var(--text); }
  .tmpl-exes { font-size: 9px; color: var(--muted); margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tmpl-arr { font-size: 14px; color: var(--accent); flex-shrink: 0; }

  /* ── TEMPLATE EDITOR ── */
  .tmpl-edit-row {
    display: flex; align-items: center; gap: 7px;
    background: var(--surf2); border: 1px solid var(--border); border-radius: var(--rsm);
    padding: 7px 9px; margin-bottom: 3px;
  }
  .tmpl-edit-info { flex: 1; min-width: 0; }
  .tmpl-edit-name { font-size: 12px; font-weight: 700; }
  .tmpl-edit-meta { font-size: 9px; color: var(--muted); margin-top: 1px; }
  .tmpl-edit-btns { display: flex; gap: 4px; flex-shrink: 0; }
  .tmpl-edit-btn {
    background: var(--surf3); border: 1px solid var(--border2); color: var(--muted);
    font-family: 'Rajdhani', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: 0.5px;
    padding: 3px 8px; border-radius: var(--rsm); cursor: pointer; transition: all 0.12s; text-transform: uppercase;
  }
  .tmpl-edit-btn:hover { border-color: var(--accent); color: var(--accent); }
  .tmpl-edit-btn.del:hover { border-color: var(--danger); color: var(--danger); }
  .tmpl-empty-state { text-align: center; padding: 32px 12px; color: var(--muted); }
  .tmpl-empty-icon { font-size: 28px; margin-bottom: 8px; opacity: 0.3; }
  .tmpl-empty-txt { font-size: 11px; letter-spacing: 1px; margin-bottom: 16px; }

  /* ── TEMPLATE EXERCISE PICKER ROWS ── */
  .tpe-row {
    display: flex; align-items: center; gap: 7px;
    background: var(--surf2); border: 1px solid var(--border); border-radius: var(--rsm);
    padding: 6px 9px; margin-bottom: 3px;
  }
  .tpe-info { flex: 1; min-width: 0; }
  .tpe-name { font-size: 12px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tpe-inputs { display: flex; align-items: center; gap: 3px; flex-shrink: 0; }
  .tpe-rm { background: none; border: none; color: var(--muted); cursor: pointer; font-size: 13px; padding: 0 2px; line-height: 1; transition: color 0.12s; flex-shrink: 0; }
  .tpe-rm:hover { color: var(--danger); }
  .new-tmpl-btn {
    width: 100%; background: var(--accent); color: #000;
    font-family: 'Rajdhani', sans-serif; font-size: 14px; font-weight: 700;
    letter-spacing: 2px; text-transform: uppercase; border: none;
    border-radius: var(--r); padding: 10px; cursor: pointer; margin-top: 8px;
    box-shadow: 0 0 10px var(--aglow); transition: opacity 0.12s;
  }
  .new-tmpl-btn:hover { opacity: 0.88; }
  .new-tmpl-btn:disabled { opacity: 0.25; cursor: not-allowed; box-shadow: none; }
`;

// ── NumInput ────────────────────────────────────────────────────────────────
// Controlled numeric input that avoids the "08" glitch and prevents iOS zoom.
function NumInput({ className, value, step, onChange, onClick }) {
  const [str, setStr] = useState(String(value ?? 0));
  const extRef = useRef(value);

  useEffect(() => {
    if (value !== extRef.current) {
      extRef.current = value;
      setStr(String(value ?? 0));
    }
  }, [value]);

  const commit = (raw) => {
    const n = parseFloat(raw);
    const safe = isNaN(n) ? 0 : n;
    extRef.current = safe;
    setStr(String(safe));
    onChange(safe);
  };

  return (
    <input
      className={className}
      type="text"
      inputMode={step && step !== 1 ? "decimal" : "numeric"}
      value={str}
      onClick={onClick}
      onFocus={e => e.target.select()}
      onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
      onChange={e => {
        const raw = e.target.value.replace(/[^0-9.]/g, "");
        setStr(raw);
        const n = parseFloat(raw);
        if (!isNaN(n)) { extRef.current = n; onChange(n); }
      }}
      onBlur={e => commit(e.target.value)}
    />
  );
}

// ── Rest Timer ────────────────────────────────────────────────────────────────
const fmtPreset = (s) => s === 120 ? "2 min" : s === 180 ? "3 min" : `${s}s`;

function RestTimer({ endTime, total, onSetTotal, onClose, onSkip }) {
  const [rem, setRem] = useState(() => Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
  const tickRef = useRef(null);

  useEffect(() => {
    const tick = () => setRem(Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));
    tick();
    tickRef.current = setInterval(tick, 500);
    return () => clearInterval(tickRef.current);
  }, [endTime]);

  const r = 76, circ = 2 * Math.PI * r;
  const pct = total > 0 ? rem / total : 0;
  const offset = circ * (1 - pct);
  const urgent = rem <= 10 && rem > 0;
  const overtime = rem === 0;

  return (
    <div className="rest-overlay" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
        <div className="rest-lbl">Rest Timer</div>
        <div className="rest-ring">
          <svg className="rest-svg" width="170" height="170" viewBox="0 0 170 170">
            <circle className="rest-bg" cx="85" cy="85" r={r} />
            <circle className={`rest-arc ${urgent?"urgent":""} ${overtime?"overtime":""}`}
              cx="85" cy="85" r={r} strokeDasharray={circ} strokeDashoffset={offset} />
          </svg>
          <div className={`rest-num ${urgent?"urgent":""} ${overtime?"overtime":""}`}>
            {pad(Math.floor(rem/60))}:{pad(rem%60)}
          </div>
        </div>
        {overtime && <div className="rest-done">▶ Next Set</div>}
        <div className="rest-presets">
          {REST_PRESETS.map(p => (
            <button key={p} className={`rp-btn ${total===p?"active":""}`} onClick={() => onSetTotal(p)}>{fmtPreset(p)}</button>
          ))}
        </div>
        <div className="rest-btns">
          <button className="rb rb-close" onClick={onClose}>Close</button>
          <button className="rb rb-skip" onClick={onSkip}>
            {overtime ? "Done" : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Exercise Card ─────────────────────────────────────────────────────────────
function ExCard({ entry, allExercises, onUpdate, onRemove, addedIds, onStartRest, restRem, editMode }) {
  const mc = MUSCLE_COLORS[entry.muscleGroup] || { bg:"#111", border:"#333", text:"#888" };
  const doneCt = entry.sets.filter(s => s.done).length;

  const upd = (id, field, val) => onUpdate({ ...entry, sets: entry.sets.map(s => s.id===id ? {...s,[field]:val} : s) });
  const tick = (id) => {
    if (editMode) return;
    const wasDone = entry.sets.find(s => s.id===id)?.done;
    onUpdate({ ...entry, sets: entry.sets.map(s => s.id===id ? {...s,done:!s.done} : s) });
  };
  const apply = () => onUpdate({ ...entry, sets: Array.from({length:entry.targetSets}, () => makeSet(entry.targetReps, entry.targetWeight)) });
  const addSet = () => onUpdate({ ...entry, sets: [...entry.sets, makeSet(entry.targetReps, entry.targetWeight)] });
  const rmSet = (id) => { if (entry.sets.length<=1) return; onUpdate({ ...entry, sets: entry.sets.filter(s=>s.id!==id) }); };

  const swapOpts = editMode ? [] : allExercises.filter(ex => entry.similarExercises.includes(ex.id) && !addedIds.has(ex.id));
  const doSwap = (ex) => { if (editMode) return; onUpdate({ ...makeEntry(ex), entryId: entry.entryId, expanded: true }); };

  return (
    <div className={`excard ${entry.expanded?"open":""}`}>
      <div className="exhdr" onClick={() => onUpdate({...entry, expanded:!entry.expanded, showSwap:false})}>
        <div className="exname">{entry.name}</div>
        <span className="mtag" style={{background:mc.bg, borderColor:mc.border, color:mc.text}}>{entry.muscleGroup}</span>
        <div className="hdr-r">
          <div className="pips">{entry.sets.slice(0,8).map(s => <div key={s.id} className={`pip ${s.done?"on":""}`} />)}</div>
          <button className="hbtn sw" onClick={e=>{e.stopPropagation(); onUpdate({...entry,showSwap:!entry.showSwap,expanded:true});}}>⇄</button>
          <button className="hbtn dl" onClick={e=>{e.stopPropagation(); onRemove();}}>✕</button>
        </div>
      </div>

      {entry.expanded && <>
        {/* Hide swap panel in edit mode */}
        {!editMode && entry.showSwap && (
          <div className="swappanel">
            <div className="swaplbl">Swap — same muscle</div>
            {swapOpts.length===0
              ? <div style={{fontSize:10,color:"var(--muted)"}}>No alternatives available</div>
              : <div className="swaplist">{swapOpts.map(ex=>(
                  <div key={ex.id} className="swapitem" onClick={()=>doSwap(ex)}>
                    <span>{ex.name}</span><span className="swarr">→</span>
                  </div>
                ))}</div>
            }
          </div>
        )}

        <div className="trow">
          <span className="tlbl">Target</span>
          <NumInput className="nin" value={entry.targetSets} onChange={v=>onUpdate({...entry,targetSets:v})} onClick={e=>e.stopPropagation()} />
          <span className="sp">×</span>
          <NumInput className="nin" value={entry.targetReps} onChange={v=>onUpdate({...entry,targetReps:v})} onClick={e=>e.stopPropagation()} />
          <span className="sp">@</span>
          <NumInput className="nin w" value={entry.targetWeight} step={2.5} onChange={v=>onUpdate({...entry,targetWeight:v})} onClick={e=>e.stopPropagation()} />
          <span className="sp">kg</span>
          <button className="apbtn" onClick={e=>{e.stopPropagation();apply();}}>Apply to all</button>
        </div>

        <div className="slist">
          {entry.sets.map((set,i) => (
            <div key={set.id} className={`srow ${set.done?"done":""}`}>
              <span className="snum">S{i+1}</span>
              <div className="sinputs">
                <NumInput className="sin" value={set.reps} onChange={v=>upd(set.id,"reps",v)} />
                <span className="ssep">×</span>
                <NumInput className="sin w" value={set.weight} step={2.5} onChange={v=>upd(set.id,"weight",v)} />
                <span className="sunit">kg</span>
              </div>
              {/* Hide rest and set completed buttons in edit mode */}
              {!editMode && set.done && (
                <button className="restbtn" onClick={()=>onStartRest()}>
                  {restRem != null && restRem > 0 ? `⏱ ${pad(Math.floor(restRem/60))}:${pad(restRem%60)}` : "⏱ Rest"}
                </button>
              )}
              <button className="rmbtn" onClick={()=>rmSet(set.id)}>−</button>
              {!editMode && (
                <button className={`tickbtn ${set.done?"on":""}`} onClick={()=>tick(set.id)}>✓</button>
              )}
            </div>
          ))}
          <button className="addbtn" onClick={addSet}>+ Add Set</button>
        </div>
      </>}
    </div>
  );
}

// ── Browser ───────────────────────────────────────────────────────────────────
function Browser({ allExercises, addedIds, onAdd, onClose, onOpenCustom }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("all");
  const [muscle, setMuscle] = useState("all");

  const cats    = ["all","push","pull","legs","upper","lower","full body"];
  const muscles = ["all","chest","back","shoulders","arms","legs","core"];

  const filtered = allExercises.filter(ex => {
    return ex.name.toLowerCase().includes(search.toLowerCase())
      && (cat==="all" || ex.category===cat)
      && (muscle==="all" || ex.muscleGroup===muscle);
  });
  const grouped = filtered.reduce((a,ex) => { (a[ex.muscleGroup]=a[ex.muscleGroup]||[]).push(ex); return a; }, {});

  return (
    <div className="moverlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle" />
        <div className="mhdr">
          <span className="mtitle">Add Exercise</span>
          <button className="mclosebtn" onClick={onClose}>✕</button>
        </div>
        <div className="msearch">
          <span className="searchic">🔍</span>
          <input className="searchin" placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} autoFocus />
        </div>
        <div className="frow">
          {cats.map(c=><button key={c} className={`fchip ${cat===c?"on":""}`} onClick={()=>setCat(c)}>{c==="all"?"ALL":c.toUpperCase()}</button>)}
        </div>
        <div className="frow" style={{paddingTop:0}}>
          {muscles.map(m=><button key={m} className={`fchip ${muscle===m?"on":""}`}
            style={muscle===m&&m!=="all"?{background:MUSCLE_COLORS[m]?.bg,borderColor:MUSCLE_COLORS[m]?.border,color:MUSCLE_COLORS[m]?.text}:{}}
            onClick={()=>setMuscle(m)}>{m==="all"?"ALL":m.toUpperCase()}</button>)}
        </div>
        <div className="blist">
          {Object.keys(grouped).length===0 && <div className="empty"><div className="emico">🔍</div><div className="emtxt">No results</div></div>}
          {Object.entries(grouped).map(([grp,exs]) => {
            const mc = MUSCLE_COLORS[grp]||{};
            return (
              <div key={grp}>
                <div className="grplbl" style={{color:mc.text||"var(--muted)"}}>{grp.toUpperCase()}</div>
                {exs.map(ex => {
                  const isAdded = addedIds.has(ex.id);
                  return (
                    <div key={ex.id} className={`bitem ${isAdded?"added":""}`} onClick={()=>!isAdded&&onAdd(ex)}>
                      <div className="binfo">
                        <div className="bname">{ex.name}</div>
                        <div className="bmeta">
                          <span className="mtag" style={{background:mc.bg,borderColor:mc.border,color:mc.text,fontSize:7}}>{grp}</span>
                          <span className="bequip">{ex.equipment}</span>
                        </div>
                      </div>
                      <div className="bstatus">{isAdded?"✓":"+"}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          <div style={{marginTop:8}}>
            <button className="addexbtn" onClick={onOpenCustom}>+ Create Custom</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Custom Exercise ───────────────────────────────────────────────────────────
function CustomModal({ onSave, onClose }) {
  const [name, setName]           = useState("");
  const [category, setCategory]   = useState("push");
  const [muscleGroup, setMG]      = useState("chest");
  const [equipment, setEquip]     = useState("barbell");

  const cats    = ["push","pull","legs","upper","lower","full body"];
  const muscles = ["chest","back","shoulders","arms","legs","core"];
  const equips  = ["barbell","dumbbell","cable","machine","bodyweight"];

  const save = () => {
    if (!name.trim()) return;
    const ex = { id:"c_"+uid(), name:name.trim(), category, muscleGroup, equipment, similarExercises:[], custom:true };
    storage.saveCustomExercise(ex);
    onSave(ex);
  };

  return (
    <div className="moverlay" onClick={onClose}>
      <div className="cmodal" onClick={e=>e.stopPropagation()}>
        <div className="mhandle" style={{margin:"0 auto 10px"}} />
        <div className="ctitle">New Exercise</div>
        <div className="flbl">Name</div>
        <input className="fin" placeholder="e.g. Close Grip Bench" value={name} onChange={e=>setName(e.target.value)} autoFocus />
        <div className="flbl">Category</div>
        <div className="chipgrp">{cats.map(c=><button key={c} className={`selchip ${category===c?"on":""}`} onClick={()=>setCategory(c)}>{c}</button>)}</div>
        <div className="flbl">Muscle Group</div>
        <div className="chipgrp">{muscles.map(m=><button key={m} className={`selchip ${muscleGroup===m?"on":""}`}
          style={muscleGroup===m?{background:MUSCLE_COLORS[m]?.bg,borderColor:MUSCLE_COLORS[m]?.border,color:MUSCLE_COLORS[m]?.text}:{}}
          onClick={()=>setMG(m)}>{m}</button>)}</div>
        <div className="flbl">Equipment</div>
        <div className="chipgrp">{equips.map(e=><button key={e} className={`selchip ${equipment===e?"on":""}`} onClick={()=>setEquip(e)}>{e}</button>)}</div>
        <button className="creatbtn" onClick={save}>Create Exercise</button>
        <button className="cancbtn" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

// ── Summary ───────────────────────────────────────────────────────────────────
function Summary({ session, onNew }) {
  const totalSets = session.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const totalVol  = session.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).reduce((b,s)=>b+s.reps*s.weight,0),0);
  const dur = session.endTime - session.startTime;
  const prev = storage.getSessions().filter(s=>s.id!==session.id);
  const prs = [];
  session.exercises.forEach(entry => {
    const maxNow = Math.max(...entry.sets.filter(s=>s.done).map(s=>s.weight),0);
    if (!maxNow) return;
    const prevMax = prev.reduce((best,sess) => {
      const m = sess.exercises?.find(e=>e.exerciseId===entry.exerciseId);
      if (!m) return best;
      return Math.max(best,...(m.sets||[]).filter(s=>s.done).map(s=>s.weight),0);
    },0);
    if (maxNow>prevMax) prs.push({name:entry.name,weight:maxNow});
  });

  return (
    <div className="summary">
      <div className="sumhdr">
        <div className="sumicon">🏆</div>
        <div className="sumtitle">Complete</div>
        <div className="sumdate">{session.name} · {fmtDate(new Date(session.startTime))}</div>
      </div>
      <div className="statgrid">
        <div className="statcard"><div className="statval">{fmtMs(dur)}</div><div className="statlbl">Duration</div></div>
        <div className="statcard"><div className="statval">{totalSets}</div><div className="statlbl">Sets Done</div></div>
        <div className="statcard"><div className="statval">{session.exercises.length}</div><div className="statlbl">Exercises</div></div>
        <div className="statcard"><div className="statval">{totalVol>0?`${(totalVol/1000).toFixed(1)}t`:"—"}</div><div className="statlbl">Volume</div></div>
      </div>
      {prs.length>0 && (
        <div className="prsec">
          <div className="seclbl" style={{marginBottom:5}}>🎉 New PRs</div>
          {prs.map((pr,i)=>(
            <div key={i} className="pritem">
              <span>🥇</span><span className="prname">{pr.name}</span>
              <span className="prw">{pr.weight}kg</span>
            </div>
          ))}
        </div>
      )}
      <div className="sumexes">
        {session.exercises.map(e=>{
          const done=e.sets.filter(s=>s.done);
          const top=done.length?Math.max(...done.map(s=>s.weight)):0;
          return (
            <div key={e.entryId} className="seitem">
              <div className="sename">{e.name}</div>
              <div className="semeta">{done.length} sets{top>0?` · ${top}kg`:""}</div>
            </div>
          );
        })}
      </div>
      <button className="newbtn" onClick={onNew}>New Workout</button>
    </div>
  );
}

// ── Home ──────────────────────────────────────────────────────────────────────
function Home({ onStart, onExplore, onHistory, onMyTemplates, hasActiveSession, onResume }) {
  const recent = storage.getSessions().slice(-3).reverse();
  return (
    <div className="home">
      <div className="homelogo">Lift<br/>Log</div>
      <div className="homesub">Track your gains</div>
      {hasActiveSession && (
        <button className="resumebtn" onClick={onResume}>▶ Resume Workout</button>
      )}
      <button className="startbtn" onClick={onStart}>
        {hasActiveSession ? "New Workout" : "Start Workout"}
      </button>
      <div className="home-actions">
        <button className="homebtn" onClick={onHistory}>Past Sessions</button>
        <button className="homebtn" onClick={onMyTemplates}>My Workouts</button>
        <button className="homebtn" onClick={onExplore}>Exercises</button>
      </div>
      {recent.length>0 && (
        <div className="recent">
          <div className="reclbl">Recent</div>
          {recent.map(s=>{
            const vol=s.exercises?.reduce((a,e)=>a+(e.sets||[]).filter(x=>x.done).reduce((b,x)=>b+x.reps*x.weight,0),0)||0;
            return (
              <div key={s.id} className="recitem">
                <div>
                  <div className="recname">{s.name}</div>
                  <div className="recmeta">{fmtDate(new Date(s.startTime))} · {s.exercises?.length||0} exercises</div>
                </div>
                {vol>0&&<div className="recvol">{(vol/1000).toFixed(1)}t</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Exercise Explore Screen ───────────────────────────────────────────────────
function ExploreScreen({ allExercises, onBack }) {
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState("all");
  const [muscle, setMuscle]   = useState("all");
  const [selected, setSelected] = useState(null);

  const cats    = ["all","push","pull","legs","upper","lower","full body"];
  const muscles = ["all","chest","back","shoulders","arms","legs","core"];

  const filtered = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(search.toLowerCase())
    && (cat==="all" || ex.category===cat)
    && (muscle==="all" || ex.muscleGroup===muscle)
  );
  const grouped = filtered.reduce((a,ex) => { (a[ex.muscleGroup]=a[ex.muscleGroup]||[]).push(ex); return a; }, {});

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">Exercise Library</span>
      </div>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div className="msearch" style={{margin:0}}>
          <span className="searchic">🔍</span>
          <input className="searchin" placeholder="Search exercises..." value={search} onChange={e=>setSearch(e.target.value)} />
        </div>
      </div>
      <div className="frow" style={{padding:"8px 12px 0"}}>
        {cats.map(c=><button key={c} className={`fchip ${cat===c?"on":""}`} onClick={()=>setCat(c)}>{c==="all"?"ALL":c.toUpperCase()}</button>)}
      </div>
      <div className="frow" style={{paddingTop:4,paddingBottom:4}}>
        {muscles.map(m=><button key={m} className={`fchip ${muscle===m?"on":""}`}
          style={muscle===m&&m!=="all"?{background:MUSCLE_COLORS[m]?.bg,borderColor:MUSCLE_COLORS[m]?.border,color:MUSCLE_COLORS[m]?.text}:{}}
          onClick={()=>setMuscle(m)}>{m==="all"?"ALL":m.toUpperCase()}</button>)}
      </div>
      <div className="xscroll">
        {Object.keys(grouped).length===0 && <div className="empty"><div className="emico">🔍</div><div className="emtxt">No results</div></div>}
        {Object.entries(grouped).map(([grp,exs]) => {
          const mc = MUSCLE_COLORS[grp]||{};
          return (
            <div key={grp}>
              <div className="grplbl" style={{color:mc.text||"var(--muted)"}}>{grp.toUpperCase()}</div>
              {exs.map(ex=>(
                <div key={ex.id} className="xitem" onClick={()=>setSelected(ex)}>
                  <div className="binfo">
                    <div className="bname">{ex.name}</div>
                    <div className="bmeta">
                      <span className="mtag" style={{background:mc.bg,borderColor:mc.border,color:mc.text,fontSize:7}}>{grp}</span>
                      <span className="bequip">{ex.equipment}</span>
                    </div>
                  </div>
                  <div className="xarr">›</div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="moverlay" onClick={()=>setSelected(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mhandle" />
            <div className="mhdr">
              <span className="mtitle">{selected.name}</span>
              <button className="mclosebtn" onClick={()=>setSelected(null)}>✕</button>
            </div>
            <div className="exdetail">
              <div className="exdetail-tags">
                <span className="mtag" style={{background:MUSCLE_COLORS[selected.muscleGroup]?.bg,borderColor:MUSCLE_COLORS[selected.muscleGroup]?.border,color:MUSCLE_COLORS[selected.muscleGroup]?.text}}>{selected.muscleGroup}</span>
                <span className="equiptag">{selected.equipment}</span>
                <span className="equiptag">{selected.category}</span>
              </div>
              {selected.description
                ? <div className="exdetail-desc">{selected.description}</div>
                : <div className="exdetail-desc" style={{color:"var(--muted)"}}>No description available.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── History Screen ─────────────────────────────────────────────────────────────
function HistoryDetail({ session, onBack }) {
  const totalSets = session.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const totalVol  = session.exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).reduce((b,s)=>b+s.reps*s.weight,0),0);
  const dur       = session.endTime ? session.endTime - session.startTime : 0;
  const [editing, setEditing] = useState(false);
  return editing ? (
    <SessionEditScreen
      origSession={session}
      onSave={(updated) => { setEditing(false); onBack(updated); }}
      onCancel={() => setEditing(false)}
    />
  ) : (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle" style={{fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{session.name}</span>
        <button className="hist-edit-btn" onClick={()=>setEditing(true)} style={{marginLeft:'auto'}}>Edit</button>
      </div>
      <div className="xscroll">
        <div className="statgrid" style={{marginBottom:12}}>
          <div className="statcard"><div className="statval">{fmtMs(dur)}</div><div className="statlbl">Duration</div></div>
          <div className="statcard"><div className="statval">{totalSets}</div><div className="statlbl">Sets Done</div></div>
          <div className="statcard"><div className="statval">{session.exercises.length}</div><div className="statlbl">Exercises</div></div>
          <div className="statcard"><div className="statval">{totalVol>0?`${(totalVol/1000).toFixed(1)}t`:"—"}</div><div className="statlbl">Volume</div></div>
        </div>
        <div className="sumexes">
          {session.exercises.map(e=>{
            const done=e.sets.filter(s=>s.done);
            const top=done.length?Math.max(...done.map(s=>s.weight)):0;
            const mc=MUSCLE_COLORS[e.muscleGroup]||{};
            return (
              <div key={e.entryId} className="seitem">
                <div>
                  <div className="sename">{e.name}</div>
                  <div className="semeta">{done.length} sets{top>0?` · ${top}kg`:""}</div>
                </div>
                <span className="mtag" style={{background:mc.bg,borderColor:mc.border,color:mc.text}}>{e.muscleGroup}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
// ── Session Edit Screen for Past Sessions ───────────────────────────────────
function SessionEditScreen({ origSession, onSave, onCancel }) {
  const [session, setSession] = useState(() => ({ ...origSession }));
  const [exercises, setExercises] = useState(() => origSession.exercises.map(e => ({ ...e, sets: e.sets.map(s => ({...s})) })));
  const [allExercises, setAllExercises] = useState(() => storage.getExercises());
  const addedIds = new Set(exercises.map(e=>e.exerciseId));
  const updateExercise = (u) => setExercises(p=>p.map(e=>e.entryId===u.entryId?u:e));
  const removeExercise = (id) => setExercises(p=>p.filter(e=>e.entryId!==id));
  const addExercise = (ex) => setExercises(p=>[...p, makeEntry(ex)]);
  const [showBrowser, setShowBrowser] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const doneSets = exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onCancel}>Cancel</button>
        <input className="sname-input" value={session.name} placeholder="Session name..."
          onChange={e=>setSession(s=>({...s,name:e.target.value}))} style={{flex:1,marginLeft:8}} />
        <button className="hist-save-btn" onClick={()=>{
          const updated = { ...session, exercises };
          storage.saveSession(updated);
          onSave(updated);
        }}>Save</button>
      </div>
      <div className="xscroll">
        <div className="secbar">
          <span className="seclbl">Exercises · {exercises.length}</span>
          <span className="secstat">{doneSets} sets done</span>
        </div>
        {exercises.length===0 && (
          <div className="empty"><div className="emico">💪</div><div className="emtxt">Add exercises to begin</div></div>
        )}
        {exercises.map(entry=>(
          <ExCard
            key={entry.entryId}
            entry={entry}
            allExercises={allExercises}
            onUpdate={updateExercise}
            onRemove={()=>removeExercise(entry.entryId)}
            addedIds={addedIds}
            onStartRest={null}
            restRem={null}
            editMode={true}
          />
        ))}
        <div className="addwrap">
          <button className="addexbtn" onClick={()=>setShowBrowser(true)}>+ Add Exercise</button>
        </div>
      </div>
      {showBrowser && (
        <Browser allExercises={allExercises} addedIds={addedIds}
          onAdd={ex=>{addExercise(ex);setShowBrowser(false);}}
          onClose={()=>setShowBrowser(false)}
          onOpenCustom={()=>{setShowBrowser(false);setShowCustom(true);}}
        />
      )}
      {showCustom && (
        <div className="moverlay">
          <CustomModal
            onSave={ex=>{setAllExercises(storage.getExercises());addExercise(ex);setShowCustom(false);}}
            onClose={()=>{setShowCustom(false);setShowBrowser(true);}}
          />
        </div>
      )}
    </div>
  );
}
}

function HistoryScreen({ onBack }) {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  useEffect(() => { setSessions(storage.getSessions().slice().reverse()); }, []);

  if (selected) return (
    <HistoryDetail
      session={selected}
      onBack={(updated) => {
        if (updated && updated.id) {
          setSessions(s => s.map(x => x.id === updated.id ? updated : x));
          setSelected(updated);
        } else {
          setSelected(null);
        }
      }}
    />
  );

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">History</span>
      </div>
      <div className="xscroll">
        {sessions.length===0 && (
          <div className="empty" style={{marginTop:40}}>
            <div className="emico">📋</div>
            <div className="emtxt">No completed workouts yet</div>
          </div>
        )}
        {sessions.map(s=>{
          const vol=s.exercises?.reduce((a,e)=>a+(e.sets||[]).filter(x=>x.done).reduce((b,x)=>b+x.reps*x.weight,0),0)||0;
          const dur=s.endTime?s.endTime-s.startTime:0;
          const totalSets=s.exercises?.reduce((a,e)=>a+(e.sets||[]).filter(x=>x.done).length,0)||0;
          return (
            <div key={s.id} className="histitem" onClick={()=>setSelected(s)}>
              <div style={{flex:1,minWidth:0}}>
                <div className="recname">{s.name}</div>
                <div className="recmeta">
                  {fmtDate(new Date(s.startTime))} · {s.exercises?.length||0} exercises · {totalSets} sets{dur>0?` · ${fmtMs(dur)}`:""}
                </div>
              </div>
              {vol>0 && <div className="recvol">{(vol/1000).toFixed(1)}t</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Template Editor Screen ────────────────────────────────────────────────────
function TemplateEditorScreen({ allExercises, template, onSave, onBack }) {
  const isNew = !template;
  const exMap = new Map(allExercises.map(e => [e.id, e]));
  const [name, setName] = useState(template?.name || "");
  const [entries, setEntries] = useState(
    (template?.exercises || []).map(te => ({
      ...te,
      _name: exMap.get(te.exerciseId)?.name || te.exerciseId,
      _muscleGroup: exMap.get(te.exerciseId)?.muscleGroup || "",
    }))
  );
  const [showPicker, setShowPicker] = useState(false);

  const addExercise = (ex) => {
    setEntries(p => [...p, { exerciseId: ex.id, _name: ex.name, _muscleGroup: ex.muscleGroup, targetSets: DEFAULT_TARGET_SETS, targetReps: DEFAULT_TARGET_REPS, targetWeight: DEFAULT_TARGET_WEIGHT }]);
    setShowPicker(false);
  };
  const removeEntry = (idx) => setEntries(p => p.filter((_, i) => i !== idx));
  const updateEntry = (idx, field, val) => setEntries(p => p.map((e, i) => i === idx ? { ...e, [field]: +val || 0 } : e));

  const save = () => {
    if (!name.trim() || entries.length === 0) return;
    const t = {
      id: template?.id || USER_TEMPLATE_ID_PREFIX + uid(),
      name: name.trim(),
      exercises: entries.map(({ exerciseId, targetSets, targetReps, targetWeight }) => ({ exerciseId, targetSets, targetReps, targetWeight })),
    };
    storage.saveUserTemplate(t);
    onSave();
  };

  const addedIds = new Set(entries.map(e => e.exerciseId));

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">{isNew ? "New Template" : "Edit Template"}</span>
      </div>
      <div className="xscroll">
        <div style={{marginBottom:12}}>
          <div className="flbl">Template name</div>
          <input className="fin" placeholder="e.g. Monday Push..." value={name} onChange={e=>setName(e.target.value)} autoFocus />
        </div>

        <div className="flbl" style={{marginBottom:5}}>Exercises · {entries.length}</div>
        {entries.length === 0 && (
          <div style={{textAlign:"center",padding:"16px 0",color:"var(--muted)",fontSize:11}}>Add exercises below</div>
        )}
        {entries.map((te, idx) => {
          const mc = MUSCLE_COLORS[te._muscleGroup] || {};
          return (
            <div key={idx} className="tpe-row">
              <div className="tpe-info">
                <div className="tpe-name">{te._name}</div>
                {te._muscleGroup && <span className="mtag" style={{background:mc.bg,borderColor:mc.border,color:mc.text,fontSize:7,marginTop:3,display:"inline-block"}}>{te._muscleGroup}</span>}
              </div>
              <div className="tpe-inputs">
                <NumInput className="nin" value={te.targetSets} onChange={v=>updateEntry(idx,"targetSets",v)} />
                <span className="sp">×</span>
                <NumInput className="nin" value={te.targetReps} onChange={v=>updateEntry(idx,"targetReps",v)} />
                <span className="sp">@</span>
                <NumInput className="nin w" value={te.targetWeight} step={2.5} onChange={v=>updateEntry(idx,"targetWeight",v)} />
                <span className="sp" style={{marginLeft:1}}>kg</span>
              </div>
              <button className="tpe-rm" onClick={()=>removeEntry(idx)}>−</button>
            </div>
          );
        })}

        <button className="addexbtn" style={{marginTop:4}} onClick={()=>setShowPicker(true)}>+ Add Exercise</button>

        <button className="new-tmpl-btn" onClick={save} disabled={!name.trim() || entries.length === 0}>
          {isNew ? "Create Template" : "Save Changes"}
        </button>
      </div>

      {showPicker && (
        <Browser
          allExercises={allExercises}
          addedIds={addedIds}
          onAdd={addExercise}
          onClose={()=>setShowPicker(false)}
          onOpenCustom={()=>setShowPicker(false)}
        />
      )}
    </div>
  );
}

// ── My Workouts Screen ───────────────────────────────────────────────────────
function MyTemplatesScreen({ allExercises, onBack }) {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null); // null = list, false = new, obj = edit

  const reload = () => setTemplates(storage.getUserTemplates());
  useEffect(() => { reload(); }, []);

  if (editing !== null) {
    return (
      <TemplateEditorScreen
        allExercises={allExercises}
        template={editing || undefined}
        onSave={() => { reload(); setEditing(null); }}
        onBack={() => setEditing(null)}
      />
    );
  }

  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">My Workouts</span>
      </div>
      <div className="xscroll">
        {templates.length === 0 ? (
          <div className="tmpl-empty-state">
            <div className="tmpl-empty-icon">📋</div>
            <div className="tmpl-empty-txt">No templates yet</div>
            <button className="new-tmpl-btn" style={{maxWidth:220,margin:"0 auto",display:"block"}} onClick={()=>setEditing(false)}>
              + Create Template
            </button>
          </div>
        ) : (
          <>
            {(() => {
              const exMap = new Map(allExercises.map(e => [e.id, e]));
              return templates.map(t => {
                const names = t.exercises.map(te => exMap.get(te.exerciseId)?.name).filter(Boolean);
                return (
                  <div key={t.id} className="tmpl-edit-row">
                    <div className="tmpl-edit-info">
                      <div className="tmpl-edit-name">{t.name}</div>
                      <div className="tmpl-edit-meta">{names.join(" · ") || "No exercises"}</div>
                    </div>
                    <div className="tmpl-edit-btns">
                      <button className="tmpl-edit-btn" onClick={()=>setEditing(t)}>Edit</button>
                      <button className="tmpl-edit-btn del" onClick={()=>{ storage.deleteUserTemplate(t.id); reload(); }}>Delete</button>
                    </div>
                  </div>
                );
              });
            })()}
            <button className="new-tmpl-btn" onClick={()=>setEditing(false)}>+ New Template</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Template Select Screen ───────────────────────────────────────────────────
function TemplateSelectScreen({ allExercises, onStart, onBack }) {
  const userTemplates = storage.getUserTemplates();
  const exMap = new Map(allExercises.map(e => [e.id, e]));
  return (
    <div className="xscreen">
      <div className="xhdr">
        <button className="backbtn" onClick={onBack}>← Back</button>
        <span className="xtitle">Start Workout</span>
      </div>
      <div className="xscroll">
        <div className="grplbl">Quick Start</div>
        <div className="tmpl-item" onClick={()=>onStart(null)}>
          <div className="tmpl-info">
            <div className="tmpl-name">Empty Workout</div>
            <div className="tmpl-exes">Start fresh — add exercises manually</div>
          </div>
          <div className="tmpl-arr">+</div>
        </div>
        {userTemplates.length > 0 && (
          <>
            <div className="grplbl" style={{marginTop:10}}>Your workouts</div>
            {userTemplates.map(t=>{
              const names = t.exercises.map(te=>exMap.get(te.exerciseId)?.name).filter(Boolean);
              return (
                <div key={t.id} className="tmpl-item" onClick={()=>onStart(t)}>
                  <div className="tmpl-info">
                    <div className="tmpl-name">{t.name}</div>
                    <div className="tmpl-exes">{names.join(" · ")}</div>
                  </div>
                  <div className="tmpl-arr">→</div>
                </div>
              );
            })}
          </>
        )}
        <div className="grplbl" style={{marginTop:10}}>Preset workouts</div>
        {TEMPLATES.map(t=>{
          const names = t.exercises.map(te=>exMap.get(te.exerciseId)?.name).filter(Boolean);
          return (
            <div key={t.id} className="tmpl-item" onClick={()=>onStart(t)}>
              <div className="tmpl-info">
                <div className="tmpl-name">{t.name}</div>
                <div className="tmpl-exes">{names.join(" · ")}</div>
              </div>
              <div className="tmpl-arr">→</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function LiftLog() {
  const [screen, setScreen]             = useState("home");
  const [session, setSession]           = useState(null);
  const [exercises, setExercises]       = useState([]);
  const [showBrowser, setShowBrowser]   = useState(false);
  const [showCustom, setShowCustom]     = useState(false);
  const [showRest, setShowRest]         = useState(false);
  const [restEndTime, setRestEndTime]   = useState(null);
  const [restTotal, setRestTotal]       = useState(120);
  const [restRem, setRestRem]           = useState(null);
  const restTickRef                     = useRef(null);
  const [allExercises, setAllExercises] = useState([]);
  const [elapsed, setElapsed]           = useState(0);
  const timerRef = useRef(null);

  useEffect(() => { setAllExercises(storage.getExercises()); }, []);

  useEffect(() => {
    if (screen==="session" && session) {
      timerRef.current = setInterval(() => setElapsed(Date.now()-session.startTime), 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [screen, session]);

  useEffect(() => {
    clearInterval(restTickRef.current);
    if (!restEndTime) { setRestRem(null); return; }
    const tick = () => {
      const rem = Math.max(0, Math.ceil((restEndTime - Date.now()) / 1000));
      setRestRem(rem);
      if (rem === 0) { clearInterval(restTickRef.current); setShowRest(true); }
    };
    tick();
    restTickRef.current = setInterval(tick, 500);
    return () => clearInterval(restTickRef.current);
  }, [restEndTime]);

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
    setSession(s); setExercises(entries); setElapsed(0); setScreen("session");
  };

  const addExercise    = (ex) => setExercises(p=>[...p, makeEntry(ex)]);
  const updateExercise = (u)  => setExercises(p=>p.map(e=>e.entryId===u.entryId?u:e));
  const removeExercise = (id) => setExercises(p=>p.filter(e=>e.entryId!==id));

  const handleRestButton = () => {
    if (restEndTime && restRem > 0) {
      setShowRest(true);
    } else {
      setRestEndTime(Date.now() + restTotal * 1000);
      setShowRest(true);
    }
  };

  const finish = () => {
    const done = { ...session, exercises, endTime:Date.now() };
    storage.saveSession(done); setSession(done); setScreen("summary");
    setRestEndTime(null); setShowRest(false);
  };
  const cancel = () => { setExercises([]); setSession(null); setScreen("home"); setRestEndTime(null); setShowRest(false); };
  const goHome  = () => setScreen("home");

  const addedIds = new Set(exercises.map(e=>e.exerciseId));
  const doneSets = exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0);
  const hasActiveSession = session && !session.endTime;

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {screen==="session" && (
          <div className="topbar">
            <button className="homebtn-topbar" onClick={goHome}>← Home</button>
            <input className="sname-input" value={session?.name||""} placeholder="Session name..."
              onChange={e=>setSession(s=>({...s,name:e.target.value}))} />
            <div className="topbar-r">
              <div className="live-dot" />
              <div className="clock">{fmtMs(elapsed)}</div>
            </div>
          </div>
        )}

        {screen==="home" && (
          <Home
            onStart={()=>setScreen("templateselect")}
            onExplore={()=>setScreen("explore")}
            onHistory={()=>setScreen("history")}
            onMyTemplates={()=>setScreen("mytemplates")}
            hasActiveSession={hasActiveSession}
            onResume={()=>setScreen("session")}
          />
        )}
        {screen==="templateselect" && (
          <TemplateSelectScreen
            allExercises={allExercises}
            onStart={t=>{startSession(t);}}
            onBack={()=>setScreen("home")}
          />
        )}
        {screen==="explore" && <ExploreScreen allExercises={allExercises} onBack={()=>setScreen("home")} />}
        {screen==="history" && <HistoryScreen onBack={()=>setScreen("home")} />}
        {screen==="mytemplates" && <MyTemplatesScreen allExercises={allExercises} onBack={()=>setScreen("home")} />}
        {screen==="summary" && session && <Summary session={session} onNew={()=>{setScreen("home");setSession(null);}} />}

        {screen==="session" && session && <>
          <div className="exsec">
            <div className="secbar">
              <span className="seclbl">Exercises · {exercises.length}</span>
              <span className="secstat">{doneSets} sets done</span>
            </div>
            {exercises.length===0 && (
              <div className="empty"><div className="emico">💪</div><div className="emtxt">Add exercises to begin</div></div>
            )}
            {exercises.map(entry=>(
              <ExCard key={entry.entryId} entry={entry} allExercises={allExercises}
                onUpdate={updateExercise} onRemove={()=>removeExercise(entry.entryId)}
                addedIds={addedIds} onStartRest={handleRestButton} restRem={restRem} />
            ))}
          </div>
          <div className="addwrap">
            <button className="addexbtn" onClick={()=>setShowBrowser(true)}>+ Add Exercise</button>
          </div>
          <div className="botbar">
            <button className="discbtn" onClick={cancel}>Cancel</button>
            <button className="finbtn" onClick={finish} disabled={exercises.length===0}>Finish Workout</button>
          </div>
        </>}

        {showBrowser && (
          <Browser allExercises={allExercises} addedIds={addedIds}
            onAdd={ex=>{addExercise(ex);}}
            onClose={()=>setShowBrowser(false)}
            onOpenCustom={()=>{setShowBrowser(false);setShowCustom(true);}}
          />
        )}
        {showCustom && (
          <div className="moverlay">
            <CustomModal
              onSave={ex=>{setAllExercises(storage.getExercises());addExercise(ex);setShowCustom(false);}}
              onClose={()=>{setShowCustom(false);setShowBrowser(true);}}
            />
          </div>
        )}
        {showRest && restEndTime && (
          <RestTimer
            endTime={restEndTime}
            total={restTotal}
            onSetTotal={(s) => { setRestTotal(s); setRestEndTime(Date.now() + s * 1000); }}
            onClose={() => setShowRest(false)}
            onSkip={() => { setRestEndTime(null); setShowRest(false); }}
          />
        )}
      </div>
    </>
  );
}
