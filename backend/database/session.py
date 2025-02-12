import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# ✅ 특정 경로의 .env를 명확하게 로드
dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(dotenv_path)


DATABASE_URL = os.getenv("DATABASE_URL")

# ✅ 디버깅 로그 추가
print(f"🔹 DATABASE_URL: {DATABASE_URL}")

if DATABASE_URL is None:
    raise ValueError("❌ ERROR: 환경 변수 DATABASE_URL이 설정되지 않았습니다.")

# ✅ 비동기 DB 엔진 생성
engine = create_async_engine(DATABASE_URL, echo=True, future=True)

# ✅ 비동기 세션 팩토리 생성
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# ✅ FastAPI 주입을 위한 DB 세션 생성 함수
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
