from supabase import create_client, Client
from typing import Optional
import uuid
from app.config import settings

class StorageService:
    def __init__(self):
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise Exception("Supabase configuration not found")
        
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
            response = self.supabase.storage.from_("product-images").upload(
                file_path,
                file_content,
                file_options={"content-type": content_type}
            )
            
            # Get public URL
            public_url_response = self.supabase.storage.from_("product-images").get_public_url(file_path)
            
            return public_url_response
        except Exception as e:
            raise Exception(f"Image upload failed: {str(e)}")
    
    async def delete_image(self, file_path: str) -> bool:
        """Delete an image from Supabase Storage"""
        try:
            # Extract filename from URL if needed
            if '/' in file_path:
                # If it's a full path like "products/uuid.jpg"
                self.supabase.storage.from_("product-images").remove([file_path])
            else:
                # If it's just a filename, assume it's in products folder
                self.supabase.storage.from_("product-images").remove([f"products/{file_path}"])
            return True
        except Exception as e:
            raise Exception(f"Image deletion failed: {str(e)}")




