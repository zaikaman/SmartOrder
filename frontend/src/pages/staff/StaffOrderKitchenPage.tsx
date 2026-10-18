import React, { useEffect, useState, useMemo } from 'react';
import { 
  ChefHat, 
  RotateCw, 
  Search, 
  Clock, 
  Users, 
  Banknote, 
  CheckCircle2, 
  CookingPot, 
  AlertCircle, 
  XCircle,
  FileText
} from 'lucide-react';
import { bookingApi } from '../../api/client';
import { ReservationOrder, OrderStatus } from '../../types';
import { StaffSidebar } from '../../components/layout/StaffSidebar';

export const StaffOrderKitchenPage: React.FC = () => {
  const [orders, setOrders] = useState<ReservationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchOrders = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      const url = selectedStatus === 'ALL' 
        ? '/api/v1/staff/orders' 
        : `/api/v1/staff/orders?status=${selectedStatus}`;
      const res = await bookingApi.get<ReservationOrder[]>(url);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách đơn hàng:', err);
      setOrders([]);
      setError(err.response?.data?.message || 'Không thể tải danh sách đơn món. Vui lòng kiểm tra Booking Service (Port 8083).');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);
  }, [selectedStatus]);

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = async (orderId: number, newStatus: OrderStatus) => {
    setActionLoadingId(orderId);
    setSuccessMessage(null);
    try {
      await bookingApi.patch(`/api/v1/staff/orders/${orderId}/status`, {
        status: newStatus,
      });
      setSuccessMessage(`Đã cập nhật trạng thái đơn sang ${newStatus}`);
      await fetchOrders(false);
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái đơn:', err);
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn.');
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Xác nhận thu tiền mặt tại quầy
  const handlePayCash = async (orderId: number) => {
    if (!window.confirm('Xác nhận thu tiền mặt tại quầy và hoàn tất đơn này?')) {
      return;
    }
    setActionLoadingId(orderId);
    setSuccessMessage(null);
    try {
      await bookingApi.post(`/api/v1/staff/orders/${orderId}/pay-cash`);
      setSuccessMessage('Xác nhận thanh toán tiền mặt thành công! Đã giải phóng bàn.');
      await fetchOrders(false);
    } catch (err: any) {
      console.error('Lỗi khi thu tiền mặt:', err);
      alert(err.response?.data?.message || 'Không thể hoàn tất thanh toán tiền mặt.');
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Lọc theo tìm kiếm từ khóa
  const filteredOrders = useMemo(() => {
    if (!Array.isArray(orders)) return [];
    return orders.filter((o) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        (o.orderCode && o.orderCode.toLowerCase().includes(q)) ||
        (o.tableNumber && o.tableNumber.toLowerCase().includes(q)) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)) ||
        (o.customerPhone && o.customerPhone.toLowerCase().includes(q))
      );
    });
  }, [orders, searchQuery]);


  // Phân loại trạng thái nhãn và màu sắc
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: 'Chờ Tiếp Nhận',
        };
      case 'CONFIRMED':
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          label: 'Đã Tiếp Nhận',
        };
      case 'PREPARING':
        return {
          bg: 'bg-orange-100 text-orange-900 border-orange-300',
          label: 'Đang Nấu',
        };
      case 'SERVED':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          label: 'Đã Phục Vụ',
        };
      case 'COMPLETED':
        return {
          bg: 'bg-zinc-100 text-zinc-800 border-zinc-300',
          label: 'Hoàn Tất',
        };
      case 'CANCELLED':
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          label: 'Đã Hủy',
        };
      default:
        return {
          bg: 'bg-stone-100 text-stone-800 border-stone-300',
          label: status,
        };
    }
  };

  const statusOptions = [
    { value: 'ALL', label: 'Tất cả đơn' },
    { value: 'PENDING', label: 'Chờ tiếp nhận' },
    { value: 'CONFIRMED', label: 'Đã xác nhận' },
    { value: 'PREPARING', label: 'Bếp đang nấu' },
    { value: 'SERVED', label: 'Đã lên món' },
    { value: 'COMPLETED', label: 'Đã hoàn tất' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col md:flex-row">
      {/* Thanh bên Nhân viên */}
      <StaffSidebar />

      {/* Vùng nội dung trung tâm */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Tiêu đề & Công cụ thao tác nhanh */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e8dbce] shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#6d492f] text-white flex items-center justify-center shadow">
                <ChefHat className="w-5 h-5 text-[#d7bda0]" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#462c1a]">
                Bếp & Điều Phối Món Ăn
              </h1>
            </div>
            <p className="text-xs text-[#7d6756] mt-1">
              Tiếp nhận đơn, cập nhật tiến độ nấu và xác nhận phục vụ cho thực khách
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchOrders(false)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#f3ece3] hover:bg-[#e8dcce] text-[#6d492f] text-xs font-bold rounded-xl border border-[#d7bda0]/70 transition shadow-sm"
              title="Làm mới danh sách đơn"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Đang tải...' : 'Làm Mới'}</span>
            </button>
          </div>
        </div>

        {/* Thông báo thành công nếu có */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Thanh tìm kiếm & Bộ lọc trạng thái */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8dbce] shadow-sm space-y-3">
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Input tìm kiếm */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8c6d60] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm mã đơn, số bàn (Bàn 01), tên khách hàng hoặc SĐT..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#faf7f2] border border-[#e8dbce] rounded-xl text-xs text-[#462c1a] focus:outline-none focus:border-[#6d492f] transition"
              />
            </div>

            {/* Đếm số lượng đơn */}
            <div className="text-xs text-[#7d6756] font-medium px-2 flex items-center gap-1.5 shrink-0">
              <span>Tổng số:</span>
              <span className="font-bold text-[#b84a28] bg-[#fbf5ee] px-2 py-0.5 rounded-md border border-[#e8dbce]">
                {filteredOrders.length} đơn
              </span>
            </div>
          </div>

          {/* Tab nút lọc trạng thái */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 scrollbar-thin">
            {statusOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSelectedStatus(opt.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedStatus === opt.value
                    ? 'bg-[#6d492f] text-white shadow-sm'
                    : 'bg-[#faf7f2] text-[#6d492f] hover:bg-[#f3ece3] border border-[#e8dbce]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Trạng thái Loading hoặc Lỗi */}
        {loading && (
          <div className="bg-white p-12 rounded-2xl border border-[#e8dbce] text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#6d492f] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-[#7d6756]">Đang tải dữ liệu từ máy chủ...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p className="text-xs font-bold">{error}</p>
            <button
              onClick={() => fetchOrders(true)}
              className="text-xs text-rose-700 underline font-semibold mt-1"
            >
              Bấm để thử lại
            </button>
          </div>
        )}

        {/* Danh sách đơn hàng */}
        {!loading && !error && filteredOrders.length === 0 && (
          <div className="bg-white p-12 rounded-2xl border border-[#e8dbce] text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#f3ece3] text-[#6d492f] flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6 text-[#b84a28]" />
            </div>
            <h3 className="font-serif text-lg font-bold text-[#462c1a]">
              Không có đơn hàng nào phù hợp
            </h3>
            <p className="text-xs text-[#7d6756] max-w-sm mx-auto">
              Hiện tại không có đơn gọi món hoặc đặt bàn nào trong trạng thái đã chọn.
            </p>
          </div>
        )}

        {!loading && !error && filteredOrders.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredOrders.map((order) => {
              const badge = getStatusBadge(order.status);
              const isBusy = actionLoadingId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#e8dbce] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
                >
                  {/* Header thẻ đơn hàng */}
                  <div className="p-4 sm:p-5 bg-gradient-to-r from-[#faf7f2] to-white border-b border-[#f0e6dc]">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif font-bold text-base text-[#462c1a]">
                            {order.tableNumber}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-[#8c6d60] bg-white px-2 py-0.5 rounded border border-[#e8dbce]">
                            #{order.orderCode}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-[#7d6756]">
                          <span className="font-semibold text-[#462c1a]">
                            {order.customerName}
                          </span>
                          {order.customerPhone && (
                            <span>• {order.customerPhone}</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-[#b84a28]" />
                            {order.partySize} khách
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-[10px] text-[#8c6d60] flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(order.reservationTime).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}{' '}
                          -{' '}
                          {new Date(order.reservationTime).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>

                    {order.note && (
                      <div className="mt-3 text-xs bg-[#fdfbf7] p-2.5 rounded-xl border border-[#f0e6dc] text-[#6d492f]">
                        <span className="font-bold">Ghi chú của khách:</span> {order.note}
                      </div>
                    )}
                  </div>

                  {/* Chi tiết danh sách món */}
                  <div className="p-4 sm:p-5 space-y-3 flex-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#a08272]">
                      Món ăn gọi trước ({order.items?.length || 0} món):
                    </p>

                    {order.items && order.items.length > 0 ? (
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-start text-xs py-1.5 border-b border-[#f6f0ea] last:border-b-0"
                          >
                            <div className="space-y-0.5 flex-1 pr-3">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#b84a28] bg-[#fbf5ee] px-1.5 py-0.5 rounded text-[11px] border border-[#e8dbce]">
                                  x{item.quantity}
                                </span>
                                <span className="font-medium text-[#462c1a]">
                                  {item.menuItemName}
                                </span>
                              </div>
                              {item.note && (
                                <p className="text-[11px] text-amber-700 italic pl-6">
                                  Lưu ý: {item.note}
                                </p>
                              )}
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-semibold text-[#6d492f]">
                                {new Intl.NumberFormat('vi-VN').format(item.subtotal)} đ
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8c6d60] italic py-2">
                        (Chưa gọi món trước - Đơn chỉ đặt chỗ bàn)
                      </p>
                    )}

                    {/* Tổng tiền & Phương thức thanh toán */}
                    <div className="pt-3 border-t border-[#f0e6dc] flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[#8c6d60] block text-[11px]">Thanh toán:</span>
                        <span className="font-bold text-[#462c1a]">
                          {order.paymentMethod === 'VNPAY' ? 'Cổng VNPAY' : 'Tiền mặt tại quầy'}
                        </span>
                        <span
                          className={`inline-block ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {order.paymentStatus === 'PAID' ? 'Đã Thanh Toán' : 'Chưa Thu Tiền'}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[#8c6d60] text-[11px] block">Tổng cộng:</span>
                        <span className="font-serif font-bold text-base text-[#b84a28]">
                          {new Intl.NumberFormat('vi-VN').format(order.totalAmount)} đ
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thanh nút bấm hành động theo từng bước trạng thái */}
                  <div className="p-4 bg-[#faf7f2] border-t border-[#f0e6dc] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Nút hủy đơn khi chưa nấu */}
                      {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => {
                            if (window.confirm(`Xác nhận hủy đơn ${order.orderCode}?`)) {
                              handleUpdateStatus(order.id, 'CANCELLED');
                            }
                          }}
                          className="px-3 py-1.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 rounded-lg border border-rose-200 transition font-semibold"
                        >
                          <XCircle className="w-3.5 h-3.5 inline mr-1" />
                          Hủy đơn
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* 1. Từ PENDING -> CONFIRMED */}
                      {order.status === 'PENDING' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                          className="px-3.5 py-1.5 bg-[#6d492f] hover:bg-[#533722] text-white text-xs font-bold rounded-xl transition shadow-sm"
                        >
                          {isBusy ? 'Đang cập nhật...' : 'Xác Nhận Đơn'}
                        </button>
                      )}

                      {/* 2. Từ CONFIRMED -> PREPARING (Bếp bắt đầu nấu) */}
                      {order.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <CookingPot className="w-3.5 h-3.5" />
                          {isBusy ? 'Đang cập nhật...' : 'Bắt Đầu Nấu'}
                        </button>
                      )}

                      {/* 3. Từ PREPARING -> SERVED (Đã nấu xong, mang lên bàn) */}
                      {order.status === 'PREPARING' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(order.id, 'SERVED')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isBusy ? 'Đang cập nhật...' : 'Đã Phục Vụ Xong'}
                        </button>
                      )}

                      {/* 4. Khi Đã phục vụ: Thu tiền mặt tại quầy nếu chưa trả */}
                      {order.status === 'SERVED' && order.paymentStatus !== 'PAID' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handlePayCash(order.id)}
                          className="px-3.5 py-1.5 bg-[#b84a28] hover:bg-[#963c20] text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <Banknote className="w-3.5 h-3.5" />
                          {isBusy ? 'Đang xử lý...' : 'Thu Tiền Mặt & Trả Bàn'}
                        </button>
                      )}

                      {/* 5. Khi Đã phục vụ và ĐÃ trả tiền VNPAY: Hoàn tất đơn và giải phóng bàn */}
                      {order.status === 'SERVED' && order.paymentStatus === 'PAID' && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isBusy ? 'Đang xử lý...' : 'Hoàn Tất Đơn & Giải Phóng Bàn'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};
