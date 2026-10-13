import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { RoleGuard } from './components/layout/RoleGuard';
import { useAuthStore } from './store/useAuthStore';

// Tam thoi tao placeholder component cho cac route chua build o Phase 2 de router hoat dong tron tru
const PlaceholderView = ({ title, desc }: { title: string; desc: string }) => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
    <div className="max-w-lg bg-white p-8 rounded-xl border border-stone-200 shadow-sm">
      <h2 className="text-2xl font-bold text-stone-900 mb-2">{title}</h2>
      <p className="text-stone-600 text-sm mb-6">{desc}</p>
      <Link
        to="/"
        className="px-4 py-2 bg-orange-700 text-white rounded-lg text-sm font-medium hover:bg-orange-800 transition"
      >
        Ve Trang chu
      </Link>
    </div>
  </div>
);

export default function App() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900">
        {/* Navigation Header toi thieu cho Phase 2 */}
        <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-orange-500">
                NHA HANG AM THUC BEP VIET
              </span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-stone-300">
              <Link to="/menu" className="hover:text-white transition">Thuc Don</Link>
              <Link to="/tables" className="hover:text-white transition">Tra Cuu Ban</Link>
              {isAuthenticated && (
                <Link to="/my-orders" className="hover:text-white transition">Don Cua Toi</Link>
              )}
              {user?.role === 'STAFF' && (
                <Link to="/staff/orders" className="text-amber-400 hover:text-amber-300 transition">Dieu Phoi Bep</Link>
              )}
              {user?.role === 'ADMIN' && (
                <Link to="/admin/menu" className="text-amber-400 hover:text-amber-300 transition">Quan Tri Admin</Link>
              )}
            </nav>

            <div className="flex items-center space-x-3 text-sm">
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <span className="text-xs text-stone-300 bg-stone-800 px-2 py-1 rounded">
                    {user?.fullName} ({user?.role})
                  </span>
                  <button
                    onClick={logout}
                    className="text-xs text-stone-400 hover:text-white transition"
                  >
                    Dang Xuat
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-stone-300 hover:text-white text-xs font-medium"
                  >
                    Dang Nhap
                  </Link>
                  <Link
                    to="/register"
                    className="px-3 py-1.5 bg-orange-700 hover:bg-orange-600 text-white text-xs font-medium rounded-md transition"
                  >
                    Dang Ky
                  </Link>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Router View Content */}
        <main className="flex-1">
          <Routes>
            {/* 1. Public Routes */}
            <Route
              path="/"
              element={
                <PlaceholderView
                  title="Nha Hang Am Thuc Bep Viet"
                  desc="Nen tang dat ban truc tuyen va goi mon thong minh tai ban qua ma QR. San sang trien khai Phase 3 MVP."
                />
              }
            />
            <Route
              path="/menu"
              element={<PlaceholderView title="Thuc Don Am Thuc Viet Nam" desc="Danh sach cac mon an truyen thong va hien dai cua Bep Viet." />}
            />
            <Route
              path="/tables"
              element={<PlaceholderView title="Tra Cuu Ban An" desc="So do ban trong theo khung gio tai cac khu vuc." />}
            />
            <Route
              path="/table/:tableNumber"
              element={<PlaceholderView title="Goi Mon Tai Ban Qua Ma QR" desc="Thuc don dac biet phuc vu tai ban." />}
            />
            <Route
              path="/login"
              element={<PlaceholderView title="Dang Nhap" desc="Dang nhap tai khoan Khach hang hoac Nhan vien." />}
            />
            <Route
              path="/register"
              element={<PlaceholderView title="Dang Ky Tai Khoan" desc="Dang ky tai khoan khach hang moi." />}
            />

            {/* 2. Customer Protected Routes */}
            <Route
              path="/booking"
              element={
                <RoleGuard allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                  <PlaceholderView title="Dat Ban Truoc" desc="Chon ban, gio hen va goi mon truoc." />
                </RoleGuard>
              }
            />
            <Route
              path="/my-orders"
              element={
                <RoleGuard allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']}>
                  <PlaceholderView title="Lich Su Dat Ban & Goi Mon" desc="Danh sach hoa don ca nhan cua khach hang." />
                </RoleGuard>
              }
            />
            <Route
              path="/payment/vnpay-return"
              element={<PlaceholderView title="Ket Qua Thanh Toan VNPAY" desc="Xac nhan giao dich thanh toan truc tuyen." />}
            />

            {/* 3. Staff Protected Routes */}
            <Route
              path="/staff/tables"
              element={
                <RoleGuard allowedRoles={['STAFF', 'ADMIN']}>
                  <PlaceholderView title="Quan Ly So Do Ban" desc="Tiep nhan khach va cap nhat trang thai ban an." />
                </RoleGuard>
              }
            />
            <Route
              path="/staff/orders"
              element={
                <RoleGuard allowedRoles={['STAFF', 'ADMIN']}>
                  <PlaceholderView title="Dieu Phoi Don Mon Bep" desc="Cap nhat trang thai mon: Dang nau -> Da phuc vu." />
                </RoleGuard>
              }
            />

            {/* 4. Admin Protected Routes */}
            <Route
              path="/admin/menu"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <PlaceholderView title="Quan Tri Thuc Don" desc="Them, sua, xoa mon va tai anh Cloudinary." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/tables"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <PlaceholderView title="Quan Tri Ban An & Ma QR" desc="Them ban va xuat ma QR dinh danh." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/users"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <PlaceholderView title="Quan Tri Nguoi Dung" desc="Danh sach va phan quyen tai khoan he thong." />
                </RoleGuard>
              }
            />
            <Route
              path="/admin/stats"
              element={
                <RoleGuard allowedRoles={['ADMIN']}>
                  <PlaceholderView title="Thong Ke Doanh Thu" desc="Bao cao doanh thu va top mon an ban chay." />
                </RoleGuard>
              }
            />
          </Routes>
        </main>

        {/* Footer toi thieu */}
        <footer className="bg-stone-900 text-stone-400 py-6 text-center text-xs border-t border-stone-800">
          <p>Nha Hang Am Thuc Bep Viet - Do An J2EE Microservices</p>
        </footer>
      </div>
    </Router>
  );
}
