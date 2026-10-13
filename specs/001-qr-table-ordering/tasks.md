---
description: "Danh sách tác vụ chi tiết triển khai toàn diện hệ thống đặt bàn và gọi món trực tuyến"
---

# Tasks: Hệ Thống Quản Lý Đặt Bàn và Gọi Món Trực Tuyến Cho Nhà Hàng

**Input**: Tài liệu thiết kế từ `/specs/001-qr-table-ordering/` (`spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/rest-api.md`, `quickstart.md`)  
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/rest-api.md, research.md, quickstart.md  
**Tests**: Kiểm thử tự động (Unit Test và Integration Test) là BẮT BUỘC theo Nguyên tắc III & IV trong Hiến pháp dự án. Viết kiểm thử trước hoặc song song và kiểm tra chạy thành công.  
**Tổ chức**: Các tác vụ được nhóm theo 5 User Stories độc lập để đảm bảo thực hiện đến đâu là xong hoàn chỉnh đến đó, không bị dở dang.

## Quy Ước Định Dạng: `- [ ] [ID] [P?] [Story?] Mô tả chi tiết kèm đường dẫn tệp`
- **[P]**: Có thể thực hiện song song (tệp tin khác nhau, không phụ thuộc tác vụ đang dở).
- **[Story]**: Gắn nhãn User Story tương ứng (`[US1]`, `[US2]`, `[US3]`, `[US4]`, `[US5]`).

---

## Phase 1: Setup (Khởi Tạo Cấu Trúc Dự Án & Hạ Tầng Dùng Chung)

**Mục tiêu**: Thiết lập toàn bộ cấu trúc thư mục gốc, Maven Multi-module cho 3 Backend Microservices, dự án Frontend React, các kiến trúc bảo mật, kết nối cơ sở dữ liệu và công cụ kiểm tra chất lượng tập trung `npm run verify`.

- [ ] T001 Khởi tạo tệp package.json gốc tại d:/DoAnJ2EE/package.json định nghĩa các lệnh điều phối build, test và verify (npm run verify chạy cả Backend lẫn Frontend)
- [ ] T002 Khởi tạo cấu hình Maven Parent POM tại backend/pom.xml quản lý Java 17, Spring Boot 3.4.x, dependencies chung (Lombok, Validation, JJWT, ZXing, OpenPDF) và 3 sub-modules (auth-user-service, catalog-table-service, booking-order-service)
- [ ] T003 [P] Cài đặt Maven Wrapper tại backend/mvnw và backend/mvnw.cmd để build độc lập không phụ thuộc biến môi trường hệ thống
- [ ] T004 [P] Khởi tạo dự án Frontend React 19 + TypeScript + Vite tại frontend/package.json, frontend/tsconfig.json và frontend/vite.config.ts hỗ trợ Proxy tới 3 cổng 8081, 8082, 8083
- [ ] T005 [P] Cấu hình Tailwind CSS, PostCSS và Lucide Icons tại frontend/tailwind.config.js, frontend/postcss.config.js và frontend/src/index.css
- [ ] T006 [P] Khởi tạo tệp cấu hình chạy đa container docker-compose.yml tại thư mục gốc d:/DoAnJ2EE/docker-compose.yml hỗ trợ 3 microservices và MySQL
- [ ] T007 [P] Khởi tạo tệp cấu hình deploy Vercel tại frontend/vercel.json

---

## Phase 2: Foundational (Hạ Tầng Cốt Lõi & 3 Microservices)

**Mục tiêu**: Xây dựng phần khung kết nối cơ sở dữ liệu, cơ chế xác thực JWT dùng chung, REST client liên service, cấu hình CORS, và bộ lọc xử lý lỗi toàn cục cho cả 3 Microservices trước khi đi vào nghiệp vụ cụ thể.

