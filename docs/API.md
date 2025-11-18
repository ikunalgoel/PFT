# API Documentation

Complete API reference for the AI Finance Tracker backend.

## Base URL

- **Development**: `http://localhost:5000`
- **Production**: `https://your-backend.onrender.com`

## Authentication

All API endpoints (except `/health`) require authentication using Supabase JWT tokens.

### Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Getting a Token

Tokens are obtained through Supabase authentication:

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

const token = data.session.access_token;
```

## Rate Limiting

- **Standard endpoints**: 100 requests per 15 minutes
- **CSV upload**: 10 requests per 15 minutes
- **AI insights generation**: 5 requests per 15 minutes

## Error Responses

All errors follow this format:

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable error message",
  "details": {},
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Codes

- `VALIDATION_ERROR` (400) - Invalid input data
- `UNAUTHORIZED` (401) - Missing or invalid authentication
- `NOT_FOUND` (404) - Resource not found
- `DATABASE_ERROR` (500) - Database operation failed
- `AI_SERVICE_ERROR` (503) - AI service unavailable

---

## Health Check

### GET /health

Check API and database health status.

**Authentication**: Not required

**Response**: 200 OK

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": {
    "connected": true,
    "latency": 45,
    "message": "Database connection successful"
  }
}
```

---

## Transactions

### POST /api/transactions

Create a single transaction.

**Authentication**: Required

**Request Body**:

```json
{
  "date": "2024-01-15",
  "amount": 45.50,
  "category": "Groceries",
  "merchant": "Whole Foods",
  "notes": "Weekly shopping"
}
```

**Required Fields**: `date`, `amount`, `category`

**Response**: 201 Created

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-01-15",
  "amount": 45.50,
  "category": "Groceries",
  "merchant": "Whole Foods",
  "notes": "Weekly shopping",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### POST /api/transactions/bulk

Create multiple transactions (CSV upload).

**Authentication**: Required  
**Rate Limit**: 10 requests per 15 minutes

**Request Body**:

```json
{
  "transactions": [
    {
      "date": "2024-01-15",
      "amount": 45.50,
      "category": "Groceries",
      "merchant": "Whole Foods",
      "notes": "Weekly shopping"
    },
    {
      "date": "2024-01-16",
      "amount": 12.00,
      "category": "Transportation",
      "merchant": "Uber"
    }
  ]
}
```

**Response**: 201 Created

```json
{
  "message": "Successfully created 2 transactions",
  "count": 2,
  "transactions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "date": "2024-01-15",
      "amount": 45.50,
      "category": "Groceries",
      "merchant": "Whole Foods",
      "notes": "Weekly shopping",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### GET /api/transactions

Get all transactions with optional filters.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `startDate` | string | Filter by start date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | string | Filter by end date (YYYY-MM-DD) | `2024-01-31` |
| `category` | string | Filter by category | `Groceries` |
| `minAmount` | number | Minimum transaction amount | `10.00` |
| `maxAmount` | number | Maximum transaction amount | `100.00` |
| `merchant` | string | Filter by merchant name | `Whole Foods` |

**Example Request**:

```
GET /api/transactions?startDate=2024-01-01&endDate=2024-01-31&category=Groceries
```

**Response**: 200 OK

```json
{
  "count": 15,
  "transactions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "date": "2024-01-15",
      "amount": 45.50,
      "category": "Groceries",
      "merchant": "Whole Foods",
      "notes": "Weekly shopping",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### GET /api/transactions/:id

Get a single transaction by ID.

**Authentication**: Required

**Response**: 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-01-15",
  "amount": 45.50,
  "category": "Groceries",
  "merchant": "Whole Foods",
  "notes": "Weekly shopping",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### PUT /api/transactions/:id

Update a transaction.

**Authentication**: Required

**Request Body** (all fields optional):

```json
{
  "date": "2024-01-16",
  "amount": 50.00,
  "category": "Groceries",
  "merchant": "Trader Joe's",
  "notes": "Updated shopping trip"
}
```

**Response**: 200 OK

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "date": "2024-01-16",
  "amount": 50.00,
  "category": "Groceries",
  "merchant": "Trader Joe's",
  "notes": "Updated shopping trip",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-16T11:00:00.000Z"
}
```

### DELETE /api/transactions/:id

Delete a transaction.

**Authentication**: Required

**Response**: 204 No Content

---

## Budgets

### POST /api/budgets

Create a new budget.

**Authentication**: Required

**Request Body**:

```json
{
  "name": "Monthly Groceries",
  "amount": 500.00,
  "period_type": "monthly",
  "category": "Groceries"
}
```

**Required Fields**: `name`, `amount`, `period_type`

**Period Types**: `monthly` or `custom`

For custom periods, include:

```json
{
  "name": "Q1 Entertainment",
  "amount": 1000.00,
  "period_type": "custom",
  "period_start": "2024-01-01",
  "period_end": "2024-03-31",
  "category": "Entertainment"
}
```

**Response**: 201 Created

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Monthly Groceries",
  "amount": 500.00,
  "period_type": "monthly",
  "period_start": null,
  "period_end": null,
  "category": "Groceries",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/budgets

Get all budgets for the authenticated user.

**Authentication**: Required

**Response**: 200 OK

```json
{
  "count": 3,
  "budgets": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Monthly Groceries",
      "amount": 500.00,
      "period_type": "monthly",
      "period_start": null,
      "period_end": null,
      "category": "Groceries",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### GET /api/budgets/:id

Get a single budget by ID.

**Authentication**: Required

**Response**: 200 OK

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Monthly Groceries",
  "amount": 500.00,
  "period_type": "monthly",
  "period_start": null,
  "period_end": null,
  "category": "Groceries",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z"
}
```

### GET /api/budgets/:id/progress

Get budget progress with current spending and alerts.

**Authentication**: Required

**Response**: 200 OK

```json
{
  "budget_id": "660e8400-e29b-41d4-a716-446655440001",
  "budget": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "Monthly Groceries",
    "amount": 500.00,
    "period_type": "monthly",
    "category": "Groceries"
  },
  "current_spending": 425.50,
  "percentage": 85.1,
  "remaining": 74.50,
  "alerts": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "budget_id": "660e8400-e29b-41d4-a716-446655440001",
      "alert_type": "warning",
      "threshold_percentage": 80,
      "triggered_at": "2024-01-20T15:30:00.000Z",
      "resolved_at": null,
      "is_active": true
    }
  ]
}
```

### PUT /api/budgets/:id

Update a budget.

**Authentication**: Required

**Request Body** (all fields optional):

```json
{
  "name": "Updated Groceries Budget",
  "amount": 600.00,
  "category": "Food & Groceries"
}
```

**Response**: 200 OK

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Updated Groceries Budget",
  "amount": 600.00,
  "period_type": "monthly",
  "period_start": null,
  "period_end": null,
  "category": "Food & Groceries",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-20T16:00:00.000Z"
}
```

