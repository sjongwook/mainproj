import requests
import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from passlib.context import CryptContext
from backend.database.session import get_db
from backend.models import User

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Supabase JWT를 검증하고 현재 로그인된 사용자 UUID(supabase user id) 반환
    """
    token = credentials.credentials
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_SERVICE_ROLE_KEY,  # Supabase Auth 호출 시 필요
    }
    resp = requests.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Supabase JWT")
    user_data = resp.json()
    return user_data["id"]  # Supabase에서 발급한 UUID

router = APIRouter()

class SignupRequest(BaseModel):
    user_id: str       # 로그인용 ID
    email: str
    password: str
    name: str
    phone_number: str
    address: str
    nickname: str

class LoginRequest(BaseModel):
    user_id: str
    password: str

@router.post("/signup")
async def signup(request: SignupRequest, db: AsyncSession = Depends(get_db)):
    """
    1) Supabase auth.users에 회원가입
    2) 로컬 DB users 테이블에 동일 UUID 저장
    """
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "email": request.email,
        "password": request.password,
        "data": {
            "name": request.name,
            "phone_number": request.phone_number,
            "address": request.address,
            "nickname": request.nickname,
            # user_id를 저장하고 싶으면 user_metadata에 넣을 수도 있음
        }
    }
    resp = requests.post(f"{SUPABASE_URL}/auth/v1/signup", headers=headers, json=payload)
    if resp.status_code != 200:
        raise HTTPException(status_code=resp.status_code, detail="회원가입 실패")

    user_data = resp.json()
    supabase_uuid = user_data["id"]  # Supabase UUID

    # 로컬 DB 저장
    new_user = User(
        uuid_id = supabase_uuid,
        user_id = request.user_id,
        name=request.name,
        email=request.email,
        phone_number=request.phone_number,
        address=request.address,
        nickname=request.nickname,
        # user_id = request.user_id  # 필요하다면
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return {"message": "회원가입 완료", "user_id": supabase_uuid}

@router.post("/login")
async def login(request: LoginRequest):
    """
    1) user_id -> email
    2) Supabase 로그인
    3) JWT 반환
    """
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {SUPABASE_ANON_KEY}",
        "Content-Type": "application/json"
    }
    # user_id => email
    r = requests.get(f"{SUPABASE_URL}/rest/v1/users?user_id=eq.{request.user_id}", headers=headers)
    if r.status_code != 200 or not r.json():
        raise HTTPException(status_code=401, detail="잘못된 아이디")

    email = r.json()[0]["email"]

    # Supabase 로그인
    payload = {"email": email, "password": request.password}
    login_r = requests.post(f"{SUPABASE_URL}/auth/v1/token?grant_type=password", headers=headers, json=payload)
    if login_r.status_code != 200:
        raise HTTPException(status_code=401, detail="로그인 실패")

    return login_r.json()  # { access_token, ... }

@router.get("/me")
async def get_current_user_info(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    현재 로그인된 사용자 정보
    """
    token = credentials.credentials
    headers = {
        "Authorization": f"Bearer {token}",
        "apikey": SUPABASE_ANON_KEY
    }
    resp = requests.get(f"{SUPABASE_URL}/auth/v1/user", headers=headers)
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid Supabase JWT")

    user_data = resp.json()
    user_metadata = user_data.get("user_metadata", {})
    return {
        "id": user_data["id"],
        "email": user_data["email"],
        "name": user_metadata.get("name", "Unknown")
    }
