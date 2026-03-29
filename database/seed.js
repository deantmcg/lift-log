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
    
    // 2. Run Data
    console.log("Inserting canonical SQL data...");
    const dataFile = path.join(__dirname, 'data.sql');
    const data = fs.readFileSync(dataFile, 'utf-8');
    await client.query(data);
    
    console.log("✅ Database brilliantly initialized and seeded.");
    
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await client.end();
  }
}

seed();
