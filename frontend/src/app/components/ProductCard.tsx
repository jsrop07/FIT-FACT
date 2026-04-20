import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface ProductCardProps {
  id: string;
  image: string;
  name: string;
  brand: string;
  price: string;
  badges?: string[];
  productUrl?: string;
  onSelect?: (id: string) => void;
  onFitting?: (id: string) => void;
  selected?: boolean;
}

export function ProductCard({
  id,
  image,
  name,
  brand,
  price,
  badges = [],
  productUrl,
  onSelect,
  onFitting,
  selected = false,
}: ProductCardProps) {
  return (
    <div
      className={`group bg-white rounded-lg border transition-all ${
        selected ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden relative">
        {productUrl ? (
          <a href={productUrl} target="_blank" rel="noreferrer" className="block w-full h-full">
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </a>
        ) : (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <div className="text-xs text-gray-500 mb-1">{brand}</div>
          <h3 className="text-sm text-black line-clamp-2">{name}</h3>
          <div className="mt-2 font-medium text-black">{price}</div>
        </div>

        {badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {badges.map((badge, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 border-0"
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-2">
          {onSelect && (
            <Button
              variant={selected ? "default" : "outline"}
              size="sm"
              className="flex-1 text-xs"
              onClick={() => onSelect(id)}
            >
              {selected ? "선택됨" : "선택하기"}
            </Button>
          )}
          {onFitting && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
              onClick={() => onFitting(id)}
            >
              피팅 적용
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
