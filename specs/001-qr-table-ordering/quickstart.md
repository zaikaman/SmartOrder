# Hướng Dẫn Khởi Chạy Nhanh, Tích Hợp API & Deploy (Phase 1 Quickstart)

**Tính năng**: Hệ Thống Quản Lý Đặt Bàn và Gọi Món Trực Tuyến Cho Nhà Hàng (`001-qr-table-ordering`)  
**Ngày tạo**: 2026-10-13

---

## 1. Tổng Quan Cổng Dịch Vụ (Ports Mapping)

| Thành phần | Thư mục | Cổng mặc định | Chức năng chính |
|---|---|---|---|
| **Service 1: `auth-user-service`** | `backend/auth-user-service` | `8081` | Đăng ký, đăng nhập, cấp phát JWT Token, phân quyền `CUSTOMER`, `STAFF`, `ADMIN` |
| **Service 2: `catalog-table-service`** | `backend/catalog-table-service` | `8082` | Quản lý thực đơn, tải ảnh Cloudinary, quản lý bàn ăn, mã QR, cho phép `Anonymous` đọc công khai |
| **Service 3: `booking-order-service`** | `backend/booking-order-service` | `8083` | Đặt bàn, tạo order gọi món, gửi Email xác nhận, thanh toán VNPAY Sandbox, xuất hóa đơn PDF, thống kê doanh thu |
| **Frontend: React + Vite** | `frontend` | `5173` | Giao diện người dùng kết nối tới 3 Microservices qua REST API |

---

## 2. Cấu Hình Biến Môi Trường (Tích Hợp API & Database)

Hệ thống hỗ trợ chạy ngay lập tức ở chế độ phát triển cục bộ với các giá trị mặc định an toàn, đồng thời cho phép cấu hình biến môi trường thực tế cho **Aiven MySQL**, **VNPAY Sandbox**, **JavaMailSender (Gmail/SendGrid)** và **Cloudinary**:

```powershell
# 1. Database (Mặc định dùng H2/MySQL local, hoặc điền thông tin Aiven MySQL Cloud)
$env:DB_URL="jdbc:mysql://localhost:3306/restaurant_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true"
$env:DB_USERNAME="root"
$env:DB_PASSWORD=""

# 2. JWT Secret dùng chung cho cả 3 Microservices
$env:JWT_SECRET="DoAnJ2EE_SuperSecretKey_For_Jwt_Authentication_2026_ Minimum32Bytes"

# 3. VNPAY Sandbox (Service 3 - Port 8083)
$env:VNPAY_TMN_CODE="DEMOV210"
$env:VNPAY_HASH_SECRET="RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ"
$env:VNPAY_PAY_URL="https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"
$env:VNPAY_RETURN_URL="http://localhost:5173/payment/vnpay-return"

# 4. Email Gmail SMTP (App Password) (Service 3 - Port 8083)
$env:MAIL_HOST="smtp.gmail.com"
$env:MAIL_PORT="587"
$env:MAIL_USERNAME="your-email@gmail.com"
$env:MAIL_PASSWORD="your-app-password"

# 5. Cloudinary Lưu trữ ảnh món ăn (Service 2 - Port 8082)
$env:CLOUDINARY_CLOUD_NAME="demo"
$env:CLOUDINARY_API_KEY=""
$env:CLOUDINARY_API_SECRET=""
```

---

## 3. Khởi Chạy 3 Microservices Backend & Frontend

### Bước 1: Chạy 3 Microservices Backend
Từ thư mục `d:\DoAnJ2EE\backend`:

```powershell
# Biên dịch toàn bộ 3 services
.\mvnw.cmd clean install -DskipTests

# Khởi chạy từng service (hoặc dùng npm run start:backend từ thư mục gốc)
.\mvnw.cmd -pl auth-user-service spring-boot:run
.\mvnw.cmd -pl catalog-table-service spring-boot:run
.\mvnw.cmd -pl booking-order-service spring-boot:run
```

### Bước 2: Chạy Frontend (React + Vite)
Từ thư mục `d:\DoAnJ2EE\frontend`:

```powershell
npm install
npm run dev
```

Truy cập ứng dụng tại `http://localhost:5173`.

---

## 4. Tài Khoản Mẫu Khởi Tạo Sẵn (Seeded Accounts)

| Nhóm người dùng | Vai trò | Username | Password | Mô tả quyền hạn |
|---|---|---|---|---|
| **Anonymous** | Không cần đăng nhập | - | - | Xem thực đơn, tra cứu bàn trống, quét mã QR tại bàn xem món |
| **Logged-in User** | `CUSTOMER` | `customer` | `Customer@123` | Đặt bàn trước, chọn món gửi order, xem lịch sử cá nhân, thanh toán VNPAY, tải PDF |
| **Staff** | `STAFF` | `staff` | `Staff@123` | Quản lý sơ đồ bàn, xác nhận đơn đặt bàn, cập nhật trạng thái món (`Đang nấu` -> `Đã phục vụ`) |
| **Admin** | `ADMIN` | `admin` | `Admin@123` | Toàn quyền CRUD thực đơn (tải ảnh), CRUD bàn & mã QR, quản lý tài khoản, thống kê doanh thu |

---

## 5. Lệnh Kiểm Tra Chất Lượng Toàn Dự Án (`npm run verify`)

Từ thư mục gốc `d:\DoAnJ2EE`:

```powershell
npm run verify
```

Lệnh này tự động chạy kiểm thử đơn vị & tích hợp trên cả 3 Microservices (`auth-user-service`, `catalog-table-service`, `booking-order-service`) và kiểm tra TypeScript, ESLint, Vitest cùng bản dựng Production của `frontend`.

---

## 6. Hướng Dẫn Deploy Miễn Phí (Cloud Deployment)

1. **Database (Aiven MySQL Free Tier)**:
   - Tạo dịch vụ MySQL miễn phí trên Aiven, lấy chuỗi kết nối JDBC điền vào biến môi trường `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
2. **Backend (Heroku)**:
   - Triển khai 3 Microservices lên Heroku sử dụng **Heroku Container Registry** (`heroku container:push web --app <app-name>` và `heroku container:release web --app <app-name>`) thông qua `Dockerfile` của từng service, hoặc dùng **Heroku Java Buildpack** kèm `Procfile`.
   - Cấu hình các biến môi trường trên Heroku qua lệnh `heroku config:set` (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `VNPAY_*`, `MAIL_*`, `CLOUDINARY_*`).
3. **Frontend (Vercel / Netlify)**:
   - Kết nối thư mục `frontend/` lên Vercel/Netlify, cấu hình `VITE_AUTH_API_URL`, `VITE_CATALOG_API_URL`, `VITE_ORDER_API_URL` trỏ về 3 URL Heroku của Backend Services.
