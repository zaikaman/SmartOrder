import React, { useState } from 'react';
import { Plus, Check } from 'lucide-react';
import { MenuItem } from '../../types';
import { useCartStore } from '../../store/useCartStore';

interface MenuItemCardProps {
  item: MenuItem;
  showOrderAction?: boolean;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, showOrderAction = true }) => {
  const { addItem } = useCartStore();
  const [isAdded, setIsAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const handleAddToCart = () => {
    addItem(item, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1200);
  };

  const isAvailable = item.status === 'AVAILABLE';

  // Fallback high quality dish image if link fails
  const fallbackImage = "https://images.unsplash.com/photo-1544025162-d76694265947?w=600";

  return (
    <div className="group relative bg-[#faf7f2] rounded-xl overflow-hidden border border-[#e8dbce] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
      {/* Image Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f3ece3]">
        <img
          src={imgError || !item.imageUrl ? fallbackImage : item.imageUrl}
          alt={item.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Category Tag */}
        <span className="absolute top-3 left-3 bg-[#3f2615]/85 backdrop-blur-sm text-[#f5ede3] text-[11px] font-semibold px-2.5 py-1 rounded-md tracking-wide">
          {item.category}
        </span>

        {/* Status Badge */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-[#b84a28] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
              Tạm hết món
            </span>
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif text-lg font-bold text-[#462c1a] group-hover:text-[#b84a28] transition-colors line-clamp-1">
            {item.name}
          </h3>
          <p className="mt-1 text-xs text-[#7d6756] line-clamp-2 leading-relaxed">
            {item.description || 'Hương vị truyền thống tươi ngon được chế biến theo công thức gia truyền Bếp Việt.'}
          </p>
        </div>

        {/* Footer: Price & Order Button */}
        <div className="mt-4 pt-3 border-t border-[#e8dbce]/70 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#8c6d60] block font-medium">Giá bán</span>
            <span className="text-base font-bold text-[#b84a28] tracking-tight">
              {formatCurrency(item.price)}
            </span>
          </div>

          {showOrderAction && isAvailable && (
            <button
              onClick={handleAddToCart}
              className={`flex items-center gap-1 text-xs font-bold px-3.5 py-2 rounded-lg transition-all duration-200 shadow-sm ${
                isAdded
                  ? 'bg-[#2d5a27] text-white scale-105'
                  : 'bg-[#6d492f] hover:bg-[#533722] active:scale-95 text-[#faf7f2]'
              }`}
              title="Thêm vào gọi món"
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Đã chọn</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Chọn món</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
