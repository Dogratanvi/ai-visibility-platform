const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'See how ChatGPT, Perplexity, and Gemini talk about your brand.',
    monthlyPrice: 79,
    annualMonthlyPrice: 63,
    annualDiscountPercent: 20,
    priceEnvs: {
      monthly: 'STRIPE_STARTER_PRICE_ID',
      annual: 'STRIPE_STARTER_ANNUAL_PRICE_ID',
    },
    highlighted: false,
    badge: null,
    entitlements: {
      maxWebsites: 1,
      brandsPerAccount: 1,
      aiPlatforms: 3,
      platformNames: ['ChatGPT', 'Perplexity', 'Gemini'],
      trackedPrompts: 25,
      competitors: 3,
      historyDays: 30,
      dailyVisibilityTracking: true,
      crossPlatformComparison: true,
      basicCompetitiveRanking: true,
      narrativeIntelligence: false,
      perceptionGapAnalysis: false,
      priorityRecommendations: false,
      contentBriefGeneration: false,
      weeklyAutoRefresh: false,
      sourceMap: false,
      slackAlerts: false,
      shopifyIntegration: false,
      teamSeats: 1,
    },
    featureGroups: [
      {
        title: null,
        features: [
          { label: '1 brand / website tracked' },
          { label: '3 AI platforms', detail: 'ChatGPT, Perplexity, Gemini' },
          { label: '25 tracked prompts' },
          { label: '3 competitors tracked' },
          { label: '30 days of history' },
          { label: 'Daily visibility tracking' },
          { label: 'Cross-platform comparison' },
          { label: 'Basic competitive ranking' },
        ],
      },
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'See it, understand it, fix it — every week, automatically.',
    monthlyPrice: 299,
    annualMonthlyPrice: 239,
    annualDiscountPercent: 20,
    priceEnvs: {
      monthly: 'STRIPE_PRO_PRICE_ID',
      annual: 'STRIPE_PRO_ANNUAL_PRICE_ID',
    },
    highlighted: true,
    badge: 'Most popular',
    entitlements: {
      maxWebsites: 3,
      brandsPerAccount: 3,
      aiPlatforms: 5,
      platformNames: ['ChatGPT', 'Perplexity', 'Gemini', 'Google AIO', 'AI Mode'],
      trackedPrompts: 75,
      competitors: 5,
      historyDays: 90,
      dailyVisibilityTracking: true,
      crossPlatformComparison: true,
      basicCompetitiveRanking: true,
      narrativeIntelligence: true,
      perceptionGapAnalysis: true,
      priorityRecommendations: true,
      contentBriefGeneration: true,
      weeklyAutoRefresh: true,
      sourceMap: false,
      slackAlerts: false,
      shopifyIntegration: false,
      teamSeats: 3,
    },
    featureGroups: [
      {
        title: null,
        features: [
          { label: '5 AI platforms', detail: '+ Google AIO & AI Mode' },
          { label: '75 tracked prompts' },
          { label: '5 competitors tracked' },
          { label: '90 days of history' },
        ],
      },
      {
        title: 'Everything in Starter, plus:',
        features: [
          { label: '3 brands / websites tracked' },
          { label: 'Full AI narrative intelligence' },
          { label: 'Perception gap analysis' },
          { label: 'Prioritized recommendations' },
          { label: 'Content brief generation' },
          { label: 'Weekly auto-refresh' },
        ],
      },
    ],
  },
  {
    id: 'scale',
    name: 'Scale',
    description: 'Multi-brand tracking, deeper history, ship from Slack.',
    monthlyPrice: 499,
    annualMonthlyPrice: 399,
    annualDiscountPercent: 20,
    priceEnvs: {
      monthly: 'STRIPE_SCALE_PRICE_ID',
      annual: 'STRIPE_SCALE_ANNUAL_PRICE_ID',
    },
    highlighted: false,
    badge: null,
    entitlements: {
      maxWebsites: 10,
      brandsPerAccount: 10,
      aiPlatforms: 7,
      platformNames: ['ChatGPT', 'Perplexity', 'Gemini', 'Google AIO', 'AI Mode', 'Claude', 'Grok'],
      trackedPrompts: 125,
      competitors: 8,
      historyDays: 180,
      dailyVisibilityTracking: true,
      crossPlatformComparison: true,
      basicCompetitiveRanking: true,
      narrativeIntelligence: true,
      perceptionGapAnalysis: true,
      priorityRecommendations: true,
      contentBriefGeneration: true,
      weeklyAutoRefresh: true,
      sourceMap: true,
      slackAlerts: true,
      shopifyIntegration: true,
      teamSeats: 10,
    },
    featureGroups: [
      {
        title: null,
        features: [
          { label: '7 AI platforms', detail: "all of Pro's + Claude & Grok" },
          { label: '125 tracked prompts' },
          { label: '8 competitors tracked' },
          { label: '180 days of history' },
        ],
      },
      {
        title: 'Everything in Pro, plus:',
        features: [
          { label: '10 brands / websites tracked' },
          { label: 'Source map (Sankey)' },
          { label: 'Slack alerts' },
          { label: 'Shopify integration' },
          { label: '10 team seats' },
        ],
      },
    ],
  },
];

const FREE_ENTITLEMENTS = {
  maxWebsites: 0,
  brandsPerAccount: 0,
  aiPlatforms: 0,
  platformNames: [],
  trackedPrompts: 0,
  competitors: 0,
  historyDays: 0,
  dailyVisibilityTracking: false,
  crossPlatformComparison: false,
  basicCompetitiveRanking: false,
  narrativeIntelligence: false,
  perceptionGapAnalysis: false,
  priorityRecommendations: false,
  contentBriefGeneration: false,
  weeklyAutoRefresh: false,
  sourceMap: false,
  slackAlerts: false,
  shopifyIntegration: false,
  teamSeats: 0,
};

const ADMIN_ENTITLEMENTS = {
  maxWebsites: null,
  brandsPerAccount: null,
  aiPlatforms: null,
  platformNames: ['All platforms'],
  trackedPrompts: null,
  competitors: null,
  historyDays: null,
  dailyVisibilityTracking: true,
  crossPlatformComparison: true,
  basicCompetitiveRanking: true,
  narrativeIntelligence: true,
  perceptionGapAnalysis: true,
  priorityRecommendations: true,
  contentBriefGeneration: true,
  weeklyAutoRefresh: true,
  sourceMap: true,
  slackAlerts: true,
  shopifyIntegration: true,
  teamSeats: null,
};

const PLAN_ALIASES = {
  growth: 'pro',
};

const normalizePlanId = (planId) => PLAN_ALIASES[planId] || planId;

const getPlan = (planId) => PLANS.find((plan) => plan.id === normalizePlanId(planId));

const getPlanEntitlements = (planId, { isAdmin = false } = {}) => {
  if (isAdmin) return ADMIN_ENTITLEMENTS;
  return getPlan(planId)?.entitlements || FREE_ENTITLEMENTS;
};

const getPlanPriceEnv = (plan, billingPeriod = 'monthly') => (
  plan.priceEnvs?.[billingPeriod] || plan.priceEnvs?.monthly
);

const getPublicPlans = () => PLANS.map(({ priceEnvs, ...plan }) => ({
  ...plan,
  billingPeriods: ['monthly', 'annual'],
}));

module.exports = {
  PLANS,
  getPlan,
  getPlanEntitlements,
  getPlanPriceEnv,
  getPublicPlans,
  normalizePlanId,
};
