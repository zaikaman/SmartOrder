import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { catalogApi } from '../../api/client';
import { DiningTable, DiningTableRequest, TableStatus } from '../../types';
import { Plus, QrCode, Printer, Download, Edit2, Trash2, CheckCircle2, AlertCircle, X, Users, MapPin, Eye } from 'lucide-react';

export const AdminTableQrPage: React.FC = () => {
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Modal Thêm / Sửa bàn
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [formData, setFormData] = useState<DiningTableRequest>({
    tableNumber: '',
    capacity: 4,
    area: 'Tầng 1',
    status: 'AVAILABLE',
  });

  // Modal Xem & In mã QR đơn
  const [qrModalTable, setQrModalTable] = useState<DiningTable | null>(null);

  // Modal Xóa bàn
  const [deletingTable, setDeletingTable] = useState<DiningTable | null>(null);

  const areas = ['Tầng 1', 'Tầng 2', 'Phòng VIP', 'Sân Vườn'];

  useEffect(() => {
    fetchTables();
  }, [selectedArea]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchTables = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedArea !== 'ALL') params.area = selectedArea;

      const res = await catalogApi.get('/tables', { params });
      setTables(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách bàn ăn:', err);
      showNotification('error', 'Không thể tải sơ đồ bàn ăn.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingTable(null);
    setFormData({
      tableNumber: '',
      capacity: 4,
      area: areas[0],
      status: 'AVAILABLE',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (table: DiningTable) => {
    setEditingTable(table);
    setFormData({
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      area: table.area,
      status: table.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tableNumber.trim() || formData.capacity < 1) {
      showNotification('error', 'Vui lòng nhập số hiệu bàn và sức chứa tối thiểu 1 người.');
      return;
    }

    try {
      setActionLoading(true);
      if (editingTable) {
        await catalogApi.put(`/admin/tables/${editingTable.id}`, formData);
        showNotification('success', `Đã cập nhật bàn '${formData.tableNumber}'.`);
      } else {
        await catalogApi.post('/admin/tables', formData);
        showNotification('success', `Đã tạo mới bàn '${formData.tableNumber}'.`);
      }
      setIsModalOpen(false);
      fetchTables();
    } catch (err: any) {
      console.error('Lỗi khi lưu bàn ăn:', err);
      showNotification('error', err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin bàn.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTable = async () => {
    if (!deletingTable) return;

    try {
      setActionLoading(true);
      await catalogApi.delete(`/admin/tables/${deletingTable.id}`);
      showNotification('success', `Đã xóa bàn '${deletingTable.tableNumber}'.`);
      setDeletingTable(null);
      fetchTables();
    } catch (err: any) {
      console.error('Lỗi khi xóa bàn:', err);
      showNotification('error', err.response?.data?.message || 'Không thể xóa bàn ăn này.');
    } finally {
      setActionLoading(false);
    }
  };

  const getQrImageUrl = (tableId: number) => {
    const baseUrl = catalogApi.defaults.baseURL || '/api/v1';
    return `${baseUrl}/tables/${tableId}/qr-image?width=350&height=350`;
  };

  const handleDownloadQr = (table: DiningTable) => {
    const url = getQrImageUrl(table.id);
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_Ban_${table.tableNumber}_BepViet.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintSingleQr = () => {
    if (!qrModalTable) return;
    const printWindow = window.open('', '_blank', 'width=650,height=750');
    if (!printWindow) return;

    const qrUrl = getQrImageUrl(qrModalTable.id);
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mã QR Bàn ${qrModalTable.tableNumber} - Bếp Việt</title>
          <style>
            body { font-family: 'Times New Roman', serif; text-align: center; padding: 40px; background: #fff; color: #3a2012; }
            .card { border: 3px double #8b3d1b; padding: 30px; max-width: 420px; margin: 0 auto; border-radius: 16px; }
            h1 { font-size: 22px; margin: 0; color: #8b3d1b; text-transform: uppercase; letter-spacing: 2px; }
            h2 { font-size: 32px; margin: 10px 0; font-weight: bold; }
            p { font-size: 13px; color: #6d492f; margin: 5px 0 20px; }
            img { width: 240px; height: 240px; border: 1px solid #e8dbce; padding: 10px; border-radius: 12px; }
            .footer { margin-top: 20px; font-size: 12px; font-style: italic; color: #8b3d1b; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Nhà Hàng Ẩm Thực Bếp Việt</h1>
            <p>Quét mã QR để xem thực đơn & gọi món trực tuyến</p>
            <h2>BÀN SỐ ${qrModalTable.tableNumber}</h2>
            <img src="${qrUrl}" alt="Mã QR" />
            <div class="footer">Khu vực: ${qrModalTable.area} • Sức chứa: ${qrModalTable.capacity} thực khách</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintAllQr = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=950');
    if (!printWindow) return;

    const cardsHtml = tables.map((t) => `
      <div style="border: 2px solid #8b3d1b; padding: 20px; width: 280px; margin: 15px; display: inline-block; text-align: center; border-radius: 12px; page-break-inside: avoid;">
        <h3 style="font-size: 15px; margin: 0; color: #8b3d1b; text-transform: uppercase;">Ẩm Thực Bếp Việt</h3>
        <h2 style="font-size: 24px; margin: 8px 0; color: #3a2012;">BÀN ${t.tableNumber}</h2>
        <img src="${getQrImageUrl(t.id)}" style="width: 180px; height: 180px; border: 1px solid #ddd; padding: 6px; border-radius: 8px;" />
        <div style="margin-top: 8px; font-size: 11px; color: #6d492f;">${t.area} • ${t.capacity} chỗ</div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>In Hàng Loạt Mã QR Bàn - Bếp Việt</title>
          <style>
            body { font-family: 'Times New Roman', serif; text-align: center; padding: 20px; background: #fff; }
          </style>
        </head>
        <body>
          <div style="display: flex; flex-wrap: wrap; justify-content: center;">
            ${cardsHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Bàn Trống</span>;
      case 'RESERVED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Đã Đặt Trước</span>;
      case 'OCCUPIED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">Đang Dùng Bữa</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Tiêu đề & Nút thao tác chính */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#e8dbce] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#a85832]">Phân Hệ Quản Trị</span>
              <span className="text-xs text-[#b8a594]">/</span>
              <span className="text-xs font-semibold text-[#6d492f]">Bàn Ăn & Mã QR</span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-[#3a2012] mt-1">Quản Trị Bàn Ăn & Mã QR Định Danh</h1>
            <p className="text-xs text-[#7d6756] mt-0.5">Quản lý sơ đồ bàn tiệc, cấu hình sức chứa và kết xuất in ấn mã QR thông minh cho từng bàn.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrintAllQr}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f5ede3] hover:bg-[#ebdccb] text-[#6d492f] text-xs font-bold rounded-xl border border-[#d9c7b6] transition"
            >
              <Printer className="w-4 h-4" />
              <span>In Tất Cả QR</span>
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8b3d1b] hover:bg-[#723216] text-white text-xs font-bold rounded-xl shadow-sm transition hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Bàn Ăn Mới</span>
            </button>
          </div>
        </div>

        {/* Thông báo Alert */}
        {notification && (
          <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold transition ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-stone-400 hover:text-stone-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Thanh lọc khu vực */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8dbce] shadow-sm flex items-center justify-between w-full max-w-full overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full min-w-0">
            <MapPin className="w-4 h-4 text-[#a89584] shrink-0" />
            <button
              onClick={() => setSelectedArea('ALL')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                selectedArea === 'ALL'
                  ? 'bg-[#462c1a] text-white'
                  : 'bg-[#f5ede3] text-[#6d492f] hover:bg-[#ebdccb]'
              }`}
            >
              Toàn Bộ Khu Vực ({tables.length} bàn)
            </button>
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                  selectedArea === area
                    ? 'bg-[#462c1a] text-white'
                    : 'bg-[#f5ede3] text-[#6d492f] hover:bg-[#ebdccb]'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách thẻ bàn ăn */}
        {loading ? (
          <div className="p-12 text-center text-xs text-[#7d6756] font-medium bg-white rounded-2xl border border-[#e8dbce]">
            Đang tải sơ đồ bàn ăn nhà hàng...
          </div>
        ) : tables.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#7d6756] bg-white rounded-2xl border border-[#e8dbce]">
            Không có bàn ăn nào trong khu vực này.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {tables.map((table) => (
              <div
                key={table.id}
                className="bg-white rounded-2xl border border-[#e8dbce] p-5 shadow-xs hover:shadow-md transition space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-[#8b3d1b] uppercase tracking-wider">{table.area}</span>
                      <h3 className="font-serif text-2xl font-black text-[#3a2012]">Bàn {table.tableNumber}</h3>
                    </div>
                    <div>{getStatusBadge(table.status)}</div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#7d6756] mt-2">
                    <Users className="w-4 h-4 text-[#a89584]" />
                    <span>Sức chứa: <strong>{table.capacity} thực khách</strong></span>
                  </div>
                </div>

                {/* Khung mã QR thu nhỏ */}
                <div
                  onClick={() => setQrModalTable(table)}
                  className="bg-[#faf5ef] border border-[#ebdccb] rounded-xl p-3 flex items-center justify-between cursor-pointer hover:border-[#8b3d1b] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode className="w-5 h-5 text-[#8b3d1b]" />
                    <div>
                      <div className="font-bold text-[#3a2012] text-xs">Mã QR Gọi Món</div>
                      <div className="text-[10px] text-[#8c7767]">Nhấp để xem & in mã</div>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-[#a89584]" />
                </div>

                {/* Các nút thao tác */}
                <div className="flex items-center justify-between pt-2 border-t border-[#f2e8dc] text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleDownloadQr(table)}
                      className="p-1.5 text-[#6d492f] hover:bg-[#f5ede3] rounded-lg transition"
                      title="Tải ảnh QR PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setQrModalTable(table);
                        setTimeout(handlePrintSingleQr, 300);
                      }}
                      className="p-1.5 text-[#6d492f] hover:bg-[#f5ede3] rounded-lg transition"
                      title="In mã QR dán bàn"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(table)}
                      className="p-1.5 text-[#6d492f] hover:bg-[#f5ede3] rounded-lg transition"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingTable(table)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Xóa bàn ăn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Modal Xem & In mã QR */}
      {qrModalTable && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
            onClick={() => setQrModalTable(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#e8dbce] text-center space-y-4 my-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#f0e6da] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#3a2012]">Mã QR Bàn {qrModalTable.tableNumber}</h3>
              <button onClick={() => setQrModalTable(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#faf5ef] border border-[#ebdccb] p-4 rounded-xl flex flex-col items-center justify-center">
              <img
                src={getQrImageUrl(qrModalTable.id)}
                alt={`Mã QR Bàn ${qrModalTable.tableNumber}`}
                className="w-56 h-56 rounded-lg shadow-xs"
              />
              <p className="text-xs text-[#7d6756] mt-3 font-medium">
                URL gọi món: <span className="font-mono text-[#8b3d1b]">/table/{qrModalTable.tableNumber}</span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handleDownloadQr(qrModalTable)}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-[#d9c7b6] text-[#6d492f] rounded-xl text-xs font-bold hover:bg-[#faf5ef] transition"
              >
                <Download className="w-4 h-4" />
                <span>Tải Ảnh PNG</span>
              </button>
              <button
                onClick={handlePrintSingleQr}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#8b3d1b] text-white rounded-xl text-xs font-bold hover:bg-[#723216] transition"
              >
                <Printer className="w-4 h-4" />
                <span>In Nhãn Bàn</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Thêm / Sửa Bàn Ăn */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e8dbce] space-y-4 my-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#f0e6da] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#3a2012]">
                {editingTable ? 'Cập Nhật Bàn Ăn' : 'Thêm Bàn Ăn Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#462c1a] mb-1">Số Hiệu Bàn *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: T11, VIP03"
                  value={formData.tableNumber}
                  onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#462c1a] mb-1">Sức Chứa (Người) *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#462c1a] mb-1">Khu Vực *</label>
                  <select
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                  >
                    {areas.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#462c1a] mb-1">Trạng Thái Bàn Ban Đầu</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TableStatus })}
                  className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                >
                  <option value="AVAILABLE">Bàn Trống (AVAILABLE)</option>
                  <option value="RESERVED">Đã Đặt Trước (RESERVED)</option>
                  <option value="OCCUPIED">Đang Dùng Bữa (OCCUPIED)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f0e6da]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#d9c7b6] text-[#6d492f] rounded-xl font-bold hover:bg-[#faf5ef] transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#8b3d1b] text-white rounded-xl font-bold hover:bg-[#723216] transition disabled:opacity-50"
                >
                  {actionLoading ? 'Đang lưu...' : (editingTable ? 'Lưu Cập Nhật' : 'Tạo Bàn Mới')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Xác Nhận Xóa Bàn */}
      {deletingTable && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
            onClick={() => setDeletingTable(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#e8dbce] space-y-4 text-xs my-auto animate-fadeIn">
            <div className="font-serif text-lg font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Xác Nhận Xóa Bàn</span>
            </div>
            <p className="text-[#6d492f]">
              Bạn có chắc chắn muốn xóa bàn <strong className="text-[#3a2012]">'{deletingTable.tableNumber}'</strong> khỏi sơ đồ nhà hàng không?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingTable(null)}
                className="px-3.5 py-1.5 border border-[#d9c7b6] text-[#6d492f] rounded-xl font-bold hover:bg-[#faf5ef] transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteTable}
                className="px-4 py-1.5 bg-rose-700 text-white rounded-xl font-bold hover:bg-rose-800 transition disabled:opacity-50"
              >
                {actionLoading ? 'Đang xóa...' : 'Đồng Ý Xóa'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
