# Nghiên Cứu Kỹ Thuật & Quyết Định Kiến Trúc (Phase 0 Research)

**Tính năng**: Hệ Thống Quản Lý Đặt Bàn và Gọi Món Trực Tuyến Cho Nhà Hàng (`001-qr-table-ordering`)  
**Ngày tạo**: 2026-10-13

---

## 1. Kiến trúc 3 Microservices Độc lập (Spring Boot 3.4 + Java 17)

- **Decision**: Chia hệ thống Backend thành **3 Spring Boot Microservices** gọn nhẹ, độc lập, quản lý trong một Maven Multi-module project tại thư mục `backend/`:
  1. **Service 1 - `auth-user-service` (Port `8081`)**: Chịu trách nhiệm đăng ký, đăng nhập, cấp phát JWT Token và quản lý phân quyền người dùng (`CUSTOMER`, `STAFF`, `ADMIN`).
  2. **Service 2 - `catalog-table-service` (Port `8082`)**: Chịu trách nhiệm quản lý thực đơn (`MenuItem`), tải ảnh món ăn lên Cloudinary, quản lý sơ đồ bàn ăn (`DiningTable`), trạng thái bàn (`AVAILABLE`, `RESERVED`, `OCCUPIED`) và sinh mã QR (`qr_code_url`). Cho phép khách vãng lai (`Anonymous`) đọc dữ liệu công khai.
  3. **Service 3 - `booking-order-service` (Port `8083`)**: Chịu trách nhiệm xử lý đặt bàn trước, tạo order gọi món (`ReservationOrder` & `OrderItem`), cập nhật tiến độ chế biến (`PENDING` -> `CONFIRMED` -> `PREPARING` -> `SERVED` -> `COMPLETED` / `CANCELLED`), tích hợp cổng thanh toán trực tuyến **VNPAY Sandbox**, gửi email xác nhận qua **JavaMailSender (Gmail SMTP)**, xuất hóa đơn **PDF** và thống kê doanh thu.
- **Rationale**:
  - Phân tách đúng 3 miền nghiệp vụ cốt lõi (Identity, Catalog/Table, Booking/Order), giúp dễ hiểu, vừa sức triển khai và bảo vệ đồ án trước tuần 14 mà không cần các thành phần hạ tầng cồng kềnh như Eureka/Config Server/Kafka.
  - Chia sẻ chung thư viện xác thực JWT nhẹ (hoặc khóa bí mật `JWT_SECRET` đồng nhất qua biến môi trường) để cả 3 service tự xác thực chữ ký JWT độc lập (Stateless JWT Verification) mà không làm nghẽn mạng nội bộ.
  - `booking-order-service` giao tiếp đồng bộ qua `RestClient` chuẩn của Spring Boot 3.4 tới `catalog-table-service` (`http://localhost:8082`) để kiểm tra giá món ăn, tình trạng bàn và cập nhật trạng thái bàn (`RESERVED` / `OCCUPIED` / `AVAILABLE`).
- **Alternatives considered**:
  - *Monolith duy nhất 1 cổng*: Không đáp ứng yêu cầu kiến trúc Microservices của đồ án.
  - *Hệ thống 6-7 Microservices kèm API Gateway, Eureka, RabbitMQ*: Quá nặng về cấu hình hạ tầng, tốn tài nguyên RAM khi chạy máy cá nhân và vượt quá hạn mức miễn phí khi deploy lên Render/Railway.

---

## 2. Phân chia 3 Nhóm Người dùng & Bảo mật JWT

- **Decision**: Áp dụng **Spring Security 6 + Stateless JWT** trên cả 3 Microservices với ma trận phân quyền cho 3 nhóm người dùng:
  1. **Anonymous (Khách vãng lai - không cần Token)**:
     - Xem danh sách thực đơn, chi tiết món ăn, danh sách bàn và trạng thái bàn trống trên `catalog-table-service` (`GET /api/v1/menu/**`, `GET /api/v1/tables/**`).
     - Quét mã QR tại bàn (`/table/{tableNumber}`) để xem thực đơn gắn với bàn đó.
  2. **Logged-in User (`ROLE_CUSTOMER`)**:
     - Thực hiện đặt bàn trước, chọn món vào giỏ hàng và gửi order gọi món (`POST /api/v1/orders`).
     - Xem lịch sử đặt bàn và hóa đơn cá nhân (`GET /api/v1/orders/my`).
     - Khởi tạo thanh toán trực tuyến qua VNPAY (`POST /api/v1/payments/vnpay/create-url`) và tải hóa đơn PDF.
  3. **Admin / Staff (`ROLE_ADMIN`, `ROLE_STAFF`)**:
     - Quản lý thực đơn (thêm, sửa, xóa món, cập nhật giá, tải ảnh Cloudinary) và quản lý sơ đồ bàn.
     - Xác nhận đơn đặt bàn (`CONFIRMED`), cập nhật trạng thái chế biến món (`PREPARING` -> `SERVED` -> `COMPLETED`).
     - Xem bảng điều khiển thống kê doanh thu theo ngày/tháng và món bán chạy.
