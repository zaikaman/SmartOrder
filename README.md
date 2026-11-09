# HỆ THỐNG QUẢN LÝ ĐẶT BÀN VÀ GỌI MÓN TRỰC TUYẾN - NHÀ HÀNG BẾP VIỆT
### ĐỒ ÁN MÔN HỌC CHUYÊN ĐỀ J2EE (MICROSERVICES SPRING BOOT 3 & REACT 19)

---

## 1. TỔNG QUAN ĐỀ TÀI

Hệ thống quản lý đặt bàn và gọi món trực tuyến cho **Nhà Hàng Ẩm Thực Bếp Việt** được thiết kế và xây dựng theo mô hình kiến trúc **Microservices** hiện đại, phân tách rõ ràng giữa Backend (Java 17 / Spring Boot 3.4) và Frontend (React 19 / TypeScript / Vite / Tailwind CSS).

Hệ thống phục vụ đầy đủ 4 nhóm đối tượng người dùng:
1. **Khách vãng lai (Anonymous)**: Duyệt thực đơn 22 món ăn ẩm thực Việt Nam theo danh mục, tra cứu sơ đồ bàn trống theo khu vực (Tầng 1, Tầng 2, VIP), quét mã QR tại bàn để xem món, trò chuyện và nhờ Trợ lý AI tư vấn mâm cơm gia đình.
2. **Khách hàng đã đăng nhập (CUSTOMER)**: Đăng ký/đăng nhập thường hoặc đăng nhập 1-click bằng Google OAuth2, đặt bàn trước (chống trùng khung giờ), thêm món vào giỏ hàng và gửi đơn gọi món, thanh toán trực tuyến qua cổng VNPAY Sandbox, xem lịch sử đơn và tải hóa đơn PDF tiếng Việt.
3. **Nhân viên nhà hàng (STAFF)**: Quản lý sơ đồ bàn trực quan, tiếp nhận và check-in khách, màn hình Bếp KDS (Kitchen Order Board) điều phối tiến độ món (Đang nấu -> Đã phục vụ -> Hoàn tất).
4. **Quản trị viên (ADMIN)**: Toàn quyền CRUD thực đơn món ăn (tải ảnh Cloudinary), quản lý sơ đồ bàn và xuất ảnh PNG mã QR bàn, quản lý tài khoản người dùng, xem bảng điều khiển thống kê doanh thu và Top món bán chạy.

---

## 2. KIẾN TRÚC HỆ THỐNG & CỔNG DỊCH VỤ (PORTS MAPPING)

Hệ thống được tổ chức thành 3 Backend Microservices độc lập và 1 Frontend Client:

| Thành phần | Thư mục | Cổng mặc định | Chức năng chính |
|---|---|---|---|
| **Auth & User Service** | `backend/auth-user-service` | `8081` | Đăng ký, đăng nhập, Google OAuth2, cấp phát & xác thực JWT Token, quản lý phân quyền |
| **Catalog & Table Service** | `backend/catalog-table-service` | `8082` | CRUD thực đơn, tải ảnh lên Cloudinary, quản lý bàn ăn, sinh mã QR (Google ZXing), Trợ lý AI gợi ý món ăn |
| **Booking & Order Service** | `backend/booking-order-service` | `8083` | Đặt bàn, gọi món, cập nhật trạng thái Bếp, thanh toán VNPAY Sandbox (HMAC-SHA512), gửi email HTML qua Gmail SMTP, xuất hóa đơn PDF (OpenPDF), thống kê doanh thu |
| **Frontend Client** | `frontend` | `5173` | Giao diện người dùng React 19 + TypeScript + Vite + Tailwind CSS với hơn 14 màn hình |
| **Cơ sở dữ liệu Cloud** | TiDB Cloud (Serverless) | `4000` | CSDL MySQL 8.0 Cloud miễn phí (hoặc H2 in-memory chế độ MySQL khi chạy cục bộ) |

---

## 3. HƯỚNG DẪN CÀI ĐẶT & KHỞI CHẠY NHANH

### Yêu cầu môi trường:
- **Node.js**: v18+ (khuyến nghị dùng v20 hoặc v24)
- **Java JDK**: 17 LTS
- **Maven**: Đã tích hợp sẵn Maven Wrapper (`mvnw.cmd` / `./mvnw`), không cần cài thêm Maven bên ngoài.

### Khởi chạy toàn bộ hệ thống trong 1 cửa sổ Terminal:
Tại thư mục gốc của dự án:

```powershell
npm run start
```

