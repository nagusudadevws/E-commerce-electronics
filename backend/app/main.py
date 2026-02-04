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




