from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.services.invoice_service import InvoiceService
from typing import Dict
import json

router = APIRouter()
invoice_service = InvoiceService()

@router.post("/generate")
async def generate_invoice(order_data: Dict):
    """Generate and return invoice PDF"""
    try:
        pdf_bytes = invoice_service.generate_invoice_pdf(order_data)
        order_number = order_data.get('order_number', 'unknown')
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=invoice_{order_number}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/generate/{order_id}")
async def generate_invoice_by_id(order_id: str):
    """Generate invoice for an order by ID (requires order data from frontend)"""
    raise HTTPException(
        status_code=400,
        detail="Please use POST /api/invoices/generate with order data in request body"
    )