### DELETE /api/budgets/:id

Delete a budget.

**Authentication**: Required

**Response**: 204 No Content

---

## Analytics

### GET /api/analytics/summary

Get spending summary with total and category breakdown.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `startDate` | string | Start date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | string | End date (YYYY-MM-DD) | `2024-01-31` |
| `category` | string | Filter by category | `Groceries` |

**Example Request**:

```
GET /api/analytics/summary?startDate=2024-01-01&endDate=2024-01-31
```

**Response**: 200 OK

```json
{
  "total_spending": 2450.75,
  "transaction_count": 87,
  "average_transaction": 28.17,
  "categories": [
    {
      "category": "Groceries",
      "total": 850.50,
      "count": 25,
      "percentage": 34.7
    },
    {
      "category": "Transportation",
      "total": 420.00,
      "count": 18,
      "percentage": 17.1
    }
  ],
  "top_merchants": [
    {
      "merchant": "Whole Foods",
      "total": 425.50,
      "count": 12
    }
  ]
}
```

### GET /api/analytics/trends

Get spending trends over time.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `startDate` | string | Start date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | string | End date (YYYY-MM-DD) | `2024-01-31` |
| `category` | string | Filter by category | `Groceries` |
| `groupBy` | string | Group by: `day`, `week`, or `month` | `week` |

**Example Request**:

```
GET /api/analytics/trends?startDate=2024-01-01&endDate=2024-01-31&groupBy=week
```

**Response**: 200 OK

```json
{
  "count": 4,
  "trends": [
    {
      "period": "2024-01-01",
      "total": 625.50,
      "count": 22,
      "average": 28.43
    },
    {
      "period": "2024-01-08",
      "total": 580.25,
      "count": 19,
      "average": 30.54
    }
  ]
}
```

### GET /api/analytics/categories

Get category breakdown for pie chart data.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `startDate` | string | Start date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | string | End date (YYYY-MM-DD) | `2024-01-31` |

**Example Request**:

```
GET /api/analytics/categories?startDate=2024-01-01&endDate=2024-01-31
```

**Response**: 200 OK

```json
{
  "count": 8,
  "categories": [
    {
      "category": "Groceries",
      "total": 850.50,
      "count": 25,
      "percentage": 34.7,
      "color": "#4CAF50"
    },
    {
      "category": "Transportation",
      "total": 420.00,
      "count": 18,
      "percentage": 17.1,
      "color": "#2196F3"
    }
  ]
}
```

### GET /api/analytics/budget-comparison

Get budget vs actual spending comparison.

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `startDate` | string | Start date (YYYY-MM-DD) | `2024-01-01` |
| `endDate` | string | End date (YYYY-MM-DD) | `2024-01-31` |

**Example Request**:

