# BÁO CÁO ĐỒ ÁN MÔN HỌC CHUYÊN ĐỀ J2EE
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ ĐẶT BÀN VÀ GỌI MÓN TRỰC TUYẾN - NHÀ HÀNG ẨM THỰC BẾP VIỆT
### KIẾN TRÚC MICROSERVICES VỚI SPRING BOOT 3 & REACT 19

---

## MỤC LỤC
1. ĐẶT VẤN ĐỀ VÀ MỤC TIÊU ĐỀ TÀI
2. PHÂN TÍCH YÊU CẦU NGHIỆP VỤ & PHÂN QUYỀN
3. KIẾN TRÚC HỆ THỐNG MICROSERVICES
4. THIẾT KẾ CƠ SỞ DỮ LIỆU & SPRING DATA JPA
5. CƠ CHẾ XÁC THỰC, PHÂN QUYỀN & BẢO MẬT (SPRING SECURITY, JWT, GOOGLE OAUTH2)
6. TÍCH HỢP CÁC DỊCH VỤ BÊN THỨ BA (VNPAY, GMAIL SMTP, CLOUDINARY, OPENPDF, ZXING)
7. TÍCH HỢP TRỢ LÝ AI TƯ VẤN MÂM CƠM BẾP VIỆT
8. THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG (FRONTEND CLIENT)
9. HƯỚNG DẪN CÀI ĐẶT, VẬN HÀNH & TRIỂN KHAI CLOUD
10. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

---

## 1. ĐẶT VẤN ĐỀ VÀ MỤC TIÊU ĐỀ TÀI

### 1.1. Đặt Vấn Đề
Trong bối cảnh chuyển đổi số của ngành dịch vụ ẩm thực (F&B), mô hình phục vụ truyền thống đang bộc lộ nhiều điểm nghẽn:
- Khách hàng mất thời gian chờ đợi nhân viên mang thực đơn giấy, ghi chép thủ công dễ xảy ra nhầm lẫn món ăn hoặc sai lệch giá.
- Tình trạng quá tải vào các khung giờ cao điểm dẫn đến trùng bàn, không kiểm soát được lượng bàn trống thực tế.
- Khâu thanh toán và xuất hóa đơn phụ thuộc vào quầy thu ngân gây ùn tắc, thiếu sự linh hoạt trong các phương thức thanh toán không tiền mặt.
- Ban quản lý nhà hàng thiếu công cụ theo dõi doanh thu thời gian thực và quản lý tập trung sơ đồ bàn theo từng khu vực.

### 1.2. Mục Tiêu Đề Tài
Xây dựng một hệ thống phần mềm toàn diện hỗ trợ quản lý đặt bàn và gọi món trực tuyến cho **Nhà Hàng Ẩm Thực Bếp Việt** (phong cách ẩm thực Việt Nam truyền thống và đương đại) đáp ứng các tiêu chí:
- Cho phép khách vãng lai duyệt thực đơn và quét mã QR tại bàn để xem thông tin món ăn ngay lập tức.
- Cho phép khách hàng đặt bàn trước theo khung giờ có cơ chế chống trùng lặp bàn, chọn món trước và thanh toán trực tuyến qua VNPAY.
- Tự động hóa quy trình thông báo qua email xác nhận đặt bàn và cho phép xuất hóa đơn định dạng PDF tiếng Việt có dấu.
- Cung cấp màn hình Bếp KDS (Kitchen Order Board) giúp nhân viên cập nhật tiến độ chế biến món ăn thời gian thực.
- Phân tách kiến trúc theo mô hình **Microservices** hiện đại, đảm bảo tính độc lập, khả năng mở rộng linh hoạt và tính sẵn sàng cao khi triển khai trên nền tảng điện toán đám mây.

---

## 2. PHÂN TÍCH YÊU CẦU NGHIỆP VỤ & PHÂN QUYỀN

### 2.1. Phân Nhóm Người Dùng (User Roles)
Hệ thống phân chia rõ ràng 4 nhóm đối tượng:

