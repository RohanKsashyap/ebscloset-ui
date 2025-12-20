# Frontend-Backend Integration Setup Guide

This guide explains how to run the EBS Closet application with the frontend and backend connected.

## Project Structure

```
ebscloset-ui-main/
├── src/                        # React frontend source
│   ├── services/              # API service files (NEW)
│   │   ├── api.ts            # Axios client with interceptors
│   │   ├── authService.ts    # Authentication API
│   │   ├── productService.ts # Product API
│   │   ├── orderService.ts   # Order API
│   │   ├── newsletterService.ts # Newsletter API
│   │   ├── contactService.ts  # Contact form API
│   │   ├── discountService.ts # Discount code API
│   │   └── adminService.ts    # Admin operations API
│   ├── components/
│   ├── pages/
│   └── ...
├── backend/                    # Express backend
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
├── package.json               # Frontend dependencies
├── .env.example              # Frontend environment template
└── vite.config.ts
```

## Prerequisites

- **Node.js**: v14 or higher
- **npm** or **yarn**
- **MongoDB**: Local or MongoDB Atlas (recommended)

## Setup Instructions

### 1. Backend Setup

#### 1.1 Navigate to backend directory
```bash
cd backend
```

#### 1.2 Install dependencies
```bash
npm install
```

#### 1.3 Create and configure .env file
```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/ebscloset
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ebscloset

JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d

STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### 1.4 Start the backend server
```bash
npm run dev
# Server will run on http://localhost:5000
```

### 2. Frontend Setup

#### 2.1 Return to root directory
```bash
cd ..
```

#### 2.2 Install dependencies (if not already done)
```bash
npm install
```

#### 2.3 Create and configure .env file
Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

The API services will use this URL to connect to the backend.

#### 2.4 Start the frontend development server
```bash
npm run dev
# Frontend will run on http://localhost:5173
```

## API Services Integration

The frontend now includes API service modules that handle all backend communication:

### Available Services

1. **api.ts** - Axios HTTP client with JWT authentication
   - Automatically adds Bearer token from localStorage
   - Handles 401 errors by clearing tokens

2. **authService.ts** - User authentication
   - `register()` - Register new user
   - `login()` - User login
   - `adminLogin()` - Admin login
   - `logout()` - Clear auth tokens
   - `getMe()` - Get current user

3. **productService.ts** - Product management
   - `getAllProducts()` - Get all products with filters
   - `getProduct()` - Get single product
   - `getTrendingProducts()` - Get trending products
   - `getNewArrivals()` - Get new arrival products
   - `addReview()` - Add product review

4. **orderService.ts** - Order management
   - `createOrder()` - Create new order
   - `getOrder()` - Get order details
   - `getMyOrders()` - Get user's orders

5. **newsletterService.ts** - Newsletter subscriptions
   - `subscribe()` - Subscribe to newsletter
   - `unsubscribe()` - Unsubscribe from newsletter

6. **contactService.ts** - Contact form
   - `submit()` - Submit contact form message

7. **discountService.ts** - Discount codes
   - `validateCode()` - Validate discount code

8. **adminService.ts** - Admin operations
   - `getOrders()` - Get all orders
   - `updateOrderStatus()` - Update order status
   - `getProducts()` - Get all products
   - `createProduct()` - Create new product
   - `updateProduct()` - Update product
   - `deleteProduct()` - Delete product
   - `getSubscribers()` - Get newsletter subscribers
   - `getMessages()` - Get contact messages
   - `getDiscounts()` - Get all discount codes
   - `createDiscount()` - Create discount code

## Updated Components

The following components have been updated to use backend APIs:

1. **Contact.tsx** - Uses `contactService.submit()`
2. **NewsletterPopup.tsx** - Uses `newsletterService.subscribe()`
3. **Footer.tsx** - Uses `newsletterService.subscribe()`
4. **Checkout.tsx** - Uses `orderService.createOrder()` and `discountService.validateCode()`

## Running Both Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
npm run dev
```

Visit `http://localhost:5173` in your browser to access the frontend.

## Testing the Integration

### 1. Test Newsletter Subscription
- Go to Footer or NewsletterPopup
- Enter an email and subscribe
- Check backend logs for successful request
- Verify email is stored in MongoDB

### 2. Test Contact Form
- Navigate to `/contact`
- Fill out and submit the form
- Check backend logs
- Verify message is stored in MongoDB

### 3. Test Checkout
- Add items to cart
- Go to checkout
- Apply a discount code (if available)
- Create order
- Verify order is created in MongoDB

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/ebscloset
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
STRIPE_SECRET_KEY=your_key
STRIPE_PUBLISHABLE_KEY=your_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
```

## API Endpoints

All endpoints are prefixed with `http://localhost:5000/api`

### Authentication
- `POST /auth/register` - Register user
- `POST /auth/login` - Login user
- `POST /auth/admin-login` - Admin login
- `GET /auth/me` - Get current user

### Products
- `GET /products` - Get all products
- `GET /products/:id` - Get product by ID
- `GET /products/trending` - Get trending products
- `GET /products/new-arrivals` - Get new arrivals
- `POST /products/:id/reviews` - Add review

### Orders
- `POST /orders` - Create order
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order by ID
- `GET /orders/admin/all` - Get all orders (admin)
- `PUT /orders/:id/status` - Update order status (admin)

### Newsletter
- `POST /newsletter/subscribe` - Subscribe
- `POST /newsletter/unsubscribe` - Unsubscribe
- `GET /newsletter` - Get all subscribers (admin)

### Contact
- `POST /contact` - Submit contact form
- `GET /contact` - Get all messages (admin)

### Discounts
- `GET /discounts/code/:code` - Validate discount code
- `GET /discounts` - Get all discount codes (admin)
- `POST /discounts` - Create discount code (admin)

## Troubleshooting

### CORS Errors
If you see CORS errors, ensure:
1. Backend `.env` has correct `CLIENT_URL=http://localhost:5173`
2. Backend server is running
3. Frontend `VITE_API_URL` matches backend URL

### Connection Refused
If frontend can't connect to backend:
1. Ensure backend is running on port 5000
2. Check `VITE_API_URL` in frontend `.env`
3. Check backend `PORT` in backend `.env`
4. Ensure MongoDB is running

### Missing Data
If APIs return empty data:
1. Check MongoDB connection in backend
2. Verify JWT token is valid
3. Check backend logs for errors
4. Ensure data exists in MongoDB collections

## Next Steps

1. **Setup Admin Dashboard** - Update admin pages to use `adminService`
2. **Implement Payment Gateway** - Integrate Stripe for payments
3. **Setup Email Notifications** - Configure SMTP for order confirmations
4. **Deploy to Production** - Setup backend on cloud (Heroku, Railway, etc.)

## Additional Resources

- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Original integration guide
- [backend/SETUP.md](./backend/SETUP.md) - Backend setup guide
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Axios Documentation](https://axios-http.com/)
