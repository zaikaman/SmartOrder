# Feature Specification: Hệ Thống Quản Lý Đặt Bàn và Gọi Món Trực Tuyến - Nhà Hàng Ẩm Thực Bếp Việt

**Feature Branch**: `001-qr-table-ordering`  
**Created**: 2026-10-13  
**Status**: Draft  
**Concept & Style**: Nhà hàng Ẩm thực Việt Nam truyền thống & đương đại (**Nhà Hàng Ẩm Thực Bếp Việt** - Phục vụ cơm niêu, lẩu riêu cua bắp bò, các món kho, xào, đồ uống truyền thống và chè cung đình).  
**Input**: User description: "Hệ thống quản lý đặt bàn và gọi món trực tuyến cho Nhà Hàng Ẩm Thực Bếp Việt theo mô hình 3 nhóm người dùng (Anonymous, Logged-in User, Admin/Staff), quản lý thực đơn ẩm thực Việt Nam, sơ đồ bàn theo khu vực kèm mã QR, đặt bàn theo khung giờ, gọi món, cập nhật trạng thái món (Đang nấu -> Đã phục vụ), tích hợp thanh toán trực tuyến VNPAY, gửi email xác nhận đặt bàn, tải ảnh món ăn Cloudinary, xuất hóa đơn PDF và thống kê doanh thu."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Khách vãng lai (Anonymous) Tra cứu Thực đơn, Bàn trống và Quét mã QR tại bàn (Priority: P1)

Khách vãng lai chưa đăng nhập truy cập hệ thống hoặc quét mã QR đặt tại bàn để xem thông tin nhà hàng, duyệt danh sách thực đơn theo danh mục kèm hình ảnh, giá bán và trạng thái còn món, cũng như tra cứu danh sách bàn trống theo khung giờ và số lượng ghế. Khi khách muốn tiến hành đặt bàn trước hoặc gửi đơn gọi món và thanh toán trực tuyến, hệ thống điều hướng khách đăng nhập hoặc đăng ký tài khoản nhanh chóng.

**Why this priority**: Đây là điểm chạm đầu tiên giúp mọi khách hàng tiếp cận thông tin thực đơn và tình trạng bàn trống ngay lập tức qua mã QR hoặc trang chủ mà không gặp rào cản truy cập.

**Independent Test**: Có thể kiểm thử độc lập bằng cách truy cập ứng dụng ở chế độ ẩn danh (chưa đăng nhập), mở trang thực đơn, tra cứu bàn trống và mở đường dẫn mã QR của một bàn để xác nhận dữ liệu công khai hiển thị đầy đủ.

**Acceptance Scenarios**:

1. **Given** Khách vãng lai chưa đăng nhập mở trang chủ hoặc quét mã QR tại bàn số 05, **When** Khách truy cập màn hình thực đơn, **Then** Hệ thống hiển thị thông tin bàn số 05 cùng toàn bộ danh mục và món ăn đang phục vụ kèm giá và hình ảnh.
2. **Given** Khách vãng lai đang ở màn hình tra cứu bàn, **When** Khách lọc theo thời gian dự kiến và số lượng ghế, **Then** Hệ thống hiển thị sơ đồ các bàn phù hợp cùng trạng thái hiện tại (`AVAILABLE`, `RESERVED`, `OCCUPIED`).
3. **Given** Khách vãng lai chọn món vào giỏ hàng hoặc nhấn "Đặt bàn ngay", **When** Khách nhấn gửi yêu cầu, **Then** Hệ thống yêu cầu khách đăng nhập tài khoản (hoặc đăng ký mới) và giữ nguyên trạng thái giỏ hàng/bàn đã chọn sau khi đăng nhập thành công.

---

### User Story 2 - Khách đã đăng nhập (Logged-in User) Đặt bàn trước, Gọi món và Nhận Email xác nhận (Priority: P1)

Khách hàng sau khi đăng nhập thực hiện đặt bàn trước theo thời gian và bàn mong muốn, chọn các món ăn vào giỏ hàng để gửi đơn gọi món (Order) gắn với bàn, và xem lại toàn bộ lịch sử đặt bàn cùng hóa đơn cá nhân. Ngay khi đặt bàn thành công, hệ thống tự động gửi email xác nhận kèm mã đặt bàn và thông tin chi tiết tới hộp thư của khách hàng.

