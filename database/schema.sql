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
    target_reps INTEGER,
    target_weight NUMERIC
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

-- ==========================================
-- STORED PROCEDURES & NATIVE API FUNCTIONS
-- ==========================================

-- Settings
DROP FUNCTION IF EXISTS get_user_settings(INTEGER);
CREATE OR REPLACE FUNCTION get_user_settings(p_user_id INTEGER)
RETURNS TABLE (theme VARCHAR, "defaultRest" INTEGER, "showTimer" BOOLEAN, email VARCHAR) AS $$
BEGIN
    RETURN QUERY 
    SELECT s.theme, s.default_rest_seconds AS "defaultRest", s.show_timer AS "showTimer", u.email::VARCHAR
    FROM user_settings s
    JOIN users u ON u.id = s.user_id
    WHERE s.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE upsert_user_settings(p_user_id INTEGER, p_theme VARCHAR, p_default_rest INTEGER, p_show_timer BOOLEAN)
AS $$
BEGIN
    INSERT INTO user_settings (user_id, theme, default_rest_seconds, show_timer)
    VALUES (p_user_id, p_theme, p_default_rest, p_show_timer)
    ON CONFLICT (user_id) DO UPDATE SET
        theme = EXCLUDED.theme,
        default_rest_seconds = EXCLUDED.default_rest_seconds,
        show_timer = EXCLUDED.show_timer;
END;
$$ LANGUAGE plpgsql;

