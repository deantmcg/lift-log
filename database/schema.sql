-- database/schema.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- SAFELY REBUILD THE ENTIRE SCHEMA FOR INTEGER MIGRATION
DROP TABLE IF EXISTS session_sets CASCADE;
DROP TABLE IF EXISTS session_exercises CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS muscle_groups CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP PROCEDURE IF EXISTS create_user_account(VARCHAR, VARCHAR, TEXT);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stored Procedure to manually mint new user accounts securely
CREATE OR REPLACE PROCEDURE create_user_account(p_username VARCHAR, p_email VARCHAR, p_password TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    new_user_id INTEGER;
BEGIN
    INSERT INTO users (username, email, password_hash)
    VALUES (p_username, p_email, crypt(p_password, gen_salt('bf')))
    RETURNING id INTO new_user_id;

    INSERT INTO user_settings (user_id)
    VALUES (new_user_id);

    RAISE NOTICE 'SUCCESS: User % created successfully with ID %', p_username, new_user_id;
END;
$$;

CREATE TABLE user_settings (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'green',
    default_rest_seconds INTEGER DEFAULT 120,
    show_timer BOOLEAN DEFAULT true
);

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE muscle_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE exercises (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- NULL for system exercises
    name VARCHAR(100) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
    muscle_group_id INTEGER REFERENCES muscle_groups(id) ON DELETE RESTRICT,
    equipment_id INTEGER REFERENCES equipment(id) ON DELETE RESTRICT,
    description TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Prevents accidentally seeding two 'Bench Press' items in the global system lookup
CREATE UNIQUE INDEX IF NOT EXISTS idx_system_exercises_name ON exercises(name) WHERE user_id IS NULL;

CREATE TABLE workouts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_exercises (
    id SERIAL PRIMARY KEY,
    workout_id INTEGER REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    target_sets INTEGER, 
    target_reps INTEGER
);

CREATE TABLE sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_volume DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_exercises (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL
);

CREATE TABLE session_sets (
    id SERIAL PRIMARY KEY,
    session_exercise_id INTEGER REFERENCES session_exercises(id) ON DELETE CASCADE,
    reps INTEGER,
    weight DECIMAL(10,2),
    is_completed BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL
);
