import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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

  // Khoa scroll man hinh va lang nghe phim Escape khi modal mo
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
      console.error('Loi khi goi Tro ly AI mam com Bep Viet:', err);
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

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
      {/* Lop nen mo che phu toan man hinh */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Hop thoai Modal trung tam */}
      <div className="relative z-10 bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#e8dbce] overflow-hidden my-auto animate-fadeIn">
        {/* Tieu de Modal - Luon co dinh o dau */}
        <div className="p-4 sm:p-5 border-b border-[#f0e6da] shrink-0 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 bg-[#faf0ea] rounded-xl text-[#8b3d1b] shrink-0">
              <Sparkles className="w-5 h-5 text-[#8b3d1b]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#3a2012] leading-tight">
                Trợ Lý AI Phối Vị Mâm Cơm Bếp Việt
              </h2>
              <p className="text-[11px] text-[#8c7767] mt-0.5">
                Gợi ý thực đơn chuẩn ngũ vị âm dương phù hợp số người và ngân sách
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-[#faf5ef] rounded-xl transition shrink-0 ml-2"
            title="Đóng hộp thoại"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Vung noi dung co the cuon doc ben trong */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
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
                    Định mức: khoảng <strong>{formatCurrency(budget / partySize)}/người</strong>
                  </div>
                </div>
              </div>

              {/* Chon Gu Am Thuc */}
              <div>
                <label className="block font-bold text-[#462c1a] mb-1.5 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-[#8b3d1b]" />
                  <span>Phong Cách Ẩm Thực Ưu Tiên</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {preferences.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setPreference(p.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                        preference === p.id
                          ? 'border-[#8b3d1b] bg-[#faf0ea]/60 shadow-2xs'
                          : 'border-[#e8dbce] hover:bg-[#faf5ef]'
                      }`}
                    >
                      <div className="font-bold text-[#3a2012] text-xs">{p.label}</div>
                      <div className="text-[10px] text-[#8c7767] mt-0.5">{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ghi chu bo sung */}
              <div>
                <label className="block font-bold text-[#462c1a] mb-1">Ghi Chú Bổ Sung (Tùy Chọn)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Ít cay, có trẻ nhỏ, canh chua thanh..."
                  className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                />
              </div>

              {/* Nut Thuc Hien */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#8b3d1b] hover:bg-[#723216] disabled:bg-[#c49f8e] text-white font-bold rounded-2xl shadow-sm transition flex items-center justify-center gap-2 text-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>{loading ? 'AI Đang Cân Đối Ngũ Vị & Tính Toán...' : 'AI Phối Mâm Cơm Tối Ưu'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Thong tin tom tat mâm com */}
              <div className="bg-[#faf5ef] border border-[#e8dbce] rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-serif font-bold text-base text-[#3a2012]">
                      {recommendation.comboTitle || `Mâm Cơm Gợi Ý Cho ${recommendation.recommendedForPartySize || partySize} Thực Khách`}
                    </div>
                    <div className="text-[11px] text-[#8c7767] mt-0.5">
                      Dành cho {recommendation.recommendedForPartySize || partySize} người
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#8c7767] block">Tổng chi phí</span>
                    <span className="font-serif font-black text-[#8b3d1b] text-base">
                      {formatCurrency(recommendation.totalEstimatedPrice)}
                    </span>
                  </div>
                </div>

                {(recommendation.description || recommendation.culinaryPhilosophy) && (
                  <div className="text-xs text-[#5c3e29] italic leading-relaxed flex items-start gap-1.5 pt-1 border-t border-[#ebdccb]">
                    <Info className="w-4 h-4 text-[#8b3d1b] shrink-0 mt-0.5" />
                    <span>"{recommendation.description || recommendation.culinaryPhilosophy}"</span>
                  </div>
                )}
              </div>

              {/* Danh sach mon an trong mam com */}
              <div className="space-y-2">
                <div className="font-bold text-[#462c1a] text-xs">
                  Danh Sách Món Ăn Trong Mâm Cơm ({recommendation.items.length} món):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {recommendation.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 bg-white rounded-xl border border-[#e8dbce] flex items-center gap-2.5 shadow-2xs"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                          className="w-12 h-12 rounded-lg object-cover bg-[#f0e6da] shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-[#f0e6da] flex items-center justify-center shrink-0 text-[#6d492f]">
                          <Utensils className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[#3a2012] truncate text-xs">{item.name}</div>
                        <div className="text-[10px] text-[#8c7767]">{item.category}</div>
                        <div className="text-[11px] font-bold text-[#8b3d1b] mt-0.5">{formatCurrency(item.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thao tac Them gio hang / Chon lai */}
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
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
