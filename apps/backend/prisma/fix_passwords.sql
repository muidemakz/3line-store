-- Fix password for user@test.com (Test123!)
UPDATE "users"
SET password = '$2a$12$GtnyHy6rRGiTBF3aziScn.Jw/SluzQGXS5Xe/Gr1A5vPm3PVnsRI6',
    "updatedAt" = NOW()
WHERE email = 'user@test.com';

-- Fix password for admin@palliative.com (Admin123!)
UPDATE "users"
SET password = '$2a$12$sApC1nIy3YKEtAnw2Cp9vOG6m6jnRVQ6XzFctt7i1HmcnwZ6btXSG',
    "updatedAt" = NOW()
WHERE email = 'admin@palliative.com';
