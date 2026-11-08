# Hệ Thống Quản Lý Đặt Bàn Và Gọi Món Trực Tuyến - Nhà Hàng Ẩm Thực Bếp Việt

Hệ thống phần mềm quản lý đặt bàn và gọi món trực tuyến dành cho nhà hàng ẩm thực truyền thống Việt Nam, được xây dựng theo kiến trúc Microservices hướng dịch vụ trên nền tảng Java Enterprise (Spring Boot 3.4.x, Spring Security 6) kết hợp giao diện người dùng hiện đại React 19, TypeScript và Tailwind CSS.

---

## 1. Tổng Quan Kiến Trúc Hệ Thống

Hệ thống được tổ chức dưới dạng Monorepo gồm 3 Microservices độc lập và 1 Single Page Application (SPA):

- **Service 1: Auth & User Service (Cổng 8081)**
  - Quản lý người dùng, phân quyền RBAC (ADMIN, STAFF, CUSTOMER).
  - Đăng ký, đăng nhập bằng tài khoản mật khẩu mã hóa BCrypt.
  - Đăng nhập bằng Google OAuth2 xác thực token ID an toàn.
  - Phát hành và xác thực JWT (JSON Web Token) HMAC-SHA256 không lưu trạng thái (stateless).

- **Service 2: Catalog & Table Service (Cổng 8082)**
  - Quản lý danh mục thực đơn món ăn (Khai vị, Món chính, Canh & lẩu, Tráng miệng, Đồ uống).
  - Tích hợp Cloudinary API để tải lên và quản lý ảnh món ăn trực tuyến.
  - Quản lý sơ đồ bàn ăn (Khu vực Trong nhà, Ngoài trời, Phòng VIP).
  - Sinh mã QR Code tự động theo từng bàn bằng thư viện Google ZXing để khách hàng quét mã truy cập menu tại bàn.
  - Trợ lý AI thông minh (AiRecommendationService) gợi ý mâm cơm truyền thống Bếp Việt theo số lượng người và ngân sách.

- **Service 3: Booking & Order Service (Cổng 8083)**
  - Xử lý đặt bàn trước theo khung giờ, có cơ chế kiểm tra chống trùng giờ và kiểm tra sức chứa bàn.
  - Quản lý giỏ hàng và đơn gọi món theo thời gian thực.
  - Điều phối đơn gọi món cho Nhân viên phục vụ và Màn hình Bếp (Kitchen Order Board: PENDING -> PREPARING -> SERVED -> COMPLETED).
  - Tích hợp cổng thanh toán trực tuyến VNPAY Sandbox với mã hóa chữ ký HMAC-SHA512.
  - Hỗ trợ thanh toán tiền mặt tại quầy cho nhân viên thu ngân.
  - Tự động kết xuất hóa đơn thanh toán định dạng PDF tiếng Việt có dấu bằng OpenPDF.
  - Tự động gửi email HTML xác nhận đơn đặt bàn qua dịch vụ Gmail SMTP.
  - Thống kê doanh thu theo ngày, tháng và xếp hạng top món bán chạy.

- **Frontend Client (Cổng 5173 / Cổng 80 qua Nginx)**
  - React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Zustand Store, React Router v7.
  - Giao diện phân tách rõ ràng theo 3 phân hệ: Khách hàng (Public & Customer), Nhân viên / Bếp (Staff), và Quản trị viên (Admin).

---

## 2. Yêu Cầu Môi Trường

- Java Development Kit (JDK): Phiên bản 17 trở lên (OpenJDK hoặc Eclipse Temurin).
- Node.js: Phiên bản 20.x trở lên và npm phiên bản 10.x trở lên.
- Docker & Docker Compose (tùy chọn, nếu chạy qua container).
- Git.

---

## 3. Hướng Dẫn Cài Đặt Và Chạy Cục Bộ

### Bước 1: Chuẩn bị biến môi trường

Sao chép file cấu hình mẫu `.env.example` thành `.env` tại thư mục gốc của dự án:

```bash
cp .env.example .env
```

Nội dung file `.env` gồm các tham số:

```env
# Database Configuration
DB_URL=jdbc:mysql://localhost:3306/restaurant_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=root

# Security
JWT_SECRET=DoAnJ2EE_SuperSecretKey_For_Jwt_Authentication_2026_Minimum32Bytes

# Cloudinary (Quản lý ảnh thực đơn)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# VNPAY Sandbox Payment
VNPAY_TMN_CODE=DEMOV210
VNPAY_HASH_SECRET=RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ
VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/payment/vnpay-return

# Gmail SMTP (Gửi email xác nhận đặt bàn)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
```

Lưu ý: Các microservices đã được cấu hình cơ chế sẵn sàng chạy fallback với H2 in-memory database nếu MySQL chưa được bật, giúp kiểm thử ngay lập tức mà không gặp lỗi kết nối.

### Bước 2: Cài đặt dependencies

Chạy lệnh sau tại thư mục gốc để cài đặt dependencies cho cả Monorepo và Frontend:

