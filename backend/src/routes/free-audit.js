const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');

const crawlers = [
  { name: 'GPTBot', source: 'OpenAI' },
  { name: 'Claudebot', source: 'Anthropic' },
  { name: 'Perplexitybot', source: 'Perplexity' },
  { name: 'Google-Extended', source: 'Google' },
  { name: 'CCBot-User', source: 'Common Crawl' },
  { name: 'OAI-Subscriber', source: 'OpenAI' },
  { name: 'OAI-Auditor', source: 'OpenAI' },
  { name: 'Claude-Web', source: 'Anthropic' },
  { name: 'Claude-Searcher', source: 'Anthropic' },
  { name: 'anthropic-ai', source: 'Anthropic' },
  { name: 'Perplexity-User', source: 'Perplexity' },
  { name: 'GoogBot', source: 'Google' },
  { name: 'Synaper', source: 'Synapse' },
];

const checkRobotsTxt = async (url) => {
  return new Promise((resolve) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    const robotsUrl = new URL(url);
    robotsUrl.pathname = '/robots.txt';

    const req = client.get(robotsUrl.toString(), { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const blocked = crawlers.map((c) => {
          const isBlocked =
            data.includes(`User-agent: ${c.name}`) &&
            data.includes(`Disallow: /`);
          return { ...c, blocked: isBlocked };
        });
        resolve(blocked);
      });
    });

    req.on('error', () => {
      resolve(
        crawlers.map((c) => ({ ...c, blocked: false }))
      );
    });
    req.on('timeout', () => {
      req.destroy();
      resolve(
        crawlers.map((c) => ({ ...c, blocked: false }))
      );
    });
  });
};

const analyzeSite = async (url) => {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;

  // Mock analysis (in production, use real tools like lighthouse, axe, etc)
  const accessibility = Math.floor(Math.random() * 10) + 18; // 18-28
  const readability = Math.floor(Math.random() * 8) + 24; // 24-32
  const understandability = Math.floor(Math.random() * 10) + 24; // 24-34

  const score = Math.round((accessibility + readability + understandability) / 9);

  const crawlerAccess = await checkRobotsTxt(fullUrl);
  const blockedCount = crawlerAccess.filter((c) => c.blocked).length;

  const flags = [];
  if (accessibility < 20) {
    flags.push({ type: 'Accessibility', impact: 'High', title: 'Improve alt text and ARIA labels' });
  }
  if (readability < 25) {
    flags.push({ type: 'Readability', impact: 'High', title: 'Simplify content structure' });
  }
  if (blockedCount > 5) {
    flags.push({ type: 'Crawler Access', impact: 'High', title: 'robots.txt is blocking AI crawlers' });
  }
  if (understandability < 25) {
    flags.push({ type: 'Understandability', impact: 'Medium', title: 'Add more structured data (schema.org)' });
  }

  return {
    url: new URL(fullUrl).hostname,
    fullUrl,
    score,
    pillars: {
      accessibility: { score: accessibility, total: 28 },
      readability: { score: readability, total: 32 },
      understandability: { score: understandability, total: 38 },
    },
    crawlers: crawlerAccess,
    allowedCount: crawlerAccess.filter((c) => !c.blocked).length,
    blockedCount,
    flags,
  };
};

// POST /api/free-audit
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    const result = await analyzeSite(url);
    res.json(result);
  } catch (err) {
    console.error('Free Audit error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