```
GET /api/analytics/budget-comparison?startDate=2024-01-01&endDate=2024-01-31
```

**Response**: 200 OK

```json
{
  "count": 3,
  "budgets": [
    {
      "budget_id": "660e8400-e29b-41d4-a716-446655440001",
      "budget_name": "Monthly Groceries",
      "budget_amount": 500.00,
      "actual_spending": 425.50,
      "difference": 74.50,
      "percentage": 85.1,
      "status": "warning"
    }
  ]
}
```

---

## AI Insights

### POST /api/insights/generate

Generate AI insights for a specified period.

**Authentication**: Required  
**Rate Limit**: 5 requests per 15 minutes

**Request Body**:

```json
{
  "startDate": "2024-01-01",
  "endDate": "2024-01-31"
}
```

**Required Fields**: `startDate`, `endDate` (YYYY-MM-DD format)

**Response**: 201 Created

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "monthly_summary": "In January, you spent a total of $2,450.75 across 87 transactions. Your spending was primarily focused on Groceries (34.7%) and Transportation (17.1%).",
  "category_insights": [
    {
      "category": "Groceries",
      "total_spent": 850.50,
      "percentage_of_total": 34.7,
      "insight": "Your grocery spending is consistent with healthy eating habits. Consider meal planning to reduce costs."
    }
  ],
  "spending_spikes": [
    {
      "date": "2024-01-15",
      "amount": 250.00,
      "category": "Shopping",
      "description": "Unusual spike in shopping expenses. This was 3x your average daily spending."
    }
  ],
  "recommendations": [
    "Consider setting a stricter budget for dining out to save $150/month",
    "Your transportation costs are high. Explore carpooling or public transit options",
    "Great job staying under budget for groceries!"
  ],
  "projections": {
    "next_week": 175.50,
    "next_month": 2300.00,
    "confidence": "high",
    "explanation": "Based on your consistent spending patterns over the past 3 months"
  },
  "generated_at": "2024-02-01T10:30:00.000Z"
}
```

### GET /api/insights/latest

Get the most recent AI insights for the authenticated user.

**Authentication**: Required

**Response**: 200 OK

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "period_start": "2024-01-01",
  "period_end": "2024-01-31",
  "monthly_summary": "In January, you spent a total of $2,450.75...",
  "category_insights": [],
  "spending_spikes": [],
  "recommendations": [],
  "projections": {},
  "generated_at": "2024-02-01T10:30:00.000Z"
}
```

**Error Response**: 404 Not Found

```json
{
  "code": "NOT_FOUND",
  "message": "No insights found. Generate insights first.",
  "timestamp": "2024-02-01T10:30:00.000Z"
}
```

### POST /api/insights/export

Export insights as PDF or text format.

**Authentication**: Required

**Request Body**:

```json
{
  "insightId": "880e8400-e29b-41d4-a716-446655440003",
  "format": "text"
}
```

**Required Fields**: `insightId`, `format` (`pdf` or `text`)

**Note**: PDF export is not yet implemented. Use `text` format.

**Response**: 200 OK (text/plain)

```
============================================================
FINANCIAL INSIGHTS REPORT
============================================================

Period: 2024-01-01 to 2024-01-31
Generated: 2/1/2024, 10:30:00 AM

============================================================
MONTHLY SUMMARY
============================================================

In January, you spent a total of $2,450.75 across 87 transactions...

============================================================
CATEGORY INSIGHTS
============================================================

Groceries:
  Total Spent: 850.50
  Percentage: 34.7%
  Insight: Your grocery spending is consistent...

...
```

---

## Testing the API

### Using cURL

```bash
# Health check
curl https://your-backend.onrender.com/health

# Get transactions (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-backend.onrender.com/api/transactions

# Create transaction
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"date":"2024-01-15","amount":45.50,"category":"Groceries"}' \
     https://your-backend.onrender.com/api/transactions
```

### Using JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://your-backend.onrender.com',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get transactions
const { data } = await api.get('/api/transactions', {
  params: {
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  }
});

// Create transaction
const transaction = await api.post('/api/transactions', {
  date: '2024-01-15',
  amount: 45.50,
  category: 'Groceries',
  merchant: 'Whole Foods'
});
```

---

## Pagination

Currently, pagination is not implemented. All endpoints return complete result sets. For large datasets, consider implementing client-side pagination or requesting specific date ranges.

## Caching

- Analytics data is cached for 5 minutes
- AI insights are cached for 24 hours
- Use appropriate cache headers for optimal performance

## Versioning

The API is currently at version 1.0. Future versions will be indicated in the URL path (e.g., `/api/v2/transactions`).

## Support

For API issues or questions:
- Check the [GitHub Issues](https://github.com/ikunalgoel/PFT/issues)
- Review the [main README](../README.md)
- Contact support through GitHub

---

**Last Updated**: January 2024
