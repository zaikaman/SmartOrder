import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ChefHat, 
  LayoutGrid, 
  Utensils, 
  ArrowLeft, 
  Clock, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

interface StaffSidebarProps {
  activeTab?: string;
}

export const StaffSidebar: React.FC<StaffSidebarProps> = () => {
  const { user } = useAuthStore();

  const navItems = [
    {
      to: '/staff/orders',
      icon: ChefHat,
      label: 'Điều phối Bếp & Gọi món',
      desc: 'Cập nhật trạng thái chế biến',
    },
    {
      to: '/staff/tables',
      icon: LayoutGrid,
      label: 'Sơ đồ & Tiếp nhận bàn',
      desc: 'Quản lý trạng thái bàn ăn',
    },
    {
      to: '/menu',
      icon: Utensils,
      label: 'Tra cứu Thực đơn',
      desc: 'Xem danh sách món & giá niêm yết',
    },
  ];

  return (
    <aside className="w-full md:w-72 bg-white border-r border-[#e8dbce] p-5 flex flex-col justify-between shrink-0 shadow-sm min-h-full">
      <div className="space-y-6">
        {/* Header thông tin khu vực nghiệp vụ */}
        <div className="pb-4 border-b border-[#f0e6dc]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#6d492f] text-[#faf7f2] flex items-center justify-center font-bold shadow-sm">
              <ChefHat className="w-5 h-5 text-[#d7bda0]" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-[#462c1a] text-base leading-tight">
                Khu Vực Nghiệp Vụ
              </h2>
              <p className="text-[11px] text-[#8c6d60] font-medium mt-0.5">
                Nhà Hàng Ẩm Thực Bếp Việt
              </p>
            </div>
          </div>

          {/* Huy hiệu vai trò */}
          <div className="mt-3.5 bg-[#faf7f2] border border-[#e8dbce] rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#f3ece3] flex items-center justify-center text-[#6d492f]">
              <UserCheck className="w-4 h-4 text-[#b84a28]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#462c1a] truncate">
                {user?.fullName || user?.username || 'Nhân viên'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] uppercase font-semibold text-[#8c6d60] tracking-wider">
                  Ca trực: {user?.role === 'ADMIN' ? 'Quản Lý (Admin)' : 'Nhân Viên (Staff)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Danh sách điều hướng */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold text-[#a08272] uppercase tracking-wider px-3 mb-2">
            Chức năng nghiệp vụ
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-start gap-3 px-3 py-3 rounded-xl transition-all ${
                    isActive
                      ? 'bg-[#6d492f] text-white shadow-sm font-medium'
                      : 'text-[#5a3f2d] hover:bg-[#faf7f2] hover:text-[#b84a28]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-[#d7bda0]' : 'text-[#8c6d60]'}`} />
                    <div className="flex-1">
                      <p className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-[#462c1a]'}`}>
                        {item.label}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${isActive ? 'text-[#e4d4c2]' : 'text-[#8c6d60]'}`}>
                        {item.desc}
                      </p>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Khối quản trị mở rộng cho Admin */}
        {user?.role === 'ADMIN' && (
          <div className="pt-4 border-t border-[#f0e6dc] space-y-1.5">
            <p className="text-[11px] font-bold text-[#a08272] uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#b84a28]" />
              Phân hệ Quản trị viên
            </p>
            <NavLink
              to="/admin/menu"
              className="block px-3 py-2 text-xs font-semibold text-[#5a3f2d] hover:text-[#b84a28] hover:bg-[#faf7f2] rounded-lg transition"
            >
              Quản lý Menu & Cloudinary
            </NavLink>
            <NavLink
              to="/admin/tables"
              className="block px-3 py-2 text-xs font-semibold text-[#5a3f2d] hover:text-[#b84a28] hover:bg-[#faf7f2] rounded-lg transition"
            >
              Quản lý Bàn & In mã QR
            </NavLink>
            <NavLink
              to="/admin/stats"
              className="block px-3 py-2 text-xs font-semibold text-[#5a3f2d] hover:text-[#b84a28] hover:bg-[#faf7f2] rounded-lg transition"
            >
              Báo cáo Doanh thu & Thống kê
            </NavLink>
          </div>
        )}
      </div>

      {/* Chân thanh bên */}
      <div className="pt-6 border-t border-[#f0e6dc] space-y-2">
        <NavLink
          to="/"
          className="flex items-center gap-2 text-xs font-semibold text-[#8c6d60] hover:text-[#462c1a] px-3 py-2 rounded-lg hover:bg-[#faf7f2] transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về trang chủ khách hàng</span>
        </NavLink>
        <div className="flex items-center gap-1.5 px-3 text-[11px] text-[#a08272]">
          <Clock className="w-3.5 h-3.5" />
          <span>Hệ thống đồng bộ trực tiếp</span>
        </div>
      </div>
    </aside>
  );
};
