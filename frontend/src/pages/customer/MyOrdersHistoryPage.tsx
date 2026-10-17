import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { bookingApi } from '../../api/client';
import { ReservationOrder } from '../../types';
import { Clock, MapPin, CheckCircle, Clock4, AlertCircle, RefreshCw, Utensils } from 'lucide-react';

export const MyOrdersHistoryPage: React.FC = () => {
  const location = useLocation();
  const [orders, setOrders] = useState<ReservationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const newOrderCode = (location.state as any)?.newOrderCode;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await bookingApi.get<ReservationOrder[]>('/orders/my');
      setOrders(res.data);
    } catch (err: any) {
      console.error('Loi khi tai danh sach don hang', err);
      setError('Không thể tải lịch sử đơn đặt bàn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Chờ xác nhận</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">Đã xác nhận</span>;
      case 'PREPARING':
        return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">Đang nấu</span>;
      case 'SERVED':
        return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">Đã lên món</span>;
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Hoàn tất</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">Đã hủy</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus) {
      case 'PAID':
        return <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[11px] font-bold">Đã thanh toán</span>;
      case 'UNPAID':
        return <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[11px] font-bold">Chưa thanh toán</span>;
      default:
        return <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-full text-[11px] font-bold">{paymentStatus}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Banner chuc mung dat ban thanh cong neu co state tu trang booking */}
      {newOrderCode && (
        <div className="mb-8 p-6 bg-[#ECFDF5] border border-[#A7F3D0] rounded-3xl flex items-start gap-4">
          <CheckCircle className="w-8 h-8 text-[#059669] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-lg text-[#065F46]">
              Đặt bàn thành công!
            </h3>
            <p className="text-sm text-[#047857]">
              Mã đơn đặt bàn của bạn là <strong className="font-mono text-base font-extrabold">{newOrderCode}</strong>.
              Hệ thống đã tự động gửi email xác nhận chi tiết về hòm thư của bạn.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-extrabold text-[#462c1a]">
            Lịch Sử Đặt Bàn & Hóa Đơn
          </h1>
          <p className="text-sm text-[#7d6756] mt-1">
            Theo dõi tiến trình phục vụ và hóa đơn các bữa ăn của bạn tại Bếp Việt
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#e8dbce] rounded-2xl text-xs font-bold text-[#462c1a] hover:bg-[#faf7f2] transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-sm text-[#7d6756] bg-white rounded-3xl border border-[#e8dbce]">
          Đang tải lịch sử đơn...
        </div>
      ) : orders.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-[#e8dbce] space-y-4">
          <Clock4 className="w-12 h-12 text-[#d1c2b4] mx-auto" />
          <p className="font-serif text-xl font-bold text-[#462c1a]">Bạn chưa có đơn đặt bàn nào</p>
          <p className="text-xs text-[#7d6756] max-w-sm mx-auto">
            Hãy khám phá thực đơn truyền thống và đặt trước bàn ăn để tận hưởng trải nghiệm tuyệt vời cùng người thân.
          </p>
          <div className="pt-2">
            <Link
              to="/booking"
              className="inline-block px-6 py-3 bg-[#8B1E0F] text-white rounded-2xl text-sm font-bold hover:bg-[#70180B] transition shadow-md"
            >
              Đặt Bàn Ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const formattedDate = new Date(order.reservationTime).toLocaleString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            });

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#e8dbce] p-6 sm:p-8 shadow-sm space-y-6 hover:shadow-md transition"
              >
                {/* Header card */}
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#e8dbce]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-base font-extrabold text-[#8B1E0F]">
                        #{order.orderCode}
                      </span>
                      {getStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    <p className="text-xs text-[#9c8675]">
                      Tạo lúc: {order.createdAt ? new Date(order.createdAt).toLocaleString('vi-VN') : 'Mới đây'}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[#7d6756] block">Tổng cộng</span>
                    <span className="font-serif text-2xl font-black text-[#8B1E0F]">
                      {order.totalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-[#7d6756] bg-[#faf7f2] p-4 rounded-2xl border border-[#e8dbce]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#8B1E0F]" />
                    <span>Bàn: <strong className="text-[#462c1a]">{order.tableNumber}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#8B1E0F]" />
                    <span>Giờ hẹn: <strong className="text-[#462c1a]">{formattedDate}</strong></span>
                  </div>
                  <div>
                    <span>Khách: <strong className="text-[#462c1a]">{order.partySize} người</strong> ({order.paymentMethod})</span>
                  </div>
                </div>

                {/* Mon an goi kem */}
                {order.items && order.items.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#9c8675] flex items-center gap-2">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Danh sách món gọi ({order.items.length} món)</span>
                    </h4>
                    <div className="divide-y divide-[#e8dbce]/60 border border-[#e8dbce] rounded-2xl overflow-hidden">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-white flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold text-[#462c1a]">{item.menuItemName}</span>
                            <span className="text-[#7d6756] ml-2">x{item.quantity}</span>
                          </div>
                          <span className="font-semibold text-[#8B1E0F]">
                            {item.subtotal.toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
