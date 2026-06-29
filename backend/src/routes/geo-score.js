const express = require('express');
const router = express.Router();
const dns = require('dns').promises;
const http = require('http');
const https = require('https');

const llmCrawlers = [
  { name: 'GPTBot', source: 'OpenAI' },
  { name: 'ClaudeBot', source: 'Anthropic' },
  { name: 'PerplexityBot', source: 'Perplexity' },
  { name: 'Google-Extended', source: 'Google' },
  { name: 'ChatGPT-User', source: 'OpenAI' },
  { name: 'CCBot', source: 'Common Crawl' },
  { name: 'OAI-SearchBot', source: 'OpenAI' },
  { name: 'Claude-Web', source: 'Anthropic' },
  { name: 'anthropic-ai', source: 'Anthropic' },
  { name: 'Perplexity-User', source: 'Perplexity' },
  { name: 'GoogleOther', source: 'Google' },
  { name: 'Bytespider', source: 'ByteDance' },
  { name: 'YouBot', source: 'You.com' },
];

const adjacentCrawlers = ['Applebot-Extended', 'Meta-ExternalAgent', 'Amazonbot', 'Diffbot'];
const searchCrawlers = ['Googlebot', 'Bingbot', 'DuckDuckBot', 'YandexBot'];

const normalizeInput = (rawUrl) => {
  const fullUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
  const parsed = new URL(fullUrl);
  return {
    fullUrl: parsed.toString(),
    origin: parsed.origin,
    hostname: parsed.hostname.toLowerCase(),
  };
};

const fetchUrl = (url, redirects = 0, userAgent = 'AIVisibilityAudit/1.0 (+https://ai-visibility.local)') => new Promise((resolve) => {
  const start = Date.now();
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
      const nextUrl = new URL(res.headers.location, url).toString();
      fetchUrl(nextUrl, redirects + 1, userAgent).then(resolve);
      return;
    }

    let body = '';
    res.setEncoding('utf8');
    res.on('data', (chunk) => {
      if (body.length < 900000) body += chunk;
    });
    res.on('end', () => {
      resolve({
        ok: res.statusCode >= 200 && res.statusCode < 400,
        statusCode: res.statusCode,
        body,
        latency: Date.now() - start,
      });
    });
  });

  req.on('error', (error) => resolve({
    ok: false,
    statusCode: 0,
    body: '',
    latency: Date.now() - start,
    error: error.message,
  }));

  req.on('timeout', () => {
    req.destroy();
    resolve({
      ok: false,
      statusCode: 0,
      body: '',
      latency: Date.now() - start,
      error: 'Request timed out',
    });
  });
});

const extractInternalLinks = (html, origin) => {
  const links = [];
  const seen = new Set();
  const linkRegex = /<a\b[^>]+href=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) && links.length < 12) {
    try {
      const parsed = new URL(match[1], origin);
      const cleanPath = parsed.pathname.replace(/\/+$/, '') || '/';
      const isAsset = /\.(pdf|jpg|jpeg|png|webp|gif|svg|zip|mp4|mp3|css|js)$/i.test(cleanPath);

      if (parsed.origin === origin && !isAsset && !seen.has(cleanPath)) {
        seen.add(cleanPath);
        links.push(`${origin}${cleanPath}`);
      }
    } catch (e) {
      // Ignore malformed href values.
    }
  }

  return links;
};