1. **Khách vãng lai (Anonymous)**:
   - Truy cập trang chủ xem giới thiệu văn hóa và không gian nhà hàng.
   - Duyệt danh mục 22 món ăn ẩm thực Việt kèm hình ảnh, giá và trạng thái còn món.
   - Tra cứu sơ đồ bàn trống theo khu vực (Tầng 1, Tầng 2, Phòng VIP) và sức chứa.
   - Quét mã QR đặt tại từng bàn (`/table/:tableNumber`) để xem thực đơn gắn liền với số bàn.
   - Tương tác với Trợ lý AI để nhận tư vấn combo mâm cơm gia đình theo ngân sách và khẩu vị.

2. **Khách hàng đã đăng nhập (`CUSTOMER`)**:
   - Đăng ký và đăng nhập bằng tài khoản nội bộ hoặc đăng nhập 1-click bằng Google OAuth2.
   - Đặt bàn trước theo thời gian, số lượng khách kèm yêu cầu ghi chú đặc biệt.
   - Thêm món vào giỏ hàng và gửi đơn gọi món (Order) gắn với bàn ăn.
   - Tự động nhận email HTML xác nhận đặt bàn qua Gmail SMTP ngay khi hoàn tất.
   - Thanh toán trực tuyến an toàn qua cổng **VNPAY Sandbox** (xác thực chữ ký số HMAC-SHA512).
   - Xem lại lịch sử các đơn đặt bàn và đơn gọi món cá nhân, tải hóa đơn điện tử định dạng PDF.

3. **Nhân viên nhà hàng (`STAFF`)**:
   - Quản lý sơ đồ bàn trực quan theo khu vực, check-in khách đến nhận bàn, chuyển đổi trạng thái bàn (`AVAILABLE`, `RESERVED`, `OCCUPIED`).
   - Màn hình Bếp KDS cập nhật tiến độ từng món ăn: Chờ xử lý (`PENDING`) -> Đang nấu (`PREPARING`) -> Đã phục vụ (`SERVED`) -> Hoàn tất (`COMPLETED`).
   - Hỗ trợ khách thanh toán tiền mặt tại quầy và xuất hóa đơn PDF trực tiếp cho khách.

4. **Quản trị viên (`ADMIN`)**:
   - Quản trị toàn bộ danh mục thực đơn (CRUD món ăn, tải hình ảnh trực tiếp lên Cloudinary API).
   - Quản lý danh sách bàn ăn, tạo bàn mới và tự động sinh ảnh PNG mã QR cho từng bàn.
   - Quản trị tài khoản người dùng và điều chỉnh vai trò (`CUSTOMER`, `STAFF`, `ADMIN`).
   - Bảng điều khiển thống kê doanh thu theo khoảng thời gian, tổng số đơn hoàn tất và biểu đồ Top món bán chạy nhất.

---

## 3. KIẾN TRÚC HỆ THỐNG MICROSERVICES

Hệ thống được thiết kế theo kiến trúc Microservices hướng dịch vụ, độc lập về mặt quy trình triển khai và đóng gói:

```
                            [ Trình Duyệt / Khách Hàng ]
                                         │
                                         ▼
                     [ Frontend Client (React 19 + Vite) ]
                                 (Port 5173)
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        │ REST (8081)                    │ REST (8082)                    │ REST (8083)
        ▼                                ▼                                ▼
┌──────────────────┐            ┌──────────────────┐            ┌──────────────────┐
│ auth-user-service│            │catalog-table-serv│            │booking-order-serv│
│   (Port 8081)    │            │   (Port 8082)    │            │   (Port 8083)    │
└────────┬─────────┘            └────────┬─────────┘            └────────┬─────────┘
         │                               │                               │
         │  JWT Token validation         │                               │  RestClient
         │  (Stateless HMAC-SHA256)      ├───────────────────────────────┘  (Tra cứu giá món)
         │                               │
         ▼                               ▼                               ▼
   [ Google OAuth2 ]              [ Cloudinary ]                 [ VNPAY Sandbox ]
   [ TiDB MySQL Cloud ]           [ TiDB MySQL Cloud ]           [ Gmail SMTP ]
                                  [ Google ZXing ]               [ OpenPDF Engine ]
```

### 3.1. Các Dịch Vụ Thành Phần
1. **Service 1: `auth-user-service` (Cổng 8081)**:
   - Quản lý tài khoản, mật khẩu mã hóa BCrypt, thông tin cá nhân.
   - Xử lý xác thực Google ID Token từ phía Client và cấp phát JWT Token.
   - Cung cấp API quản lý danh sách tài khoản cho Admin.

