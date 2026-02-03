# Phase 6: Payment Gateway Integration & Media Upload

---

## Overview

This final phase integrates payment processing capabilities and implements media/file upload functionality. We'll set up the FastAPI backend for payment gateway integration, implement product image uploads using Supabase Storage, and add invoice PDF generation capabilities.

**Duration Estimate**: 4-5 days  
**Dependencies**: Phase 5 (requires complete order flow and product management)

---

## Goals

1. Set up FastAPI backend server
2. Integrate payment gateway (Stripe/Razorpay/PayPal)
3. Implement payment processing endpoints
4. Create product image upload functionality
5. Build invoice PDF generation and download
6. Implement secure file upload validation
7. Add payment status tracking

---

## Features & Components to Develop

### 1. FastAPI Backend Setup
- FastAPI project structure
- CORS configuration
- Environment variable management
- API route organization
- Error handling middleware

### 2. Payment Gateway Integration
- Payment gateway API client
- Payment intent creation
- Payment confirmation
- Webhook handling for payment events
- Payment status updates

### 3. Media Upload System
- Supabase Storage configuration
- Image upload API endpoints
- Image validation and processing
- Image URL generation
- Product image management UI

### 4. Invoice Generation
- PDF invoice template
- Invoice generation service
- Invoice download endpoint
- Invoice storage in Supabase

### 5. Frontend Integration
- Payment form component
- Image upload component
- Invoice download button
- Payment status display

---

## Technical Implementation Details

### Backend Setup (FastAPI)

#### 1. Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── payment.py
│   │   └── upload.py
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── payments.py
│   │   ├── uploads.py
│   │   └── invoices.py
│   ├── services/
│   │   ├── __init__.py
│   │   ├── payment_service.py
│   │   ├── storage_service.py
│   │   └── invoice_service.py
│   └── utils/
│       ├── __init__.py
│       └── validators.py
├── requirements.txt
└── .env
```

#### 2. FastAPI Main Application

**File: `backend/app/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import payments, uploads, invoices
from app.config import settings

