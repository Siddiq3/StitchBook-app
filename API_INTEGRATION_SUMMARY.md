# StitchPro API Integration Summary

## Quick Reference

### 📚 Documentation Files
1. **[API_REFERENCE.md](./API_REFERENCE.md)** - Complete API endpoint documentation with request/response examples
2. **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Detailed implementation guide with code examples
3. **[utils/apiHelpers.js](./utils/apiHelpers.js)** - Helper utilities for validation, error handling, and formatting
4. **[context/StitchProContext.js](./context/StitchProContext.js)** - Context functions for all API operations

---

## Core APIs - Quick Start

### 1️⃣ Authentication
```javascript
// Login
const { token, user } = await authApi.loginTest('+1234567890');

// Refresh Token
const { token } = await authApi.refreshToken(refreshToken);
```

### 2️⃣ Create Order (MAIN ENDPOINT)
```javascript
const { addOrder } = useStitchPro();

const result = await addOrder({
  customerId: 1,
  items: [
    { type: 'shirt', fabric: 'Cotton', quantity: 2, price: 500 },
    { type: 'pant', fabric: 'Silk', quantity: 1, price: 750 }
  ],
  deliveryDate: '2026-05-01'
});

// Result:
// {
//   id: 1,
//   customerId: 1,
//   shopId: 1,
//   items: [...],
//   totalAmount: 1750,
//   status: 'pending',
//   ...
// }
```

### 3️⃣ Get Orders
```javascript
const { fetchOrders, orders } = useStitchPro();

// Get all orders
await fetchOrders();

// Filter by status
await fetchOrders({ status: 'pending' });

// Filter by customer
await fetchOrders({ customerId: 1 });

// Paginate
await fetchOrders({ page: 2, limit: 10 });
```

### 4️⃣ Update Order Status
```javascript
const { updateOrderStatus } = useStitchPro();

// Flow: pending → in_progress → ready → delivered
await updateOrderStatus(orderId, 'in_progress');
```

### 5️⃣ Record Payment
```javascript
const { recordPayment } = useStitchPro();

await recordPayment({
  orderId: 1,
  amount: 1000,
  paymentMethod: 'cash',
  notes: 'Advance payment'
});
```

### 6️⃣ Customer Management
```javascript
const { addCustomer, fetchCustomers, updateCustomer, deleteCustomer } = useStitchPro();

// Create
const customer = await addCustomer({
  name: 'John Doe',
  phone: '+1234567890',
  address: '123 Main St'
});

// Fetch
await fetchCustomers({ search: 'John' });

// Update
await updateCustomer(1, { name: 'Jane Doe' });

// Delete
await deleteCustomer(1);
```

---

## API Payload Reference

### Create Order Request
```json
{
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
}
```

### Create Order Response
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
      }
    ],
    "totalAmount": 1000,
    "status": "pending",
    "deliveryDate": "2026-05-01",
    "createdAt": "2026-04-26T10:00:00Z",
    "updatedAt": "2026-04-26T10:00:00Z"
  }
}
```

### Order Status Flow
```
pending (initial)
    ↓
in_progress
    ↓
ready
    ↓
delivered (final)
```
**Important:** Cannot skip stages. Must follow sequential flow.

---

## Error Handling

### Common Error Codes
| Code | Meaning | Solution |
|------|---------|----------|
| `INVALID_INPUT` | Missing/invalid data | Check input validation |
| `UNAUTHORIZED` | Token expired | Refresh token or re-login |
| `FORBIDDEN` | No access | Check user permissions |
| `DUPLICATE_PHONE` | Phone already exists | Use different phone |
| `INVALID_STATUS_TRANSITION` | Invalid status change | Follow status flow |
| `ORDER_NOT_FOUND` | Order doesn't exist | Verify order ID |
| `CUSTOMER_NOT_FOUND` | Customer doesn't exist | Verify customer ID |

### Error Handling Pattern
```javascript
import { getErrorMessage } from './utils/apiHelpers';

try {
  await addOrder(data);
} catch (err) {
  const userMessage = getErrorMessage(err);
  showToast(userMessage, 'error');
}
```

---

## Validation Utilities

```javascript
import {
  validateOrder,
  validateCustomer,
  isValidStatusTransition,
  isValidPhone,
  isValidDate
} from './utils/apiHelpers';

// Validate order before submission
const validation = validateOrder(orderData);
if (!validation.isValid) {
  validation.errors.forEach(err => console.log(err));
}

// Check status transition
if (isValidStatusTransition('pending', 'in_progress')) {
  await updateOrderStatus(orderId, 'in_progress');
}

// Validate phone
if (isValidPhone('+1234567890')) {
  // Valid phone
}
```

---

## Data Formatting Utilities

```javascript
import {
  formatOrderForDisplay,
  formatCustomerForDisplay,
  formatDate,
  capitalizeStatus,
  getInitials
} from './utils/apiHelpers';

// Format for UI
const displayOrder = formatOrderForDisplay(order);
console.log(displayOrder.totalAmountFormatted); // "₹1750.00"
console.log(displayOrder.statusLabel); // "In Progress"

// Format customer
const displayCustomer = formatCustomerForDisplay(customer);
console.log(displayCustomer.initials); // "JD"

