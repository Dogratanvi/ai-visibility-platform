const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const { requireAdmin, requireSuperadmin } = require('../middleware/roles');
const prisma = new PrismaClient();

router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        websites: true,
        subscription: true,
      },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/users/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        websites: true,
        subscription: true,
      },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/users/:id/role', authMiddleware, requireSuperadmin, async (req, res) => {
  try {
    const role = (req.body.role || '').toString().toUpperCase();
    const allowedRoles = ['USER', 'ADMIN', 'SUPERADMIN'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { role },
    });

    res.json({ id: user.id, email: user.email, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/websites', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const websites = await prisma.website.findMany({
      include: {
        user: true,
        keywords: true,
      },
    });
    res.json(websites);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
