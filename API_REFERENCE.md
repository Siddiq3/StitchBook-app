# StitchPro API Reference

## Overview
This document provides a complete reference for all API endpoints available in the Tailor CRM API. All endpoints require JWT Bearer authentication except for `/auth/login-test` and `/health`.

**Base URL:** `http://192.168.1.32:5002/api`

---

## Authentication Endpoints

### Login Test (Development)
- **Endpoint:** `POST /auth/login-test`
- **Description:** Development login endpoint
- **Authentication:** None (Public)
- **Request Body:**
  ```json
  {
    "phone": "+1234567890",
    "testToken": "test-token"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "data": {
      "token": "eyJhbGc...",
      "refreshToken": "eyJhbGc...",
      "expiresIn": 604800,
      "user": {
        "id": 1,
        "phone": "+1234567890",
        "name": "John Doe",
        "shopId": 1,
        "createdAt": "2026-04-26T10:00:00Z"
      }
    }
  }
  ```

### Refresh Token
- **Endpoint:** `POST /auth/refresh-token`
- **Description:** Refresh expired JWT token
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "refreshToken": "eyJhbGc..."
  }
  ```
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Token refreshed successfully",
    "data": {
      "token": "eyJhbGc...",
      "expiresIn": 604800
    }
  }
  ```

---

## Shop Endpoints

### Create Shop
- **Endpoint:** `POST /shop`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "name": "My Tailor Shop",
    "phone": "+1234567890",
    "location": "123 Main Street"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Shop created successfully",
    "data": {
      "id": 1,
      "userId": 1,
      "name": "My Tailor Shop",
      "location": "123 Main Street",
      "phone": "+1234567890",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:00:00Z"
    }
  }
  ```

### Get Shop
- **Endpoint:** `GET /shop`
- **Authentication:** Bearer Token
- **Query Parameters:** None
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Shop retrieved successfully",
    "data": {
      "id": 1,
      "userId": 1,
      "name": "My Tailor Shop",
      "location": "123 Main Street",
      "phone": "+1234567890",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:00:00Z"
    }
  }
  ```

### Update Shop
- **Endpoint:** `PUT /shop`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "name": "Updated Shop Name",
    "phone": "+9876543210",
    "location": "456 New Street"
  }
  ```
- **Response (200):** Same as Get Shop

### Delete Shop
- **Endpoint:** `DELETE /shop`
- **Authentication:** Bearer Token
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Shop deleted successfully",
    "data": null
  }
  ```

---

## Customer Endpoints

### Create Customer
- **Endpoint:** `POST /customer`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main Street",
    "gender": "male"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Customer created successfully",
    "data": {
      "id": 1,
      "shopId": 1,
      "name": "John Doe",
      "phone": "+1234567890",
      "address": "123 Main Street",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:00:00Z"
    }
  }
  ```

### Get All Customers
- **Endpoint:** `GET /customer`
- **Authentication:** Bearer Token
- **Query Parameters:**
  - `search` (optional): Search by name or phone
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Customers retrieved successfully",
    "data": {
      "items": [
        {
          "id": 1,
          "shopId": 1,
          "name": "John Doe",
          "phone": "+1234567890",
          "address": "123 Main Street",
          "createdAt": "2026-04-26T10:00:00Z",
          "updatedAt": "2026-04-26T10:00:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 50
      }
    }
  }
  ```

### Get Customer by ID
- **Endpoint:** `GET /customer/{id}`
- **Authentication:** Bearer Token
- **Path Parameters:**
  - `id`: Customer ID
- **Response (200):** Same as individual customer object

### Update Customer
- **Endpoint:** `PUT /customer/{id}`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "name": "John Doe Updated",
    "phone": "+9876543210",
    "address": "456 New Street",
    "gender": "male"
  }
  ```
- **Response (200):** Updated customer object

### Delete Customer
- **Endpoint:** `DELETE /customer/{id}`
- **Authentication:** Bearer Token
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Customer deleted successfully",
    "data": null
  }
  ```

---

## Order Endpoints

