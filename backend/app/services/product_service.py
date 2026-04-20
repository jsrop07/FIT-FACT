from typing import List, Optional
from app.repositories.product_repository import BaseProductRepository
from app.schemas.product import ProductDetail, ProductFilterParams

class ProductService:
    def __init__(self, repository: BaseProductRepository):
        self.repo = repository
        
    def get_products(self, params: ProductFilterParams) -> List[ProductDetail]:
        products = self.repo.get_all()
        
        # 1. 카테고리 필터
        if params.category:
            products = [p for p in products if p.category.lower() == params.category.lower()]
            
        # 2. 브랜드 필터 (부분 일치)
        if params.brand:
            products = [p for p in products if params.brand.lower() in p.brand.lower()]
            
        # 3. 가격 필터
        if params.min_price is not None:
            products = [p for p in products if p.price >= params.min_price]
        if params.max_price is not None:
            products = [p for p in products if p.price <= params.max_price]
            
        # 4. 페이지네이션
        start = params.offset
        end = start + params.limit
        return products[start:end]

    def get_product_by_id(self, item_id: str) -> Optional[ProductDetail]:
        return self.repo.get_by_id(item_id)
        
    def remove_product_image(self, item_id: str, image_path: str) -> bool:
        return self.repo.remove_image(item_id, image_path)

    def remove_product(self, item_id: str) -> bool:
        return self.repo.remove_product(item_id)
