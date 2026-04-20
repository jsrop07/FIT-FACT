import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Upload, X, Check, Image as ImageIcon } from "lucide-react";

interface UploadedClothes {
  id: string;
  image: string;
  category: string;
  name: string;
  registered: boolean;
}

export function OwnedClothesUpload() {
  const navigate = useNavigate();
  const [uploadedClothes, setUploadedClothes] = useState<UploadedClothes[]>(() => {
    const saved = localStorage.getItem('ownedClothes');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState("top");

  useEffect(() => {
    localStorage.setItem('ownedClothes', JSON.stringify(uploadedClothes));
  }, [uploadedClothes]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newClothesPromises = Array.from(files).map((file, index) => {
        return new Promise<UploadedClothes>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              id: `owned-${Date.now()}-${index}`,
              image: event.target?.result as string, // 영구 보존용 Base64 Text
              category: selectedCategory === "top" ? "Top" : "Bottom",
              name: `내 ${selectedCategory === "top" ? "상의" : "하의"} ${uploadedClothes.length + index + 1}`,
              registered: true, // 편의를 위해 업로드 즉시 등록
            });
          };
          reader.readAsDataURL(file);
        });
      });
      
      const newClothes = await Promise.all(newClothesPromises);
      setUploadedClothes([...uploadedClothes, ...newClothes]);
    }
  };

  const handleRemove = (id: string) => {
    setUploadedClothes(uploadedClothes.filter((item) => item.id !== id));
  };

  const handleUseFitting = (id: string) => {
    // 쿼리 스트링으로 고유 ID를 넘겨서 VTON 탭이 Base64를 가져가게 끔 유도
    navigate(`/outfit-builder?owned_id=${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl text-black mb-2 font-bold">내 옷 업로드</h1>
          <p className="text-gray-600 font-medium">
            보유한 옷을 업로드하고 AI가 어울리는 조합을 추천해드립니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-sm border border-gray-200 p-6 sticky top-24 shadow-sm">
              <h3 className="font-bold text-black mb-4">옷 업로드</h3>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="text-sm font-bold text-gray-700 mb-2 block">
                  카테고리 선택
                </label>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="w-full bg-gray-100 p-1 rounded-sm">
                    <TabsTrigger value="top" className="flex-1 rounded-sm font-bold data-[state=active]:bg-black data-[state=active]:text-white transition-all">
                      상의
                    </TabsTrigger>
                    <TabsTrigger value="bottom" className="flex-1 rounded-sm font-bold data-[state=active]:bg-black data-[state=active]:text-white transition-all">
                      하의
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Upload Zone */}
              <label className="block cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-sm p-8 hover:border-black hover:bg-gray-50 transition-colors">
                  <div className="text-center">
                    <Upload className="w-12 h-12 mx-auto text-black mb-3" />
                    <div className="text-sm font-bold text-black mb-1">
                      클릭하여 이미지 업로드
                    </div>
                    <div className="text-xs font-medium text-gray-500">
                      또는 파일을 드래그하세요
                    </div>
                  </div>
                </div>
              </label>

              {/* Upload Guide */}
              <div className="mt-6 p-4 bg-gray-100 rounded-sm">
                <h4 className="text-sm font-bold text-black mb-2 flex items-center gap-2">
                  <span className="bg-black text-white px-1.5 py-0.5 text-[10px]">GUIDE</span>
                  업로드 가이드
                </h4>
                <ul className="text-xs font-medium text-gray-700 space-y-1.5">
                  <li>• 옷걸이에 걸린 상태로 촬영 (권장)</li>
                  <li>• 단색 혹은 흰색 배경</li>
                  <li>• 한 장에 한 벌만 정면으로</li>
                  <li>• 로고가 잘 보이게 수평 조절</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Right - Uploaded Clothes Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-black text-lg">
                보관함 ({uploadedClothes.length})
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="font-bold rounded-sm border-gray-300 hover:bg-gray-100"
                onClick={() =>
                  setUploadedClothes(uploadedClothes.filter((c) => c.registered))
                }
              >
                초기화
              </Button>
            </div>

            {uploadedClothes.length === 0 ? (
              <div className="bg-white rounded-sm border border-gray-200 p-12 text-center h-96 flex flex-col items-center justify-center shadow-sm">
                <Upload className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-black mb-2">
                  옷장에 옷이 비어있습니다.
                </h3>
                <p className="text-sm font-medium text-gray-500">
                  좌측에서 옷 사진을 추가하여 나만의 코디를 완성해보세요
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {uploadedClothes.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-sm border border-gray-200 overflow-hidden group shadow-sm flex flex-col"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100 border-b border-gray-100">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemove(item.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-white border border-gray-200 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-gray-100"
                      >
                        <X className="w-4 h-4 text-black" />
                      </button>
                      {item.registered && (
                        <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 rounded-sm flex items-center gap-1 text-[10px] font-bold">
                          <Check className="w-3 h-3" />
                          저장됨
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between">
                      <div className="mb-4">
                        <div className="text-xs font-bold text-gray-500 mb-1">
                          {item.category === "Top" ? "상의" : "하의"}
                        </div>
                        <div className="text-sm font-bold text-black line-clamp-1">{item.name}</div>
                      </div>
                      <div className="flex gap-2 w-full mt-auto">
                        <Button
                          size="sm"
                          className="w-full text-xs font-bold rounded-sm bg-black hover:bg-gray-800 text-white"
                          onClick={() => handleUseFitting(item.id)}
                        >
                          VTON 피팅 사용
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
