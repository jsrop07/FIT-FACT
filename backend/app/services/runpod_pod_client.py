import base64
import os
import httpx
from fastapi import HTTPException

# main.py 실행 기준 최상단(c:\fit) 방향으로 이동 (scraper 접근용)
# 현재 파일 위치: c:\fit\backend\app\services\runpod_pod_client.py
# 4번 올라가면 c:\fit 이 됩니다.
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

def encode_image_bytes_to_b64(image_bytes: bytes) -> str:
    """바이트 배열을 Base64 포맷으로 변경"""
    encoded = base64.b64encode(image_bytes).decode('utf-8')
    return f"data:image/jpeg;base64,{encoded}"

def encode_local_image_to_b64(image_url: str) -> str:
    """로컬 파일 경로(scraper/assets/...)를 읽어 Base64 포맷으로 변경"""
    if not image_url:
        return None
    
    garment_path = os.path.join(BASE_DIR, "scraper", image_url.replace("/", os.sep))
    if not os.path.exists(garment_path):
        raise HTTPException(status_code=404, detail=f"서버에 상품 이미지 {image_url}가 존재하지 않습니다.")

    with open(garment_path, "rb") as f:
        return encode_image_bytes_to_b64(f.read())

async def request_runpod_tryon(runpod_url: str, user_image_bytes: bytes, top_url: str = None, bottom_url: str = None, top_b64: str = None, bottom_b64: str = None) -> str:
    """
    RunPod Proxy VTON 서버(/tryon)에 HTTP Post를 날려 추론 수행.
    프론트엔드에서 수신한 URL(로컬 에셋)과 Base64(내가 올린 옷)를 알아서 적절히 판단해 조립합니다.
    """
    if not runpod_url or "여기에" in runpod_url:
        import asyncio
        print("[MOCK] RunPod URL이 없습니다. 3초 대기 후 임시 이미지를 반환합니다.")
        await asyncio.sleep(3)
        return "https://images.unsplash.com/photo-1503683701315-4a63dd6c36b6?w=400"

    print(f"[*] Requesting VTON to {runpod_url} ...")
    
    payload = {
        "human_image": encode_image_bytes_to_b64(user_image_bytes)
    }
    
    # 상의 우선순위: 사용자가 올린 직렬화 Base64 > URL 기반 로컬 탐색
    if top_b64:
        payload["top_image"] = top_b64
    elif top_url:
        payload["top_image"] = encode_local_image_to_b64(top_url)
    
    # 하의 우선순위: 사용자가 올린 직렬화 Base64 > URL 기반 로컬 탐색
    if bottom_b64:
        payload["bottom_image"] = bottom_b64
    elif bottom_url:
        payload["bottom_image"] = encode_local_image_to_b64(bottom_url)

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(runpod_url, json=payload)
            response.raise_for_status()

            data = response.json()
            if data.get("status") == "success":
                return data.get("result_image_url")
            else:
                raise HTTPException(status_code=500, detail=f"VTON 서버 상태가 성공이 아닙니다: {data}")

    except httpx.ReadTimeout:
        raise HTTPException(status_code=504, detail="VTON 서버 응답 시간 초과 (120초 초과).")
    except httpx.RequestError as exc:
        raise HTTPException(status_code=502, detail=f"VTON 서버와 통신 중 에러가 발생했습니다: {exc}")
