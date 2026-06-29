const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function seed() {
  try {
    const providedKey = process.argv[2] || process.env.SEED_KEY;
    if (!process.env.SEED_KEY || providedKey !== process.env.SEED_KEY) {
      console.error('Missing or invalid seed key. Provide as first argument or set SEED_KEY in env.');
      process.exit(1);
    }

    const brands = ['Minimalist', 'The Derma Co', "Re'equil", 'Dot & Key', 'Deconstruct', 'Plum'];
    const tagNames = ['affordable', 'ingredient-first', 'fragrance-free', 'lightweight', 'hydrating', 'sunscreen'];

    const createdTags = {};
    for (const name of tagNames) {
      const tag = await prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name }
      });
      createdTags[name] = tag;
    }

    const period = new Date(2026, 4, 1);
    for (let i = 0; i < brands.length; i++) {
      const name = brands[i];
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const brand = await prisma.brand.upsert({
        where: { slug },
        update: {},
        create: { name, slug }
      });

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

      const attach = Object.values(createdTags).slice(0, Math.min(3, Object.keys(createdTags).length));
      for (const t of attach) {
        await prisma.rankingTag.create({ data: { rankingId: ranking.id, tagId: t.id } });
      }
    }

    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed', err);
    process.exit(1);
  }
}

seed();
