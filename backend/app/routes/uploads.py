from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.storage_service import StorageService
from app.config import settings
from app.utils.validators import validate_image_file, validate_file_size

router = APIRouter()

# Initialize storage service
try:
    storage_service = StorageService()
except Exception as e:
    storage_service = None
    print(f"Warning: Storage service not initialized: {e}")

@router.post("/product-image")
async def upload_product_image(file: UploadFile = File(...)):
    """Upload a product image"""
    if not storage_service:
        raise HTTPException(
            status_code=503,
            detail="Storage service not configured. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
        )
    
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
        if not validate_file_size(len(file_content)):
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        # Upload to Supabase Storage
        image_url = await storage_service.upload_image(
            file_content=file_content,
            file_name=file.filename or "image.jpg",
            folder="products",
            content_type=file.content_type or "image/jpeg"
        )
        
        return {
            "url": image_url,
            "filename": file.filename,
            "size": len(file_content)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