Lệnh trên sẽ tự động:
1. Giải phóng các cổng `8081`, `8082`, `8083`, `5173` nếu có tiến trình chiếm dụng (`clean-ports.js`).
2. Nạp toàn bộ biến môi trường từ tệp `.env`.
3. Khởi động đồng thời cả 3 Spring Boot Microservices và máy chủ Frontend Vite.

Sau khi khởi động xong, mở trình duyệt truy cập: **`http://localhost:5173`**

*(Nhấn `Ctrl + C` để dừng toàn bộ các dịch vụ).*

---

## 4. TÀI KHOẢN MẪU CÓ SẴN (SEEDED ACCOUNTS)

Hệ thống đã khởi tạo sẵn 3 tài khoản tương ứng với 3 vai trò để chấm bài và trải nghiệm:

| Vai trò | Tên đăng nhập (`username`) | Mật khẩu (`password`) | Chức năng trải nghiệm |
|---|---|---|---|
| **Anonymous** | *(Không cần đăng nhập)* | - | Xem thực đơn, quét mã QR tại bàn, tra cứu bàn trống, AI gợi ý mâm cơm |
| **Customer** | `customer` | `Customer@123` | Đặt bàn trước, gọi món, thanh toán VNPAY, nhận email xác nhận, tải PDF hóa đơn |
| **Staff** | `staff` | `Staff@123` | Quản lý sơ đồ bàn nhân viên (`/staff/tables`), màn hình Bếp KDS (`/staff/orders`) |
| **Admin** | `admin` | `Admin@123` | Quản trị menu tải ảnh Cloudinary (`/admin/menu`), quản lý bàn & QR (`/admin/tables`), thống kê doanh thu (`/admin/stats`), quản trị người dùng (`/admin/users`) |

---

## 5. HƯỚNG DẪN KIỂM THỬ THANH TOÁN VNPAY SANDBOX

Khi thực hiện thanh toán đơn hàng qua cổng **VNPAY Sandbox**, hệ thống chuyển hướng sang cổng thanh toán thử nghiệm của VNPAY. Sử dụng thông tin thẻ thử nghiệm sau:

- **Ngân hàng**: NCB
- **Số thẻ**: `9704198526191432198`
- **Tên chủ thẻ**: `NGUYEN VAN A`
- **Ngày phát hành**: `07/15`
- **Mã xác thực OTP**: `123456`

Sau khi thanh toán thành công, VNPAY sẽ trả về trang kết quả trên hệ thống, đơn hàng tự động chuyển sang trạng thái đã thanh toán (`PAID`) và cho phép tải hóa đơn PDF ngay lập tức.

---

## 6. KIỂM TRA CHẤT LƯỢNG TOÀN DỰ ÁN (AUTOMATED VERIFICATION)

Chạy lệnh sau tại thư mục gốc để kiểm tra toàn bộ Unit Test, Integration Test của 3 Microservices và kiểm tra bản dựng Frontend:

```powershell
npm run verify
```

---

## 7. HƯỚNG DẪN TRIỂN KHAI LÊN CLOUD

### 7.1. Database Cloud: TiDB Cloud (Serverless)
- Đăng ký tài khoản miễn phí tại `https://tidbcloud.com`
- Tạo Cluster Serverless khu vực Singapore (ap-southeast-1).
- Lấy thông tin Host, Port 4000, User và Password điền vào tệp `.env`.

### 7.2. Frontend: Triển khai lên Vercel
1. Đẩy mã nguồn lên GitHub.
2. Đăng nhập Vercel, tạo New Project và chọn thư mục `frontend`.
3. Cấu hình Framework Preset: **Vite**.
4. Thêm các biến môi trường:
   - `VITE_AUTH_API_URL`: URL của Service 1 trên Cloud.
   - `VITE_CATALOG_API_URL`: URL của Service 2 trên Cloud.
   - `VITE_ORDER_API_URL`: URL của Service 3 trên Cloud.
   - `VITE_GOOGLE_CLIENT_ID`: Client ID Google OAuth2.
5. Bấm **Deploy**.

### 7.3. Backend Microservices: Triển khai qua Docker / Railway / Render / Heroku
Mỗi service đều đã có sẵn tệp `Dockerfile` multi-stage tối ưu:
- `backend/auth-user-service/Dockerfile`
- `backend/catalog-table-service/Dockerfile`
- `backend/booking-order-service/Dockerfile`
- `backend/Procfile`

Từng service có thể triển khai độc lập lên Railway hoặc Render bằng cách liên kết kho lưu trữ (repository) và chọn Dockerfile tương ứng, sau đó gán các biến môi trường từ tệp `.env`.