// Format utilities
console.log(capitalizeStatus('in_progress')); // "In Progress"
console.log(formatDate('2026-05-01')); // "May 1, 2026"
```

---

## Implementation Checklist

### Order Creation Screen
- [ ] Fetch customers on load
- [ ] Validate customer selection
- [ ] Add items with validation
- [ ] Set delivery date
- [ ] Show total amount calculation
- [ ] Handle loading state
- [ ] Show error messages
- [ ] Navigate to order detail on success

### Order List Screen
- [ ] Fetch orders on load
- [ ] Filter by status
- [ ] Filter by customer
- [ ] Show pagination
- [ ] Refresh functionality
- [ ] Navigate to order detail

### Order Detail Screen
- [ ] Display order info
- [ ] Show items breakdown
- [ ] Display total amount
- [ ] Show current status
- [ ] Button to advance status
- [ ] Status validation
- [ ] Payment recording
- [ ] Activity/history

---

## File Changes Summary

### Modified Files

#### `/context/StitchProContext.js`
- ✅ Fixed `addOrder()` to send camelCase payload (customerId, deliveryDate)
- ✅ Fixed `fetchOrders()` to parse `data.items` instead of `data.orders`
- ✅ Fixed `fetchCustomers()` to parse `data.items` instead of `data.customers`
- ✅ Added detailed logging for debugging
- ✅ Improved error messages

### New Files

#### `/API_REFERENCE.md`
Complete documentation of all API endpoints with:
- Request/response examples
- Query parameters
- Error codes
- cURL examples

#### `/IMPLEMENTATION_GUIDE.md`
Detailed implementation guide with:
- Context function documentation
- Error handling patterns
- Component integration examples
- Testing checklist
- Common issues & solutions

#### `/utils/apiHelpers.js`
Utility functions for:
- Error parsing & handling
- Input validation
- Status transition validation
- Data formatting
- Logging utilities
- Retry logic

---

## Testing the APIs

### Using cURL

#### Create Order
```bash
curl -X POST http://192.168.1.32:5002/api/order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": 1,
    "items": [
      {"type": "shirt", "fabric": "Cotton", "quantity": 2, "price": 500}
    ],
    "deliveryDate": "2026-05-01"
  }'
```

#### Get Orders
```bash
curl -X GET "http://192.168.1.32:5002/api/order?status=pending&page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Update Status
```bash
curl -X PUT http://192.168.1.32:5002/api/order/1/status \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_progress"}'
```

---

## Next Steps

1. **Review Documentation**
   - Read `API_REFERENCE.md` for complete endpoint details
   - Read `IMPLEMENTATION_GUIDE.md` for implementation examples

2. **Update Components**
   - Review `CreateOrder.js` - verify payload format
   - Review `OrdersScreen.js` - verify fetch and filtering
   - Review `OrderDetail.js` - verify status updates

3. **Test All Endpoints**
   - Test create order with valid data
   - Test status transitions
   - Test error cases
   - Test pagination

4. **Add Error Handling**
   - Use `getErrorMessage()` helper for user-friendly errors
   - Implement proper error UI in components
   - Add retry logic for network failures

5. **Production Deployment**
   - Update API base URL to production server
   - Implement token refresh logic
   - Set up error tracking/logging
   - Test with production data

---

## Key Implementation Notes

### ✅ CORRECT Payload Format
```javascript
{
  customerId: 1,           // ✅ camelCase
  deliveryDate: '2026-05-01',  // ✅ ISO date
  items: [...]
}
```

### ❌ INCORRECT (Old Format)
```javascript
{
  customer_id: 1,          // ❌ snake_case (removed)
  delivery_date: '2026-05-01',  // ❌ snake_case (removed)
  items: [...]
}
```

### Response Structure
```javascript
// ✅ CORRECT
res.data.data.items          // Array of items
res.data.data.pagination     // Pagination info

// ❌ INCORRECT (Old)
res.data.data.orders         // Wrong property
res.data.data.customers      // Wrong property
```

---

## API Authentication

All protected endpoints require JWT Bearer token in Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Management:**
- Tokens are automatically injected by axios interceptor in `api.js`
- Tokens are stored in local storage via `storage` service
- On 401 error, token is cleared and user is logged out

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Status Code:** 429 (Too Many Requests)

---

## Support & Debugging

### Enable Debug Logging
The context logs all API calls. Check console for:
```
[LOGIN] Calling API with phone...
[SHOP] Fetching...
[CUSTOMERS] Fetching...
[ORDERS] Fetching...
[ORDER] Creating with payload...
[API] Error from /order: { code: 'INVALID_INPUT', ... }
```

### Common Issues
See `IMPLEMENTATION_GUIDE.md` → "Common Issues & Solutions" section

---

## Timeline

| Phase | Task | Status |
|-------|------|--------|
| 1 | Create API reference | ✅ Complete |
| 2 | Update CreateOrder | ✅ Complete |
| 3 | Fix context functions | ✅ Complete |
| 4 | Add error handling | ✅ Complete |
| 5 | Create helper utilities | ✅ Complete |
| 6 | Test all endpoints | ⏳ Pending |

---

**Last Updated:** April 28, 2026  
**API Version:** 1.0.0  
**App Version:** 1.0.0  

For more details, refer to the documentation files listed above.
