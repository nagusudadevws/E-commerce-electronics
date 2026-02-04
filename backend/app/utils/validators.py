from fastapi import UploadFile
from app.config import settings

def validate_image_file(file: UploadFile) -> bool:
    """Validate if uploaded file is a valid image"""
    if not file.content_type:
        return False
    return file.content_type in settings.ALLOWED_IMAGE_TYPES

def validate_file_size(file_size: int) -> bool:
    """Validate if file size is within limits"""
    return file_size <= settings.MAX_FILE_SIZE




