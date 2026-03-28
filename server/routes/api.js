const express = require('express');
const router = express.Router();
const db = require('../db');

// We assume a single user for now for a local app
async function getUserId() {
  const res = await db.query('SELECT id FROM users LIMIT 1');
  if (res.rows.length > 0) return res.rows[0].id;
  
  // Create a default user if none exists
  const create = await db.query(
    'INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id',
    ['local_user', 'local@liftlog.app']
  );
  return create.rows[0].id;
}

// --- SETTINGS ---
router.get('/settings', async (req, res) => {
  try {
    const userId = await getUserId();
    const result = await db.query('SELECT theme, default_rest_seconds AS "defaultRest", show_timer AS "showTimer" FROM user_settings WHERE user_id = $1', [userId]);
    
    if (result.rows.length === 0) {
      return res.json({ theme: "green", defaultRest: 120, showTimer: true }); // Defaults
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const userId = await getUserId();
    const { theme, defaultRest, showTimer } = req.body;
    await db.query(`
      INSERT INTO user_settings (user_id, theme, default_rest_seconds, show_timer)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE SET
        theme = EXCLUDED.theme,
        default_rest_seconds = EXCLUDED.default_rest_seconds,
        show_timer = EXCLUDED.show_timer
    `, [userId, theme, defaultRest, showTimer]);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- EXERCISES ---
router.get('/exercises', async (req, res) => {
  try {
    const userId = await getUserId();
    // Get all system exercises + user's custom exercises
    const result = await db.query('SELECT * FROM exercises WHERE user_id IS NULL OR user_id = $1', [userId]);
    
    // Transform snake_case back to camelCase for the frontend
    const exercises = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      muscleGroup: row.muscle_group,
      equipment: row.equipment,
      category: row.category,
      description: row.description,
      isCustom: row.is_custom
    }));
    
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/exercises', async (req, res) => {
  try {
    const userId = await getUserId();
    const { id, name, muscleGroup, equipment, category, description } = req.body;
    
    await db.query(`
      INSERT INTO exercises (id, user_id, name, muscle_group, equipment, category, description, is_custom)
      VALUES ($1, $2, $3, $4, $5, $6, true)
    `, [id, userId, name, muscleGroup, equipment, category, description]);
    
    res.json({ success: true, id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- WORKOUTS ---
router.get('/workouts', async (req, res) => {
  try {
    const userId = await getUserId();
    // Get workouts (system + custom)
    const workoutsRes = await db.query('SELECT * FROM workouts WHERE user_id IS NULL OR user_id = $1', [userId]);
    
    const workouts = [];
    for (let w of workoutsRes.rows) {
      // Get exercises for this workout
      const exRes = await db.query(`
        SELECT we.*, e.name, e.muscle_group, e.equipment 
        FROM workout_exercises we
        JOIN exercises e ON e.id = we.exercise_id
        WHERE we.workout_id = $1
        ORDER BY we.order_index ASC
      `, [w.id]);
      
      workouts.push({
        id: w.id,
        name: w.name,
        isCustom: w.is_custom,
        exercises: exRes.rows.map(we => ({
          exerciseId: we.exercise_id,
          name: we.name,
          targetSets: we.target_sets,
          targetReps: we.target_reps
        }))
      });
    }
    
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/workouts', async (req, res) => {
  try {
    const userId = await getUserId();
    const { name, exercises } = req.body;
    
    await db.query('BEGIN');
    
    const wRes = await db.query(
      'INSERT INTO workouts (user_id, name, is_custom) VALUES ($1, $2, true) RETURNING id',
      [userId, name]
    );
    const workoutId = wRes.rows[0].id;
    
    let orderIndex = 0;
    for (const ex of exercises) {
      await db.query(`
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps)
        VALUES ($1, $2, $3, $4, $5)
      `, [workoutId, ex.exerciseId, orderIndex++, ex.targetSets || 3, ex.targetReps || 10]);
    }
    
    await db.query('COMMIT');
    res.json({ success: true, id: workoutId });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

router.delete('/workouts/:id', async (req, res) => {
  try {
    const userId = await getUserId();
    await db.query('DELETE FROM workouts WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- SESSIONS ---
router.get('/sessions', async (req, res) => {
  try {
    const userId = await getUserId();
    const sessionsRes = await db.query('SELECT * FROM sessions WHERE user_id = $1 ORDER BY start_time DESC', [userId]);
    
    const sessions = [];
    for (let s of sessionsRes.rows) {
      const seRes = await db.query(`
        SELECT se.*, e.name, e.muscle_group 
        FROM session_exercises se
        JOIN exercises e ON e.id = se.exercise_id
        WHERE se.session_id = $1
        ORDER BY se.order_index ASC
      `, [s.id]);
      
      const sessionExercises = [];
      for (let se of seRes.rows) {
        const setsRes = await db.query('SELECT * FROM session_sets WHERE session_exercise_id = $1 ORDER BY order_index ASC', [se.id]);
        sessionExercises.push({
          exerciseId: se.exercise_id,
          name: se.name,
          sets: setsRes.rows.map(set => ({
            id: set.id,
            reps: set.reps,
            weight: set.weight,
            done: set.is_completed
          }))
        });
      }
      
      sessions.push({
        id: s.id,
        name: s.name,
        startTime: s.start_time,
        endTime: s.end_time,
        totalVolume: s.total_volume,
        exercises: sessionExercises
      });
    }
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const userId = await getUserId();
    const { name, startTime, endTime, totalVolume, exercises } = req.body;
    
    await db.query('BEGIN');
    
    const sRes = await db.query(`
      INSERT INTO sessions (user_id, name, start_time, end_time, total_volume)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [userId, name, new Date(startTime), new Date(endTime), totalVolume]);
    
    const sessionId = sRes.rows[0].id;
    
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      const seRes = await db.query(`
        INSERT INTO session_exercises (session_id, exercise_id, order_index)
        VALUES ($1, $2, $3) RETURNING id
      `, [sessionId, ex.exerciseId, i]);
      const seId = seRes.rows[0].id;
      
      for (let j = 0; j < ex.sets.length; j++) {
        const set = ex.sets[j];
        await db.query(`
          INSERT INTO session_sets (session_exercise_id, reps, weight, is_completed, order_index)
          VALUES ($1, $2, $3, $4, $5)
        `, [seId, set.reps, set.weight, set.done, j]);
      }
    }
    
    await db.query('COMMIT');
    res.json({ success: true, id: sessionId });
  } catch (error) {
    await db.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
