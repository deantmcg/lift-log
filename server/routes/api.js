const express = require('express');
const router = express.Router();
const db = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_dev_key';

// --- AUTHENTICATION ---
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const result = await db.query('SELECT id, password_hash FROM users WHERE username = $1 OR email = $1', [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    
    const user = result.rows[0];
    const matchRes = await db.query('SELECT password_hash = crypt($1, password_hash) AS match FROM users WHERE id = $2', [password, user.id]);
    if (!matchRes.rows[0].match) return res.status(401).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1y' });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Authentication required' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token malformed' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.userId = decoded.userId;
    next();
  });
};

router.use(authenticate);

// --- SETTINGS ---
router.get('/settings', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM get_user_settings($1)', [req.userId]);
    if (r.rows.length === 0) return res.json({ theme: "green", defaultRest: 120, showTimer: true });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    const { theme, defaultRest, showTimer } = req.body;
    await db.query('CALL upsert_user_settings($1, $2, $3, $4)', [req.userId, theme, defaultRest, showTimer]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- EXERCISES ---
router.get('/exercises', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM get_exercises($1)', [req.userId]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/exercises', async (req, res) => {
  try {
    const { name, muscleGroup, equipment, category, description } = req.body;
    const r = await db.query('SELECT create_custom_exercise($1, $2, $3, $4, $5, $6) AS id', [req.userId, name, muscleGroup, equipment, category, description]);
    res.json({ success: true, id: r.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- WORKOUTS ---
router.get('/workouts', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM get_workouts($1)', [req.userId]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/workouts', async (req, res) => {
  try {
    const { name, exercises } = req.body;
    const r = await db.query('SELECT create_workout($1, $2, $3::jsonb) AS id', [req.userId, name, JSON.stringify(exercises)]);
    res.json({ success: true, id: r.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/workouts/:id', async (req, res) => {
  try {
    await db.query('CALL delete_workout($1, $2)', [req.userId, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- SESSIONS ---
router.get('/sessions', async (req, res) => {
  try {
    const r = await db.query('SELECT * FROM get_sessions($1)', [req.userId]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sessions', async (req, res) => {
  try {
    const { name, startTime, endTime, totalVolume, exercises } = req.body;
    const r = await db.query('SELECT create_session($1, $2, $3, $4, $5, $6::jsonb) AS id',
      [req.userId, name, new Date(startTime), new Date(endTime), totalVolume, JSON.stringify(exercises)]);
    res.json({ success: true, id: r.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
