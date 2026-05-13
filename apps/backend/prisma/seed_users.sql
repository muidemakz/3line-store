-- Prerequisites: ensure grade levels exist
INSERT INTO "grade_levels" (id, name, "defaultPoints", "createdAt", "updatedAt") VALUES
('gl_grade_a', 'Grade A', 500, NOW(), NOW()),
('gl_grade_b', 'Grade B', 300, NOW(), NOW()),
('gl_grade_c', 'Grade C', 200, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Prerequisites: ensure session exists
INSERT INTO "sessions" (id, name, "startDate", "endDate", "isActive", "createdAt", "updatedAt") VALUES
('session_q1_2026', 'Q1 2026 Palliative', '2026-01-01 00:00:00', '2026-03-31 23:59:59', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add admin user (password: Admin123!)
INSERT INTO "users" (id, email, password, "firstName", "lastName", role, status, "isEmailVerified", "gradeLevelId", "createdAt", "updatedAt")
VALUES
('user_admin', 'admin@palliative.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qhEhpq4bi', 'Admin', 'User', 'ADMIN', 'ACTIVE', true, 'gl_grade_a', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add user@test.com (password: Test123!)
INSERT INTO "users" (id, email, password, "firstName", "lastName", role, status, "isEmailVerified", "gradeLevelId", "createdAt", "updatedAt")
VALUES
('user_test', 'user@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qhEhpq4bi', 'Test', 'User', 'USER', 'ACTIVE', true, 'gl_grade_b', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Allocate points to admin  (no usedPoints column in schema)
INSERT INTO "user_session_points" (id, "userId", "sessionId", "allocatedPoints", "remainingPoints", "createdAt", "updatedAt")
VALUES
('usp_admin', 'user_admin', 'session_q1_2026', 500, 500, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Allocate points to user@test.com
INSERT INTO "user_session_points" (id, "userId", "sessionId", "allocatedPoints", "remainingPoints", "createdAt", "updatedAt")
VALUES
('usp_test', 'user_test', 'session_q1_2026', 300, 300, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
