import cloudinary
import cloudinary.uploader
from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

async def upload_file(file_bytes: bytes, folder: str, resource_type: str = "auto", public_id: str = None) -> dict:
    options = {
        "folder": f"careerlens/{folder}",
        "resource_type": resource_type
    }
    if public_id:
        options["public_id"] = public_id
    result = cloudinary.uploader.upload(file_bytes, **options)
    return {
        "url": result["secure_url"],
        "public_id": result["public_id"],
        "resource_type": result["resource_type"],
        "format": result.get("format"),
        "bytes": result.get("bytes")
    }

async def delete_file(public_id: str, resource_type: str = "image") -> dict:
    return cloudinary.uploader.destroy(public_id, resource_type=resource_type)
