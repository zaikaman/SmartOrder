import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { VnPayReturnPage } from './pages/customer/VnPayReturnPage';
import { StaffOrderKitchenPage } from './pages/staff/StaffOrderKitchenPage';
import { StaffTableManagementPage } from './pages/staff/StaffTableManagementPage';
import { AdminMenuManagementPage } from './pages/admin/AdminMenuManagementPage';
import { AdminTableQrPage } from './pages/admin/AdminTableQrPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminRevenueStatsPage } from './pages/admin/AdminRevenueStatsPage';

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
              element={<VnPayReturnPage />}
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
                  <AdminMenuManagementPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/tables"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminTableQrPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminUsersPage />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/stats"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <AdminRevenueStatsPage />
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
