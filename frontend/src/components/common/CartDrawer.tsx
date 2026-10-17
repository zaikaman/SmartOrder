import React from 'react';
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

  if (!isOpen) return null;

  const handleProceedToBooking = () => {
    onClose();
    navigate('/booking');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-[#e8dbce] flex items-center justify-between bg-[#faf7f2]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#8B1E0F] text-white rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#462c1a]">Giỏ Món Ăn</h3>
                {tableNumber && (
                  <p className="text-xs text-[#7d6756]">Đang gắn với: <span className="font-bold text-[#8B1E0F]">{tableNumber}</span></p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#7d6756] hover:text-[#462c1a] rounded-xl hover:bg-[#e8dbce]/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Danh sach mon an */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-[#7d6756] space-y-3">
                <ShoppingBag className="w-12 h-12 text-[#d1c2b4]" />
                <p className="font-medium text-sm">Chưa có món nào trong giỏ hàng</p>
                <p className="text-xs max-w-xs text-[#9c8675]">
                  Hãy ghé Thực đơn Bếp Việt để chọn các món cơm niêu, cá kho tộ hoặc đồ uống bạn yêu thích.
                </p>
              </div>
            ) : (
              items.map((cartItem) => (
                <div
                  key={cartItem.menuItem.id}
                  className="p-4 rounded-2xl border border-[#e8dbce] bg-[#faf7f2]/50 flex gap-4 items-center"
                >
                  {cartItem.menuItem.imageUrl ? (
                    <img
                      src={cartItem.menuItem.imageUrl}
                      alt={cartItem.menuItem.name}
                      className="w-16 h-16 rounded-xl object-cover border border-[#e8dbce]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#e8dbce] flex items-center justify-center text-xs text-[#7d6756]">
                      Bếp Việt
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-[#462c1a] truncate">
                      {cartItem.menuItem.name}
                    </h4>
                    <p className="text-xs font-semibold text-[#8B1E0F] mt-0.5">
                      {cartItem.menuItem.price.toLocaleString('vi-VN')} đ
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <div className="inline-flex items-center border border-[#d1c2b4] rounded-lg bg-white">
                        <button
                          onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity - 1)}
                          className="p-1 hover:bg-[#faf7f2] text-[#462c1a]"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-[#462c1a]">
                          {cartItem.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(cartItem.menuItem.id, cartItem.quantity + 1)}
                          className="p-1 hover:bg-[#faf7f2] text-[#462c1a]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(cartItem.menuItem.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Tong tien & Nut dat ban/goi mon */}
          {items.length > 0 && (
            <div className="p-6 border-t border-[#e8dbce] bg-[#faf7f2] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#7d6756]">Tổng tiền món:</span>
                <span className="font-serif text-xl font-black text-[#8B1E0F]">
                  {total.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={clearCart}
                  className="px-3 py-3 border border-[#d1c2b4] text-[#7d6756] hover:text-red-700 hover:border-red-300 rounded-xl text-xs font-semibold transition"
                >
                  Xóa giỏ
                </button>
                <button
                  onClick={handleProceedToBooking}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm bg-[#8B1E0F] hover:bg-[#70180B] active:scale-[0.99] transition shadow-md"
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
};
