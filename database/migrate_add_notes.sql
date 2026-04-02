-- Migration: add per-exercise notes to session_exercises
-- Run this once against your existing database.
-- Safe to run multiple times (uses IF NOT EXISTS / OR REPLACE).

-- 1. Add the notes column (no-op if it already exists)
ALTER TABLE session_exercises
    ADD COLUMN IF NOT EXISTS notes TEXT;

-- 2. Replace get_sessions to include notes in the exercises JSON
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
                        'notes', se.notes,
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

-- 3. Replace create_session to persist notes on each session_exercise row
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
        INSERT INTO session_exercises (session_id, exercise_id, order_index, notes)
        VALUES (v_session_id, (v_ex->>'exerciseId')::INTEGER, v_ex_idx, v_ex->>'notes')
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
