const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/rankings?country=India&category=skincare&period=2026-05&limit=10&skip=0
router.get('/', async (req, res) => {
  try {
    const { country, category, period, limit } = req.query;
    const where = {};
    if (country) where.country = country;
    if (category) where.category = category;
    if (period) {
      // Accept YYYY-MM or full date; match by month-year
      const [y, m] = String(period).split('-');
      if (y && m) {
        const start = new Date(Number(y), Number(m) - 1, 1);
        const end = new Date(Number(y), Number(m), 1);
        where.period = { gte: start, lt: end };
      }
    }
    const skip = Number(req.query.skip) || 0;
    const take = Number(limit) || 10;

    const total = await prisma.ranking.count({ where });

    const items = await prisma.ranking.findMany({
      where,
      orderBy: { score: 'desc' },
      skip,
      take,
      include: { brand: true, tags: { include: { tag: true } } }
    });

    const formatted = items.map((r) => ({
      id: r.id,
      brand: { id: r.brand.id, name: r.brand.name, slug: r.brand.slug },
      category: r.category,
      country: r.country,
      period: r.period,
      score: r.score,
      change: r.change,
      sentiment: r.sentiment,
      tags: r.tags.map(t => t.tag.name),
    }));

    res.json({ data: formatted, total });
  } catch (err) {
    console.error('GET /api/rankings error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/rankings/seed  -> seeds demo data (unsafe; intended for local/dev)
router.post('/seed', async (req, res) => {
  try {
    // Require a seed key header to allow seeding in non-local environments
    const seedKey = req.headers['x-seed-key'];
    if (!process.env.SEED_KEY || seedKey !== process.env.SEED_KEY) {
      return res.status(403).json({ error: 'Forbidden: invalid seed key' });
    }

    // Sample brands and tags; adjust as needed
    const brands = ['Minimalist', 'The Derma Co', "Re'equil", 'Dot & Key', 'Deconstruct', 'Plum'];
    const tagNames = ['affordable', 'ingredient-first', 'fragrance-free', 'lightweight', 'hydrating', 'sunscreen'];

    // create tags
    const createdTags = {};
    for (const name of tagNames) {
      const tag = await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      createdTags[name] = tag;
    }

    // create brands and a ranking for May 2026
    const period = new Date(2026, 4, 1);
    for (let i = 0; i < brands.length; i++) {
      const name = brands[i];
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const brand = await prisma.brand.upsert({
        where: { slug },
        update: {},
        create: { name, slug }
      });

      // create or update ranking with mock score
      const scoreBase = [91, 61, 48, 46, 39, 29][i] || Math.floor(Math.random() * 50);

      const existing = await prisma.ranking.findFirst({ where: { brandId: brand.id, category: 'skincare', country: 'India', period } });
      let ranking;
      if (existing) {
        ranking = await prisma.ranking.update({ where: { id: existing.id }, data: { score: scoreBase, change: Math.floor(Math.random() * 20) - 5, sentiment: i % 2 === 0 ? 'POSITIVE' : 'MIXED' } });
        await prisma.rankingTag.deleteMany({ where: { rankingId: ranking.id } });
      } else {
        ranking = await prisma.ranking.create({
          data: {
            brandId: brand.id,
            category: 'skincare',
            country: 'India',
            period,
            score: scoreBase,
            change: Math.floor(Math.random() * 20) - 5,
            sentiment: i % 2 === 0 ? 'POSITIVE' : 'MIXED'
          }
        });
      }

      // attach some tags
      const attach = Object.values(createdTags).slice(0, Math.min(3, Object.keys(createdTags).length));
      for (const t of attach) {
        await prisma.rankingTag.create({ data: { rankingId: ranking.id, tagId: t.id } });
      }
    }

    res.json({ success: true, message: 'Seeded demo rankings' });
  } catch (err) {
    console.error('Ranking seed error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

// POST /api/rankings/ingest
// Body: { brand: string, category: string, country: string, period: 'YYYY-MM' or Date, responses: [{ tool, googleRank, sentiment, tags: [] }, ...] }
router.post('/ingest', async (req, res) => {
  try {
    const { brand: brandName, category, country, period, responses } = req.body;
    if (!brandName || !category || !country || !responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ error: 'brand, category, country, and responses[] are required' });
    }

    // normalize period to first of month
    let periodDate;
    if (typeof period === 'string' && /^\d{4}-\d{2}$/.test(period)) {
      const [y, m] = period.split('-');
      periodDate = new Date(Number(y), Number(m) - 1, 1);
    } else if (period) {
      periodDate = new Date(period);
      periodDate.setDate(1);
    } else {
      const d = new Date();
      periodDate = new Date(d.getFullYear(), d.getMonth(), 1);
    }

    const slug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const brand = await prisma.brand.upsert({ where: { slug }, update: {}, create: { name: brandName, slug } });

    // Simple scoring: average predicted googleRank (lower is better) -> convert to score out of 100
    const rankValues = responses.map(r => Number(r.googleRank) || 0).filter(v => v > 0);
    const avgRank = rankValues.length ? rankValues.reduce((a, b) => a + b, 0) / rankValues.length : 50;
    // Map avgRank 1..100 -> score 100..0; clamp
    let score = Math.max(0, Math.min(100, Math.round(100 - (avgRank - 1))));

    // sentiment aggregation: simple majority
    const sentiments = responses.map(r => (r.sentiment || '').toUpperCase()).filter(Boolean);
    const sentiment = sentiments.length ? sentiments.sort((a,b) =>
      sentiments.filter(v=>v===a).length - sentiments.filter(v=>v===b).length
    ).pop() : null;

    // create or update ranking
    const existing = await prisma.ranking.findFirst({ where: { brandId: brand.id, category, country, period: periodDate } });
    let ranking;
    if (existing) {
      // compute change against existing
      const change = score - existing.score;
      ranking = await prisma.ranking.update({ where: { id: existing.id }, data: { score, change, sentiment } });
      await prisma.rankingTag.deleteMany({ where: { rankingId: ranking.id } });
    } else {
      ranking = await prisma.ranking.create({ data: { brandId: brand.id, category, country, period: periodDate, score, change: 0, sentiment } });
    }

    // tags
    const tags = new Set();
    for (const r of responses) {
      if (Array.isArray(r.tags)) r.tags.forEach(t => tags.add(String(t).toLowerCase()));
    }
    for (const tname of tags) {
      const tag = await prisma.tag.upsert({ where: { name: tname }, update: {}, create: { name: tname } });
      await prisma.rankingTag.create({ data: { rankingId: ranking.id, tagId: tag.id } });
    }

    res.json({ success: true, rankingId: ranking.id, score });
  } catch (err) {
    console.error('Ingest error', err);
    res.status(500).json({ error: 'Server error' });
  }
});