### 2.1. Service 1 - Auth & User Service (Cổng 8081)
- [ ] T008 Tạo tệp pom.xml và Application runner cho Auth Service tại backend/auth-user-service/pom.xml và backend/auth-user-service/src/main/java/com/restaurant/auth/AuthUserServiceApplication.java
- [ ] T009 Cấu hình application.yml hỗ trợ cả MySQL và H2 in-memory tại backend/auth-user-service/src/main/resources/application.yml
- [ ] T010 [P] Định nghĩa thực thể User và UserRole enum tại backend/auth-user-service/src/main/java/com/restaurant/auth/entity/User.java và backend/auth-user-service/src/main/java/com/restaurant/auth/entity/UserRole.java
- [ ] T011 [P] Tạo UserRepository tại backend/auth-user-service/src/main/java/com/restaurant/auth/repository/UserRepository.java
- [ ] T012 Tạo JwtService phát hành và xác thực JWT Token tại backend/auth-user-service/src/main/java/com/restaurant/auth/security/JwtService.java
- [ ] T013 Cấu hình Spring Security 6, PasswordEncoder và CorsConfig tại backend/auth-user-service/src/main/java/com/restaurant/auth/config/SecurityConfig.java
- [ ] T014 Xây dựng GlobalExceptionHandler cho Auth Service tại backend/auth-user-service/src/main/java/com/restaurant/auth/exception/GlobalExceptionHandler.java
- [ ] T015 Tạo DataInitializer nạp sẵn 3 tài khoản mặc định (admin, staff, customer) tại backend/auth-user-service/src/main/java/com/restaurant/auth/config/DataInitializer.java

### 2.2. Service 2 - Catalog & Table Service (Cổng 8082)
- [ ] T016 Tạo tệp pom.xml và Application runner cho Catalog Service tại backend/catalog-table-service/pom.xml và backend/catalog-table-service/src/main/java/com/restaurant/catalog/CatalogTableServiceApplication.java
- [ ] T017 Cấu hình application.yml cho Catalog Service tại backend/catalog-table-service/src/main/resources/application.yml
- [ ] T018 [P] Định nghĩa thực thể DiningTable và TableStatus enum tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/entity/DiningTable.java và TableStatus.java
- [ ] T019 [P] Định nghĩa thực thể MenuItem và MenuItemStatus enum tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/entity/MenuItem.java và MenuItemStatus.java
- [ ] T020 [P] Tạo DiningTableRepository và MenuItemRepository tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/repository/DiningTableRepository.java và MenuItemRepository.java
- [ ] T021 Tạo bộ lọc JwtAuthenticationFilter xác thực Token stateless tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/security/JwtAuthenticationFilter.java
- [ ] T022 Cấu hình SecurityConfig cho phép Anonymous đọc GET công khai tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/config/SecurityConfig.java
- [ ] T023 Xây dựng GlobalExceptionHandler cho Catalog Service tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/exception/GlobalExceptionHandler.java
- [ ] T024 Tạo DataInitializer nạp sẵn 10 bàn ăn và menu mẫu phong phú tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/config/DataInitializer.java

### 2.3. Service 3 - Booking & Order Service (Cổng 8083)
- [ ] T025 Tạo tệp pom.xml và Application runner cho Booking Service tại backend/booking-order-service/pom.xml và backend/booking-order-service/src/main/java/com/restaurant/booking/BookingOrderServiceApplication.java
- [ ] T026 Cấu hình application.yml gồm VNPAY, Gmail SMTP và database tại backend/booking-order-service/src/main/resources/application.yml
- [ ] T027 [P] Định nghĩa thực thể ReservationOrder kèm OrderStatus, PaymentMethod, PaymentStatus enums tại backend/booking-order-service/src/main/java/com/restaurant/booking/entity/ReservationOrder.java
- [ ] T028 [P] Định nghĩa thực thể OrderItem tại backend/booking-order-service/src/main/java/com/restaurant/booking/entity/OrderItem.java
- [ ] T029 [P] Tạo ReservationOrderRepository và OrderItemRepository tại backend/booking-order-service/src/main/java/com/restaurant/booking/repository/ReservationOrderRepository.java và OrderItemRepository.java
- [ ] T030 Tạo bộ lọc JwtAuthenticationFilter tại backend/booking-order-service/src/main/java/com/restaurant/booking/security/JwtAuthenticationFilter.java
- [ ] T031 Cấu hình SecurityConfig và RestClientConfig để gọi Catalog Service tại backend/booking-order-service/src/main/java/com/restaurant/booking/config/SecurityConfig.java và RestClientConfig.java
- [ ] T032 Xây dựng GlobalExceptionHandler cho Booking Service tại backend/booking-order-service/src/main/java/com/restaurant/booking/exception/GlobalExceptionHandler.java