**Why this priority**: Đáp ứng trọn vẹn luồng nghiệp vụ chính của nhóm người dùng đã đăng nhập (`CUSTOMER`), kết hợp giữa đặt bàn, gọi món và thông báo tự động qua email.

**Independent Test**: Có thể kiểm thử độc lập bằng cách đăng nhập tài khoản `CUSTOMER`, tạo một đơn đặt bàn kèm gọi món cho bàn trống, kiểm tra bản ghi được lưu trong lịch sử cá nhân và email xác nhận được kích hoạt gửi đi.

**Acceptance Scenarios**:

1. **Given** Khách hàng đã đăng nhập và chọn một bàn đang ở trạng thái `AVAILABLE` cùng thời gian hợp lệ, **When** Khách xác nhận đặt bàn, **Then** Hệ thống tạo đơn đặt bàn ở trạng thái `PENDING`, chuyển trạng thái bàn sang `RESERVED` và gửi email xác nhận chi tiết tới địa chỉ email của khách.
2. **Given** Khách hàng đã đăng nhập đang ngồi tại bàn hoặc đã có bàn đặt, **When** Khách chọn các món ăn với số lượng cụ thể và nhấn gửi đơn gọi món, **Then** Hệ thống lưu đơn hàng cùng danh sách chi tiết món đặt (`OrderItem`), tính chính xác tổng tiền (`total_amount`) và hiển thị trong mục Lịch sử đặt bàn/hóa đơn cá nhân.
3. **Given** Bàn đã ở trạng thái `RESERVED` hoặc `OCCUPIED` trong khung giờ đó, **When** Một khách hàng khác cố gắng đặt trùng bàn đó trong cùng khung giờ, **Then** Hệ thống từ chối yêu cầu và thông báo bàn đã được đặt.

---

### User Story 3 - Nhân viên & Quản trị viên (Staff / Admin) Điều phối bàn, Xác nhận đặt bàn và Cập nhật trạng thái món (Priority: P1)

Nhân viên và Quản trị viên đăng nhập vào phân hệ vận hành để quản lý sơ đồ bàn (`AVAILABLE`, `RESERVED`, `OCCUPIED`), xác nhận hoặc hủy các đơn đặt bàn của khách, và cập nhật tiến độ chế biến đơn món từ trạng thái chờ xử lý sang `Đang nấu` (`PREPARING`) -> `Đã phục vụ` (`SERVED`) -> `Hoàn tất` (`COMPLETED`).

**Why this priority**: Đảm bảo luồng vận hành thực tế tại nhà hàng từ lúc tiếp nhận yêu cầu đặt bàn/gọi món của khách đến lúc chế biến và phục vụ hoàn tất tại bàn.

**Independent Test**: Có thể kiểm thử độc lập bằng cách đăng nhập tài khoản `STAFF` hoặc `ADMIN`, xác nhận một đơn đặt bàn đang chờ, sau đó chuyển trạng thái đơn gọi món từ `Đang nấu` sang `Đã phục vụ` và kiểm tra trạng thái hiển thị phía khách hàng.

**Acceptance Scenarios**:

1. **Given** Có một đơn đặt bàn mới ở trạng thái `PENDING`, **When** Nhân viên nhấn "Xác nhận đặt bàn", **Then** Đơn chuyển sang trạng thái `CONFIRMED` và khi khách đến nhận bàn, nhân viên cập nhật trạng thái bàn sang `OCCUPIED`.
2. **Given** Khách hàng đã gửi đơn gọi món tại bàn, **When** Nhân viên/Bếp cập nhật trạng thái đơn món sang `Đang nấu` (`PREPARING`) và sau đó sang `Đã phục vụ` (`SERVED`), **Then** Trạng thái mới được lưu trữ và hiển thị chính xác khi khách hàng xem chi tiết đơn hàng.
3. **Given** Một bàn đã hoàn tất bữa ăn và thanh toán xong, **When** Nhân viên đóng đơn hàng (`COMPLETED`), **Then** Trạng thái bàn được giải phóng về `AVAILABLE` để đón lượt khách tiếp theo.

---

### User Story 4 - Thanh toán Trực tuyến qua Cổng thanh toán và Xuất hóa đơn PDF (Priority: P2)

