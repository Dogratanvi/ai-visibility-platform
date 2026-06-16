const express = require('express');
const router = express.Router({ mergeParams: true });
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const prisma = new PrismaClient();

// Get all keywords for a website
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;
    if (!siteId) return res.status(400).json({ error: 'siteId is required' });

    const website = await prisma.website.findUnique({ where: { id: siteId } });
    if (!website || website.userId !== req.user.id) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const keywords = await prisma.keyword.findMany({
      where: { websiteId: siteId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(keywords);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a keyword to a website
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { siteId } = req.params;
    const { keyword } = req.body;

    if (!siteId) return res.status(400).json({ error: 'siteId is required' });
    if (!keyword) return res.status(400).json({ error: 'Keyword is required' });

    const website = await prisma.website.findUnique({ where: { id: siteId } });
    if (!website || website.userId !== req.user.id) {
      return res.status(404).json({ error: 'Website not found' });
    }

    const savedKeyword = await prisma.keyword.create({
      data: {
        keyword,
        websiteId: siteId,
        userId: req.user.id,
      },
    });

    res.json(savedKeyword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
