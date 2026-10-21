import React, { useState } from 'react';
import { catalogApi } from '../../api/client';
import { AiRecommendationRequest, AiRecommendationResponse } from '../../types';
import { useCartStore } from '../../store/useCartStore';
import { Sparkles, Users, DollarSign, Utensils, X, Check, ShoppingCart, Info } from 'lucide-react';

interface AiFoodAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export const AiFoodAssistantModal: React.FC<AiFoodAssistantModalProps> = ({ isOpen, onClose, onOpenCart }) => {
  const [partySize, setPartySize] = useState<number>(4);
  const [budget, setBudget] = useState<number>(600000);
  const [preference, setPreference] = useState<string>('TRADITIONAL');
  const [note, setNote] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<AiRecommendationResponse | null>(null);
  const [addedSuccess, setAddedSuccess] = useState<boolean>(false);

  const addItemToCart = useCartStore((state) => state.addItem);

  if (!isOpen) return null;

  const handleGenerateRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setAddedSuccess(false);

      const payload: AiRecommendationRequest = {
        partySize,
        budget,
        preference,
        note: note.trim() || undefined,
      };

      const res = await catalogApi.post('/menu/ai-recommend', payload);
      setRecommendation(res.data);
    } catch (err) {
      console.error('Lỗi khi gọi Trợ lý AI mâm cơm Bếp Việt:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToCart = () => {
    if (!recommendation || !recommendation.items) return;

    recommendation.items.forEach((item) => {
      addItemToCart(item, 1, 'Gợi ý từ Mâm cơm AI Bếp Việt');
    });

    setAddedSuccess(true);
    setTimeout(() => {
      if (onOpenCart) {
        onClose();
        onOpenCart();
      }
    }, 1200);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const preferences = [
    { id: 'TRADITIONAL', label: 'Cơm Niêu Truyền Thống', desc: 'Cá kho, canh cua, cà pháo, thịt luộc' },
    { id: 'SEAFOOD', label: 'Hải Sản Tươi Sống', desc: 'Tôm rang trứng muối, cá bớp, mực nhảy' },
    { id: 'LIGHT', label: 'Thanh Đạm Giải Nhiệt', desc: 'Nhiều rau xanh, canh mát, ít dầu mỡ' },
    { id: 'COZY', label: 'Sum Vầy Đầm Ấm', desc: 'Đầy đặn món xào nướng quây quần gia đình' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-[#e8dbce] p-6 space-y-5">

        {/* Tiêu đề Modal */}
        <div className="flex items-center justify-between border-b border-[#f0e6da] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#faf0ea] rounded-xl text-[#8b3d1b]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold text-[#3a2012]">Trợ Lý AI Phối Vị Mâm Cơm Bếp Việt</h2>
              <p className="text-[11px] text-[#8c7767]">Gợi ý thực đơn chuẩn ngũ vị âm dương phù hợp số người và ngân sách</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form nhập thông tin */}
        {!recommendation ? (
          <form onSubmit={handleGenerateRecommendation} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#462c1a] mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#8b3d1b]" />
                  <span>Số Lượng Thực Khách</span>
                </label>
                <div className="flex items-center gap-2">
                  {[2, 4, 6, 8, 10].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setPartySize(size);
                        setBudget(size * 150000);
                      }}
                      className={`flex-1 py-2 rounded-xl font-bold transition border ${
                        partySize === size
                          ? 'bg-[#8b3d1b] text-white border-[#8b3d1b]'
                          : 'bg-[#faf5ef] text-[#6d492f] border-[#e8dbce] hover:bg-[#f0e6da]'
                      }`}
                    >
                      {size} người
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#462c1a] mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#8b3d1b]" />
                  <span>Ngân Sách Dự Kiến (VNĐ)</span>
                </label>
                <input
                  type="number"
                  min="100000"
                  step="50000"
                  required
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] font-bold focus:outline-none focus:border-[#8b3d1b]"
                />
                <div className="text-[10px] text-[#9c897a] mt-1">
                  Khoảng ~{formatCurrency(Math.round(budget / partySize))}/khách
                </div>
              </div>
            </div>

            {/* Khẩu vị / Phong cách mâm cơm */}
            <div className="space-y-2">
              <label className="block font-bold text-[#462c1a] flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-[#8b3d1b]" />
                <span>Phong Cách Ẩm Thực Ưu Tiên</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {preferences.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setPreference(p.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition ${
                      preference === p.id
                        ? 'bg-[#faf0ea] border-[#8b3d1b] text-[#3a2012]'
                        : 'bg-[#faf5ef] border-[#ebdccb] text-[#6d492f] hover:bg-[#f2e7dc]'
                    }`}
                  >
                    <div className="font-bold text-xs">{p.label}</div>
                    <div className="text-[10px] text-[#8c7767] mt-0.5">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold text-[#462c1a] mb-1">Ghi Chú Bổ Sung (Tùy Chọn)</label>
              <input
                type="text"
                placeholder="Ví dụ: Ít cay, có trẻ nhỏ, canh chua thanh..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#8b3d1b] hover:bg-[#723216] text-white font-bold rounded-2xl shadow-sm transition hover:shadow flex items-center justify-center gap-2 text-xs disabled:opacity-50"
              >
                {loading ? (
                  <span>Đang phối món mâm cơm Bếp Việt...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Phối Mâm Cơm Tối Ưu</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Màn hình kết quả gợi ý mâm cơm */
          <div className="space-y-4 text-xs">
            <div className="bg-[#faf5ef] border border-[#ebdccb] p-4 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b3d1b]">
                  Gợi Ý Dành Cho Bàn {recommendation.recommendedForPartySize} Khách
                </span>
                <span className="font-serif text-base font-black text-[#8b3d1b]">
                  {formatCurrency(recommendation.totalEstimatedPrice)}
                </span>
              </div>
              <h3 className="font-serif text-xl font-black text-[#3a2012]">
                {recommendation.comboTitle}
              </h3>
              <p className="text-[#6d492f] leading-relaxed text-[11px]">
                {recommendation.description}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-[#8b3d1b] font-medium pt-1">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>{recommendation.culinaryPhilosophy}</span>
              </div>
            </div>

            {/* Danh sách món ăn trong mâm cơm */}
            <div className="space-y-2">
              <div className="font-bold text-[#462c1a] text-xs">Danh Sách Món Ăn Trong Mâm Cơm ({recommendation.items.length} món):</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {recommendation.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white rounded-xl border border-[#e8dbce] flex items-center gap-2.5 shadow-2xs"
                  >
                    <img
                      src={item.imageUrl || 'https://images.unsplash.com/photo-1503764628056-0c47577a12da'}
                      alt={item.name}
                      className="w-12 h-12 rounded-lg object-cover bg-[#f0e6da] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-[#3a2012] truncate text-xs">{item.name}</div>
                      <div className="text-[10px] text-[#8c7767]">{item.category}</div>
                      <div className="text-[11px] font-bold text-[#8b3d1b] mt-0.5">{formatCurrency(item.price)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Thao tác Thêm giỏ hàng / Chọn lại */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#f0e6da]">
              <button
                type="button"
                onClick={() => setRecommendation(null)}
                className="px-4 py-2 border border-[#d9c7b6] text-[#6d492f] rounded-xl font-bold hover:bg-[#faf5ef] transition text-xs"
              >
                Chọn Lại Tiêu Chí
              </button>

              <button
                type="button"
                onClick={handleAddAllToCart}
                disabled={addedSuccess}
                className="flex-1 py-2.5 bg-[#8b3d1b] hover:bg-[#723216] text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 text-xs"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>Đã Thêm Toàn Bộ Vào Giỏ Hàng</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Thêm Cả Mâm Cơm Vào Giỏ Hàng</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
