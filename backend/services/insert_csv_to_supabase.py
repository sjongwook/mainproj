import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client

# 환경 변수 로드
load_dotenv()

# Supabase 연결 정보 가져오기
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

# Supabase 클라이언트 생성
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# 현재 스크립트 실행 파일의 절대 경로 가져오기
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# CSV 파일 경로 설정 (절대 경로)
csv_files = {
    "users": os.path.join(BASE_DIR, "userDB.csv"),
    "pets": os.path.join(BASE_DIR, "petDB.csv"),
    "trainers": os.path.join(BASE_DIR, "trainersDB.csv")
}

# 각 CSV 파일을 Supabase 테이블에 삽입
for table, file_path in csv_files.items():
    try:
        # CSV 파일이 존재하는지 확인
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"파일을 찾을 수 없습니다: {file_path}")

        # CSV 파일 로드
        df = pd.read_csv(file_path)

        # 데이터 삽입
        response = supabase.table(table).insert(df.to_dict(orient="records")).execute()

        print(f"✅ {table} 테이블에 데이터 삽입 성공:", response)
    except Exception as e:
        print(f"❌ {table} 테이블 삽입 실패:", e)
