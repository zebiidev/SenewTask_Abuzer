# API Documentation

## Complete API Reference for Flash Sale Inventory System

---

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Reservations](#reservations)
4. [Orders](#orders)
5. [Response Format](#response-format)
6. [Error Codes](#error-codes)

---

## Authentication

Currently, the API is open. In production, implement JWT or API keys.

---

## Products

### Create Product

**Endpoint:** `POST /api/products`

**Description:** Create a new product with stock and pricing information.

**Request Body:**
```json
{
  "name": "iPhone 15 Pro",
  "stock": 100,
  "price": 999.99,
  "description": "Latest flagship iPhone with advanced camera system"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | Product name (3-255 characters) |
| stock | integer | Yes | Initial stock quantity (≥0) |
| price | number | Yes | Product price (≥0) |
| description | string | No | Product description (≤1000 characters) |

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Product created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "stock": 100,
    "price": 999.99,
    "description": "Latest flagship iPhone with advanced camera system",
    "createdAt": "2024-06-17T10:30:00Z",
    "updatedAt": "2024-06-17T10:30:00Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": "body.name",
      "message": "Product name must be at least 3 characters"
    }
  ]
}
```

---

### Get All Products

**Endpoint:** `GET /api/products`

**Description:** Retrieve all products in the system.

**Query Parameters:** None

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Products fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "stock": 98,
      "price": 999.99,
      "description": "Latest flagship iPhone",
      "createdAt": "2024-06-17T10:30:00Z",
      "updatedAt": "2024-06-17T10:35:00Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Samsung Galaxy S24",
      "stock": 150,
      "price": 899.99,
      "description": "Premium Android phone",
      "createdAt": "2024-06-17T10:31:00Z",
      "updatedAt": "2024-06-17T10:31:00Z"
    }
  ]
}
```

---

### Get Product by ID

**Endpoint:** `GET /api/products/:productId`

**Description:** Retrieve a specific product by its MongoDB ID.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | Valid MongoDB ObjectId |

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "stock": 98,
    "price": 999.99,
    "description": "Latest flagship iPhone",
    "createdAt": "2024-06-17T10:30:00Z",
    "updatedAt": "2024-06-17T10:35:00Z"
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Product not found"
}
```

---

### Get Product Status

**Endpoint:** `GET /api/products/:productId/status`

**Description:** Get real-time stock availability status for a product.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| productId | string | Valid MongoDB ObjectId |

**Response Details:**
- **totalStock**: Total physical stock in MongoDB
- **reservedStock**: Currently reserved quantity (locked by users)
- **availableStock**: Stock available for new reservations (totalStock - reservedStock)
- **isAvailable**: Boolean indicating if stock is available

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Product status fetched successfully",
  "data": {
    "productId": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "totalStock": 100,
    "reservedStock": 5,
    "availableStock": 95,
    "isAvailable": true,
    "price": 999.99
  }
}
```

---

## Reservations

### Create Reservation

**Endpoint:** `POST /api/reservations`

**Description:** Reserve a product for a user. Stock is locked for 10 minutes.

**Rate Limit:** 20 requests per 5 minutes

**Request Body:**
```json
{
  "userId": "user123",
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | Unique user identifier |
| productId | string | Yes | Valid MongoDB ObjectId |
| quantity | integer | Yes | Quantity to reserve (≥1) |

**Key Features:**
- Prevents duplicate reservations (user can't reserve same product twice)
- Automatically expires after 600 seconds (10 minutes)
- Stock becomes available again if reservation expires
- Uses Lua script for atomic operations

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Reservation created successfully",
  "data": {
    "userId": "user123",
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 2,
    "expiresIn": 600,
    "createdAt": "2024-06-17T10:35:00Z"
  }
}
```

**Error Response (409 - Insufficient Stock):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Insufficient stock available for reservation"
}
```

**Error Response (409 - Duplicate Reservation):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "User already has an active reservation for this product"
}
```

---

### Get Reservation

**Endpoint:** `GET /api/reservations/:userId/:productId`

**Description:** Check if a user has an active reservation for a product.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User identifier |
| productId | string | Valid MongoDB ObjectId |

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reservation fetched successfully",
  "data": {
    "userId": "user123",
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 2
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Reservation not found"
}
```

---

### Cancel Reservation

**Endpoint:** `DELETE /api/reservations/:userId/:productId`

**Description:** Cancel an active reservation. Stock becomes available immediately.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User identifier |
| productId | string | Valid MongoDB ObjectId |

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Reservation cancelled successfully",
  "data": {
    "cancelled": true
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Reservation not found"
}
```

---

## Orders

### Checkout (Create Order)

**Endpoint:** `POST /api/orders/checkout`

**Description:** Complete checkout of a reserved product. Creates an order and deducts permanent stock.

**Rate Limit:** 10 requests per 5 minutes

**Request Body:**
```json
{
  "userId": "user123",
  "productId": "507f1f77bcf86cd799439011",
  "quantity": 2
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string | Yes | User identifier |
| productId | string | Yes | Valid MongoDB ObjectId |
| quantity | integer | Yes | Quantity to checkout (must match reservation) |

**Checkout Process:**
1. Verify reservation exists for user-product
2. Check reservation quantity matches checkout quantity
3. Verify sufficient stock in MongoDB
4. Deduct stock permanently from database
5. Create order record
6. Remove reservation from Redis

**Success Response (201):**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Order created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "user123",
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 2,
    "totalPrice": 1999.98,
    "status": "completed",
    "createdAt": "2024-06-17T10:36:00Z",
    "updatedAt": "2024-06-17T10:36:00Z"
  }
}
```

**Error Response (404 - Reservation Not Found):**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "Reservation not found"
}
```

