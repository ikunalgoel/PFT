# New Features Specification

## Overview
This document outlines the new features added to the AI Finance Tracker specification:
1. **Real AI Agent Implementation** - Replace mocked AI with actual LLM integration
2. **Multi-Currency Support** - Support for GBP and INR with user-selectable preferences

---

## Feature 1: Multi-Currency Support

### Requirements Added
- **Requirement 14**: User currency selection (GBP, INR)
- **Requirement 15**: User settings management

### Design Updates
- **Database Schema**: New `user_settings` table with currency field
- **Currency Configuration**: Support for GBP (£) and INR (₹)
- **Currency Formatter**: Utility class using Intl.NumberFormat
- **Settings API**: Endpoints for managing user preferences
- **Currency Context**: React context for currency state management

### Implementation Tasks (Task 21)
- **21.1**: Database schema and settings service
- **21.2**: Currency utilities and configuration
- **21.3**: Settings API endpoints
- **21.4**: Settings UI components
- **21.5**: Currency Context in frontend
- **21.6**: Update all components for currency formatting
- **21.7**: Currency selection during signup

### Key Features
✅ User can select currency (GBP or INR) during signup
✅ User can change currency in settings page
✅ All monetary amounts display with correct currency symbol
✅ Currency preference stored per user
✅ No conversion of existing transaction amounts (display only)

---

## Feature 2: Real AI Agent Implementation

### Requirements Added
- **Requirement 16**: Real LLM integration for AI insights
- **Requirement 17**: Currency-aware AI insights

### Design Updates
- **LLM Integration Architecture**: Support for OpenAI and Anthropic
- **LLM Client**: Abstract interface with provider implementations
- **Enhanced AI Service**: Real API calls instead of mocked responses
- **Prompt Engineering**: Currency-aware prompts
- **Error Handling**: Retry logic, fallbacks, graceful degradation
- **Cost Optimization**: Caching, rate limiting, token counting

### Implementation Tasks (Task 22)
- **22.1**: LLM provider configuration
- **22.2**: LLM client abstraction (OpenAI/Anthropic)
- **22.3**: Update AIInsightsService for real LLM
- **22.4**: Currency-aware prompt engineering
- **22.5**: Response validation and parsing
- **22.6**: Cost optimization features
- **22.7**: Update generate-insights script

### Key Features
✅ Integration with OpenAI GPT-4 or Anthropic Claude
✅ Real-time AI analysis of spending patterns
✅ Currency-aware insights and recommendations
✅ Retry logic with exponential backoff
✅ Fallback to cached insights on failure
✅ 24-hour caching to reduce API costs
✅ Rate limiting per user
✅ Token counting and cost monitoring

---

## Feature 3: Data Transformation Fix

### Issue
Backend returns snake_case (e.g., `next_week`) but frontend expects camelCase (e.g., `nextWeek`)

### Implementation Tasks (Task 23)
- **23.1**: Create transformation utilities
- **23.2**: Add transformation middleware to API
- **23.3**: Fix Projections component

### Key Features
✅ Consistent camelCase format in frontend
✅ Automatic transformation of API responses
✅ Type-safe transformations
✅ Fixes dashboard projection errors

---

## Environment Variables Required

### Backend (.env)
```env
# AI Provider Configuration
AI_PROVIDER=openai  # or 'anthropic'
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# AI Model Settings
AI_MODEL=gpt-4-turbo-preview
AI_MAX_TOKENS=2000
AI_TEMPERATURE=0.7
AI_TIMEOUT=30000
```

### Frontend (.env)
```env
# No new variables required
```

---

## Database Schema Changes

### New Table: user_settings
```sql
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  currency VARCHAR(3) NOT NULL DEFAULT 'GBP' CHECK (currency IN ('GBP', 'INR')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_settings_user ON user_settings(user_id);
```

---

## New API Endpoints

### Settings Endpoints
```
GET    /api/settings              - Get user settings
PUT    /api/settings              - Update user settings
POST   /api/settings/currency     - Update currency preference
```

---

## Dependencies to Add

### Backend
```json
{
  "openai": "^4.20.0",
  "@anthropic-ai/sdk": "^0.9.0"
}
```

### Frontend
```json
{
  // No new dependencies required
}
```

---

## Testing Checklist

### Currency Support
- [ ] User can select currency during signup
- [ ] User can change currency in settings
- [ ] All amounts display with correct symbol (£ or ₹)
- [ ] Currency persists across sessions
- [ ] AI insights use correct currency

### AI Integration
- [ ] AI insights generate successfully with OpenAI
- [ ] Insights include currency-appropriate amounts
- [ ] Error handling works (fallback to cache)
- [ ] Retry logic functions correctly
- [ ] Cost optimization features work

### Data Transformation
- [ ] All API responses use camelCase
- [ ] Projections component displays without errors
- [ ] Nested objects transform correctly

---

## Migration Path

### For Existing Users
1. Run database migration to create `user_settings` table
2. Create default settings (GBP) for existing users
3. Users can change currency in settings page

### For New Users
1. Currency selection during signup
2. Settings created automatically

---

## Cost Considerations

### AI API Costs
- **OpenAI GPT-4**: ~$0.03 per insight generation
- **Caching**: Reduces costs by 95% (24-hour cache)
- **Rate Limiting**: Prevents abuse
- **Estimated Monthly Cost**: $5-20 for 100 active users

### Recommendations
- Start with GPT-3.5-turbo for lower costs
- Upgrade to GPT-4 for better insights
- Monitor usage and adjust rate limits
- Consider user-based pricing if costs increase

---

## Next Steps

1. **Review this specification** - Ensure all requirements are clear
2. **Review updated requirements.md** - Check user stories and acceptance criteria
3. **Review updated design.md** - Verify architecture and design decisions
4. **Review updated tasks.md** - Confirm implementation tasks are actionable
5. **Begin implementation** - Start with Task 21 (Currency) or Task 22 (AI)

---

## Questions to Consider

1. **Currency**: Do you want to support more currencies in the future?
2. **AI Provider**: Prefer OpenAI or Anthropic? (OpenAI recommended)
3. **AI Model**: Start with GPT-3.5-turbo (cheaper) or GPT-4 (better)?
4. **Cost Limits**: Set per-user rate limits for AI generation?
5. **Migration**: Need script to set default currency for existing users?

---

## Status

📋 **Specification**: ✅ Complete
📝 **Requirements**: ✅ Updated (Requirements 14-17)
🎨 **Design**: ✅ Updated (Architecture, schemas, APIs)
✅ **Tasks**: ✅ Updated (Tasks 21-24 added)
🚀 **Ready for Implementation**: ✅ Yes

You can now begin implementing these features by opening `tasks.md` and starting with Task 21 or Task 22!
