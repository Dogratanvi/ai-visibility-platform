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

// ─────────────────────────────────────────────────────────────
// Fetch the robots.txt and check which crawlers are blocked
// ─────────────────────────────────────────────────────────────
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

    req.on('error', () => resolve(crawlers.map((c) => ({ ...c, blocked: false }))));
    req.on('timeout', () => {
      req.destroy();
      resolve(crawlers.map((c) => ({ ...c, blocked: false })));
    });
  });
};

// ─────────────────────────────────────────────────────────────
// Fetch website HTML for page analysis
// ─────────────────────────────────────────────────────────────
function fetchPageHtml(url) {
  return new Promise((resolve) => {
    const client = url.startsWith('https') ? https : http;
    const options = {
      headers: {
        'User-Agent': 'AIVisibilityAuditBot/1.0 (compatible; audit)',
        'Accept': 'text/html',
      },
      timeout: 10000,
    };
    const req = client.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ ok: true, html: data, statusCode: res.statusCode }));
    });
    req.on('error', (err) => resolve({ ok: false, html: '', statusCode: 0, error: err.message }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ ok: false, html: '', statusCode: 0, error: 'Timeout' });
    });
  });
}

// ─────────────────────────────────────────────────────────────
// Real Accessibility audit from HTML
// Checks: img alt text coverage, form label coverage
// Returns score out of 28
// ─────────────────────────────────────────────────────────────
function auditAccessibility(html) {
  // Count img tags
  const imgTags = html.match(/<img\b[^>]*>/gi) || [];
  const imgsWithAlt = imgTags.filter((tag) => /alt\s*=\s*["'][^"']+["']/i.test(tag));
  const altCoverage = imgTags.length > 0 ? imgsWithAlt.length / imgTags.length : 1;

  // Count inputs that have id attributes
  const inputTags = html.match(/<input\b[^>]*>/gi) || [];
  const inputsWithId = inputTags.filter((tag) => /\bid\s*=\s*["'][^"']+["']/i.test(tag));
  // Count labels that have for= attributes
  const labelTags = html.match(/<label\b[^>]*>/gi) || [];
  const labelsWithFor = labelTags.filter((tag) => /\bfor\s*=\s*["'][^"']+["']/i.test(tag));
  // Also count aria-label usages on inputs
  const inputsWithAria = inputTags.filter((tag) => /aria-label\s*=/i.test(tag));
  const formCoverage = inputTags.length > 0
    ? Math.min(1, (labelsWithFor.length + inputsWithAria.length) / inputTags.length)
    : 1;

  // Check for lang attribute on html tag
  const hasLang = /<html[^>]+lang\s*=/i.test(html) ? 1 : 0;

  // Compute score out of 28
  const score = Math.round(altCoverage * 14 + formCoverage * 10 + hasLang * 4);
  return Math.max(0, Math.min(28, score));
}

// ─────────────────────────────────────────────────────────────
// Real Readability audit from HTML
// Checks: heading structure, text length, paragraph density
// Returns score out of 32
// ─────────────────────────────────────────────────────────────
function auditReadability(html) {
  // Strip scripts and styles from HTML for text analysis
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '');

  // Check heading hierarchy
  const hasH1 = /<h1[\s>]/i.test(clean);
  const hasH2 = /<h2[\s>]/i.test(clean);
  const hasH3 = /<h3[\s>]/i.test(clean);
  const headingScore = (hasH1 ? 8 : 0) + (hasH2 ? 5 : 0) + (hasH3 ? 3 : 0);

  // Count paragraphs
  const paragraphs = clean.match(/<p[\s>][\s\S]*?<\/p>/gi) || [];
  const paragraphScore = Math.min(8, paragraphs.length);

  // Estimate visible text length
  const textContent = clean.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount = textContent.split(' ').filter((w) => w.length > 2).length;
  const wordScore = wordCount >= 300 ? 8 : Math.round((wordCount / 300) * 8);

  const score = headingScore + paragraphScore + wordScore;
  return Math.max(0, Math.min(32, score));
}

