from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.schemas.pets import PetCreate, PetResponse
from backend.services.pets import create_pet, upload_pet_image
from backend.database.session import get_db

router = APIRouter()

@router.post("/pets", response_model=PetResponse)
async def register_pet(
    name: str = Form(...),
    gender: str = Form(...),
    breed: str = Form(...),
    birth_date: str = Form(...),
    weight: float = Form(...),
    is_neutered: bool = Form(...),
    notes: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    """
    반려견 정보 등록 API
    """
    owner_id = 1  # TODO: 실제 로그인된 유저 ID 받아오기 (현재는 하드코딩)

    # 이미지 업로드 및 URL 저장
    image_url = None
    if image:
        image_url = await upload_pet_image(image)

    pet_data = PetCreate(
        name=name,
        gender=gender,
        breed=breed,
        birth_date=birth_date,
        weight=weight,
        is_neutered=is_neutered,
        notes=notes
    )

    new_pet = create_pet(db, pet_data, owner_id, image_url)
    return new_pet
