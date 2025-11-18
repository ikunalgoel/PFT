# AI Integration Implementation Guide

## Overview
This guide provides detailed instructions for implementing real AI agent integration using OpenAI or Anthropic LLMs.

---

## 1. Getting Started with OpenAI

### Step 1: Create OpenAI Account
1. Go to https://platform.openai.com/signup
2. Sign up with email or Google account
3. Verify your email address

### Step 2: Get API Key
1. Navigate to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "Finance Tracker" 
4. Copy the key (starts with `sk-...`)
5. **Important**: Save it securely - you won't see it again!

### Step 3: Add Billing
1. Go to https://platform.openai.com/account/billing
2. Add payment method
3. Set usage limits (recommended: $20/month to start)

### Step 4: Configure Environment
```bash
# In backend/.env
OPENAI_API_KEY=sk-your-key-here
AI_PROVIDER=openai
AI_MODEL=gpt-4-turbo-preview
```

---

## 2. Alternative: Anthropic Claude

### Step 1: Create Anthropic Account
1. Go to https://console.anthropic.com
2. Sign up and verify email
3. Request API access (may require approval)

### Step 2: Get API Key
1. Navigate to API Keys section
2. Generate new key
3. Copy key (starts with `sk-ant-...`)

### Step 3: Configure Environment
```bash
# In backend/.env
ANTHROPIC_API_KEY=sk-ant-your-key-here
AI_PROVIDER=anthropic
AI_MODEL=claude-3-sonnet-20240229
```

---

## 3. Installation

### Install Dependencies
```bash
cd backend
npm install openai@^4.20.0
# OR for Anthropic
npm install @anthropic-ai/sdk@^0.9.0
```

---

## 4. Implementation Details

### LLM Client Structure

```typescript
// backend/src/services/llm/llm-client.interface.ts
export interface LLMClient {
  generateInsights(prompt: string, currency: string): Promise<string>
  validateResponse(response: string): boolean
  retry<T>(fn: () => Promise<T>, maxRetries: number): Promise<T>
}
```

### OpenAI Implementation

```typescript
// backend/src/services/llm/openai-client.ts
import OpenAI from 'openai'

export class OpenAIClient implements LLMClient {
  private client: OpenAI
  private model: string
  private maxTokens: number
  private temperature: number
  
  constructor(config: LLMConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey
    })
    this.model = config.model
    this.maxTokens = config.maxTokens
    this.temperature = config.temperature
  }
  
  async generateInsights(prompt: string, currency: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are a financial advisor. User's currency is ${currency}. 
                   Format all amounts with appropriate currency symbols.
                   Respond ONLY with valid JSON.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: this.maxTokens,
      temperature: this.temperature,
      response_format: { type: 'json_object' } // Ensures JSON response
    })
    
    return response.choices[0].message.content || ''
  }
  
  async retry<T>(fn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    let lastError: Error
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        
        // Don't retry on certain errors
        if (error.status === 401 || error.status === 403) {
          throw error
        }
        
        if (i < maxRetries) {
          // Exponential backoff: 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)))
        }
      }
    }
    
    throw lastError!
  }
}
```

---

## 5. Prompt Engineering

### Prompt Template

```typescript
function buildPrompt(data: AnalyticsData, period: DateRange, currency: string): string {
  const currencySymbol = currency === 'GBP' ? '£' : '₹'
  
  return `You are a financial advisor analyzing spending patterns.

CONTEXT:
- User Currency: ${currency}
- Currency Symbol: ${currencySymbol}
- Analysis Period: ${period.startDate} to ${period.endDate}

SPENDING DATA:
- Total Spending: ${currencySymbol}${data.totalSpending.toFixed(2)}
- Number of Transactions: ${data.transactionCount}

CATEGORY BREAKDOWN:
${data.categoryBreakdown.map(c => 
  `- ${c.category}: ${currencySymbol}${c.total.toFixed(2)} (${c.percentage.toFixed(1)}%)`
).join('\n')}

BUDGET STATUS:
${data.budgetStatus?.map(b => 
  `- ${b.name}: ${b.percentageUsed.toFixed(1)}% used (${currencySymbol}${b.spent.toFixed(2)} of ${currencySymbol}${b.limit.toFixed(2)})`
).join('\n') || 'No budgets configured'}