**Error Response (409 - Quantity Mismatch):**
```json
{
  "success": false,
  "statusCode": 409,
  "message": "Reservation quantity mismatch. Expected 2, got 3"
}
```

---

### Get Order by ID

**Endpoint:** `GET /api/orders/:orderId`

**Description:** Retrieve details of a completed order.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| orderId | string | Valid MongoDB ObjectId |

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order fetched successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "userId": "user123",
    "productId": "507f1f77bcf86cd799439011",
    "quantity": 2,
    "totalPrice": 1999.98,
    "status": "completed",
    "createdAt": "2024-06-17T10:36:00Z",
    "updatedAt": "2024-06-17T10:36:00Z"
  }
}
```

---

### Get User Orders

**Endpoint:** `GET /api/orders/user/:userId`

**Description:** Retrieve all orders placed by a specific user.

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| userId | string | User identifier |

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "User orders fetched successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439020",
      "userId": "user123",
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "totalPrice": 1999.98,
      "status": "completed",
      "createdAt": "2024-06-17T10:36:00Z"
    }
  ]
}
```

---

### Get Order Statistics

**Endpoint:** `GET /api/orders/stats`

**Description:** Get aggregate statistics about all orders.

**Response Includes:**
- Total number of orders
- Total revenue
- Average order value

**Success Response (200):**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Order statistics fetched successfully",
  "data": {
    "totalOrders": 150,
    "totalRevenue": 299997.50,
    "averageOrderValue": 1999.98
  }
}
```

---

## Response Format

### Standard Success Response

All successful responses follow this format:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Descriptive success message",
  "data": {
    // Response payload
  }
}
```

### Standard Error Response

All error responses follow this format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descriptive error message",
  "errors": [
    // Optional validation errors
  ]
}
```

### Validation Error Format

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": "body.name",
      "message": "Product name must be at least 3 characters"
    },
    {
      "path": "body.quantity",
      "message": "Quantity must be at least 1"
    }
  ]
}
```

---

## Error Codes

| Code | Name | Description |
|------|------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request or validation failed |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Insufficient stock, duplicate reservation, or quantity mismatch |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |

---

## Workflow Example

### Complete User Journey

1. **View Products**
   ```bash
   GET /api/products
   ```

2. **Check Product Status**
   ```bash
   GET /api/products/{productId}/status
   ```

3. **Create Reservation**
   ```bash
   POST /api/reservations
   {
     "userId": "user123",
     "productId": "{productId}",
     "quantity": 2
   }
   ```

4. **Verify Reservation** (Optional)
   ```bash
   GET /api/reservations/user123/{productId}
   ```

5. **Checkout**
   ```bash
   POST /api/orders/checkout
   {
     "userId": "user123",
     "productId": "{productId}",
     "quantity": 2
   }
   ```

6. **View Order**
   ```bash
   GET /api/orders/{orderId}
   ```

---

## Concurrency Handling

The system is designed to handle multiple simultaneous requests:

- **Atomic Lua Scripts**: Reserve operations use Redis Lua scripts for atomicity
- **Stock Verification**: Double-checks prevent overselling
- **MongoDB Transactions**: Orders use database-level constraints
- **No Race Conditions**: Reserved stock is tracked separately from available stock

**Example: Concurrent Reservations**
- Product has 10 items
- User A reserves 6 items
- User B reserves 5 items (FAILS - only 4 available)
- User C reserves 3 items (FAILS - only 4 available, User A not committed yet)
- If User A's reservation expires:
  - Product shows 10 available again
  - User B or C can retry

---

## Rate Limiting

The API implements rate limiting to prevent abuse:

| Endpoint | Limit | Window | Notes |
|----------|-------|--------|-------|
| General | 100 req | 15 min | Applied to all endpoints |
| Reservations | 20 req | 5 min | High burst protection |
| Checkout | 10 req | 5 min | Strict to prevent abuse |

Response headers include:
```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1624003200
```

When limit exceeded (429):
```json
{
  "success": false,
  "statusCode": 429,
  "message": "Too many requests, please try again later"
}
```

---

## Production Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure secure MongoDB connection with authentication
- [ ] Configure secure Redis connection with authentication
- [ ] Set up proper CORS configuration
- [ ] Enable HTTPS/TLS
- [ ] Implement authentication and authorization
- [ ] Set up logging aggregation (ELK, Datadog, etc.)
- [ ] Configure monitoring and alerting
- [ ] Set up backup strategies
- [ ] Implement API versioning
- [ ] Load testing for concurrent reservations
- [ ] Security audit and penetration testing

---
