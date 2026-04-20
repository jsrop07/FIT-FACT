import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Check, Plus, Trash2, ShoppingCart } from "lucide-react";

interface OutfitComparison {
  id: string;
  top: {
    image: string;
    name: string;
    brand: string;
    price: string;
  };
  bottom: {
    image: string;
    name: string;
    brand: string;
    price: string;
  };
  fittingImage: string;
  selected: boolean;
}

export function Comparison() {
  const navigate = useNavigate();
  const [comparisons, setComparisons] = useState<OutfitComparison[]>(() => {
    const saved = localStorage.getItem('outfitComparisons');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('outfitComparisons', JSON.stringify(comparisons));
  }, [comparisons]);

  const toggleSelect = (id: string) => {
    setComparisons(
      comparisons.map((comp) =>
        comp.id === id ? { ...comp, selected: !comp.selected } : comp
      )
    );
  };

  const removeComparison = (id: string) => {
    setComparisons(comparisons.filter((comp) => comp.id !== id));
  };

  const getTotalPrice = (outfit: OutfitComparison) => {
    const topPrice = parseInt(outfit.top.price.replace(/[^0-9]/g, ""));
    const bottomPrice = parseInt(outfit.bottom.price.replace(/[^0-9]/g, ""));
    return (topPrice + bottomPrice).toLocaleString();
  };

  const selectedCount = comparisons.filter((c) => c.selected).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl text-black mb-2">코디 비교</h1>
            <p className="text-gray-600">
              여러 피팅 결과를 비교하고 마음에 드는 조합을 선택하세요
            </p>
          </div>
          <Button
            onClick={() => navigate("/search")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            새 피팅 추가
          </Button>
        </div>

        {comparisons.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg text-gray-900 mb-2">
              비교할 코디가 없습니다
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              가상 피팅을 통해 여러 조합을 만들어보세요
            </p>
            <Button onClick={() => navigate("/search")}>
              피팅 시작하기
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {comparisons.map((outfit) => (
                <div
                  key={outfit.id}
                  className={`bg-white rounded-lg border-2 transition-all ${
                    outfit.selected
                      ? "border-blue-500 shadow-lg"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="p-4">
                    {/* Fitting Result Image */}
                    <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden mb-4">
                      <img
                        src={outfit.fittingImage}
                        alt="Fitting result"
                        className="w-full h-full object-cover"
                      />
                      {outfit.selected && (
                        <div className="absolute top-3 right-3 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <button
                        onClick={() => removeComparison(outfit.id)}
                        className="absolute top-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>

                    {/* Outfit Details */}
                    <div className="space-y-3 mb-4">
                      <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={outfit.top.image}
                          alt={outfit.top.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500">
                            {outfit.top.brand}
                          </div>
                          <div className="text-sm text-black truncate">
                            {outfit.top.name}
                          </div>
                          <div className="text-sm font-medium text-black">
                            {outfit.top.price}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={outfit.bottom.image}
                          alt={outfit.bottom.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500">
                            {outfit.bottom.brand}
                          </div>
                          <div className="text-sm text-black truncate">
                            {outfit.bottom.name}
                          </div>
                          <div className="text-sm font-medium text-black">
                            {outfit.bottom.price}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Total Price */}
                    <div className="p-3 bg-blue-50 rounded-lg mb-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-900">총 금액</span>
                        <span className="text-lg font-medium text-blue-700">
                          {getTotalPrice(outfit)}원
                        </span>
                      </div>
                    </div>

                    {/* Select Button */}
                    <Button
                      variant={outfit.selected ? "default" : "outline"}
                      className="w-full"
                      onClick={() => toggleSelect(outfit.id)}
                    >
                      {outfit.selected ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          선택됨
                        </>
                      ) : (
                        "선택하기"
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Action Bar */}
            {selectedCount > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">
                      {selectedCount}개 코디 선택됨
                    </div>
                    <div className="text-2xl font-medium text-black">
                      총{" "}
                      {comparisons
                        .filter((c) => c.selected)
                        .reduce(
                          (sum, c) =>
                            sum +
                            parseInt(c.top.price.replace(/[^0-9]/g, "")) +
                            parseInt(c.bottom.price.replace(/[^0-9]/g, "")),
                          0
                        )
                        .toLocaleString()}
                      원
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg">
                      장바구니 담기
                    </Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" size="lg">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      선택한 코디 구매
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
