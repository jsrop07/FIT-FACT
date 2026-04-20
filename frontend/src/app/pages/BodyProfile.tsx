import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { User, Save } from "lucide-react";

export function BodyProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    height: "175",
    weight: "70",
    waist: "32",
    thighType: "보통",
    shoulderWidth: "보통",
    preferredFit: "레귤러핏",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = () => {
    // In real app, would save to backend
    alert("프로필이 저장되었습니다!");
    navigate("/search");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl text-black mb-2">내 체형 프로필</h1>
          <p className="text-gray-600">
            정확한 체형 정보를 입력하면 더 나은 추천을 받을 수 있습니다
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="space-y-6">
                {/* Basic Measurements */}
                <div>
                  <h3 className="text-lg font-medium text-black mb-4">기본 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="height" className="text-sm font-medium text-gray-700">
                        키 (cm)
                      </Label>
                      <Input
                        id="height"
                        type="number"
                        value={formData.height}
                        onChange={(e) => handleInputChange("height", e.target.value)}
                        className="h-12"
                        placeholder="175"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weight" className="text-sm font-medium text-gray-700">
                        몸무게 (kg)
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        value={formData.weight}
                        onChange={(e) => handleInputChange("weight", e.target.value)}
                        className="h-12"
                        placeholder="70"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waist" className="text-sm font-medium text-gray-700">
                        허리둘레 (인치)
                      </Label>
                      <Input
                        id="waist"
                        type="number"
                        value={formData.waist}
                        onChange={(e) => handleInputChange("waist", e.target.value)}
                        className="h-12"
                        placeholder="32"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-black mb-4">
                    상세 체형 정보
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="thighType" className="text-sm font-medium text-gray-700">
                        허벅지 체형
                      </Label>
                      <Select
                        value={formData.thighType}
                        onValueChange={(value) => handleInputChange("thighType", value)}
                      >
                        <SelectTrigger id="thighType" className="h-12">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="가는편">가는편</SelectItem>
                          <SelectItem value="보통">보통</SelectItem>
                          <SelectItem value="두꺼운편">두꺼운편</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shoulderWidth" className="text-sm font-medium text-gray-700">
                        어깨 넓이
                      </Label>
                      <Select
                        value={formData.shoulderWidth}
                        onValueChange={(value) =>
                          handleInputChange("shoulderWidth", value)
                        }
                      >
                        <SelectTrigger id="shoulderWidth" className="h-12">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="좁은편">좁은편</SelectItem>
                          <SelectItem value="보통">보통</SelectItem>
                          <SelectItem value="넓은편">넓은편</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredFit" className="text-sm font-medium text-gray-700">
                        선호 핏
                      </Label>
                      <Select
                        value={formData.preferredFit}
                        onValueChange={(value) =>
                          handleInputChange("preferredFit", value)
                        }
                      >
                        <SelectTrigger id="preferredFit" className="h-12">
                          <SelectValue placeholder="선택하세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="슬림핏">슬림핏</SelectItem>
                          <SelectItem value="레귤러핏">레귤러핏</SelectItem>
                          <SelectItem value="와이드핏">와이드핏</SelectItem>
                          <SelectItem value="오버핏">오버핏</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700 px-8"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      프로필 저장
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/")}>
                      취소
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-black">프로필 미리보기</h3>
                  <p className="text-xs text-gray-500">입력한 정보</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    기본 정보
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">키</span>
                      <span className="text-black font-medium">
                        {formData.height}cm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">몸무게</span>
                      <span className="text-black font-medium">
                        {formData.weight}kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">허리둘레</span>
                      <span className="text-black font-medium">
                        {formData.waist}인치
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-3">
                    체형 특징
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">허벅지</span>
                      <span className="text-black font-medium">
                        {formData.thighType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">어깨</span>
                      <span className="text-black font-medium">
                        {formData.shoulderWidth}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">선호 핏</span>
                      <span className="text-black font-medium">
                        {formData.preferredFit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 mb-2">
                    AI 분석 결과
                  </div>
                  <div className="text-xs text-blue-700">
                    입력하신 정보를 바탕으로 레귤러 체형으로 분류되었습니다.
                    슬림핏부터 오버핏까지 다양한 스타일을 소화할 수 있습니다.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
