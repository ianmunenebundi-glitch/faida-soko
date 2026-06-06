# FAIDA SOKO Backend API

Express.js backend for FAIDA SOKO - Kenya's premier digital marketing agency.

## Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Start development server
npm run dev
# Runs on http://localhost:5000
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if API is running

### Contact
- `POST /api/contact` - Submit contact form

### Chatbot
- `POST /api/chatbot/chat` - Send message to chatbot

### Products
- `GET /api/products` - Get all products

### Orders
- `POST /api/orders` - Create order

## Environment Variables

See `.env.example` for all available configuration options.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing key
- `ANTHROPIC_API_KEY` - Claude API key
- `MPESA_*` - M-Pesa configuration
- `STRIPE_*` - Stripe configuration

## Testing

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test contact form
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","phone":"0712345678","message":"Hello"}'

# Test chatbot
curl -X POST http://localhost:5000/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"How can I grow my business?"}'
```

## Development

```bash
# Run with nodemon (auto-restart on changes)
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Production Deployment

```bash
# Build for production
npm install --production

# Start server
NODE_ENV=production npm start
```
