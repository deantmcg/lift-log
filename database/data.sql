-- database/data.sql

INSERT INTO muscle_groups (id, name) VALUES
(1, 'chest'),
(2, 'shoulders'),
(3, 'arms'),
(4, 'back'),
(5, 'legs'),
(6, 'core')
ON CONFLICT DO NOTHING;

INSERT INTO categories (id, name) VALUES
(1, 'push'),
(2, 'pull'),
(3, 'legs'),
(4, 'full body')
ON CONFLICT DO NOTHING;

INSERT INTO equipment (id, name) VALUES
(1, 'barbell'),
(2, 'dumbbell'),
(3, 'cable'),
(4, 'machine'),
(5, 'bodyweight')
ON CONFLICT DO NOTHING;

-- Canonical exercises — single source of truth.
-- Add, edit, or remove rows here; the INSERT and DELETE below both derive from this table
-- so there is no separate ID list to keep in sync.
DROP TABLE IF EXISTS _canonical_exercises;
CREATE TEMP TABLE _canonical_exercises (
    id              INTEGER,
    name            VARCHAR(100),
    category_id     INTEGER,
    muscle_group_id INTEGER,
    equipment_id    INTEGER,
    description     TEXT,
    is_custom       BOOLEAN
);

INSERT INTO _canonical_exercises VALUES
(1,  'Bench Press',                        1, 1, 1, 'Lie flat on a bench, grip the bar slightly wider than shoulders. Lower the bar to mid-chest under control, then press back up to full arm extension. The cornerstone chest mass builder.',                                   false),
(2,  'Incline Bench Press',                1, 1, 1, 'Set bench to 30–45°. Grip bar wider than shoulders and press from upper chest. Emphasises the upper pec and anterior deltoid for a full chest shape.',                                                                        false),
(3,  'Dumbbell Fly',                       1, 1, 2, 'Lie flat, hold dumbbells above chest with a slight elbow bend. Open arms wide in an arc, then squeeze chest to bring them back. Great chest isolation with a deep stretch.',                                                   false),
(4,  'Cable Crossover',                    1, 1, 3, 'Stand between cable towers with handles at shoulder height. Draw handles down and across in a wide arc, squeezing chest hard at the bottom. Provides constant tension throughout.',                                             false),
(5,  'Dumbbell Bench Press',               1, 1, 2, 'Lie flat on a bench with dumbbells. Press weights upward until arms are extended, then lower until elbows are slightly below the bench. Allows for a greater range of motion than the barbell.',                              false),
(6,  'Incline Dumbbell Press',             1, 1, 2, 'Bench set to 30-45°. Press dumbbells from upper chest level to full extension. Targets the clavicular head of the pectoralis major with more freedom of movement for the shoulders.',                                        false),
(7,  'Chest Press Machine',                1, 1, 4, 'Sit in the machine and push handles forward until arms are straight. Excellent for safely pushing to failure without needing a spotter.',                                                                                      false),
(8,  'Push-up',                            1, 1, 5, 'Start in a plank position, lower your chest to the floor, and push back up. The fundamental horizontal pushing movement for chest, shoulders, and triceps.',                                                                   false),
(9,  'Overhead Press',                     1, 2, 1, 'Stand or sit, grip bar at shoulder width just outside the neck. Press directly overhead to lockout, then lower back to the front delts. The primary shoulder mass builder; also works triceps heavily.',                      false),
(10, 'Lateral Raise',                      1, 2, 2, 'Hold dumbbells at sides, raise arms out to shoulder height with a slight elbow bend. Pause at top, lower slowly. Isolates the lateral deltoid — key for building shoulder width.',                                            false),
(11, 'Arnold Press',                       1, 2, 2, 'Start with dumbbells at chin height, palms facing you. Rotate palms outward as you press overhead, then reverse on the way down. Named after Schwarzenegger — hits all three deltoid heads.',                                 false),
(12, 'Dumbbell Shoulder Press',            1, 2, 2, 'Sit or stand with dumbbells at shoulder height. Press upward until arms are straight. Requires more stabilization than the barbell version and allows for a natural path of motion.',                                         false),
(13, 'Machine Shoulder Press',             1, 2, 4, 'Seated overhead press using a fixed-path machine. Ideal for isolating the deltoids with constant tension and minimal stability requirements.',                                                                                 false),
(14, 'Front Raise',                        1, 2, 2, 'Lift dumbbells in front of you to shoulder height with a slight elbow bend. Isolates the anterior (front) deltoid.',                                                                                                          false),
(15, 'Tricep Pushdown',                    1, 3, 3, 'Attach a rope or bar to a high cable. Keeping elbows pinned to your sides, push the handle down to full extension, then slowly return. Classic tricep isolation for the lateral and medial heads.',                           false),
(16, 'Skull Crusher',                      1, 3, 1, 'Lie on a bench and hold a barbell above your forehead with arms extended. Bend only at the elbows, lowering the bar toward your forehead, then extend back up. Directly targets the long head of triceps.',                  false),
(17, 'Dips',                               1, 3, 5, 'Support yourself on parallel bars. Lower your body by bending elbows until upper arms are parallel to the floor, then press back up to lockout. Compounds chest and triceps; lean forward for more chest emphasis.',           false),
(18, 'Overhead Dumbbell Extension',        1, 3, 2, 'Hold a dumbbell with both hands overhead. Lower it behind your neck by bending elbows, then extend back up. Heavily emphasizes the triceps'' long head.',                                                                     false),
(19, 'Close Grip Bench Press',             1, 3, 1, 'Standard bench press but with hands placed shoulder-width or closer. Shifts the primary load from the chest to the triceps.',                                                                                                  false),
(20, 'Deadlift',                           2, 4, 1, 'Stand over the bar, feet hip-width. Grip just outside your legs, brace your core, then drive through your heels and hips to stand tall. The ultimate full-body strength movement — builds the entire posterior chain.',       false),
(21, 'Barbell Row',                        2, 4, 1, 'Hinge forward to near-horizontal with a neutral spine. Pull the bar to your lower chest, driving elbows back and squeezing shoulder blades together at the top. The core back thickness builder.',                            false),
(22, 'Pull-up',                            2, 4, 5, 'Dead hang from a bar with an overhand grip wider than shoulders. Pull yourself up until chin clears the bar, then lower under control. The ultimate bodyweight back exercise; also develops biceps and grip strength.',        false),
(23, 'Lat Pulldown',                       2, 4, 3, 'Sit at a cable machine with a wide overhand grip. Pull the bar down to your upper chest, driving elbows toward your hips. Excellent lat isolator and a more accessible alternative to pull-ups.',                             false),
(24, 'Seated Cable Row',                   2, 4, 3, 'Sit upright at a low cable station, feet on the pads. Pull the handle into your lower chest keeping your back neutral, then return with a full arm extension. Develops mid-back thickness and rear deltoids.',                false),
(25, 'Face Pull',                          2, 2, 3, 'Pull a rope attachment toward your forehead, pulling the ends apart. Essential for rear deltoid development and rotator cuff health.',                                                                                         false),
(26, 'Single Arm Dumbbell Row',            2, 4, 2, 'Rest one hand and knee on a bench, pull a dumbbell to your hip with the other. Allows for deep lats stretch and corrects muscle imbalances.',                                                                                 false),
(27, 'T-Bar Row',                          2, 4, 1, 'Straddle a landmine bar or T-bar machine. Pull the weight toward your chest. Targets mid-back thickness and allows for heavy loading.',                                                                                       false),
(28, 'Straight Arm Pulldown',              2, 4, 3, 'Using a lat bar or rope, pull down with straight arms to your thighs. Isolates the lats by removing bicep involvement.',                                                                                                      false),
(29, 'Barbell Curl',                       2, 3, 1, 'Stand holding a barbell with an underhand grip. Curl from full extension to peak bicep contraction, then lower slowly. The classic bicep mass builder with the highest loading potential.',                                   false),
(30, 'Hammer Curl',                        2, 3, 2, 'Hold dumbbells with a neutral (hammer) grip, thumbs pointing up. Curl both arms simultaneously. Targets the brachialis and brachioradialis alongside the biceps for overall arm thickness.',                                  false),
(31, 'Preacher Curl',                      2, 3, 3, 'Rest your upper arms on the preacher bench pad, curl the bar up to full contraction. The pad eliminates shoulder involvement for isolated bicep work — great for building the peak.',                                          false),
(32, 'Dumbbell Curl',                      2, 3, 2, 'Stand or sit, curling dumbbells toward shoulders. Allows for wrist supination (turning palms up) which maximizes bicep peak contraction.',                                                                                    false),
(33, 'Concentration Curl',                 2, 3, 2, 'Sit on a bench, lean forward, and brace your elbow against your inner thigh. Eliminates momentum for pure bicep isolation.',                                                                                                  false),
(34, 'Squat',                              3, 5, 1, 'Barbell across upper back, feet shoulder-width. Break at hips and knees, descend until thighs are parallel to the floor, then drive back up. The king of leg exercises.',                                                    false),
(35, 'Leg Press',                          3, 5, 4, 'Sit in the machine with feet shoulder-width on the platform. Push the platform away to near full extension, then lower slowly. High-volume leg training with reduced spinal load.',                                           false),
(36, 'Hack Squat',                         3, 5, 4, 'Shoulders in the pads, feet low on the platform. Squat down until thighs reach 90°, then drive back up. Emphasises the quads while reducing lower back involvement.',                                                        false),
(37, 'Romanian Deadlift',                  3, 5, 1, 'Hold the bar at hip height, push hips back and hinge forward while keeping legs nearly straight. Feel the deep hamstring stretch at the bottom. The best hamstring builder.',                                                 false),
(38, 'Leg Curl',                           3, 5, 4, 'Lie face down on the machine with the pad behind your ankles. Curl your heels toward your glutes against resistance. Direct hamstring isolation.',                                                                             false),
(39, 'Leg Extension',                      3, 5, 4, 'Sit on the machine with the pad across your shins. Extend legs to full lockout, squeezing quads hard at the top. Pure quad isolation.',                                                                                       false),
(40, 'Calf Raise',                         3, 5, 4, 'Stand on the calf raise machine, balls of feet on the edge. Rise up as high as possible, squeeze hard, then lower below the platform for a full stretch.',                                                                   false),
(41, 'Standing Calf Raise',               3, 5, 2, 'Hold dumbbells and stand with the balls of your feet on a step edge. Raise heels as high as possible, then lower below step level for a full range of motion.',                                                               false),
(42, 'Bulgarian Split Squat',              3, 5, 2, 'One foot elevated on a bench behind you, squat down with the lead leg. Incredible for glute and quad development while improving balance.',                                                                                   false),
(43, 'Lunges',                             3, 5, 2, 'Step forward and lower hips until both knees are bent at 90 degrees. Can be done walking or stationary. Builds functional leg strength.',                                                                                     false),
(44, 'Goblet Squat',                       3, 5, 2, 'Hold a single dumbbell against your chest like a goblet and squat. Great for teaching proper squat form and heavy quad emphasis.',                                                                                            false),
(45, 'Hip Thrust',                         3, 5, 1, 'Upper back on a bench, barbell across hips. Drive hips toward the ceiling. The gold standard for glute isolation and strength.',                                                                                              false),
(46, 'Plank',                              4, 6, 5, 'Forearms and toes on the floor, body forming a straight line. Hold the position while breathing steadily. Builds anti-extension core stability and endurance.',                                                               false),
(47, 'Ab Rollout',                         4, 6, 5, 'Kneel with an ab wheel. Roll forward until your body is nearly flat, bracing core. Contract abs to pull back. An advanced anti-extension exercise.',                                                                          false),
(48, 'Cable Crunch',                       4, 6, 3, 'Kneel at a high cable with a rope attachment behind your head. Crunch down, bringing elbows toward knees. Allows progressive overload on abs.',                                                                               false),
(49, 'Hanging Leg Raise',                  4, 6, 5, 'Hang from a pull-up bar and lift legs to waist height. High-intensity exercise for the lower abdominals and hip flexors.',                                                                                                    false),
(50, 'Russian Twist',                      4, 6, 2, 'Sit on the floor, lean back slightly, and rotate a weight from side to side. Targets the obliques and rotational core strength.',                                                                                            false),
(51, 'Iso-Lateral Horizontal Chest Press', 1, 1, 4, 'Sit in a plate-loaded machine and press each arm independently. The iso-lateral design eliminates imbalances and allows a longer range of motion than standard machine press.',                                               false),
(52, 'Iso-Lateral Shoulder Press',         1, 2, 4, 'Seated overhead press machine with independent arm movement. Corrects left/right strength imbalances and reduces shoulder strain compared to barbell pressing.',                                                              false),
(53, 'Farmer''s Carry',                    3, 5, 2, 'Hold heavy dumbbells or handles at your sides and walk for a set distance or time. Builds grip strength, core stability, and full-body conditioning simultaneously.',                                                         false);

