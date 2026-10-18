import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/client';
import { AuthResponse } from '../../types';
import { Lock, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

declare global {
  interface Window {
    google?: any;
  }
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const googleBtnRef = useRef<HTMLDivElement>(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lay trang can redirect sau khi dang nhap thanh cong (neu co)
  const searchParams = new URLSearchParams(location.search);
  const from = (location.state as any)?.from?.pathname || (location.state as any)?.returnUrl || searchParams.get('returnUrl') || '/';

  // Khoi tao Google Identity Services
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '610122029992-9avsfbips2dr983jvfjfkvcchkr2jluk.apps.googleusercontent.com';

    const handleCredentialResponse = async (response: any) => {
      try {
        setGoogleLoading(true);
        setError(null);

        // response.credential la Google ID Token (JWT) duoc ky boi Google
        const res = await authApi.post<AuthResponse>('/auth/google', {
          credential: response.credential,
        });

        login(res.data);
        navigate(from, { replace: true });
      } catch (err: any) {
        const msg = err.response?.data?.message || err.response?.data || 'Đăng nhập bằng Google thất bại.';
        setError(typeof msg === 'string' ? msg : 'Lỗi xác thực Google OAuth2.');
      } finally {
        setGoogleLoading(false);
      }
    };

    const initGoogle = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: googleBtnRef.current.offsetWidth || 340,
            text: 'signin_with',
            shape: 'pill',
            locale: 'vi',
          });
        }
      }
    };

    // Neu script chua load kip thi cho mot chut
    if (window.google?.accounts?.id) {
      initGoogle();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          initGoogle();
        }
      }, 300);
      return () => clearInterval(interval);
    }
  }, [from, login, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await authApi.post<AuthResponse>('/auth/login', {
        username: username.trim(),
        password,
      });

      login(res.data);
      navigate(from, { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setError(typeof msg === 'string' ? msg : 'Đăng nhập không thành công.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleFallbackClick = () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setError('Thư viện Google OAuth2 đang tải, vui lòng thử lại sau 1-2 giây.');
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-[#e8dbce] shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#faf7f2] border border-[#e8dbce] rounded-2xl text-[#8B1E0F] mb-1">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-[#462c1a]">
            Đăng Nhập
          </h2>
          <p className="text-sm text-[#7d6756]">
            Chào mừng quý khách đến với Nhà Hàng Ẩm Thực Bếp Việt
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google OAuth2 Button - Chi duy nhat 1 nut tieng Viet */}
        <div>
          {/* Container render Google GIS Official Button */}
          <div ref={googleBtnRef} className="w-full flex justify-center"></div>

          {/* Neu Google GIS render cham hoac bi block, nut nay se hien thi du phong */}
          <button
            type="button"
            onClick={handleGoogleFallbackClick}
            disabled={googleLoading}
            id="google-custom-btn"
            className="w-full hidden items-center justify-center gap-3 px-4 py-3 border border-[#d1c2b4] rounded-2xl text-sm font-semibold text-[#462c1a] bg-[#faf7f2] hover:bg-[#f3ebe1] active:scale-[0.99] transition duration-200 shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{googleLoading ? 'Đang kết nối Google...' : 'Đăng nhập bằng Google'}</span>
          </button>
        </div>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#e8dbce]" />
            </div>
            <span className="relative px-3 bg-white text-xs uppercase tracking-wider text-[#9c8675] font-medium">
              Hoặc dùng tài khoản nội bộ
            </span>
          </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-2">
              Tên Đăng Nhập
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9c8675]" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="vd: khachhang01 hoặc admin"
                className="w-full pl-12 pr-4 py-3 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] focus:border-transparent text-[#462c1a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-2">
              Mật Khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9c8675]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full pl-12 pr-4 py-3 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] focus:border-transparent text-[#462c1a]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white font-bold text-sm bg-[#8B1E0F] hover:bg-[#70180B] active:scale-[0.99] transition duration-200 shadow-md disabled:opacity-50"
            >
              <span>{loading ? 'Đang xác thực...' : 'Đăng Nhập'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Tai khoan mau de nguoi cham thi va giang vien test nhanh */}
        <div className="bg-[#FFFBEB] p-4 rounded-2xl border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
          <p className="font-bold">Tài khoản thử nghiệm sẵn có:</p>
          <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
            <div>
              <p className="font-semibold text-gray-700">Khách hàng:</p>
              <p>khachhang</p>
              <p className="text-gray-500">123456</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Nhân viên:</p>
              <p>staff01</p>
              <p className="text-gray-500">123456</p>
            </div>
            <div>
              <p className="font-semibold text-gray-700">Quản trị:</p>
              <p>admin</p>
              <p className="text-gray-500">123456</p>
            </div>
          </div>
        </div>

        <div className="text-center text-sm text-[#7d6756]">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="font-bold text-[#8B1E0F] hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};
