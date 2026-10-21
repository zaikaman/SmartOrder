import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  ShoppingBag, 
  Users, 
  MapPin, 
  Plus, 
  Minus, 
  Trash2, 
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { catalogApi, bookingApi } from '../../api/client';
import { DiningTable, MenuItem, ReservationOrder, CreateOrderRequest } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';

export const QrTableOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { tableNumber } = useParams<{ tableNumber: string }>();
  const { isAuthenticated, user } = useAuthStore();

  const [table, setTable] = useState<DiningTable | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);

  // Sticky & Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [headerHeight, setHeaderHeight] = useState<number>(110);

  // In-table order states
  const [partySize, setPartySize] = useState<number>(2);
  const [generalNote, setGeneralNote] = useState<string>('');
  const [submittingOrder, setSubmittingOrder] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccessData, setOrderSuccessData] = useState<ReservationOrder | null>(null);

  const { 
    items: cartItems, 
    setTable: setCartTable, 
    addItem, 
    updateQuantity, 
    updateNote, 
    removeItem, 
    clearCart,
    getTotalAmount, 
    getTotalQuantity 
  } = useCartStore();

  useEffect(() => {
    const fetchTableAndMenu = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!tableNumber) return;

        // 1. Fetch table details
        const tableRes = await catalogApi.get<DiningTable>(`/tables/number/${tableNumber}`);
        setTable(tableRes.data);
        setCartTable(tableRes.data.id, tableRes.data.tableNumber);
        if (tableRes.data.capacity) {
          setPartySize(tableRes.data.capacity);
        }

        // 2. Fetch all menu items
        const menuRes = await catalogApi.get<MenuItem[]>('/menu');
        setMenuItems(menuRes.data);

        // 3. Fetch categories
        const catRes = await catalogApi.get<string[]>('/menu/categories');
        setCategories(catRes.data);
      } catch (err: any) {
        console.error('Không tìm thấy thông tin bàn ăn', err);
        setError('Không tìm thấy bàn ăn này hoặc bàn chưa được kích hoạt trên hệ thống.');
      } finally {
        setLoading(false);
      }
    };

    fetchTableAndMenu();
  }, [tableNumber, setCartTable]);

  // Measure dynamic header height so sticky bar sits flush underneath
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

  const handleConfirmInTableOrder = async () => {
    if (!table) return;
    if (cartItems.length === 0) {
      setOrderError('Giỏ hàng đang trống, vui lòng chọn món trước khi gửi.');
      return;
    }

    try {
      setSubmittingOrder(true);
      setOrderError(null);

      const orderPayload: CreateOrderRequest = {
        tableId: table.id,
        reservationTime: new Date().toISOString(),
        partySize: partySize || 2,
        customerName: user?.fullName || `Khách tại bàn ${table.tableNumber}`,
        customerEmail: user?.email || '',
        customerPhone: user?.phone || 'Chưa cung cấp',
        note: generalNote.trim() || undefined,
        paymentMethod: 'VNPAY',
        items: cartItems.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          note: i.note,
        })),
      };

      const res = await bookingApi.post<ReservationOrder>('/orders', orderPayload);
      setOrderSuccessData(res.data);
      clearCart();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Không thể gửi đơn gọi món vào bếp.';
      setOrderError(typeof msg === 'string' ? msg : 'Lỗi khi gửi đơn gọi món.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  const filteredItems = selectedCategory === 'ALL'
    ? menuItems
    : menuItems.filter((i) => i.category === selectedCategory);

  // Pagination calculation: 20 items per page
  const itemsPerPage = 20;
  const totalFilteredCount = filteredItems.length;
  const totalPages = Math.ceil(totalFilteredCount / itemsPerPage) || 1;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDishes = filteredItems.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const mainSection = document.querySelector('main');
    if (mainSection) {
      const topOffset = mainSection.getBoundingClientRect().top + window.scrollY - headerHeight - 40;
      window.scrollTo({
        top: Math.max(0, topOffset),
        behavior: 'smooth',
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const totalQuantity = getTotalQuantity();
  const totalAmount = getTotalAmount();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#6d492f] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#6d492f]">Đang kết nối bàn ăn Bếp Việt...</p>
        </div>
      </div>
    );
  }

  if (error || !table) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl border border-[#e8dbce] max-w-md w-full text-center space-y-4 shadow-md">
          <AlertCircle className="w-12 h-12 text-[#b84a28] mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-[#462c1a]">Bàn ăn không tồn tại</h2>
          <p className="text-sm text-[#7d6756] leading-relaxed">
            {error || 'Mã bàn trong đường dẫn không hợp lệ. Vui lòng quét lại mã QR tại bàn.'}
          </p>
          <div className="pt-2">
            <Link
              to="/tables"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6d492f] text-white text-xs font-bold hover:bg-[#533722] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Xem sơ đồ bàn
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] pb-32">
      {/* 1. Header Banner For The Table */}
      <div className="bg-[#6d492f] text-[#faf7f2] border-b-4 border-[#b84a28] px-4 py-6 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-[#b84a28] text-white text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                Quét QR Trực Tiếp Tại Bàn
              </span>
              <span className="text-xs text-[#d7bda0]">Nhà hàng Cơm Niêu Bếp Việt</span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              Thực Đơn Bàn {table.tableNumber}
            </h1>
            <div className="flex items-center gap-4 text-xs text-[#e4d4c2] pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#d7bda0]" />
                Khu vực: <strong className="text-white">{table.area}</strong>
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-[#d7bda0]" />
                Sức chứa: <strong className="text-white">{table.capacity} khách</strong>
              </span>
            </div>
          </div>

          <div className="bg-[#533722] px-4 py-2.5 rounded-xl border border-[#d7bda0]/40 flex items-center gap-3">
            <UtensilsCrossed className="w-5 h-5 text-[#d7bda0]" />
            <div className="text-right">
              <span className="text-[11px] text-[#d7bda0] block font-semibold">Tình trạng bàn</span>
              <span className={`text-xs font-bold ${
                table.status === 'AVAILABLE'
                  ? 'text-[#86efac]'
                  : table.status === 'OCCUPIED'
                  ? 'text-[#fde047]'
                  : 'text-[#fdba74]'
              }`}>
                {table.status === 'AVAILABLE'
                  ? 'Bàn trống (Gọi món tại chỗ)'
                  : table.status === 'OCCUPIED'
                  ? 'Đang phục vụ (Gọi thêm món)'
                  : 'Đã có khách đặt trước'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Category Navigation Sticky Bar */}
      <div 
        className="sticky z-30 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#e8dbce] py-3 px-3 sm:px-4 shadow-sm transition-all w-full max-w-full overflow-hidden"
        style={{ top: `${headerHeight}px` }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 w-full min-w-0">
          {/* Table summary badge when sticky */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6d492f] text-white text-xs font-bold shadow-sm">
              <UtensilsCrossed className="w-3.5 h-3.5 text-[#d7bda0]" />
              <span>Bàn {table.tableNumber}</span>
              <span className="text-[10px] text-[#d7bda0] hidden sm:inline">• {table.area}</span>
            </span>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none no-scrollbar py-0.5 w-full min-w-0">
            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
                selectedCategory === 'ALL'
                  ? 'bg-[#6d492f] text-white shadow-[#6d492f]/30'
                  : 'bg-white text-[#6d492f] border border-[#d7bda0]/60 hover:bg-[#e8dcce]'
              }`}
            >
              Tất cả ({menuItems.length})
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
                    : 'bg-white text-[#6d492f] border border-[#d7bda0]/60 hover:bg-[#e8dcce]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Dish List Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentDishes.map((item) => {
            const inCart = cartItems.find((i) => i.menuItem.id === item.id);
            const isAvailable = item.status === 'AVAILABLE';

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#e8dbce] p-4 flex gap-4 shadow-sm hover:shadow transition-shadow"
              >
                {/* Dish Thumb */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden shrink-0 bg-[#f3ece3]">
                  <img
                    src={item.imageUrl || "https://comnieubepviet.com/thumbs/675x600x1/upload/product/menu-21-tom-rang-trung-muoi-5429.jpg"}
                    alt={item.name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                </div>

                {/* Info & Action */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#462c1a] line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#7d6756] line-clamp-2 mt-0.5 leading-relaxed">
                      {item.description || 'Món ngon đậm vị truyền thống Bếp Việt.'}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#b84a28]">
                      {formatCurrency(item.price)}
                    </span>

                    {isAvailable ? (
                      inCart ? (
                        <div className="flex items-center gap-2 bg-[#f3ece3] rounded-lg p-1 border border-[#d7bda0]/60">
                          <button
                            onClick={() => updateQuantity(item.id, inCart.quantity - 1)}
                            className="p-1 rounded bg-white text-[#6d492f] hover:bg-[#e8dcce]"
                            title="Giảm bớt"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-[#462c1a] px-1">
                            {inCart.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, inCart.quantity + 1)}
                            className="p-1 rounded bg-[#6d492f] text-white hover:bg-[#533722]"
                            title="Thêm món"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addItem(item, 1)}
                          className="px-3 py-1.5 rounded-lg bg-[#6d492f] hover:bg-[#533722] text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-transform active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          Thêm
                        </button>
                      )
                    ) : (
                      <span className="text-[11px] font-semibold text-[#8c6d60]">Hết món</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination Bar */}
        {totalFilteredCount > itemsPerPage ? (
          <div className="mt-10 pt-6 border-t border-[#e8dbce] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#7d6756]">
              Hiển thị món <strong className="text-[#462c1a]">{startIndex + 1} - {Math.min(endIndex, totalFilteredCount)}</strong> trong tổng số <strong className="text-[#462c1a]">{totalFilteredCount}</strong> món ăn
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
          <div className="mt-8 text-center text-xs text-[#8c6d60]">
            Đang hiển thị toàn bộ {totalFilteredCount} món ăn trong danh mục
          </div>
        )}
      </main>

      {/* 4. Bottom Sticky Cart Floating Bar */}
      {totalQuantity > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-[#3f2615]/95 backdrop-blur-md border-t-2 border-[#b84a28] py-3 px-4 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-[#6d492f] text-white">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 bg-[#b84a28] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {totalQuantity}
                </span>
              </div>
              <div>
                <span className="text-xs text-[#d7bda0] block font-medium">
                  Đang chọn cho Bàn {table.tableNumber}
                </span>
                <span className="text-lg font-bold text-white tracking-tight">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOrderModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-[#b84a28] hover:bg-[#a13e20] text-white font-bold text-sm shadow-lg shadow-[#b84a28]/40 transition-all flex items-center gap-2"
            >
              <span>Xem đơn gọi món</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 5. Order Review Modal */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#faf7f2] border-2 border-[#d7bda0] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {orderSuccessData ? (
              /* Success Screen */
              <div className="p-8 text-center space-y-5">
                <div className="w-16 h-16 bg-[#2d5a27]/10 text-[#2d5a27] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif text-2xl font-bold text-[#462c1a]">
                    Đã Gửi Order Vào Bếp Thành Công!
                  </h3>
                  <p className="text-xs text-[#7d6756] max-w-sm mx-auto">
                    Hệ thống Bếp Việt đã tiếp nhận thực đơn của quý khách tại Bàn {table.tableNumber}. Các đầu bếp đang bắt đầu chuẩn bị món ăn nóng hổi.
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-[#e8dbce] p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#e8dbce]/70 pb-2">
                    <span className="text-[#7d6756]">Mã đơn hàng:</span>
                    <span className="font-mono font-bold text-[#b84a28]">{orderSuccessData.orderCode}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#e8dbce]/70 pb-2">
                    <span className="text-[#7d6756]">Vị trí bàn ăn:</span>
                    <span className="font-bold text-[#462c1a]">Bàn {table.tableNumber} - {table.area}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#e8dbce]/70 pb-2">
                    <span className="text-[#7d6756]">Tổng giá trị món:</span>
                    <span className="font-bold text-[#b84a28]">{formatCurrency(orderSuccessData.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[#7d6756]">Trạng thái bếp:</span>
                    <span className="font-semibold text-[#2d5a27]">Chờ chuẩn bị (PENDING)</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setOrderSuccessData(null);
                      setIsOrderModalOpen(false);
                      navigate('/my-orders');
                    }}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#6d492f] hover:bg-[#533722] text-white text-xs font-bold shadow transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Theo dõi tiến độ đơn hàng</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setOrderSuccessData(null);
                      setIsOrderModalOpen(false);
                    }}
                    className="py-3 px-4 rounded-xl border border-[#d7bda0] bg-white hover:bg-stone-50 text-xs font-bold text-[#6d492f] transition-colors"
                  >
                    Gọi thêm món khác
                  </button>
                </div>
              </div>
            ) : (
              /* Review & Submit Form */
              <>
                {/* Modal Header */}
                <div className="bg-[#6d492f] text-white p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold">
                      Danh Sách Món Ăn - Bàn {table.tableNumber}
                    </h3>
                    <p className="text-xs text-[#d7bda0]">
                      Kiểm tra lại số lượng và ghi chú trước khi gửi vào bếp
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOrderModalOpen(false)}
                    className="text-white/80 hover:text-white text-sm font-bold"
                  >
                    Đóng
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 overflow-y-auto divide-y divide-[#e8dbce] flex-1 space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.menuItem.id} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-[#462c1a]">
                            {item.menuItem.name}
                          </h4>
                          <span className="text-xs text-[#b84a28] font-bold">
                            {formatCurrency(item.menuItem.price * item.quantity)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 bg-[#f3ece3] rounded-lg p-1 border border-[#d7bda0]/60">
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                            className="p-1 rounded bg-white text-[#6d492f] hover:bg-[#e8dcce]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-[#462c1a] px-1">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                            className="p-1 rounded bg-[#6d492f] text-white hover:bg-[#533722]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeItem(item.menuItem.id)}
                            className="p-1 text-[#b84a28] hover:text-red-700 ml-1"
                            title="Xóa món"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Note Input */}
                      <input
                        type="text"
                        value={item.note || ''}
                        onChange={(e) => updateNote(item.menuItem.id, e.target.value)}
                        placeholder="Ghi chú món (ví dụ: không hành, cay nhẹ, ít đá...)"
                        className="w-full text-xs p-2 rounded-lg bg-white border border-[#d7bda0] text-[#462c1a] focus:outline-none focus:ring-1 focus:ring-[#b84a28]"
                      />
                    </div>
                  ))}

                  {/* General Order Settings */}
                  <div className="pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-[#462c1a] uppercase mb-1">
                          Số lượng người ngồi
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={partySize}
                          onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                          className="w-full text-xs p-2 rounded-lg bg-white border border-[#d7bda0] text-[#462c1a]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#462c1a] uppercase mb-1">
                          Ghi chú toàn bàn
                        </label>
                        <input
                          type="text"
                          value={generalNote}
                          onChange={(e) => setGeneralNote(e.target.value)}
                          placeholder="Ví dụ: Cần thêm khăn lạnh..."
                          className="w-full text-xs p-2 rounded-lg bg-white border border-[#d7bda0] text-[#462c1a]"
                        />
                      </div>
                    </div>

                    {orderError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{orderError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-[#f3ece3] p-4 border-t border-[#e8dbce] space-y-3">
                  <div className="flex justify-between items-center text-sm font-bold text-[#462c1a]">
                    <span>Tổng cộng ({totalQuantity} món):</span>
                    <span className="text-lg text-[#b84a28]">{formatCurrency(totalAmount)}</span>
                  </div>

                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <button
                          onClick={clearCart}
                          className="px-4 py-2.5 rounded-xl border border-[#d7bda0] bg-white text-xs font-bold text-[#8c6d60] hover:bg-gray-100"
                        >
                          Xóa tất cả
                        </button>
                        <button
                          onClick={handleConfirmInTableOrder}
                          disabled={submittingOrder}
                          className="flex-1 py-2.5 rounded-xl bg-[#b84a28] hover:bg-[#a13e20] text-white text-xs font-bold text-center shadow transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>{submittingOrder ? 'Đang gửi order vào bếp...' : 'Gửi order vào bếp ngay'}</span>
                        </button>
                      </div>
                      <p className="text-[11px] text-center text-[#7d6756]">
                        Tài khoản đặt: <strong className="text-[#462c1a]">{user?.fullName || user?.username}</strong>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-[#7d6756] text-center">
                        Quý khách vui lòng đăng nhập để lưu hóa đơn và gửi order vào bếp.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={clearCart}
                          className="px-4 py-2.5 rounded-xl border border-[#d7bda0] bg-white text-xs font-bold text-[#8c6d60] hover:bg-gray-100"
                        >
                          Xóa tất cả
                        </button>
                        <Link
                          to="/login"
                          state={{ returnUrl: `/table/${table.tableNumber}` }}
                          className="flex-1 py-2.5 rounded-xl bg-[#b84a28] hover:bg-[#a13e20] text-white text-xs font-bold text-center shadow transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Đăng nhập để gửi order</span>
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
