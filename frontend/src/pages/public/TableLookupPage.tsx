import React, { useEffect, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { catalogApi } from '../../api/client';
import { DiningTable } from '../../types';
import { TableCard } from '../../components/common/TableCard';

export const TableLookupPage: React.FC = () => {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

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
            Tra Cứu Bàn Trống & Mã QR Tại Bàn
          </h1>
          <p className="text-sm text-[#7d6756] max-w-xl mx-auto">
            Xem trực quan trạng thái bàn ăn theo từng tầng và khu vực phòng VIP.
            Thực khách có thể xem mã QR để trải nghiệm gọi món tại bàn.
          </p>
        </div>

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
