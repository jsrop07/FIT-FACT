import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Header } from "../components/Header";
import { ProductCard } from "../components/ProductCard";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Search, SlidersHorizontal, User, AlertCircle, Loader2, X } from "lucide-react";
import { Badge } from "../components/ui/badge";
import axios from "axios";

// 백엔드 명세와 일치하는 스키마
interface ServerProduct {
  item_id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  url: string;
  images: string[];
  reviews: string[];
}

export function SearchResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchInput, setSearchInput] = useState(initialQuery); // 검색창 임시 보관용
  
  const [products, setProducts] = useState<ServerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPrice, setSelectedPrice] = useState<string | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedPrice, searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string | number> = {};
      if (selectedCategory === "top") params.category = "Top";
      if (selectedCategory === "bottom") params.category = "Bottom";
      
      if (selectedPrice === "5만원 이하") {
        params.max_price = 50000;
      } else if (selectedPrice === "5-10만원") {
        params.min_price = 50000;
        params.max_price = 100000;
      } else if (selectedPrice === "10만원 이상") {
        params.min_price = 100000;
      }

      const res = await axios.get("http://localhost:8000/products", { params });
      
      let fetchedItems = Array.isArray(res.data) ? res.data : (res.data.items || []);
      if (searchQuery) {
         fetchedItems = fetchedItems.filter((p: ServerProduct) => 
           p.title.includes(searchQuery) || p.brand.includes(searchQuery)
         );
      }
      setProducts(fetchedItems);
    } catch (err) {
      console.error(err);
      setError("상품 데이터를 불러오는데 실패했습니다. 백엔드 서버를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = () => {
    setSearchQuery(searchInput);
  };

  const handleProductSelect = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleGoToBuilder = () => {
    if (selectedProductIds.length > 0) {
      const targetIds = selectedProductIds.join(',');
      navigate(`/outfit-builder?garment_ids=${targetIds}`);
    }
  };

  const togglePriceFilter = (priceText: string) => {
    if (selectedPrice === priceText) {
      setSelectedPrice(null); 
    } else {
      setSelectedPrice(priceText); 
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="검색어를 입력하세요 (예: 와이드 팬츠)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                className="pl-12 h-12 rounded-none border-t-0 border-r-0 border-l-0 border-b-2 border-black focus:ring-0 text-lg bg-gray-50 font-medium"
              />
            </div>
            <Button 
               onClick={handleSearchSubmit} 
               className="h-12 px-8 bg-black hover:bg-gray-800 text-white font-bold rounded-sm shadow-md">
              검색
            </Button>
          </div>
        </div>
      </div>

      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-40 flex-1 w-full transition-all duration-300 ${selectedProductIds.length > 0 ? 'pr-96' : ''}`}>
        <div className="flex gap-8">
          
          {/* Left Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0 space-y-6">
            <div className="bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-black pb-2">
                <User className="w-5 h-5 text-black" />
                <h3 className="font-bold text-black text-lg">내 체형 프로필</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500 font-medium">키</span>
                  <span className="text-black font-bold">175cm</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500 font-medium">몸무게</span>
                  <span className="text-black font-bold">70kg</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-1">
                  <span className="text-gray-500 font-medium">허리둘레</span>
                  <span className="text-black font-bold">32인치</span>
                </div>
                <div className="mt-4 text-center">
                  <Badge className="bg-black text-white hover:bg-gray-800 rounded-sm px-4 py-1">
                    레귤러 체형
                  </Badge>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4 border-b border-black pb-2">
                <SlidersHorizontal className="w-5 h-5 text-black" />
                <h3 className="font-bold text-black text-lg">상세 필터</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-black mb-3 bg-gray-100 px-2 py-1.5 rounded-sm">💰 가격대 필터</div>
                  <div className="space-y-2">
                    {["5만원 이하", "5-10만원", "10만원 이상"].map((price) => (
                      <label key={price} className="flex items-center text-sm cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="mr-3 rounded-sm border-gray-300 text-black focus:ring-black h-4 w-4"
                          checked={selectedPrice === price}
                          onChange={() => togglePriceFilter(price)}
                        />
                        <span className={`font-medium ${selectedPrice === price ? 'text-black font-bold' : 'text-gray-600 group-hover:text-black'}`}>
                          {price}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="mb-6 flex justify-between items-end border-b-2 border-black pb-2">
              <h2 className="text-xl text-black font-bold">
                {searchQuery ? `"${searchQuery}" 검색 결과` : `전체 상품`} 
              </h2>
              <p className="text-gray-500 font-bold text-sm">총 {products.length}개의 상품</p>
            </div>

            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
              <TabsList className="bg-gray-100 p-1 rounded-sm border border-gray-200">
                <TabsTrigger 
                  value="all"
                  className="rounded-sm px-6 font-bold text-gray-500 data-[state=active]:bg-black data-[state=active]:text-white transition-all"
                >전체 (ALL)</TabsTrigger>
                <TabsTrigger 
                  value="top"
                  className="rounded-sm px-6 font-bold text-gray-500 data-[state=active]:bg-black data-[state=active]:text-white transition-all"
                >상의 (TOP)</TabsTrigger>
                <TabsTrigger 
                  value="bottom"
                  className="rounded-sm px-6 font-bold text-gray-500 data-[state=active]:bg-black data-[state=active]:text-white transition-all"
                >하의 (BOTTOM)</TabsTrigger>
              </TabsList>
            </Tabs>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-black" />
                <p className="font-bold">상품 정보를 백엔드에서 불러오는 중입니다...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-red-200 rounded-sm shadow-sm">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-red-500 font-bold">{error}</p>
                <Button onClick={fetchProducts} className="mt-4 bg-black text-white hover:bg-gray-800 rounded-sm shadow-md">다시 시도</Button>
              </div>
            ) : products.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-24 bg-white border border-gray-200 rounded-sm text-center shadow-sm">
                <p className="text-gray-400 font-bold text-lg">조건에 맞는 상품이 없습니다.</p>
              </div>
            ) : (
              <div className={`grid grid-cols-2 gap-x-4 gap-y-8 ${selectedProductIds.length > 0 ? 'lg:grid-cols-2 xl:grid-cols-3' : 'lg:grid-cols-3 xl:grid-cols-4'}`}>
                {products.map((product) => (
                  <ProductCard
                    key={product.item_id}
                    id={product.item_id}
                    name={product.title}
                    brand={product.brand}
                    price={`${product.price.toLocaleString()}원`}
                    image={product.images.length > 0 ? `http://localhost:8000/${product.images[0]}` : "https://via.placeholder.com/300x400?text=No+Image"}
                    productUrl={product.url}
                    badges={[product.category === 'Top' ? '상의' : '하의']}
                    selected={selectedProductIds.includes(product.item_id)}
                    onSelect={handleProductSelect}
                    onFitting={(id) => {
                      handleProductSelect(id);
                      setTimeout(() => navigate(`/outfit-builder?garment_id=${id}`), 300);
                    }}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Right Fixed Drawer - Selected Items Gallery */}
      <div 
        className={`fixed top-0 right-0 h-full w-[400px] bg-white border-l border-gray-200 shadow-[0_0_40px_rgba(0,0,0,0.1)] z-40 transition-transform duration-300 transform ${
          selectedProductIds.length > 0 ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-5 h-full flex flex-col pt-24">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
            <h3 className="font-bold text-lg text-black">선택 아이템 보관함</h3>
            <Badge className="bg-black text-white font-bold">{selectedProductIds.length}</Badge>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-5 pr-2 pb-24 custom-scrollbar">
            {selectedProductIds.slice().reverse().map(id => {
              const sp = products.find(p => p.item_id === id);
              if (!sp) return null;
              return (
                <div key={id} className="space-y-2 pb-5 border-b border-gray-100 last:border-0 last:pb-0 relative group">
                  <button 
                    onClick={() => handleProductSelect(id)}
                    className="absolute top-1 right-1 bg-white border border-gray-200 w-6 h-6 flex items-center justify-center rounded-sm z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  <p className="font-bold text-sm text-black leading-tight pr-6">{sp.brand}</p>
                  <p className="font-medium text-xs text-gray-500 leading-tight line-clamp-1 truncate">{sp.title}</p>
                  
                  {sp.images.length > 0 ? (
                    <div className="flex overflow-x-auto gap-2 pb-2 custom-scrollbar snap-x snap-mandatory">
                      {sp.images.map((imgUrl, idx) => (
                        <div key={idx} className="flex-shrink-0 w-32 aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden border border-gray-200 snap-center first:ml-0">
                          <img src={`http://localhost:8000/${imgUrl}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/4] bg-gray-50 flex items-center justify-center border border-gray-200 rounded-sm">
                      <p className="text-xs text-gray-400 font-bold">이미지 없음</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] z-50 animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-white flex items-center gap-3">
                <Badge className="bg-white text-black font-extrabold text-base px-3 py-1">{selectedProductIds.length}</Badge> 
                <span>개의 상품이 선택되었습니다</span>
              </div>
              <Button
                onClick={handleGoToBuilder}
                className="bg-white text-black hover:bg-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all px-12 py-7 text-lg font-bold rounded-sm shadow-lg"
              >
                가상 코디(VTON) 완성하기
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
