import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutGrid, Info, ShieldCheck } from 'lucide-react';
import { catalogApi } from '../../api/client';
import { DiningTable } from '../../types';
import { TableCard } from '../../components/common/TableCard';
import { useAuthStore } from '../../store/useAuthStore';

export const TableLookupPage: React.FC = () => {
  const { user } = useAuthStore();
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        const params: Record<string, any> = {};
        if (selectedStatus !== 'ALL') {
          params.status = selectedStatus;
        }
        if (selectedArea !== 'ALL') {
          params.area = selectedArea;
        }
        if (minCapacity > 0) {
          params.minCapacity = minCapacity;
        }

        const res = await catalogApi.get<DiningTable[]>('/tables', { params });
        setTables(res.data);
      } catch (err) {
        console.error('Không thể tải sơ đồ bàn', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, [selectedArea, selectedStatus, minCapacity]);

  const areas = ['ALL', 'Tầng 1', 'Tầng 2', 'Phòng VIP'];

  return (
    <div className="min-h-screen bg-[#faf7f2] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2 border-b border-[#e8dbce] pb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ece3] border border-[#d7bda0]/70 text-[#6d492f] text-xs font-semibold uppercase tracking-wider">
            <LayoutGrid className="w-3.5 h-3.5 text-[#b84a28]" />
            Sơ Đồ Bàn Ăn Bếp Việt
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#462c1a]">
            Tra Cứu Bàn Trống & Đặt Chỗ Trực Tuyến
          </h1>
          <p className="text-sm text-[#7d6756] max-w-xl mx-auto">
            Xem trực quan trạng thái bàn ăn theo từng tầng và khu vực phòng VIP.
            Quý khách có thể lựa chọn bàn còn trống để đặt bàn trước kèm gọi món cho bữa tiệc.
          </p>
        </div>

        {/* Business Logic Guide Banner */}
        <div className="bg-[#fff9f2] border border-[#e8dbce] rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-bold text-[#462c1a] flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-[#b84a28]" />
              Quy tắc trạng thái bàn:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2d5a27]" />
              <span className="text-[#2d5a27] font-semibold">Bàn trống:</span>
              <span className="text-[#6d4f43]">Có thể đặt bàn trước trực tuyến.</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#b84a28]" />
              <span className="text-[#b84a28] font-semibold">Đang có khách:</span>
              <span className="text-[#6d4f43]">Khách đang dùng bữa tại quán (không thể đặt từ xa).</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c85a17]" />
              <span className="text-[#c85a17] font-semibold">Đã đặt trước:</span>
              <span className="text-[#6d4f43]">Bàn đã được giữ chỗ.</span>
            </div>
          </div>

          <div className="text-[#8c6d60] font-medium border-t md:border-t-0 md:border-l border-[#e8dbce] pt-2 md:pt-0 md:pl-4">
            Quý khách đang ngồi tại nhà hàng? Vui lòng quét mã QR vật lý dán trên mặt bàn để gọi món trực tiếp vào bếp.
          </div>
        </div>

        {/* Staff/Admin Notice Banner */}
        {isStaffOrAdmin && (
          <div className="bg-[#533722] text-[#faf7f2] p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#d7bda0]" />
              <span>Chế độ Nhân viên / Quản lý: Bạn có thể xem tem mã QR in ấn hoặc truy cập POS các bàn đang có khách.</span>
            </div>
            <Link
              to="/staff/tables"
              className="px-3 py-1.5 rounded-lg bg-[#b84a28] hover:bg-[#a13e20] text-white font-bold transition shadow-sm whitespace-nowrap"
            >
              Mở màn hình Quản lý sơ đồ bàn POS
            </Link>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="bg-[#f3ece3] p-5 rounded-2xl border border-[#e8dbce] flex flex-wrap items-center justify-between gap-4 shadow-sm">
          {/* Area Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-[#462c1a] mr-1 hidden sm:inline">Khu vực:</span>
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                  selectedArea === area
                    ? 'bg-[#6d492f] text-white'
                    : 'bg-white text-[#6d492f] hover:bg-[#e8dcce] border border-[#d7bda0]/60'
                }`}
              >
                {area === 'ALL' ? 'Tất cả khu vực' : area}
              </button>
            ))}
          </div>

          {/* Status & Capacity Filter */}
          <div className="flex items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white border border-[#d7bda0] text-[#462c1a] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#b84a28]"
            >
              <option value="ALL">Mọi trạng thái</option>
              <option value="AVAILABLE">Chỉ bàn trống</option>
              <option value="OCCUPIED">Đang có khách</option>
              <option value="RESERVED">Đã đặt trước</option>
            </select>

            <select
              value={minCapacity}
              onChange={(e) => setMinCapacity(Number(e.target.value))}
              className="bg-white border border-[#d7bda0] text-[#462c1a] text-xs font-semibold rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#b84a28]"
            >
              <option value={0}>Sức chứa (Tất cả)</option>
              <option value={2}>Từ 2 khách</option>
              <option value={4}>Từ 4 khách</option>
              <option value={6}>Từ 6 khách</option>
              <option value={8}>Từ 8 khách trở lên</option>
            </select>
          </div>
        </div>

        {/* Tables Grid */}
        {loading ? (
          <div className="text-center py-20 text-sm font-semibold text-[#8c6d60]">
            Đang tải sơ đồ bàn ăn...
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-[#d7bda0] p-8 space-y-2">
            <LayoutGrid className="w-10 h-10 text-[#d7bda0] mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#462c1a]">
              Không tìm thấy bàn phù hợp
            </h3>
            <p className="text-xs text-[#7d6756]">
              Vui lòng thử điều chỉnh lại bộ lọc khu vực hoặc trạng thái bàn.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tables.map((table) => (
              <TableCard key={table.id} table={table} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
