# 시스템 아키텍처 (ARCHITECTURE)

## 1. 시스템 구조 개요
프론트엔드(React)는 사용자 인터페이스와 상호작용 및 이미지 업로드를 전담하며, 백엔드(FastAPI)가 비즈니스 로직과 Data Storage 그리고 LangGraph 오케스트레이션을 중앙 제어합니다.
1인 개발과 로컬 하드웨어 한계(사용자의 로컬 MX450 GPU 등)를 극복하기 위해, 비교적 가벼운 작업(ChromaDB 검색, API 중계, 단순 LangGraph 제어)은 FastAPI 기반의 로컬 환경에서 처리하고, 고부하 VTON 렌더링(fashn-vton-1.5) 및 대규모 모델 학습은 RunPod와 같은 별도 클라우드 인스턴스로 위임하는 분산(하이브리드) 아키텍처를 채택합니다.

## 2. 주요 컴포넌트 구조

### 2.1 Backend / API Layer (FastAPI) [로컬 위치]
* **엔드포인트 연동:** React 클라이언트의 검색, VTON 피팅 시뮬레이션, 이미지 파일 업로드 요청 수신
* **LangGraph 게이트웨이:** 사용자 요청에 맞춰 복합적인 생성 및 검색 프로세스 그래프를 트리거
* **비동기 타임아웃 관리:** VTON 피팅 시 30초 내외의 시간 제약을 최우선으로 하여, RunPod로 던진 작업에 대해 무거운 블로킹을 피하고 효율적인 폴링(Polling) 또는 웹소켓 처리 가능

### 2.2 Agent Orchestrator (LangGraph - State Architecture) [로컬 위치]
각 노드가 거대한 Pipeline 안에서 State(상태)를 주고받으며 동작합니다.
* **Query Parser Node:** 질의가 들어오면 이를 분석해 필터 속성이나 메타데이터로 형태론적/의미론적 구문 분석
* **Search Node:** 구조화된 쿼리와 Dense 벡터를 결합하여 ChromaDB에 Hybrid Search(Vector Similarity + Metadata Filter)를 요청
* **Reranking Node:** 리뷰 및 구매자 평가 요약 데이터를 바탕으로 초기 검색 결과를 우선순위 기반 재정렬
* **VTON Scoring Node:** VTON 모델에 상품과 인간 이미지를 넘기기 직전, 어떤 입력 이미지가 제일 피팅에 유리할지 자동 스코어링하여 최적 이미지를 선택

### 2.3 Data Storage & Retrieval [로컬 위치]
* **Vector DB (ChromaDB):** 별도 웹 스크래핑을 통해 모은 무신사 상의/하의 스크래핑 데이터(이미지 메타정보, 리뷰, 텍스트 스타일 특징 임베딩 등) 연동 저장소
* **Local Storage / File System:** 프론트엔드가 업로드한 사용자 체형 보유 의류의 임시 캐시 및 저장 관리

### 2.4 External AI / Compute Group (RunPod / HF API) [클라우드 / 외부 연동]
* **VTON 모델 (`fashn-vton-1.5`):** RunPod 서버리스(예: GPU 컨테이너) 혹은 외부 API 서비스에 탑재하여, FastAPI의 요청에 따라 VTON 인퍼런스를 단방향으로 던지고 처리한 뒤 반환. 30초 이내에 결과를 회신하는 것이 목표.

## 3. 핵심 데이터 흐름 (Data Flow) - 피팅 워크플로우
1. **[User -> React]** 무신사 상/하의 검색 조합 및 본인 체형/전신 사진 업로드
2. **[React -> FastAPI]** 데이터 수신 후 LangGraph Fitting Pipeline 시작
3. **[LangGraph - VTON Scoring]** 보유 의류 이미지와 신체 사진 중 어떤 포즈/각도가 합성에 적합한지 스코어링 필터링
4. **[FastAPI -> RunPod (VTON)]** 선별 최적화된 사진 조합을 `fashn-vton-1.5` 추론을 위한 RunPod 환경으로 HTTP/gRPC 호출
5. **[RunPod -> FastAPI]** 30초 내 생성된 결과의 이미지 링크 혹은 Base64 리턴
6. **[FastAPI -> React]** 가공된 최종 응답이 사용자 브라우저에 실시간으로 표시 완료