```bash
npm run install:all
```

### Bước 3: Khởi chạy hệ thống

Có thể lựa chọn một trong các cách khởi chạy sau:

#### Cách 1: Khởi chạy tất cả dịch vụ đồng thời bằng 1 lệnh npm

```bash
npm start
```

Lệnh trên sẽ tự động dọn dẹp các tiến trình cũ trên các cổng 8081, 8082, 8083, 5173 và khởi động đồng thời cả 3 microservices cùng giao diện Frontend.

- Frontend: http://localhost:5173
- Auth Service: http://localhost:8081
- Catalog Service: http://localhost:8082
- Booking Service: http://localhost:8083

#### Cách 2: Khởi chạy bằng Docker Compose

Nếu máy tính đã cài đặt Docker:

```bash
docker compose up --build
```

Hệ thống sẽ tự động khởi tạo database MySQL 8.0, build container cho cả 3 microservices backend và container Frontend chạy dưới Nginx reverse proxy tại địa chỉ `http://localhost:5173`.

---

## 4. Danh Sách Tài Khoản Mặc Định

Hệ thống tự động nạp sẵn các tài khoản mẫu tại DataInitializer:

| Vai trò | Tên đăng nhập | Mật khẩu | Quyền hạn truy cập |
|---|---|---|---|
| Quản trị viên (Admin) | `admin` | `admin123` | Toàn quyền quản lý Menu, Bàn ăn, Người dùng, Thống kê doanh thu |
| Nhân viên (Staff) | `staff` | `staff123` | Màn hình Bếp, Cập nhật trạng thái món, Sơ đồ bàn ăn, Thu tiền mặt tại quầy |
| Khách hàng (Customer) | `customer` | `customer123` | Đặt bàn, Chọn món gọi món, Thanh toán VNPAY, Xem lịch sử đơn hàng |

Ngoài ra, hệ thống hỗ trợ đăng nhập trực tiếp bằng Google OAuth2 trên giao diện đăng nhập.

---

## 5. Hướng Dẫn Kiểm Thử Thanh Toán VNPAY Sandbox

Hệ thống đã tích hợp sẵn thông tin Merchant Sandbox của VNPAY để kiểm thử nghiệp vụ thanh toán trực tuyến:

- Cổng thanh toán: VNPAY Sandbox Portal
- Ngân hàng test: **NCB**
- Số thẻ test: `9704198526191432198`
- Tên chủ thẻ: `NGUYEN VAN A`
- Ngày phát hành: `07/15`
- Mã OTP xác thực: `123456`

Quy trình kiểm thử thanh toán:
1. Đăng nhập tài khoản `customer` hoặc tạo đơn đặt bàn mới.
2. Vào trang Chi tiết đơn hàng hoặc Lịch sử đơn hàng, bấm **Thanh toán VNPAY**.
3. Hệ thống chuyển hướng sang Cổng thanh toán VNPAY Sandbox.
4. Chọn thẻ nội địa NCB, nhập thông tin thẻ test ở trên.
5. Nhập OTP `123456` và bấm Xác nhận.
6. VNPAY chuyển hướng về trang `http://localhost:5173/payment/vnpay-return`.
7. Đơn hàng được cập nhật trạng thái `PAID`, hóa đơn PDF sẵn sàng được tải về.

---

## 6. Hướng Dẫn Triển Khai Lên Nền Tảng Đám Mây (Heroku & Vercel)

### Triển khai Backend lên Heroku

1. Cài đặt Heroku CLI và đăng nhập:
   ```bash
   heroku login
   ```
2. Tạo ứng dụng trên Heroku:
   ```bash
   heroku create restaurant-bepviet-backend
   ```
3. Thêm buildpack Java:
   ```bash
   heroku buildpacks:add heroku/java
   ```
4. Cấu hình các biến môi trường trên Heroku (Config Vars) tương tự `.env`.
5. Triển khai mã nguồn: Heroku sẽ tự động nhận diện `backend/pom.xml`, `backend/system.properties` (Java 17) và `backend/Procfile`.

### Triển khai Frontend lên Vercel

1. Dự án frontend đã được cấu hình sẵn file `frontend/vercel.json` để xử lý rewrite URL cho React Router SPA.
2. Cài đặt Vercel CLI hoặc kết nối repository với Vercel Dashboard:
   ```bash
   cd frontend
   vercel --prod
   ```
3. Thiết lập biến môi trường `VITE_API_BASE_URL` trỏ tới địa chỉ backend trên Heroku.

---

## 7. Lệnh Kiểm Tra Chất Lượng Và Đóng Gói Dự Án

- **Kiểm tra toàn bộ test suite và build (Verification):**
  ```bash
  npm run verify
  ```
  Lệnh trên sẽ thực thi tất cả 24 unit test và integration test của 3 microservices backend thông qua Maven Wrapper, sau đó biên dịch TypeScript và build Frontend Vite để đảm bảo hệ thống hoàn toàn sạch lỗi.

- **Đóng gói toàn bộ dự án:**
  ```bash
  npm run build
  ```