app = FastAPI(
    title="E-Commerce API",
    description="Payment Gateway and Media Upload API",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(payments.router, prefix="/api/payments", tags=["payments"])
app.include_router(uploads.router, prefix="/api/uploads", tags=["uploads"])
app.include_router(invoices.router, prefix="/api/invoices", tags=["invoices"])

@app.get("/")
async def root():
    return {"message": "E-Commerce API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

#### 3. Configuration

**File: `backend/app/config.py`**

```python
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Supabase
    SUPABASE_URL: str
    SUPABASE_SERVICE_ROLE_KEY: str
    
    # Payment Gateway (Stripe example)
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str
    
    # CORS
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # File Upload
    MAX_FILE_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]
    
    class Config:
        env_file = ".env"

settings = Settings()
```

#### 4. Payment Service

**File: `backend/app/services/payment_service.py`**

```python
import stripe
from typing import Optional, Dict
from app.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:
    @staticmethod
    async def create_payment_intent(
        amount: float,
        currency: str = "usd",
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Create a payment intent for an order"""
        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount * 100),  # Convert to cents
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={
                    "enabled": True,
                },
            )
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "status": intent.status
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Payment intent creation failed: {str(e)}")
    
    @staticmethod
    async def confirm_payment(payment_intent_id: str) -> Dict:
        """Confirm a payment intent"""
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return {
                "status": intent.status,
                "payment_intent_id": intent.id,
                "amount": intent.amount / 100,  # Convert from cents
            }
        except stripe.error.StripeError as e:
            raise Exception(f"Payment confirmation failed: {str(e)}")
    
    @staticmethod
    async def handle_webhook(payload: bytes, signature: str) -> Dict:
        """Handle Stripe webhook events"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, settings.STRIPE_WEBHOOK_SECRET
            )
            
            if event["type"] == "payment_intent.succeeded":
                payment_intent = event["data"]["object"]
                return {
                    "event_type": "payment_intent.succeeded",
                    "payment_intent_id": payment_intent["id"],
                    "amount": payment_intent["amount"] / 100,
                }
            elif event["type"] == "payment_intent.payment_failed":
                payment_intent = event["data"]["object"]
                return {
                    "event_type": "payment_intent.payment_failed",
                    "payment_intent_id": payment_intent["id"],
                }
            
            return {"event_type": event["type"]}
        except ValueError as e:
            raise Exception(f"Invalid payload: {str(e)}")
        except stripe.error.SignatureVerificationError as e:
            raise Exception(f"Invalid signature: {str(e)}")
```

#### 5. Payment Routes

**File: `backend/app/routes/payments.py`**

```python
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from pydantic import BaseModel
from app.services.payment_service import PaymentService

router = APIRouter()

class PaymentIntentRequest(BaseModel):
    amount: float
    currency: str = "usd"
    order_id: str
    customer_id: Optional[str] = None

class PaymentConfirmRequest(BaseModel):
    payment_intent_id: str
    order_id: str

@router.post("/create-intent")
async def create_payment_intent(request: PaymentIntentRequest):
    """Create a payment intent for an order"""
    try:
        result = await PaymentService.create_payment_intent(
            amount=request.amount,
            currency=request.currency,
            metadata={
                "order_id": request.order_id,
                "customer_id": request.customer_id or "",
            }
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/confirm")
async def confirm_payment(request: PaymentConfirmRequest):
    """Confirm a payment"""
    try:
        result = await PaymentService.confirm_payment(request.payment_intent_id)
        
        # Update order payment status in database
        # This would typically update Supabase via API
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(
    payload: bytes = None,
    stripe_signature: str = Header(None, alias="stripe-signature")
):
    """Handle Stripe webhook events"""
    try:
        result = await PaymentService.handle_webhook(payload, stripe_signature)
        
        # Update order status in database based on webhook event
        # This would typically update Supabase via API
        
        return {"status": "success", "event": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
```

#### 6. Storage Service (Supabase)

**File: `backend/app/services/storage_service.py`**

```python
from supabase import create_client, Client
from typing import Optional
import uuid
from app.config import settings

class StorageService:
    def __init__(self):
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY
        )
    
    async def upload_image(
        self,
        file_content: bytes,
        file_name: str,
        folder: str = "products",
        content_type: str = "image/jpeg"
    ) -> str:
        """Upload an image to Supabase Storage"""
        try:
            # Generate unique file name
            file_extension = file_name.split('.')[-1] if '.' in file_name else 'jpg'
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = f"{folder}/{unique_filename}"
            
            # Upload to Supabase Storage
            self.supabase.storage.from_("product-images").upload(
                file_path,
                file_content,
                file_options={"content-type": content_type}
            )
            
            # Get public URL
            public_url = self.supabase.storage.from_("product-images").get_public_url(file_path)
            
            return public_url
        except Exception as e:
            raise Exception(f"Image upload failed: {str(e)}")
    
    async def delete_image(self, file_path: str) -> bool:
        """Delete an image from Supabase Storage"""
        try:
            # Extract folder and filename from URL or path
            # Implementation depends on how file_path is structured
            self.supabase.storage.from_("product-images").remove([file_path])
            return True
        except Exception as e:
            raise Exception(f"Image deletion failed: {str(e)}")
```

#### 7. Upload Routes

**File: `backend/app/routes/uploads.py`**

```python
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.storage_service import StorageService
from app.config import settings
from app.utils.validators import validate_image_file

router = APIRouter()
storage_service = StorageService()

@router.post("/product-image")
async def upload_product_image(file: UploadFile = File(...)):
    """Upload a product image"""
    try:
        # Validate file
        if not validate_image_file(file):
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Only JPEG, PNG, and WebP are allowed."
            )
        
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Upload to Supabase Storage
        image_url = await storage_service.upload_image(
            file_content=file_content,
            file_name=file.filename,
            folder="products",
            content_type=file.content_type or "image/jpeg"
        )
        
        return {
            "url": image_url,
            "filename": file.filename,
            "size": len(file_content)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 8. Invoice Service

**File: `backend/app/services/invoice_service.py`**

```python
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from typing import Dict
import io
from datetime import datetime

class InvoiceService:
    @staticmethod
    def generate_invoice_pdf(order_data: Dict) -> bytes:
        """Generate a PDF invoice for an order"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        styles = getSampleStyleSheet()
        
        # Title
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        elements.append(Paragraph("INVOICE", title_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Order Information
        order_info = [
            ['Order Number:', order_data.get('order_number', 'N/A')],
            ['Date:', datetime.fromisoformat(order_data.get('created_at', '')).strftime('%B %d, %Y')],
            ['Status:', order_data.get('status', 'N/A').upper()],
        ]
        
        order_table = Table(order_info, colWidths=[2*inch, 4*inch])
        order_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ]))
        elements.append(order_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Order Items
        items_data = [['Product', 'Quantity', 'Unit Price', 'Subtotal']]
        for item in order_data.get('items', []):
            items_data.append([
                f"Product #{item.get('product_id', 'N/A')[:8]}",
                str(item.get('quantity', 0)),
                f"${item.get('unit_price', 0):.2f}",
                f"${item.get('subtotal', 0):.2f}"
            ])
        
        items_table = Table(items_data, colWidths=[3*inch, 1*inch, 1.5*inch, 1.5*inch])
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1f2937')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ]))
        elements.append(items_table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Total
        total_data = [
            ['Subtotal:', f"${order_data.get('total_amount', 0) - order_data.get('shipping_cost', 0):.2f}"],
            ['Shipping:', f"${order_data.get('shipping_cost', 0):.2f}"],
            ['Total:', f"${order_data.get('total_amount', 0):.2f}"],
        ]
        
        total_table = Table(total_data, colWidths=[4*inch, 2*inch])
        total_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (-1, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (-1, -1), (-1, -1), 12),
        ]))
        elements.append(total_table)
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        return buffer.read()
```

#### 9. Invoice Routes

**File: `backend/app/routes/invoices.py`**

```python
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.services.invoice_service import InvoiceService
from typing import Dict

router = APIRouter()
invoice_service = InvoiceService()

@router.get("/generate/{order_id}")
async def generate_invoice(order_id: str, order_data: Dict):
    """Generate and return invoice PDF"""
    try:
        pdf_bytes = invoice_service.generate_invoice_pdf(order_data)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=invoice_{order_id}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

#### 10. Validators

**File: `backend/app/utils/validators.py`**

```python
from fastapi import UploadFile
from app.config import settings

def validate_image_file(file: UploadFile) -> bool:
    """Validate if uploaded file is a valid image"""
    if not file.content_type:
        return False
    return file.content_type in settings.ALLOWED_IMAGE_TYPES
```

#### 11. Requirements

**File: `backend/requirements.txt`**

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-dotenv==1.0.0
pydantic==2.5.0
pydantic-settings==2.1.0
supabase==2.0.0
stripe==7.0.0
reportlab==4.0.7
python-multipart==0.0.6
```

### Frontend Integration

#### 1. Payment Component

**File: `components/payments/PaymentForm.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  amount: number
  orderId: string
  onSuccess: () => void
  onError: (error: string) => void
}

function CheckoutForm({ amount, orderId, onSuccess, onError }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    try {
      // Create payment intent
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          order_id: orderId,
        }),
      })

      const { client_secret } = await response.json()

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (error) {
        onError(error.message || 'Payment failed')
      } else {
        onSuccess()
      }
    } catch (error) {
      onError('An error occurred during payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-300 rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>
      <Button type="submit" className="w-full" isLoading={loading} disabled={!stripe}>
        Pay ${amount.toFixed(2)}
      </Button>
    </form>
  )
}

export default function PaymentForm({ amount, orderId, onSuccess, onError }: PaymentFormProps) {
  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h2>
      <Elements stripe={stripePromise}>
        <CheckoutForm
          amount={amount}
          orderId={orderId}
          onSuccess={onSuccess}
          onError={onError}
        />
      </Elements>
    </Card>
  )
}
```

#### 2. Image Upload Component

**File: `components/products/ImageUpload.tsx`**

```typescript
'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface ImageUploadProps {
  onUploadComplete: (url: string) => void
  currentImageUrl?: string
}

export default function ImageUpload({ onUploadComplete, currentImageUrl }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/product-image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const { url } = await response.json()
      onUploadComplete(url)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {preview && (
        <div className="w-full h-48 border border-gray-300 rounded-lg overflow-hidden">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <Input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && (
        <p className="text-sm text-gray-600">Uploading...</p>
      )}
    </div>
  )
}
```

#### 3. Payment Success Page

**File: `app/payment/success/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('order_id')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    // Fetch order details if orderId is available
    if (orderId) {
      // You can fetch order details here
      setOrderNumber(orderId)
    }
  }, [orderId])

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              Thank you for your purchase. Your order has been confirmed.
            </p>
            {orderNumber && (
              <p className="text-sm text-gray-500 mt-2">
                Order Number: <span className="font-semibold">{orderNumber}</span>
              </p>
            )}
          </div>

          <div className="space-y-3">
            <Link href="/customer/orders">
              <Button className="w-full">View My Orders</Button>
            </Link>
            <Link href="/catalog">
              <Button variant="outline" className="w-full">Continue Shopping</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full">Back to Home</Button>
            </Link>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
```

#### 4. Payment Failure Page

**File: `app/payment/failure/page.tsx`**

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'

export default function PaymentFailurePage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Payment could not be processed'

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-2">
              {error}
            </p>
            <p className="text-sm text-gray-500">
              Please try again or contact support if the problem persists.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={() => window.history.back()} 
              className="w-full"
            >
              Try Again
            </Button>
            <Link href="/catalog">
              <Button variant="outline" className="w-full">Continue Shopping</Button>
            </Link>
            <Link href="/">
              <Button variant="ghost" className="w-full">Back to Home</Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" className="w-full text-sm">Contact Support</Button>
            </Link>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
```

#### 5. Invoice Download

**File: `components/orders/InvoiceDownload.tsx`**

```typescript
'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import type { OrderWithItems } from '@/types/database'

interface InvoiceDownloadProps {
  order: OrderWithItems
}

export default function InvoiceDownload({ order }: InvoiceDownloadProps) {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/generate/${order.id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to generate invoice')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice_${order.order_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      alert('Failed to download invoice')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      isLoading={downloading}
    >
      Download Invoice
    </Button>
  )
}
```

---

## Connection to Previous Phase

**Phase 5 → Phase 6**:
- Product catalog needs image uploads for better UX
- Orders need payment processing to complete the flow
- Customer order history needs invoice download capability

**Phase 0 → Phase 6**:
- Landing page features section mentions "Secure Payments" - payment system implements this
- Payment success/failure pages link back to landing page ("Back to Home" button)
- Payment pages use same Header/Footer components from landing page for consistency
- Payment section can be showcased on landing page as a trust indicator

---

## Testing Checklist

- [ ] FastAPI server starts correctly
- [ ] Payment intent creation works
- [ ] Payment confirmation works
- [ ] Webhook handling works
- [ ] Image upload works
- [ ] Image validation works (file type, size)
- [ ] Invoice PDF generation works
- [ ] Invoice download works
- [ ] Payment form integrates correctly
- [ ] Error handling works for all endpoints
- [ ] CORS configuration allows frontend requests

---

## Deliverables Summary

1. ✅ FastAPI backend server
2. ✅ Payment gateway integration
3. ✅ Payment processing endpoints
4. ✅ Image upload functionality
5. ✅ Invoice PDF generation
6. ✅ Frontend payment form
7. ✅ Frontend image upload component
8. ✅ Invoice download functionality
9. ✅ Payment success page (links to landing page)
10. ✅ Payment failure page (links to landing page)
11. ✅ Landing page integration for payment trust indicators

---

## Environment Variables

Add these to your `.env` files:

**Backend `.env`:**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

**Frontend `.env.local`:**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

---

**Previous Phase**: [Phase 5: Customer Management & Product Catalog](./phase-5.md)  
**Related Phase**: [Phase 0: Landing Page & Public Interface](./phase-0.md)  
**Project Complete**: All 7 phases (0-6) implemented! 🎉


