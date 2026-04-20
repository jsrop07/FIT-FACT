import { useState, useEffect } from "react";
import axios from "axios";
import { Header } from "../components/Header";
import { Trash2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

interface Product {
  item_id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  url: string;
  images: string[];
}

export function Curation() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:8000/products?limit=100");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDeleteImage = async (itemId: string, imagePath: string) => {
    try {
      await axios.delete(`http://localhost:8000/products/${itemId}/images`, {
        data: { image_path: imagePath }
      });
      
      // 즉각적인 프론트엔드 UI 상태 업데이트 (로컬 캐시 반영)
      setProducts(prevProducts => 
        prevProducts.map(product => {
          if (product.item_id === itemId) {
            return {
              ...product,
              images: product.images.filter(img => img !== imagePath)
            };
          }
          return product;
        })
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("이미지 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteProduct = async (itemId: string) => {
    if (!window.confirm("이 상품과 소속된 모든 사진을 영구 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8000/products/${itemId}`);
      setProducts(prev => prev.filter(p => p.item_id !== itemId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("상품 삭제 중 오류가 발생했습니다.");
    }
  };

  const filteredProducts = products.filter((product) => {
    if (selectedCategory === "all") return true;
    return product.category.toLowerCase() === selectedCategory.toLowerCase();
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-black border-b pb-4">
            어드민 옷 사진 검수 (Curation)
          </h2>
          <p className="text-gray-600 mt-2">VTON에 부적합한 사진을 클릭하여 서버 JSON 및 로컬 파일 시스템에서 완전히 영구 폐기시킵니다.</p>
        </div>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="bg-gray-100 border border-gray-200 p-1 rounded-lg inline-flex">
            <TabsTrigger 
              value="all" 
              className="px-6 py-2 rounded-md font-bold text-gray-500 hover:text-black hover:bg-gray-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              전체
            </TabsTrigger>
            <TabsTrigger 
              value="top" 
              className="px-6 py-2 rounded-md font-bold text-gray-500 hover:text-black hover:bg-gray-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              상의 (Top)
            </TabsTrigger>
            <TabsTrigger 
              value="bottom" 
              className="px-6 py-2 rounded-md font-bold text-gray-500 hover:text-black hover:bg-gray-300 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            >
              하의 (Bottom)
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {loading ? (
          <div className="text-gray-500">데이터를 불러오는 중입니다...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-10 text-gray-400 bg-white border border-gray-200 rounded-lg">
            해당 카테고리에 표시할 상품이 없습니다.
          </div>
        ) : (
          <div className="space-y-12">
            {filteredProducts.map(product => (
              <div key={product.item_id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-black">{product.title}</h3>
                    <p className="text-sm text-gray-500">{product.brand} | {product.category} | {product.price.toLocaleString()}원</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteProduct(product.item_id)}
                      className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                    >
                      상품 전체 삭제
                    </Button>
                    <a href={product.url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm">무신사 상품 보기</Button>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {product.images.map((img, idx) => (
                    <div key={`${product.item_id}-${idx}`} className="relative group rounded-md overflow-hidden bg-gray-100 aspect-[3/4]">
                      <img 
                        src={`http://localhost:8000/${img}`} 
                        alt={`${product.title} 썸네일`} 
                        className="w-full h-full object-cover"
                      />
                      {/* Hover Overlay & Delete Button */}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button 
                          onClick={() => handleDeleteImage(product.item_id, img)}
                          className="bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors shadow-lg transform hover:scale-110"
                          title="이 사진 삭제하기"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {product.images.length === 0 && (
                    <div className="col-span-full py-6 text-center text-red-400 bg-red-50 rounded-md font-medium border border-red-100">
                      선택된 이미지가 없습니다 (모두 삭제됨)
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
