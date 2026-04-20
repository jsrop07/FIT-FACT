# RunPod에서 딥러닝 구동에 최적화된 공식 PyTorch + CUDA 기반 이미지
FROM runpod/pytorch:2.0.1-py3.10-cuda11.8.0-devel

WORKDIR /workspace

# 파이썬 의존성 패키지 복사 및 캐시 무시 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# VTON 실행 스크립트 복사
COPY handler.py .

# 컨테이너 실행 시 handler.py 를 동작시켜 RunPod 서버리스 대기 모드 진입
CMD ["python", "-u", "handler.py"]
