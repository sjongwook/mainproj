from fastapi import APIRouter, UploadFile, File
from backend.services.supabase_storage import upload_to_supabase

router = APIRouter()

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    """
    업로드된 이미지를 Supabase 스토리지에 저장 후 URL 반환
    """
    image_url = await upload_to_supabase(file)
    return {"image_url": image_url}
