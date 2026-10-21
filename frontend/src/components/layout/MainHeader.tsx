import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Sparkles,
  ChevronDown,
  Shield,
  ChefHat,
  Utensils,
  QrCode,
  Users,
  BarChart3
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { CartDrawer } from '../common/CartDrawer';
import { AiFoodAssistantModal } from '../common/AiFoodAssistantModal';

export const MainHeader: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { getTotalQuantity, tableNumber } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);
  const adminDropdownRef = useRef<HTMLDivElement>(null);

  const cartCount = getTotalQuantity();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (adminDropdownRef.current && !adminDropdownRef.current.contains(event.target as Node)) {
        setAdminDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown and mobile menu on route change
  useEffect(() => {
    setAdminDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const baseLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/menu', label: 'Thực đơn' },
    { to: '/tables', label: 'Sơ đồ bàn' },
    { to: '/booking', label: 'Đặt bàn trước' },
    ...(isAuthenticated ? [{ to: '/my-orders', label: 'Lịch sử đơn' }] : []),
  ];

  const staffAdminLinks = user?.role === 'ADMIN'
    ? [
        { to: '/staff/orders', label: 'Bếp & Gọi món', icon: ChefHat },
        { to: '/admin/menu', label: 'Quản lý Menu', icon: Utensils },
        { to: '/admin/tables', label: 'Quản lý Bàn & QR', icon: QrCode },
        { to: '/admin/users', label: 'Quản trị Người dùng', icon: Users },
        { to: '/admin/stats', label: 'Thống kê Doanh thu', icon: BarChart3 },
      ]
    : user?.role === 'STAFF'
    ? [
        { to: '/staff/orders', label: 'Điều phối Bếp & Gọi món', icon: ChefHat },
        { to: '/staff/tables', label: 'Sơ đồ & Tiếp nhận bàn', icon: LayoutGrid },
      ]
    : [];

  const isStaffOrAdminActive = staffAdminLinks.some(link => location.pathname.startsWith(link.to));

  return (
    <header className="sticky top-0 z-50 bg-[#faf7f2]/95 backdrop-blur-md border-b border-[#e8dbce] transition-all">
      {/* Top Banner Bar */}
      <div className="bg-[#6d492f] text-[#f5ede3] text-xs py-1.5 px-3 sm:px-6 lg:px-8 border-b border-[#5a3b25]">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium min-w-0">
            <span className="flex items-center gap-1.5 shrink-0">
              <Phone className="w-3.5 h-3.5 text-[#d7bda0]" />
              <span className="hidden xs:inline">Hotline:</span>
              <strong className="text-white font-semibold tracking-wide">0843 093 999</strong>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-[#e4d4c2] truncate">
              <Clock className="w-3.5 h-3.5 text-[#d7bda0] shrink-0" />
              10:00 - 22:00
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-[#e4d4c2] truncate">
              <MapPin className="w-3.5 h-3.5 text-[#d7bda0] shrink-0" />
              Đại lộ Hùng Vương, Phan Thiết
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {tableNumber && (
              <span className="bg-[#b84a28] text-white px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide shadow-sm truncate max-w-[120px] sm:max-w-none">
                Bàn: {tableNumber}
              </span>
            )}
            <span className="text-[#d7bda0] hidden md:inline text-[11px] tracking-wider uppercase font-semibold">
              Hương Vị Cơm Niêu & Hải Sản Truyền Thống
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#6d492f] border-2 border-[#d7bda0] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden shrink-0">
              <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-[#faf7f2]" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg sm:text-2xl font-bold text-[#462c1a] group-hover:text-[#b84a28] transition-colors leading-none">
                Bếp Việt
              </span>
              <span className="text-[9px] sm:text-[11px] font-semibold tracking-wider text-[#6d492f] uppercase mt-0.5">
                Cơm Niêu & Hải Sản
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {baseLinks.map((link) => (
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

            {/* Dropdown for Staff / Admin */}
            {staffAdminLinks.length > 0 && (
              <div className="relative" ref={adminDropdownRef}>
                <button
                  type="button"
                  onClick={() => setAdminDropdownOpen(!adminDropdownOpen)}
                  className={`flex items-center gap-1.5 text-xs font-bold tracking-wide transition-colors py-1.5 px-3 rounded-lg border ${
                    isStaffOrAdminActive
                      ? 'bg-[#6d492f] text-white border-[#6d492f] shadow-xs'
                      : 'bg-[#f3ece3] text-[#462c1a] border-[#d7bda0]/70 hover:bg-[#ebdccf]'
                  }`}
                >
                  {user?.role === 'ADMIN' ? (
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                  ) : (
                    <ChefHat className="w-3.5 h-3.5 text-[#b84a28]" />
                  )}
                  <span>{user?.role === 'ADMIN' ? 'Quản Trị Hệ Thống' : 'Khu Nghiệp Vụ'}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${adminDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {adminDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#e8dbce] py-1.5 z-50 animate-fadeIn">
                    <div className="px-3 py-1.5 border-b border-[#f0e6dc] text-[10px] font-bold text-[#8c6d60] uppercase tracking-wider">
                      {user?.role === 'ADMIN' ? 'Menu Quản Trị Viên' : 'Chức Năng Nhân Viên'}
                    </div>
                    {staffAdminLinks.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={() => setAdminDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                            location.pathname === item.to
                              ? 'bg-[#faf5ef] text-[#b84a28] font-bold'
                              : 'text-[#462c1a] hover:bg-[#f8f4ef] hover:text-[#b84a28]'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-[#8c6d60]" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>

          {/* Actions & User Section */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Nút Kích hoạt Trợ lý AI */}
            <button
              type="button"
              onClick={() => setAiModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#8b3d1b] to-[#b84a28] text-white text-xs font-bold shadow-xs hover:shadow transition"
              title="Trợ lý AI gợi ý mâm cơm Bếp Việt"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
              <span className="hidden sm:inline">Trợ Lý AI</span>
              <span className="sm:hidden text-[11px]">AI</span>
            </button>

            {/* Cart Preview Button */}
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-full bg-[#f3ece3] hover:bg-[#e8dcce] text-[#462c1a] border border-[#d7bda0]/70 transition-colors"
              title="Mở giỏ món ăn"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#b84a28] text-white text-[10px] sm:text-[11px] font-bold w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Authentication Buttons */}
            {isAuthenticated && user ? (
              <div className="flex items-center gap-1 sm:gap-2 pl-1.5 sm:pl-2 border-l border-[#e8dbce]">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-[#462c1a] leading-tight max-w-[100px] truncate">
                    {user.fullName || user.username}
                  </span>
                  <span className="text-[10px] text-[#8c6d60] uppercase tracking-wider font-semibold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 sm:p-2 text-[#8c6d60] hover:text-[#b84a28] hover:bg-[#f3ece3] rounded-full transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-[#6d492f] hover:text-[#b84a28] px-2 sm:px-2.5 py-1.5 rounded-lg hover:bg-[#f3ece3] transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-block text-xs font-semibold bg-[#6d492f] hover:bg-[#533722] text-[#faf7f2] px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#462c1a] hover:bg-[#f3ece3] rounded-lg transition-colors ml-0.5"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#faf7f2] border-b border-[#e8dbce] px-4 pt-3 pb-6 space-y-2 max-h-[80vh] overflow-y-auto">
          {baseLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-medium text-[#462c1a] hover:bg-[#f3ece3] hover:text-[#b84a28]"
            >
              {link.label}
            </Link>
          ))}

          {/* Staff & Admin links in Mobile Menu */}
          {staffAdminLinks.length > 0 && (
            <div className="pt-2 border-t border-[#e8dbce]/70 space-y-1">
              <span className="text-[10px] font-bold text-[#8c6d60] uppercase tracking-wider px-3 block mb-1">
                {user?.role === 'ADMIN' ? 'Quản Trị Viên' : 'Khu Nghiệp Vụ'}
              </span>
              {staffAdminLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#6d492f] hover:bg-[#f3ece3] hover:text-[#b84a28]"
                  >
                    <Icon className="w-4 h-4 text-[#b84a28]" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Auth options in mobile if not logged in */}
          {!isAuthenticated && (
            <div className="pt-2 border-t border-[#e8dbce]/70 flex items-center gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg text-xs font-bold text-[#6d492f] bg-[#f3ece3]"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center py-2 rounded-lg text-xs font-bold text-white bg-[#6d492f]"
              >
                Đăng ký tài khoản
              </Link>
            </div>
          )}

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
