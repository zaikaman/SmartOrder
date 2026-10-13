import React, { useEffect, useState } from 'react';
import { Search, UtensilsCrossed, Sparkles } from 'lucide-react';
import { catalogApi } from '../../api/client';
import { MenuItem } from '../../types';
import { MenuItemCard } from '../../components/common/MenuItemCard';

export const PublicMenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await catalogApi.get<string[]>('/menu/categories');
        setCategories(res.data);
      } catch (err) {
        console.error('Không thể tải danh mục', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch menu items based on filter
  useEffect(() => {
    const fetchMenu = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedCategory !== 'ALL') {
          params.category = selectedCategory;
        }
        if (keyword.trim()) {
          params.keyword = keyword.trim();
        }

        const res = await catalogApi.get<MenuItem[]>('/menu', { params });
        setItems(res.data);
      } catch (err) {
        console.error('Không thể tải danh sách thực đơn', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchMenu, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, keyword]);

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title Banner */}
        <div className="text-center space-y-2 border-b border-[#e8dbce] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ece3] border border-[#d7bda0]/70 text-[#6d492f] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#b84a28]" />
            Thực Đơn Nhà Hàng Bếp Việt
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#462c1a]">
            Cơm Niêu & Đặc Sản Ba Miền
          </h1>
          <p className="text-sm text-[#7d6756] max-w-xl mx-auto">
            Hương vị đồng quê mộc mạc kết hợp cùng hải sản tươi ngon Phan Thiết.
            Tất cả nguyên liệu được tuyển chọn kỹ lưỡng mỗi ngày.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-[#f3ece3] p-4 sm:p-5 rounded-2xl border border-[#e8dbce] space-y-4 shadow-sm">
          {/* Search Box */}
          <div className="relative max-w-md mx-auto">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm kiếm món ăn (cá kho, tôm rang, canh chua...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#d7bda0] text-sm text-[#462c1a] placeholder-[#8c6d60]/70 focus:outline-none focus:ring-2 focus:ring-[#b84a28]"
            />
            <Search className="w-4 h-4 text-[#8c6d60] absolute left-3.5 top-3.5" />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none justify-start sm:justify-center">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === 'ALL'
                  ? 'bg-[#6d492f] text-white shadow-[#6d492f]/30'
                  : 'bg-white text-[#6d492f] hover:bg-[#e8dcce] border border-[#d7bda0]/60'
              }`}
            >
              Tất Cả Món ({items.length})
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                  selectedCategory === cat
                    ? 'bg-[#6d492f] text-white shadow-[#6d492f]/30'
                    : 'bg-white text-[#6d492f] hover:bg-[#e8dcce] border border-[#d7bda0]/60'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-20 text-sm font-semibold text-[#8c6d60]">
            Đang tải danh sách món ăn...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#d7bda0] p-8 space-y-3">
            <UtensilsCrossed className="w-10 h-10 text-[#d7bda0] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#462c1a]">
              Không tìm thấy món ăn phù hợp
            </h3>
            <p className="text-xs text-[#7d6756]">
              Vui lòng thử tìm với từ khóa khác hoặc chọn lại danh mục món ăn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <MenuItemCard key={item.id} item={item} showOrderAction={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
