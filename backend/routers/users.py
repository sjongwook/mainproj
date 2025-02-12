from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from database.session import get_db
from services.users import get_all_users
from schemas.users import UserResponse
from typing import List

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

@router.get("/", response_model=List[UserResponse])
async def read_users(db: AsyncSession = Depends(get_db)):
    return await get_all_users(db)