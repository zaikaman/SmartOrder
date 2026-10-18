import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { RoleGuard } from './components/layout/RoleGuard';
import { MainHeader } from './components/layout/MainHeader';
import { MainFooter } from './components/layout/MainFooter';
import { HomePage } from './pages/public/HomePage';
import { PublicMenuPage } from './pages/public/PublicMenuPage';
import { TableLookupPage } from './pages/public/TableLookupPage';
import { QrTableOrderPage } from './pages/public/QrTableOrderPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { BookingAndOrderPage } from './pages/customer/BookingAndOrderPage';
import { MyOrdersHistoryPage } from './pages/customer/MyOrdersHistoryPage';
import { StaffOrderKitchenPage } from './pages/staff/StaffOrderKitchenPage';
import { StaffTableManagementPage } from './pages/staff/StaffTableManagementPage';

// Placeholder view cho các route dành cho các Phase tiếp theo (Phase 6 -> Phase 7)
const PlaceholderView = ({ title, desc }: { title: string; desc: string }) => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center bg-[#faf7f2]">
    <div className="max-w-lg bg-white p-8 rounded-2xl border border-[#e8dbce] shadow-sm space-y-3">
      <h2 className="font-serif text-2xl font-bold text-[#462c1a]">{title}</h2>
      <p className="text-xs text-[#7d6756] leading-relaxed">{desc}</p>
      <div className="pt-2">
        <Link
          to="/"
          className="inline-block px-4 py-2 bg-[#6d492f] text-white rounded-xl text-xs font-bold hover:bg-[#533722] transition"
        >
          Về Trang Chủ
        </Link>
      </div>
    </div>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#462c1a]">
        {/* Main Header Brand Bep Viet */}
        <MainHeader />

        {/* Router View Content */}
        <main className="flex-1">
          <Routes>
            {/* 1. Public Routes (Phase 3 MVP) */}
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<PublicMenuPage />} />
            <Route path="/tables" element={<TableLookupPage />} />
            <Route path="/table/:tableNumber" element={<QrTableOrderPage />} />

            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 2. Customer Protected Routes (Phase 4) */}
            <Route
              path="/booking"
              element={
                <RoleGuard allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                  <BookingAndOrderPage />
                </RoleGuard>
              }
            />
            <Route
              path="/my-orders"
              element={
                <RoleGuard allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                  <MyOrdersHistoryPage />
                </RoleGuard>
              }
            />
            <Route
              path="/payment/vnpay-return"
              element={<PlaceholderView title="Kết Quả Thanh Toán VNPAY" desc="Xác nhận giao dịch thanh toán trực tuyến qua cổng VNPAY Sandbox." />}
            />

            {/* 3. Staff Protected Routes (Phase 5) */}
            <Route
              path="/staff/tables"
              element={
                <RoleGuard allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffTableManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/staff/orders"
              element={
                <RoleGuard allowedRoles={['STAFF', 'ADMIN']}>
                  <StaffOrderKitchenPage />
                </RoleGuard>
              }
            />

            {/* 4. Admin Protected Routes (Phase 7) */}
            <Route
              path="/admin/menu"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <PlaceholderView title="Quản Trị Thực Đơn & Cloudinary" desc="Thêm, sửa, xóa món ăn và tải hình ảnh lên Cloudinary." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/tables"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <PlaceholderView title="Quản Trị Bàn Ăn & Mã QR" desc="Quản lý sơ đồ bàn và xuất in mã QR định danh." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <PlaceholderView title="Quản Trị Người Dùng" desc="Danh sách tài khoản và phân quyền CUSTOMER, STAFF, ADMIN." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/stats"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <PlaceholderView title="Thống Kê Doanh Thu" desc="Báo cáo doanh thu theo ngày/tháng và Top món ăn bán chạy nhất." />
                </RoleGuard>
              }
            />
          </Routes>
        </main>

        {/* Main Footer Brand Bep Viet */}
        <MainFooter />
      </div>
    </Router>
  );
}
