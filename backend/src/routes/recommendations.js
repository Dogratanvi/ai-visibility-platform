const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');
const paidMiddleware = require('../middleware/paid');

const router = express.Router();
const prisma = new PrismaClient();

const normalizeName = (value) => String(value || '')
  .toLowerCase()
  .replace(/^https?:\/\//, '')
  .replace(/^www\./, '')
  .split(/[/?#]/)[0]
  .replace(/\.(com|co|in|io|ai|org|net)$/i, '')
  .replace(/[^a-z0-9]/g, '');

const websiteBrandAliases = (website) => {
  const aliases = [
    website.propertyName,
    website.websiteUrl,
    website.propertyId,
  ].map(normalizeName).filter((value) => value.length >= 2);

  return new Set(aliases);
};

const isTrackedBrand = (brandName, aliases) => {
  const normalized = normalizeName(brandName);
  return [...aliases].some((alias) => normalized === alias);
};

const inferFormat = (prompt) => {
  if (/\b(vs|versus|compare|comparison|alternative)\b/i.test(prompt)) {
    return 'Comparison guide';
  }
  if (/\b(best|top|recommend|which|choose)\b/i.test(prompt)) {
    return 'Buying guide';
  }
  if (/\b(how|what|why|can|does|is)\b/i.test(prompt)) {
    return 'FAQ-led explainer';
  }
  return 'Expert topic guide';
};

const buildHeadings = (prompt, competitors) => {
  const competitorHeading = competitors.length
    ? `How the leading options (${competitors.slice(0, 3).join(', ')}) compare`
    : 'How the leading options compare';

  return [
    `Direct answer: ${prompt}`,
    'Who this solution is best for',
    competitorHeading,
    'Key criteria, evidence, and trade-offs',
    'Frequently asked questions',
  ];
};

const inferSchema = (format) => {
  if (format === 'Comparison guide' || format === 'Buying guide') {
    return ['Article', 'ItemList', 'BreadcrumbList'];
  }
  if (format === 'FAQ-led explainer') {
    return ['Article', 'FAQPage', 'BreadcrumbList'];
  }
  return ['Article', 'Organization', 'BreadcrumbList'];
};

const getPriority = (platformCount, competitorCount) => {
  const score = platformCount * 3 + competitorCount;
  if (score >= 10) return 'high';
  if (score >= 5) return 'medium';
  return 'low';
};

router.get('/:websiteId', authMiddleware, paidMiddleware, async (req, res) => {
  try {
    const website = await prisma.website.findFirst({
      where: { id: req.params.websiteId, userId: req.user.id },
    });
    if (!website) return res.status(404).json({ error: 'Website not found' });

    const prompts = await prisma.prompt.findMany({
      where: { active: true },
      include: {
        runs: {
          orderBy: { period: 'desc' },
          take: 1,
          include: {
            responses: {
              where: { status: 'success' },
              include: { mentions: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const aliases = websiteBrandAliases(website);
    const gaps = [];
    let analyzedResponses = 0;
    let trackedMentions = 0;

    prompts.forEach((prompt) => {
      const responses = prompt.runs[0]?.responses || [];
      analyzedResponses += responses.length;

      const competitorCounts = new Map();
      const platforms = new Set();
      let brandWasMentioned = false;

      responses.forEach((response) => {
        response.mentions.forEach((mention) => {
          if (isTrackedBrand(mention.brandName, aliases)) {
            brandWasMentioned = true;
            trackedMentions += 1;
          } else {
            const current = competitorCounts.get(mention.brandName) || 0;
            competitorCounts.set(mention.brandName, current + 1);
          }
        });

        if (!response.mentions.some((mention) => isTrackedBrand(mention.brandName, aliases))) {
          platforms.add(response.platform);
        }
      });

      if (!brandWasMentioned && responses.length > 0) {
        const competitors = [...competitorCounts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([name]) => name)
          .slice(0, 5);
        const format = inferFormat(prompt.text);

        gaps.push({
          promptId: prompt.id,
          prompt: prompt.text,
          category: prompt.category,
          country: prompt.country,
          missingOn: [...platforms],
          competitors,
          priority: getPriority(platforms.size, competitorCounts.size),
          brief: {
            format,
            suggestedTitle: `${prompt.text.replace(/[?.!]+$/, '')}: an evidence-led guide`,
            headings: buildHeadings(prompt.text, competitors),
            sourcesToCite: [
              'Primary research or official product documentation',
              'Independent industry studies and recognized publications',
              'First-party case studies with measurable outcomes',
            ],
            schemaTypes: inferSchema(format),
          },
        });
      }
    });

    const priorityOrder = { high: 0, medium: 1, low: 2 };
    gaps.sort((a, b) => (
      priorityOrder[a.priority] - priorityOrder[b.priority]
      || b.missingOn.length - a.missingOn.length
    ));

    const schemaTypes = [...new Set(gaps.flatMap((gap) => gap.brief.schemaTypes))];
    const topCompetitors = gaps
      .flatMap((gap) => gap.competitors)
      .reduce((counts, competitor) => {
        counts.set(competitor, (counts.get(competitor) || 0) + 1);
        return counts;
      }, new Map());

    return res.json({
      website: {
        id: website.id,
        name: website.propertyName,
        url: website.websiteUrl,
      },
      summary: {
        promptsAnalyzed: prompts.length,
        responsesAnalyzed: analyzedResponses,
        trackedMentions,
        contentGaps: gaps.length,
      },
      contentGaps: gaps.slice(0, 20),
      schemaRecommendations: schemaTypes.length ? schemaTypes : ['Organization', 'WebSite'],
      authorityActions: [
        {
          title: 'Earn independent mentions',
          detail: 'Prioritize relevant publications, review sites, podcasts, and industry directories that already appear in AI answers.',
        },
        {
          title: 'Build community proof',
          detail: 'Answer genuine category questions on Reddit, Quora, and specialist forums without promotional spam.',
        },
        {
          title: 'Publish verifiable evidence',
          detail: 'Add named experts, dates, methodology, original data, customer outcomes, and clear source citations.',
        },
      ],
      topCompetitors: [...topCompetitors.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, gapCount]) => ({ name, gapCount })),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendation generation failed:', error);
    return res.status(500).json({ error: 'Unable to generate recommendations' });
  }
});

module.exports = router;
