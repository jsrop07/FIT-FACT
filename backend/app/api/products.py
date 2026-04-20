import os
from fastapi import APIRouter, Depends, Query, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from app.schemas.product import ProductDetail, ProductFilterParams
from app.services.product_service import ProductService
from app.repositories.product_repository import JsonProductRepository

router = APIRouter(prefix="/products", tags=["Products"])

class DeleteImageRequest(BaseModel):
    image_path: str

# Dependency Injection Definition
def get_product_service() -> ProductService:
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    json_path = os.path.join(base_dir, "scraper", "data", "musinsa_items.json")
    
    repository = JsonProductRepository(file_path=json_path, base_dir=base_dir)
    return ProductService(repository=repository)

@router.get("/", response_model=List[ProductDetail])
def list_products(
    category: Optional[str] = Query(None, description="Category filter (e.g. Top, Bottom)"),
    brand: Optional[str] = Query(None, description="Brand filter"),
    min_price: Optional[int] = Query(None, description="Min price filter"),
    max_price: Optional[int] = Query(None, description="Max price filter"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: ProductService = Depends(get_product_service)
):
    params = ProductFilterParams(
        category=category, brand=brand, 
        min_price=min_price, max_price=max_price, 
        limit=limit, offset=offset
    )
    return service.get_products(params)

@router.get("/{item_id}", response_model=ProductDetail)
def get_product_detail(
    item_id: str,
    service: ProductService = Depends(get_product_service)
):
    product = service.get_product_by_id(item_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.delete("/{item_id}/images")
def delete_product_image(
    item_id: str,
    req: DeleteImageRequest,
    service: ProductService = Depends(get_product_service)
):
    """
    [수동 큐레이션 모델 연동]
    VTON용으로 부적합한 특정 사진 파일을 완전히 제거합니다.
    """
    success = service.remove_product_image(item_id, req.image_path)
    if not success:
        raise HTTPException(status_code=404, detail="Image or product not found")
    return {"status": "success", "message": f"Deleted {req.image_path}"}

@router.delete("/{item_id}")
def delete_product(
    item_id: str,
    service: ProductService = Depends(get_product_service)
):
    """
    [수동 큐레이션 전체 삭제]
    특정 상품 자체를 DB(JSON)와 이미지 로컬 전체에서 삭제합니다.
    """
    success = service.remove_product(item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"status": "success", "message": f"Deleted product {item_id}"}

