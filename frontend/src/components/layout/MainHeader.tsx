import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
  Phone, 
  MapPin, 
  Clock, 
  UtensilsCrossed, 
  LayoutGrid, 
  LogOut, 
  Menu, 
  X, 
  ShoppingBag,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { CartDrawer } from '../common/CartDrawer';
import { AiFoodAssistantModal } from '../common/AiFoodAssistantModal';

export const MainHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalQuantity, tableNumber } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const cartCount = getTotalQuantity();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/menu', label: 'Thực đơn' },
    { to: '/tables', label: 'Sơ đồ bàn' },
    { to: '/booking', label: 'Đặt bàn trước' },
    { to: '/table/T01', label: 'Gọi món tại bàn (QR)' },
    ...(isAuthenticated ? [{ to: '/my-orders', label: 'Lịch sử đơn' }] : []),
    ...(isAuthenticated && (user?.role === 'STAFF' || user?.role === 'ADMIN')
      ? [{ to: '/staff/orders', label: 'Bếp & Đơn món' }]
      : []),
    ...(isAuthenticated && user?.role === 'ADMIN'
      ? [
          { to: '/admin/menu', label: 'QL Menu' },
          { to: '/admin/tables', label: 'QL Bàn & QR' },
          { to: '/admin/users', label: 'QL Người dùng' },
          { to: '/admin/stats', label: 'Thống kê DT' },
        ]
      : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#e8dbce] transition-all">
      {/* Top Banner Bar */}
      <div className="bg-[#6d492f] text-[#f5ede3] text-xs py-1.5 px-4 sm:px-8 border-b border-[#5a3b25]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#d7bda0]" />
              Hotline: <strong className="text-white font-semibold tracking-wide">0843 093 999</strong>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-[#e4d4c2]">
              <Clock className="w-3.5 h-3.5 text-[#d7bda0]" />
              Mở cửa: 10:00 - 22:00 hàng ngày
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-[#e4d4c2]">
              <MapPin className="w-3.5 h-3.5 text-[#d7bda0]" />
              Đại lộ Hùng Vương, Phú Thủy, Phan Thiết
            </span>
          </div>

          <div className="flex items-center gap-3">
            {tableNumber && (
              <span className="bg-[#b84a28] text-white px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide shadow-sm">
                Bàn đang chọn: {tableNumber}
              </span>
            )}
            <span className="text-[#d7bda0] hidden sm:inline text-[11px] tracking-wider uppercase font-semibold">
              Hương Vị Cơm Niêu & Hải Sản Truyền Thống
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#6d492f] border-2 border-[#d7bda0] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden">
              <UtensilsCrossed className="w-6 h-6 text-[#faf7f2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl font-bold text-[#462c1a] group-hover:text-[#b84a28] transition-colors leading-none">
                Bếp Việt
              </span>
              <span className="text-[11px] font-semibold tracking-wider text-[#6d492f] uppercase mt-1">
                Cơm Niêu & Hải Sản
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-xs font-bold tracking-wide transition-colors py-1 border-b-2 whitespace-nowrap ${
                    isActive
                      ? 'text-[#b84a28] border-[#b84a28]'
                      : 'text-[#462c1a] border-transparent hover:text-[#6d492f] hover:border-[#d7bda0]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Actions & User Section */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* Nút Kích hoạt Trợ lý AI */}
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-[#8b3d1b] to-[#b84a28] text-white text-xs font-bold shadow-xs hover:shadow transition"
              title="Trợ lý AI gợi ý mâm cơm Bếp Việt"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span className="hidden sm:inline">Trợ Lý AI</span>
            </button>

            {/* Table QR Quick View */}
            <Link
              to="/tables"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-[#f3ece3] hover:bg-[#e8dcce] text-[#6d492f] border border-[#d7bda0]/60 transition-colors"
              title="Tra cứu sơ đồ bàn"
            >
              <LayoutGrid className="w-4 h-4 text-[#b84a28]" />
              <span className="hidden xl:inline">Sơ đồ bàn</span>
            </Link>

            {/* Cart Preview Button */}
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2.5 rounded-full bg-[#f3ece3] hover:bg-[#e8dcce] text-[#462c1a] border border-[#d7bda0]/70 transition-colors"
              title="Mở giỏ món ăn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#b84a28] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Authentication Buttons */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#e8dbce]">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#462c1a] leading-tight max-w-[120px] truncate">
                    {user.fullName || user.username}
                  </span>
                  <span className="text-[10px] text-[#8c6d60] uppercase tracking-wider font-semibold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-[#8c6d60] hover:text-[#b84a28] hover:bg-[#f3ece3] rounded-full transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#6d492f] hover:text-[#b84a28] px-2.5 sm:px-3 py-2 rounded-lg hover:bg-[#f3ece3] transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-[#6d492f] hover:bg-[#533722] text-[#faf7f2] px-3 sm:px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#462c1a] hover:bg-[#f3ece3] rounded-lg transition-colors"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#faf7f2] border-b border-[#e8dbce] px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-[#462c1a] hover:bg-[#f3ece3] hover:text-[#b84a28]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#e8dbce] flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setAiModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-gradient-to-r from-[#8b3d1b] to-[#b84a28] text-white font-bold text-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              Trợ lý AI Gợi ý mâm cơm Bếp Việt
            </button>
          </div>
        </div>
      )}

      {/* Cart Drawer Component */}
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />

      {/* AI Food Assistant Modal */}
      <AiFoodAssistantModal
        isOpen={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        onOpenCart={() => setCartDrawerOpen(true)}
      />
    </header>
  );
};
