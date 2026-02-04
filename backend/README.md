# FastAPI Backend - Payment Gateway & Media Upload

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your Supabase and Stripe credentials

3. **Run the server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

## API Endpoints

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Stripe webhook handler

### Uploads
- `POST /api/uploads/product-image` - Upload product image

### Invoices
- `POST /api/invoices/generate` - Generate invoice PDF

## Environment Variables

See `.env.example` for required variables.




