import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { catalogApi, bookingApi } from '../../api/client';
import { DiningTable, PaymentMethod, CreateOrderRequest } from '../../types';
import { Calendar, Utensils, CheckCircle2, AlertCircle, ArrowRight, MapPin, Info } from 'lucide-react';

export const BookingAndOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryTableId = searchParams.get('tableId');

  const { user } = useAuthStore();
  const { items, clearCart, getTotalAmount, tableId: preselectedTableId, setTable } = useCartStore();

  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tableNotice, setTableNotice] = useState<string | null>(null);

  // Form states
  const [selectedTableId, setSelectedTableId] = useState<number>(() => {
    if (queryTableId) return Number(queryTableId);
    return preselectedTableId || 0;
  });
  const [date, setDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1); // Mac dinh ngay mai
    return today.toISOString().split('T')[0];
  });
  const [time, setTime] = useState('18:30');
  const [partySize, setPartySize] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VNPAY');
  const [note, setNote] = useState('');

  // Thong tin lien he khach hang
  const [customerName, setCustomerName] = useState(user?.fullName || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '0901234567');

  useEffect(() => {
    const fetchTables = async () => {
      try {
        setLoadingTables(true);
        const res = await catalogApi.get<DiningTable[]>('/tables');
        const tableList = res.data;
        setTables(tableList);

        const targetId = queryTableId ? Number(queryTableId) : preselectedTableId;
        if (targetId) {
          const matched = tableList.find((t) => t.id === targetId);
          if (matched) {
            if (matched.status === 'AVAILABLE') {
              setSelectedTableId(matched.id);
              setTable(matched.id, matched.tableNumber);
            } else {
              setTableNotice(`Bàn ${matched.tableNumber} hiện ${matched.status === 'OCCUPIED' ? 'đang có khách' : 'đã có người đặt'}. Quý khách vui lòng chọn bàn còn trống khác.`);
              const firstAvail = tableList.find((t) => t.status === 'AVAILABLE');
              if (firstAvail) {
                setSelectedTableId(firstAvail.id);
                setTable(firstAvail.id, firstAvail.tableNumber);
              }
            }
            return;
          }
        }

        // Default to first available table
        const firstAvail = tableList.find((t) => t.status === 'AVAILABLE');
        if (firstAvail) {
          setSelectedTableId(firstAvail.id);
          setTable(firstAvail.id, firstAvail.tableNumber);
        } else if (tableList.length > 0) {
          setSelectedTableId(tableList[0].id);
        }
      } catch (err) {
        console.error('Lỗi khi tải danh sách bàn', err);
      } finally {
        setLoadingTables(false);
      }
    };
    fetchTables();
  }, [queryTableId, preselectedTableId, setTable]);

  const selectedTable = tables.find((t) => t.id === selectedTableId);
  const totalFoodAmount = getTotalAmount();

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTableId) {
      setError('Vui lòng chọn bàn ăn bạn muốn đặt.');
      return;
    }

    if (selectedTable && selectedTable.status !== 'AVAILABLE') {
      setError('Bàn bạn chọn hiện không còn trống. Vui lòng chọn bàn có trạng thái Trống.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // Chuyen date va time thanh ISO string
      const reservationDateTime = new Date(`${date}T${time}:00`);

      const orderPayload: CreateOrderRequest = {
        tableId: selectedTableId,
        reservationTime: reservationDateTime.toISOString(),
        partySize,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        note: note.trim() || undefined,
        paymentMethod,
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          note: i.note,
        })),
      };

      const res = await bookingApi.post('/orders', orderPayload);
      const createdOrder = res.data;

      // Xoa gio hang sau khi dat thanh cong
      clearCart();

      // Chuyen sang trang lich su don hoac trang thong bao
      navigate('/my-orders', {
        state: { newOrderCode: createdOrder.orderCode },
      });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Có lỗi xảy ra khi tạo đơn đặt bàn.';
      setError(typeof msg === 'string' ? msg : 'Không thể hoàn tất đặt bàn.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Title */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#462c1a]">
          Đặt Bàn Trước & Chọn Món
        </h1>
        <p className="text-sm text-[#7d6756] mt-2">
          Chọn vị trí không gian ấm cúng tại Bếp Việt, xác nhận thời gian dùng bữa và gọi trước những món ngon truyền thống.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {tableNotice && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-sm">
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-600" />
          <span>{tableNotice}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cot 1 & 2: Thong tin thoi gian & Chon ban */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Thoi gian & So luong khach */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dbce] shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#462c1a] flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#8B1E0F]" />
              <span>1. Thời Gian & Số Lượng Khách</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-2">
                  Ngày Dùng Bữa *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] text-[#462c1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-2">
                  Giờ Dùng Bữa *
                </label>
                <div className="relative">
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] text-[#462c1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-2">
                  Số Lượng Khách *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] text-[#462c1a]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Chon ban an */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dbce] shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-[#462c1a] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#8B1E0F]" />
                <span>2. Chọn Vị Trí Bàn Ăn</span>
              </h2>
              {selectedTable && (
                <span className="text-xs font-bold px-3 py-1 bg-[#8B1E0F]/10 text-[#8B1E0F] rounded-full">
                  Đã chọn: Bàn {selectedTable.tableNumber} ({selectedTable.area})
                </span>
              )}
            </div>

            {loadingTables ? (
              <div className="p-8 text-center text-sm text-[#7d6756]">Đang tải sơ đồ bàn...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {tables.map((table) => {
                  const isSelected = selectedTableId === table.id;
                  const isAvailable = table.status === 'AVAILABLE';

                  return (
                    <button
                      type="button"
                      key={table.id}
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedTableId(table.id);
                        setTable(table.id, table.tableNumber);
                      }}
                      className={`p-4 rounded-2xl border text-left transition ${
                        !isAvailable
                          ? 'border-[#e8dbce]/50 bg-stone-100/70 text-stone-400 opacity-60 cursor-not-allowed'
                          : isSelected
                          ? 'border-[#8B1E0F] bg-[#FFF8F0] ring-2 ring-[#8B1E0F]/20'
                          : 'border-[#e8dbce] bg-[#faf7f2]/50 hover:bg-[#faf7f2]'
                      }`}
                      title={!isAvailable ? `Bàn đang ${table.status === 'OCCUPIED' ? 'có khách ngồi' : 'đã được đặt trước'}` : `Bàn trống: ${table.tableNumber}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold text-sm ${isAvailable ? 'text-[#462c1a]' : 'text-stone-500'}`}>
                          Bàn {table.tableNumber}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#8B1E0F]" />}
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs text-[#7d6756]">{table.area}</p>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          table.status === 'AVAILABLE'
                            ? 'bg-[#2d5a27]/10 text-[#2d5a27]'
                            : table.status === 'OCCUPIED'
                            ? 'bg-[#b84a28]/10 text-[#b84a28]'
                            : 'bg-[#c85a17]/10 text-[#c85a17]'
                        }`}>
                          {table.status === 'AVAILABLE' ? 'Trống' : table.status === 'OCCUPIED' ? 'Có khách' : 'Đã đặt'}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#9c8675] mt-2">Sức chứa: {table.capacity} người</p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 3: Thong tin nguoi dat & Ghi chu */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dbce] shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#462c1a]">
              3. Thông Tin Liên Hệ & Ghi Chú
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-2">
                  Tên Khách Hàng *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm text-[#462c1a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-2">
                  Email Nhận Xác Nhận *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm text-[#462c1a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-2">
                  Số Điện Thoại *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm text-[#462c1a]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-2">
                Ghi Chú Cho Nhà Hàng
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="vd: Bàn gần cửa sổ, có trẻ nhỏ, chuẩn bị ghế trẻ em..."
                className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm text-[#462c1a]"
              />
            </div>
          </div>
        </div>

        {/* Cot 3: Tom tat don hang & Thanh toan */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dbce] shadow-sm space-y-6 sticky top-24">
            <h2 className="font-serif text-xl font-bold text-[#462c1a] flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#8B1E0F]" />
              <span>Tóm Tắt Đặt Bàn</span>
            </h2>

            {/* Thong tin ban */}
            <div className="p-4 rounded-2xl bg-[#faf7f2] border border-[#e8dbce] text-xs space-y-1.5 text-[#7d6756]">
              <p>
                <strong className="text-[#462c1a]">Vị trí bàn:</strong> {selectedTable?.tableNumber || 'Chưa chọn'} ({selectedTable?.area})
              </p>
              <p>
                <strong className="text-[#462c1a]">Thời gian:</strong> {time} ngày {date}
              </p>
              <p>
                <strong className="text-[#462c1a]">Số khách:</strong> {partySize} người
              </p>
            </div>

            {/* Danh sach mon an */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#9c8675]">
                Món Gọi Kèm ({items.length} món)
              </h3>
              {items.length === 0 ? (
                <p className="text-xs text-[#7d6756] italic">
                  Chưa có món nào. Bạn có thể đặt bàn trước và gọi món sau khi đến nhà hàng.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {items.map((i) => (
                    <div key={i.menuItem.id} className="flex justify-between items-center text-xs">
                      <span className="text-[#462c1a] truncate max-w-[150px]">
                        {i.menuItem.name} <span className="text-[#7d6756]">x{i.quantity}</span>
                      </span>
                      <span className="font-bold text-[#8B1E0F]">
                        {(i.menuItem.price * i.quantity).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phuong thuc thanh toan */}
            <div className="space-y-2 pt-2 border-t border-[#e8dbce]">
              <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider">
                Phương Thức Thanh Toán
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                    paymentMethod === 'VNPAY'
                      ? 'border-[#8B1E0F] bg-[#8B1E0F] text-white'
                      : 'border-[#d1c2b4] text-[#462c1a] bg-[#faf7f2]'
                  }`}
                >
                  VNPAY Trực Tuyến
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-xl border text-xs font-bold transition text-center ${
                    paymentMethod === 'CASH'
                      ? 'border-[#8B1E0F] bg-[#8B1E0F] text-white'
                      : 'border-[#d1c2b4] text-[#462c1a] bg-[#faf7f2]'
                  }`}
                >
                  Tiền Mặt Tại Quầy
                </button>
              </div>
            </div>

            {/* Tong tien */}
            <div className="pt-4 border-t border-[#e8dbce] flex justify-between items-center">
              <span className="text-sm font-bold text-[#462c1a]">Tổng tiền dự kiến:</span>
              <span className="font-serif text-2xl font-black text-[#8B1E0F]">
                {totalFoodAmount.toLocaleString('vi-VN')} đ
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-white font-bold text-sm bg-[#8B1E0F] hover:bg-[#70180B] active:scale-[0.99] transition shadow-lg disabled:opacity-50"
            >
              <span>{submitting ? 'Đang Xử Lý...' : 'Xác Nhận Đặt Bàn & Gửi Email'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