2. **Service 2: `catalog-table-service` (Cổng 8082)**:
   - Quản lý danh mục thực đơn ẩm thực Việt và sơ đồ bàn ăn.
   - Tích hợp SDK Cloudinary tải ảnh món ăn lên máy chủ đám mây.
   - Tích hợp Google ZXing sinh ảnh mã QR (dạng PNG stream) cho từng bàn ăn.
   - Tích hợp module AI Recommendation phân tích dữ liệu thực đơn để đưa ra gợi ý bữa ăn tối ưu.
   - Cấu hình mở quyền đọc công khai (Anonymous GET) cho toàn bộ khách hàng.

3. **Service 3: `booking-order-service` (Cổng 8083)**:
   - Xử lý nghiệp vụ đặt bàn trước, kiểm tra xung đột trùng lặp khung giờ.
   - Quản lý đơn gọi món, chi tiết đơn (`OrderItem`) và tính tổng tiền.
   - Tích hợp Spring Mail (JavaMailSender) gửi email HTML xác nhận giao dịch.
   - Tích hợp cổng thanh toán trực tuyến VNPAY Sandbox với thuật toán băm HMAC-SHA512.
   - Kết xuất hóa đơn PDF tiếng Việt hỗ trợ Unicode sử dụng OpenPDF.
   - Cung cấp API thống kê doanh thu và báo cáo món ăn phục vụ Quản trị viên.

---

## 4. THIẾT KẾ CƠ SỞ DỮ LIỆU & SPRING DATA JPA

Hệ thống quản lý 5 thực thể cốt lõi thông qua Spring Data JPA và Hibernate ORM:

### 4.1. Mô Hình Thực Thể (ERD Summary)
1. **`User`** (`users`):
   - `id` (BIGINT, Primary Key)
   - `username` (VARCHAR 50, Unique)
   - `password` (VARCHAR 255, BCrypt hash)
   - `email` (VARCHAR 100, Unique)
   - `full_name` (VARCHAR 100)
   - `phone` (VARCHAR 20)
   - `role` (ENUM: `CUSTOMER`, `STAFF`, `ADMIN`)
   - `auth_provider` (VARCHAR 20: `LOCAL`, `GOOGLE`)
   - `active` (BOOLEAN)

2. **`DiningTable`** (`dining_tables`):
   - `id` (BIGINT, Primary Key)
   - `table_number` (VARCHAR 20, Unique)
   - `capacity` (INT: 2, 4, 6, 8, 12 chỗ ngồi)
   - `area` (VARCHAR 50: Tầng 1, Tầng 2, Phòng VIP)
   - `status` (ENUM: `AVAILABLE`, `RESERVED`, `OCCUPIED`)
   - `qr_code_url` (VARCHAR 255)

3. **`MenuItem`** (`menu_items`):
   - `id` (BIGINT, Primary Key)
   - `name` (VARCHAR 100, Unique)
   - `price` (DECIMAL 12,2)
   - `description` (TEXT)
   - `category` (VARCHAR 50: Cơm Niêu, Món Kho & Xào, Món Lẩu, Đồ Uống, Tráng Miệng)
   - `image_url` (VARCHAR 255)
   - `status` (ENUM: `AVAILABLE`, `OUT_OF_STOCK`, `INACTIVE`)

4. **`ReservationOrder`** (`orders`):
   - `id` (BIGINT, Primary Key)
   - `order_code` (VARCHAR 30, Unique)
   - `user_id` (BIGINT, Foreign Key)
   - `table_id` (BIGINT, Foreign Key)
   - `reservation_time` (DATETIME)
   - `party_size` (INT)
   - `total_amount` (DECIMAL 12,2)
   - `payment_method` (ENUM: `CASH`, `VNPAY`)
   - `payment_status` (ENUM: `UNPAID`, `PAID`)
   - `status` (ENUM: `PENDING`, `CONFIRMED`, `PREPARING`, `SERVED`, `COMPLETED`, `CANCELLED`)

5. **`OrderItem`** (`order_items`):
   - `id` (BIGINT, Primary Key)
   - `order_id` (BIGINT, Foreign Key trỏ tới `orders`)
   - `menu_item_id` (BIGINT)
   - `menu_item_name` (VARCHAR 100)
   - `unit_price` (DECIMAL 12,2)
   - `quantity` (INT)
   - `subtotal` (DECIMAL 12,2)
   - `note` (VARCHAR 255)

