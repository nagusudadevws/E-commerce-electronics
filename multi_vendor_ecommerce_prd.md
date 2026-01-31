
# Multi-Vendor Electronics & IoT E-Commerce Platform
## Product Requirements Document (PRD) + README

---

## Overview
This project is an admin-focused multi-vendor e-commerce platform for Electronics & IoT devices.
Admins and sellers manage products, orders, and customers through a centralized dashboard.

Tech Stack:
- Frontend: Next.js
- Backend: FastAPI
- Database/Auth: Supabase (PostgreSQL)
- Hosting: Vercel

---

## Goals
- Admin-first product, order, and customer management
- Secure authentication and role-based access
- Scalable architecture for multi-vendor growth
- Real-time inventory and order tracking

## Non-Goals
- Customer mobile app (v1)
- Multi-currency support (initial release)
- AI recommendations (future phase)

---

## User Roles
- Admin: Full system control
- Seller (Vendor): Manage own products and orders
- Customer: Browse products and place orders

---

## System Architecture
Client (Next.js)
→ FastAPI REST APIs
→ Supabase (DB, Auth, Storage)

---

## Admin Module

### Authentication
- Supabase Auth (JWT-based)
- Role-based access control

### Dashboard
- Total products
- Total orders
- Revenue summary
- Low stock alerts

### Product Management
- Add product
- Edit product
- Delete product

#### Product Fields
- Name
- Price
- Category
- Stock
- Status (Active / Inactive)

### Order Management
- View all orders
- Update order status:
  - Pending
  - Packed
  - Shipped
  - Delivered
- Order history

### Customer Management
- View registered customers
- View customer-wise order history

---

## Product Catalog
- User-facing product listing page
- Category-based browsing

---

## Optional Features
- Product image upload (Supabase Storage)
- Search & filter (price, category, status)
- Invoice PDF download

---

## API Design (Sample)
POST   /api/auth/login  
GET    /api/products  
POST   /api/products  
PUT    /api/products/{id}  
DELETE /api/products/{id}  
GET    /api/orders  
PUT    /api/orders/{id}/status  

---

## Database Tables
- users
- vendors
- products
- orders
- order_items
- customers

---

## Security
- JWT authentication
- Supabase Row Level Security (RLS)
- HTTPS enforcement
- Secure file uploads

---

## Future Enhancements
- Vendor payouts
- Analytics dashboard
- Mobile app
- AI-based product recommendations

---

## README

### Local Development

Frontend:
npm install
npm run dev

Backend:
pip install -r requirements.txt
uvicorn main:app --reload

### Environment Variables
NEXT_PUBLIC_SUPABASE_URL  
NEXT_PUBLIC_SUPABASE_ANON_KEY  
SUPABASE_SERVICE_ROLE_KEY  
DATABASE_URL  

---

Author: Nagu  
Status: Ready for Development
