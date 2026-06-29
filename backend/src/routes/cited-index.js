const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/cited-index?category=skincare&country=India&period=2026-05&limit=10&skip=0
router.get('/', async (req, res) => {
  try {
    const { category, country, period, limit = '10', skip = '0' } = req.query;
    const where = {};
    if (category) where.category = category;
    if (country) where.country = country;
    if (period) {
      const [y, m] = String(period).split('-');
      if (y && m) {
        const start = new Date(Number(y), Number(m) - 1, 1);
        const end = new Date(Number(y), Number(m), 1);
        where.period = { gte: start, lt: end };
      }
    }

    const total = await prisma.citation.count({ where });
    const citations = await prisma.citation.findMany({
      where,
      orderBy: { score: 'desc' },
      take: Number(limit),
      skip: Number(skip),
    });

    const formatted = citations.map((c) => ({
      id: c.id,
      brand: c.brandName,
      brandId: c.brandId,
      category: c.category,
      country: c.country,
      period: c.period,
      mentionCount: c.mentionCount,
      score: c.score,
      change: c.change,
      avgPosition: c.avgPosition,
      sentiment: c.sentiment,
    }));

    res.json({ data: formatted, total });
  } catch (err) {
    console.error('GET /api/cited-index error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cited-index/prompts?category=skincare&country=India&active=true
router.get('/prompts', async (req, res) => {
  try {
    const { category, country, active = 'true' } = req.query;
    const where = {};
    if (category) where.category = category;
    if (country) where.country = country;
    if (active !== undefined) where.active = active === 'true';

    const prompts = await prisma.prompt.findMany({ where, orderBy: { createdAt: 'desc' } });
    res.json({ data: prompts });
  } catch (err) {
    console.error('GET /api/cited-index/prompts error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cited-index/ingest
// Body: { runId?, promptId?, period, platform, text (response), mentions: [{brandName, position, sentiment?, tags?}, ...] }
router.post('/ingest', async (req, res) => {
  try {
    const { runId, promptId, period, platform, text, mentions } = req.body;
    if (!platform || !text || !mentions || !Array.isArray(mentions)) {
      return res.status(400).json({ error: 'platform, text, and mentions[] are required' });
    }

    // If runId not provided, optionally create a run
    let run;
    if (runId) {
      run = await prisma.run.findUnique({ where: { id: runId } });
      if (!run) return res.status(404).json({ error: 'Run not found' });
    } else if (promptId && period) {
      run = await prisma.run.create({
        data: { promptId, period: new Date(period) }
      });
    }

    // Create response record
    const response = await prisma.response.create({
      data: {
        runId: run?.id,
        platform,
        text,
        status: 'success'
      }
    });

    // Create mentions
    for (const m of mentions) {
      if (!m.brandName) continue;
      await prisma.mention.create({
        data: {
          responseId: response.id,
          brandName: m.brandName,
          position: m.position || 0,
          sentiment: m.sentiment,
          tags: m.tags || []
        }
      });
    }

    res.json({ success: true, responseId: response.id, mentionCount: mentions.length });
  } catch (err) {
    console.error('POST /api/cited-index/ingest error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/cited-index/aggregate
// Aggregates all mentions for a period/category/country into Citations
router.post('/aggregate', async (req, res) => {
  try {
    const seedKey = req.headers['x-seed-key'];
    if (!process.env.SEED_KEY || seedKey !== process.env.SEED_KEY) {
      return res.status(403).json({ error: 'Forbidden: invalid seed key' });
    }

    const { category, country, period } = req.body;
    if (!category || !country || !period) {
      return res.status(400).json({ error: 'category, country, period required' });
    }

    const periodDate = new Date(period);
    periodDate.setDate(1);

    // Get all mentions from responses in this period/category
    const mentions = await prisma.mention.findMany({
      where: {
        response: {
          run: {
            prompt: { category, country }
          }
        }
      },
      include: { response: { include: { run: true } } }
    });

    // Group by brand
    const brandMap = {};
    for (const m of mentions) {
      const runPeriod = new Date(m.response.run.period);
      runPeriod.setDate(1);
      
      if (runPeriod.getTime() !== periodDate.getTime()) continue;

      const key = m.brandName.toLowerCase();
      if (!brandMap[key]) {
        brandMap[key] = {
          brandName: m.brandName,
          mentions: [],
          sentiments: []
        };
      }
      brandMap[key].mentions.push(m);
      if (m.sentiment) brandMap[key].sentiments.push(m.sentiment);
    }

    // Compute Citation for each brand
    const citations = [];
    for (const [, data] of Object.entries(brandMap)) {
      const positions = data.mentions.map(m => m.position).filter(p => p > 0);
      const avgPosition = positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : null;
      
      const sentiments = data.sentiments.sort((a, b) =>
        data.sentiments.filter(v => v === a).length - data.sentiments.filter(v => v === b).length
      );
      const sentiment = sentiments.length ? sentiments[sentiments.length - 1] : null;

      // Score: mention count normalized to 0-100
      const score = Math.min(100, Math.round((data.mentions.length / Math.max(1, mentions.length)) * 100 * 2));

      const existing = await prisma.citation.findUnique({
        where: {
          brandName_category_country_period: {
            brandName: data.brandName,
            category,
            country,
            period: periodDate
          }
        }
      });

      const change = existing ? score - existing.score : 0;

      const citation = await prisma.citation.upsert({
        where: {
          brandName_category_country_period: {
            brandName: data.brandName,
            category,
            country,
            period: periodDate
          }
        },
        update: {
          mentionCount: data.mentions.length,
          score,
          change,
          avgPosition,
          sentiment
        },
        create: {
          brandName: data.brandName,
          category,
          country,
          period: periodDate,
          mentionCount: data.mentions.length,
          score,
          change: 0,
          avgPosition,
          sentiment
        }
      });

      citations.push(citation);
    }

    res.json({ success: true, citationsCount: citations.length, citations });
  } catch (err) {
    console.error('POST /api/cited-index/aggregate error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
