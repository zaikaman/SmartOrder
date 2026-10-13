# Hợp Đồng Giao Diện REST API Theo 3 Microservices (Phase 1 Interface Contracts)

**Tính năng**: Hệ Thống Quản Lý Đặt Bàn và Gọi Món Trực Tuyến Cho Nhà Hàng (`001-qr-table-ordering`)  
**Định dạng dữ liệu**: `application/json` (riêng tải ảnh dùng `multipart/form-data`, ảnh QR dùng `image/png`, xuất hóa đơn dùng `application/pdf`)

---

## 1. Service 1: Auth & User Service (`http://localhost:8081/api/v1`)

Quản lý đăng ký, đăng nhập, cấp phát JWT Token và phân quyền người dùng (`CUSTOMER`, `STAFF`, `ADMIN`).

| Phương thức | Đường dẫn | Nhóm người dùng | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | `Anonymous` | Đăng ký tài khoản Khách hàng (`CUSTOMER`) mới |
| `POST` | `/api/v1/auth/login` | `Anonymous` | Đăng nhập và nhận JWT `accessToken` chứa `userId`, `username`, `email`, `role` |
| `GET` | `/api/v1/users/me` | `Logged-in User`, `Staff`, `Admin` | Lấy thông tin tài khoản hiện tại từ JWT Token |
| `GET` | `/api/v1/admin/users` | `Admin` | Danh sách toàn bộ người dùng trong hệ thống |
| `PATCH` | `/api/v1/admin/users/{id}/role` | `Admin` | Cập nhật vai trò người dùng (`CUSTOMER`, `STAFF`, `ADMIN`) |
| `PATCH` | `/api/v1/admin/users/{id}/status` | `Admin` | Khóa / Mở khóa tài khoản người dùng |

**Mẫu phản hồi đăng nhập (`POST /api/v1/auth/login` - `200 OK`)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "tokenType": "Bearer",
  "expiresIn": 86400,
  "user": {
    "id": 2,
    "username": "khachhang01",
    "fullName": "Nguyễn Văn An",
    "email": "nguyenvanan@example.com",
    "phone": "0901234567",
    "role": "CUSTOMER"
  }
}
```

---

## 2. Service 2: Catalog & Table Service (`http://localhost:8082/api/v1`)

Quản lý danh mục món ăn (`MenuItem`), bàn ăn (`DiningTable`), trạng thái bàn, sinh mã QR và tải ảnh món ăn lên **Cloudinary**. Cho phép `Anonymous` đọc dữ liệu công khai.

### 2.1. API Công khai cho Khách vãng lai (`Anonymous`) & Khách quét QR

| Phương thức | Đường dẫn | Nhóm người dùng | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/menu` | `Anonymous` | Xem danh sách thực đơn (hỗ trợ lọc theo `category`, `keyword`, `status`) |
| `GET` | `/api/v1/menu/{id}` | `Anonymous` | Xem chi tiết một món ăn |
| `GET` | `/api/v1/tables` | `Anonymous` | Xem sơ đồ bàn ăn và tra cứu bàn trống (lọc theo `status`, `minCapacity`, `area`) |
| `GET` | `/api/v1/tables/number/{tableNumber}` | `Anonymous` | Quét mã QR tại bàn: lấy thông tin chi tiết bàn theo `table_number` cùng thực đơn đang phục vụ |
| `GET` | `/api/v1/tables/{id}/qr-image` | `Anonymous`, `Staff`, `Admin` | Kết xuất hình ảnh PNG mã QR của bàn dẫn tới URL `/table/{tableNumber}` |

### 2.2. API Quản trị Thực đơn, Tải ảnh Cloudinary & Quản lý Sơ đồ Bàn (`Admin / Staff`)

| Phương thức | Đường dẫn | Nhóm người dùng | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/admin/menu/upload-image` | `Admin`, `Staff` | Tải tệp hình ảnh món ăn lên **Cloudinary API**, trả về `imageUrl` |
| `POST` | `/api/v1/admin/menu` | `Admin` | Thêm món ăn mới vào thực đơn |
| `PUT` | `/api/v1/admin/menu/{id}` | `Admin` | Cập nhật thông tin, giá bán, ảnh và trạng thái món ăn |
| `DELETE` | `/api/v1/admin/menu/{id}` | `Admin` | Xóa / Ẩn món ăn khỏi thực đơn |
| `POST` | `/api/v1/admin/tables` | `Admin` | Thêm bàn ăn mới và tự động tạo `qr_code_url` |
| `PUT` | `/api/v1/admin/tables/{id}` | `Admin` | Cập nhật thông tin bàn ăn (`table_number`, `capacity`, `area`) |
| `PATCH` | `/api/v1/staff/tables/{id}/status` | `Staff`, `Admin` (hoặc Internal Service) | Cập nhật trạng thái bàn (`AVAILABLE`, `RESERVED`, `OCCUPIED`) |

