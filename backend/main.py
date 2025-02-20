from fastapi import FastAPI
from backend.routers.pets import router as pet_router
from backend.routers.auth import router as auth_router
from backend.routers.upload import router as upload_router
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# ✅ 환경 변수 로드
load_dotenv()

app = FastAPI()

# ✅ 하나의 루트 엔드포인트만 유지
@app.get("/")
async def root():
    return {"message": "FastAPI Server is Running"}

# ✅ 라우터 등록
app.include_router(pet_router, prefix="/api", tags=["Pets"])
app.include_router(upload_router, prefix="/upload", tags=["Upload"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])  # ✅ prefix 유지

# ✅ 환경 변수 출력 (개발 중에만 유지)
print("✅ DATABASE_URL:", os.getenv("DATABASE_URL"))

# ✅ CORS 설정 추가 (보안 고려하여 특정 도메인만 허용)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # 프론트엔드 주소만 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ 환경 변수 출력 (개발 중에만 유지)
print("✅ DATABASE_URL:", os.getenv("DATABASE_URL"))