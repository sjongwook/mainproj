from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

# ✔ 라우터 임포트
from backend.routers.pets import router as pet_router
from backend.routers.auth import router as auth_router
from backend.routers.upload import router as upload_router

load_dotenv()

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "FastAPI Server is Running"}

# ✔ 라우터 등록
app.include_router(pet_router, prefix="/api/pets", tags=["Pets"])
app.include_router(upload_router, prefix="/api/upload", tags=["Upload"])
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])

# ✔ CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("✅ DATABASE_URL:", os.getenv("DATABASE_URL"))
