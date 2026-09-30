# StitchPro API Architecture & Data Flow

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     STITCHPRO APP                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │              SCREENS / COMPONENTS                  │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ • CreateOrder.js      - Form for creating orders   │  │
│  │ • OrdersScreen.js     - List view with filtering   │  │
│  │ • OrderDetail.js      - Order details & actions    │  │
│  │ • CustomersScreen.js  - Customer management        │  │
│  └─────────────────────────────────────────────────────┘  │
│                            ↓                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         CONTEXT (StitchProContext.js)              │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ • addOrder()           - Create order             │  │
│  │ • fetchOrders()        - Get orders               │  │
│  │ • updateOrderStatus()  - Change status            │  │
│  │ • recordPayment()      - Record payment           │  │
│  │ • addCustomer()        - Create customer          │  │
│  │ • fetchCustomers()     - Get customers            │  │
│  │ • State Management     - Global state             │  │
│  └─────────────────────────────────────────────────────┘  │
│                            ↓                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │        API SERVICE LAYER (services/api.js)         │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ • orderApi            - POST, GET, PUT, DELETE     │  │
│  │ • customerApi         - CRUD operations            │  │
│  │ • shopApi             - Shop management            │  │
│  │ • measurementApi      - Measurements              │  │
│  │ • paymentApi          - Payments                  │  │
│  │ • Interceptors        - Auth, error handling      │  │
│  └─────────────────────────────────────────────────────┘  │
│                            ↓                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │         UTILITY LAYER (utils/apiHelpers.js)        │  │
│  ├─────────────────────────────────────────────────────┤  │
│  │ • Error Handling       - parseApiError()           │  │
│  │ • Validation           - validateOrder()           │  │
│  │ • Formatting           - formatOrderForDisplay()   │  │
│  │ • Logging              - logApiCall()              │  │
│  │ • Retry Logic          - retryWithBackoff()        │  │
│  └─────────────────────────────────────────────────────┘  │
│                            ↓                               │
│  ┌─────────────────────────────────────────────────────┐  │
│  │     AXIOS HTTP CLIENT (with JWT interceptors)      │  │
│  └─────────────────────────────────────────────────────┘  │
│                            ↓                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │   TAILOR CRM BACKEND API              │
        ├───────────────────────────────────────┤
        │  http://192.168.1.32:5002/api         │
        │                                       │
        │  • Auth Endpoints                    │
        │  • Order CRUD Operations             │
        │  • Customer Management               │
        │  • Measurements                      │
        │  • Payments                          │
        │  • Database Integration              │
        └───────────────────────────────────────┘
                            ↓
        ┌───────────────────────────────────────┐
        │      DATABASE (PostgreSQL)            │
        │                                       │
        │  • Users & Auth                      │
        │  • Shops                             │
        │  • Customers                         │
        │  • Orders & Items                    │
        │  • Measurements                      │
        │  • Payments                          │
        └───────────────────────────────────────┘
```

---

## Data Flow Diagrams

### 1. Create Order Flow

```
User Input (CreateOrder.js)
         ↓
    Customer Selection
         ↓
    Add Items (fabric, quantity, price)
         ↓
    Set Delivery Date
         ↓
    Review Order (see totalAmount)
         ↓
    Submit → Context addOrder()
         ↓
    Validation (validateOrder)
         ↓
    API Call: POST /order
         ↓
    Request Payload:
    {
      customerId: 1,
      items: [...],
      deliveryDate: "2026-05-01"
    }
         ↓
    Backend Processing
         ↓
    Response (201):
    {
      id: 1,
      customerId: 1,
      items: [...],
      totalAmount: 1750,
      status: "pending",
      createdAt: "..."
    }
         ↓
    Update Context State (orders)
         ↓
    Navigate to Orders Screen
         ↓
    Show Success Toast
```

### 2. Update Order Status Flow

```
Order Detail Screen
         ↓
    Display Current Status
         ↓
    User Clicks "Advance Status"
         ↓
    Check Next Valid Status
         ↓
    Show Confirmation Dialog
         ↓
    User Confirms
         ↓
    Context updateOrderStatus()
         ↓
    Validate Transition
    (isValidStatusTransition)
         ↓
    API Call: PUT /order/{id}/status
         ↓
    Request Payload:
    {
      status: "in_progress"
    }
         ↓
    Backend Validation
    (pending → in_progress ✓)
         ↓
    Response (200):
    {
      id: 1,
      status: "in_progress",
      updatedAt: "..."
    }
         ↓
    Update Context State
         ↓
    Update UI (status badge)
         ↓
    Show Success Toast
