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
    // Simple eval-based parser to read JS array object cleanly without proper imports
    const arrayString = content.replace('export const EXERCISES_JSON = ', '').trim().replace(/;$/, '');
    const exercises = eval('(' + arrayString + ')');
    
    // 3. Insert Exercises
    console.log(`Inserting ${exercises.length} default exercises...`);
    // Delete existing standard exercises first to refresh
    await client.query('DELETE FROM exercises WHERE is_custom = false');
    
    for (const ex of exercises) {
      await client.query(`
        INSERT INTO exercises (id, name, muscle_group, equipment, category, description, is_custom)
        VALUES ($1, $2, $3, $4, $5, $6, false)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          muscle_group = EXCLUDED.muscle_group,
          equipment = EXCLUDED.equipment,
          category = EXCLUDED.category,
          description = EXCLUDED.description
      `, [ex.id, ex.name, ex.muscleGroup, ex.equipment, ex.category, ex.description]);
    }
    

    
    console.log("✅ Database initialized and seeded successfully.");
    
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await client.end();
  }
}

seed();