### 2.4. Frontend Client Core (Cổng 5173)
- [ ] T033 Định nghĩa các kiểu dữ liệu TypeScript (User, DiningTable, MenuItem, ReservationOrder, OrderItem) tại frontend/src/types/index.ts
- [ ] T034 [P] Xây dựng Axios Client kết nối 3 Microservices (authApi, catalogApi, bookingApi) tại frontend/src/api/client.ts
- [ ] T035 [P] Xây dựng Zustand Store quản lý phiên đăng nhập (useAuthStore) tại frontend/src/store/useAuthStore.ts
- [ ] T036 [P] Xây dựng Zustand Store quản lý giỏ hàng món ăn theo bàn (useCartStore) tại frontend/src/store/useCartStore.ts
- [ ] T037 Xây dựng Router và bộ bọc bảo vệ quyền truy cập (RoleGuard) tại frontend/src/components/layout/RoleGuard.tsx và frontend/src/App.tsx

---

## Phase 3: User Story 1 - Khách Vãng Lai Tra Cứu Thực Đơn, Bàn Trống & Quét Mã QR (Priority: P1) [MVP]

**Mục tiêu**: Khách vãng lai (Anonymous) không cần đăng nhập có thể xem thông tin nhà hàng, duyệt thực đơn theo danh mục, tra cứu bàn trống, và quét mã QR tại bàn để mở thực đơn gắn với số bàn.

### Kiểm thử cho User Story 1
- [ ] T038 [P] [US1] Viết Unit test kiểm tra MenuItemService và DiningTableService trả về dữ liệu công khai tại backend/catalog-table-service/src/test/java/com/restaurant/catalog/service/CatalogPublicServiceTest.java
- [ ] T039 [P] [US1] Viết Integration test cho các endpoint GET công khai (menu, tables, qr-image) tại backend/catalog-table-service/src/test/java/com/restaurant/catalog/controller/CatalogPublicControllerTest.java

