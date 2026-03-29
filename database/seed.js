require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function seed() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/liftlog';
  console.log(`Connecting to database at ${connectionString}...`);
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log("Connected successfully.");

    // 1. Run Schema
    console.log("Applying schema...");
    const schemaFile = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaFile, 'utf-8');
    await client.query(schema);
    
    // 2. Parse Exercises
    console.log("Reading exercises from src/data/exercises.js...");
    const exDataFile = path.join(__dirname, '../src/data/exercises.js');
    const content = fs.readFileSync(exDataFile, 'utf8');
    const arrayString = content.replace('export const EXERCISES_JSON = ', '').trim().replace(/;$/, '');
    const exercises = eval('(' + arrayString + ')');
    
    // 3. Extract and insert lookups
    console.log("Building relational lookup tables...");
    const muscleGroups = [...new Set(exercises.map(e => e.muscleGroup))];
    const equipment = [...new Set(exercises.map(e => e.equipment))];
    const categories = [...new Set(exercises.map(e => e.category))];
    
    const mgMap = {}; const eqMap = {}; const catMap = {};
    
    for (const mg of muscleGroups) {
      const res = await client.query('INSERT INTO muscle_groups (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id', [mg]);
      mgMap[mg] = res.rows[0].id;
    }
    for (const eq of equipment) {
      const res = await client.query('INSERT INTO equipment (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id', [eq]);
      eqMap[eq] = res.rows[0].id;
    }
    for (const cat of categories) {
      const res = await client.query('INSERT INTO categories (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING id', [cat]);
      catMap[cat] = res.rows[0].id;
    }
    
    // 4. Insert Exercises
    console.log(`Safely UPSERTING ${exercises.length} root exercises by name...`);
    for (const ex of exercises) {
      await client.query(`
        INSERT INTO exercises (name, muscle_group_id, equipment_id, category_id, description, is_custom)
        VALUES ($1, $2, $3, $4, $5, false)
        ON CONFLICT (name) WHERE user_id IS NULL DO UPDATE SET
          muscle_group_id = EXCLUDED.muscle_group_id,
          equipment_id = EXCLUDED.equipment_id,
          category_id = EXCLUDED.category_id,
          description = EXCLUDED.description
      `, [ex.name, mgMap[ex.muscleGroup], eqMap[ex.equipment], catMap[ex.category], ex.description]);
    }
    
    console.log("✅ Database brilliantly initialized and seeded.");
    
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await client.end();
  }
}

seed();
