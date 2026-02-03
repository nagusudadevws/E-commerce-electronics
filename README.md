# Multi-Vendor Electronics & IoT E-Commerce Platform

## Project Structure

This project is organized into separate frontend and backend directories:

```
.
├── frontend/          # Next.js frontend application
├── backend/          # FastAPI backend application
├── supabase/          # Database migrations and Supabase configuration
├── docs/              # Documentation files
└── README.md          # This file
```

## Frontend

The frontend is a Next.js application located in the `frontend/` directory.

### Getting Started

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

### Frontend Structure

```
frontend/
├── app/              # Next.js app directory (pages and routes)
├── components/       # React components
├── lib/              # Utility functions and helpers
├── types/            # TypeScript type definitions
├── context/          # React context providers
└── package.json      # Frontend dependencies
```

## Backend

The backend is a FastAPI application located in the `backend/` directory.

### Getting Started

```bash
cd backend
pip3 install -r requirements.txt
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### Backend Structure

```
backend/
├── app/
│   ├── main.py       # FastAPI application entry point
│   ├── routes/       # API route handlers
│   ├── services/     # Business logic services
│   ├── models/       # Data models
│   └── utils/        # Utility functions
└── requirements.txt  # Python dependencies
```

## Database

Database migrations are located in the `supabase/` directory.

## Documentation

All documentation files are located in the `docs/` directory, including:
- Setup guides
- Development phase documentation
- Troubleshooting guides
- API documentation

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage

## Environment Variables

### Frontend

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend

Create a `.env` file in the `backend/` directory:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Development

See the `docs/` directory for detailed development guides and phase documentation.

## License

Private project
