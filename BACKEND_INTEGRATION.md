# Backend Integration Guide

## Overview

This document explains how to integrate the MERN backend with the existing React frontend.

## Steps to Integrate

### 1. Start Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

### 2. Create API Client (Frontend)

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Update Authentication

Replace `src/utils/storage.js` auth functions:

```javascript
// src/services/authService.js
import apiClient from './api';

export const authService = {
  register: async (firstName, lastName, email, password) => {
    const response = await apiClient.post('/auth/register', {
      firstName,
      lastName,
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  adminLogin: async (email, password) => {
    const response = await apiClient.post('/auth/admin-login', { email, password });
    if (response.data.token) {
      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },
};
```

### 4. Update Products

```javascript
// src/services/productService.js
import apiClient from './api';

export const productService = {
  getAllProducts: async (filters = {}) => {
    const response = await apiClient.get('/products', { params: filters });
    return response.data.products;
  },

  getProduct: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data.product;
  },

  getTrendingProducts: async () => {
    const response = await apiClient.get('/products/trending');
    return response.data.products;
  },

  getNewArrivals: async () => {
    const response = await apiClient.get('/products/new-arrivals');
    return response.data.products;
  },

  addReview: async (productId, name, rating, comment) => {
    const response = await apiClient.post(`/products/${productId}/reviews`, {
      name,
      rating,
      comment,
    });
    return response.data.product;
  },
};
```

### 5. Update Orders

```javascript
// src/services/orderService.js
import apiClient from './api';

export const orderService = {
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },

  getOrder: async (orderId) => {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data.order;
  },

  getMyOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data.orders;
  },
};
```

### 6. Update Newsletter

```javascript
// src/services/newsletterService.js
import apiClient from './api';

export const newsletterService = {
  subscribe: async (email) => {
    const response = await apiClient.post('/newsletter/subscribe', { email });
    return response.data;
  },

  unsubscribe: async (email) => {
    const response = await apiClient.post('/newsletter/unsubscribe', { email });
    return response.data;
  },
};
```

### 7. Update Contact

```javascript
// src/services/contactService.js
import apiClient from './api';

export const contactService = {
  submit: async (name, email, message) => {
    const response = await apiClient.post('/contact', {
      name,
      email,
      message,
    });
    return response.data;
  },
};
```

### 8. Update Discount Validation

```javascript
// src/services/discountService.js
import apiClient from './api';

export const discountService = {
  validateCode: async (code) => {
    try {
      const response = await apiClient.get(`/discounts/code/${code}`);
      return response.data.code;
    } catch (error) {
      return null;
    }
  },
};
```

### 9. Update Checkout Page

Example of updating `src/pages/Checkout.tsx`:

```typescript
import { orderService } from '../services/orderService';
import { discountService } from '../services/discountService';

export default function Checkout() {
  const handleCheckout = async () => {
    try {
      // Validate discount if provided
      let discountInfo = null;
      if (discountCode) {
        discountInfo = await discountService.validateCode(discountCode);
        if (!discountInfo) {
          alert('Invalid discount code');
          return;
        }
      }

      // Create order
      const result = await orderService.createOrder({
        items: cart.items,
        total: cart.total,
        email,
        discountCode: discountCode || null,
        shipping: shippingData,
      });

      if (result.success) {
        alert('Order created successfully!');
        // Redirect to order confirmation
        navigate(`/order/${result.orderId}`);
      }
    } catch (error) {
      alert('Error creating order: ' + error.message);
    }
  };
}
```

### 10. Create Admin Service

```javascript
// src/services/adminService.js
import apiClient from './api';

export const adminService = {
  getOrders: async () => {
    const response = await apiClient.get('/orders/admin/all');
    return response.data.orders;
  },

  updateOrderStatus: async (orderId, status, trackingNumber) => {
    const response = await apiClient.put(`/orders/${orderId}/status`, {
      status,
      trackingNumber,
    });
    return response.data.order;
  },

  getProducts: async () => {
    const response = await apiClient.get('/products');
    return response.data.products;
  },

  createProduct: async (productData) => {
    const response = await apiClient.post('/products', productData);
    return response.data.product;
  },

  updateProduct: async (productId, productData) => {
    const response = await apiClient.put(`/products/${productId}`, productData);
    return response.data.product;
  },

  deleteProduct: async (productId) => {
    await apiClient.delete(`/products/${productId}`);
  },

  getSubscribers: async () => {
    const response = await apiClient.get('/newsletter');
    return response.data.subscribers;
  },

  getMessages: async () => {
    const response = await apiClient.get('/contact');
    return response.data.messages;
  },

  getDiscounts: async () => {
    const response = await apiClient.get('/discounts');
    return response.data.codes;
  },

  createDiscount: async (discountData) => {
    const response = await apiClient.post('/discounts', discountData);
    return response.data.discount;
  },
};
```

## Key Changes in Frontend

### 1. Remove Supabase imports
Remove all references to Supabase from `src/utils/storage.ts`

### 2. Update CartContext (if using backend persistence)
```typescript
// Optional: Save cart to backend instead of localStorage
const saveCartToBackend = async (items) => {
  // If you want to persist cart to database
};
```

### 3. Update HomePage to use backend
```typescript
import { productService } from '../services/productService';

useEffect(() => {
  const loadProducts = async () => {
    const trending = await productService.getTrendingProducts();
    const arrivals = await productService.getNewArrivals();
    setTrendingProducts(trending);
    setNewArrivals(arrivals);
  };
  loadProducts();
}, []);
```

## Testing the Integration

### 1. Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "test123"
  }'
```

### 2. Test Order Creation
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"id": 1, "name": "Dress", "price": 100, "qty": 1}],
    "total": 100,
    "email": "customer@example.com",
    "shipping": {"firstName": "John", "lastName": "Doe", "address": "123 Main St"}
  }'
```

### 3. Test Newsletter
```bash
curl -X POST http://localhost:5000/api/newsletter/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "subscriber@example.com"}'
```

## Troubleshooting

### CORS Issues
If you get CORS errors:
1. Ensure backend is running on `http://localhost:5000`
2. Frontend on `http://localhost:5173`
3. Check `.env` in backend has correct `CLIENT_URL`

### Token Not Persisting
- Check browser localStorage for `token`
- Verify API client is correctly setting Authorization header

### Products Not Loading
- Ensure backend has products in MongoDB
- Run seed script to add sample products
- Check browser console for API errors

## Next Steps

1. Connect your MongoDB database
2. Add products via admin panel or seed script
3. Test the full checkout flow
4. Configure email notifications
5. Deploy backend to production server