### Triển khai Backend cho User Story 1
- [ ] T040 [P] [US1] Xây dựng QrCodeGeneratorService sử dụng Google ZXing sinh ảnh PNG mã QR tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/service/QrCodeGeneratorService.java
- [ ] T041 [US1] Xây dựng MenuService xử lý truy vấn menu công khai tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/service/MenuService.java
- [ ] T042 [US1] Xây dựng DiningTableService xử lý tra cứu bàn trống và thông tin bàn tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/service/DiningTableService.java
- [ ] T043 [US1] Xây dựng PublicMenuController phục vụ /api/v1/menu/** tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/controller/PublicMenuController.java
- [ ] T044 [US1] Xây dựng PublicTableController phục vụ /api/v1/tables/** và /api/v1/tables/{id}/qr-image tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/controller/PublicTableController.java

### Triển khai Frontend cho User Story 1
- [ ] T045 [P] [US1] Xây dựng thanh điều hướng chung và chân trang tại frontend/src/components/layout/MainHeader.tsx và MainFooter.tsx
- [ ] T046 [P] [US1] Xây dựng thẻ hiển thị món ăn (MenuItemCard) và thẻ bàn ăn (TableCard) tại frontend/src/components/common/MenuItemCard.tsx và TableCard.tsx
- [ ] T047 [US1] Xây dựng Trang chủ giới thiệu nhà hàng tại frontend/src/pages/public/HomePage.tsx
- [ ] T048 [US1] Xây dựng Trang xem thực đơn công khai kèm bộ lọc danh mục và tìm kiếm tại frontend/src/pages/public/PublicMenuPage.tsx
- [ ] T049 [US1] Xây dựng Trang tra cứu sơ đồ bàn trống theo giờ tại frontend/src/pages/public/TableLookupPage.tsx
- [ ] T050 [US1] Xây dựng Trang xem món tại bàn khi quét mã QR (/table/:tableNumber) tại frontend/src/pages/public/QrTableOrderPage.tsx

---

## Phase 4: User Story 2 - Khách Đã Đăng Nhập Đặt Bàn, Gọi Món & Nhận Email (Priority: P1)

**Mục tiêu**: Khách hàng đăng ký/đăng nhập tài khoản (`CUSTOMER`), đặt bàn trước theo khung giờ có chống trùng, chọn món vào giỏ hàng gửi order, tự động nhận email xác nhận qua Gmail SMTP, và xem lịch sử cá nhân.

### Kiểm thử cho User Story 2
- [ ] T051 [P] [US2] Viết Unit test đăng ký, đăng nhập, tạo token JWT tại backend/auth-user-service/src/test/java/com/restaurant/auth/service/AuthServiceTest.java
- [ ] T052 [P] [US2] Viết Unit test kiểm tra logic đặt bàn, chống trùng khung giờ, tính tổng tiền order tại backend/booking-order-service/src/test/java/com/restaurant/booking/service/BookingOrderServiceTest.java
- [ ] T053 [P] [US2] Viết Integration test tạo đơn đặt bàn và order của Customer tại backend/booking-order-service/src/test/java/com/restaurant/booking/controller/BookingCustomerControllerTest.java

### Triển khai Backend cho User Story 2
- [ ] T054 [P] [US2] Xây dựng AuthService và UserController tại backend/auth-user-service/src/main/java/com/restaurant/auth/service/AuthService.java và backend/auth-user-service/src/main/java/com/restaurant/auth/controller/AuthController.java
- [ ] T055 [P] [US2] Xây dựng EmailNotificationService sử dụng JavaMailSender gửi email HTML xác nhận đặt bàn qua Gmail SMTP tại backend/booking-order-service/src/main/java/com/restaurant/booking/service/EmailNotificationService.java
- [ ] T056 [US2] Xây dựng CatalogTableClient trong Booking Service để truy vấn giá món và cập nhật trạng thái bàn tại backend/booking-order-service/src/main/java/com/restaurant/booking/client/CatalogTableClient.java
- [ ] T057 [US2] Xây dựng BookingOrderService tạo đơn đặt bàn, tính tổng tiền và lưu OrderItem tại backend/booking-order-service/src/main/java/com/restaurant/booking/service/BookingOrderService.java
- [ ] T058 [US2] Xây dựng BookingOrderController phục vụ /api/v1/orders cho Customer tại backend/booking-order-service/src/main/java/com/restaurant/booking/controller/BookingOrderController.java

### Triển khai Frontend cho User Story 2
- [ ] T059 [P] [US2] Xây dựng Trang Đăng nhập và Trang Đăng ký tại frontend/src/pages/public/LoginPage.tsx và RegisterPage.tsx
- [ ] T060 [US2] Xây dựng Form Đặt bàn trước chọn bàn và thời gian tại frontend/src/pages/customer/BookingAndOrderPage.tsx
- [ ] T061 [US2] Xây dựng Ngăn kéo giỏ hàng (CartDrawer) và chức năng xác nhận gửi order tại frontend/src/components/common/CartDrawer.tsx
- [ ] T062 [US2] Xây dựng Trang Lịch sử đặt bàn và đơn gọi món cá nhân tại frontend/src/pages/customer/MyOrdersHistoryPage.tsx

---

## Phase 5: User Story 3 - Nhân Viên/Bếp Quản Lý Sơ Đồ Bàn & Cập Nhật Trạng Thái Món (Priority: P1)

**Mục tiêu**: Nhân viên và Bếp (`STAFF`, `ADMIN`) xem danh sách đơn gọi món, xác nhận đặt bàn, cập nhật trạng thái đơn món (`PREPARING` -> `SERVED` -> `COMPLETED`), và quản lý trạng thái bàn thời gian thực.

### Kiểm thử cho User Story 3
- [ ] T063 [P] [US3] Viết Unit test cập nhật trạng thái món và trạng thái bàn tại backend/booking-order-service/src/test/java/com/restaurant/booking/service/StaffOrderServiceTest.java
- [ ] T064 [P] [US3] Viết Integration test bảo vệ endpoint Staff bằng quyền ROLE_STAFF tại backend/booking-order-service/src/test/java/com/restaurant/booking/controller/StaffOrderControllerTest.java

### Triển khai Backend cho User Story 3
- [ ] T065 [US3] Bổ sung logic cập nhật trạng thái đơn và giải phóng bàn trong BookingOrderService tại backend/booking-order-service/src/main/java/com/restaurant/booking/service/BookingOrderService.java
- [ ] T066 [US3] Xây dựng StaffOrderController phục vụ /api/v1/staff/orders/** tại backend/booking-order-service/src/main/java/com/restaurant/booking/controller/StaffOrderController.java
- [ ] T067 [US3] Bổ sung endpoint /api/v1/staff/tables/{id}/status trong CatalogTableService tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/controller/StaffTableController.java

### Triển khai Frontend cho User Story 3
- [ ] T068 [P] [US3] Xây dựng thanh bên dành cho Nhân viên tại frontend/src/components/layout/StaffSidebar.tsx
- [ ] T069 [US3] Xây dựng Màn hình Bếp điều phối đơn món (KitchenOrderBoard) cập nhật Đang nấu -> Đã phục vụ tại frontend/src/pages/staff/StaffOrderKitchenPage.tsx
- [ ] T070 [US3] Xây dựng Màn hình Quản lý sơ đồ bàn và tiếp nhận khách (StaffTableMap) tại frontend/src/pages/staff/StaffTableManagementPage.tsx

---

## Phase 6: User Story 4 - Thanh Toán Trực Tuyến VNPAY & Xuất Hóa Đơn PDF (Priority: P2)

**Mục tiêu**: Tích hợp cổng thanh toán VNPAY Sandbox tạo URL thanh toán trực tuyến ký HMAC-SHA512, xử lý callback chốt đơn, hỗ trợ thanh toán tiền mặt tại quầy, và xuất hóa đơn PDF tiếng Việt bằng OpenPDF.

### Kiểm thử cho User Story 4
- [ ] T071 [P] [US4] Viết Unit test tạo URL thanh toán và kiểm tra chữ ký HMAC-SHA512 VNPAY tại backend/booking-order-service/src/test/java/com/restaurant/booking/service/VnPayServiceTest.java
- [ ] T072 [P] [US4] Viết Unit test kết xuất hóa đơn PDF chứa đầy đủ thông tin tiếng Việt tại backend/booking-order-service/src/test/java/com/restaurant/booking/service/PdfInvoiceServiceTest.java

### Triển khai Backend cho User Story 4
- [ ] T073 [US4] Xây dựng VnPayService tạo URL thanh toán và xác minh SecureHash callback tại backend/booking-order-service/src/main/java/com/restaurant/booking/service/VnPayService.java
- [ ] T074 [US4] Xây dựng PdfInvoiceService sử dụng OpenPDF tạo file PDF hóa đơn có dấu tại backend/booking-order-service/src/main/java/com/restaurant/booking/service/PdfInvoiceService.java
- [ ] T075 [US4] Xây dựng PaymentController xử lý /api/v1/payments/vnpay/** và xuất PDF /api/v1/orders/{id}/invoice.pdf tại backend/booking-order-service/src/main/java/com/restaurant/booking/controller/PaymentController.java

### Triển khai Frontend cho User Story 4
- [ ] T076 [P] [US4] Xây dựng modal xem trước và tải hóa đơn PDF (InvoicePreviewModal) tại frontend/src/components/common/InvoicePreviewModal.tsx
- [ ] T077 [US4] Xây dựng Trang tiếp nhận kết quả thanh toán VNPAY (VnPayReturnPage) tại frontend/src/pages/customer/VnPayReturnPage.tsx
- [ ] T078 [US4] Tích hợp nút Thanh toán trực tuyến và Xuất hóa đơn PDF trên trang quản lý đơn của Nhân viên và Khách hàng tại frontend/src/pages/staff/StaffOrderKitchenPage.tsx và MyOrdersHistoryPage.tsx

---

## Phase 7: User Story 5 - Quản Trị Menu (Cloudinary), Mã QR & Thống Kê Doanh Thu (Priority: P2)

**Mục tiêu**: Quản trị viên (`ADMIN`) thực hiện đầy đủ CRUD thực đơn kèm tải ảnh lên Cloudinary, quản lý danh sách bàn kèm in mã QR, quản lý tài khoản và xem biểu đồ thống kê doanh thu.

### Kiểm thử cho User Story 5
- [ ] T079 [P] [US5] Viết Unit test tính toán thống kê doanh thu theo ngày/tháng tại backend/booking-order-service/src/test/java/com/restaurant/booking/service/StatisticsServiceTest.java
- [ ] T080 [P] [US5] Viết Integration test phân quyền ROLE_ADMIN cho các endpoint quản trị tại backend/catalog-table-service/src/test/java/com/restaurant/catalog/controller/AdminCatalogControllerTest.java

### Triển khai Backend cho User Story 5
- [ ] T081 [P] [US5] Xây dựng CloudinaryService tải ảnh món ăn lên Cloudinary API tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/service/CloudinaryService.java
- [ ] T082 [US5] Xây dựng AdminMenuController phục vụ CRUD menu kèm tải ảnh tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/controller/AdminMenuController.java
- [ ] T083 [US5] Xây dựng AdminTableController phục vụ CRUD bàn ăn tại backend/catalog-table-service/src/main/java/com/restaurant/catalog/controller/AdminTableController.java
- [ ] T084 [US5] Xây dựng StatisticsService và AdminStatisticsController thống kê doanh thu tại backend/booking-order-service/src/main/java/com/restaurant/booking/service/StatisticsService.java và backend/booking-order-service/src/main/java/com/restaurant/booking/controller/AdminStatisticsController.java

### Triển khai Frontend cho User Story 5
- [ ] T085 [P] [US5] Xây dựng Trang Quản lý Thực đơn kèm form upload ảnh Cloudinary tại frontend/src/pages/admin/AdminMenuManagementPage.tsx
- [ ] T086 [P] [US5] Xây dựng Trang Quản lý Bàn kèm modal in/tải mã QR bàn tại frontend/src/pages/admin/AdminTableQrPage.tsx
- [ ] T087 [P] [US5] Xây dựng Trang Quản lý Người dùng và phân quyền tại frontend/src/pages/admin/AdminUsersPage.tsx
- [ ] T088 [US5] Xây dựng Trang Bảng điều khiển Thống kê Doanh thu và Top món bán chạy tại frontend/src/pages/admin/AdminRevenueStatsPage.tsx

---

## Phase 8: Polish, Packaging & Cloud Deployment (Heroku + Vercel)

**Mục tiêu**: Hoàn thiện các tệp Dockerfile cho từng service, tệp Procfile cho Heroku, kịch bản chạy kiểm thử tự động npm run verify trên toàn bộ workspace và hướng dẫn báo cáo đồ án.

- [ ] T089 [P] Tạo Dockerfile cho Service 1 tại backend/auth-user-service/Dockerfile
- [ ] T090 [P] Tạo Dockerfile cho Service 2 tại backend/catalog-table-service/Dockerfile
- [ ] T091 [P] Tạo Dockerfile cho Service 3 tại backend/booking-order-service/Dockerfile
- [ ] T092 [P] Tạo Procfile cho Heroku deployment tại backend/Procfile
- [ ] T093 Cập nhật kịch bản npm run verify tại package.json gốc để chạy toàn bộ bộ kiểm thử Backend trên cả 3 microservices và build Frontend
- [ ] T094 Chạy kiểm tra thực tế toàn bộ test suite và build qua npm run verify để đảm bảo zero warning và zero lỗi
- [ ] T095 [P] Viết tệp README.md đầy đủ tại d:/DoAnJ2EE/README.md hướng dẫn chi tiết chạy cục bộ, tài khoản mẫu, test VNPAY Sandbox và deploy Heroku/Vercel

---

## Phụ Thuộc & Thứ Tự Thực Hiện

1. **Phase 1 (Setup)** và **Phase 2 (Foundational)**: Phải hoàn thành trước tiên để có sẵn 3 Microservices chạy trên cổng 8081, 8082, 8083 và khung Frontend.
2. **Phase 3 (User Story 1 - MVP)**: Triển khai chức năng đọc menu và bàn công khai kèm mã QR. Hoàn tất Phase 3 là có ngay bản MVP demo được cho khách vãng lai.
3. **Phase 4 (User Story 2)**: Triển khai đăng nhập, đặt bàn, giỏ hàng gọi món và gửi email xác nhận.
4. **Phase 5 (User Story 3)**: Triển khai quy trình tiếp nhận đơn và bếp nấu cho Nhân viên.
5. **Phase 6 (User Story 4)**: Tích hợp VNPAY và xuất hóa đơn PDF.
6. **Phase 7 (User Story 5)**: Hoàn thiện module quản trị Admin, upload ảnh Cloudinary và báo cáo doanh thu.
7. **Phase 8 (Polish & Deploy)**: Kiểm tra toàn bộ qua `npm run verify`, đóng gói Docker/Procfile và hoàn tất tài liệu.
