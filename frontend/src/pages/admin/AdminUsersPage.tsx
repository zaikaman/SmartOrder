import React, { useState, useEffect } from 'react';
import { authApi } from '../../api/client';
import { User, UserRole } from '../../types';
import { Search, UserCheck, UserX, AlertCircle, CheckCircle2, X, Filter } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authApi.get('/admin/users');
      setUsers(res.data);
    } catch (err: any) {
      console.error('Lỗi khi tải danh sách người dùng:', err);
      showNotification('error', 'Không thể tải danh sách tài khoản người dùng.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: number, newRole: UserRole) => {
    try {
      setActionLoadingId(userId);
      await authApi.patch(`/admin/users/${userId}/role`, { role: newRole });
      showNotification('success', 'Đã cập nhật vai trò người dùng thành công.');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      console.error('Lỗi khi cập nhật vai trò:', err);
      showNotification('error', err.response?.data?.message || 'Không thể đổi vai trò người dùng.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleStatus = async (userId: number, currentActive: boolean) => {
    try {
      setActionLoadingId(userId);
      const newStatus = !currentActive;
      await authApi.patch(`/admin/users/${userId}/status`, { active: newStatus });
      showNotification('success', newStatus ? 'Đã kích hoạt mở khóa tài khoản.' : 'Đã khóa tài khoản thành công.');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: newStatus } : u));
    } catch (err: any) {
      console.error('Lỗi khi đổi trạng thái tài khoản:', err);
      showNotification('error', err.response?.data?.message || 'Không thể đổi trạng thái tài khoản.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesKeyword =
      u.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.username.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      u.email.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (u.phone && u.phone.includes(searchKeyword));

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    return matchesKeyword && matchesRole;
  });

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">Quản Trị Viên (ADMIN)</span>;
      case 'STAFF':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">Nhân Viên / Bếp (STAFF)</span>;
      case 'CUSTOMER':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">Khách Hàng (CUSTOMER)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Tiêu đề trang */}
        <div className="border-b border-[#e8dbce] pb-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#a85832]">Phân Hệ Quản Trị</span>
            <span className="text-xs text-[#b8a594]">/</span>
            <span className="text-xs font-semibold text-[#6d492f]">Tài Khoản & Phân Quyền</span>
          </div>
          <h1 className="font-serif text-3xl font-extrabold text-[#3a2012] mt-1">Quản Trị Người Dùng & Phân Quyền</h1>
          <p className="text-xs text-[#7d6756] mt-0.5">Kiểm soát danh sách tài khoản, nâng cấp vai trò Quản trị / Nhân viên và quản lý trạng thái khóa tài khoản.</p>
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

        {/* Thanh tìm kiếm và bộ lọc vai trò */}
        <div className="bg-white p-4 rounded-2xl border border-[#e8dbce] shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a89584]" />
            <input
              type="text"
              placeholder="Tìm kiếm theo họ tên, username, email hoặc số điện thoại..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#fcfbfa] border border-[#e8dbce] rounded-xl text-xs text-[#462c1a] focus:outline-none focus:border-[#8b3d1b]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar w-full md:w-auto min-w-0">
            <Filter className="w-4 h-4 text-[#a89584] shrink-0" />
            {['ALL', 'CUSTOMER', 'STAFF', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition ${
                  roleFilter === role
                    ? 'bg-[#462c1a] text-white'
                    : 'bg-[#f5ede3] text-[#6d492f] hover:bg-[#ebdccb]'
                }`}
              >
                {role === 'ALL' ? 'Tất cả' : role}
              </button>
            ))}
          </div>
        </div>

        {/* Bảng danh sách người dùng */}
        <div className="bg-white rounded-2xl border border-[#e8dbce] shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#7d6756] font-medium">
              Đang tải danh sách tài khoản hệ thống...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#7d6756]">
              Không tìm thấy người dùng nào phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#462c1a]">
                <thead className="bg-[#faf5ef] border-b border-[#e8dbce] text-[#6d492f] font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Tài Khoản</th>
                    <th className="py-3 px-4">Liên Hệ</th>
                    <th className="py-3 px-4">Hình Thức Xác Thực</th>
                    <th className="py-3 px-4">Vai Trò Hệ Thống</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Phân Quyền / Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f2e8dc]">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-[#fcfaf7] transition">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#8b3d1b] text-white font-serif font-bold text-sm flex items-center justify-center shrink-0">
                            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-[#3a2012] text-sm">{user.fullName}</div>
                            <div className="text-[11px] text-[#8c7767]">@{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-[#3a2012] font-medium">{user.email}</div>
                        <div className="text-[11px] text-[#8c7767]">{user.phone || 'Chưa cập nhật SĐT'}</div>
                      </td>
                      <td className="py-3 px-4">
                        {user.authProvider === 'GOOGLE' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Google OAuth2
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600 border border-stone-200">
                            Nội Bộ
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getRoleBadge(user.role)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {user.active ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700">
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select
                            value={user.role}
                            disabled={actionLoadingId === user.id}
                            onChange={(e) => handleChangeRole(user.id, e.target.value as UserRole)}
                            className="bg-[#fcfbfa] border border-[#d9c7b6] rounded-lg px-2 py-1 text-[11px] font-medium text-[#462c1a] focus:outline-none focus:border-[#8b3d1b]"
                          >
                            <option value="CUSTOMER">Khách Hàng</option>
                            <option value="STAFF">Nhân Viên</option>
                            <option value="ADMIN">Quản Trị</option>
                          </select>

                          <button
                            onClick={() => handleToggleStatus(user.id, user.active)}
                            disabled={actionLoadingId === user.id}
                            className={`p-1.5 rounded-lg border text-xs font-semibold transition ${
                              user.active
                                ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                            title={user.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {user.active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
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
    </div>
  );
};
