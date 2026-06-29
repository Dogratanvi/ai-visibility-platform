# Cited Index Backend Setup Guide

## Overview
The Cited Index backend tracks AI visibility across multiple LLM platforms (ChatGPT, Claude, Gemini, Perplexity). It ingests responses, extracts brand mentions, and aggregates monthly rankings.

## Quick Start

### 1. Run Prisma Migration
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name add_cited_index
```

### 2. Set Environment Variables
```bash
export SEED_KEY=your_secret_seed_key_here
```

### 3. Start Backend Server
```bash
npm install
npm run dev   # or: node src/index.js
```

### 4. Seed Cited Index Data (Mock LLM Responses)
```bash
# CLI method
node backend/seed-cited-index.js your_secret_seed_key_here

# Or HTTP method
curl -X POST http://localhost:5000/api/cited-index/aggregate \
  -H "x-seed-key: your_secret_seed_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "skincare",
    "country": "India",
    "period": "2026-05-01"
  }'
```

## API Endpoints

### GET /api/cited-index
Fetch rankings for a category/country/period.

**Query Parameters:**
- `category` (optional): e.g., "skincare", "travel", "audio"
- `country` (optional): e.g., "India", "US"
- `period` (optional): "YYYY-MM" format
- `limit` (default: 10)
- `skip` (default: 0)

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "brand": "Minimalist",
      "category": "skincare",
      "country": "India",
      "score": 85,
      "change": 2.5,
      "mentionCount": 45,
      "avgPosition": 1.3,
      "sentiment": "POSITIVE"
    }
  ],
  "total": 120
}
```

### GET /api/cited-index/prompts
Fetch prompts for a category/country.

**Query Parameters:**
- `category` (optional)
- `country` (optional)
- `active` (default: true)

**Response:**
```json
{
  "data": [
    {
      "id": "...",
      "text": "best skincare brands in India",
      "category": "skincare",
      "country": "India",
      "active": true
    }
  ]
}
```

### POST /api/cited-index/ingest
Ingest raw LLM responses with brand mentions.

**Body:**
```json
{
  "promptId": "...",
  "period": "2026-05-01",
  "platform": "CHATGPT",
  "text": "The best skincare brands in India are...",
  "mentions": [
    {
      "brandName": "Minimalist",
      "position": 1,
      "sentiment": "POSITIVE",
      "tags": ["affordable", "ingredient-first"]
    }
  ]
}
```

### POST /api/cited-index/aggregate
Aggregates mentions into monthly citations (requires `x-seed-key` header).

**Headers:**
- `x-seed-key: your_secret_key`

**Body:**
```json
{
  "category": "skincare",
  "country": "India",
  "period": "2026-05-01"
}
```

## Data Model

### Prompt
- `id`, `text`, `category`, `country`, `active`, `createdAt`

### Run
- `id`, `promptId`, `period`, `status` ("pending", "running", "completed", "failed")

### Response
- `id`, `runId`, `platform` (CHATGPT, CLAUDE, GEMINI, PERPLEXITY), `text`, `status`

### Mention
- `id`, `responseId`, `brandName`, `position`, `sentiment`, `tags[]`

### Citation
- `id`, `brandName`, `category`, `country`, `period`, `mentionCount`, `score`, `change`, `avgPosition`, `sentiment`

## Testing

### Test GET rankings
```bash
curl http://localhost:5000/api/cited-index?category=skincare&country=India&period=2026-05
```

### Test ingest
```bash
curl -X POST http://localhost:5000/api/cited-index/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "CHATGPT",
    "period": "2026-05-01",
    "text": "Top skincare: Minimalist, The Derma Co",
    "mentions": [
      {"brandName": "Minimalist", "position": 1, "sentiment": "POSITIVE"}
    ]
  }'
```

## Next Steps
- [ ] Implement real LLM runner (currently mock data only)
- [ ] Add monthly scheduler to auto-run prompts
- [ ] Implement frontend Cited Index page with category filters
- [ ] Add per-LLM breakdown and trend charts
- [ ] Secure endpoints with authentication
- [ ] Add rate-limiting for ingest endpoint
