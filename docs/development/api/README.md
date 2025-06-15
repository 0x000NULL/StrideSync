# StrideSync API Documentation

Welcome to the StrideSync API documentation. This guide provides comprehensive information about the StrideSync REST API, including available endpoints, request/response formats, and authentication methods.

## Base URL

All API endpoints are relative to the base URL:

```
https://api.stridesync.app/v1  # Production
http://localhost:3001/v1        # Local development
```

## Authentication

Most endpoints require authentication using JWT (JSON Web Tokens).

### Obtaining a Token

1. **Login**
   ```http
   POST /auth/login
   Content-Type: application/json
   
   {
     "email": "user@example.com",
     "password": "yourpassword"
   }
   ```

   Successful response:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": "123",
       "email": "user@example.com",
       "name": "John Doe"
     }
   }
   ```

2. **Include the token** in subsequent requests:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## Rate Limiting

- **Rate Limit**: 100 requests per minute per IP address
- **Response Headers**:
  - `X-RateLimit-Limit`: Maximum number of requests allowed
  - `X-RateLimit-Remaining`: Remaining number of requests
  - `X-RateLimit-Reset`: Time when the rate limit resets (UTC timestamp)

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "Additional error details"
    }
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 400 | Bad Request | Invalid request parameters |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Invalidate token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### Users

- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `DELETE /users/me` - Delete current user account
- `GET /users/me/runs` - Get user's runs
- `GET /users/me/stats` - Get user statistics

### Runs

- `GET /runs` - List runs (with filters)
- `POST /runs` - Create a new run
- `GET /runs/:id` - Get run details
- `PUT /runs/:id` - Update a run
- `DELETE /runs/:id` - Delete a run
- `GET /runs/:id/stream` - Get run stream data
- `GET /runs/:id/analysis` - Get run analysis

### Activities

- `GET /activities` - List activities
- `POST /activities` - Create activity
- `GET /activities/:id` - Get activity details
- `PUT /activities/:id` - Update activity
- `DELETE /activities/:id` - Delete activity

### WebSocket API

For real-time updates, connect to:

```
wss://api.stridesync.app/v1/realtime
```

**Events:**
- `run:created` - New run created
- `run:updated` - Run updated
- `run:deleted` - Run deleted

## Webhook Events

StrideSync can send webhook notifications for various events. Configure webhook endpoints in your account settings.

### Event Types

- `run.completed` - A run is completed
- `goal.achieved` - A goal is achieved
- `weekly_summary` - Weekly summary available

### Webhook Payload Example

```json
{
  "event": "run.completed",
  "timestamp": "2023-01-01T12:00:00Z",
  "data": {
    "run_id": "abc123",
    "user_id": "user123",
    "distance": 5000,
    "duration": 1800,
    "avg_pace": 5.2
  }
}
```

## SDKs

Official SDKs are available for:

- [JavaScript/Node.js](https://github.com/stride-sync/sdk-js)
- [Python](https://github.com/stride-sync/sdk-python)
- [Swift](https://github.com/stride-sync/sdk-swift)
- [Kotlin](https://github.com/stride-sync/sdk-kotlin)

## Versioning

API versioning follows semantic versioning (SemVer). The current API version is `v1`.

## Support

For API support, please contact [support@stridesync.app](mailto:support@stridesync.app) or open an issue on our [GitHub repository](https://github.com/stride-sync/api).
