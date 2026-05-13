import { PrismaClient, Role, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed...');

  // 1. Create Grade Levels
  const gradeA = await prisma.gradeLevel.upsert({
    where: { name: 'Grade A' },
    update: {},
    create: { name: 'Grade A', defaultPoints: 300 },
  });

  const gradeB = await prisma.gradeLevel.upsert({
    where: { name: 'Grade B' },
    update: {},
    create: { name: 'Grade B', defaultPoints: 500 },
  });

  console.log('✅ Grade levels created');

  // 2. Create an Active Session
  const currentSession = await prisma.session.upsert({
    where: { name: 'Q1 Palliative 2026' },
    update: {},
    create: {
      name: 'Q1 Palliative 2026',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      isActive: true,
    },
  });

  console.log(`✅ Session created: ${currentSession.name}`);

  // 3. Create Super Admin
  const adminPassword = await bcrypt.hash('SuperAdmin@123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@palliative.com' },
    update: {},
    create: {
      email: 'admin@palliative.com',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.SUPER_ADMIN,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      gradeLevelId: gradeB.id, // Admins usually on highest grade
    },
  });

  console.log(`✅ Super Admin created: ${admin.email}`);

  // 4. Create Standard User
  const userPassword = await bcrypt.hash('User@123', 12);
  const standardUser = await prisma.user.upsert({
    where: { email: 'user@palliative.com' },
    update: {},
    create: {
      email: 'user@palliative.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
      status: UserStatus.ACTIVE,
      isEmailVerified: true,
      gradeLevelId: gradeA.id,
    },
  });

  console.log(`✅ Standard User created: ${standardUser.email}`);

  // 5. Allocate Points for the current session
  await prisma.userSessionPoints.upsert({
    where: {
      userId_sessionId: {
        userId: standardUser.id,
        sessionId: currentSession.id,
      },
    },
    update: {},
    create: {
      userId: standardUser.id,
      sessionId: currentSession.id,
      allocatedPoints: gradeA.defaultPoints,
      remainingPoints: gradeA.defaultPoints,
    },
  });

  console.log(`✅ Points allocated for ${standardUser.email} in ${currentSession.name}`);

  // 6. Create Initial Products
  const products = [
    {
      title: 'Premium Food Basket',
      description: 'A collection of essential food items.',
      pointsPrice: 150,
      nairaPrice: 25000,
      stockQuantity: 50,
    },
    {
      title: 'Health Care Kit',
      description: 'Basic medical supplies and vitamins.',
      pointsPrice: 100,
      nairaPrice: 15000,
      stockQuantity: 100,
    },
  ];

  for (const p of products) {
    await prisma.product.create({
      data: {
        ...p,
        sessionId: currentSession.id,
      },
    });
  }

  console.log('✅ Initial products added');
  console.log('🏁 Database seed completed.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
