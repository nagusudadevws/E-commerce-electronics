from fastapi import APIRouter, HTTPException, Header, Request
from typing import Optional
from app.models.payment import PaymentIntentRequest, PaymentConfirmRequest
from app.services.payment_service import PaymentService

router = APIRouter()

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
        
        # Note: Order status update should be handled by the frontend
        # or via webhook after payment confirmation
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature")
):
    """Handle Stripe webhook events"""
    if not stripe_signature:
        raise HTTPException(status_code=400, detail="Missing stripe-signature header")
    
    try:
        payload = await request.body()
        result = await PaymentService.handle_webhook(payload, stripe_signature)
        
        # Note: Order status update should be implemented here
        # based on the webhook event type
        
        return {"status": "success", "event": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))




