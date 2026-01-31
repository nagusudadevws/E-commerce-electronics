# Architecture & Technical Notes

## System Architecture

```
┌─────────────────┐
│   Next.js App   │  (Frontend - Vercel)
│   (Client)      │
└────────┬────────┘
         │
         ├──────────────┐
         │              │
         ▼              ▼
┌──────────────┐  ┌──────────────┐
│   Supabase  │  │   FastAPI    │
│   (Auth/DB) │  │   (Backend)  │
└──────────────┘  └──────────────┘
         │              │
         │              ├──► Payment Gateway (Stripe)
         │              └──► Supabase Storage (Images)
         │
         ▼
┌──────────────┐
│  PostgreSQL  │
│  (Database)  │
└──────────────┘
```

## Key Architectural Decisions

### 1. Authentication
- **Choice**: Supabase Auth (JWT-based)
- **Reason**: Built-in, secure, handles sessions automatically
- **Implementation**: Server-side and client-side auth helpers

### 2. Database
- **Choice**: Supabase PostgreSQL with RLS
- **Reason**: 
  - Row Level Security for multi-tenant data isolation
  - Real-time capabilities (future use)
  - Built-in API generation

### 3. Backend Separation
- **Choice**: FastAPI for payments/media only
- **Reason**:
  - Payment gateway integration requires server-side secrets
  - File upload processing
  - PDF generation
- **Note**: Most CRUD operations use Supabase directly from frontend

### 4. State Management
- **Choice**: React Context API / Zustand (optional)
- **Reason**: Simple state needs, no complex global state required

### 5. Styling
- **Choice**: Tailwind CSS
- **Reason**: 
  - Rapid development
  - Consistent design system
  - Responsive by default

## Database Design Principles

### 1. Row Level Security (RLS)
Every table has RLS enabled with policies for:
- **Admins**: Full access to all data
- **Sellers**: Access to own products/orders
- **Customers**: Access to own profile/orders
- **Public**: Read-only access to active products/categories

### 2. Foreign Key Relationships
- Cascading deletes where appropriate
- Set NULL for optional relationships
- Indexes on foreign keys for performance

### 3. Data Types
- UUIDs for all primary keys
- DECIMAL for monetary values (precision)
- TIMESTAMP WITH TIME ZONE for dates
- TEXT for flexible string storage

## Security Considerations

### 1. Authentication
- JWT tokens managed by Supabase
- Secure HTTP-only cookies (server-side)
- Token refresh handled automatically

### 2. Authorization
- Role-based access control (RBAC)
- RLS policies enforce data access
- Protected routes on frontend

### 3. API Security
- CORS configuration for FastAPI
- Environment variables for secrets
- Webhook signature verification (Stripe)

### 4. File Uploads
- File type validation
- File size limits (5MB)
- Secure storage in Supabase Storage
- Public URLs for product images

## Performance Optimizations

### 1. Database
- Indexes on frequently queried columns
- Composite indexes for common queries
- Pagination for large datasets

### 2. Frontend
- Next.js Image optimization
- Code splitting by route
- Lazy loading for heavy components
- Skeleton loaders for better UX

### 3. API
- Connection pooling (Supabase handles this)
- Caching strategies (future enhancement)
- Rate limiting (future enhancement)

## Scalability Considerations

### Current Architecture (v1)
- Single Supabase project
- Single FastAPI instance
- Suitable for: Up to 1000 concurrent users

### Future Enhancements
- Database read replicas
- CDN for static assets
- Redis caching layer
- Queue system for background jobs
- Microservices for specific features

## Error Handling Strategy

### Frontend
- Try-catch blocks for async operations
- Error boundaries for React components
- User-friendly error messages
- Loading states for all async operations

### Backend
- HTTP status codes (400, 401, 404, 500)
- Detailed error messages in development
- Generic messages in production
- Logging for debugging

## Monitoring & Logging

### Recommended Tools (Future)
- **Frontend**: Vercel Analytics
- **Backend**: Sentry for error tracking
- **Database**: Supabase Dashboard metrics
- **Payments**: Stripe Dashboard

## Development Workflow

1. **Local Development**
   - Frontend: `npm run dev` (localhost:3000)
   - Backend: `uvicorn app.main:app --reload` (localhost:8000)
   - Database: Supabase local or cloud

2. **Testing**
   - Unit tests: Jest/Vitest
   - Integration tests: Playwright/Cypress
   - API tests: pytest for FastAPI

3. **Deployment**
   - Frontend: Vercel (automatic from Git)
   - Backend: Vercel Serverless Functions or Railway/Render
   - Database: Supabase Cloud

---

**Note**: This architecture is designed for the initial release. Future phases may require adjustments based on scale and requirements.