### Create Order ⭐ (MAIN ENDPOINT)
- **Endpoint:** `POST /order`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "customerId": 1,
    "items": [
      {
        "type": "shirt",
        "fabric": "Cotton",
        "quantity": 2,
        "price": 500
      },
      {
        "type": "pant",
        "fabric": "Silk",
        "quantity": 1,
        "price": 750
      }
    ],
    "deliveryDate": "2026-05-01"
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Order created successfully",
    "data": {
      "id": 1,
      "customerId": 1,
      "shopId": 1,
      "items": [
        {
          "type": "shirt",
          "fabric": "Cotton",
          "quantity": 2,
          "price": 500
        },
        {
          "type": "pant",
          "fabric": "Silk",
          "quantity": 1,
          "price": 750
        }
      ],
      "totalAmount": 1750,
      "status": "pending",
      "deliveryDate": "2026-05-01",
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:00:00Z"
    }
  }
  ```
- **Error (400):**
  ```json
  {
    "success": false,
    "message": "Customer ID and items are required",
    "error": {
      "code": "INVALID_INPUT"
    }
  }
  ```

### Get All Orders
- **Endpoint:** `GET /order`
- **Authentication:** Bearer Token
- **Query Parameters:**
  - `status` (optional): Filter by status (pending, in_progress, ready, delivered)
  - `customerId` (optional): Filter by customer ID
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 20): Items per page
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Orders retrieved successfully",
    "data": {
      "items": [
        {
          "id": 1,
          "customerId": 1,
          "shopId": 1,
          "items": [
            {
              "type": "shirt",
              "fabric": "Cotton",
              "quantity": 2,
              "price": 500
            }
          ],
          "totalAmount": 1000,
          "status": "pending",
          "deliveryDate": "2026-05-01",
          "createdAt": "2026-04-26T10:00:00Z",
          "updatedAt": "2026-04-26T10:00:00Z"
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 20,
        "total": 50
      }
    }
  }
  ```

### Get Order by ID
- **Endpoint:** `GET /order/{id}`
- **Authentication:** Bearer Token
- **Path Parameters:**
  - `id`: Order ID
- **Response (200):** Single order object
- **Error (404):**
  ```json
  {
    "success": false,
    "message": "Order not found",
    "error": {
      "code": "ORDER_NOT_FOUND"
    }
  }
  ```

### Update Order
- **Endpoint:** `PUT /order/{id}`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "items": [
      {
        "type": "shirt",
        "fabric": "Cotton",
        "quantity": 3,
        "price": 500
      }
    ],
    "deliveryDate": "2026-05-10"
  }
  ```
- **Response (200):** Updated order object

### Delete Order
- **Endpoint:** `DELETE /order/{id}`
- **Authentication:** Bearer Token
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Order deleted successfully",
    "data": null
  }
  ```

### Update Order Status ⭐ (IMPORTANT)
- **Endpoint:** `PUT /order/{id}/status`
- **Authentication:** Bearer Token
- **Description:** Updates order status with validation. Status flow: `pending` → `in_progress` → `ready` → `delivered`. Cannot skip stages.
- **Request Body:**
  ```json
  {
    "status": "in_progress"
  }
  ```
- **Valid Status Values:**
  - `pending` (initial state)
  - `in_progress` (after pending)
  - `ready` (after in_progress)
  - `delivered` (final state)
- **Response (200):** Updated order object with new status
- **Error (400) - Invalid Transition:**
  ```json
  {
    "success": false,
    "message": "Invalid status transition from 'pending' to 'delivered'. Allowed: in_progress",
    "error": {
      "code": "INVALID_STATUS_TRANSITION"
    }
  }
  ```

---

## Measurement Endpoints