```

### 3. Fetch Orders Flow

```
Orders Screen (onMount)
         ↓
    Context fetchOrders()
         ↓
    Set ordersLoading = true
         ↓
    API Call: GET /order?status=&customerId=&page=&limit=
         ↓
    Include JWT in Authorization header
         ↓
    Backend Query Orders
         ↓
    Response (200):
    {
      data: {
        items: [{...}, {...}],
        pagination: {
          page: 1,
          limit: 20,
          total: 50
        }
      }
    }
         ↓
    Parse Response (items, pagination)
         ↓
    Update Context State:
    • orders = items
    • ordersPagination = pagination
    • ordersLoading = false
         ↓
    Re-render Orders Screen
         ↓
    Display List with Pagination
```

### 4. Error Handling Flow

```
API Call Execution
         ↓
    Error Response (4xx/5xx)
         ↓
    Axios Interceptor Catches
         ↓
    Parse Error:
    • Extract error code
    • Extract error message
    • Extract error details
         ↓
    Check Error Type
         ↓
    ┌─────────────────────┐
    │ Error Type Check    │
    ├─────────────────────┤
    │ UNAUTHORIZED (401)  │→ Clear token, logout
    │ FORBIDDEN (403)     │→ Show "No access"
    │ INVALID_INPUT (400) │→ Show validation error
    │ NOT_FOUND (404)     │→ Show "Not found"
    │ SERVER_ERROR (5xx)  │→ Show "Try again"
    └─────────────────────┘
         ↓
    Generate User-Friendly Message
         ↓
    Context throws error
         ↓
    Component catches in try-catch
         ↓
    Show Error Toast
         ↓
    Log to Console
```

---

## Component Data Structure

### Order Object
```javascript
{
  id: 1,                          // Unique order ID
  customerId: 1,                  // Associated customer
  shopId: 1,                      // Associated shop
  items: [                        // Order items
    {
      type: "shirt",              // Item type
      fabric: "Cotton",           // Fabric type
      quantity: 2,                // Quantity
      price: 500                  // Price per item
    }
  ],
  totalAmount: 1000,              // Total calculated amount
  status: "pending",              // Current status
  deliveryDate: "2026-05-01",     // Expected delivery
  createdAt: "2026-04-26T10:00:00Z",
  updatedAt: "2026-04-26T10:00:00Z"
}
```

### Customer Object
```javascript
{
  id: 1,
  shopId: 1,
  name: "John Doe",
  phone: "+1234567890",
  address: "123 Main Street",
  createdAt: "2026-04-26T10:00:00Z",
  updatedAt: "2026-04-26T10:00:00Z"
}
```

### Context State
```javascript
{
  // Auth
  isBooting: false,
  isAuthenticated: true,
  user: { id, phone, name, shopId },
  token: "jwt_token",
  shop: { id, name, location, phone },
  authError: null,

  // Customers
  customers: [],
  customersLoading: false,
  customersPagination: { page, limit, total },

  // Orders
  orders: [],
  ordersLoading: false,
  ordersPagination: { page, limit, total },

  // Measurements
  measurements: [],
  measurementsLoading: false,

  // Dashboard
  dashboardStats: null,
  dashboardLoading: false
}
```

---

## API Request/Response Cycle

### Successful Request
```
REQUEST:
┌─────────────────────────────────────┐
│ POST /api/order                     │
├─────────────────────────────────────┤
│ Headers:                            │
│  Authorization: Bearer <JWT>        │
│  Content-Type: application/json     │
│                                    │
│ Body:                              │
│ {                                  │
│   "customerId": 1,                │
│   "items": [...],                 │
│   "deliveryDate": "2026-05-01"   │
│ }                                  │
└─────────────────────────────────────┘
         ↓ (100-200ms)
