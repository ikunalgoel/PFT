# AI Integration Guide

This document describes the real AI/LLM integration implemented in the Finance Tracker backend.

## Overview

The Finance Tracker now uses real Large Language Models (LLMs) to generate personalized financial insights. The system supports both OpenAI and Anthropic as LLM providers.

## Architecture

### Components

1. **LLM Configuration** (`src/config/llm.config.ts`)
   - Manages LLM provider settings
   - Handles environment variable configuration
   - Provides system messages with currency context

2. **LLM Client Abstraction** (`src/clients/`)
   - `llm.client.ts`: Base interface and abstract class
   - `openai.client.ts`: OpenAI implementation
   - `anthropic.client.ts`: Anthropic implementation
   - `llm.factory.ts`: Factory for creating LLM clients

3. **AI Insights Service** (`src/services/ai-insights.service.ts`)
   - Orchestrates insight generation
   - Integrates with analytics and settings services
   - Implements caching and error handling

4. **Generate Insights Script** (`src/scripts/generate-insights.ts`)
   - Command-line tool for testing AI insights
   - Supports various options for customization

## Setup

### Environment Variables

Add the following to your `.env` file:

```env
# LLM Provider Configuration
AI_PROVIDER=openai                    # or 'anthropic'
OPENAI_API_KEY=sk-...                 # Your OpenAI API key
OPENAI_MODEL=gpt-4-turbo-preview      # Optional, defaults to gpt-4-turbo-preview
ANTHROPIC_API_KEY=sk-ant-...          # Your Anthropic API key (if using Anthropic)
ANTHROPIC_MODEL=claude-3-sonnet-20240229  # Optional

# AI Model Settings
AI_MAX_TOKENS=2000                    # Maximum tokens in response
AI_TEMPERATURE=0.7                    # Temperature (0-2)
AI_TIMEOUT=30000                      # Timeout in milliseconds
```

### Installation

The required dependencies are already installed:
- `openai`: OpenAI SDK
- `@anthropic-ai/sdk`: Anthropic SDK

## Usage

### API Endpoints

#### Generate Insights

```http
POST /api/insights/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

Response:
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "monthly_summary": "You spent £1,234.56 across 45 transactions...",
  "category_insights": [
    {
      "category": "Groceries",
      "total_spent": 450.00,
      "percentage_of_total": 36.5,
      "insight": "Your grocery spending is well-controlled..."
    }
  ],
  "spending_spikes": [...],
  "recommendations": [...],
  "projections": {...},
  "generated_at": "2024-01-31T12:00:00Z"
}
```

#### Get Latest Insights

```http
GET /api/insights/latest
Authorization: Bearer <token>
```

### Command-Line Script

Generate insights from the command line:

```bash
# Generate insights for default test user
npm run generate-insights

# Generate for specific user by email
npm run generate-insights -- --email user@example.com

# Generate for specific user by ID
npm run generate-insights -- --user-id abc123

# Analyze last 60 days
npm run generate-insights -- --days 60

# Verbose output
npm run generate-insights -- --verbose

# Show help
npm run generate-insights -- --help
```

## Features

### Currency Support

The AI integration is fully currency-aware:
- Prompts include user's currency preference (GBP or INR)
- All monetary amounts are formatted with appropriate symbols
- AI responses use the correct currency in insights

### Error Handling

The system implements robust error handling:
- **Retry Logic**: Automatic retry with exponential backoff (up to 2 retries)
- **Graceful Degradation**: Falls back to cached insights on LLM failures
- **Fallback Insights**: Provides basic insights if LLM is unavailable
- **Error Types**:
  - `TIMEOUT`: Request timeout
  - `RATE_LIMIT`: API rate limit exceeded
  - `INVALID_RESPONSE`: Malformed response from LLM
  - `API_ERROR`: General API error
  - `AUTHENTICATION_ERROR`: Invalid API key

### Caching

Insights are cached for 24 hours to optimize costs:
- In-memory cache for quick access
- Database storage for persistence
- Automatic cache invalidation after TTL

### Cost Optimization

Several features help minimize LLM API costs:
- 24-hour caching prevents duplicate requests
- Existing insights are reused when available
- Retry logic prevents unnecessary API calls
- Token limits prevent excessive usage

## Prompt Engineering

The system uses carefully crafted prompts that include:
- User's currency and currency symbol
- Period being analyzed
- Total spending and transaction count
- Category breakdown with percentages
- Budget status and progress
- Recent spending trends
- Clear instructions for JSON response format

Example prompt structure:
```
You are a financial advisor analyzing a user's spending patterns.

User Currency: GBP
Currency Symbol: £

Period: 2024-01-01 to 2024-01-31
Total Spending: £1,234.56
Number of Transactions: 45

Category Breakdown:
- Groceries: £450.00 (36.5%)
- Dining: £300.00 (24.3%)
...

IMPORTANT: Use the £ symbol for all monetary amounts in your response.

Format your response as JSON with the following structure:
{...}
```

## Response Validation

All LLM responses are validated:
1. JSON extraction from response text
2. Schema validation for required fields
3. Type checking for all properties
4. Fallback to cached insights on validation failure

## Testing

### Unit Tests

Test the LLM clients and services:
```bash
npm test
```

### Integration Testing

Test with real LLM API:
```bash
# Set up test environment variables
export AI_PROVIDER=openai
export OPENAI_API_KEY=sk-...

# Run the generate-insights script
npm run generate-insights -- --verbose
```

### Testing with Mock Data

For development without API costs:
1. Use the fallback insights mechanism
2. Test with cached insights
3. Mock the LLM client in tests

## Monitoring

### Logging

The system logs:
- Request details (prompt length, currency, timestamp)
- Response details (length, duration)
- Errors with full context
- Retry attempts

Enable verbose logging:
```bash
NODE_ENV=development npm run generate-insights -- --verbose
```

### Cost Tracking

Monitor LLM API usage:
- Check your OpenAI/Anthropic dashboard
- Track request counts in application logs
- Monitor cache hit rates

## Troubleshooting

### Common Issues

1. **"Missing API key" error**
   - Ensure `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` is set
   - Check `.env` file is loaded correctly

2. **"Invalid JSON response" error**
   - LLM may have returned malformed JSON
   - System will retry automatically
   - Check verbose logs for response content

3. **Rate limit errors**
   - Reduce request frequency
   - Implement user-level rate limiting
   - Consider upgrading API plan

4. **Timeout errors**
   - Increase `AI_TIMEOUT` value
   - Check network connectivity
   - Verify LLM service status

5. **High costs**
   - Verify caching is working
   - Check for duplicate requests
   - Consider using cheaper models
   - Implement stricter rate limiting

### Debug Mode

Run with verbose logging:
```bash
npm run generate-insights -- --verbose
```

This shows:
- Service initialization
- LLM provider details
- Request/response timing
- Full error stack traces

## Best Practices

1. **API Keys**: Never commit API keys to version control
2. **Caching**: Always check cache before making LLM requests
3. **Error Handling**: Always provide fallback insights
4. **Rate Limiting**: Implement per-user rate limits
5. **Monitoring**: Track API usage and costs regularly
6. **Testing**: Test with small datasets first
7. **Validation**: Always validate LLM responses

## Future Enhancements

Potential improvements:
- Support for additional LLM providers (Google, Cohere, etc.)
- Streaming responses for real-time insights
- Fine-tuned models for financial analysis
- Multi-language support
- Advanced analytics and trend detection
- Personalized recommendations based on user history

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review application logs
3. Verify environment configuration
4. Test with the generate-insights script
5. Check LLM provider status pages
