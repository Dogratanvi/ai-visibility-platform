const express = require('express');
const router = express.Router();
const http = require('http');
const https = require('https');

const crawlRadarBots = [
  { name: 'GPTBot', source: 'OpenAI' },
  { name: 'ClaudeBot', source: 'Anthropic' },
  { name: 'PerplexityBot', source: 'Perplexity' },
  { name: 'Google-Extended', source: 'Google' },
  { name: 'ChatGPT-User', source: 'OpenAI' },
  { name: 'OAI-SearchBot', source: 'OpenAI' },
  { name: 'Claude-User', source: 'Anthropic' },
  { name: 'Claude-SearchBot', source: 'Anthropic' },
  { name: 'Perplexity-User', source: 'Perplexity' },
  { name: 'Bytespider', source: 'ByteDance' },
];

// Simple validation helper
function requireWebsite(req, res) {
  const website = (req.body && req.body.website) || req.query.website;
  if (!website) {
    res.status(400).json({ error: 'Missing required parameter: website' });
    return null;
  }
  return website;
}

function normalizeWebsite(rawUrl) {
  const fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const parsed = new URL(fullUrl);
  return {
    fullUrl: parsed.toString(),
    origin: parsed.origin,
    hostname: parsed.hostname.toLowerCase(),
  };
}

function fetchAs(url, userAgent, redirects = 0) {
  return new Promise((resolve) => {
    const startedAt = Date.now();
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      timeout: 9000,
      headers: {
        'User-Agent': userAgent,
        Accept: 'text/html,text/plain,*/*',
      },
    }, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 3) {
        res.resume();
        fetchAs(new URL(res.headers.location, url).toString(), userAgent, redirects + 1).then(resolve);
        return;
      }

      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        if (body.length < 500000) body += chunk;
      });
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 400,
          statusCode: res.statusCode,
          body,
          latencyMs: Date.now() - startedAt,
        });
      });
    });

    req.on('error', (error) => resolve({
      ok: false,
      statusCode: 0,
      body: '',
      latencyMs: Date.now() - startedAt,
      error: error.message,
    }));

    req.on('timeout', () => {
      req.destroy();
      resolve({
        ok: false,
        statusCode: 0,
        body: '',
        latencyMs: Date.now() - startedAt,
        error: 'Request timed out',
      });
    });
  });
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getRobotsGroups(robotsTxt) {
  const groups = [];
  let currentAgents = [];
  let currentRules = [];

  robotsTxt.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.split('#')[0].trim();
    if (!line) {
      if (currentAgents.length) groups.push({ agents: currentAgents, rules: currentRules });
      currentAgents = [];
      currentRules = [];
      return;
    }

    const [keyRaw, ...valueParts] = line.split(':');
    const key = keyRaw?.trim().toLowerCase();
    const value = valueParts.join(':').trim();

    if (key === 'user-agent') {
      if (currentRules.length) {
        groups.push({ agents: currentAgents, rules: currentRules });
        currentAgents = [];
        currentRules = [];
      }
      currentAgents.push(value.toLowerCase());
    }

    if ((key === 'allow' || key === 'disallow') && currentAgents.length) {
      currentRules.push({ type: key, path: value });
    }
  });

  if (currentAgents.length) groups.push({ agents: currentAgents, rules: currentRules });
  return groups;
}

function isAllowedByRobots(robotsTxt, botName) {
  if (!robotsTxt) return true;
  const groups = getRobotsGroups(robotsTxt);
  const bot = botName.toLowerCase();
  const group = groups.find((item) => item.agents.includes(bot))
    || groups.find((item) => item.agents.includes('*'));

  if (!group) return true;
  const disallowRoot = group.rules.some((rule) => rule.type === 'disallow' && rule.path === '/');
  const allowRoot = group.rules.some((rule) => rule.type === 'allow' && (rule.path === '/' || rule.path === ''));
  return !disallowRoot || allowRoot;
}

async function testCrawlerAccess(website, bot) {
  const target = normalizeWebsite(website);
  const robots = await fetchAs(`${target.origin}/robots.txt`, 'AIVisibilityCrawlRadar/1.0');
  const robotsTxt = robots.ok ? robots.body : '';
  const robotsAllowed = isAllowedByRobots(robotsTxt, bot.name);

  if (!robotsAllowed) {
    return {
      ...bot,
      status: 'blocked',
      accessible: false,
      reason: 'Blocked by robots.txt',
      latencyMs: robots.latencyMs,
    };
  }

  const page = await fetchAs(target.fullUrl, bot.name);
  const textLength = stripHtml(page.body).length;
  const blockedByResponse = page.statusCode >= 400
    || /access denied|forbidden|captcha|cloudflare|bot detection|blocked|verify you are human/i.test(page.body)
    || textLength < 80;

  return {
    ...bot,
    status: page.ok && !blockedByResponse ? 'accessible' : 'blocked',
    accessible: page.ok && !blockedByResponse,
    reason: page.ok && !blockedByResponse ? 'Accessible' : page.error || `HTTP ${page.statusCode || 'blocked'}`,
    latencyMs: page.latencyMs,
  };
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
router.post('/crawl-radar', async (req, res) => {
  const website = requireWebsite(req, res);
  if (!website) return;

  try {
    const requestedCrawler = req.body?.crawler;

    if (requestedCrawler) {
      const bot = crawlRadarBots.find((item) => item.name === requestedCrawler);
      if (!bot) return res.status(400).json({ error: 'Unknown crawler' });

      const result = await testCrawlerAccess(website, bot);
      return res.json({ website, crawler: result });
    }

    const results = await Promise.all(crawlRadarBots.map((bot) => testCrawlerAccess(website, bot)));
    const accessibleCount = results.filter((item) => item.accessible).length;

    return res.json({
      website,
      crawlers: results,
      summary: `${accessibleCount} of ${results.length} AI crawlers are accessible`,
      issues: results
        .filter((item) => !item.accessible)
        .map((item) => ({
          type: item.name,
          message: item.reason,
          severity: item.reason === 'Blocked by robots.txt' ? 'high' : 'medium',
        })),
    });
  } catch (err) {
    console.error('crawl-radar failed:', err?.message || err);
    return res.status(500).json({ error: 'Failed to run Crawl Radar' });
  }
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
