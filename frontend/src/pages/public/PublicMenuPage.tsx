import React, { useEffect, useState } from 'react';
import { Search, UtensilsCrossed, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { catalogApi } from '../../api/client';
import { MenuItem } from '../../types';
import { MenuItemCard } from '../../components/common/MenuItemCard';

export const PublicMenuPage: React.FC = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Sticky & Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [headerHeight, setHeaderHeight] = useState<number>(110);

  // Measure dynamic header height so filter bar sits flush underneath
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerEl = document.querySelector('header');
      if (headerEl) {
        setHeaderHeight(headerEl.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

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
        setCurrentPage(1);
      } catch (err) {
        console.error('Không thể tải danh sách thực đơn', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchMenu, 250);
    return () => clearTimeout(timer);
  }, [selectedCategory, keyword]);

  // Pagination calculation: 20 items per page
  const itemsPerPage = 20;
  const totalItemsCount = items.length;
  const totalPages = Math.ceil(totalItemsCount / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDishes = items.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const gridEl = document.getElementById('menu-items-grid');
    if (gridEl) {
      const topOffset = gridEl.getBoundingClientRect().top + window.scrollY - headerHeight - 120;
      window.scrollTo({
        top: Math.max(0, topOffset),
        behavior: 'smooth',
      });
    }
  };

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

        {/* Filter & Search Bar - Sticky underneath header */}
        <div 
          className="sticky z-30 bg-[#f3ece3]/95 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-[#e8dbce] space-y-4 shadow-sm transition-all"
          style={{ top: `${headerHeight + 6}px` }}
        >
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
              onClick={() => {
                setSelectedCategory('ALL');
                setCurrentPage(1);
              }}
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
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentPage(1);
                }}
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
          <div id="menu-items-grid" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentDishes.map((item) => (
                <MenuItemCard key={item.id} item={item} showOrderAction={true} />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalItemsCount > itemsPerPage ? (
              <div className="pt-6 border-t border-[#e8dbce] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#7d6756]">
                  Hiển thị món <strong className="text-[#462c1a]">{startIndex + 1} - {Math.min(endIndex, totalItemsCount)}</strong> trong tổng số <strong className="text-[#462c1a]">{totalItemsCount}</strong> món ăn
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3.5 py-2 rounded-xl border border-[#d7bda0] bg-white text-xs font-semibold text-[#6d492f] hover:bg-[#e8dcce] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Trước</span>
                  </button>

                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all shadow-sm ${
                        currentPage === pageNum
                          ? 'bg-[#6d492f] text-white shadow-[#6d492f]/30'
                          : 'bg-white text-[#6d492f] border border-[#d7bda0]/60 hover:bg-[#e8dcce]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3.5 py-2 rounded-xl border border-[#d7bda0] bg-white text-xs font-semibold text-[#6d492f] hover:bg-[#e8dcce] disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span>Sau</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-xs text-[#8c6d60]">
                Đang hiển thị toàn bộ {totalItemsCount} món ăn
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
