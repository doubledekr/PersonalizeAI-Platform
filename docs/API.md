# PersonalizeAI API Documentation

## Overview

The PersonalizeAI API provides endpoints for managing subscribers, generating personalized content, and analyzing engagement metrics for financial newsletter publishers.

**Base URL:** `https://your-backend-url.azurewebsites.net`

## Authentication

Currently, the API uses basic authentication. In production, implement JWT tokens or API keys.

```bash
# Example request with authentication
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://your-backend-url.azurewebsites.net/api/dashboard
```

## Endpoints

### Health Check

#### GET /health

Check the health status of the API.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-08-16T10:30:00Z",
  "version": "1.0.0"
}
```

### Dashboard

#### GET /api/dashboard

Get comprehensive dashboard data including metrics, analytics, and insights.

**Response:**
```json
{
  "status": "success",
  "data": {
    "total_subscribers": 14156,
    "active_subscribers": 12834,
    "engagement_rate": 34.2,
    "click_through_rate": 12.7,
    "revenue_impact": 285000,
    "churn_rate": 8.5,
    "personalization_score": 87.3,
    "recent_activity": [
      {
        "action": "Subject line generated",
        "subscriber": "John D.",
        "time": "2 minutes ago"
      }
    ],
    "top_performing_content": [
      {
        "title": "Market Outlook: Tech Stocks Surge",
        "opens": 2847,
        "clicks": 456,
        "ctr": "16.0%"
      }
    ]
  }
}
```

### Subscribers

#### GET /api/subscribers

Get a list of all subscribers with filtering and pagination.

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `per_page` (int): Items per page (default: 20, max: 100)
- `status` (string): Filter by subscription status (active, paused, cancelled)
- `tier` (string): Filter by subscription tier (basic, premium, enterprise)
- `search` (string): Search by email or name

**Response:**
```json
{
  "status": "success",
  "data": {
    "subscribers": [
      {
        "id": 1,
        "email": "john.smith@example.com",
        "first_name": "John",
        "last_name": "Smith",
        "subscription_status": "active",
        "subscription_tier": "premium",
        "engagement_score": 78,
        "total_emails_sent": 245,
        "total_emails_opened": 189,
        "total_clicks": 67,
        "risk_tolerance": "moderate",
        "churn_risk_score": 0.23,
        "lifetime_value": 15750,
        "created_at": "2024-01-15T09:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 14156,
      "pages": 708
    }
  }
}
```

#### POST /api/subscribers

Create a new subscriber.

**Request Body:**
```json
{
  "email": "new.subscriber@example.com",
  "first_name": "New",
  "last_name": "Subscriber",
  "subscription_tier": "basic",
  "risk_tolerance": "conservative"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 14157,
    "email": "new.subscriber@example.com",
    "first_name": "New",
    "last_name": "Subscriber",
    "subscription_status": "active",
    "subscription_tier": "basic",
    "engagement_score": 0,
    "created_at": "2024-08-16T10:30:00Z"
  }
}
```

#### GET /api/subscribers/{id}

Get details for a specific subscriber.

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "email": "john.smith@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "subscription_status": "active",
    "subscription_tier": "premium",
    "engagement_score": 78,
    "total_emails_sent": 245,
    "total_emails_opened": 189,
    "total_clicks": 67,
    "risk_tolerance": "moderate",
    "churn_risk_score": 0.23,
    "lifetime_value": 15750,
    "created_at": "2024-01-15T09:30:00Z",
    "recent_emails": [
      {
        "subject": "Weekly Market Update",
        "sent_at": "2024-08-15T08:00:00Z",
        "opened": true,
        "clicked": true
      }
    ]
  }
}
```

#### PUT /api/subscribers/{id}

Update a subscriber's information.

**Request Body:**
```json
{
  "first_name": "Updated",
  "last_name": "Name",
  "subscription_tier": "enterprise",
  "risk_tolerance": "aggressive"
}
```

#### DELETE /api/subscribers/{id}

Delete a subscriber.

**Response:**
```json
{
  "status": "success",
  "message": "Subscriber deleted successfully"
}
```

### Personalization

#### POST /api/personalize/subject-line

Generate a personalized subject line for a subscriber.

**Request Body:**
```json
{
  "subscriber_id": 1,
  "content_type": "market_update",
  "base_subject": "Weekly Market Analysis",
  "market_context": {
    "trending_stocks": ["AAPL", "MSFT", "GOOGL"],
    "market_sentiment": "bullish"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "personalized_subject": "John, Your Tech Portfolio Update: AAPL & MSFT Surge Continues",
    "personalization_score": 0.89,
    "reasoning": "Personalized with subscriber's name and portfolio interests",
    "a_b_test_variant": "A"
  }
}
```

#### POST /api/personalize/content

Generate personalized email content for a subscriber.

**Request Body:**
```json
{
  "subscriber_id": 1,
  "content_template": "market_analysis",
  "data": {
    "stocks": ["AAPL", "MSFT"],
    "market_data": {
      "sp500_change": "+1.2%",
      "nasdaq_change": "+1.8%"
    }
  }
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "personalized_content": "Hi John, based on your moderate risk profile...",
    "personalization_elements": [
      "risk_profile_matching",
      "portfolio_relevance",
      "engagement_optimization"
    ],
    "estimated_engagement_lift": 0.23
  }
}
```

