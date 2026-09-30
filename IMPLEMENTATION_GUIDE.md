# StitchPro API Implementation Guide

## Overview
This guide provides implementation details for using all Tailor CRM APIs in the stitchpro-app with proper error handling and best practices.

---

## Table of Contents
1. [Context Functions](#context-functions)
2. [Error Handling Patterns](#error-handling-patterns)
3. [Order API Implementation](#order-api-implementation)
4. [Component Integration Examples](#component-integration-examples)
5. [Testing Checklist](#testing-checklist)

---

## Context Functions

### Order Management

#### `addOrder(data)`
Creates a new order in the system.

**Input:**
```javascript
{
  customerId: number,        // Required: Customer ID
  items: Array,              // Required: Array of order items
  deliveryDate: string       // Optional: ISO date string (YYYY-MM-DD)
}
```

**Item Format:**
```javascript
{
  type: string,              // e.g., "shirt", "pant", "kurta"
  fabric: string,            // e.g., "Cotton", "Silk"
  quantity: number,          // Positive integer
  price: number              // Price per item
}
```

**Example:**
```javascript
const { addOrder } = useStitchPro();

try {
  const result = await addOrder({
    customerId: 1,
    items: [
      { type: 'shirt', fabric: 'Cotton', quantity: 2, price: 500 },
      { type: 'pant', fabric: 'Silk', quantity: 1, price: 750 }
    ],
    deliveryDate: '2026-05-01'
  });
  console.log('Order created:', result.id);
} catch (err) {
  console.error('Failed to create order:', err.message);
}
```

**Response:**
```javascript
{
  id: 1,
  customerId: 1,
  shopId: 1,
  items: [...],
  totalAmount: 1750,
  status: 'pending',
  deliveryDate: '2026-05-01',
  createdAt: '2026-04-26T10:00:00Z',
  updatedAt: '2026-04-26T10:00:00Z'
}
```

---

#### `fetchOrders(options)`
Retrieves all orders with optional filtering.

**Input:**
```javascript
{
  status: string,           // Optional: 'pending', 'in_progress', 'ready', 'delivered'
  customerId: number,       // Optional: Filter by customer
  page: number,             // Optional: Page number (default: 1)
  limit: number             // Optional: Items per page (default: 20)
}
```

**Example:**
```javascript
const { fetchOrders } = useStitchPro();

// Get all pending orders
await fetchOrders({ status: 'pending' });

// Get orders for specific customer
await fetchOrders({ customerId: 1, page: 1, limit: 10 });

// Get all orders
await fetchOrders();
```

**Response Structure:**
```javascript
{
  orders: [
    {
      id: 1,
      customerId: 1,
      items: [...],
      totalAmount: 1000,
      status: 'pending',
      deliveryDate: '2026-05-01',
      createdAt: '2026-04-26T10:00:00Z'
    }
  ],
  ordersPagination: {
    page: 1,
    limit: 20,
    total: 50
  }
}
```

---

#### `updateOrderStatus(orderId, status)`
Updates order status with flow validation.

**Status Flow:**
```
pending → in_progress → ready → delivered
```

**Parameters:**
```javascript
{
  orderId: number,
  status: string  // Must be valid next status
}
```

**Example:**
```javascript
const { updateOrderStatus } = useStitchPro();

try {
  await updateOrderStatus(1, 'in_progress');
  console.log('Order status updated');
} catch (err) {
  if (err.message.includes('INVALID_STATUS_TRANSITION')) {
    console.error('Cannot skip status stages');
  } else {
    console.error('Update failed:', err.message);
  }
}
```

---

#### `recordPayment(paymentData)`
Records a payment for an order.

**Input:**
```javascript
{
  orderId: number,
  amount: number,
  paymentMethod: string,    // 'cash', 'card', 'upi', 'check'
  notes: string            // Optional: Additional notes
}
```

**Example:**
```javascript
const { recordPayment } = useStitchPro();

try {
  await recordPayment({
    orderId: 1,
    amount: 1000,
    paymentMethod: 'cash',
    notes: 'Advance payment received'
  });
  console.log('Payment recorded');
} catch (err) {
  console.error('Payment recording failed:', err.message);
}
```

---

### Customer Management

#### `fetchCustomers(options)`
Retrieves all customers with optional search.

**Input:**
```javascript
{
  search: string,           // Optional: Search by name or phone
  page: number,             // Optional: Page number (default: 1)
  limit: number             // Optional: Items per page (default: 20)
}
```

**Example:**
```javascript
const { fetchCustomers } = useStitchPro();

// Get all customers
await fetchCustomers();

// Search customers
await fetchCustomers({ search: 'John' });

// Paginated results
await fetchCustomers({ page: 2, limit: 10 });
```

---

#### `addCustomer(data)`
Creates a new customer.

**Input:**
```javascript
{
  name: string,             // Required
  phone: string,            // Required: Unique phone number
  address: string,          // Optional
  gender: string            // Optional: 'male', 'female', 'other'
}
```

**Example:**
```javascript
const { addCustomer } = useStitchPro();

try {
  const customer = await addCustomer({
    name: 'John Doe',
    phone: '+1234567890',
    address: '123 Main St',
    gender: 'male'
  });
  console.log('Customer created:', customer.id);
} catch (err) {
  if (err.message === 'DUPLICATE_PHONE') {
    console.error('Phone number already exists');
  } else {
    console.error('Failed to create customer:', err.message);
  }
}
```

---

#### `updateCustomer(id, data)`
Updates customer information.

**Input:**
```javascript
{
  id: number,
  data: {
    name: string,           // Optional
    phone: string,          // Optional
    address: string,        // Optional
    gender: string          // Optional
  }
}
```

**Example:**
```javascript
const { updateCustomer } = useStitchPro();

await updateCustomer(1, {
  name: 'John Updated',
  address: '456 New St'
});
```

---

#### `deleteCustomer(id)`
Deletes a customer.

**Example:**
```javascript
const { deleteCustomer } = useStitchPro();

await deleteCustomer(1);
```

---

## Error Handling Patterns

### Pattern 1: Try-Catch with Specific Error Codes
```javascript
try {
  await addOrder(data);
} catch (err) {
  const message = err.message;
  
  if (message.includes('Customer ID and items are required')) {
    // Show specific validation error
    showToast('Please select customer and add items', 'error');
  } else if (message.includes('DUPLICATE_PHONE')) {
    showToast('This phone number is already registered', 'error');
  } else if (message.includes('INVALID_STATUS_TRANSITION')) {
    showToast('Cannot skip order stages. Follow the flow.', 'error');
  } else if (message.includes('UNAUTHORIZED')) {
    // Token expired - will be handled by interceptor
    showToast('Session expired. Please login again.', 'error');
  } else if (message.includes('FORBIDDEN')) {
    showToast('You do not have access to this resource', 'error');
  } else {
    showToast(message || 'Operation failed', 'error');
  }
}
```

### Pattern 2: Status-Based Error Handling
```javascript
try {
  await updateOrderStatus(orderId, newStatus);
} catch (err) {
  const errorCode = err.response?.data?.error?.code;
  const message = err.response?.data?.message;
  
  switch (errorCode) {
    case 'INVALID_STATUS_TRANSITION':
      console.error(`Cannot transition to ${newStatus}: ${message}`);
      break;
    case 'ORDER_NOT_FOUND':
      console.error('Order no longer exists');
      break;
    case 'FORBIDDEN':
      console.error('You cannot modify this order');
      break;
    case 'UNAUTHORIZED':
      console.error('Please login again');
      break;
    default:
      console.error('Unexpected error:', message);
  }
}
```

### Pattern 3: Optimistic UI Updates
```javascript
// Update UI immediately
setOrders(prev => prev.map(o => 
  o.id === orderId ? { ...o, status: newStatus } : o
));

// Then sync with backend
try {
  await updateOrderStatus(orderId, newStatus);
} catch (err) {
  // Revert on error
  await fetchOrders();
  showToast('Failed to update status. Reverted changes.', 'error');
}
```

---

## Order API Implementation

### Complete Order Workflow

#### Step 1: Create Order
```javascript
const handleCreateOrder = async (formData) => {
  try {
    const result = await addOrder({
      customerId: formData.customerId,
      items: formData.items.map(item => ({
        type: item.type,
        fabric: item.fabric,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price)
      })),
      deliveryDate: formData.deliveryDate
    });
    
    showToast(`Order #${result.id} created successfully!`, 'success');
    navigation.navigate('OrderDetail', { orderId: result.id });
  } catch (err) {
    showToast(err.message || 'Failed to create order', 'error');
  }
};
```

#### Step 2: Update Order Status
```javascript
const handleAdvanceStatus = async (orderId, currentStatus) => {
  const statusFlow = {
    pending: 'in_progress',
    in_progress: 'ready',
    ready: 'delivered'
  };
  
  const nextStatus = statusFlow[currentStatus];
  if (!nextStatus) {
    showToast('Order is already completed', 'info');
    return;
  }
  
  try {
    await updateOrderStatus(orderId, nextStatus);
    showToast(`Order moved to ${nextStatus}`, 'success');
    await fetchOrders();
  } catch (err) {
    showToast(err.message, 'error');
  }
};
```

#### Step 3: Record Payment
```javascript
const handleRecordPayment = async (orderId, paymentData) => {
  try {
    await recordPayment({
      orderId,
      amount: parseFloat(paymentData.amount),
      paymentMethod: paymentData.method,
      notes: paymentData.notes
    });
    
    showToast('Payment recorded successfully', 'success');
    await fetchOrders(); // Refresh order details
  } catch (err) {
    showToast(err.message || 'Failed to record payment', 'error');
  }
};
```

---

## Component Integration Examples

### OrdersScreen - Fetch and Display
```javascript
export default function OrdersScreen() {
  const { orders, ordersLoading, fetchOrders } = useStitchPro();
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  useEffect(() => {
    loadOrders();
  }, []);
  
  const loadOrders = async () => {
    const statusFilter = selectedStatus === 'All' ? undefined : selectedStatus.toLowerCase();
    await fetchOrders({ status: statusFilter });
  };
  
  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    loadOrders();
  };
  
  if (ordersLoading) {
    return <ActivityIndicator size="large" />;
  }
  
  return (
    <View>
      {/* Status Filter Tabs */}
      {['All', 'Pending', 'In Progress', 'Ready', 'Delivered'].map(status => (
        <TouchableOpacity
          key={status}
          onPress={() => handleStatusChange(status)}
          style={selectedStatus === status ? styles.activeTab : styles.tab}
        >
          <Text>{status}</Text>
        </TouchableOpacity>
      ))}
      
      {/* Orders List */}
      <FlatList
        data={orders}
        renderItem={({ item }) => (
          <OrderCard order={item} />
        )}
        keyExtractor={item => item.id.toString()}
      />
    </View>
  );
}
```

### CreateOrder - Full Implementation
```javascript
export default function CreateOrder({ navigation, route }) {
  const { addOrder, customers, fetchCustomers } = useStitchPro();
  const { showToast } = useToast();
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    fetchCustomers();
  }, []);
  
  const handleAddItem = (item) => {
    if (!item.fabric || !item.price) {
      showToast('Please fill all fields', 'error');
      return;
    }
    setItems([...items, item]);
  };
  
  const handleSubmit = async () => {
    if (!selectedCustomer) {
      showToast('Please select a customer', 'error');
      return;
    }
    
    if (items.length === 0) {
      showToast('Please add at least one item', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const result = await addOrder({
        customerId: selectedCustomer.id,
        items,
        deliveryDate: deliveryDate.toISOString().split('T')[0]
      });
      
      showToast(`Order #${result.id} created!`, 'success');
      navigation.navigate('Orders');
    } catch (err) {
      showToast(err.message || 'Failed to create order', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Customer Selection */}
      <CustomerSelector
        selected={selectedCustomer}
        customers={customers}
        onSelect={setSelectedCustomer}
      />
      
      {/* Items List */}
      <ItemsList
        items={items}
        onAdd={handleAddItem}
        onRemove={(idx) => setItems(items.filter((_, i) => i !== idx))}
      />
      
      {/* Delivery Date */}
      <DatePicker
        value={deliveryDate}
        onChange={setDeliveryDate}
      />
      
      {/* Submit Button */}
      <AppButton
        label="Create Order"
        onPress={handleSubmit}
        loading={loading}
        disabled={!selectedCustomer || items.length === 0}
      />
    </View>
  );
}
```

---

## Testing Checklist

### Create Order API
- [ ] Create order with valid data
- [ ] Verify response includes order ID
- [ ] Verify totalAmount is calculated correctly
- [ ] Verify initial status is "pending"
- [ ] Test with missing customerId (should fail)
- [ ] Test with empty items array (should fail)
- [ ] Test with invalid deliveryDate (should fail)

### Get Orders API
- [ ] Fetch all orders
- [ ] Filter by status (pending, in_progress, ready, delivered)
- [ ] Filter by customerId
- [ ] Paginate results
- [ ] Verify pagination metadata

### Update Order Status API
- [ ] Valid transitions: pending → in_progress
- [ ] Valid transitions: in_progress → ready
- [ ] Valid transitions: ready → delivered
- [ ] Invalid transition: pending → ready (should fail)
- [ ] Invalid transition: pending → delivered (should fail)
- [ ] Update delivered order (should fail)

### Order Detail API
- [ ] Get single order by ID
- [ ] Verify all order details
- [ ] Test with non-existent ID (should fail)

### Update Order API
- [ ] Update items
- [ ] Update deliveryDate
- [ ] Verify totalAmount recalculates
- [ ] Test modifying delivery date for in-progress order

### Delete Order API
- [ ] Delete pending order
- [ ] Verify order removed from list
- [ ] Test deleting non-existent order (should fail)

---

## Common Issues & Solutions

### Issue: "Failed to create order" with no details
**Solution:** Check the console logs in StitchProContext. Verify:
- customerId is a valid number
- items array is not empty
- deliveryDate is valid ISO format (YYYY-MM-DD)

### Issue: Status update fails with "INVALID_STATUS_TRANSITION"
**Solution:** Check current status and ensure you're following the flow:
1. pending → in_progress
2. in_progress → ready
3. ready → delivered

Cannot skip stages or go backwards.

### Issue: "Unauthorized" or "Forbidden" errors
**Solution:** 
- Check if JWT token is being sent in Authorization header
- Verify token is not expired
- Check if user owns the order/customer

### Issue: "DUPLICATE_PHONE" when creating customer
**Solution:** The phone number already exists. Either:
- Use a different phone number
- Find and use existing customer
- Update the existing customer instead

---

## Response Format Reference

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* actual data */ }
}
```

### Error Response
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

### Paginated Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "items": [/* array of items */],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100
    }
  }
}
```

---

**Last Updated:** April 28, 2026
**Version:** 1.0.0
