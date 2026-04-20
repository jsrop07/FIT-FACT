import { useState } from "react";
import { useNavigate } from "react-router";
import { Header } from "../components/Header";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Search, Sparkles, Upload, Shuffle, Scan } from "lucide-react";

export function Landing() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const exampleQueries = [
    "허벅지 커버되는 포멀한 바지",
    "출근용 미니멀 셔츠",
    "내 옷이랑 어울리는 슬랙스",
  ];

  const features = [
    {
      icon: Search,
      title: "자연어 검색",
      description: "원하는 스타일을 말하듯이 검색하세요",
    },
    {
      icon: Sparkles,
      title: "AI 추천",
      description: "체형과 취향에 맞는 옷을 추천합니다",
    },
    {
      icon: Scan,
      title: "가상 피팅",
      description: "구매 전에 나에게 어울리는지 확인하세요",
    },
    {
      icon: Upload,
      title: "내 옷 업로드",
      description: "내 옷과 어울리는 조합을 찾아드려요",
    },
  ];

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-b from-white to-gray-50 overflow-hidden flex flex-col">
      <Header />

      <main className="flex-1 overflow-y-auto w-full">
        {/* Hero Section */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-700">AI 기반 패션 검색 & 가상 피팅</span>
          </div>

          <h1 className="text-5xl md:text-6xl tracking-tight text-black max-w-4xl mx-auto leading-tight">
            자연어로 찾고,
            <br />
            내 사진에 바로 입혀보는
            <br />
            <span className="text-blue-600">AI 패션 검색</span>
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            원하는 스타일을 말하듯이 검색하고, AI가 추천한 옷을 내 사진에 바로 입혀보세요.
            <br />
            더 이상 상상만 하지 마세요.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="예: 허벅지 커버되는 포멀한 바지"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-12 h-14 text-base rounded-xl border-gray-300 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="h-14 px-8 bg-black hover:bg-gray-800 rounded-xl"
              >
                검색
              </Button>
            </div>

            {/* Example Queries */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {exampleQueries.map((query, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(query)}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:text-black transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-300 transition-all hover:shadow-sm"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-black mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>
      </main>
    </div>
  );
}
