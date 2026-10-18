import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCartStore } from '../../store/useCartStore';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, getTotalAmount, tableNumber } = useCartStore();
  const total = getTotalAmount();

  // Khóa cuộn trang và lắng nghe phím Escape khi giỏ hàng mở
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleProceedToBooking = () => {
    onClose();
    navigate('/booking');
  };

  const drawerContent = (
    <div className="fixed inset-0 z-[100] overflow-hidden" role="dialog" aria-modal="true">
      {/* Lớp nền mờ che phủ toàn bộ màn hình */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Khung trượt giỏ hàng từ cạnh phải */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10 pointer-events-none">
        <div className="w-screen max-w-md bg-[#faf7f2] shadow-2xl flex flex-col h-full pointer-events-auto border-l border-[#e8dbce] animate-slideInRight">
          {/* Header giỏ hàng */}
          <div className="p-6 border-b border-[#e8dbce] flex items-center justify-between bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#8B1E0F] text-white rounded-xl shadow-sm">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#462c1a]">Giỏ Món Ăn</h3>
                {tableNumber ? (
                  <p className="text-xs text-[#7d6756] mt-0.5">
                    Đang gắn với bàn: <span className="font-bold text-[#8B1E0F]">{tableNumber}</span>
                  </p>
                ) : (
                  <p className="text-xs text-[#7d6756] mt-0.5">Các món đã chọn cho bữa tiệc</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#7d6756] hover:text-[#462c1a] rounded-xl hover:bg-[#e8dbce]/50 transition"
              aria-label="Đóng giỏ hàng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Danh sách món ăn trong giỏ */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#7d6756] space-y-3 py-12">
                <div className="w-16 h-16 rounded-full bg-[#f3ece3] flex items-center justify-center text-[#d1c2b4]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <p className="font-serif font-bold text-base text-[#462c1a]">Chưa có món nào trong giỏ hàng</p>
                <p className="text-xs max-w-xs text-[#9c8675] leading-relaxed">
                  Hãy ghé Thực đơn Bếp Việt để chọn các món cơm niêu, cá kho tộ hoặc đồ uống bạn yêu thích.
                </p>
              </div>
            ) : (
              items.map((cartItem) => (
                <div
                  key={cartItem.menuItem.id}
                  className="p-4 rounded-2xl border border-[#e8dbce] bg-white shadow-sm flex gap-4 items-center hover:shadow transition-shadow"
                >
                  {cartItem.menuItem.imageUrl ? (
                    <img
                      src={cartItem.menuItem.imageUrl}
                      alt={cartItem.menuItem.name}
                      className="w-16 h-16 rounded-xl object-cover border border-[#e8dbce] flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#e8dbce] flex-shrink-0 flex items-center justify-center text-xs font-serif font-bold text-[#7d6756]">
                      Bếp Việt
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#462c1a] truncate">
                      {cartItem.menuItem.name}
                    </h4>
                    <p className="text-xs font-bold text-[#8B1E0F] mt-0.5">
                      {cartItem.menuItem.price.toLocaleString('vi-VN')} đ
                    </p>

                    {cartItem.note && (
                      <p className="text-[11px] text-[#8c6d60] italic mt-1 truncate">
                        Ghi chú: {cartItem.note}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3">
                      <div className="inline-flex items-center border border-[#d1c2b4] rounded-lg bg-[#faf7f2]">
                        <button
                          onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                          className="p-1.5 hover:bg-[#e8dbce]/50 text-[#462c1a] transition rounded-l-lg"
                          aria-label="Giảm số lượng"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-[#462c1a]">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                          className="p-1.5 hover:bg-[#e8dbce]/50 text-[#462c1a] transition rounded-r-lg"
                          aria-label="Tăng số lượng"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(cartItem.menuItem.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Xóa món này khỏi giỏ"
                        aria-label="Xóa món"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Tổng tiền & Nút Đặt bàn / Thanh toán */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#e8dbce] bg-white space-y-4 flex-shrink-0 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#7d6756]">Tổng tiền món:</span>
                <span className="font-serif text-2xl font-black text-[#8B1E0F]">
                  {total.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={clearCart}
                  className="px-4 py-3 border border-[#d1c2b4] text-[#7d6756] hover:text-red-700 hover:border-red-300 hover:bg-red-50/50 rounded-xl text-xs font-semibold transition"
                >
                  Xóa giỏ
                </button>
                <button
                  onClick={handleProceedToBooking}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm bg-[#8B1E0F] hover:bg-[#70180B] active:scale-[0.99] transition shadow-md shadow-[#8B1E0F]/20"
                >
                  <span>Tiến Hành Đặt Bàn</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};