### 4.2. Cơ Sở Dữ Liệu Hỗ Trợ
- **Môi trường Cloud Production**: Cụm máy chủ phân tán **TiDB Cloud Serverless (MySQL 8.0)** kết nối qua SSL an toàn.
- **Môi trường Development & Unit Test**: Tự động hỗ trợ **H2 Database In-Memory** ở chế độ tương thích MySQL (`MODE=MySQL`), cho phép khởi chạy ngay mà không cần cài đặt phần mềm phụ trợ.

---

## 5. CƠ CHẾ XÁC THỰC, PHÂN QUYỀN & BẢO MẬT

### 5.1. Mô Hình Stateless JWT
Hệ thống sử dụng cơ chế xác thực không lưu trạng thái (Stateless Authentication):
- Khi đăng nhập thành công, `auth-user-service` phát hành một JSON Web Token được ký bằng thuật toán HMAC-SHA256 với khóa bí mật tối thiểu 32 ký tự.
- Payload của Token chứa thông tin định danh: `sub` (username), `userId`, `role` (`CUSTOMER`, `STAFF`, `ADMIN`), thời gian phát hành và thời gian hết hạn (24 giờ).
- Cả 3 Microservices đều tích hợp bộ lọc `JwtAuthenticationFilter` để giải mã Token trực tiếp ở tầng HTTP Request mà không cần gọi lại cơ sở dữ liệu xác thực, giảm thiểu độ trễ tối đa.

### 5.2. Đăng Nhập Nhanh Qua Google OAuth2
- Phía Frontend sử dụng SDK chính thức của Google Identity Services hiển thị nút đăng nhập "Sign in with Google".
- Khi người dùng xác thực với Google thành công, credential JWT do Google cấp được gửi lên backend qua endpoint `POST /api/v1/auth/google`.
- Backend tiến hành giải mã chữ ký Google Credential, trích xuất `email`, `name`, `picture`. Nếu tài khoản chưa từng tồn tại trong hệ thống, tự động tạo mới tài khoản với vai trò `CUSTOMER` và `auth_provider = GOOGLE`, sau đó cấp phát JWT Token của hệ thống.

---

## 6. TÍCH HỢP CÁC DỊCH VỤ BÊN THỨ BA

### 6.1. Cổng Thanh Toán Trực Tuyến VNPAY Sandbox
- **Thuật toán chữ ký số**: Triển khai băm bảo mật HMAC-SHA512 với `vnp_HashSecret`.
- **Quy trình tạo URL thanh toán**: Các tham số giao dịch (`vnp_Amount`, `vnp_TxnRef`, `vnp_OrderInfo`, `vnp_ReturnUrl`, `vnp_IpAddr`) được chuẩn hóa, sắp xếp theo thứ tự bảng chữ cái alphabet và tạo chuỗi checksum an toàn.
- **Xác thực kết quả giao dịch (Callback)**: Trang `VnPayReturnPage` gửi toàn bộ query parameters về endpoint `/api/v1/payments/vnpay/callback`. Backend thực hiện tính toán lại chữ ký số để đối chiếu với `vnp_SecureHash`. Khi mã phản hồi `vnp_ResponseCode == "00"` và chữ ký số khớp 100%, trạng thái đơn hàng được cập nhật sang `PAID` và ghi nhận mã giao dịch ngân hàng.

### 6.2. Gửi Email Tự Động Qua Gmail SMTP (Spring Mail)
- Tích hợp `JavaMailSender` với máy chủ `smtp.gmail.com` qua giao thức mã hóa TLS (cổng 587) sử dụng Mật khẩu ứng dụng (App Password).
- Email được định dạng HTML chuyên nghiệp, chứa thông tin mã đơn đặt bàn, số bàn, khung giờ, số lượng khách, tổng tiền và hướng dẫn nhận bàn tại nhà hàng.

### 6.3. Lưu Trữ Hình Ảnh Món Ăn Bằng Cloudinary API
- Quản trị viên tải tệp ảnh từ máy tính khi thêm hoặc sửa món ăn.
- `CloudinaryService` mã hóa và tải ảnh trực tiếp lên kho lưu trữ đám mây Cloudinary, nhận lại URL HTTPS an toàn và lưu vào thuộc tính `image_url` của món ăn.

