import { Link, useLocation } from "react-router";
import { User, Menu } from "lucide-react";

export function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-black tracking-tighter text-white uppercase italic">
              Fit & Fact
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/search" className={`text-sm font-medium transition-colors ${isActive('/search') ? 'text-white border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}>
              검색
            </Link>
            <Link to="/upload-clothes" className={`text-sm font-medium transition-colors ${isActive('/upload-clothes') ? 'text-white border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}>
              내 옷 관리
            </Link>
            <Link to="/comparison" className={`text-sm font-medium transition-colors ${isActive('/comparison') ? 'text-white border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}>
              비교하기
            </Link>
            <Link to="/body-profile" className={`text-sm font-medium transition-colors ${isActive('/body-profile') ? 'text-white border-b-2 border-white pb-1' : 'text-gray-300 hover:text-white'}`}>
              내 프로필
            </Link>
            <Link to="/curation" className={`text-sm font-bold transition-colors ${isActive('/curation') ? 'text-red-400 border-b-2 border-red-400 pb-1' : 'text-red-500 hover:text-red-400'}`}>
              [데이터 검수]
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <User className="w-5 h-5 text-gray-300" />
            </button>
            <button className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Menu className="w-5 h-5 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
