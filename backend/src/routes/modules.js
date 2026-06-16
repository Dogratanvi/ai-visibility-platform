const express = require('express');
const router = express.Router();

// Simple validation helper
function requireWebsite(req, res) {
  const website = (req.body && req.body.website) || req.query.website;
  if (!website) {
    res.status(400).json({ error: 'Missing required parameter: website' });
    return null;
  }
  return website;
}

// POST /api/modules/geo-score
router.post('/geo-score', (req, res) => {
  const website = requireWebsite(req, res);
  if (!website) return;

  // Placeholder implementation: returns a mock geo score and breakdown
  const geoScore = Math.floor(Math.random() * 100) + 1;
  const breakdown = {
    hostingLocation: 'US',
    dnsRegion: 'North America',
    latencyMs: Math.floor(Math.random() * 200) + 20,
  };

  res.json({ website, geoScore, breakdown });
});

// POST /api/modules/crawl-radar
router.post('/crawl-radar', (req, res) => {
  const website = requireWebsite(req, res);
  if (!website) return;

  // Placeholder: return a few mocked crawl issues
  const issues = [
    { type: '404', message: '/old-page not found', severity: 'medium' },
    { type: 'redirect', message: '/temp -> /new', severity: 'low' },
  ];

  res.json({ website, summary: `${issues.length} issues found`, issues });
});

// POST /api/modules/ai-report
router.post('/ai-report', async (req, res) => {
  const website = requireWebsite(req, res);
  if (!website) return;

  // Use the AI route's getAiResults helper to generate a real report
  try {
    const aiModule = require('./ai');
    const selectedTools = ['chatgpt', 'claude'];
    const results = await aiModule.getAiResults(website, selectedTools);

    const report = {
      website,
      generatedAt: new Date().toISOString(),
      topKeywords: Array.from(new Set(results.flatMap(r => r.keywords))).slice(0, 10),
      summary: `Generated AI visibility report using ${results.map(r => r.tool).join(', ')}`,
      results,
    };

    return res.json({ report });
  } catch (err) {
    console.error('ai-report generation failed:', err?.message || err);
    return res.status(500).json({ error: 'Failed to generate AI report' });
  }
});

// POST /api/modules/cited-index
router.post('/cited-index', async (req, res) => {
  const website = requireWebsite(req, res);
  if (!website) return;

  try {
    const aiModule = require('./ai');
    if (aiModule.fetchCitedIndex) {
      const result = await aiModule.fetchCitedIndex(website);
      return res.json({ website, citedIndexSource: result.source, citations: result.citations });
    }
  } catch (err) {
    console.error('cited-index via AI failed:', err?.message || err);
  }

  // Fallback mock cited index
  const citedIndex = Math.round(Math.random() * 1000);
  const citations = [
    { source: 'https://example.com/article-1', anchor: 'Example Article 1' },
    { source: 'https://blog.example.com/post', anchor: 'Blog Post' },
  ];

  res.json({ website, citedIndex, citations });
});

module.exports = router;
