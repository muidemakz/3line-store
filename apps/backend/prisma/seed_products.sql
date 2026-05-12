-- Ensure session exists first
INSERT INTO "sessions" (id, name, "startDate", "endDate", "isActive", "createdAt", "updatedAt") VALUES
('session_q1_2026', 'Q1 2026 Palliative', '2026-01-01 00:00:00', '2026-03-31 23:59:59', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert Products for Q1 2026 session
INSERT INTO "products" (id, "sessionId", title, description, "nairaPrice", "pointsPrice", "stockQuantity", "createdAt", "updatedAt") VALUES
('prod_rice',       'session_q1_2026', 'Rice Bag 5kg',        'Premium long grain rice',       5000.00, 50, 100, NOW(), NOW()),
('prod_oil',        'session_q1_2026', 'Cooking Oil 1L',      'Pure vegetable oil',            2500.00, 25, 150, NOW(), NOW()),
('prod_beans',      'session_q1_2026', 'Beans 2kg',           'Brown beans',                   2000.00, 20, 120, NOW(), NOW()),
('prod_sugar',      'session_q1_2026', 'Sugar 2kg',           'Granulated sugar',              1500.00, 15, 200, NOW(), NOW()),
('prod_spaghetti',  'session_q1_2026', 'Spaghetti 500g',      'Pasta',                          800.00,  8, 300, NOW(), NOW()),
('prod_tomato',     'session_q1_2026', 'Tomato Paste 400g',   'Concentrated tomato paste',      600.00,  6, 250, NOW(), NOW()),
('prod_milk',       'session_q1_2026', 'Powdered Milk 400g',  'Full cream milk',               1800.00, 18, 180, NOW(), NOW()),
('prod_flour',      'session_q1_2026', 'Flour 2kg',           'All-purpose flour',             1200.00, 12, 150, NOW(), NOW()),
('prod_salt',       'session_q1_2026', 'Table Salt 1kg',      'Iodized salt',                   400.00,  4, 400, NOW(), NOW()),
('prod_garri',      'session_q1_2026', 'Garri 1kg',           'Yellow garri',                  1000.00, 10, 200, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
