# Multi-Vendor Electronics & IoT E-Commerce Platform

A modern, scalable e-commerce platform for Electronics & IoT devices built with Next.js, Supabase, and FastAPI.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
e-commerce-website-3/
├── app/                    # Next.js app directory
│   ├── about/             # About page
│   ├── contact/           # Contact page
│   ├── privacy/           # Privacy policy page
│   ├── terms/             # Terms of service page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── landing/           # Landing page components
│   ├── layout/            # Layout components (Header, Footer)
│   └── ui/                # Reusable UI components
├── lib/
│   ├── supabase/          # Supabase client configuration
│   └── utils/             # Utility functions
├── development-phases/     # Development documentation
└── context/               # Reference materials
```

## 🎨 Features

### Phase 0: Landing Page & Public Interface ✅
- Modern, responsive landing page
- Hero section with clear value proposition
- Features showcase
- Product categories preview
- Statistics/Trust indicators
- Call-to-action sections
- About, Contact, Terms, and Privacy pages

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Database & Auth**: Supabase (PostgreSQL)
- **State Management**: Zustand (optional)
- **Form Handling**: React Hook Form + Zod

## 📚 Documentation

- **Development Phases**: See `development-phases/` folder
- **UI/UX Guidelines**: `development-phases/UI_UX_Guidelines.md`
- **Setup Commands**: `context/setup-commands.md`
- **Architecture Notes**: `context/architecture-notes.md`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📝 Development Phases

This project follows a phased development approach:

- ✅ **Phase 0**: Landing Page & Public Interface
- ⏳ **Phase 1**: Project Setup & Authentication (Next)
- ⏳ **Phase 2**: Database Schema & Core Models
- ⏳ **Phase 3**: Admin Dashboard & Product Management
- ⏳ **Phase 4**: Order Management System
- ⏳ **Phase 5**: Customer Management & Product Catalog
- ⏳ **Phase 6**: Payment Gateway Integration & Media Upload

## 🔐 Environment Variables

Required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📄 License

This project is private and proprietary.

## 👤 Author

Nagu

---

**Status**: Phase 0 Complete ✅ | Ready for Phase 1

# E-commerce-electronics
