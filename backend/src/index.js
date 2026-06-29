const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();
const app = express();
const billingRoutes = require('./routes/billing');

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.191:3000'],
  credentials: true
}));
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), billingRoutes.webhookHandler);
app.use(express.json());

const keywordRoutes = require('./routes/keywords');
const websiteRoutes = require('./routes/websites');
const adminRoutes = require('./routes/admin');
const aiRoutes = require('./routes/ai');
const modulesRoutes = require('./routes/modules');
const rankingsRoutes = require('./routes/rankings');
const citedIndexRoutes = require('./routes/cited-index');
const geoScoreRoutes = require('./routes/geo-score');
const freeAuditRoutes = require('./routes/free-audit');
const recommendationRoutes = require('./routes/recommendations');
const commandCenterRoutes = require('./routes/command-center');
app.use('/api/websites/:siteId/keywords', keywordRoutes);
app.use('/api/websites', websiteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/modules', modulesRoutes);
app.use('/api/rankings', rankingsRoutes);
app.use('/api/cited-index', citedIndexRoutes);
app.use('/api/geo-score', geoScoreRoutes);
app.use('/api/free-audit', freeAuditRoutes);
app.use('/api/billing', billingRoutes.router);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/command-center', commandCenterRoutes);
// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

async function ensureDefaultAdmins() {
  const defaultSuperadminEmail = process.env.DEFAULT_SUPERADMIN_EMAIL;
  const defaultSuperadminPassword = process.env.DEFAULT_SUPERADMIN_PASSWORD;
  const defaultAdminEmail = process.env.DEFAULT_ADMIN_EMAIL;
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD;

  if (defaultSuperadminEmail && defaultSuperadminPassword) {
    const existing = await prisma.user.findUnique({ where: { email: defaultSuperadminEmail } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(defaultSuperadminPassword, 10);
      await prisma.user.create({
        data: {
          name: 'Superadmin',
          email: defaultSuperadminEmail,
          password: hashedPassword,
          role: 'SUPERADMIN',
        },
      });
      console.log('Default superadmin created:', defaultSuperadminEmail);
    }
  }

  if (defaultAdminEmail && defaultAdminPassword) {
    const existing = await prisma.user.findUnique({ where: { email: defaultAdminEmail } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
      await prisma.user.create({
        data: {
          name: 'Admin',
          email: defaultAdminEmail,
          password: hashedPassword,
          role: 'ADMIN',
        },
      });
      console.log('Default admin created:', defaultAdminEmail);
    }
  }
}

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'AI Visibility API running' });
});

const PORT = process.env.PORT || 5000;

ensureDefaultAdmins()
  .catch((err) => {
    console.error('Failed to create default admin users', err);
  })
  .finally(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