### 6.4. Kết Xuất Hóa Đơn PDF Tiếng Việt Có Dấu (OpenPDF)
- Triển khai `PdfInvoiceService` dựa trên thư viện OpenPDF.
- Nhúng bộ phông chữ Unicode (Arial / DejaVuSans) đảm bảo hiển thị hoàn hảo tiếng Việt có dấu.
- Hóa đơn chứa đầy đủ logo nhà hàng, thông tin khách hàng, số bàn, bảng chi tiết từng món ăn (tên món, số lượng, đơn giá, thành tiền), tổng thanh toán và mã QR đối soát.

### 6.5. Tự Động Sinh Mã QR Bàn Bằng Google ZXing
- `QrCodeGeneratorService` chuyển đổi đường dẫn truy cập gọi món của bàn (ví dụ: `http://localhost:5173/table/01`) thành ma trận QR 300x300 pixel định dạng ảnh PNG stream.
- Quản trị viên có thể tải ảnh mã QR của từng bàn về máy để in ấn và dán trực tiếp tại bàn ăn.

---

## 7. TÍCH HỢP TRỢ LÝ AI TƯ VẤN MÂM CƠM BẾP VIỆT

Nhằm nâng cao trải nghiệm thực khách và đáp ứng tiêu chí điểm cộng của đồ án, hệ thống đã phát triển tính năng **Trợ Lý AI Tư Vấn Mâm Cơm Bếp Việt (AI Menu Planner)**:
- **Cơ chế hoạt động**: Người dùng nhập số lượng người ăn (ví dụ: 4 người), ngân sách dự kiến (ví dụ: 500.000 VNĐ) và các sở thích/yêu cầu khẩu vị (ví dụ: thích cá kho tộ, không ăn cay, có trẻ em, ăn chay).
- **Thuật toán xử lý**: Module AI tự động phân tích 22 món ăn trong thực đơn thực tế của nhà hàng, tính toán cân bằng dinh dưỡng (1 món chính, 1 món phụ/xào, 1 món canh/lẩu, đồ uống và tráng miệng) sao cho tổng chi phí tối ưu nhất so với ngân sách.
- **Tính năng nổi bật**: Cung cấp nút 1-click "Thêm toàn bộ mâm cơm vào giỏ hàng", giúp khách hàng không mất thời gian chọn từng món riêng lẻ.

---

## 8. THIẾT KẾ GIAO DIỆN NGƯỜI DÙNG (FRONTEND CLIENT)

Giao diện được xây dựng trên nền tảng **React 19 + TypeScript + Vite + Tailwind CSS**, tuân thủ nguyên tắc thiết kế nhận diện thương hiệu ẩm thực Việt đương đại:
- **Hệ thống màu sắc**: Tông màu ấm chủ đạo kết hợp giữa vàng đồng, nâu gỗ trầm và đỏ gạch truyền thống.
- **Độ phản hồi (Responsive)**: Tương thích hoàn hảo trên điện thoại thông minh, máy tính bảng và màn hình máy tính.

