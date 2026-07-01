const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function seedBlogs() {
  try {
    // For development, allow seeding without a key
    const providedKey = process.argv[2];
    const seedKey = process.env.SEED_KEY;
    
    if (seedKey && providedKey !== seedKey) {
      console.error('Invalid seed key provided.');
      process.exit(1);
    }

    const blogs = [
      {
        title: 'How to Optimize Your Brand for AI Search Engines',
        slug: 'optimize-brand-ai-search',
        excerpt: 'Learn the essential strategies to ensure your brand appears in AI-powered search results and recommendations.',
        author: 'AI Visibility Team',
        category: 'AI Strategy',
        featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1677442d019cecf8eda1c59b38a2b1b5?w=800&h=500&fit=crop',
        readTime: 5,
        content: `AI-powered search engines like ChatGPT, Gemini, and Perplexity are changing how people discover brands. Unlike traditional search engines, these AI platforms synthesize information and provide recommendations, making it crucial for brands to optimize their online presence.

## Why AI Visibility Matters

As millions of people shift from Google to AI search engines, your brand visibility depends on:
- Accurate business information across the web
- High-quality content that AI can reference
- Strong positioning in your industry
- Positive mentions and citations

## Key Strategies for AI Optimization

### 1. Ensure Accurate Business Information
Make sure your business details are consistent across all platforms:
- Google Business Profile
- Industry directories
- Your official website
- Social media profiles

### 2. Create AI-Friendly Content
Write content that answers common customer questions:
- Product comparison guides
- How-to articles and tutorials
- Case studies and success stories
- Transparent pricing and benefits information

### 3. Build Citations and Mentions
Increase your brand's visibility in AI systems by:
- Getting mentioned in industry publications
- Publishing thought leadership content
- Participating in industry discussions
- Building partnerships and collaborations

### 4. Monitor Your AI Visibility
Track how you appear across different AI platforms to:
- Identify gaps in your online presence
- Understand what AI sees about your brand
- Adjust your strategy based on actual results

## The Future of Discovery

AI search is not just a trend—it's becoming the primary way people discover products and services. By optimizing for AI now, you're positioning your brand for long-term success.

Start by auditing your current AI visibility and identifying opportunities to improve your presence across these emerging platforms.`,
        published: true,
      },
      {
        title: 'The Complete Guide to Citation Strategy for AI Platforms',
        slug: 'citation-strategy-ai-platforms',
        excerpt: 'Understanding how citations impact your brand visibility in AI-powered platforms and how to build a winning citation strategy.',
        author: 'Sarah Chen',
        category: 'Citation Strategy',
        featured: true,
        imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=500&fit=crop',
        readTime: 7,
        content: `Citations—mentions of your brand across authoritative websites—are increasingly important for AI visibility. AI systems use citations as a trust signal, giving higher weight to brands mentioned in reputable sources.

## What Are Citations in the AI Era?

Traditionally, citations were important for local SEO. Today, they serve a dual purpose:
1. **Direct Citations**: Places where AI systems can find information about your brand
2. **Trust Signals**: Evidence that your brand is legitimate and respected

## How AI Platforms Use Citations

When someone asks ChatGPT "What's the best skincare brand for sensitive skin?", the AI:
1. Searches its training data for relevant information
2. Identifies brands mentioned in reputable sources
3. Evaluates the context and sentiment of those mentions
4. Provides recommendations based on citation quality and frequency

## Building Your Citation Strategy

### Step 1: Audit Your Current Citations
Identify where your brand is already mentioned across the web, including:
- Industry publications and blogs
- Review sites and directories
- News outlets
- Academic sources
- Social media platforms

### Step 2: Prioritize High-Authority Sources
Focus on getting citations from:
- Industry-specific publications
- Established news outlets
- Government and educational institutions
- Well-known directories
- Influential blogs in your space

### Step 3: Create Citation-Worthy Content
Develop content that naturally attracts citations:
- Original research and data
- Industry reports
- Expert interviews
- Unique perspectives
- Newsworthy announcements

### Step 4: Proactive Outreach
Reach out to relevant publications and websites about:
- New product launches
- Company milestones
- Industry insights
- Expert commentary on trends
- Unique business stories

### Step 5: Monitor and Adjust
Continuously track:
- Where your brand is mentioned
- The sentiment of those mentions
- Citation frequency and growth
- Competitor citation strategies
- Emerging citation opportunities

## Common Citation Building Mistakes

Avoid these pitfalls:
- **Low-quality directories**: Not all citations are equal
- **Irrelevant mentions**: Quality beats quantity
- **Ignoring sentiment**: Negative citations can hurt
- **Inconsistent information**: Conflicting details reduce trust
- **Over-optimization**: Natural citations are more effective

## Measuring Citation Impact

Track metrics like:
- Citation volume by source quality
- Average sentiment of citations
- Citation growth over time
- AI visibility rankings
- Traffic from AI-based recommendations

The brands winning in AI visibility are those taking a strategic, long-term approach to citations. Start today by auditing your current presence and building a roadmap for meaningful citations from authoritative sources.`,
        published: true,
      },
      {
        title: 'ChatGPT, Gemini, or Claude: Which AI Platform Should You Optimize For?',
        slug: 'optimize-multiple-ai-platforms',
        excerpt: 'A comparative analysis of major AI platforms and how to develop a multi-platform optimization strategy.',
        author: 'Michael Rodriguez',
        category: 'AI Platforms',
        featured: false,
        imageUrl: 'https://images.unsplash.com/photo-1517694712202-14819c9cb5c7?w=800&h=500&fit=crop',
        readTime: 6,
        content: `Different AI platforms have different approaches to recommendations and citations. A winning strategy requires understanding each platform's unique characteristics and optimizing accordingly.

## The Major AI Platforms

### ChatGPT
- **Market Share**: Largest user base
- **Update Frequency**: Training data updates periodically
- **Citation Style**: Direct mentions in responses
- **Optimization Focus**: High-quality web presence and recent content

### Google Gemini
- **Market Share**: Growing rapidly
- **Update Frequency**: Real-time web access
- **Citation Style**: Links and source attribution
- **Optimization Focus**: Structured data and SEO fundamentals

### Claude
- **Market Share**: Emerging competitor
- **Update Frequency**: Selective data training
- **Citation Style**: Careful source attribution
- **Optimization Focus**: Trustworthy, transparent information

### Perplexity
- **Market Share**: Research-focused users
- **Update Frequency**: Real-time web search
- **Citation Style**: Comprehensive source listing
- **Optimization Focus**: Detailed, well-sourced content

## Unified Optimization Strategy

Rather than optimizing separately for each platform, focus on fundamentals that work across all:
1. **High-Quality Content**: Platforms favor well-written, authoritative content
2. **Accurate Information**: Consistency builds trust
3. **Recent Updates**: Fresh content signals ongoing relevance
4. **Clear Attribution**: Proper sourcing increases visibility
5. **Natural Links**: Authentic relationships boost credibility

## Platform-Specific Tactics

### For ChatGPT and Claude
- Focus on comprehensive, authoritative web pages
- Publish in recognized industry publications
- Build brand authority through thought leadership
- Maintain consistent messaging across platforms

### For Gemini and Perplexity
- Implement structured data markup
- Optimize for traditional SEO signals
- Ensure real-time information availability
- Create detailed, well-organized content

## Monitoring Across Platforms

Track your visibility across all major AI platforms:
- Ask the same questions on each platform
- Note which brands appear in results
- Analyze the context of mentions
- Identify patterns and opportunities

## The 80/20 Rule

Focus 80% of your effort on core fundamentals:
- Quality content
- Accurate information
- Industry presence
- Brand building

Reserve 20% for platform-specific optimizations.

By taking a unified approach to optimization while understanding each platform's unique characteristics, you'll maximize your AI visibility across all major platforms.`,
        published: true,
      },
    ];

    console.log('Seeding blogs...');

    for (const blogData of blogs) {
      const existing = await prisma.blog.findUnique({
        where: { slug: blogData.slug },
      });

      if (existing) {
        console.log(`Blog "${blogData.title}" already exists, skipping...`);
        continue;
      }

      const blog = await prisma.blog.create({
        data: blogData,
      });

      console.log(`✓ Created blog: "${blog.title}"`);
    }

    console.log('✓ Blog seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding blogs:', err);
    process.exit(1);
  }
}

seedBlogs();
