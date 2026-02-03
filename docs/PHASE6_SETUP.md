# Phase 6: Payment Gateway & Media Upload Setup Guide

## Overview

Phase 6 implements payment processing and media upload functionality. This requires setting up a FastAPI backend server and configuring payment gateway credentials.

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

**Note:** If `pip3` is not found, use `python3 -m pip install -r requirements.txt` instead.

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe Configuration (for payment processing)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# CORS (allow frontend to access API)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# API URL
API_URL=http://localhost:8000
```

### 3. Start the Backend Server

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

### 4. Verify Backend is Running

Visit `http://localhost:8000/health` - should return `{"status": "healthy"}`

## Frontend Setup

### 1. Add Environment Variables

Add to your `.env.local` file:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Stripe Publishable Key (for payment forms)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2. Supabase Storage Setup

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `product-images`
3. Set bucket to **Public** (or configure RLS policies)
4. Enable file uploads

**Bucket Settings:**
- Name: `product-images`
- Public: Yes (or configure RLS)
- File size limit: 5MB
- Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`

## Stripe Setup (Optional - for production)

### 1. Create Stripe Account

1. Go to https://stripe.com
2. Create an account
3. Get your API keys from Dashboard → Developers → API keys

### 2. Configure Webhooks

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-backend-url.com/api/payments/webhook`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook signing secret to `.env`

### 3. Test Mode

For development, use Stripe test keys:
- Test publishable key starts with `pk_test_`
- Test secret key starts with `sk_test_`

## Features Implemented

### Backend (FastAPI)

1. **Payment Processing**
   - `POST /api/payments/create-intent` - Create payment intent
   - `POST /api/payments/confirm` - Confirm payment
   - `POST /api/payments/webhook` - Handle Stripe webhooks

2. **Image Upload**
   - `POST /api/uploads/product-image` - Upload product images to Supabase Storage

3. **Invoice Generation**
   - `POST /api/invoices/generate` - Generate PDF invoice

### Frontend

1. **Shopping Cart**
   - Cart context with localStorage persistence
   - Add/remove items
   - Update quantities
   - Cart icon with item count

2. **Checkout Flow**
   - `/cart` - Shopping cart page
   - `/checkout` - Checkout with address forms
   - `/payment` - Payment processing page
   - `/payment/success` - Payment success page
   - `/payment/failure` - Payment failure page

3. **Image Upload**
   - Image upload component for products
   - Integrated into product create/edit forms
   - Preview and validation

4. **Invoice Download**
   - Invoice download button on order detail pages
   - PDF generation via backend API

## Testing

### Test Shopping Cart

1. Go to `/catalog`
2. Click on a product
3. Click "Add to Cart"
4. Go to `/cart` to view cart
5. Update quantities or remove items
6. Click "Proceed to Checkout"

### Test Checkout

1. Go to `/checkout` (requires login)
2. Fill in shipping address
3. Review order summary
4. Click "Proceed to Payment"

### Test Payment

1. On payment page, click "Complete Payment"
2. Order will be created with pending status
3. Payment will be simulated (in demo mode)
4. Redirects to success page

### Test Image Upload

1. Go to Admin Dashboard → Products → Add Product
2. Scroll to "Product Image" section
3. Click "Choose File" and select an image
4. Image will upload to Supabase Storage
5. Preview will show uploaded image
6. Save product with image URL

### Test Invoice Download

1. Go to Admin Dashboard → Orders
2. Click on a delivered order
3. Click "Download Invoice" button
4. PDF invoice will be generated and downloaded

## Troubleshooting

### Backend won't start

- Check Python version (3.8+): `python3 --version`
- Verify all dependencies installed: `pip3 install -r requirements.txt` (or `python3 -m pip install -r requirements.txt`)
- Check `.env` file exists and has correct values
- If `pip3` command not found, use `python3 -m pip` instead

### Image upload fails

- Verify Supabase Storage bucket `product-images` exists
- Check bucket is public or RLS policies allow uploads
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check file size (max 5MB) and type (JPEG, PNG, WebP only)

### Payment fails

- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend server is running
- Verify Stripe keys are configured (or use demo mode)
- Check browser console for errors

### Invoice download fails

- Verify backend server is running
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify order has items and complete data
- Check browser console for errors

## Demo Mode

The payment system currently runs in **demo mode**:
- Payment intents are created but not actually processed
- Orders are created with `payment_status: 'pending'`
- After "payment", order status is updated to `packed` and payment to `paid`

For production, integrate Stripe Elements for actual payment collection.

## Next Steps

1. Set up Stripe account and get API keys
2. Configure webhooks for payment events
3. Integrate Stripe Elements for secure payment forms
4. Test end-to-end payment flow
5. Set up Supabase Storage bucket
6. Test image uploads

## Files Created

### Backend
- `backend/app/main.py` - FastAPI application
- `backend/app/config.py` - Configuration
- `backend/app/services/payment_service.py` - Payment service
- `backend/app/services/storage_service.py` - Storage service
- `backend/app/services/invoice_service.py` - Invoice service
- `backend/app/routes/payments.py` - Payment routes
- `backend/app/routes/uploads.py` - Upload routes
- `backend/app/routes/invoices.py` - Invoice routes

### Frontend
- `lib/context/CartContext.tsx` - Shopping cart state management
- `components/products/ImageUpload.tsx` - Image upload component
- `components/orders/InvoiceDownload.tsx` - Invoice download component
- `app/cart/page.tsx` - Shopping cart page
- `app/checkout/page.tsx` - Checkout page
- `app/payment/page.tsx` - Payment page
- `app/payment/success/page.tsx` - Payment success page
- `app/payment/failure/page.tsx` - Payment failure page

## Notes

- Payment processing is in demo mode - integrate Stripe Elements for production
- Image uploads require Supabase Storage bucket setup
- Invoice generation requires backend server to be running
- All payment pages link back to landing page as per Phase 0 requirements

