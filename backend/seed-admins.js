const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const superPw = await bcrypt.hash('Superadmin123!', 10);
    await prisma.user.upsert({
      where: { email: 'superadmin@example.com' },
      update: { password: superPw, role: 'SUPERADMIN', name: 'Superadmin' },
      create: { email: 'superadmin@example.com', password: superPw, role: 'SUPERADMIN', name: 'Superadmin' }
    });

    const adminPw = await bcrypt.hash('Admin123!', 10);
    await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: { password: adminPw, role: 'ADMIN', name: 'Admin' },
      create: { email: 'admin@example.com', password: adminPw, role: 'ADMIN', name: 'Admin' }
    });

    console.log('Seed complete: admin and superadmin created/updated');
  } catch (err) {
    console.error('Seed failed', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
  process.exit(0);
})();