### Danh Sách 14 Màn Hình Chức Năng Đã Triển Khai:
1. `Trang Chủ` (`/`): Giới thiệu không gian nhà hàng, văn hóa ẩm thực Bếp Việt và hướng dẫn gọi món bằng QR.
2. `Trang Thực Đơn Công Khai` (`/menu`): Phân loại món theo danh mục, thanh tìm kiếm thời gian thực, hiển thị hình ảnh và giá bán.
3. `Trang Sơ Đồ Bàn` (`/tables`): Tra cứu tình trạng bàn trống theo khu vực Tầng 1, Tầng 2, VIP và sức chứa.
4. `Trang Đặt Món Qua Mã QR` (`/table/:tableNumber`): Giao diện chuyên biệt khi quét QR tại bàn, có giỏ hàng nổi và ghi chú món.
5. `Trang Đăng Nhập` (`/login`): Form đăng nhập tiêu chuẩn và nút Đăng nhập nhanh bằng Google OAuth2.
6. `Trang Đăng Ký` (`/register`): Đăng ký tài khoản khách hàng mới có kiểm tra hợp lệ dữ liệu.
7. `Trang Đặt Bàn Trước & Chọn Món` (`/booking`): Chọn ngày giờ, số lượng khách, bàn trống và chọn món trước.
8. `Trang Lịch Sử Đơn Hàng Cá Nhân` (`/my-orders`): Theo dõi trạng thái đặt bàn, xem chi tiết món gọi và tải hóa đơn PDF.
9. `Trang Tiếp Nhận Kết Quả Thanh Toán VNPAY` (`/payment/vnpay-return`): Xác minh chữ ký số giao dịch và hiển thị hóa đơn thành công.
10. `Màn Hình Bếp KDS` (`/staff/orders`): Bảng Kanban dành cho Bếp cập nhật trạng thái chế biến thời gian thực.
11. `Màn Hình Quản Lý Sơ Đồ Bàn Nhân Viên` (`/staff/tables`): Tiếp nhận khách, check-in và đổi trạng thái bàn nhanh.
12. `Trang Quản Trị Thực Đơn Admin` (`/admin/menu`): Thêm, sửa, ẩn món ăn kèm tính năng upload ảnh lên Cloudinary.
13. `Trang Quản Trị Bàn Ăn & Mã QR` (`/admin/tables`): Thêm bàn, tạo sơ đồ và tải ảnh PNG mã QR cho từng bàn.
14. `Trang Thống Kê Doanh Thu` (`/admin/stats`): Thống kê doanh thu, tổng số đơn hàng và biểu đồ các món ăn bán chạy nhất.
15. `Trợ Lý AI Gợi Ý Mâm Cơm` (Modal tương tác): Tư vấn thực đơn thông minh theo ngân sách và số người ăn.

---

## 9. HƯỚNG DẪN CÀI ĐẶT, VẬN HÀNH & TRIỂN KHAI CLOUD

### 9.1. Khởi Chạy Nhanh Trên Máy Cục Bộ
Chỉ cần thực hiện 1 lệnh duy nhất tại thư mục gốc `d:\DoAnJ2EE`:
```powershell
npm run start
```
Hệ thống tự động giải phóng cổng xung đột, nạp file `.env` và khởi động đồng thời cả 3 Backend Microservices và Frontend. Mở trình duyệt tại địa chỉ `http://localhost:5173`.

### 9.2. Triển Khai Trên Nền Tảng Đám Mây (Cloud Deployment)
- **Cơ sở dữ liệu**: Sử dụng dịch vụ TiDB Cloud Serverless (Singapore Region) miễn phí, kết nối bảo mật qua SSL.
- **Frontend**: Triển khai lên Vercel / Netlify thông qua tệp `frontend/vercel.json`, trỏ các biến môi trường API về Backend.
- **Backend**: Đã chuẩn bị sẵn các tệp `Dockerfile` multi-stage tối ưu dung lượng và tệp `backend/Procfile` sẵn sàng deploy lên Railway, Render, hoặc Heroku Container Registry.

---

## 10. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 10.1. Kết Quả Đạt Được
- Hoàn thành đầy đủ 100% các yêu cầu bắt buộc và các tiêu chí điểm cộng của đồ án J2EE.
- Xây dựng thành công hệ thống Microservices hoạt động ổn định, chia sẻ xác thực JWT phi trạng thái, kết nối mượt mà giữa 3 dịch vụ Backend và Frontend SPA.
- Tích hợp trọn vẹn các dịch vụ bên thứ ba trong thực tế: Cổng thanh toán trực tuyến VNPAY Sandbox, Google OAuth2, Gmail SMTP, Cloudinary, OpenPDF và mã QR Google ZXing.
- Giao diện người dùng phong phú với hơn 14 màn hình, mang phong cách nhận diện ẩm thực Việt Nam đặc sắc, loại bỏ hoàn toàn mã giả hay hardcode.

### 10.2. Hướng Phát Triển Tương Lai
- Bổ sung công nghệ WebSocket (Spring WebSocket / STOMP) để đồng bộ trạng thái đơn món giữa Bếp và Khách hàng theo thời gian thực hai chiều.
- Tích hợp thêm cổng thanh toán ví điện tử MoMo và ZaloPay.
- Phát triển ứng dụng di động dành riêng cho nhân viên phục vụ (Waiter App) trên nền tảng React Native.
