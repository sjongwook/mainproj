import uuid
from supabase import create_client
from fastapi import UploadFile
import os

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET_NAME = "pets_images"

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

async def upload_to_supabase(file: UploadFile):
    """
    1) UUID로 파일명 생성
    2) supabase.storage.from_(...).upload(...) 호출
    3) resp 속성을 확인하여 에러 처리
    4) get_public_url()로 공개 URL 반환
    """
    file_ext = file.filename.split(".")[-1]
    file_name = f"{uuid.uuid4()}.{file_ext}"
    file_path = file_name

    # 비동기로 파일 읽기
    file_data = await file.read()

    # 업로드 시도
    resp = supabase.storage.from_(BUCKET_NAME).upload(
        file_path,
        file_data,
        file_options={"content-type": file.content_type}  # 구버전: dict형, 신버전: file_options=...
    )

    # 디버깅용: resp 내부 구조 확인
    print("=== UploadResponse ===")
    print("type(resp):", type(resp))
    print("dir(resp):", dir(resp))
    print("vars(resp):", vars(resp) if hasattr(resp, "__dict__") else "No __dict__")
    print("======================")

    # 1) resp.error가 존재하는 버전인지 체크
    if hasattr(resp, "error") and resp.error:
        # resp.error가 객체인지, 문자열인지도 버전에 따라 다를 수 있음
        err_msg = resp.error.message if hasattr(resp.error, "message") else resp.error
        raise Exception(f"Supabase 업로드 실패 (error 필드): {err_msg}")

    # 2) status_code로 업로드 성공/실패 판단 (대개 200이 성공)
    if hasattr(resp, "status_code") and resp.status_code != 200:
        raise Exception(f"Supabase 업로드 실패 (status_code={resp.status_code})")

    # (필요하다면 resp.data를 확인하여 업로드된 파일 메타데이터를 볼 수도 있음)
    # if hasattr(resp, "data"):
    #     print("resp.data:", resp.data)

    # 업로드가 정상 처리되었다고 가정 → public_url 생성
    public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file_path)
    return public_url
