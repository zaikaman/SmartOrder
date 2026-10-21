import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { catalogApi } from '../../api/client';
import { MenuItem, MenuItemRequest, MenuItemStatus } from '../../types';
import { Plus, Search, Filter, Edit2, Trash2, CheckCircle2, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

export const AdminMenuManagementPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // State Modal Thêm / Sửa
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemRequest>({
    name: '',
    price: 0,
    category: 'Món chính & Cơm niêu',
    description: '',
    imageUrl: '',
    status: 'AVAILABLE',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // State Modal Xóa
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, [selectedCategory]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (searchKeyword.trim()) params.keyword = searchKeyword.trim();

      const res = await catalogApi.get('/admin/menu', { params });
      setMenuItems(res.data);
    } catch (err: any) {
      console.error('Lỗi khi tải thực đơn quản trị:', err);
      showNotification('error', 'Không thể tải danh sách thực đơn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await catalogApi.get('/menu/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh mục:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMenuItems();
  };

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: 50000,
      category: categories[0] || 'Món chính & Cơm niêu',
      description: '',
      imageUrl: '',
      status: 'AVAILABLE',
    });
    setImageFile(null);
    setImagePreview('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category,
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      status: item.status,
    });
    setImageFile(null);
    setImagePreview(item.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleUploadToCloudinary = async (): Promise<string | null> => {
    if (!imageFile) return formData.imageUrl || null;

    try {
      setUploadingImage(true);
      const uploadData = new FormData();
      uploadData.append('file', imageFile);

      const res = await catalogApi.post('/admin/menu/upload-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.imageUrl;
    } catch (err: any) {
      console.error('Lỗi khi tải ảnh lên Cloudinary:', err);
      showNotification('error', 'Không thể tải ảnh lên dịch vụ Cloudinary. Vui lòng kiểm tra lại ảnh.');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.price <= 0) {
      showNotification('error', 'Vui lòng nhập tên món và giá hợp lệ lớn hơn 0.');
      return;
    }

    try {
      setActionLoading(true);
      let finalImageUrl = formData.imageUrl;

      if (imageFile) {
        const uploadedUrl = await handleUploadToCloudinary();
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      const payload: MenuItemRequest = {
        ...formData,
        imageUrl: finalImageUrl,
      };

      if (editingItem) {
        await catalogApi.put(`/admin/menu/${editingItem.id}`, payload);
        showNotification('success', `Đã cập nhật thành công món '${payload.name}'.`);
      } else {
        await catalogApi.post('/admin/menu', payload);
        showNotification('success', `Đã thêm món mới '${payload.name}' vào thực đơn.`);
      }

      setIsModalOpen(false);
      fetchMenuItems();
      fetchCategories();
    } catch (err: any) {
      console.error('Lỗi khi lưu món ăn:', err);
      showNotification('error', err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin món ăn.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deletingItem) return;

    try {
      setActionLoading(true);
      await catalogApi.delete(`/admin/menu/${deletingItem.id}`);
      showNotification('success', `Đã xóa món ăn '${deletingItem.name}'.`);
      setDeletingItem(null);
      fetchMenuItems();
    } catch (err: any) {
      console.error('Lỗi khi xóa món ăn:', err);
      showNotification('error', err.response?.data?.message || 'Không thể xóa món ăn này.');
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status: MenuItemStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">Đang phục vụ</span>;
      case 'OUT_OF_STOCK':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">Tạm hết món</span>;
      case 'INACTIVE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-200">Ngưng bán</span>;
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
              <span className="text-xs font-semibold text-[#6d492f]">Thực Đơn Nhà Hàng</span>
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-[#3a2012] mt-1">Quản Trị Thực Đơn & Hình Ảnh</h1>
            <p className="text-xs text-[#7d6756] mt-0.5">Thêm mới, tinh chỉnh giá, trạng thái và tải ảnh món ăn lên dịch vụ Cloudinary trực tuyến.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#8b3d1b] hover:bg-[#723216] text-white text-xs font-bold rounded-xl shadow-sm transition hover:shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Món Ăn Mới</span>
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

        {/* Thanh tìm kiếm và bộ lọc danh mục */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8dbce] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89584]" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên món ăn..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-24 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-xs text-[#462c1a] focus:outline-none focus:border-[#8b3d1b]"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-[#8b3d1b] text-white rounded-lg text-xs font-semibold hover:bg-[#723216] transition"
            >
              Tìm
            </button>
          </form>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-[#a89584] shrink-0" />
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                selectedCategory === 'ALL'
                  ? 'bg-[#462c1a] text-white'
                  : 'bg-[#f5ede3] text-[#6d492f] hover:bg-[#ebdccb]'
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                  selectedCategory === cat
                    ? 'bg-[#462c1a] text-white'
                    : 'bg-[#f5ede3] text-[#6d492f] hover:bg-[#ebdccb]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Bảng danh sách món ăn */}
        <div className="bg-white rounded-2xl border border-[#e8dbce] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#7d6756] font-medium">
              Đang tải danh sách thực đơn Bếp Việt...
            </div>
          ) : menuItems.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#7d6756]">
              Không tìm thấy món ăn nào phù hợp với bộ lọc tìm kiếm.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#462c1a]">
                <thead className="bg-[#faf5ef] border-b border-[#e8dbce] text-[#6d492f] font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Ảnh Món</th>
                    <th className="py-3 px-4">Tên Món Ăn</th>
                    <th className="py-3 px-4">Danh Mục</th>
                    <th className="py-3 px-4 text-right">Đơn Giá</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2e8dc]">
                  {menuItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fcfaf7] transition">
                      <td className="py-3 px-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#f0e6da] border border-[#e8dbce] flex items-center justify-center shrink-0">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-[#b09d8d]" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#3a2012] text-sm">{item.name}</div>
                        <div className="text-[11px] text-[#8c7767] line-clamp-1 max-w-sm">{item.description || 'Chưa có mô tả'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-[#f5ede3] text-[#5e3c23] rounded-lg font-medium text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#8b3d1b] text-sm">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-[#6d492f] hover:bg-[#f5ede3] rounded-lg transition"
                            title="Chỉnh sửa món"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingItem(item)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa món ăn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Modal Thêm / Chỉnh Sửa Món Ăn */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
            onClick={() => setIsModalOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e8dbce] space-y-4 max-h-[90vh] overflow-y-auto my-auto animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#f0e6da] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#3a2012]">
                {editingItem ? 'Cập Nhật Món Ăn' : 'Thêm Món Ăn Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#462c1a] mb-1">Tên Món Ăn *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Cá Bớp Kho Tộ"
                  className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#462c1a] mb-1">Đơn Giá (VNĐ) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#462c1a] mb-1">Danh Mục *</label>
                  <input
                    type="text"
                    required
                    list="category-suggestions"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                  />
                  <datalist id="category-suggestions">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#462c1a] mb-1">Trạng Thái Phục Vụ</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as MenuItemStatus })}
                  className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                >
                  <option value="AVAILABLE">Đang phục vụ (AVAILABLE)</option>
                  <option value="OUT_OF_STOCK">Tạm hết món (OUT_OF_STOCK)</option>
                  <option value="INACTIVE">Ngưng bán (INACTIVE)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#462c1a] mb-1">Mô Tả Ẩm Thực</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Hương vị, nguyên liệu đặc trưng truyền thống..."
                  className="w-full px-3 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-[#3a2012] focus:outline-none focus:border-[#8b3d1b]"
                />
              </div>

              {/* Tải ảnh lên Cloudinary */}
              <div className="space-y-2">
                <label className="block font-bold text-[#462c1a]">Hình Ảnh Món Ăn (Cloudinary API)</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#f0e6da] border border-[#e8dbce] flex items-center justify-center shrink-0">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Xem trước" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#b09d8d]" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="text-[11px] text-[#7d6756] file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-[#8b3d1b] file:text-white hover:file:bg-[#723216] file:cursor-pointer cursor-pointer"
                    />
                    <p className="text-[10px] text-[#9c897a]">Hỗ trợ ảnh PNG, JPG, WEBP. Ảnh được tải lên kho Cloudinary CDN.</p>
                  </div>
                </div>
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
                  disabled={actionLoading || uploadingImage}
                  className="px-5 py-2 bg-[#8b3d1b] text-white rounded-xl font-bold hover:bg-[#723216] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {(actionLoading || uploadingImage) && <span className="animate-spin text-xs">...</span>}
                  <span>{editingItem ? 'Lưu Cập Nhật' : 'Tạo Món Ăn'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Modal Xác Nhận Xóa */}
      {deletingItem && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
            onClick={() => setDeletingItem(null)}
            aria-hidden="true"
          />
          <div className="relative z-10 bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#e8dbce] space-y-4 text-xs my-auto animate-fadeIn">
            <div className="font-serif text-lg font-bold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span>Xác Nhận Xóa Món</span>
            </div>
            <p className="text-[#6d492f]">
              Bạn có chắc chắn muốn xóa món <strong className="text-[#3a2012]">'{deletingItem.name}'</strong> khỏi thực đơn nhà hàng không? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingItem(null)}
                className="px-3.5 py-1.5 border border-[#d9c7b6] text-[#6d492f] rounded-xl font-bold hover:bg-[#faf5ef] transition"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteItem}
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