Khách hàng đã đăng nhập thực hiện thanh toán trực tuyến cho đơn đặt cọc bàn hoặc hóa đơn gọi món thông qua cổng thanh toán điện tử (hoặc nhân viên xác nhận thanh toán tại quầy). Sau khi giao dịch thanh toán thành công, hệ thống cập nhật trạng thái đơn sang hoàn tất thanh toán và cho phép khách hàng cũng như nhân viên tải xuống hoặc in hóa đơn định dạng PDF chi tiết.

**Why this priority**: Tạo điểm nhấn tích hợp dịch vụ thanh toán bên thứ ba và cung cấp chứng từ hóa đơn PDF chuyên nghiệp cho cả khách hàng và nhà hàng.

**Independent Test**: Có thể kiểm thử độc lập bằng cách chọn một đơn hàng chưa thanh toán, khởi tạo URL thanh toán trực tuyến, hoàn tất luồng xác thực kết quả giao dịch và tải tệp hóa đơn PDF về máy.

**Acceptance Scenarios**:

1. **Given** Khách hàng đã đăng nhập có một đơn đặt bàn/hóa đơn gọi món cần thanh toán, **When** Khách nhấn "Thanh toán trực tuyến", **Then** Hệ thống tạo giao dịch thanh toán kèm chữ ký bảo mật và trả về đường dẫn thanh toán trực tuyến với số tiền khớp tuyệt đối với `total_amount` của đơn.
2. **Given** Cổng thanh toán trực tuyến trả về phản hồi giao dịch thành công với chữ ký hợp lệ, **When** Hệ thống xác thực kết quả, **Then** Trạng thái thanh toán của đơn chuyển sang đã thanh toán (`COMPLETED` / `PAID`) và ghi nhận mã giao dịch đối soát.
3. **Given** Đơn hàng đã được thanh toán, **When** Khách hàng hoặc Nhân viên nhấn "In / Tải hóa đơn PDF", **Then** Hệ thống xuất tệp PDF tiếng Việt có dấu chứa thông tin nhà hàng, mã đơn, thông tin khách hàng, số bàn, danh sách món ăn, số lượng, đơn giá, thành tiền và tổng thanh toán.

---

### User Story 5 - Quản trị viên (Admin) Quản lý Thực đơn (kèm tải ảnh), Quản lý Bàn/Mã QR và Thống kê Doanh thu (Priority: P2)

Quản trị viên (`ADMIN`) quản lý danh mục thực đơn (thêm, sửa, xóa/ẩn món ăn, cập nhật giá bán, tải hình ảnh món ăn lên dịch vụ lưu trữ đám mây), quản lý sơ đồ bàn ăn (thêm/sửa bàn, sức chứa, sinh mã QR cho từng bàn) và theo dõi bảng điều khiển thống kê doanh thu theo thời gian, tổng số đơn hoàn thành và danh sách món ăn bán chạy.

**Why this priority**: Hoàn thiện công cụ quản trị dữ liệu gốc (Master Data), tích hợp dịch vụ lưu trữ ảnh đám mây và báo cáo doanh thu phục vụ quản lý.

**Independent Test**: Có thể kiểm thử độc lập bằng cách đăng nhập `ADMIN`, thêm một món ăn mới kèm tải tệp ảnh lên, tạo một bàn ăn mới có đường dẫn mã QR, và truy vấn báo cáo doanh thu từ các đơn hàng đã hoàn tất.

**Acceptance Scenarios**:

1. **Given** Admin đang ở màn hình Quản lý thực đơn, **When** Admin tạo mới hoặc cập nhật món ăn kèm tệp hình ảnh, **Then** Hình ảnh được tải lên dịch vụ lưu trữ đám mây, đường dẫn `image_url` được lưu vào món ăn và hiển thị ngay trên thực đơn công khai.
2. **Given** Admin đang ở màn hình Quản lý bàn ăn, **When** Admin tạo một bàn mới với số bàn và số ghế (`capacity`), **Then** Hệ thống tự động sinh mã QR (`qr_code_url`) dẫn tới giao diện xem thực đơn/gọi món của bàn đó.
3. **Given** Hệ thống có các đơn hàng ở trạng thái `COMPLETED`, **When** Admin mở trang Thống kê doanh thu và chọn khoảng thời gian, **Then** Hệ thống hiển thị tổng doanh thu, số lượng đơn đặt bàn/gọi món hoàn thành và biểu đồ doanh thu theo ngày/tháng.

### Edge Cases