### Analytics

#### GET /api/analytics/engagement

Get engagement analytics with filtering options.

**Query Parameters:**
- `start_date` (string): Start date (YYYY-MM-DD)
- `end_date` (string): End date (YYYY-MM-DD)
- `subscriber_tier` (string): Filter by tier
- `content_type` (string): Filter by content type

**Response:**
```json
{
  "status": "success",
  "data": {
    "period": {
      "start_date": "2024-07-01",
      "end_date": "2024-08-01"
    },
    "metrics": {
      "total_emails_sent": 425600,
      "total_opens": 145512,
      "total_clicks": 54089,
      "open_rate": 34.2,
      "click_rate": 12.7,
      "unsubscribe_rate": 0.8
    },
    "trends": {
      "open_rate_change": "+8.3%",
      "click_rate_change": "+15.2%",
      "engagement_score_change": "+12.1%"
    }
  }
}
```

#### GET /api/analytics/revenue-impact

Get revenue impact analysis from personalization.

**Response:**
```json
{
  "status": "success",
  "data": {
    "current_period": {
      "revenue_lift": 285000,
      "percentage_increase": 23.4,
      "attribution": {
        "subject_line_personalization": 0.45,
        "content_personalization": 0.35,
        "send_time_optimization": 0.20
      }
    },
    "projections": {
      "annual_revenue_lift": 3420000,
      "roi_on_personalization": 8.7
    }
  }
}
```

### A/B Testing

#### POST /api/ab-test

Create a new A/B test.

**Request Body:**
```json
{
  "name": "Subject Line Personalization Test",
  "type": "subject_line",
  "variants": [
    {
      "name": "Control",
      "content": "Weekly Market Update"
    },
    {
      "name": "Personalized",
      "content": "{{first_name}}, Your Portfolio Update: {{top_stock}} Analysis"
    }
  ],
  "traffic_split": [50, 50],
  "duration_days": 7
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "test_id": "ab_test_123",
    "status": "active",
    "start_date": "2024-08-16T10:30:00Z",
    "end_date": "2024-08-23T10:30:00Z"
  }
}
```

#### GET /api/ab-test/{test_id}/results

Get A/B test results.

**Response:**
```json
{
  "status": "success",
  "data": {
    "test_id": "ab_test_123",
    "status": "completed",
    "results": {
      "control": {
        "emails_sent": 5000,
        "opens": 1650,
        "clicks": 495,
        "open_rate": 33.0,
        "click_rate": 9.9
      },
      "personalized": {
        "emails_sent": 5000,
        "opens": 1950,
        "clicks": 663,
        "open_rate": 39.0,
        "click_rate": 13.3
      }
    },
    "statistical_significance": 0.95,
    "winner": "personalized",
    "improvement": {
      "open_rate": "+18.2%",
      "click_rate": "+34.3%"
    }
  }
}
```

## Error Handling

The API uses standard HTTP status codes and returns error details in JSON format.

**Error Response Format:**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email address format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

**Common Error Codes:**
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

## Rate Limiting

API requests are rate limited to prevent abuse:
- **Free tier:** 100 requests per hour
- **Basic tier:** 1,000 requests per hour
- **Premium tier:** 10,000 requests per hour
- **Enterprise tier:** Unlimited

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1692181800
```

## SDKs and Libraries

### Python SDK

```python
from personalizeai import PersonalizeAIClient

client = PersonalizeAIClient(api_key="your_api_key")

# Get dashboard data
dashboard = client.dashboard.get()

# Create subscriber
subscriber = client.subscribers.create({
    "email": "new@example.com",
    "first_name": "New",
    "last_name": "User"
})

# Generate personalized subject line
subject = client.personalize.subject_line({
    "subscriber_id": subscriber.id,
    "base_subject": "Market Update"
})
```

### JavaScript SDK

```javascript
import PersonalizeAI from 'personalizeai-js';

const client = new PersonalizeAI({ apiKey: 'your_api_key' });

// Get dashboard data
const dashboard = await client.dashboard.get();

// Create subscriber
const subscriber = await client.subscribers.create({
  email: 'new@example.com',
  firstName: 'New',
  lastName: 'User'
});

// Generate personalized content
const content = await client.personalize.content({
  subscriberId: subscriber.id,
  template: 'market_analysis'
});
```

## Webhooks

PersonalizeAI can send webhooks for important events:

### Webhook Events

- `subscriber.created` - New subscriber added
- `subscriber.updated` - Subscriber information changed
- `subscriber.unsubscribed` - Subscriber unsubscribed
- `email.sent` - Email sent to subscriber
- `email.opened` - Email opened by subscriber
- `email.clicked` - Link clicked in email
- `ab_test.completed` - A/B test finished

### Webhook Payload Example

```json
{
  "event": "email.opened",
  "timestamp": "2024-08-16T10:30:00Z",
  "data": {
    "subscriber_id": 1,
    "email_id": "email_123",
    "subject": "Weekly Market Update",
    "opened_at": "2024-08-16T10:30:00Z"
  }
}
```

## Support

For API support, contact:
- **Email:** api-support@personalizeai.com
- **Documentation:** https://docs.personalizeai.com
- **Status Page:** https://status.personalizeai.com