-- Exercises
DROP FUNCTION IF EXISTS get_exercises(INTEGER);
CREATE OR REPLACE FUNCTION get_exercises(p_user_id INTEGER)
RETURNS TABLE (
    id INTEGER, 
    name VARCHAR, 
    "muscleGroup" VARCHAR, 
    equipment VARCHAR, 
    category VARCHAR, 
    description TEXT, 
    "isCustom" BOOLEAN,
    "lastWeight" NUMERIC
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        e.id, 
        e.name, 
        mg.name AS "muscleGroup", 
        eq.name AS equipment, 
        c.name AS category, 
        e.description, 
        e.is_custom AS "isCustom",
        (
            SELECT ss.weight 
            FROM session_sets ss
            JOIN session_exercises se ON se.id = ss.session_exercise_id
            JOIN sessions s ON s.id = se.session_id
            WHERE se.exercise_id = e.id AND s.user_id = p_user_id AND ss.is_completed = true
            ORDER BY s.start_time DESC, se.order_index DESC, ss.order_index DESC
            LIMIT 1
        ) AS "lastWeight"
    FROM exercises e
    JOIN muscle_groups mg ON e.muscle_group_id = mg.id
    JOIN equipment eq ON e.equipment_id = eq.id
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id IS NULL OR e.user_id = p_user_id
    ORDER BY e.name ASC;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE delete_session(p_user_id INTEGER, p_session_id VARCHAR)
AS $$
BEGIN
    DELETE FROM sessions WHERE id = p_session_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_custom_exercise(
    p_user_id INTEGER, 
    p_name VARCHAR, 
    p_muscle_group VARCHAR, 
    p_equipment VARCHAR, 
    p_category VARCHAR, 
    p_description TEXT
) RETURNS INTEGER AS $$
DECLARE
    v_mg_id INTEGER;
    v_eq_id INTEGER;
    v_cat_id INTEGER;
    v_ex_id INTEGER;
BEGIN
    INSERT INTO muscle_groups (name) VALUES (p_muscle_group) 
        ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING muscle_groups.id INTO v_mg_id;
    INSERT INTO equipment (name) VALUES (p_equipment) 
        ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING equipment.id INTO v_eq_id;
    INSERT INTO categories (name) VALUES (p_category) 
        ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING categories.id INTO v_cat_id;
        
    INSERT INTO exercises (user_id, name, muscle_group_id, equipment_id, category_id, description, is_custom)
    VALUES (p_user_id, p_name, v_mg_id, v_eq_id, v_cat_id, p_description, true)
    RETURNING exercises.id INTO v_ex_id;
    
    RETURN v_ex_id;
END;
$$ LANGUAGE plpgsql;

-- Workouts
CREATE OR REPLACE FUNCTION get_workouts(p_user_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    "isCustom" BOOLEAN,
    exercises JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id, 
        w.name, 
        w.is_custom AS "isCustom",
        COALESCE(
            json_agg(
                json_build_object(
                    'exerciseId', we.exercise_id,
                    'name', e.name,
                    'targetSets', COALESCE(we.target_sets, 3),
                    'targetReps', COALESCE(we.target_reps, 10),
                    'targetWeight', COALESCE(we.target_weight, 0)
                ) ORDER BY we.order_index ASC
            ) FILTER (WHERE we.id IS NOT NULL), '[]'::json
        ) AS exercises
    FROM workouts w
    LEFT JOIN workout_exercises we ON we.workout_id = w.id
    LEFT JOIN exercises e ON e.id = we.exercise_id
    WHERE w.user_id IS NULL OR w.user_id = p_user_id
    GROUP BY w.id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_workout(p_user_id INTEGER, p_name VARCHAR, p_exercises JSONB)
RETURNS INTEGER AS $$
DECLARE
    v_workout_id INTEGER;
    v_ex JSONB;
    v_idx INTEGER := 0;
BEGIN
    INSERT INTO workouts (user_id, name, is_custom) 
    VALUES (p_user_id, p_name, true) 
    RETURNING workouts.id INTO v_workout_id;
    
    FOR v_ex IN SELECT * FROM jsonb_array_elements(p_exercises)
    LOOP
        INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps, target_weight)
        VALUES (
            v_workout_id, 
            (v_ex->>'exerciseId')::INTEGER, 
            v_idx, 
            COALESCE((v_ex->>'targetSets')::INTEGER, 3), 
            COALESCE((v_ex->>'targetReps')::INTEGER, 10),
            (v_ex->>'targetWeight')::NUMERIC
        );
        v_idx := v_idx + 1;
    END LOOP;
    
    RETURN v_workout_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE delete_workout(p_user_id INTEGER, p_workout_id INTEGER)
AS $$
BEGIN
    DELETE FROM workouts WHERE id = p_workout_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Sessions
CREATE OR REPLACE FUNCTION get_sessions(p_user_id INTEGER)
RETURNS TABLE (
    id INTEGER,
    name VARCHAR,
    "startTime" TIMESTAMP WITH TIME ZONE,
    "endTime" TIMESTAMP WITH TIME ZONE,
    "totalVolume" DECIMAL(10,2),
    exercises JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id,
        s.name,
        s.start_time AS "startTime",
        s.end_time AS "endTime",
        s.total_volume AS "totalVolume",
        COALESCE(
            (
                SELECT json_agg(
                    json_build_object(
                        'exerciseId', se.exercise_id,
                        'name', e.name,
                        'sets', COALESCE(
                            (
                                SELECT json_agg(
                                    json_build_object(
                                        'id', ss.id,
                                        'reps', ss.reps,
                                        'weight', ss.weight,
                                        'done', ss.is_completed
                                    ) ORDER BY ss.order_index ASC
                                )
                                FROM session_sets ss
                                WHERE ss.session_exercise_id = se.id
                            ), '[]'::json
                        )
                    ) ORDER BY se.order_index ASC
                )
                FROM session_exercises se
                JOIN exercises e ON e.id = se.exercise_id
                WHERE se.session_id = s.id
            ), '[]'::json
        ) AS exercises
    FROM sessions s
    WHERE s.user_id = p_user_id
    ORDER BY s.start_time DESC;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_session(
    p_user_id INTEGER, 
    p_name VARCHAR, 
    p_start_time TIMESTAMP WITH TIME ZONE, 
    p_end_time TIMESTAMP WITH TIME ZONE, 
    p_total_volume DECIMAL,
    p_exercises JSONB
) RETURNS INTEGER AS $$
DECLARE
    v_session_id INTEGER;
    v_se_id INTEGER;
    v_ex JSONB;
    v_set JSONB;
    v_ex_idx INTEGER := 0;
    v_set_idx INTEGER := 0;
BEGIN
    INSERT INTO sessions (user_id, name, start_time, end_time, total_volume)
    VALUES (p_user_id, p_name, p_start_time, p_end_time, p_total_volume)
    RETURNING sessions.id INTO v_session_id;

    FOR v_ex IN SELECT * FROM jsonb_array_elements(p_exercises)
    LOOP
        INSERT INTO session_exercises (session_id, exercise_id, order_index)
        VALUES (v_session_id, (v_ex->>'exerciseId')::INTEGER, v_ex_idx)
        RETURNING session_exercises.id INTO v_se_id;
        
        v_set_idx := 0;
        FOR v_set IN SELECT * FROM jsonb_array_elements(v_ex->'sets')
        LOOP
            INSERT INTO session_sets (session_exercise_id, reps, weight, is_completed, order_index)
            VALUES (
                v_se_id, 
                (v_set->>'reps')::INTEGER, 
                (v_set->>'weight')::DECIMAL, 
                (v_set->>'done')::BOOLEAN, 
                v_set_idx
            );
            v_set_idx := v_set_idx + 1;
        END LOOP;
        
        v_ex_idx := v_ex_idx + 1;
    END LOOP;
    
    RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;
