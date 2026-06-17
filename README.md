# Flash Sale Inventory Reservation System

A production-quality Node.js backend for managing flash sale product reservations with MongoDB and Redis. Designed to prevent overselling under concurrent requests using atomic Redis operations.

## Features

✅ **Product Management** - Create and manage products with stock tracking
✅ **Reservation System** - Reserve products with 10-minute TTL using Redis
✅ **Concurrent Safety** - Prevent overselling with Lua scripts and atomic operations
✅ **Order Management** - Checkout reservations and create orders
✅ **Stock Status** - Real-time stock availability tracking
✅ **Rate Limiting** - DDoS protection and API throttling
✅ **Validation** - Comprehensive request validation with Zod
✅ **Error Handling** - Consistent error responses with custom AppError
✅ **Security** - Helmet headers, CORS, and input sanitization
✅ **Logging** - Structured JSON logging throughout

## Architecture

```
src/
├── config/          # Database and Redis configuration
├── controllers/     # HTTP request handlers (thin layer)
├── services/        # Business logic (Product, Reservation, Order, Stock)
├── routes/          # API route definitions
├── models/          # Mongoose schemas (Product, Order)
├── validations/     # Zod validation schemas
├── middlewares/     # Express middleware (error, validation, rate-limit)
├── utils/           # Helper utilities (AppError, logger, constants)
├── app.js           # Express application setup
└── server.js        # Entry point
```

## Technology Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express 5.x
- **Database**: MongoDB (Mongoose ODM)
- **Cache**: Redis 6.x
- **Validation**: Zod
- **Security**: Helmet, CORS
- **Logging**: Morgan + Custom Logger
- **Rate Limiting**: express-rate-limit
- **Development**: Nodemon

## Prerequisites

- Node.js 16+
- MongoDB 4.4+
- Redis 6+

## Installation

1. Clone the repository and navigate to the backend directory

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/flash-sale
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=*
```

## Running the Application

### Development Mode
```bash
npm run dev
```
Runs with Nodemon for automatic restart on file changes.

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Health Check
```
GET /health
```

### Products
```
POST   /api/products              # Create product
GET    /api/products              # Get all products
GET    /api/products/:productId   # Get product by ID
GET    /api/products/:productId/status  # Get stock status
```

### Reservations
```
POST   /api/reservations          # Create reservation (10-min TTL)
GET    /api/reservations/:userId/:productId   # Get reservation
DELETE /api/reservations/:userId/:productId   # Cancel reservation
```

### Orders
```
POST   /api/orders/checkout       # Checkout and create order
GET    /api/orders/:orderId       # Get order by ID
GET    /api/orders/user/:userId   # Get user's orders
GET    /api/orders/stats          # Get order statistics
```

## Concurrency Handling

The system prevents overselling through:

1. **Lua Scripts**: Atomic Redis operations ensure no race conditions
2. **Reservation Keys**: `reservation:{userId}:{productId}` with 600s TTL
3. **Stock Verification**: Checks available stock before reservation
4. **Transaction-like Checkout**: Verify → Deduct → Order → Delete Reservation

## Request/Response Format

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [ ... ]  // Optional validation errors
}
```

## Examples

### Create a Product
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15 Pro",
    "stock": 100,
    "price": 999.99,
    "description": "Latest iPhone"
  }'
```

### Create a Reservation
```bash
curl -X POST http://localhost:5000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "productId": "PRODUCT_ID",
    "quantity": 2
  }'
```

### Checkout
```bash
curl -X POST http://localhost:5000/api/orders/checkout \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "productId": "PRODUCT_ID",
    "quantity": 2
  }'
```

### Get Product Status
```bash
curl http://localhost:5000/api/products/PRODUCT_ID/status
```

## Testing with Postman

1. Import the `Postman_Collection.json` file
2. Set the `baseUrl` variable to `http://localhost:5000`
3. Run requests in order (Create Product → Create Reservation → Checkout)

## Error Handling

The application handles errors consistently:

- **400 Bad Request**: Validation errors
- **404 Not Found**: Resource not found
- **409 Conflict**: Insufficient stock, duplicate reservation
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Unexpected errors

All errors include structured logging and consistent JSON responses.

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| General API | 100 | 15 min |
| Reservations | 20 | 5 min |
| Checkout | 10 | 5 min |

## Performance Considerations

1. **MongoDB Indexes**: Created on `name`, `createdAt`, and query fields
2. **Redis Scan**: Used for pagination to avoid blocking operations
3. **Connection Pooling**: Configured for both MongoDB and Redis
4. **Rate Limiting**: Protects against abuse and concurrent spam

## Clean Code Principles

- ✅ **Separation of Concerns**: Controllers, Services, Models, Routes
- ✅ **Single Responsibility**: Each function/class has one purpose
- ✅ **DRY**: Reusable utilities, middleware, and error handling
- ✅ **SOLID Principles**: Dependency injection via services
- ✅ **Async/Await**: Modern async handling throughout
- ✅ **Error Handling**: Comprehensive error handling with context
- ✅ **Logging**: Structured logging for debugging and monitoring

## Security Best Practices

- Helmet for security headers
- CORS configuration
- Rate limiting to prevent abuse
- Input validation with Zod
- Structured error messages (no sensitive info leaked)
- Connection pooling for database safety

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env`

### Redis Connection Failed
- Ensure Redis is running: `redis-server`
- Check `REDIS_URL` in `.env`

### Rate Limit Exceeded
- Wait for the time window to reset
- Adjust limits in `middlewares/rateLimitMiddleware.js`

## Future Enhancements

- [ ] Authentication & authorization
- [ ] Product images and metadata
- [ ] User wishlist feature
- [ ] Order cancellation and refunds
- [ ] Email notifications
- [ ] Payment integration
- [ ] Admin dashboard
- [ ] Analytics and reports

## License

ISC

## Author

Muhammad Abuzer

---

For questions or issues, please create an issue in the repository.
