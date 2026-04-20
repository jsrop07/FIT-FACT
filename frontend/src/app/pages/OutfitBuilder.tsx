import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Play, Upload, Loader2, ArrowLeft, RefreshCw, Scissors, Check } from "lucide-react";
import axios from "axios";

// 백엔드 명세
interface ServerProduct {
  item_id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  url: string;
  images: string[];
}

export function OutfitBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const garmentIdsParam = searchParams.get("garment_ids") || searchParams.get("garment_id");
  const garmentIds = garmentIdsParam ? garmentIdsParam.split(',') : [];
  
  // 내 옷(Base64) 전용 파라미터 확인
  const ownedIdParam = searchParams.get("owned_id");

  const [garments, setGarments] = useState<ServerProduct[]>([]);
  // 각 상품별로 유저가 클릭한 썸네일(이미지)의 인덱스 보관
  const [selectedImageIndex, setSelectedImageIndex] = useState<Record<string, number>>({});
  
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userImagePreview, setUserImagePreview] = useState<string | null>(null);
  
  const [isFitting, setIsFitting] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [savedToGallery, setSavedToGallery] = useState(false);

  useEffect(() => {
    // 1. 커스텀 의류(Base64) 로딩 분기
    if (ownedIdParam) {
      const saved = localStorage.getItem('ownedClothes');
      if (saved) {
        const parsed = JSON.parse(saved);
        const target = parsed.find((c: any) => c.id === ownedIdParam);
        if (target) {
          const mockProduct: ServerProduct = {
            item_id: target.id,
            title: target.name,
            brand: "내 옷장",
            category: target.category,
            price: 0,
            url: "",
            images: [target.image] // Base64 그대로 투입
          };
          setGarments([mockProduct]);
          return;
        }
      }
    }

    // 2. 무신사 DB 의류 로딩 분기
    if (garmentIds.length > 0) {
      Promise.all(garmentIds.map(id => axios.get(`http://localhost:8000/products/${id}`)))
        .then(responses => setGarments(responses.map(res => res.data)))
        .catch(err => {
          console.error("상품 로딩 실패", err);
          alert("상품 데이터를 불러올 수 없습니다.");
        });
    }
  }, [garmentIdsParam, ownedIdParam]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImageFile(file);
      setUserImagePreview(URL.createObjectURL(file));
      setResultImage(null);
      setSavedToGallery(false);
    }
  };

  const handleStartFitting = async () => {
    if (garments.length === 0) {
      alert("상품 정보가 없습니다.");
      return;
    }
    if (!userImageFile) {
      alert("우측 패널에서 회원님의 전신 사진을 업로드해주세요.");
      return;
    }

    setIsFitting(true);
    setResultImage(null);
    setSavedToGallery(false);

    try {
      const formData = new FormData();
      formData.append("user_image", userImageFile);
      
      const top = garments.find(g => g.category.toLowerCase() === 'top');
      const bottom = garments.find(g => g.category.toLowerCase() === 'bottom');

      const appendGarment = (g: ServerProduct, type: 'top'|'bottom') => {
        const activeIdx = selectedImageIndex[g.item_id] || 0;
        const targetImage = g.images[activeIdx];
        if (targetImage.startsWith('data:image')) {
          formData.append(`${type}_image_base64`, targetImage);
        } else {
          formData.append(`${type}_image_url`, targetImage);
        }
      };

      if (top && top.images.length > 0) appendGarment(top, 'top');
      if (bottom && bottom.images.length > 0) appendGarment(bottom, 'bottom');

      const res = await axios.post("http://localhost:8000/fitting", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      if (res.data.status === "success") {
        setResultImage(res.data.result_image_url);
        
        // 피팅 결과 보관소 (버그 수정: 없는 쪽은 undefined로 처리)
        const savedComparisons = JSON.parse(localStorage.getItem('outfitComparisons') || '[]');
        
        const formatGalleryImage = (g: ServerProduct | undefined) => {
           if (!g || g.images.length === 0) return '';
           const activeIdx = selectedImageIndex[g.item_id] || 0;
           return g.images[activeIdx].startsWith("data:image") ? g.images[activeIdx] : `http://localhost:8000/${g.images[activeIdx]}`;
        };

        savedComparisons.push({
          id: Date.now().toString(),
          top: {
            image: formatGalleryImage(top),
            name: top ? top.title : '선택 안 됨',
            brand: top ? top.brand : '',
            price: top ? `${top.price.toLocaleString()}원` : '0원'
          },
          bottom: {
             image: formatGalleryImage(bottom),
             name: bottom ? bottom.title : '선택 안 됨',
             brand: bottom ? bottom.brand : '',
             price: bottom ? `${bottom.price.toLocaleString()}원` : '0원'
          },
          fittingImage: res.data.result_image_url,
          selected: false
        });
        localStorage.setItem('outfitComparisons', JSON.stringify(savedComparisons));
        setSavedToGallery(true);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "피팅 서버 통신 중 오류가 발생했습니다.");
    } finally {
      setIsFitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="flex items-center gap-4 mb-8 border-b-2 border-black pb-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="p-2 hover:bg-gray-200 rounded-sm">
            <ArrowLeft className="w-5 h-5 text-black" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-black flex items-center gap-2">
              <Scissors className="w-6 h-6" /> 가상 피팅(VTON) 적용하기
            </h1>
            <p className="text-gray-500 font-medium text-sm mt-1">선택하신 옷을 내 몸에 직접 입혀보세요.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left - Selected Garment */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 p-5 shadow-sm max-h-[800px] overflow-y-auto">
              <h3 className="font-bold text-black border-b border-black pb-2 mb-4 flex justify-between">
                타겟 옷 (Target)
                <span className="bg-black text-white px-2 py-0.5 rounded-sm text-xs">{garments.length}벌</span>
              </h3>
              {garments.length > 0 ? (
                <div className="space-y-6">
                  {garments.map(garment => {
                    const activeIdx = selectedImageIndex[garment.item_id] || 0;
                    const activeImgSrc = garment.images[activeIdx].startsWith('data:image') 
                      ? garment.images[activeIdx] 
                      : `http://localhost:8000/${garment.images[activeIdx]}`;

                    return (
                      <div key={garment.item_id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                        <div className="aspect-[3/4] bg-gray-100 mb-2 border border-gray-200 relative group">
                          {garment.images.length > 0 && (
                            <img
                              src={activeImgSrc}
                              alt={garment.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute top-2 right-2 bg-white border border-gray-200 px-2 py-1 text-xs font-bold rounded-sm shadow-sm">
                            {garment.category === "Top" ? "상의" : "하의"}
                          </div>
                        </div>

                        {/* 추가 이미지 서브 썸네일 갤러리 */}
                        {garment.images.length > 1 && (
                          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {garment.images.map((img, idx) => {
                              const thumbSrc = img.startsWith('data:image') ? img : `http://localhost:8000/${img}`;
                              return (
                                <img 
                                  key={idx}
                                  src={thumbSrc}
                                  onClick={() => setSelectedImageIndex(prev => ({...prev, [garment.item_id]: idx}))}
                                  className={`flex-shrink-0 w-12 h-16 object-cover cursor-pointer rounded-sm border-2 transition-all ${
                                    activeIdx === idx ? "border-black scale-105" : "border-gray-200 hover:border-gray-400 opacity-60 hover:opacity-100"
                                  }`}
                                />
                              )
                            })}
                          </div>
                        )}

                        <div className="mt-2 text-xs text-gray-500 font-bold">{garment.brand}</div>
                        <div className="text-sm text-black font-bold mt-1 line-clamp-2 leading-tight">{garment.title}</div>
                        <div className="font-bold text-black mt-2 text-lg">
                          {garment.price.toLocaleString()}원
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center bg-gray-50 border border-dashed border-gray-300">
                  <p className="text-gray-400 text-sm font-bold">선택한 옷이 없습니다.</p>
                </div>
              )}
            </div>
            
            <Button
              variant="outline"
              className="w-full font-bold border-gray-300 rounded-sm"
              onClick={() => navigate("/search")}
            >
              <RefreshCw className="w-4 h-4 mr-2" /> 무신사 옷 다시 고르기
            </Button>
          </div>

          {/* Center - VTON Preview */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-gray-200 p-5 shadow-sm min-h-[600px] flex flex-col">
              <h3 className="font-bold text-black border-b border-black pb-2 mb-4 text-center">피팅 결과 미리보기</h3>
              
              <div className="flex-1 bg-gray-100 rounded-sm flex items-center justify-center relative overflow-hidden border border-gray-200">
                {isFitting ? (
                  <div className="flex flex-col items-center justify-center text-center p-6">
                    <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
                    <p className="font-bold text-lg text-black">클라우드 AI 파드를 호출하는 중...</p>
                    <p className="text-sm text-gray-500 mt-2">GPU 상태에 따라 약 20~120초 소요됩니다.</p>
                  </div>
                ) : resultImage ? (
                  <div className="w-full h-full relative group">
                    <img
                      src={resultImage}
                      alt="Fitting Result"
                      className="w-full h-full object-contain"
                    />
                    {savedToGallery && (
                      <div className="absolute top-4 left-4 right-4 bg-green-500 text-white font-bold px-4 py-3 text-center shadow-lg rounded-sm animate-in fade-in slide-in-from-top-4">
                        <Check className="w-5 h-5 inline mr-2 align-text-bottom" />
                        피팅 결과가 [비교하기] 보관함에 자동 저장되었습니다!
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-white rounded-full shadow-sm">
                    <Scissors className="w-12 h-12 text-black mx-auto mb-4" />
                    <p className="text-black font-bold text-base">우측에 전신 사진을 업로드 한 뒤,</p>
                    <p className="text-black font-bold text-base mt-1">실행 버튼을 눌러 피팅을 시작하세요.</p>
                  </div>
                )}
              </div>
              
              {resultImage && (
                <div className="mt-4 flex gap-4">
                  <Button 
                    variant="outline" 
                    className="flex-1 font-bold border-gray-300 rounded-sm h-12 hover:bg-gray-100 text-black"
                    onClick={() => navigate("/comparison")}
                  >
                    이동하여 비교 보관함 보기
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right - User Avatar Upload */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white border border-gray-200 p-5 shadow-sm">
              <h3 className="font-bold text-black border-b border-black pb-2 mb-4">내 전신 사진 (Person)</h3>
              
              <div className="mb-4">
                {userImagePreview ? (
                  <div className="aspect-[3/4] bg-gray-100 border border-gray-200 relative group">
                    <img
                      src={userImagePreview}
                      alt="User Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label className="cursor-pointer bg-white text-black font-bold px-4 py-2 rounded-sm text-sm border-2 border-transparent hover:border-black">
                        사진 변경
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-black transition-colors">
                    <Upload className="w-8 h-8 text-black mb-2" />
                    <span className="text-sm font-bold text-black border-b border-black">얼굴/몸 업로드</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
                <p className="text-xs text-gray-400 mt-3 font-medium break-keep leading-relaxed bg-gray-50 p-2 rounded-sm">
                  <span className="font-bold text-gray-500">TIP:</span> 정면을 바라보며 손이 몸통을 가리지 않는 전신 사진이 결과가 잘 나옵니다.
                </p>
              </div>
            </div>

            <Button
              disabled={isFitting || !userImageFile || garments.length === 0}
              onClick={handleStartFitting}
              className="w-full h-16 bg-black hover:bg-gray-800 text-white font-bold text-lg rounded-sm disabled:bg-gray-400 border border-black shadow-lg"
            >
              {isFitting ? (
                <>연산 중...</>
              ) : (
                <><Play className="w-6 h-6 mr-2" fill="currentColor" /> VTON 생성 시작</>
              )}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