TASK:
Provide financial insights in JSON format with the following structure:
{
  "monthlySummary": "Brief 2-3 sentence overview of spending patterns",
  "categoryInsights": [
    {
      "category": "category name",
      "total_spent": number,
      "percentage_of_total": number,
      "insight": "specific insight about this category"
    }
  ],
  "spendingSpikes": [
    {
      "date": "YYYY-MM-DD",
      "amount": number,
      "category": "category",
      "description": "explanation of spike"
    }
  ],
  "recommendations": [
    "actionable savings recommendation 1",
    "actionable savings recommendation 2",
    "actionable savings recommendation 3"
  ],
  "projections": {
    "next_week": estimated_spending_number,
    "next_month": estimated_spending_number,
    "confidence": "high|medium|low",
    "explanation": "basis for projection"
  }
}

IMPORTANT RULES:
1. Use ${currencySymbol} symbol for ALL monetary amounts in your response
2. Provide specific, actionable recommendations
3. Base projections on historical patterns
4. Identify unusual spending patterns
5. Keep insights concise and clear
6. Return ONLY valid JSON, no additional text`
}
```

### Example Response

```json
{
  "monthlySummary": "You spent £2,450 across 87 transactions this month. Your top spending category was groceries at £680, representing 28% of total spending. Overall spending is 15% higher than last month.",
  "categoryInsights": [
    {
      "category": "groceries",
      "total_spent": 680,
      "percentage_of_total": 27.8,
      "insight": "Grocery spending is within normal range. Consider meal planning to reduce waste and save £50-100 monthly."
    },
    {
      "category": "dining",
      "total_spent": 420,
      "percentage_of_total": 17.1,
      "insight": "Dining out 12 times this month. Reducing to 8 times could save £140 monthly."
    }
  ],
  "spendingSpikes": [
    {
      "date": "2025-11-10",
      "amount": 350,
      "category": "shopping",
      "description": "Large electronics purchase - one-time expense"
    }
  ],
  "recommendations": [
    "Set a monthly dining budget of £300 to reduce restaurant spending by 30%",
    "Use grocery shopping lists to avoid impulse purchases and save £80/month",
    "Review subscription services - you may have unused subscriptions costing £40/month",
    "Consider carpooling or public transit 2 days/week to save £60 on transportation",
    "Build an emergency fund with automatic £200 monthly transfers"
  ],
  "projections": {
    "next_week": 580,
    "next_month": 2300,
    "confidence": "medium",
    "explanation": "Based on 3-month average with adjustment for reduced dining spending"
  }
}
```

---

## 6. Error Handling

### Error Types

```typescript
class LLMError extends Error {
  constructor(
    message: string,
    public code: 'TIMEOUT' | 'RATE_LIMIT' | 'INVALID_RESPONSE' | 'API_ERROR' | 'AUTH_ERROR',
    public retryable: boolean = false
  ) {
    super(message)
    this.name = 'LLMError'
  }
}
```

### Error Handling Strategy

```typescript
async function generateInsightsWithFallback(
  userId: string,
  period: DateRange
): Promise<AIInsights> {
  try {
    // Try to generate with LLM
    const response = await llmClient.retry(
      () => llmClient.generateInsights(prompt, currency),
      2 // Max 2 retries
    )
    
    return parseAndStore(response)
    
  } catch (error) {
    console.error('LLM generation failed:', error)
    
    // Check if we have cached insights
    const cached = await getCachedInsights(userId)
    if (cached && isCacheValid(cached)) {
      console.log('Returning cached insights')
      return cached
    }
    
    // Generate fallback insights
    console.log('Generating fallback insights')
    return generateFallbackInsights(userId, period, currency)
  }
}
```

### Fallback Insights

```typescript
function generateFallbackInsights(
  userId: string,
  period: DateRange,
  currency: string
): AIInsights {
  return {
    monthly_summary: 'AI insights are temporarily unavailable. Basic analysis shows your spending patterns.',
    category_insights: generateBasicCategoryInsights(data, currency),
    spending_spikes: [],
    recommendations: [
      'Track your spending regularly',
      'Set up budgets for major categories',
      'Review your transactions weekly'
    ],
    projections: {
      next_week: calculateSimpleProjection(data, 7),
      next_month: calculateSimpleProjection(data, 30),
      confidence: 'low',
      explanation: 'Basic projection based on recent average'
    }
  }
}
```

---

## 7. Cost Optimization

### Caching Strategy

```typescript
class InsightsCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 hours
  
  get(userId: string, period: DateRange): AIInsights | null {
    const key = `${userId}:${period.startDate}:${period.endDate}`
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }
  
  set(userId: string, period: DateRange, data: AIInsights): void {
    const key = `${userId}:${period.startDate}:${period.endDate}`
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }
}
```

### Rate Limiting

```typescript
// In middleware/rateLimiter.ts
export const aiInsightsLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour per user
  message: 'Too many AI insight requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})
```

### Token Counting