-- Seed system exercises; only inserts rows that do not yet exist
INSERT INTO exercises (id, name, category_id, muscle_group_id, equipment_id, description, is_custom)
SELECT id, name, category_id, muscle_group_id, equipment_id, description, is_custom
FROM _canonical_exercises
ON CONFLICT DO NOTHING;

-- Remove system exercises no longer in the canonical list above.
-- Exercises that users have already logged or added to a workout are kept to preserve their history.
DELETE FROM exercises
WHERE user_id IS NULL
  AND id NOT IN (SELECT id FROM _canonical_exercises)
  AND NOT EXISTS (SELECT 1 FROM session_exercises WHERE exercise_id = exercises.id)
  AND NOT EXISTS (SELECT 1 FROM workout_exercises WHERE exercise_id = exercises.id);

-- Resync sequential counters manually so subsequent user inserts don't collide
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('muscle_groups_id_seq', (SELECT MAX(id) FROM muscle_groups));
SELECT setval('equipment_id_seq', (SELECT MAX(id) FROM equipment));
SELECT setval('exercises_id_seq', (SELECT MAX(id) FROM exercises));

INSERT INTO workouts (id, name, is_custom) VALUES
(1, 'Push Day (Chest, Shoulders, Triceps)', false),
(2, 'Pull Day (Back, Biceps)', false),
(3, 'Leg Day (Quads, Hamstrings, Calves)', false)
ON CONFLICT DO NOTHING;