- **Khách vãng lai (Anonymous) cố tình gọi trực tiếp điểm cuối tạo đơn đặt bàn hoặc gọi món mà không có thông tin xác thực**: Hệ thống từ chối yêu cầu với mã lỗi chưa xác thực (`401 Unauthorized`) và yêu cầu đăng nhập.
- **Tài khoản khách hàng (`CUSTOMER`) cố gắng truy cập trang quản trị thực đơn hoặc cập nhật trạng thái bếp**: Hệ thống chặn truy cập với mã lỗi không đủ quyền (`403 Forbidden`).
- **Món ăn đang ở trạng thái hết hàng (`OUT_OF_STOCK` / `INACTIVE`) nhưng được gửi trong yêu cầu tạo đơn**: Hệ thống kiểm tra và từ chối tạo đơn, trả về thông báo rõ món nào hiện không khả dụng.
- **Dịch vụ gửi Email bên thứ ba gặp sự cố mạng tạm thời khi khách đặt bàn**: Giao dịch đặt bàn trong cơ sở dữ liệu vẫn được lưu thành công, đồng thời lỗi gửi email được ghi nhận vào nhật ký hệ thống và trả kèm trạng thái thông báo để có thể gửi lại mà không làm hỏng đơn đặt bàn của khách.
- **Phản hồi từ cổng thanh toán trực tuyến bị gửi lặp lại (Duplicate callback) hoặc sai chữ ký bảo mật**: Hệ thống kiểm tra chữ ký số và tính lũy đẳng theo mã giao dịch để từ chối bản tin giả mạo hoặc tránh cộng trùng doanh thu.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống PHẢI phân tách rõ 3 nhóm người dùng và quyền hạn:
  - **Anonymous (Khách vãng lai)**: Xem thông tin nhà hàng, xem thực đơn (`MenuItem`), tra cứu bàn trống (`DiningTable`) và quét mã QR tại bàn để xem món.
  - **Logged-in User (`CUSTOMER`)**: Đặt bàn trước, chọn món vào giỏ và gửi đơn gọi món (`Order`), xem lịch sử đặt bàn/hóa đơn cá nhân, thanh toán trực tuyến và tải hóa đơn PDF.
  - **Admin / Staff (`ADMIN`, `STAFF`)**: Quản lý thực đơn, quản lý sơ đồ bàn, xác nhận đơn đặt bàn, cập nhật trạng thái đơn món (`PREPARING` -> `SERVED` -> `COMPLETED`), xem thống kê doanh thu (dành cho `ADMIN`).
- **FR-002**: Hệ thống PHẢI cho phép đăng ký tài khoản khách hàng, đăng nhập xác thực và cấp phát mã phiên truy cập bảo mật có chứa thông tin vai trò (`CUSTOMER`, `STAFF`, `ADMIN`).
- **FR-003**: Hệ thống PHẢI cung cấp chức năng CRUD thực đơn (`MenuItem`) bao gồm tên món, giá bán, mô tả, danh mục (`category`), đường dẫn ảnh (`image_url`) và trạng thái phục vụ (`status`).
- **FR-004**: Hệ thống PHẢI tích hợp dịch vụ lưu trữ đám mây để tải lên và lưu trữ hình ảnh món ăn khi Admin thêm hoặc cập nhật thực đơn.
- **FR-005**: Hệ thống PHẢI cung cấp chức năng quản lý bàn ăn (`DiningTable`) gồm số bàn (`table_number`), sức chứa (`capacity`), trạng thái (`AVAILABLE`, `RESERVED`, `OCCUPIED`) và đường dẫn mã QR (`qr_code_url`) cho từng bàn.
- **FR-006**: Hệ thống PHẢI cho phép khách đã đăng nhập tạo đơn đặt bàn theo thời gian (`reservation_time`) và bàn cụ thể, kiểm tra sức chứa và chống đặt trùng bàn trong cùng khung giờ.
- **FR-007**: Hệ thống PHẢI tự động gửi email xác nhận đặt bàn chứa mã đơn, số bàn, thời gian và thông tin khách hàng ngay sau khi đặt bàn thành công hoặc được xác nhận.
- **FR-008**: Hệ thống PHẢI cho phép khách đã đăng nhập chọn món vào giỏ hàng và tạo đơn gọi món (`Order`) kèm chi tiết từng món (`OrderItem`: số lượng, đơn giá, thành tiền `subtotal`) gắn với bàn ăn.
- **FR-009**: Hệ thống PHẢI cho phép Nhân viên/Admin cập nhật trạng thái đơn đặt bàn và tiến độ chế biến đơn món (`PENDING` -> `CONFIRMED` -> `PREPARING` -> `SERVED` -> `COMPLETED` / `CANCELLED`).
- **FR-010**: Hệ thống PHẢI tích hợp cổng thanh toán trực tuyến để tạo đường dẫn thanh toán cho đơn đặt bàn/hóa đơn gọi món và xác thực kết quả thanh toán tự động.
- **FR-011**: Hệ thống PHẢI hỗ trợ xuất hóa đơn định dạng PDF tiếng Việt có dấu đầy đủ thông tin đơn hàng và chi tiết các món đã gọi.
- **FR-012**: Hệ thống PHẢI cung cấp báo cáo thống kê doanh thu theo khoảng thời gian, số lượng đơn hoàn thành và danh sách món ăn bán chạy dành cho Quản trị viên.