const hasMeta = (html, name) => {
  const pattern = new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["'][^"']+["']`, 'i');
  return pattern.test(html);
};

const countMatches = (text, pattern) => (text.match(pattern) || []).length;

const stripHtml = (html) => html
  .replace(/<script[\s\S]*?<\/script>/gi, ' ')
  .replace(/<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const getRobotsGroups = (robotsTxt) => {
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
};

const isCrawlerAllowed = (robotsTxt, crawlerName) => {
  if (!robotsTxt) return true;
  const groups = getRobotsGroups(robotsTxt);
  const crawler = crawlerName.toLowerCase();
  const group = groups.find((item) => item.agents.includes(crawler))
    || groups.find((item) => item.agents.includes('*'));

  if (!group) return true;

  const disallowRoot = group.rules.some((rule) => rule.type === 'disallow' && rule.path === '/');
  const allowRoot = group.rules.some((rule) => rule.type === 'allow' && (rule.path === '/' || rule.path === ''));
  return !disallowRoot || allowRoot;
};

const makeFix = (pillar, impact, title, description, number) => ({
  pillar,
  impact,
  color: impact === 'High Impact' ? '#ff646d' : impact === 'Medium Impact' ? '#f59e0b' : '#4dd8d0',
  title,
  description,
  number,
});

const analyzePage = ({ html, statusCode, latency, robotsTxt, llmsTxt }) => {
  const visibleText = stripHtml(html);
  const words = visibleText ? visibleText.split(/\s+/).length : 0;
  const sentences = Math.max(1, countMatches(visibleText, /[.!?]+/g));
  const avgWordsPerSentence = words / sentences;
  const imageCount = countMatches(html, /<img\b/gi);
  const imagesWithAlt = countMatches(html, /<img\b[^>]*\balt=["'][^"']+["']/gi);
  const imageAltRatio = imageCount ? imagesWithAlt / imageCount : 1;
  const hasTitle = /<title>[^<]{8,}<\/title>/i.test(html);
  const hasDescription = hasMeta(html, 'description');
  const hasViewport = hasMeta(html, 'viewport');
  const hasJsonLd = /<script[^>]+type=["']application\/ld\+json["'][^>]*>/i.test(html);
  const hasOpenGraph = hasMeta(html, 'og:title') || hasMeta(html, 'og:description');
  const hasCanonical = /<link[^>]+rel=["']canonical["']/i.test(html);
  const h1Count = countMatches(html, /<h1\b/gi);
  const headingCount = countMatches(html, /<h[1-3]\b/gi);
  const paragraphCount = countMatches(html, /<p\b/gi);
  const hasHtmlLang = /<html[^>]+\blang=["'][^"']+["']/i.test(html);
  const hasAria = /\baria-label=|\baria-labelledby=|\brole=/i.test(html);
  const llmsExists = Boolean(llmsTxt && llmsTxt.trim().length > 40);

  const accessibility = Math.min(33,
    (statusCode >= 200 && statusCode < 400 ? 4 : 0)
    + (hasHtmlLang ? 5 : 0)
    + (hasViewport ? 4 : 0)
    + Math.round(imageAltRatio * 10)
    + (hasAria ? 5 : 0)
    + (llmsExists ? 5 : 0));

  const readability = Math.min(37,
    (hasTitle ? 6 : 0)
    + (hasDescription ? 7 : 0)
    + (headingCount >= 3 ? 8 : headingCount >= 1 ? 4 : 0)
    + (paragraphCount >= 4 ? 5 : paragraphCount >= 1 ? 3 : 0)
    + (words >= 350 ? 5 : words >= 120 ? 3 : 0)
    + (avgWordsPerSentence <= 24 ? 6 : avgWordsPerSentence <= 32 ? 3 : 0));

  const understandability = Math.min(30,
    (hasJsonLd ? 10 : 0)
    + (hasOpenGraph ? 5 : 0)
    + (hasCanonical ? 4 : 0)
    + (h1Count === 1 ? 5 : h1Count > 1 ? 2 : 0)
    + (headingCount >= 5 ? 3 : headingCount >= 2 ? 1 : 0)
    + (llmsExists ? 3 : 0));

  const fixes = [];
  if (!hasJsonLd) {
    fixes.push(makeFix(
      'Understandability',
      'High Impact',
      'Add JSON-LD structured data',
      'Add Organization, WebSite, Article, Product, LocalBusiness, or FAQPage schema. Structured data gives AI models explicit signals about your content.',
      '#8'
    ));
  }
  if (!llmsExists) {
    fixes.push(makeFix(
      'Accessibility',
      'High Impact',
      'Create an llms.txt file',
      'Add a /llms.txt file at your domain root describing your site for AI models. Include company details, important URLs, contact information, and preferred citation format.',
      '#14'
    ));
  }
  if (words < 350 || headingCount < 3) {
    fixes.push(makeFix(
      'Understandability',
      'Medium Impact',
      'Add AI-optimised content',
      'Create clear service pages, comparison content, buying guides, FAQs, and concise summaries. These formats are frequently cited by AI models.',
      '#15'
    ));
  }
  if (!hasDescription) {
    fixes.push(makeFix(
      'Readability',
      'Medium Impact',
      'Add a descriptive meta description',
      'Write a concise meta description that explains what the page offers, who it helps, and the primary service or topic.',
      '#5'
    ));
  }
  if (imageCount && imageAltRatio < 0.8) {
    fixes.push(makeFix(
      'Accessibility',
      'Medium Impact',
      'Improve image alt text',
      'Give important product, service, and proof images descriptive alt text so crawlers can understand visuals without rendering them.',
      '#11'
    ));
  }
  if (latency > 1200) {
    fixes.push(makeFix(
      'Accessibility',
      'Medium Impact',
      'Improve page response time',
      'Reduce server response time, use caching, and serve assets through a CDN so AI crawlers can retrieve content reliably.',
      '#3'
    ));
  }

  return {
    score: Math.round(accessibility + readability + understandability),
    pillars: {
      accessibility: { score: accessibility, total: 33 },
      readability: { score: readability, total: 37 },
      understandability: { score: understandability, total: 30 },
    },
    fixes: fixes.slice(0, 3),
  };
};

const averageAnalyses = (analyses) => {
  const count = Math.max(1, analyses.length);
  const sum = analyses.reduce((acc, item) => ({
    accessibility: acc.accessibility + item.pillars.accessibility.score,
    readability: acc.readability + item.pillars.readability.score,
    understandability: acc.understandability + item.pillars.understandability.score,
    fixes: acc.fixes.concat(item.fixes),
  }), {
    accessibility: 0,
    readability: 0,
    understandability: 0,
    fixes: [],
  });

  const pillars = {
    accessibility: { score: Math.round(sum.accessibility / count), total: 33 },
    readability: { score: Math.round(sum.readability / count), total: 37 },
    understandability: { score: Math.round(sum.understandability / count), total: 30 },
  };
  const uniqueFixes = [];
  const seenFixes = new Set();

  sum.fixes.forEach((fix) => {
    if (!seenFixes.has(fix.title)) {
      seenFixes.add(fix.title);
      uniqueFixes.push(fix);
    }
  });

  return {
    score: pillars.accessibility.score + pillars.readability.score + pillars.understandability.score,
    pillars,
    fixes: uniqueFixes.slice(0, 3),
  };
};

const checkCrawlerRequest = async (url, robotsTxt, crawler) => {
  if (!isCrawlerAllowed(robotsTxt, crawler.name)) {
    return { ...crawler, allowed: false };
  }

  const result = await fetchUrl(url, 0, crawler.name);
  const textLength = stripHtml(result.body).length;
  const blockedByResponse = result.statusCode >= 400
    || /access denied|forbidden|captcha|cloudflare|bot detection|blocked/i.test(result.body)
    || textLength < 80;

  return { ...crawler, allowed: result.ok && !blockedByResponse };
};

const getHostingInfo = async (hostname) => {
  try {
    const records = await dns.resolve4(hostname);
    return {
      ip: records[0],
      country: 'Unknown',
      region: 'Unknown',
      provider: 'Resolved DNS',
    };
  } catch (err) {
    return {
      ip: 'N/A',
      country: 'Unknown',
      region: 'Unknown',
      provider: 'Unknown',
    };
  }
};

router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    const target = normalizeInput(url.trim());
    const startedAt = Date.now();
    const [page, robots, llms, hostingInfo] = await Promise.all([
      fetchUrl(target.fullUrl),
      fetchUrl(`${target.origin}/robots.txt`),
      fetchUrl(`${target.origin}/llms.txt`),
      getHostingInfo(target.hostname),
    ]);

    const robotsTxt = robots.ok ? robots.body : '';
    const llmsTxt = llms.ok ? llms.body : '';
    const internalLinks = extractInternalLinks(page.body, target.origin)
      .filter((link) => link !== target.fullUrl)
      .slice(0, 5);
    const extraPages = await Promise.all(internalLinks.map((link) => fetchUrl(link)));
    const scannedPages = [page, ...extraPages].filter((item) => item.ok && item.body);
    const pageAnalyses = (scannedPages.length ? scannedPages : [page]).map((item) => analyzePage({
      html: item.body,
      statusCode: item.statusCode,
      latency: item.latency,
      robotsTxt,
      llmsTxt,
    }));
    const analysis = averageAnalyses(pageAnalyses);

    const crawlerRows = await Promise.all(
      llmCrawlers.map((crawler) => checkCrawlerRequest(target.fullUrl, robotsTxt, crawler))
    );
    const llmAllowed = crawlerRows.filter((crawler) => crawler.allowed).length;
    const adjacentAllowed = adjacentCrawlers.filter((crawler) => isCrawlerAllowed(robotsTxt, crawler)).length;
    const searchAllowed = searchCrawlers.filter((crawler) => isCrawlerAllowed(robotsTxt, crawler)).length;
    const totalAllowed = llmAllowed + adjacentAllowed;
    const totalCrawlers = llmCrawlers.length + adjacentCrawlers.length;

    const crawlerStatus = totalAllowed === totalCrawlers
      ? 'Excellent'
      : totalAllowed >= Math.ceil(totalCrawlers * 0.65)
        ? 'Partial'
        : 'Critical';

    res.json({
      url: target.hostname,
      score: analysis.score,
      latency: page.latency || 'N/A',
      scanTime: `${((Date.now() - startedAt) / 1000).toFixed(1)}s`,
      pagesScanned: scannedPages.length || 1,
      hostingLocation: hostingInfo.region,
      hostingCountry: hostingInfo.country,
      ip: hostingInfo.ip,
      provider: hostingInfo.provider,
      pillars: analysis.pillars,
      crawlerAccess: {
        allowed: totalAllowed,
        total: totalCrawlers,
        llmAllowed,
        llmTotal: llmCrawlers.length,
        adjacentAllowed,
        adjacentTotal: adjacentCrawlers.length,
        searchAllowed,
        searchTotal: searchCrawlers.length,
        status: crawlerStatus,
      },
      crawlers: crawlerRows,
      topFixes: analysis.fixes,
      recommendations: analysis.fixes.map((fix) => fix.title),
    });
  } catch (err) {
    console.error('GEO Score error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
