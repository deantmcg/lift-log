-- database/schema.sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
    new_user_id UUID;
BEGIN
    INSERT INTO users (username, email, password_hash)
    VALUES (p_username, p_email, crypt(p_password, gen_salt('bf')))
    RETURNING id INTO new_user_id;

    INSERT INTO user_settings (user_id)
    VALUES (new_user_id);

    RAISE NOTICE 'SUCCESS: User % created successfully with ID %', p_username, new_user_id;
END;
$$;

CREATE TABLE IF NOT EXISTS user_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme VARCHAR(20) DEFAULT 'green',
    default_rest_seconds INTEGER DEFAULT 120,
    show_timer BOOLEAN DEFAULT true
);

-- SAFELY REBUILD EXERCISE & WORKOUT TABLES FOR NORMALIZATION (PRESERVES USERS!)
DROP TABLE IF EXISTS session_sets CASCADE;
DROP TABLE IF EXISTS session_exercises CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workouts CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS muscle_groups CASCADE;
DROP TABLE IF EXISTS equipment CASCADE;

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE muscle_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE equipment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL for system exercises
    name VARCHAR(100) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE RESTRICT,
    muscle_group_id UUID REFERENCES muscle_groups(id) ON DELETE RESTRICT,
    equipment_id UUID REFERENCES equipment(id) ON DELETE RESTRICT,
    description TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_system_exercises_name ON exercises(name) WHERE user_id IS NULL;

CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    target_sets INTEGER, 
    target_reps INTEGER
);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_volume DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE session_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL
);

CREATE TABLE session_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_exercise_id UUID REFERENCES session_exercises(id) ON DELETE CASCADE,
    reps INTEGER,
    weight DECIMAL(10,2),
    is_completed BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL
);
