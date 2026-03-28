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

CREATE TABLE IF NOT EXISTS exercises (
    id VARCHAR(50) PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    muscle_group VARCHAR(50) NOT NULL,
    equipment VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    description TEXT,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    exercise_id VARCHAR(50) REFERENCES exercises(id),
    order_index INTEGER NOT NULL,
    target_sets INTEGER, 
    target_reps INTEGER
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    total_volume DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS session_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    exercise_id VARCHAR(50) REFERENCES exercises(id),
    order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_exercise_id UUID REFERENCES session_exercises(id) ON DELETE CASCADE,
    reps INTEGER,
    weight DECIMAL(10,2),
    is_completed BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL
);
