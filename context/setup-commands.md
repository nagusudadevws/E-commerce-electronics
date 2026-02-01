# Setup Commands & Quick Reference

## Initial Project Setup

### Frontend (Next.js)
```bash
# Create Next.js project
npx create-next-app@latest e-commerce-platform --typescript --tailwind --app --no-src-dir
cd e-commerce-platform

# Install dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install zod react-hook-form @hookform/resolvers
npm install zustand
npm install clsx tailwind-merge

# Run development server
npm run dev
```

### Backend (FastAPI)
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn[standard]
pip install python-dotenv pydantic pydantic-settings
pip install supabase stripe reportlab python-multipart

# Run development server
uvicorn app.main:app --reload --port 8000
```

### Supabase Setup
```bash
# Install Supabase CLI (optional)
npm install -g supabase

# Initialize Supabase project
supabase init

# Link to remote project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### Backend (.env)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
DATABASE_URL=your_database_connection_string
```

## Common Development Commands

### Frontend
```bash
# Development
npm run dev

# Build
npm run build

# Production
npm start

# Lint
npm run lint

# Type check
npm run type-check
```

### Backend
```bash
# Development with auto-reload
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run tests
pytest

# Format code
black .
isort .
```

### Database
```bash
# Run migrations (via Supabase Dashboard SQL Editor)
# Or use Supabase CLI:
supabase db push

# Generate TypeScript types from database
supabase gen types typescript --local > types/database.ts
```

## Git Commands (if using version control)
```bash
# Initialize repository
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Phase 1 - Project Setup & Authentication"

# Create branch for phase
git checkout -b phase-1-setup

# Push to remote
git remote add origin your-repo-url
git push -u origin main
```

## Project Structure Commands

### Create directory structure
```bash
# Frontend structure
mkdir -p app/{auth,dashboard}/{admin,seller,customer}
mkdir -p components/{ui,auth,layout,products,orders,payments}
mkdir -p lib/{supabase,auth,database}
mkdir -p types

# Backend structure
mkdir -p backend/app/{models,routes,services,utils}
```

---

**Note**: These commands should be executed in the project root directory.