RESPONSE:
┌─────────────────────────────────────┐
│ Status: 201 Created                 │
├─────────────────────────────────────┤
│ {                                   │
│   "success": true,                  │
│   "message": "Order created...",    │
│   "data": {                         │
│     "id": 1,                        │
│     "customerId": 1,                │
│     "totalAmount": 1750,            │
│     "status": "pending",            │
│     ...                             │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
```

### Failed Request
```
REQUEST: Same as above
         ↓ (validation fails)
RESPONSE:
┌─────────────────────────────────────┐
│ Status: 400 Bad Request             │
├─────────────────────────────────────┤
│ {                                   │
│   "success": false,                 │
│   "message": "Customer ID and items│
│               are required",        │
│   "error": {                        │
│     "code": "INVALID_INPUT",       │
│     "details": {}                   │
│   }                                 │
│ }                                   │
└─────────────────────────────────────┘
```

---

## State Management Flow

### Initial Load
```
App Component Mounts
    ↓
StitchProProvider Initializes
    ↓
bootApp() executes
    ↓
Check Saved Session
    ↓
Session Found? 
  ├─ YES → Set isAuthenticated=true
  │         → fetchShopSilently()
  │         → Load dashboard
  │
  └─ NO  → Set isAuthenticated=false
           → Show LoginScreen

set({ isBooting: false })
```

### After Order Creation
```
addOrder() called
    ↓
Validate payload
    ↓
API call (POST /order)
    ↓
Success?
  ├─ YES → fetchOrders() to sync state
  │         Return order object
  │         Component shows success
  │
  └─ NO  → throw error
           Component shows error

Context State Updated:
orders = [...previousOrders, newOrder]
```

---

## Error Recovery Strategy

### Network Error
```
No Internet
    ↓
Error: "No internet connection"
    ↓
Show retry toast
    ↓
User retries
    ↓
Network restored?
  ├─ YES → Request succeeds
  └─ NO  → Show persistent error
```

### Authentication Error
```
401 Unauthorized
    ↓
Check if token expired
    ↓
Try to refresh token
    ↓
Refresh successful?
  ├─ YES → Retry original request
  │
  └─ NO  → Clear session
           Logout user
           Redirect to LoginScreen
```

### Validation Error
```
400 Bad Request
    ↓
Parse error code
    ↓
Generate user message
    ↓
Show specific error
    ↓
User corrects input
    ↓
Retry request
```

---

## Performance Optimization

### Caching Strategy
```
GET /order
    ↓
Cache response for 5 minutes
    ↓
If user refreshes within 5 min
    ├─ YES → Use cached data
    │         Show refresh button
    │
    └─ NO  → Fresh API call
```

### Pagination
```
Display 20 items per page
    ↓
User scrolls to bottom
    ↓
Load next page (page++)
    ↓
Append to existing list
    ↓
Infinite scroll experience
```

### Lazy Loading
```
Orders Screen loads
    ↓
Display first 20 orders
    ↓
Users can:
  ├─ Pull to refresh
  ├─ Scroll for pagination
  └─ Search/filter (re-fetch)
```

---

## Testing Strategy

### Unit Tests
```
validateOrder() ✓
validateCustomer() ✓
isValidStatusTransition() ✓
formatOrderForDisplay() ✓
parseApiError() ✓
```

### Integration Tests
```
Create order flow ✓
Update status flow ✓
Record payment flow ✓
Filter/paginate orders ✓
Customer CRUD operations ✓
```

### E2E Tests
```
Complete workflow:
1. Login ✓
2. Create customer ✓
3. Create order ✓
4. Update status ✓
5. Record payment ✓
6. Verify in list ✓
```

---

## Key Dependencies

```
┌─────────────────────────────────┐
│ Third-Party Libraries           │
├─────────────────────────────────┤
│ • axios           - HTTP client │
│ • @react-native-* - RN modules │
│ • @react-navigation - Navigation│
│ • react-native-communitymodules │
└─────────────────────────────────┘
```

---

## Configuration

### API Base URL
- Development: `http://192.168.1.32:5002/api`
- Production: `https://api.tailorcrm.com`

### Request Timeout
- Default: 15 seconds

### Retry Strategy
- Max attempts: 3
- Backoff: Exponential (1s, 2s, 4s)

### Rate Limiting
- 100 requests per 15 minutes

---

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| 404 Not Found | Wrong endpoint | Check API_REFERENCE.md |
| 401 Unauthorized | No/expired token | Check auth interceptor |
| 400 Bad Request | Invalid payload | Check validateOrder() |
| INVALID_STATUS_TRANSITION | Wrong status | Follow status flow |
| DUPLICATE_PHONE | Phone exists | Use different phone |
| Network Error | No internet | Check connection |
| Blank orders list | API returns empty | Check filters |

---

**Last Updated:** April 28, 2026  
**Architecture Version:** 1.0.0
