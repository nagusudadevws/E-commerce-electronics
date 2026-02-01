# Quick Reference Guide

## File Locations

### Documentation
- **PRD**: `/multi_vendor_ecommerce_prd.md`
- **Development Phases**: `/development-phases/`
- **Context/Reference**: `/context/`

### Code Structure (After Implementation)
```
e-commerce-platform/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (dashboard)/        # Dashboard pages
│   └── catalog/           # Public catalog
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── auth/             # Auth components
│   └── layout/           # Layout components
├── lib/                  # Utilities
│   ├── supabase/         # Supabase clients
│   ├── auth/             # Auth utilities
│   └── database/         # Database queries
└── types/                # TypeScript types

backend/
├── app/
│   ├── main.py           # FastAPI app
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── models/           # Data models
└── requirements.txt
```

## Common Tasks

### Add a New Product
1. Navigate to `/admin/products/new`
2. Fill in product details
3. Upload image (optional)
4. Save

### Update Order Status
1. Navigate to `/admin/orders/[id]`
2. Click "Update Status" button
3. Confirm status change

### View Customer Orders
- Admin: `/admin/customers/[id]`
- Customer: `/customer/orders`

### Process Payment
1. Customer adds products to cart
2. Checkout flow
3. Payment form at `/checkout`
4. Stripe processes payment
5. Order created with payment status

## API Endpoints Reference

### Supabase (Direct)
- Products: `supabase.from('products').select()`
- Orders: `supabase.from('orders').select()`
- Customers: `supabase.from('customers').select()`

### FastAPI Backend
- `POST /api/payments/create-intent` - Create payment
- `POST /api/payments/confirm` - Confirm payment
- `POST /api/payments/webhook` - Payment webhook
- `POST /api/uploads/product-image` - Upload image
- `GET /api/invoices/generate/{order_id}` - Get invoice PDF

## Database Tables Quick Reference

| Table | Primary Use | Key Fields |
|-------|-------------|------------|
| profiles | User profiles | id, email, role |
| vendors | Seller info | id, user_id, business_name |
| products | Product catalog | id, vendor_id, name, price, stock |
| categories | Product categories | id, name, slug |
| customers | Customer profiles | id, user_id, address |
| orders | Order records | id, customer_id, status, total_amount |
| order_items | Order line items | id, order_id, product_id, quantity |

## Environment Variables Checklist

### Required for Frontend
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_API_URL`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Required for Backend
- [ ] `SUPABASE_URL`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `ALLOWED_ORIGINS`

## Troubleshooting

### Authentication Issues
- Check Supabase project settings
- Verify environment variables
- Check RLS policies

### Database Connection Issues
- Verify Supabase URL and keys
- Check network connectivity
- Review RLS policies

### Payment Issues
- Verify Stripe keys
- Check webhook configuration
- Review payment intent status

### Image Upload Issues
- Check file size (max 5MB)
- Verify file type (JPEG, PNG, WebP)
- Check Supabase Storage bucket permissions

## Useful Commands

```bash
# Start frontend
npm run dev

# Start backend
uvicorn app.main:app --reload

# Check TypeScript errors
npm run type-check

# Format code
npm run format  # or prettier --write .

# Run tests
npm test  # Frontend
pytest    # Backend
```

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Stripe Docs**: https://stripe.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

---

**Last Updated**: 2024



