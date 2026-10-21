import React, { useState, useEffect } from 'react';
import { bookingApi } from '../../api/client';
import { RevenueStatisticsResponse } from '../../types';
import { DollarSign, ShoppingBag, CheckCircle, TrendingUp, Award, Printer, RefreshCw } from 'lucide-react';

export const AdminRevenueStatsPage: React.FC = () => {
  const [stats, setStats] = useState<RevenueStatisticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [chartView, setChartView] = useState<'DATE' | 'MONTH'>('DATE');

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const res = await bookingApi.get('/admin/statistics/revenue');
      setStats(res.data);
    } catch (err) {
      console.error('Lỗi khi tải số liệu thống kê doanh thu:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const activeRevenueList = chartView === 'DATE' ? (stats?.revenueByDate || []) : (stats?.revenueByMonth || []);
  const maxRevenue = activeRevenueList.length > 0
    ? Math.max(...activeRevenueList.map(item => item.revenue), 1)
    : 1;

  const averageOrderValue = stats && stats.completedOrdersCount > 0
    ? stats.totalRevenue / stats.completedOrdersCount
    : 0;

  return (
    <div className="min-h-screen bg-[#faf7f2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Tiêu đề & Nút in báo cáo */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e8dbce] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#a85832]">Phân Hệ Quản Trị</span>
              <span className="text-xs text-[#b8a594]">/</span>
              <span className="text-xs font-semibold text-[#6d492f]">Báo Cáo Hoạt Động</span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-[#3a2012] mt-1">Bảng Điều Khiển Thống Kê Doanh Thu</h1>
            <p className="text-xs text-[#7d6756] mt-0.5">Phân tích dòng tiền kinh doanh, tỷ lệ hoàn tất đơn đặt bàn và danh mục các món ăn được thực khách ưa chuộng nhất.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchStatistics}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-[#faf5ef] text-[#6d492f] text-xs font-bold rounded-xl border border-[#d9c7b6] transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Làm Mới</span>
            </button>
            <button
              onClick={handlePrintReport}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8b3d1b] hover:bg-[#723216] text-white text-xs font-bold rounded-xl shadow-sm transition hover:shadow"
            >
              <Printer className="w-4 h-4" />
              <span>In Báo Cáo</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-[#e8dbce] p-16 text-center text-xs text-[#7d6756]">
            Đang tổng hợp dữ liệu doanh thu từ hệ thống Bếp Việt...
          </div>
        ) : !stats ? (
          <div className="bg-white rounded-2xl border border-[#e8dbce] p-16 text-center text-xs text-[#7d6756]">
            Chưa có dữ liệu thống kê nào được ghi nhận.
          </div>
        ) : (
          <>
            {/* 4 Thẻ KPI Hàng Đầu */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-[#e8dbce] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[#8b3d1b]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7d6756]">Tổng Doanh Thu</span>
                  <div className="p-2 bg-[#faf0ea] rounded-xl"><DollarSign className="w-4 h-4 text-[#8b3d1b]" /></div>
                </div>
                <div className="font-serif text-2xl font-black text-[#3a2012]">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Đã thanh toán thực tế</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e8dbce] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[#6d492f]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7d6756]">Đơn Hoàn Thành</span>
                  <div className="p-2 bg-[#f4ebe1] rounded-xl"><CheckCircle className="w-4 h-4 text-[#6d492f]" /></div>
                </div>
                <div className="font-serif text-2xl font-black text-[#3a2012]">
                  {stats.completedOrdersCount} <span className="text-xs font-normal text-[#8c7767]">đơn</span>
                </div>
                <div className="text-[10px] text-[#7d6756]">
                  Trên tổng số {stats.totalOrdersCount} lượt tạo đơn
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e8dbce] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[#6d492f]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7d6756]">Giá Trị Đơn Trung Bình</span>
                  <div className="p-2 bg-[#f4ebe1] rounded-xl"><ShoppingBag className="w-4 h-4 text-[#6d492f]" /></div>
                </div>
                <div className="font-serif text-2xl font-black text-[#3a2012]">
                  {formatCurrency(averageOrderValue)}
                </div>
                <div className="text-[10px] text-[#7d6756]">
                  Mức chi tiêu trung bình / bàn
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#e8dbce] shadow-xs space-y-2">
                <div className="flex items-center justify-between text-[#6d492f]">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#7d6756]">Tỷ Lệ Hoàn Tất</span>
                  <div className="p-2 bg-[#f4ebe1] rounded-xl"><Award className="w-4 h-4 text-[#6d492f]" /></div>
                </div>
                <div className="font-serif text-2xl font-black text-[#3a2012]">
                  {stats.totalOrdersCount > 0
                    ? ((stats.completedOrdersCount / stats.totalOrdersCount) * 100).toFixed(1)
                    : 0}%
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold">
                  Hiệu suất phục vụ đạt chuẩn
                </div>
              </div>
            </div>

            {/* Khung Biểu Đồ Doanh Thu & Top Món Bán Chạy */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Biểu đồ Doanh Thu Theo Thời Gian (2/3 cột) */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e8dbce] shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#3a2012]">Biểu Đồ Tăng Trưởng Doanh Thu</h3>
                    <p className="text-[11px] text-[#8c7767]">Dòng tiền theo chu kỳ kinh doanh tại nhà hàng</p>
                  </div>

                  <div className="flex items-center bg-[#faf5ef] p-1 rounded-xl border border-[#ebdccb] text-xs">
                    <button
                      onClick={() => setChartView('DATE')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        chartView === 'DATE'
                          ? 'bg-[#8b3d1b] text-white shadow-xs'
                          : 'text-[#6d492f] hover:text-[#3a2012]'
                      }`}
                    >
                      Theo Ngày
                    </button>
                    <button
                      onClick={() => setChartView('MONTH')}
                      className={`px-3 py-1 rounded-lg font-bold transition ${
                        chartView === 'MONTH'
                          ? 'bg-[#8b3d1b] text-white shadow-xs'
                          : 'text-[#6d492f] hover:text-[#3a2012]'
                      }`}
                    >
                      Theo Tháng
                    </button>
                  </div>
                </div>

                {activeRevenueList.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-xs text-[#8c7767]">
                    Chưa có lịch sử doanh thu cho khoảng thời gian này.
                  </div>
                ) : (
                  <div className="h-64 flex items-end gap-3 pt-8 pb-2 px-2 overflow-x-auto border-b border-[#ebdccb]">
                    {activeRevenueList.map((item) => {
                      const heightPercent = Math.max((item.revenue / maxRevenue) * 100, 8);
                      return (
                        <div key={item.period} className="flex-1 min-w-[50px] flex flex-col items-center gap-2 group relative">
                          {/* Tooltip khi rê chuột */}
                          <div className="absolute -top-12 bg-[#3a2012] text-white text-[10px] py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-10">
                            <div>{item.period}</div>
                            <div className="font-bold text-[#f5ede3]">{formatCurrency(item.revenue)}</div>
                            <div className="text-[9px] text-[#b8a594]">{item.orderCount} đơn hàng</div>
                          </div>

                          {/* Cột thanh doanh thu */}
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[40px] bg-gradient-to-t from-[#8b3d1b] to-[#c26d40] rounded-t-lg transition-all duration-300 group-hover:brightness-110"
                          />
                          <span className="text-[10px] font-medium text-[#7d6756] truncate max-w-full">
                            {item.period.length > 7 ? item.period.substring(5) : item.period}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px] text-[#8c7767] pt-1">
                  <span>Khoảng thời gian ghi nhận</span>
                  <span>Đơn vị tính: VNĐ</span>
                </div>
              </div>

              {/* Bảng Top Món Ăn Bán Chạy Nhất (1/3 cột) */}
              <div className="bg-white p-6 rounded-2xl border border-[#e8dbce] shadow-sm space-y-4">
                <div className="border-b border-[#f0e6da] pb-3">
                  <h3 className="font-serif text-lg font-bold text-[#3a2012]">Món Ăn Ưa Chuộng</h3>
                  <p className="text-[11px] text-[#8c7767]">Top món ăn bán chạy nhất theo số lượng</p>
                </div>

                {stats.topSellingItems.length === 0 ? (
                  <div className="p-8 text-center text-xs text-[#8c7767]">
                    Chưa có đơn hàng hoàn thành để tổng kết món bán chạy.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.topSellingItems.map((item, index) => (
                      <div
                        key={item.name}
                        className="p-3 bg-[#faf5ef] rounded-xl border border-[#ebdccb] flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            index === 0
                              ? 'bg-amber-400 text-stone-900'
                              : index === 1
                              ? 'bg-stone-300 text-stone-900'
                              : index === 2
                              ? 'bg-[#d9a07a] text-stone-900'
                              : 'bg-stone-100 text-stone-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="truncate">
                            <div className="font-bold text-[#3a2012] truncate">{item.name}</div>
                            <div className="text-[10px] text-[#8c7767]">{item.quantity} phần đã phục vụ</div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-[#8b3d1b] text-xs">
                            {formatCurrency(item.revenue)}
                          </div>
                          <div className="text-[9px] text-[#9c897a]">
                            {stats.totalRevenue > 0
                              ? ((item.revenue / stats.totalRevenue) * 100).toFixed(1)
                              : 0}% DT
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};
