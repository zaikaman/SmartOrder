# Implementation Plan: Hệ Thống Quản Lý Đặt Bàn và Gọi Món Trực Tuyến - Nhà Hàng Ẩm Thực Bếp Việt

**Branch**: `main` | **Date**: 2026-10-13 | **Spec**: [spec.md](file:///d:/DoAnJ2EE/specs/001-qr-table-ordering/spec.md)
**Input**: Feature specification from `/specs/001-qr-table-ordering/spec.md`
**Concept**: Nhà Hàng Ẩm Thực Bếp Việt (Phong cách Ẩm thực Việt Nam truyền thống & đương đại: Cơm niêu cá kho tộ, lẩu riêu cua bắp bò sườn sụn, nem rán Hà Nội, chả cá Lã Vọng, trà sen, đồ uống giải khát).

## Summary

Xây dựng **Hệ thống quản lý đặt bàn và gọi món trực tuyến cho Nhà Hàng Ẩm Thực Bếp Việt** phục vụ đồ án môn J2EE theo kiến trúc **Microservices (Spring Boot 3.4 + React 19)** vừa sức, chặt chẽ và sẵn sàng triển khai đám mây:
1. **Phân chia 3 nhóm người dùng rõ ràng**:
   - **Anonymous (Khách vãng lai)**: Xem thông tin nhà hàng Bếp Việt, xem thực đơn (`MenuItem`), tra cứu bàn trống theo khu vực (`DiningTable`), quét mã QR xem món tại bàn, sử dụng Trợ lý AI tư vấn mâm cơm Bếp Việt, đăng nhập bằng tài khoản hoặc Google OAuth2.
   - **Logged-in User (`CUSTOMER`)**: Đặt bàn trước, chọn món vào giỏ và gửi order gọi món, xem lịch sử đặt bàn/hóa đơn cá nhân, thanh toán trực tuyến qua API VNPAY và tải hóa đơn PDF.
   - **Admin / Staff (`ADMIN`, `STAFF`)**: Quản lý thực đơn món Việt (thêm/sửa/xóa món, giá, tải ảnh Cloudinary), quản lý sơ đồ bàn (`AVAILABLE`, `RESERVED`, `OCCUPIED`), xác nhận đơn đặt bàn, cập nhật trạng thái đơn món (`PREPARING` -> `SERVED` -> `COMPLETED`), xem thống kê doanh thu.
2. **Thiết kế 5 Entity cốt lõi**: `User`, `DiningTable`, `MenuItem`, `ReservationOrder` (Đặt bàn & Hóa đơn), và `OrderItem` (Chi tiết món đặt).
3. **Kiến trúc 3 Microservices độc lập**:
   - **Service 1 - `auth-user-service` (Port `8081`)**: Đăng ký, đăng nhập tài khoản thường và Google OAuth2, cấp phát JWT Token, phân quyền người dùng.
   - **Service 2 - `catalog-table-service` (Port `8082`)**: Quản lý danh mục món ăn Bếp Việt, bàn ăn, trạng thái bàn, sinh mã QR, tải ảnh món ăn lên Cloudinary, tích hợp Trợ lý AI gợi ý món ăn. Cho phép Anonymous đọc dữ liệu công khai.
   - **Service 3 - `booking-order-service` (Port `8083`)**: Xử lý đặt bàn, tạo order gọi món, cập nhật trạng thái chế biến, tích hợp cổng thanh toán **VNPAY Sandbox**, tự động gửi Email xác nhận qua **JavaMailSender (Gmail SMTP)**, xuất hóa đơn **PDF** và thống kê doanh thu.
4. **Hệ thống 12 màn hình giao diện hoàn chỉnh**:
   - Khách vãng lai: (1) Trang chủ, (2) Xem thực đơn, (3) Tra cứu sơ đồ bàn, (4) Đặt món qua mã QR tại bàn, (5) Trợ lý AI tư vấn mâm cơm, (6) Đăng nhập & Đăng ký (hỗ trợ Google OAuth2).
   - Khách hàng (`CUSTOMER`): (7) Đặt bàn trước & giỏ món, (8) Lịch sử đặt bàn & hóa đơn cá nhân, (9) Kết quả thanh toán VNPAY & xuất PDF.
   - Nhân viên (`STAFF`): (10) Sơ đồ bàn & check-in khách, (11) Màn hình điều phối chế biến Bếp.
   - Quản trị viên (`ADMIN`): (12) Bảng điều khiển quản trị menu, người dùng và biểu đồ doanh thu.

## Technical Context

**Language/Version**: Java 17 LTS (Backend Microservices), TypeScript 5.x / Node.js 24.x (Frontend React)  
**Primary Dependencies**:
- **Backend (Maven Multi-module)**: Spring Boot 3.4.x (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-security`, `spring-boot-starter-validation`, `spring-boot-starter-mail`), JJWT (`io.jsonwebtoken`), Google Auth Library / Google ID Token verifier, Google ZXing (`com.google.zxing` sinh mã QR bàn), OpenPDF (`com.github.librepdf:openpdf` xuất hóa đơn PDF tiếng Việt), Cloudinary HTTP/REST integration, VNPAY HMAC-SHA512 integration.
- **Frontend**: React 19, Vite 6, TypeScript, Tailwind CSS, React Router v7, Axios, TanStack Query v5, Zustand, Lucide React, Google OAuth2 React integration.  
**Storage**: MySQL 8.x (tương thích Aiven MySQL Free Tier trên Cloud & MySQL cục bộ) và H2 Database ở chế độ tương thích MySQL (cho phát triển nhanh & kiểm thử tự động cô lập).  
**Testing**: JUnit 5, Mockito, Spring Boot Test (`MockMvc`, `@SpringBootTest`) cho cả 3 Microservices; Vitest và React Testing Library cho Frontend.  
**Target Platform**: Web Application đa thiết bị; sẵn sàng deploy Frontend lên **Vercel / Netlify**, Backend đóng gói JAR/Docker lên **Heroku**, và Database trên **Aiven MySQL / Heroku Data**.  
**Project Type**: Microservices Web Application (`backend/auth-user-service`, `backend/catalog-table-service`, `backend/booking-order-service`, và `frontend/`).  
**Performance Goals**: Thời gian phản hồi API đọc thực đơn/bàn trống < 200ms (đạt SC-001 < 2 giây); xuất hóa đơn PDF < 2 giây (đạt SC-003 < 5 giây).  
**Constraints**: Tuân thủ nghiêm ngặt 5 nguyên tắc trong Hiến pháp dự án v1.0.0; không viết mã giả/mock; không sử dụng emoji ở bất kỳ đâu; giao diện và chú thích bằng tiếng Việt có dấu đầy đủ, mã nguồn bằng tiếng Anh.  
**Scale/Scope**: 3 Microservices độc lập, 5 thực thể dữ liệu cốt lõi, 3 tích hợp API bên thứ ba (VNPAY, Gmail SMTP, Cloudinary), và 1 ứng dụng React SPA hoàn chỉnh.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Đánh giá Trước & Sau Thiết kế
- **I. Clean Architecture & Separation of Concerns**: **ĐẠT** — Mỗi Microservice (`auth-user-service`, `catalog-table-service`, `booking-order-service`) đều tách biệt rõ các tầng `controller`, `service`, `repository`, `entity`, và `dto`. Không lộ thực thể JPA trực tiếp ra ngoài REST API.
- **II. Code Quality & Readability Standards**: **ĐẠT** — Áp dụng cấu hình kiểm tra kiểu tĩnh TypeScript, ESLint và biên dịch Maven nghiêm ngặt trên cả 3 Microservices; ngoại hóa toàn bộ khóa cấu hình (JWT, Database, VNPAY, Mail, Cloudinary) qua biến môi trường.
- **III. Test-First & Automated Verification (NON-NEGOTIABLE)**: **ĐẠT** — Mỗi Microservice đều có bộ Unit Test riêng kiểm증 logic nghiệp vụ cốt lõi (xác thực JWT, quản lý trạng thái bàn & món ăn, tính tổng tiền đơn hàng, tạo chữ ký VNPAY, gửi email xác nhận).
- **IV. Integration & Contract Testing**: **ĐẠT** — Kiểm thử tích hợp các REST Controller và phân quyền 3 nhóm người dùng (`Anonymous`, `CUSTOMER`, `STAFF`/`ADMIN`) bằng `MockMvc` trên từng service.
- **V. Maintainability & Simplicity**: **ĐẠT** — Chia đúng 3 Microservices độc lập theo cổng (`8081`, `8082`, `8083`) dùng xác thực JWT phi trạng thái chung, tránh sự phức tạp không cần thiết của Service Mesh hay Message Broker nặng nề.

## Project Structure

### Documentation (this feature)

```text
specs/001-qr-table-ordering/
├── plan.md              # Kế hoạch triển khai kỹ thuật (tệp này)
├── research.md          # Nghiên cứu & quyết định kiến trúc 3 Microservices (Phase 0)
├── data-model.md        # Mô hình 5 thực thể cốt lõi (Phase 1)
├── quickstart.md        # Hướng dẫn khởi chạy 3 services, cấu hình API & deploy (Phase 1)
├── contracts/
│   └── rest-api.md      # Hợp đồng REST API cho các cổng 8081, 8082, 8083 (Phase 1)
└── tasks.md             # Danh sách tác vụ triển khai (sẽ tạo bởi /speckit-tasks)
```

### Source Code (repository root)

```text
package.json                     # Kịch bản điều phối gốc (bao gồm npm run verify)
docker-compose.yml               # Cấu hình chạy trọn bộ 3 Microservices + MySQL/Frontend

backend/
├── pom.xml                      # Maven Parent POM quản lý 3 Microservices
├── mvnw
├── mvnw.cmd
├── auth-user-service/           # Service 1 (Port 8081): Đăng ký, Đăng nhập, JWT, Phân quyền User
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/restaurant/auth/
│       │   ├── AuthUserServiceApplication.java
│       │   ├── config/          # SecurityConfig, CorsConfig, DataInitializer
│       │   ├── security/        # JwtService, JwtAuthenticationFilter
│       │   ├── entity/          # User, UserRole
│       │   ├── repository/      # UserRepository
│       │   ├── dto/             # LoginRequest, RegisterRequest, AuthResponse, UserDto
│       │   ├── service/         # AuthService, UserService
│       │   ├── controller/      # AuthController, UserController
│       │   └── exception/       # GlobalExceptionHandler
│       ├── main/resources/application.yml
│       └── test/java/com/restaurant/auth/
│
├── catalog-table-service/       # Service 2 (Port 8082): MenuItem, DiningTable, QR Code, Cloudinary
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/
│       ├── main/java/com/restaurant/catalog/
│       │   ├── CatalogTableServiceApplication.java
│       │   ├── config/          # SecurityConfig (Anonymous GET + Admin/Staff Write), CorsConfig, DataInitializer
│       │   ├── security/        # JwtAuthenticationFilter
│       │   ├── entity/          # MenuItem, MenuItemStatus, DiningTable, TableStatus
│       │   ├── repository/      # MenuItemRepository, DiningTableRepository
│       │   ├── dto/             # MenuItemRequest, MenuItemDto, DiningTableRequest, DiningTableDto
│       │   ├── service/         # MenuService, DiningTableService, QrCodeGeneratorService, CloudinaryService
│       │   ├── controller/      # MenuController, DiningTableController
│       │   └── exception/       # GlobalExceptionHandler
│       ├── main/resources/application.yml
│       └── test/java/com/restaurant/catalog/
│
└── booking-order-service/       # Service 3 (Port 8083): Đặt bàn, Order, VNPAY, Email, PDF, Doanh thu
    ├── Dockerfile
    ├── pom.xml
    └── src/
        ├── main/java/com/restaurant/booking/
        │   ├── BookingOrderServiceApplication.java
        │   ├── config/          # SecurityConfig, RestClientConfig, CorsConfig
        │   ├── security/        # JwtAuthenticationFilter
        │   ├── entity/          # ReservationOrder, OrderItem, OrderStatus, PaymentMethod, PaymentStatus
        │   ├── repository/      # ReservationOrderRepository, OrderItemRepository
        │   ├── dto/             # CreateOrderRequest, OrderDto, OrderItemDto, RevenueStatsDto, VnPayUrlResponse
        │   ├── client/          # CatalogTableClient (gọi sang Port 8082 lấy thông tin món/bàn & cập nhật bàn)
        │   ├── service/         # BookingOrderService, VnPayService, EmailNotificationService, PdfInvoiceService, StatisticsService
        │   ├── controller/      # BookingOrderController, PaymentController, StaffOrderController, AdminStatisticsController
        │   └── exception/       # GlobalExceptionHandler
        ├── main/resources/application.yml
        └── test/java/com/restaurant/booking/

frontend/                        # Giao diện React (Port 5173) kết nối tới 8081, 8082, 8083
├── package.json
├── vercel.json                  # Cấu hình deploy nhanh lên Vercel
├── tsconfig.json
├── vite.config.ts
├── index.html
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── api/                     # Axios clients kết nối tới authApi (8081), catalogApi (8082), bookingApi (8083)
    ├── types/                   # Kiểu dữ liệu TypeScript cho User, DiningTable, MenuItem, ReservationOrder, OrderItem
    ├── store/                   # Zustand (useAuthStore, useCartStore)
    ├── components/
    │   ├── layout/              # MainHeader, RoleGuard, StaffSidebar
    │   └── common/              # StatusBadge, QrCodeModal, InvoicePreviewModal
    ├── pages/
    │   ├── public/              # HomePage, PublicMenuPage, TableLookupPage, QrTableOrderPage, LoginPage, RegisterPage
    │   ├── customer/            # BookingAndOrderPage, MyOrdersHistoryPage, VnPayReturnPage
    │   ├── staff/               # StaffTableManagementPage, StaffOrderKitchenPage
    │   └── admin/               # AdminMenuManagementPage, AdminRevenueStatsPage, AdminUsersPage
    └── test/                    # Kiểm thử giao diện với Vitest
```

**Structure Decision**: Tổ chức Backend thành một Maven Multi-module project tại `backend/` gồm đúng 3 module độc lập (`auth-user-service` chạy cổng `8081`, `catalog-table-service` chạy cổng `8082`, `booking-order-service` chạy cổng `8083`) và `frontend/` dùng React + Vite + TypeScript để vừa đảm bảo kiến trúc Microservices rõ ràng, vừa cho phép chạy kiểm thử toàn bộ dự án bằng một lệnh duy nhất `npm run verify`.

## Complexity Tracking

> **Không có vi phạm Hiến pháp dự án.**

| Hạng mục | Lý do thiết kế | Phương án đơn giản hơn bị loại bỏ vì |
|----------|----------------|--------------------------------------|
| 3 Microservices độc lập (`8081`, `8082`, `8083`) | Đáp ứng yêu cầu kiến trúc Microservices của đồ án nhưng vẫn gọn nhẹ, dễ chạy và deploy miễn phí | Tách quá nhiều service (6-8 services) sẽ gây quá tải bộ nhớ và vượt giới hạn Free Tier khi deploy |
| Hợp nhất Đặt bàn & Hóa đơn gọi món trong `ReservationOrder` + `OrderItem` | Giữ đúng 5 thực thể cốt lõi (`User`, `DiningTable`, `MenuItem`, `ReservationOrder`, `OrderItem`), tránh dư thừa bảng trung gian | Tách thành 11 bảng rời rạc làm phức tạp hóa việc đồng bộ dữ liệu giữa các Microservices |
