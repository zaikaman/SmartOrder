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
  ShoppingBag
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';

export const MainHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalQuantity, tableNumber } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = getTotalQuantity();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/menu', label: 'Thực đơn' },
    { to: '/tables', label: 'Sơ đồ bàn' },
    { to: '/table/T01', label: 'Gọi món tại bàn (QR)' },
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
          <Link to="/" className="flex items-center gap-3 group">
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
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-sm font-semibold tracking-wide transition-colors py-1 border-b-2 ${
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
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Table QR Quick View */}
            <Link
              to="/tables"
              className="hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-[#f3ece3] hover:bg-[#e8dcce] text-[#6d492f] border border-[#d7bda0]/60 transition-colors"
              title="Tra cứu sơ đồ bàn"
            >
              <LayoutGrid className="w-4 h-4 text-[#b84a28]" />
              <span>Sơ đồ bàn</span>
            </Link>

            {/* Cart Preview Button */}
            <Link
              to={tableNumber ? `/table/${tableNumber}` : '/menu'}
              className="relative p-2.5 rounded-full bg-[#f3ece3] hover:bg-[#e8dcce] text-[#462c1a] border border-[#d7bda0]/70 transition-colors"
              title="Giỏ món ăn"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#b84a28] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Authentication Buttons */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-[#e8dbce]">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#462c1a] leading-tight">
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
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#6d492f] hover:text-[#b84a28] px-3 py-2 rounded-lg hover:bg-[#f3ece3] transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-semibold bg-[#6d492f] hover:bg-[#533722] text-[#faf7f2] px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#462c1a] hover:bg-[#f3ece3] rounded-lg transition-colors"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#faf7f2] border-b border-[#e8dbce] px-4 pt-2 pb-6 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-md text-base font-medium text-[#462c1a] hover:bg-[#f3ece3] hover:text-[#b84a28]"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-[#e8dbce] flex flex-col gap-2">
            <Link
              to="/tables"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#d7bda0] bg-[#f3ece3] text-[#6d492f] font-semibold text-sm"
            >
              <LayoutGrid className="w-4 h-4" />
              Tra cứu sơ đồ bàn trống
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
