from pydantic import BaseModel
from typing import Optional

class PaymentIntentRequest(BaseModel):
    amount: float
    currency: str = "usd"
    order_id: str
    customer_id: Optional[str] = None

class PaymentConfirmRequest(BaseModel):
    payment_intent_id: str
    order_id: str

class PaymentResponse(BaseModel):
    client_secret: Optional[str] = None
    payment_intent_id: Optional[str] = None
    status: str