```typescript
import { encoding_for_model } from 'tiktoken'

function estimateTokens(prompt: string, model: string): number {
  const encoding = encoding_for_model(model)
  const tokens = encoding.encode(prompt)
  encoding.free()
  return tokens.length
}

function estimateCost(tokens: number, model: string): number {
  const costs = {
    'gpt-4-turbo-preview': { input: 0.01, output: 0.03 }, // per 1K tokens
    'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 }
  }
  
  const cost = costs[model] || costs['gpt-3.5-turbo']
  return (tokens / 1000) * cost.input + (2000 / 1000) * cost.output
}
```

---

## 8. Testing

### Unit Tests

```typescript
describe('OpenAIClient', () => {
  it('should generate insights successfully', async () => {
    const client = new OpenAIClient(config)
    const prompt = buildPrompt(mockData, mockPeriod, 'GBP')
    
    const response = await client.generateInsights(prompt, 'GBP')
    
    expect(response).toBeDefined()
    expect(JSON.parse(response)).toHaveProperty('monthlySummary')
  })
  
  it('should retry on failure', async () => {
    const client = new OpenAIClient(config)
    let attempts = 0
    
    const result = await client.retry(async () => {
      attempts++
      if (attempts < 2) throw new Error('Temporary failure')
      return 'success'
    }, 2)
    
    expect(result).toBe('success')
    expect(attempts).toBe(2)
  })
})
```

### Integration Tests

```typescript
describe('AI Insights Integration', () => {
  it('should generate insights with real LLM', async () => {
    const insights = await aiService.generateInsights(userId, {
      startDate: '2025-10-01',
      endDate: '2025-10-31'
    })
    
    expect(insights.monthly_summary).toBeDefined()
    expect(insights.category_insights.length).toBeGreaterThan(0)
    expect(insights.recommendations.length).toBeGreaterThan(0)
  })
  
  it('should use currency in insights', async () => {
    const insights = await aiService.generateInsights(userId, period)
    
    expect(insights.monthly_summary).toContain('£') // or '₹'
  })
})
```

---

## 9. Monitoring and Logging

### Request Logging

```typescript
function logLLMRequest(userId: string, tokens: number, cost: number, duration: number) {
  console.log({
    event: 'llm_request',
    userId,
    tokens,
    estimatedCost: cost,
    duration,
    timestamp: new Date().toISOString()
  })
}
```

### Cost Tracking

```typescript
class CostTracker {
  private costs: Map<string, number> = new Map()
  
  track(userId: string, cost: number) {
    const current = this.costs.get(userId) || 0
    this.costs.set(userId, current + cost)
  }
  
  getUserCost(userId: string): number {
    return this.costs.get(userId) || 0
  }
  
  getTotalCost(): number {
    return Array.from(this.costs.values()).reduce((sum, cost) => sum + cost, 0)
  }
}
```

---

## 10. Deployment Checklist

- [ ] OpenAI API key added to environment variables
- [ ] Rate limiting configured
- [ ] Caching implemented
- [ ] Error handling tested
- [ ] Fallback insights working
- [ ] Cost monitoring in place
- [ ] Usage limits set in OpenAI dashboard
- [ ] Billing alerts configured
- [ ] Integration tests passing
- [ ] Documentation updated

---

## 11. Cost Estimates

### OpenAI GPT-4 Turbo
- **Input**: $0.01 per 1K tokens
- **Output**: $0.03 per 1K tokens
- **Average Request**: ~1,500 input + 500 output tokens
- **Cost per Request**: ~$0.03
- **With 24h Cache**: ~$0.001 per request (97% reduction)

### Monthly Estimates
- **100 users, 2 requests/month each**: $6
- **500 users, 2 requests/month each**: $30
- **1000 users, 2 requests/month each**: $60

### Optimization Impact
- Without caching: $60/month for 1000 users
- With 24h caching: $2-5/month for 1000 users
- **Savings**: 92-97%

---

## 12. Best Practices

1. **Always use caching** - 24-hour cache reduces costs by 95%
2. **Implement rate limiting** - Prevent abuse and control costs
3. **Use fallbacks** - Never fail completely, always provide some insights
4. **Monitor costs** - Set up alerts for unusual usage
5. **Test thoroughly** - Use mock responses in tests to avoid costs
6. **Start with GPT-3.5** - Cheaper, upgrade to GPT-4 if needed
7. **Validate responses** - Always check JSON structure
8. **Log everything** - Track requests, costs, errors
9. **Set usage limits** - In OpenAI dashboard
10. **Handle errors gracefully** - User should never see raw errors

---

## Questions?

If you need clarification on any part of the AI integration, let me know!
