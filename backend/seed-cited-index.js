const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

const samplePrompts = [
  // Skincare & Beauty - India
  { text: 'best skincare brands in India', category: 'skincare', country: 'India' },
  { text: 'affordable face wash under 500 rupees', category: 'skincare', country: 'India' },
  { text: 'best moisturizer for dry skin in India', category: 'skincare', country: 'India' },
  { text: 'which sunscreen is best for Indian skin', category: 'skincare', country: 'India' },
  
  // Travel & Luggage - India
  { text: 'best luggage brands for travel in India', category: 'travel', country: 'India' },
  { text: 'affordable luggage for flights', category: 'travel', country: 'India' },
  
  // Audio & Wearables - India
  { text: 'best earphones under 5000 rupees in India', category: 'audio', country: 'India' },
  { text: 'best smartwatch brands in India', category: 'audio', country: 'India' },
];

const mockResponses = {
  skincare: [
    { brand: 'Minimalist', sentiment: 'POSITIVE', tags: ['affordable', 'ingredient-first'] },
    { brand: 'The Derma Co', sentiment: 'POSITIVE', tags: ['dermatologist-approved'] },
    { brand: 'Plum', sentiment: 'MIXED', tags: ['natural', 'cruelty-free'] },
    { brand: 'Dot & Key', sentiment: 'POSITIVE', tags: ['natural', 'affordable'] },
    { brand: 'Deconstruct', sentiment: 'MIXED', tags: ['minimalist', 'clinical'] },
  ],
  travel: [
    { brand: 'VIP', sentiment: 'POSITIVE', tags: ['affordable', 'durable'] },
    { brand: 'Safari', sentiment: 'POSITIVE', tags: ['lightweight', 'budget'] },
    { brand: 'Skybags', sentiment: 'MIXED', tags: ['affordable', 'stylish'] },
  ],
  audio: [
    { brand: 'boAt', sentiment: 'POSITIVE', tags: ['budget-friendly', 'bass-heavy'] },
    { brand: 'Noise', sentiment: 'MIXED', tags: ['affordable', 'feature-rich'] },
    { brand: 'Sony', sentiment: 'POSITIVE', tags: ['premium', 'reliable'] },
    { brand: 'JBL', sentiment: 'MIXED', tags: ['good-sound', 'expensive'] },
  ]
};

async function seed() {
  try {
    const seedKey = process.argv[2] || process.env.SEED_KEY;
    if (!process.env.SEED_KEY || seedKey !== process.env.SEED_KEY) {
      console.error('Missing or invalid seed key. Provide as first argument or set SEED_KEY in env.');
      process.exit(1);
    }

    console.log('Seeding Cited Index prompts...');

    // Create prompts
    for (const p of samplePrompts) {
      await prisma.prompt.upsert({
        where: { text: p.text },
        update: {},
        create: p
      });
    }

    console.log('Created prompts. Creating mock runs and responses...');

    // For May 2026, create a run for each prompt and mock responses
    const period = new Date(2026, 4, 1);
    const platforms = ['CHATGPT', 'CLAUDE', 'GEMINI', 'PERPLEXITY'];

    for (const p of samplePrompts) {
      const prompt = await prisma.prompt.findUnique({ where: { text: p.text } });
      
      const run = await prisma.run.create({
        data: { promptId: prompt.id, period, status: 'completed' }
      });

      // Create responses from each platform
      const brands = mockResponses[p.category] || [];
      for (const platform of platforms) {
        const responseText = `Based on current trends, the top ${p.category} recommendations are: ${brands.map(b => b.brand).join(', ')}.`;
        
        const response = await prisma.response.create({
          data: {
            runId: run.id,
            platform,
            text: responseText,
            status: 'success'
          }
        });

        // Create mentions
        for (let i = 0; i < brands.length; i++) {
          const brand = brands[i];
          await prisma.mention.create({
            data: {
              responseId: response.id,
              brandName: brand.brand,
              position: i + 1,
              sentiment: brand.sentiment,
              tags: brand.tags
            }
          });
        }
      }
    }

    console.log('Created mock runs and responses. Aggregating citations...');

    // Aggregate for May 2026
    const categories = ['skincare', 'travel', 'audio'];
    for (const category of categories) {
      const prompts = samplePrompts.filter(p => p.category === category);
      if (prompts.length === 0) continue;

      const mentions = await prisma.mention.findMany({
        where: {
          response: {
            run: {
              prompt: { category, country: 'India' }
            }
          }
        },
        include: { response: { include: { run: true } } }
      });

      const brandMap = {};
      for (const m of mentions) {
        const key = m.brandName.toLowerCase();
        if (!brandMap[key]) {
          brandMap[key] = { brandName: m.brandName, mentions: [], sentiments: [] };
        }
        brandMap[key].mentions.push(m);
        if (m.sentiment) brandMap[key].sentiments.push(m.sentiment);
      }

      for (const [, data] of Object.entries(brandMap)) {
        const positions = data.mentions.map(m => m.position).filter(p => p > 0);
        const avgPosition = positions.length ? positions.reduce((a, b) => a + b, 0) / positions.length : null;
        const sentiments = data.sentiments.sort((a, b) =>
          data.sentiments.filter(v => v === a).length - data.sentiments.filter(v => v === b).length
        );
        const sentiment = sentiments.length ? sentiments[sentiments.length - 1] : null;
        const score = Math.min(100, Math.round((data.mentions.length / Math.max(1, mentions.length)) * 100 * 2));

        await prisma.citation.upsert({
          where: {
            brandName_category_country_period: {
              brandName: data.brandName,
              category,
              country: 'India',
              period
            }
          },
          update: {
            mentionCount: data.mentions.length,
            score,
            avgPosition,
            sentiment
          },
          create: {
            brandName: data.brandName,
            category,
            country: 'India',
            period,
            mentionCount: data.mentions.length,
            score,
            change: 0,
            avgPosition,
            sentiment
          }
        });
      }
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

seed();
