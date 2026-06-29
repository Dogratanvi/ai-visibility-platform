const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const paidMiddleware = require('../middleware/paid');
const prisma = new PrismaClient();

router.use(authMiddleware, paidMiddleware);

// Get all websites of user
router.get('/', async (req, res) => {
  try {
    const websites = await prisma.website.findMany({
      where: { userId: req.user.id },
      include: { _count: { select: { schedules: true } } }
    });
    res.json(websites);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add website
router.post('/', async (req, res) => {
  try {
    const { url, propertyName } = req.body;
    if (!url) return res.status(400).json({ error: 'URL required' });

    const maxWebsites = req.subscriptionEntitlements?.maxWebsites;
    if (typeof maxWebsites === 'number') {
      const currentWebsiteCount = await prisma.website.count({
        where: { userId: req.user.id },
      });

      if (currentWebsiteCount >= maxWebsites) {
        return res.status(403).json({
          error: `Your current plan allows ${maxWebsites} website${maxWebsites === 1 ? '' : 's'}. Upgrade to add more websites.`,
          code: 'WEBSITE_LIMIT_REACHED',
          limit: maxWebsites,
        });
      }
    }

    const website = await prisma.website.create({
      data: {
        websiteUrl: url,
        propertyId: url,
        propertyName: propertyName || url,
        userId: req.user.id
      }
    });
    res.json(website);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete website
router.delete('/:id', async (req, res) => {
  try {
    const website = await prisma.website.findUnique({ where: { id: req.params.id } });
    if (!website || website.userId !== req.user.id) {
      return res.status(404).json({ error: 'Website not found' });
    }

    await prisma.website.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
