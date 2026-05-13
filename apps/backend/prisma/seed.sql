-- Insert Grade Levels
INSERT INTO "grade_levels" (id, name, "defaultPoints", "createdAt", "updatedAt") VALUES
('gl_grade_a', 'Grade A', 500, NOW(), NOW()),
('gl_grade_b', 'Grade B', 300, NOW(), NOW()),
('gl_grade_c', 'Grade C', 200, NOW(), NOW());

-- Insert Session
INSERT INTO "sessions" (id, name, "startDate", "endDate", "isActive", "createdAt", "updatedAt") VALUES
('session_q1_2026', 'Q1 2026 Palliative', '2026-01-01 00:00:00', '2026-03-31 23:59:59', true, NOW(), NOW());

-- Insert Admin User (password: Admin123!)
INSERT INTO "users" (id, email, password, "firstName", "lastName", role, status, "isEmailVerified", "gradeLevelId", "createdAt", "updatedAt") VALUES
('user_admin', 'admin@palliative.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qhEhpq4bi', 'Admin', 'User', 'ADMIN', 'ACTIVE', true, 'gl_grade_a', NOW(), NOW());

-- Insert Test User (password: Test123!)
INSERT INTO "users" (id, email, password, "firstName", "lastName", role, status, "isEmailVerified", "gradeLevelId", "createdAt", "updatedAt") VALUES
('user_test', 'user@test.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7qhEhpq4bi', 'Test', 'User', 'USER', 'ACTIVE', true, 'gl_grade_b', NOW(), NOW());

-- Insert Products
INSERT INTO "products" (id, "sessionId", title, description, "nairaPrice", "pointsPrice", "stockQuantity", "createdAt", "updatedAt") VALUES
('prod_rice', 'session_q1_2026', 'Rice Bag 5kg', 'Premium long grain rice', 5000, 50, 100, NOW(), NOW()),
('prod_oil', 'session_q1_2026', 'Cooking Oil 1L', 'Pure vegetable oil', 2500, 25, 150, NOW(), NOW()),
('prod_beans', 'session_q1_2026', 'Beans 2kg', 'Brown beans', 2000, 20, 120, NOW(), NOW()),
('prod_sugar', 'session_q1_2026', 'Sugar 2kg', 'Granulated sugar', 1500, 15, 200, NOW(), NOW()),
('prod_spaghetti', 'session_q1_2026', 'Spaghetti 500g', 'Pasta', 800, 8, 300, NOW(), NOW()),
('prod_tomato', 'session_q1_2026', 'Tomato Paste 400g', 'Concentrated tomato paste', 600, 6, 250, NOW(), NOW()),
('prod_milk', 'session_q1_2026', 'Powdered Milk 400g', 'Full cream milk', 1800, 18, 180, NOW(), NOW()),
('prod_flour', 'session_q1_2026', 'Flour 2kg', 'All-purpose flour', 1200, 12, 150, NOW(), NOW()),
('prod_salt', 'session_q1_2026', 'Table Salt 1kg', 'Iodized salt', 400, 4, 400, NOW(), NOW()),
('prod_garri', 'session_q1_2026', 'Garri 1kg', 'Yellow garri', 1000, 10, 200, NOW(), NOW());

-- Allocate Points to Users
INSERT INTO "user_session_points" (id, "userId", "sessionId", "allocatedPoints", "remainingPoints", "createdAt", "updatedAt") VALUES
('usp_admin', 'user_admin', 'session_q1_2026', 500, 500, NOW(), NOW()),
('usp_test', 'user_test', 'session_q1_2026', 300, 300, NOW(), NOW());