### Create Measurement
- **Endpoint:** `POST /measurement`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "customerId": 1,
    "measurementsData": {
      "chest": 40,
      "waist": 32,
      "length": 28,
      "sleeve": 24,
      "neck": 15,
      "shoulder": 18
    }
  }
  ```
- **Response (201):**
  ```json
  {
    "success": true,
    "message": "Measurement created successfully",
    "data": {
      "id": 1,
      "customerId": 1,
      "measurementsData": {
        "chest": 40,
        "waist": 32,
        "length": 28,
        "sleeve": 24,
        "neck": 15,
        "shoulder": 18
      },
      "createdAt": "2026-04-26T10:00:00Z",
      "updatedAt": "2026-04-26T10:00:00Z"
    }
  }
  ```

### Get Measurements by Customer
- **Endpoint:** `GET /measurement/customer/{customerId}`
- **Authentication:** Bearer Token
- **Path Parameters:**
  - `customerId`: Customer ID
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Measurements retrieved successfully",
    "data": {
      "items": [
        {
          "id": 1,
          "customerId": 1,
          "measurementsData": {
            "chest": 40,
            "waist": 32,
            "length": 28,
            "sleeve": 24
          },
          "createdAt": "2026-04-26T10:00:00Z",
          "updatedAt": "2026-04-26T10:00:00Z"
        }
      ]
    }
  }
  ```

### Get Measurement by ID
- **Endpoint:** `GET /measurement/{id}`
- **Authentication:** Bearer Token
- **Path Parameters:**
  - `id`: Measurement ID
- **Response (200):** Single measurement object

### Update Measurement
- **Endpoint:** `PUT /measurement/{id}`
- **Authentication:** Bearer Token
- **Request Body:**
  ```json
  {
    "measurementsData": {
      "chest": 42,
      "waist": 34,
      "length": 29,
      "sleeve": 25
    }
  }
  ```
- **Response (200):** Updated measurement object

### Delete Measurement
- **Endpoint:** `DELETE /measurement/{id}`
- **Authentication:** Bearer Token
- **Response (200):**
  ```json
  {
    "success": true,
    "message": "Measurement deleted successfully",
    "data": null
  }
  ```

---

## Error Handling

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Human readable error message",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes
- `INVALID_INPUT` - Missing or invalid request data
- `UNAUTHORIZED` - Missing or expired JWT token
- `FORBIDDEN` - Access denied to resource
- `NOT_FOUND` - Resource not found
- `DUPLICATE_PHONE` - Phone number already exists
- `INVALID_STATUS_TRANSITION` - Invalid order status transition
- `CUSTOMER_NOT_FOUND` - Customer does not exist
- `ORDER_NOT_FOUND` - Order does not exist
- `SHOP_NOT_FOUND` - Shop does not exist
- `MEASUREMENT_NOT_FOUND` - Measurement does not exist
- `INTERNAL_ERROR` - Server error

---

## Implementation Notes

### Payload Formatting
- **Field Names:** Use camelCase in request/response (e.g., `customerId`, `deliveryDate`)
- **Dates:** Use ISO 8601 format (YYYY-MM-DD for dates, ISO 8601 for timestamps)
- **Numbers:** Use integers for IDs, floats for prices
- **Arrays:** Items must be a non-empty array

### Authentication Header
```
Authorization: Bearer <JWT_TOKEN>
```

### Rate Limiting
- **Limit:** 100 requests per 15 minutes per IP
- **Status Code:** 429 (Too Many Requests)

### Pagination
- Default page: 1
- Default limit: 20
- Maximum limit: 100

---

## Example Workflows

### Complete Order Creation Workflow
1. **Login:** `POST /auth/login-test` → Get JWT token
2. **Create Shop:** `POST /shop` → Get shop details
3. **Create Customer:** `POST /customer` → Get customer ID
4. **Add Measurements (Optional):** `POST /measurement` → Store customer measurements
5. **Create Order:** `POST /order` → Create order with items
6. **Update Status:** `PUT /order/{id}/status` → Track order progress

### Order Status Flow
```
pending → in_progress → ready → delivered
```
Each transition must be done sequentially. Cannot skip stages.

---

## Testing with cURL

### Create Order Example
```bash
curl -X POST http://192.168.1.32:5002/api/order \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {
        "type": "shirt",
        "fabric": "Cotton",
        "quantity": 2,
        "price": 500
      }
    ],
    "deliveryDate": "2026-05-01"
  }'
```

### Update Order Status Example
```bash
curl -X PUT http://192.168.1.32:5002/api/order/1/status \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress"
  }'
```

---

**Last Updated:** April 28, 2026
**API Version:** 1.0.0