- **Rationale**:
  - Rõ ràng, chặt chẽ, dễ kiểm thử phân quyền trên từng endpoint của từng Microservice.

---

## 3. Tích hợp 3 API Bên Thứ Ba (Điểm nhấn Đồ án)

- **Decision**:
  1. **API Cổng thanh toán VNPAY Sandbox**:
     - Triển khai chuẩn thuật toán tạo URL thanh toán VNPAY v2.1.0 ký bằng `HMAC-SHA512` (`vnp_Version`, `vnp_Command`, `vnp_TmnCode`, `vnp_Amount`, `vnp_TxnRef`, `vnp_OrderInfo`, `vnp_ReturnUrl`, `vnp_SecureHash`) và endpoint xử lý kết quả trả về (`/api/v1/payments/vnpay/return` & `/ipn`).
  2. **API Gửi Email (`Spring Boot Starter Mail - JavaMailSender` qua Gmail SMTP)**:
     - Sử dụng máy chủ SMTP chính thức của Google (`smtp.gmail.com`, cổng `587`, bật `STARTTLS`) kết hợp tài khoản Gmail cá nhân và Mật khẩu ứng dụng (Google App Password 16 ký tự).
     - Khi đơn đặt bàn được tạo hoặc xác nhận, hệ thống kết xuất nội dung email HTML tiếng Việt có dấu gửi tới `email` của khách hàng (kèm chế độ an toàn ghi nhận log và không làm gián đoạn luồng đặt bàn nếu chưa cấu hình mật khẩu ứng dụng khi chạy thử).
  3. **API Lưu trữ Hình ảnh (`Cloudinary REST API`)**:
     - Trong `catalog-table-service`, cung cấp endpoint `POST /api/v1/upload/image` nhận tệp ảnh (`MultipartFile`), ký xác thực SHA-1 tải trực tiếp lên Cloudinary (hoặc lưu trữ cục bộ an toàn khi chạy offline/test) và trả về `image_url` gắn vào `MenuItem`.
- **Rationale**:
  - Cả 3 tích hợp đều sử dụng giao thức chuẩn công nghiệp, cấu hình qua biến môi trường, hoạt động thực tế và không bị phụ thuộc cứng vào môi trường máy trạm.

---

## 4. Cơ sở Dữ liệu (Aiven MySQL Cloud & Local/Test)

- **Decision**:
  - Sử dụng **MySQL 8.x** (tương thích 100% với **Aiven MySQL Free Tier** trên Cloud và MySQL cục bộ). Có thể dùng chung 1 Aiven MySQL instance với các bảng có tiền tố rõ ràng hoặc 3 schema logic cho 3 service để tiết kiệm hạn mức kết nối Free Tier.
  - Sử dụng **H2 Database (chế độ MySQL compatibility)** cho toàn bộ bộ kiểm thử tự động (`mvnw test`) để đảm bảo tính cô lập và tốc độ thực thi nhanh.
- **Rationale**:
  - Aiven cung cấp 1 MySQL instance miễn phí; việc hỗ trợ cấu hình kết nối qua `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` giúp cả 3 service kết nối mượt mà lên Aiven MySQL mà không tốn chi phí.

---

## 5. Phương án Đóng gói & Triển khai Đám mây (Cloud Deployment)

- **Decision**:
  - **Frontend (`frontend/`)**: Tích hợp cấu hình `vercel.json` và biến môi trường `VITE_AUTH_API_URL`, `VITE_CATALOG_API_URL`, `VITE_ORDER_API_URL` để triển khai 1-click lên **Vercel** hoặc **Netlify**.
  - **Backend (`backend/`)**: Cung cấp cấu hình triển khai lên **Heroku** (hỗ trợ cả Heroku Java Maven Buildpack thông qua `Procfile` lẫn Heroku Container Registry qua `Dockerfile` độc lập cho từng service: `auth-user-service`, `catalog-table-service`, `booking-order-service`), đồng thời hỗ trợ `docker-compose.yml` để chạy thử cục bộ.
  - **Database**: Sử dụng Aiven MySQL Cloud (hoặc Heroku Data / JawsDB MySQL) kết nối qua biến môi trường `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`.
