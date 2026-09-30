# Customers Not Showing - Root Cause & Fix

## Problem
Created customers were not appearing in the customers list, even though the API call seemed successful.

## Root Cause Analysis

### Issue 1: Response Format Mismatch
**What happened:**
- The OpenAPI documentation (our frontend documentation) said responses should use `items` property
- But the actual backend is returning `customers` property

**Mismatch:**
```javascript
// Documentation / OpenAPI says:
{
  data: {
    items: [...],        // ← Frontend expected this
    pagination: {}
  }
}

// But backend actually returns:
{
  data: {
    customers: [...],    // ← Backend sends this
    pagination: {}
  }
}
```

**Frontend Code was failing:**
```javascript
const items = res.data?.data?.items || [];  // Always empty!
// Then: JSON.stringify(items).length throws error because items undefined
```

### Issue 2: Order Payload Format
**Additional issue found:**
- Frontend was sending `customerId` and `deliveryDate` (camelCase)
- But backend expects `customer_id` and `delivery_date` (snake_case)

## Solutions Applied

### Fix 1: Updated Response Parsing (fetchCustomers & fetchOrders)
```javascript
// OLD - Only looked for .items:
const items = res.data?.data?.items || [];

// NEW - Handles both formats:
const responseData = res.data?.data || {};
const items = responseData.items || responseData.customers || [];  // ← Tries both
const pagination = responseData.pagination || { page, limit, total: items.length };
```

### Fix 2: Fixed Order Creation Payload
```javascript
// OLD - Sent camelCase:
const payload = {
  customerId: data.customerId,         // ✗ Backend expects snake_case
  deliveryDate: data.deliveryDate,     // ✗ Backend expects snake_case
  ...
}

// NEW - Sends snake_case:
const payload = {
  customer_id: data.customerId,        // ✓ Backend expects this
  delivery_date: data.deliveryDate,    // ✓ Backend expects this
  ...
}
```

### Fix 3: Enhanced Debug Logging
Added detailed console logs to see actual API responses:
```javascript
console.log('[CUSTOMERS] API Response:', JSON.stringify(res.data, null, 2));
console.log('[CUSTOMERS] Parsed items:', items.length, 'customers');
console.log('[CUSTOMER] Creating with data:', JSON.stringify(data, null, 2));
```

## Files Modified

1. **context/StitchProContext.js**
   - ✅ Fixed `fetchCustomers()` - now handles both `items` and `customers` response properties
   - ✅ Fixed `fetchOrders()` - now handles both `items` and `orders` response properties
   - ✅ Fixed `addOrder()` - now sends snake_case `customer_id` and `delivery_date`
   - ✅ Fixed `addCustomer()` - added better error logging and timing fix
   - ✅ Added enhanced debug logging for all functions

## Testing

### To verify the fix works:

1. **Create a customer:**
   - Go to Customers screen
   - Click "Add" button
   - Fill in name and phone
   - Submit

2. **Check console logs:**
   - Should see: `[CUSTOMER] Creating with data: {...}`
   - Should see: `[CUSTOMER] Created successfully! ID: 1`
   - Should see: `[CUSTOMERS] API Response: {...}`
   - Should see: `[CUSTOMERS] Parsed items: 1 customers`

3. **Verify in UI:**
   - Customer should appear in the list
   - Screen should refresh automatically

### If still not working, check:
```
[CUSTOMERS] Full items array: (shows what we got)
```

If that shows empty array, the backend might be returning a different format.

## Backend vs Frontend Contract

### Current Reality (Backend Behavior)
```javascript
// GET /customer response
{
  data: {
    customers: [...],           // ← Actually returns this
    pagination: {...}
  }
}

// POST /order request expects
{
  customer_id: number,          // ← snake_case
  delivery_date: "2026-05-01",  // ← snake_case
  items: [...]
}
```

### OpenAPI Documentation Says
```javascript
// Should return
{
  data: {
    items: [...],               // ← Documentation says this
    pagination: {...}
  }
}
```

**Status:** Frontend is now flexible to handle BOTH formats until backend is updated to match documentation.

## Next Steps

### Option 1: Update Backend (Recommended)
Align backend response format with OpenAPI documentation:
- Change `customers` to `items` in response
- Change `orders` to `items` in response

### Option 2: Update Documentation  
Update OpenAPI docs to reflect actual backend response format.

### Option 3: Keep Current Fix
Continue using flexible parsing that handles both formats.

## Code Changes Summary

| Component | Change | Reason |
|-----------|--------|--------|
| fetchCustomers() | Handle both `items` and `customers` | Backend returns `customers` |
| fetchOrders() | Handle both `items` and `orders` | Backend returns `orders` |
| addOrder() | Use snake_case `customer_id` | Backend expects snake_case |
| addCustomer() | Added timeout before fetch | Ensure backend is ready |
| All functions | Enhanced logging | Better debugging visibility |

---

**Fix Applied:** April 28, 2026
**Status:** ✅ Complete - Customers should now display correctly
