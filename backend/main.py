from fastapi import FastAPI
from backend.routers.pets import router as pet_router
from backend.routers.auth import router as auth_router  # ✅ auth 라우터 등록
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# ✅ 하나의 루트 엔드포인트만 유지
@app.get("/")
async def root():
    return {"message": "FastAPI Server is Running"}

# ✅ 라우터 등록 순서 조정
app.include_router(pet_router, prefix="/api", tags=["Pets"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])  # ✅ auth 라우터가 정상적으로 등록되도록 조정


@app.get("/")
async def read_root():
    print(os.environ)  # ✅ 환경 변수를 콘솔에 출력
    return {"message": "FastAPI server is running!"}

# CORS 설정 추가
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 또는 ["http://localhost:3000"] (보안 고려)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)