-- database/auth.sql

-- 1. Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Add password_hash column to existing users table securely
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 3. Stored Procedure to manually mint new user accounts securely
CREATE OR REPLACE PROCEDURE create_user_account(p_username VARCHAR, p_email VARCHAR, p_password TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Insert user with bf (Blowfish) hashed password
    INSERT INTO users (username, email, password_hash)
    VALUES (p_username, p_email, crypt(p_password, gen_salt('bf')))
    RETURNING id INTO new_user_id;

    -- Automatically attach default user settings
    INSERT INTO user_settings (user_id)
    VALUES (new_user_id);

    RAISE NOTICE 'SUCCESS: User % created successfully with ID %', p_username, new_user_id;
END;
$$;
