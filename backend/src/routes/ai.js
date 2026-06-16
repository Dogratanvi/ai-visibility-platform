const express = require('express');
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const createMockResults = (website, selectedTools) => {
  const baseKeywords = [
    `${website} seo`,
    `${website} search visibility`,
    `${website} ranking`,
    `${website} ai optimization`,
  ];

  const results = [];
  const currentRank = Math.floor(Math.random() * 30) + 1;

  if (selectedTools.includes('chatgpt')) {
    results.push({
      tool: 'ChatGPT',
      source: 'OpenAI',
      website,
      keywords: baseKeywords.slice(0, 3),
      description: `AI-sourced keyword and ranking analysis for ${website}.`,
      googleRank: currentRank,
      rawOutput: `ChatGPT predicted rank ${currentRank} for ${website}.`,
    });
  }

  if (selectedTools.includes('claude')) {
    results.push({
      tool: 'Claude',
      source: 'Anthropic',
      website,
      keywords: baseKeywords.slice(1, 4),
      description: `Claude-style keyword recommendations for ${website}.`,
      googleRank: currentRank + 2,
      rawOutput: `Claude predicted rank ${currentRank + 2} for ${website}.`,
    });
  }

  if (selectedTools.includes('other')) {
    results.push({
      tool: 'AI Rank Scanner',
      source: 'Custom AI',
      website,
      keywords: baseKeywords.slice(0, 2),
      description: `AI search intent insights and keyword opportunities for ${website}.`,
      googleRank: Math.max(1, currentRank - 1),
      rawOutput: `Custom AI predicted rank ${Math.max(1, currentRank - 1)} for ${website}.`,
    });
  }

  return results;
};

const formatAiResults = (rawResults, website) => rawResults.map((item) => ({
  tool: item.tool || 'ChatGPT',
  source: item.source || 'OpenAI',
  website,
  keywords: Array.isArray(item.keywords) ? item.keywords : [],
  description: item.description || '',
  googleRank: item.googleRank || 0,
  rawOutput: item.rawOutput || '',
}));

const buildCsv = (results) => {
  const escapeValue = (value) => {
    const stringValue = String(value || '');
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  };

  const header = ['Tool', 'Source', 'Keywords', 'Description', 'Google Rank'];
  const rows = results.map((item) => [
    item.tool,
    item.source,
    item.keywords.join(' | '),
    item.description,
    item.googleRank,
  ]);

  return [header, ...rows].map((row) => row.map(escapeValue).join(',')).join('\n');
};

const fetchOpenAIInsights = async (website) => {
  const prompt = `You are an SEO analyst. For the website ${website}, provide a small JSON array of keyword items. Each item should include: 
  - tool: the AI tool name
  - source: where the recommendation came from
  - keywords: an array of 3 to 5 keyword phrases
  - description: a short description of the keyword set or opportunity
  - googleRank: a predicted rank number from 1 to 20

Return ONLY valid JSON.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful SEO data assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 400,
    }),
  });

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned no content');

  const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (!jsonMatch) throw new Error('Unable to parse OpenAI response');

  return JSON.parse(jsonMatch[0]);
};

const getAiResults = async (website, selectedTools) => {
  const results = [];

  if (OPENAI_API_KEY && selectedTools.includes('chatgpt')) {
    const openAiResults = await fetchOpenAIInsights(website);
    if (Array.isArray(openAiResults)) {
      results.push(...formatAiResults(openAiResults, website));
    }
  }

  const mockSource = createMockResults(website, selectedTools);
  if (!OPENAI_API_KEY || selectedTools.includes('claude') || selectedTools.includes('other')) {
    results.push(...mockSource);
  }

  return results;
};

router.post('/search', async (req, res) => {
  const { website, tools } = req.body;
  if (!website || typeof website !== 'string' || !website.trim()) {
    return res.status(400).json({ error: 'Website is required' });
  }

  const selectedTools = Array.isArray(tools) && tools.length > 0 ? tools : ['chatgpt', 'claude'];

  try {
    const results = await getAiResults(website, selectedTools);
    return res.json({ results });
  } catch (error) {
    console.error('AI search failure:', error?.message || error);
    const fallback = createMockResults(website, selectedTools);
    return res.status(200).json({
      results: fallback,
      warning: 'AI search failed, showing fallback results.',
    });
  }
});

router.post('/export', async (req, res) => {
  const { website, tools } = req.body;
  if (!website || typeof website !== 'string' || !website.trim()) {
    return res.status(400).json({ error: 'Website is required' });
  }

  const selectedTools = Array.isArray(tools) && tools.length > 0 ? tools : ['chatgpt', 'claude'];

  try {
    const results = await getAiResults(website, selectedTools);
    const csv = buildCsv(results);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ai-visibility-${website.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv"`);
    return res.send(csv);
  } catch (error) {
    console.error('AI export failure:', error?.message || error);
    const fallback = createMockResults(website, selectedTools);
    const csv = buildCsv(fallback);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="ai-visibility-${website.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv"`);
    return res.status(200).send(csv);
  }
});

module.exports = router;

// Export utility functions for reuse by other routes
module.exports.getAiResults = getAiResults;

// Fetch a cited-index-like set of citations using OpenAI when available
const fetchCitedIndexFromOpenAI = async (website) => {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured');

  const prompt = `You are a web analyst. For the website ${website}, provide a JSON array of up to 10 objects representing sites that cite or link to ${website}. Each object should have:\n- source: the absolute URL of the citing page\n- anchor: the anchor text or title\n- score: a rough confidence score (0-100)\nReturn ONLY valid JSON.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful web analyst.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 400,
    }),
  });

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('OpenAI returned no content for cited index');
  const jsonMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/);
  if (!jsonMatch) throw new Error('Unable to parse OpenAI response for cited index');
  return JSON.parse(jsonMatch[0]);
};

module.exports.fetchCitedIndex = async (website) => {
  try {
    if (OPENAI_API_KEY) {
      const citations = await fetchCitedIndexFromOpenAI(website);
      return { source: 'openai', citations };
    }
  } catch (e) {
    console.warn('OpenAI cited index failed:', e?.message || e);
  }

  // Fallback mock citations
  const mockCitations = [
    { source: `https://example.com/article-about-${website}`, anchor: `Article about ${website}`, score: 72 },
    { source: `https://blog.example.org/post-${website}`, anchor: `Blog post mentioning ${website}`, score: 51 },
  ];
  return { source: 'mock', citations: mockCitations };
};
