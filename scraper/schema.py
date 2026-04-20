from typing import List, Optional
from pydantic import BaseModel, HttpUrl, Field
from datetime import datetime

class ReviewItem(BaseModel):
    """구매자 리뷰 단위 스키마"""
    text: str = Field(..., description="리뷰 원문 텍스트")
    # 추후 확장 가능 필드 (평점, 작성일자, 작성자 신체 스펙 등)
    rating: Optional[int] = Field(None, description="별점")
    author_spec: Optional[str] = Field(None, description="작성자 신체스펙 (예: 175cm, 65kg)")

class ProductItem(BaseModel):
    """무신사 의류 상품 스키마"""
    # 1. 필수(Mandatory) 식별 및 기본 정보 필드
    item_id: str = Field(..., description="무신사 상품 고유 식별자 (PK 역할)")
    title: str = Field(..., description="상품명")
    brand: str = Field(..., description="브랜드명")
    category: str = Field(..., description="대분류 카테고리 (Top, Bottom 등)")
    price: int = Field(..., description="판매가 (숫자 파싱 완료된 상태)")
    url: HttpUrl = Field(..., description="상품 상세 페이지 URL")
    
    # 2. 필수/선택 데이터 모음
    images: List[str] = Field(default_factory=list, description="로컬에 저장된 썸네일 이미지 상대 경로들")
    reviews: List[str] = Field(default_factory=list, description="구매자 리뷰 텍스트 배열 (가장 기초적인 형태)")
    
    # 3. 메타데이터 (크롤링 시점 등 관리 목적 - 선택이지만 있는 것이 좋음)
    crawled_at: datetime = Field(default_factory=datetime.utcnow, description="데이터 수집 날짜(UTC)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "item_id": "6139293",
                "title": "모두의 수소봉제 반팔 티셔츠 (쿨맥스 원단)",
                "brand": "나이키",
                "category": "Top",
                "price": 29000,
                "url": "https://www.musinsa.com/products/6139293",
                "images": [
                    "assets/Top_Rank1_6139293_thumb1.jpg",
                    "assets/Top_Rank1_6139293_thumb2.jpg"
                ],
                "reviews": [
                    "재질도 시원하고 핏이 예뻐요.",
                    "가성비 정말 좋습니다."
                ],
                "crawled_at": "2026-04-19T15:00:00Z"
            }
        }
