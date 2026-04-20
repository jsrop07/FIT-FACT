import os
from fastapi import APIRouter, Form, UploadFile, File, HTTPException
from dotenv import load_dotenv

# 클라이언트 호출 전용 서비스 불러오기
from app.services.runpod_pod_client import request_runpod_tryon

load_dotenv()

router = APIRouter(prefix="/fitting", tags=["Fitting"])

# .env에서 URL 로드
RUNPOD_POD_URL = os.getenv("RUNPOD_POD_URL")

@router.post("")
async def create_virtual_fitting(
    user_image: UploadFile = File(..., description="User's full body picture"),
    top_image_url: str = Form(None, description="URL of the top garment image"),
    bottom_image_url: str = Form(None, description="URL of the bottom garment image"),
    top_image_base64: str = Form(None, description="Base64 encoded top garment image"),
    bottom_image_base64: str = Form(None, description="Base64 encoded bottom garment image")
):
    try:
        # 어느 형태로든 상/하의 중 하나는 존재해야 함
        has_top = top_image_url or top_image_base64
        has_bottom = bottom_image_url or bottom_image_base64
        
        if not has_top and not has_bottom:
            raise HTTPException(status_code=400, detail="최소한 상의 또는 하의 중 하나의 이미지를 전송해야 합니다.")

        # 1. 사용자 사진 객체를 bytes 메모리로 읽어들임
        user_bytes = await user_image.read()

        # 2. 모듈화된 RunPod Client 서비스 함수 호출 (Base64 변환 및 통신은 내부에서 전담)
        result_b64 = await request_runpod_tryon(
            runpod_url=RUNPOD_POD_URL,
            user_image_bytes=user_bytes,
            top_url=top_image_url,
            bottom_url=bottom_image_url,
            top_b64=top_image_base64,
            bottom_b64=bottom_image_base64
        )

        return {
            "status": "success",
            "result_image_url": result_b64
        }
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        print(f"[Error] Fitting API failed: {str(e)}")
        raise HTTPException(status_code=500, detail="서버 내부 오류가 발생했습니다.")
