# Quick Start Guide

## Get Up and Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Setup Environment
```bash
cp .env.example .env
```

The `.env` file already has default values for local development:
- MongoDB: `mongodb://localhost:27017/flash-sale`
- Redis: `redis://localhost:6379`

### Step 3: Start Services (Open 2 terminals)

**Terminal 1 - MongoDB:**
```bash
mongod
```

**Terminal 2 - Redis:**
```bash
redis-server
```

**Terminal 3 - Application:**
```bash
npm run dev
```

You should see:
```
Server running successfully
port: 5000
MongoDB connected successfully
Redis connected successfully
```

### Step 4: Test the API

Visit in your browser or use curl:
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-06-17T10:30:00.000Z"
}
```

### Step 5: Try the Complete Flow

**1. Create a Product:**
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "stock": 100,
    "price": 999.99,
    "description": "Latest flagship iPhone"
  }'
```

Save the `_id` from the response.

**2. Create a Reservation:**
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "productId": "YOUR_PRODUCT_ID",
    "quantity": 2
  }'
```

**3. Checkout:**
```bash
curl -X POST http://localhost:5000/api/orders/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "productId": "YOUR_PRODUCT_ID",
    "quantity": 2
  }'
```

**4. Check Stock Status:**
```bash
curl http://localhost:5000/api/products/YOUR_PRODUCT_ID/status
```

You should see stock decreased!

---

## Using Postman (Recommended)

1. Download Postman: https://www.postman.com/downloads/
2. Import the collection: `Postman_Collection.json`
3. Set `baseUrl` in Postman environment to `http://localhost:5000`
4. Run requests in order (Create Product → Reserve → Checkout)

---

## Common Issues

### "MongoDB connection error"
- Make sure MongoDB is running: `mongod`
- Check MONGODB_URI in .env

### "Redis connection error"
- Make sure Redis is running: `redis-server`
- Check REDIS_URL in .env

### Port already in use
- Change PORT in .env (default: 5000)
- Or kill existing process: `lsof -ti:5000 | xargs kill -9`

### Rate limit exceeded
- Wait 5 minutes for checkout rate limit to reset
- Adjust limits in `src/middlewares/rateLimitMiddleware.js`

---

## Project Structure

```
backend/
├── src/
│   ├── config/           # Database & Redis config
│   ├── controllers/      # HTTP request handlers
│   ├── services/         # Business logic
│   ├── routes/           # API endpoints
│   ├── models/           # Database schemas
│   ├── validations/      # Input validation
│   ├── middlewares/      # Express middleware
│   ├── utils/            # Helper utilities
│   ├── app.js            # Express setup
│   └── server.js         # Entry point
├── .env.example          # Environment template
├── README.md             # Full documentation
├── API_DOCUMENTATION.md  # Detailed API reference
└── Postman_Collection.json
```

---

## Key Features

✅ **Flash Sale Ready** - Handles thousands of concurrent users
✅ **Atomic Operations** - Lua scripts prevent race conditions
✅ **10-Min Reservations** - Auto-expires if not checked out
✅ **Real-time Stock** - Track total, reserved, and available
✅ **Rate Limiting** - Prevents abuse and spam
✅ **Validation** - All inputs validated with Zod
✅ **Error Handling** - Consistent error responses
✅ **Logging** - Structured JSON logs for debugging

---

## Architecture Highlights

### Three-Layer Architecture
1. **Controllers** - HTTP request/response only
2. **Services** - All business logic
3. **Models** - Data schemas and database

### Two-Storage System
- **MongoDB** - Persistent product and order data
- **Redis** - Fast temporary reservations with TTL

### Concurrency Safety
- Lua scripts for atomic Redis operations
- Database indexes for performance
- Stock verification before and after operations

---

## What's Included

📦 **Core Application**
- Express.js server with all middleware
- MongoDB (Mongoose) and Redis integration
- Complete API implementation

📚 **Documentation**
- README.md - Setup and overview
- API_DOCUMENTATION.md - All endpoints with examples
- IMPLEMENTATION_SUMMARY.md - Architecture details
- This Quick Start guide

🧪 **Testing**
- Postman collection with all endpoints
- Example requests for every operation
- Environment variables for easy testing

🔒 **Production Ready**
- Error handling and logging
- Rate limiting and security
- Validation and input sanitization
- Connection pooling and optimization

---

## Next Steps

1. ✅ Start the application
2. ✅ Test the API endpoints
3. ✅ Review the code (well-commented)
4. ✅ Check the documentation
5. ✅ Deploy to production (see README)

---

## Need Help?

- **API Questions** → See `API_DOCUMENTATION.md`
- **Setup Issues** → Check "Common Issues" above
- **Code Review** → Comments throughout the code
- **Architecture** → Read `IMPLEMENTATION_SUMMARY.md`

---

## Project Status

✅ **Complete** - All requirements implemented
✅ **Tested** - All endpoints working
✅ **Documented** - Comprehensive documentation
✅ **Production Ready** - Security, logging, error handling

---

**You're all set! Happy coding! 🚀**