---

## 3. Service 3: Booking & Order Service (`http://localhost:8083/api/v1`)

Xử lý đặt bàn trước, tạo order gọi món, gửi **Email xác nhận**, tích hợp thanh toán **VNPAY Sandbox**, xuất **hóa đơn PDF** và thống kê doanh thu.

### 3.1. API Đặt bàn, Gọi món & Lịch sử cho Khách đã đăng nhập (`Logged-in User`)

| Phương thức | Đường dẫn | Nhóm người dùng | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/orders` | `Logged-in User` (`CUSTOMER`, `STAFF`, `ADMIN`) | Tạo đơn đặt bàn trước và/hoặc gửi order gọi món tại bàn; tự động gửi Email xác nhận mã đặt bàn |
| `POST` | `/api/v1/orders/{id}/items` | `Logged-in User` (`CUSTOMER`, `STAFF`, `ADMIN`) | Gọi thêm món bổ sung vào đơn đặt bàn / bàn đang ngồi |
| `GET` | `/api/v1/orders/my` | `Logged-in User` | Xem lịch sử đặt bàn và hóa đơn cá nhân của khách hàng đang đăng nhập |
| `GET` | `/api/v1/orders/{id}` | `Logged-in User`, `Staff`, `Admin` | Xem chi tiết đơn đặt bàn / hóa đơn kèm danh sách `OrderItem` |
| `GET` | `/api/v1/orders/{id}/invoice.pdf` | `Logged-in User`, `Staff`, `Admin` | Xuất và tải tệp hóa đơn PDF tiếng Việt có dấu |

**Mẫu yêu cầu Đặt bàn & Gọi món (`POST /api/v1/orders`)**:
```json
{
  "tableId": 3,
  "reservationTime": "2026-10-14T18:30:00Z",
  "partySize": 4,
  "note": "Bàn gần cửa sổ, có trẻ em",
  "items": [
    {
      "menuItemId": 1,
      "quantity": 2,
      "note": "Ít đá"
    },
    {
      "menuItemId": 4,
      "quantity": 1,
      "note": ""
    }
  ]
}
```

### 3.2. API Tích hợp Cổng thanh toán VNPAY Sandbox

| Phương thức | Đường dẫn | Nhóm người dùng | Mô tả |
|---|---|---|---|
| `POST` | `/api/v1/payments/vnpay/create-url` | `Logged-in User`, `Staff`, `Admin` | Tạo URL thanh toán VNPAY Sandbox có chữ ký `HMAC-SHA512` cho đơn đặt bàn / hóa đơn |
| `GET` | `/api/v1/payments/vnpay/return` | `Anonymous` / Callback | Xác thực chữ ký `vnp_SecureHash` khi VNPAY chuyển hướng về, cập nhật `payment_status = PAID`, `status = COMPLETED` và giải phóng bàn |
| `POST` | `/api/v1/staff/orders/{id}/pay-cash` | `Staff`, `Admin` | Nhân viên xác nhận thu tiền mặt tại quầy, chuyển đơn sang `COMPLETED` và giải phóng bàn |

### 3.3. API Điều phối Đơn món & Thống kê Doanh thu (`Admin / Staff`)

| Phương thức | Đường dẫn | Nhóm người dùng | Mô tả |
|---|---|---|---|
| `GET` | `/api/v1/staff/orders` | `Staff`, `Admin` | Xem toàn bộ danh sách đơn đặt bàn và đơn gọi món (lọc theo `status`, ngày) |
| `PATCH` | `/api/v1/staff/orders/{id}/status` | `Staff`, `Admin` | Cập nhật trạng thái đơn: `PENDING` -> `CONFIRMED` -> `PREPARING` (Đang nấu) -> `SERVED` (Đã phục vụ) -> `COMPLETED` / `CANCELLED` |
| `GET` | `/api/v1/admin/statistics/revenue` | `Admin` | Thống kê tổng doanh thu, số lượng đơn hoàn thành, doanh thu theo ngày/tháng và Top món ăn bán chạy |
