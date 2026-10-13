import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, Phone, MapPin, Clock, Mail, ShieldCheck } from 'lucide-react';

export const MainFooter: React.FC = () => {
  return (
    <footer className="bg-[#3f2615] text-[#e8ded4] border-t-4 border-[#b84a28]">
      {/* Upper Footer: Brand Story & Information */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Intro */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6d492f] border border-[#d7bda0] flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-[#faf7f2]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold tracking-tight text-white leading-tight">
                  NHÀ HÀNG BẾP VIỆT
                </h3>
                <p className="text-xs uppercase tracking-widest text-[#d7bda0] font-semibold">
                  Cơm Niêu & Hải Sản
                </p>
              </div>
            </div>
            <p className="text-sm text-[#d4c3b3] leading-relaxed">
              Nơi giao thoa tinh tế giữa ẩm thực làng quê truyền thống và hải sản tươi ngon Phan Thiết.
              Không gian ấm cúng, đậm chất Việt cùng những niêu cơm cháy vàng rụm giòn tan.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#d7bda0]">
              <ShieldCheck className="w-4 h-4 text-[#2d5a27]" />
              <span>Thực phẩm tươi sạch, chuẩn vị ba miền</span>
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-base tracking-wide border-b border-[#6d492f] pb-2 inline-block">
              Thông Tin Liên Hệ
            </h4>
            <ul className="space-y-2.5 text-sm text-[#d4c3b3]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#d7bda0] shrink-0 mt-0.5" />
                <span>Đại lộ Hùng Vương, KP. 13, P. Phú Thủy, TP. Phan Thiết, Bình Thuận</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#d7bda0] shrink-0" />
                <span>Hotline: <strong className="text-white font-semibold">0843 093 999</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#d7bda0] shrink-0" />
                <span>nhahang@comnieubepviet.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#d7bda0] shrink-0" />
                <span>10:00 - 22:00 (Mở cửa cả tuần)</span>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-base tracking-wide border-b border-[#6d492f] pb-2 inline-block">
              Khám Phá Nhà Hàng
            </h4>
            <ul className="space-y-2 text-sm text-[#d4c3b3]">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Trang chủ & Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/menu" className="hover:text-white transition-colors">
                  Thực đơn Cơm Niêu & Hải Sản
                </Link>
              </li>
              <li>
                <Link to="/tables" className="hover:text-white transition-colors">
                  Sơ đồ bàn & Đặt bàn trước
                </Link>
              </li>
              <li>
                <Link to="/table/T01" className="hover:text-white transition-colors">
                  Quét QR gọi món tại bàn
                </Link>
              </li>
            </ul>
          </div>

          {/* Spaces & Amenities */}
          <div className="space-y-3">
            <h4 className="text-white font-serif font-bold text-base tracking-wide border-b border-[#6d492f] pb-2 inline-block">
              Không Gian & Dịch Vụ
            </h4>
            <ul className="space-y-2 text-sm text-[#d4c3b3]">
              <li>Tầng 1: Không gian sân vườn làng quê ấm cúng</li>
              <li>Tầng 2: Ban công thoáng mát, view phố thoáng đãng</li>
              <li>Hệ thống phòng VIP riêng tư (30 - 150 khách)</li>
              <li>Tổ chức tiệc sinh nhật, họp mặt, Gala Dinner</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Copyright */}
      <div className="bg-[#2c1a0e] py-4 border-t border-[#533722] text-xs text-[#a89685] text-center px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 Nhà Hàng Cơm Niêu Bếp Việt. Đồ án môn học J2EE - Hệ thống đặt bàn & gọi món tại bàn.</p>
          <p className="text-[#d7bda0]">Kiến trúc 3 Microservices Spring Boot 3 & React 19</p>
        </div>
      </div>
    </footer>
  );
};
