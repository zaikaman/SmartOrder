import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  UtensilsCrossed, 
  QrCode, 
  Sparkles, 
  ChevronRight, 
  LayoutGrid, 
  Award,
  Users
} from 'lucide-react';
import { catalogApi } from '../../api/client';
import { MenuItem } from '../../types';
import { MenuItemCard } from '../../components/common/MenuItemCard';

export const HomePage: React.FC = () => {
  const [featuredDishes, setFeaturedDishes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await catalogApi.get<MenuItem[]>('/menu');
        // Pick top 6 signature dishes
        setFeaturedDishes(res.data.slice(0, 6));
      } catch (err) {
        console.error('Không thể tải món ăn nổi bật', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[#3f2615] text-[#f5ede3] border-b-4 border-[#b84a28]">
        {/* Background Overlay */}
        <div 
          className="absolute inset-0 opacity-25 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage: `url('https://comnieubepviet.com/thumbs/1366x660x1/upload/photo/33497263034737386295485954008816338658405330n-78940.jpeg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2c1a0e] via-[#3f2615]/90 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 flex flex-col lg:flex-row items-center justify-between gap-12">
          {/* Hero Left Content */}
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6d492f]/80 border border-[#d7bda0]/40 text-[#d7bda0] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#d7bda0]" />
              Tinh Hoa Ẩm Thực Việt Nam
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Cơm Niêu Bếp Việt <br />
              <span className="text-[#d7bda0] font-normal italic">Đậm Đà Hương Vị Quê Hương</span>
            </h1>

            <p className="text-base sm:text-lg text-[#e4d4c2] leading-relaxed">
              Thưởng thức hạt cơm niêu cháy vàng giòn tan quyện cùng cá kho tộ kẹo nước hàng,
              hải sản tươi sống Phan Thiết và những món canh đồng quê ngọt lành. Không gian mộc mạc,
              ấm cúng như bữa cơm nhà mẹ nấu.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#b84a28] hover:bg-[#a13e20] text-white font-bold text-sm shadow-lg shadow-[#b84a28]/30 transition-all hover:scale-[1.02]"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Xem Thực Đơn Cơm Niêu</span>
              </Link>

              <Link
                to="/tables"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#6d492f] hover:bg-[#533722] text-[#f5ede3] border border-[#d7bda0]/60 font-bold text-sm transition-all hover:scale-[1.02]"
              >
                <LayoutGrid className="w-4 h-4 text-[#d7bda0]" />
                <span>Tra Cứu Sơ Đồ Bàn</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#6d492f]/60 text-xs text-[#d7bda0]">
              <div>
                <strong className="block text-white text-lg font-bold">100%</strong>
                <span>Nguyên liệu tươi sạch</span>
              </div>
              <div>
                <strong className="block text-white text-lg font-bold">10+ Bàn</strong>
                <span>Phòng VIP & Sân vườn</span>
              </div>
              <div>
                <strong className="block text-white text-lg font-bold">QR Code</strong>
                <span>Gọi món tại bàn tức thì</span>
              </div>
            </div>
          </div>

          {/* Hero Right Media Preview */}
          <div className="relative w-full max-w-md lg:max-w-lg">
            <div className="relative rounded-2xl overflow-hidden border-4 border-[#d7bda0] shadow-2xl bg-[#3f2615]">
              <img
                src="https://comnieubepviet.com/upload/product/menu-21-tom-rang-trung-muoi-5429.jpg"
                alt="Đặc sản Bếp Việt"
                className="w-full h-80 sm:h-96 object-cover object-center transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="inline-block text-xs font-bold text-[#d7bda0] uppercase tracking-widest mb-1">
                  Đặc Sản Trứ Danh
                </span>
                <p className="font-serif text-xl sm:text-2xl font-bold leading-snug">
                  Tôm Rang Trứng Muối & Cơm Niêu Cháy Giòn
                </p>
                <p className="text-xs text-[#e4d4c2] mt-1 line-clamp-1">
                  Công thức gia truyền vàng ươm, đậm đà hương vị biển
                </p>
              </div>
            </div>

            {/* Floating QR Tag */}
            <div className="absolute -bottom-6 -left-6 bg-[#faf7f2] text-[#462c1a] border-2 border-[#d7bda0] p-3.5 rounded-xl shadow-xl flex items-center gap-3">
              <div className="p-2 bg-[#6d492f] text-white rounded-lg">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold block">Quét QR Tại Bàn</span>
                <span className="text-[11px] text-[#7d6756]">Gọi món trực tiếp không chờ đợi</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. QR Ordering Feature Highlight */}
      <section className="py-14 bg-[#f3ece3] border-b border-[#e8dbce]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#b84a28]">
              Công Nghệ Số Tiên Phong
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#462c1a]">
              Quy Trình Gọi Món Tại Bàn Bằng Mã QR
            </h2>
            <p className="text-sm text-[#7d6756]">
              Trải nghiệm gọi món hiện đại, nhanh chóng và chính xác cho thực khách tại Nhà hàng Bếp Việt.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#faf7f2] p-6 rounded-xl border border-[#e8dbce] text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#6d492f] text-[#faf7f2] flex items-center justify-center text-xl font-bold font-serif shadow">
                1
              </div>
              <h3 className="font-serif text-lg font-bold text-[#462c1a]">
                Quét Mã QR Tại Bàn
              </h3>
              <p className="text-xs text-[#7d6756] leading-relaxed">
                Thực khách ngồi tại bàn quét mã QR dán trên mặt bàn bằng camera điện thoại để mở menu riêng của bàn.
              </p>
            </div>

            <div className="bg-[#faf7f2] p-6 rounded-xl border border-[#e8dbce] text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#b84a28] text-[#faf7f2] flex items-center justify-center text-xl font-bold font-serif shadow">
                2
              </div>
              <h3 className="font-serif text-lg font-bold text-[#462c1a]">
                Chọn Món & Tùy Biến
              </h3>
              <p className="text-xs text-[#7d6756] leading-relaxed">
                Xem chi tiết hình ảnh món ăn, giá niêm yết rõ ràng, chọn số lượng và ghi chú gia vị theo khẩu vị riêng.
              </p>
            </div>

            <div className="bg-[#faf7f2] p-6 rounded-xl border border-[#e8dbce] text-center space-y-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#2d5a27] text-[#faf7f2] flex items-center justify-center text-xl font-bold font-serif shadow">
                3
              </div>
              <h3 className="font-serif text-lg font-bold text-[#462c1a]">
                Bếp Nấu Tức Thì
              </h3>
              <p className="text-xs text-[#7d6756] leading-relaxed">
                Đơn hàng tự động đồng bộ tức thì đến màn hình điều phối của Bếp và Nhân viên phục vụ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Dishes Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#e8dbce]">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#b84a28]">
              Thực Đơn Tiêu Biểu
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#462c1a] mt-1">
              Món Ngon Không Thể Bỏ Lỡ
            </h2>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6d492f] hover:text-[#b84a28] transition-colors"
          >
            <span>Xem toàn bộ thực đơn</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16 text-sm text-[#8c6d60]">
            Đang tải thực đơn Bếp Việt...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredDishes.map((item) => (
              <MenuItemCard key={item.id} item={item} showOrderAction={true} />
            ))}
          </div>
        )}
      </section>

      {/* 4. Dining Spaces & VIP Rooms */}
      <section className="py-16 bg-[#faf7f2] border-t border-[#e8dbce]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#b84a28]">
                Không Gian Ấm Cúng
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#462c1a]">
                Sảnh Tiệc Rộng Rãi & Phòng VIP Sang Trọng
              </h2>
              <p className="text-sm text-[#7d6756] leading-relaxed">
                Nằm trên trục đường Đại lộ Hùng Vương đắc địa, Bếp Việt sở hữu không gian thoáng mát
                được bài trí theo phong cách mộc tre nứa đồng quê. Nhà hàng có hệ thống phòng VIP
                riêng biệt từ 10 đến 150 khách, thích hợp cho các buổi gặp mặt đối tác, liên hoan
                hay tiệc sinh nhật thân mật.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#f3ece3] border border-[#e8dbce]">
                  <Users className="w-5 h-5 text-[#b84a28] mb-2" />
                  <h4 className="font-serif font-bold text-sm text-[#462c1a]">Phòng VIP Riêng</h4>
                  <p className="text-xs text-[#7d6756] mt-1">Sức chứa đa dạng từ 10 - 50 khách</p>
                </div>
                <div className="p-4 rounded-xl bg-[#f3ece3] border border-[#e8dbce]">
                  <Award className="w-5 h-5 text-[#b84a28] mb-2" />
                  <h4 className="font-serif font-bold text-sm text-[#462c1a]">Tiệc Gala & Sự Kiện</h4>
                  <p className="text-xs text-[#7d6756] mt-1">Hỗ trợ âm thanh, set menu chu đáo</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/tables"
                  className="inline-flex items-center gap-2 text-sm font-bold px-5 py-3 rounded-xl bg-[#6d492f] hover:bg-[#533722] text-white transition-colors"
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Tra Cứu & Đặt Bàn Ngay</span>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img
                src="https://comnieubepviet.com/thumbs/675x600x1/upload/product/menu-21-tom-rang-trung-muoi-5429.jpg"
                alt="Món ngon Bếp Việt"
                className="w-full h-56 object-cover rounded-xl border border-[#d7bda0] shadow"
              />
              <img
                src="https://comnieubepviet.com/thumbs/675x600x1/upload/product/thit-luoc-ca-phao-139k-1712.jpg"
                alt="Thịt luộc cà pháo Bếp Việt"
                className="w-full h-56 object-cover rounded-xl border border-[#d7bda0] shadow mt-6"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
