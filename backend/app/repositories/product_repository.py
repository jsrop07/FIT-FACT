import json
import os
from typing import List, Optional
from abc import ABC, abstractmethod
from app.schemas.product import ProductDetail

class BaseProductRepository(ABC):
    @abstractmethod
    def get_all(self) -> List[ProductDetail]:
        pass
    
    @abstractmethod
    def get_by_id(self, item_id: str) -> Optional[ProductDetail]:
        pass

    @abstractmethod
    def remove_product(self, item_id: str) -> bool:
        pass

    @abstractmethod
    def remove_image(self, item_id: str, image_path: str) -> bool:
        pass

class JsonProductRepository(BaseProductRepository):
    def __init__(self, file_path: str, base_dir: str):
        self.file_path = file_path
        self.base_dir = base_dir
        self._cache = None
        
    def _load_data(self) -> List[ProductDetail]:
        if self._cache is not None:
            return self._cache
            
        if not os.path.exists(self.file_path):
            return []
            
        with open(self.file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            self._cache = [ProductDetail(**item) for item in data]
        return self._cache
        
    def _save_data(self):
        if self._cache is None:
            return
        data = [item.model_dump() for item in self._cache]
        with open(self.file_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
    def get_all(self) -> List[ProductDetail]:
        return self._load_data()
        
    def get_by_id(self, item_id: str) -> Optional[ProductDetail]:
        for item in self._load_data():
            if item.item_id == item_id:
                return item
        return None
        
    def remove_image(self, item_id: str, image_path: str) -> bool:
        found = False
        for item in self._load_data():
            if item.item_id == item_id:
                if image_path in item.images:
                    item.images.remove(image_path)
                    found = True
                    break
                    
        if found:
            self._save_data() # JSON 덤프 업데이트
            # 물리적 파일 삭제 연동
            physical_path = os.path.join(self.base_dir, "scraper", image_path.replace("/", os.sep))
            if os.path.exists(physical_path):
                try:
                    os.remove(physical_path)
                except Exception:
                    pass
            return True
        return False
        
    def remove_product(self, item_id: str) -> bool:
        original_length = len(self._load_data())
        # 해당 제품의 사진 물리 삭제 처리
        product_to_delete = next((item for item in self._cache if item.item_id == item_id), None)
        if product_to_delete:
            for img in product_to_delete.images:
                physical_path = os.path.join(self.base_dir, "scraper", img.replace("/", os.sep))
                if os.path.exists(physical_path):
                    try: os.remove(physical_path)
                    except: pass
                    
        self._cache = [item for item in self._cache if item.item_id != item_id]
        if len(self._cache) < original_length:
            self._save_data()
            return True
        return False
