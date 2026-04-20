from typing import List, Optional
from pydantic import BaseModel

class ProductDetail(BaseModel):
    item_id: str
    title: str
    brand: str
    category: str
    price: int
    url: str
    images: List[str] = []
    reviews: List[str] = []

class ProductFilterParams(BaseModel):
    category: Optional[str] = None
    brand: Optional[str] = None
    min_price: Optional[int] = None
    max_price: Optional[int] = None
    limit: int = 20
    offset: int = 0