// ─────────────────────────────────────────────────────────────
// Real Understandability audit from HTML
// Checks: JSON-LD schema presence, Open Graph meta, meta description
// Returns score out of 38
// ─────────────────────────────────────────────────────────────
function auditUnderstandability(html) {
  // Check for JSON-LD structured data
  const jsonLdMatches = html.match(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
  const hasSchema = jsonLdMatches.length > 0;

  // Try to detect schema types
  const schemaTypes = [];
  jsonLdMatches.forEach((block) => {
    const typeMatch = /"@type"\s*:\s*"([^"]+)"/g;
    let m;
    while ((m = typeMatch.exec(block)) !== null) schemaTypes.push(m[1]);
  });

  // Score: 15 base for any schema, +3 per recognized type
  const recognizedTypes = ['Organization', 'WebSite', 'Product', 'Article', 'LocalBusiness', 'FAQPage', 'BreadcrumbList'];
  const typeBonus = schemaTypes.filter((t) => recognizedTypes.includes(t)).length * 3;
  const schemaScore = hasSchema ? Math.min(20, 15 + typeBonus) : 0;

  // Check for llms.txt (can't fetch here but flag presence in robots.txt or HTML mentions)
  const hasLlmsTxt = /llms\.txt/i.test(html) ? 3 : 0;

  // Open Graph meta
  const hasOg = /<meta[^>]+property\s*=\s*["']og:/i.test(html) ? 5 : 0;

  // Meta description
  const hasMetaDesc = /<meta[^>]+name\s*=\s*["']description["'][^>]+content\s*=/i.test(html) ? 5 : 0;

  // Twitter card
  const hasTwitter = /<meta[^>]+name\s*=\s*["']twitter:/i.test(html) ? 3 : 0;

  // Microdata
  const hasMicrodata = /itemscope/i.test(html) ? 2 : 0;

  const score = schemaScore + hasLlmsTxt + hasOg + hasMetaDesc + hasTwitter + hasMicrodata;
  return Math.max(0, Math.min(38, score));
}

// ─────────────────────────────────────────────────────────────
// Main analyzer
// ─────────────────────────────────────────────────────────────
const analyzeSite = async (url) => {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;

  // Fetch real page HTML
  const page = await fetchPageHtml(fullUrl);

  let accessibility, readability, understandability;

  if (page.ok && page.html.length > 200) {
    accessibility = auditAccessibility(page.html);
    readability = auditReadability(page.html);
    understandability = auditUnderstandability(page.html);
  } else {
    // If page not reachable, use minimum scores with note
    console.warn(`Could not fetch ${fullUrl} for HTML audit: ${page.error || 'unknown'}`);
    accessibility = 5;
    readability = 8;
    understandability = 4;
  }

  const score = Math.round(((accessibility / 28) * 100 + (readability / 32) * 100 + (understandability / 38) * 100) / 3);

  const crawlerAccess = await checkRobotsTxt(fullUrl);
  const blockedCount = crawlerAccess.filter((c) => c.blocked).length;

  const flags = [];
  if (accessibility < 14) {
    flags.push({ type: 'Accessibility', impact: 'High', title: 'Add alt text to images and label all form fields' });
  } else if (accessibility < 21) {
    flags.push({ type: 'Accessibility', impact: 'Medium', title: 'Improve alt text coverage on images' });
  }
  if (readability < 16) {
    flags.push({ type: 'Readability', impact: 'High', title: 'Add clear heading structure (H1, H2, H3) and more content' });
  } else if (readability < 24) {
    flags.push({ type: 'Readability', impact: 'Medium', title: 'Improve page structure with more headings and paragraphs' });
  }
  if (understandability < 10) {
    flags.push({ type: 'Understandability', impact: 'High', title: 'Add JSON-LD structured data (schema.org) to your pages' });
  } else if (understandability < 20) {
    flags.push({ type: 'Understandability', impact: 'Medium', title: 'Add Open Graph meta tags and richer schema types' });
  }
  if (blockedCount > 5) {
    flags.push({ type: 'Crawler Access', impact: 'High', title: 'robots.txt is blocking multiple AI crawlers' });
  }
  if (!page.ok) {
    flags.push({ type: 'Page Access', impact: 'High', title: 'Site homepage could not be fetched for analysis' });
  }

  return {
    url: new URL(fullUrl).hostname,
    fullUrl,
    score,
    pageReachable: page.ok,
    pillars: {
      accessibility: { score: accessibility, total: 28 },
      readability: { score: readability, total: 32 },
      understandability: { score: understandability, total: 38 },
    },
    crawlers: crawlerAccess,
    allowedCount: crawlerAccess.filter((c) => !c.blocked).length,
    blockedCount,
    flags,
    dataSource: 'live',
  };
};

// ─────────────────────────────────────────────────────────────
// POST /api/free-audit
// ─────────────────────────────────────────────────────────────
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
