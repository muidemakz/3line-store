-- Allocate points to the existing test@example.com user for the active session
INSERT INTO "user_session_points" (id, "userId", "sessionId", "allocatedPoints", "remainingPoints", "createdAt", "updatedAt")
SELECT
  'usp_' || u.id,
  u.id,
  'session_q1_2026',
  300,
  300,
  NOW(),
  NOW()
FROM "users" u
WHERE u.email = 'test@example.com'
ON CONFLICT (id) DO NOTHING;
