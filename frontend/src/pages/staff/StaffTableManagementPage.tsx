import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { 
  LayoutGrid, 
  RotateCw, 
  Users, 
  MapPin, 
  CheckCircle2, 
  UtensilsCrossed, 
  AlertCircle,
  Clock,
  X
} from 'lucide-react';
import { catalogApi, bookingApi } from '../../api/client';
import { DiningTable, TableStatus, ReservationOrder } from '../../types';
import { StaffSidebar } from '../../components/layout/StaffSidebar';

export const StaffTableManagementPage: React.FC = () => {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [orders, setOrders] = useState<ReservationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTable, setSelectedTable] = useState<DiningTable | null>(null);
  const [updatingTableId, setUpdatingTableId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      // 1. Tải danh sách toàn bộ bàn ăn
      const tablesRes = await catalogApi.get<DiningTable[]>('/tables');
      setTables(Array.isArray(tablesRes.data) ? tablesRes.data : []);

      // 2. Tải danh sách đơn đặt của nhân viên để map thông tin khách theo bàn
      try {
        const ordersRes = await bookingApi.get<ReservationOrder[]>('/staff/orders');
        setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
      } catch (orderErr) {
        console.warn('Không thể lấy đơn hàng từ booking service:', orderErr);
        setOrders([]);
      }
    } catch (err: any) {
      console.error('Lỗi khi tải dữ liệu bàn ăn:', err);
      setTables([]);
      setError(err.response?.data?.message || 'Không thể tải sơ đồ bàn ăn. Vui lòng kiểm tra Catalog Service (Port 8082).');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    fetchData(true);
  }, []);

  // Cập nhật trạng thái bàn
  const handleUpdateTableStatus = async (tableId: number, newStatus: TableStatus) => {
    setUpdatingTableId(tableId);
    setSuccessMessage(null);
    try {
      const res = await catalogApi.patch<DiningTable>(`/staff/tables/${tableId}/status`, {
        status: newStatus,
      });

      // Cập nhật state cục bộ
      setTables((prev) =>
        prev.map((t) => (t.id === tableId ? { ...t, status: res.data.status } : t))
      );
      if (selectedTable && selectedTable.id === tableId) {
        setSelectedTable({ ...selectedTable, status: res.data.status });
      }

      setSuccessMessage(`Đã cập nhật trạng thái bàn sang ${newStatus}`);
    } catch (err: any) {
      console.error('Lỗi khi cập nhật trạng thái bàn:', err);
      alert(err.response?.data?.message || 'Lỗi khi cập nhật trạng thái bàn ăn.');
    } finally {
      setUpdatingTableId(null);
      setTimeout(() => setSuccessMessage(null), 3500);
    }
  };

  // Danh sách các khu vực duy nhất
  const uniqueAreas = useMemo(() => {
    if (!Array.isArray(tables)) return ['ALL'];
    const areas = new Set(tables.map((t) => t.area || 'Khu vực chung'));
    return ['ALL', ...Array.from(areas)];
  }, [tables]);

  // Bộ lọc bàn
  const filteredTables = useMemo(() => {
    if (!Array.isArray(tables)) return [];
    return tables.filter((t) => {
      const areaMatch = selectedArea === 'ALL' || (t.area || 'Khu vực chung') === selectedArea;
      const statusMatch = selectedStatus === 'ALL' || t.status === selectedStatus;
      return areaMatch && statusMatch;
    });
  }, [tables, selectedArea, selectedStatus]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    if (!Array.isArray(tables)) return { total: 0, available: 0, occupied: 0, reserved: 0 };
    const total = tables.length;
    const available = tables.filter((t) => t.status === 'AVAILABLE').length;
    const occupied = tables.filter((t) => t.status === 'OCCUPIED').length;
    const reserved = tables.filter((t) => t.status === 'RESERVED').length;
    return { total, available, occupied, reserved };
  }, [tables]);

  // Lấy đơn hoạt động gần nhất của bàn nếu có
  const getActiveOrderByTable = (tableId: number, tableNumber: string) => {
    if (!Array.isArray(orders)) return undefined;
    return orders.find(
      (o) =>
        (o.tableId === tableId || o.tableNumber === tableNumber) &&
        o.status !== 'COMPLETED' &&
        o.status !== 'CANCELLED'
    );
  };


  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          cardBg: 'bg-emerald-50/60 hover:bg-emerald-50 border-emerald-300',
          badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          dotBg: 'bg-emerald-500',
          label: 'Bàn Trống',
        };
      case 'OCCUPIED':
        return {
          cardBg: 'bg-rose-50/60 hover:bg-rose-50 border-rose-300',
          badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
          dotBg: 'bg-rose-500',
          label: 'Đang Có Khách',
        };
      case 'RESERVED':
        return {
          cardBg: 'bg-amber-50/60 hover:bg-amber-50 border-amber-300',
          badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
          dotBg: 'bg-amber-500',
          label: 'Đã Đặt Trước',
        };
      default:
        return {
          cardBg: 'bg-stone-50 border-stone-200',
          badgeBg: 'bg-stone-100 text-stone-800 border-stone-200',
          dotBg: 'bg-stone-400',
          label: status,
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] flex flex-col md:flex-row">
      {/* Thanh bên Nhân viên */}
      <StaffSidebar />

      {/* Vùng nội dung chính */}
      <div className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        {/* Header trang & Thống kê */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-[#e8dbce] shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#6d492f] text-white flex items-center justify-center shadow">
                <LayoutGrid className="w-5 h-5 text-[#d7bda0]" />
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#462c1a]">
                Sơ Đồ Bàn & Tiếp Nhận Khách
              </h1>
            </div>
            <p className="text-xs text-[#7d6756] mt-1">
              Quản lý vị trí, kiểm soát bàn trống và tiếp đón thực khách vào bàn thời gian thực
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => fetchData(false)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#f3ece3] hover:bg-[#e8dcce] text-[#6d492f] text-xs font-bold rounded-xl border border-[#d7bda0]/70 transition shadow-sm"
              title="Làm mới trạng thái bàn"
            >
              <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Đang tải...' : 'Làm Mới'}</span>
            </button>
          </div>
        </div>

        {/* Thông báo thành công */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Thống kê bàn theo trạng thái (KPI Cards) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#e8dbce] shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#f3ece3] text-[#6d492f] flex items-center justify-center font-bold">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#8c6d60] uppercase">Tổng số bàn</p>
              <p className="text-xl font-serif font-bold text-[#462c1a]">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-500"></span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-800 uppercase">Bàn sẵn sàng</p>
              <p className="text-xl font-serif font-bold text-emerald-900">{stats.available}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <span className="w-3.5 h-3.5 rounded-full bg-rose-500"></span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-rose-800 uppercase">Đang có khách</p>
              <p className="text-xl font-serif font-bold text-rose-900">{stats.occupied}</p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <span className="w-3.5 h-3.5 rounded-full bg-amber-500"></span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-amber-800 uppercase">Đã đặt trước</p>
              <p className="text-xl font-serif font-bold text-amber-900">{stats.reserved}</p>
            </div>
          </div>
        </div>

        {/* Thanh lọc theo khu vực và trạng thái */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8dbce] shadow-sm flex flex-col md:flex-row justify-between gap-4 items-stretch md:items-center">
          {/* Lọc theo khu vực */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <span className="text-xs font-bold text-[#8c6d60] whitespace-nowrap pl-1">
              Khu vực:
            </span>
            {uniqueAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setSelectedArea(area)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedArea === area
                    ? 'bg-[#6d492f] text-white shadow-sm'
                    : 'bg-[#faf7f2] text-[#6d492f] hover:bg-[#f3ece3] border border-[#e8dbce]'
                }`}
              >
                {area === 'ALL' ? 'Tất cả khu vực' : area}
              </button>
            ))}
          </div>

          {/* Lọc theo trạng thái bàn */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-bold text-[#8c6d60] pr-1">Trạng thái:</span>
            {[
              { value: 'ALL', label: 'Tất cả' },
              { value: 'AVAILABLE', label: 'Trống' },
              { value: 'OCCUPIED', label: 'Có khách' },
              { value: 'RESERVED', label: 'Đã đặt' },
            ].map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => setSelectedStatus(st.value)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  selectedStatus === st.value
                    ? 'bg-[#462c1a] text-white'
                    : 'bg-[#faf7f2] text-[#7d6756] hover:bg-[#f3ece3] border border-[#e8dbce]'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hiển thị Loading / Lỗi */}
        {loading && (
          <div className="bg-white p-12 rounded-2xl border border-[#e8dbce] text-center space-y-3">
            <div className="w-10 h-10 border-4 border-[#6d492f] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-semibold text-[#7d6756]">Đang tải dữ liệu bàn ăn...</p>
          </div>
        )}

        {error && !loading && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
            <p className="text-xs font-bold">{error}</p>
            <button
              onClick={() => fetchData(true)}
              className="text-xs text-rose-700 underline font-semibold mt-1"
            >
              Thử tải lại dữ liệu
            </button>
          </div>
        )}

        {/* Lưới hiển thị Sơ Đồ Bàn */}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTables.map((table) => {
              const color = getStatusColor(table.status);
              const activeOrder = getActiveOrderByTable(table.id, table.tableNumber);
              const isUpdating = updatingTableId === table.id;

              return (
                <div
                  key={table.id}
                  onClick={() => setSelectedTable(table)}
                  className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 relative flex flex-col justify-between shadow-sm hover:shadow-md ${color.cardBg}`}
                >
                  {/* Góc trên: Mã bàn và Trạng thái */}
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-[#462c1a] leading-tight">
                          {table.tableNumber}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#7d6756] mt-1 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#b84a28]" />
                          <span>{table.area}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${color.badgeBg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${color.dotBg}`}></span>
                          {color.label}
                        </span>
                      </div>
                    </div>

                    {/* Sức chứa bàn */}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-[#6d492f] bg-white/70 px-2.5 py-1.5 rounded-xl border border-[#e8dbce]">
                      <Users className="w-3.5 h-3.5 text-[#b84a28]" />
                      <span className="font-semibold">Sức chứa: {table.capacity} khách</span>
                    </div>

                    {/* Thông tin đơn gắn với bàn nếu có */}
                    {activeOrder && (
                      <div className="mt-2.5 bg-white p-2.5 rounded-xl border border-[#e8dbce] text-[11px] space-y-1">
                        <div className="flex justify-between items-center text-[#462c1a] font-bold">
                          <span>{activeOrder.customerName}</span>
                          <span className="text-[#b84a28]">#{activeOrder.orderCode}</span>
                        </div>
                        <div className="text-[#8c6d60] flex items-center gap-1 text-[10px]">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(activeOrder.reservationTime).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          <span>• {activeOrder.partySize} khách</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Thanh nút thao tác nhanh đổi trạng thái */}
                  <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-bold text-[#8c6d60] uppercase">
                      Đổi nhanh:
                    </span>
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      {table.status !== 'AVAILABLE' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateTableStatus(table.id, 'AVAILABLE')}
                          className="px-2 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-xs"
                          title="Giải phóng bàn sang Trống"
                        >
                          Trống
                        </button>
                      )}
                      {table.status !== 'OCCUPIED' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateTableStatus(table.id, 'OCCUPIED')}
                          className="px-2 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition shadow-xs"
                          title="Xác nhận khách đang ngồi"
                        >
                          Có khách
                        </button>
                      )}
                      {table.status !== 'RESERVED' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleUpdateTableStatus(table.id, 'RESERVED')}
                          className="px-2 py-1 text-[10px] font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition shadow-xs"
                          title="Đổi sang Đã đặt trước"
                        >
                          Đã đặt
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal chi tiết bàn khi nhân viên bấm chọn */}
        {selectedTable && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
            <div 
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
              onClick={() => setSelectedTable(null)}
              aria-hidden="true"
            />
            <div className="relative z-10 bg-white rounded-3xl max-w-md w-full border border-[#e8dbce] shadow-2xl p-6 space-y-5 my-auto animate-fadeIn">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="w-5 h-5 text-[#b84a28]" />
                    <h3 className="font-serif text-xl font-bold text-[#462c1a]">
                      Chi Tiết {selectedTable.tableNumber}
                    </h3>
                  </div>
                  <p className="text-xs text-[#7d6756] mt-0.5">
                    Khu vực: {selectedTable.area} • Sức chứa: {selectedTable.capacity} khách
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTable(null)}
                  className="p-1 rounded-lg hover:bg-stone-100 transition"
                  aria-label="Đóng hộp thoại"
                >
                  <X className="w-5 h-5 text-stone-400 hover:text-stone-600" />
                </button>
              </div>

              {/* Tình trạng hiện tại */}
              <div className="bg-[#faf7f2] p-4 rounded-2xl border border-[#e8dbce] space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#8c6d60] font-semibold">Trạng thái hiện tại:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-full border ${
                      getStatusColor(selectedTable.status).badgeBg
                    }`}
                  >
                    {getStatusColor(selectedTable.status).label}
                  </span>
                </div>

                {/* Kiểm tra đơn gắn với bàn */}
                {(() => {
                  const act = getActiveOrderByTable(selectedTable.id, selectedTable.tableNumber);
                  if (act) {
                    return (
                      <div className="pt-2 border-t border-[#e8dbce] text-xs space-y-1">
                        <p className="font-bold text-[#462c1a]">Khách đang dùng bữa / đặt chỗ:</p>
                        <p className="text-[#6d492f]">
                          {act.customerName} - {act.customerPhone} ({act.partySize} người)
                        </p>
                        <p className="text-[11px] text-[#8c6d60]">
                          Mã đơn: <span className="font-mono font-bold">#{act.orderCode}</span>
                        </p>
                      </div>
                    );
                  }
                  return (
                    <p className="text-[11px] text-[#8c6d60] italic pt-1">
                      Bàn hiện không có đơn gọi món nào đang hoạt động.
                    </p>
                  );
                })()}
              </div>

              {/* Tùy chọn chuyển đổi trạng thái */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#462c1a]">Thiết lập trạng thái bàn:</p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    disabled={updatingTableId === selectedTable.id || selectedTable.status === 'AVAILABLE'}
                    onClick={() => handleUpdateTableStatus(selectedTable.id, 'AVAILABLE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      selectedTable.status === 'AVAILABLE'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    Bàn Trống
                  </button>

                  <button
                    type="button"
                    disabled={updatingTableId === selectedTable.id || selectedTable.status === 'OCCUPIED'}
                    onClick={() => handleUpdateTableStatus(selectedTable.id, 'OCCUPIED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      selectedTable.status === 'OCCUPIED'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Đang Có Khách
                  </button>

                  <button
                    type="button"
                    disabled={updatingTableId === selectedTable.id || selectedTable.status === 'RESERVED'}
                    onClick={() => handleUpdateTableStatus(selectedTable.id, 'RESERVED')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border ${
                      selectedTable.status === 'RESERVED'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    Đã Đặt Trước
                  </button>
                </div>
              </div>

              {/* Nút đóng */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTable(null)}
                  className="w-full py-2.5 bg-[#f3ece3] hover:bg-[#e8dcce] text-[#6d492f] text-xs font-bold rounded-xl transition"
                >
                  Đóng Hộp Thoại
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};