INSERT INTO workout_exercises (workout_id, exercise_id, order_index, target_sets, target_reps) VALUES
-- Push Day
(1, 1, 0, 4, 8),   -- Bench Press
(1, 2, 1, 3, 10),  -- Incline Bench Press
(1, 9, 2, 4, 8),   -- Overhead Press
(1, 10, 3, 3, 12), -- Lateral Raise
(1, 15, 4, 3, 12), -- Tricep Pushdown

-- Pull Day
(2, 20, 0, 4, 5),  -- Deadlift
(2, 21, 1, 4, 8),  -- Barbell Row
(2, 22, 2, 3, 10), -- Pull-up
(2, 25, 3, 3, 12), -- Face Pull
(2, 29, 4, 3, 10), -- Barbell Curl
(2, 30, 5, 3, 12), -- Hammer Curl

-- Leg Day
(3, 34, 0, 4, 5),  -- Squat
(3, 35, 1, 3, 10), -- Leg Press
(3, 37, 2, 3, 10), -- Romanian Deadlift
(3, 38, 3, 3, 12), -- Leg Curl
(3, 40, 4, 4, 15)  -- Calf Raise
ON CONFLICT DO NOTHING;

SELECT setval('workouts_id_seq', (SELECT MAX(id) FROM workouts));
SELECT setval('workout_exercises_id_seq', (SELECT MAX(id) FROM workout_exercises));