### Key Entities *(include if feature involves data)*

- **User (Account)**: Tài khoản người dùng gồm `id`, `username`, `password`, `email`, `full_name`, `phone`, `role` (`CUSTOMER`, `ADMIN`, `STAFF`), `active`.
- **DiningTable (Table - Bàn ăn)**: Thông tin bàn ăn gồm `id`, `table_number`, `capacity` (số ghế), `area`, `status` (`AVAILABLE`, `RESERVED`, `OCCUPIED`), `qr_code_url`.
- **MenuItem (Món ăn)**: Thông tin món ăn gồm `id`, `name`, `price`, `description`, `category`, `image_url`, `status` (`AVAILABLE`, `OUT_OF_STOCK`, `INACTIVE`).
- **Reservation / Order (Đặt bàn & Đơn gọi món/Hóa đơn)**: Lưu thông tin đặt bàn và hóa đơn gọi món gồm `id`, `order_code`, `user_id`, `table_id`, `reservation_time`, `party_size`, `total_amount`, `payment_method`, `payment_status`, `status` (`PENDING`, `CONFIRMED`, `PREPARING`, `SERVED`, `COMPLETED`, `CANCELLED`).
- **OrderItem (Chi tiết món đặt)**: Chi tiết từng món trong đơn gồm `id`, `order_id`, `menu_item_id`, `menu_item_name`, `unit_price`, `quantity`, `subtotal`, `note`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Khách vãng lai (Anonymous) có thể quét mã QR hoặc truy cập trang chủ để xem thực đơn và tra cứu bàn trống trong thời gian phản hồi dưới 2 giây mà không cần đăng nhập.
- **SC-002**: Khách hàng đã đăng nhập có thể hoàn tất quy trình đặt bàn trước hoặc gửi đơn gọi món trong dưới 90 giây và nhận được thông tin xác nhận qua email.
- **SC-003**: 100% các đơn hàng thanh toán trực tuyến có tổng số tiền (`total_amount`) bằng chính xác tổng `subtotal` của các dòng `OrderItem` và xuất được tệp hóa đơn PDF hợp lệ trong dưới 5 giây.
- **SC-004**: 100% các yêu cầu truy cập trái phép giữa 3 nhóm người dùng (Anonymous, Logged-in Customer, Admin/Staff) bị chặn chính xác theo ma trận phân quyền.
- **SC-005**: Hệ thống đảm bảo tính độc lập của từng phân hệ chức năng (Xác thực & Người dùng, Thực đơn & Bàn ăn, Đặt bàn & Đơn hàng) và sẵn sàng đóng gói triển khai lên môi trường đám mây.

## Assumptions

- Khách vãng lai có thể xem toàn bộ thực đơn và trạng thái bàn qua mã QR công khai; khi thực hiện giao dịch đặt bàn, gửi đơn gọi món hoặc thanh toán trực tuyến, khách sử dụng tài khoản `CUSTOMER` đã đăng nhập để gắn kết lịch sử đơn hàng và nhận email xác nhận.
- Các dịch vụ bên thứ ba (Cổng thanh toán VNPAY Sandbox, Gửi Email qua Gmail SMTP (App Password), Lưu trữ ảnh qua Cloudinary) được cấu hình thông qua biến môi trường để dễ dàng chuyển đổi giữa môi trường phát triển cục bộ và môi trường triển khai đám mây (Heroku, Vercel, Aiven MySQL).
