# Sustainable Product Co-Creation Backend API

A production-ready Node.js + Express backend for Walmart's Generative AI Sustainable Product Co-Creation Platform. This API enables users to co-create sustainable products with AI assistance, get environmental impact scores, and submit orders for local manufacturing.

## 🌟 Features

- **AI-Powered Design Generation**: Uses Gemini Pro API to generate personalized sustainable product designs
- **Sustainability Scoring**: Integrates Mistral AI to provide detailed environmental impact assessments
- **User Authentication**: Secure authentication system using Supabase Auth
- **Order Management**: Complete order lifecycle management with local manufacturing preferences
- **Production-Ready**: Comprehensive error handling, validation, rate limiting, and security measures

## 🏗️ Architecture

```
├── controllers/          # Business logic handlers
├── routes/              # API route definitions
├── services/            # External service integrations (Supabase, AI APIs)
├── middleware/          # Custom middleware (auth, validation, error handling)
├── utils/              # Helper functions and constants
└── server.js           # Main application entry point
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Supabase account
- Gemini Pro API key
- Mistral AI API key

### Installation

1. **Clone and install dependencies**
```bash
npm install
```

2. **Environment setup**
```bash
cp .env.example .env
# Fill in your API keys and configuration
```

3. **Start development server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `SUPABASE_URL` | Your Supabase project URL | ✅ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `GEMINI_API_KEY` | Google Gemini Pro API key | ✅ |
| `MISTRAL_API_KEY` | Mistral AI API key | ✅ |
| `JWT_SECRET` | Secret for JWT token signing | ✅ |
| `PORT` | Server port (default: 3000) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |

## 📚 API Documentation

### Authentication Endpoints

#### `POST /api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "full_name": "John Doe",
  "sustainability_preferences": {
    "prefer_organic": true,
    "prefer_local": true
  }
}
```

#### `POST /api/auth/login`
Authenticate user and get session token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### Design Generation Endpoints

#### `POST /api/design/generate`
Generate AI-powered sustainable product designs.

**Request Body:**
```json
{
  "prompt": "Minimalist T-shirt with nature print",
  "preferences": {
    "color_palette": "earth_tones",
    "style": "minimalist"
  },
  "category": "clothing"
}
```

**Response:**
```json
{
  "message": "Designs generated successfully",
  "designs": [
    {
      "id": "design_1",
      "name": "Organic Cotton Nature Tee",
      "description": "Minimalist design with botanical print",
      "materials": [...],
      "sustainability_highlights": [...],
      "estimated_price": "$25-35"
    }
  ]
}
```

### Sustainability Scoring Endpoints

#### `POST /api/materials/score`
Get detailed sustainability scorecard for materials.

**Request Body:**
```json
{
  "materials": [
    {
      "name": "Organic Cotton",
      "type": "organic",
      "description": "GOTS certified organic cotton"
    }
  ],
  "product_type": "clothing"
}
```

**Response:**
```json
{
  "message": "Sustainability score generated successfully",
  "score": {
    "overall_score": 8.5,
    "grade": "A-",
    "categories": {
      "carbon_footprint": { "score": 8.2, "rating": "Excellent" },
      "water_usage": { "score": 7.8, "rating": "Good" }
    }
  }
}
```

### Order Management Endpoints

#### `POST /api/order/submit`
Submit order for production.

**Request Body:**
```json
{
  "design_id": "uuid",
  "selected_materials": [...],
  "quantity": 2,
  "shipping_address": {
    "street": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zip_code": "78701",
    "country": "USA"
  },
  "estimated_price": 65.00
}
```

#### `GET /api/order/history`
Get user's order history with pagination.

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS Protection**: Configurable cross-origin resource sharing
- **Helmet**: Security headers for HTTP protection
- **Input Validation**: Comprehensive request validation using express-validator
- **Authentication**: JWT-based authentication with Supabase
- **Error Handling**: Structured error responses without sensitive data leakage

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Check API health
curl http://localhost:3000/health
```

## 🚀 Deployment

### Environment Setup
1. Set all required environment variables
2. Ensure database is properly configured
3. Set `NODE_ENV=production`

### Production Considerations
- Use a process manager like PM2
- Set up proper logging and monitoring
- Configure reverse proxy (nginx)
- Enable SSL/TLS certificates
- Set up database backups

## 🤝 Integration with Frontend

This backend is designed to work seamlessly with React/TypeScript frontends. Key integration points:

- **Authentication**: Returns JWT tokens for session management
- **CORS**: Configured for frontend origins
- **JSON Responses**: Consistent response format for easy consumption
- **Error Handling**: Structured error responses for user-friendly error handling

## 📊 Monitoring and Analytics

The API includes built-in request logging and error tracking. For production:

- Monitor response times and error rates
- Track AI API usage and costs
- Monitor database performance
- Set up alerts for critical failures

## 🔄 Future Enhancements

- Real-time order status updates via WebSockets
- Image upload for custom designs
- Email notifications for order updates
- Admin dashboard API endpoints
- Analytics and reporting endpoints
- Integration with payment processors

## 📝 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for sustainable manufacturing and AI-powered creativity.