import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authApi } from '../../api/client';
import { AuthResponse } from '../../types';
import { User, Mail, Phone, AlertCircle, ArrowRight, UserPlus } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password || !email.trim() || !fullName.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await authApi.post<AuthResponse>('/auth/register', {
        username: username.trim(),
        password,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
      });

      login(res.data);
      navigate('/booking', { replace: true });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data || 'Đăng ký không thành công.';
      setError(typeof msg === 'string' ? msg : 'Có lỗi xảy ra khi tạo tài khoản.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#e8dbce] shadow-xl">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-[#faf7f2] border border-[#e8dbce] rounded-2xl text-[#8B1E0F] mb-1">
            <UserPlus className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-[#462c1a]">
            Đăng Ký Tài Khoản
          </h2>
          <p className="text-sm text-[#7d6756]">
            Tham gia Bếp Việt để nhận ưu đãi và quản lý lịch đặt bàn
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-1">
              Họ và Tên *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9c8675]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn An"
                className="w-full pl-11 pr-4 py-2.5 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] text-[#462c1a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-1">
              Địa Chỉ Email (Nhận thông báo đặt bàn) *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9c8675]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vanan@example.com"
                className="w-full pl-11 pr-4 py-2.5 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] text-[#462c1a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-1">
              Số Điện Thoại
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9c8675]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full pl-11 pr-4 py-2.5 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] text-[#462c1a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-1">
                Tên Đăng Nhập *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="an_nguyen"
                className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] text-[#462c1a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#462c1a] uppercase tracking-wider mb-1">
                Mật Khẩu *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-4 py-2.5 bg-[#faf7f2] border border-[#d1c2b4] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E0F] text-[#462c1a]"
              />
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-white font-bold text-sm bg-[#8B1E0F] hover:bg-[#70180B] active:scale-[0.99] transition duration-200 shadow-md disabled:opacity-50"
            >
              <span>{loading ? 'Đang khởi tạo tài khoản...' : 'Tạo Tài Khoản'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-[#7d6756]">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-bold text-[#8B1E0F] hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
