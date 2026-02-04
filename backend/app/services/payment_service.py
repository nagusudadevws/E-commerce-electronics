import stripe
from typing import Optional, Dict
from app.config import settings

# Initialize Stripe
if settings.STRIPE_SECRET_KEY:
    stripe.api_key = settings.STRIPE_SECRET_KEY

class PaymentService:
    @staticmethod
    async def create_payment_intent(
        amount: float,
        currency: str = "usd",
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Create a payment intent for an order"""
        if not settings.STRIPE_SECRET_KEY:
            raise Exception("Stripe secret key not configured")
        
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
        if not settings.STRIPE_SECRET_KEY:
            raise Exception("Stripe secret key not configured")
        
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
        if not settings.STRIPE_SECRET_KEY or not settings.STRIPE_WEBHOOK_SECRET:
            raise Exception("Stripe configuration not complete")
        
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




