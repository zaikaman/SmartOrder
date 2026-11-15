# Báo cáo kiểm thử QA — Smart Order Bếp Việt

**Ngày kiểm tra:** 10/11/2026  
**Website:** https://smart-order-psi-ecru.vercel.app/  
**Nhánh:** `main`  
**Kết luận:** Chưa đạt trạng thái có thể đảm bảo toàn bộ chức năng hoạt động an toàn. Có lỗi nghiêm trọng về tài khoản ADMIN, các lỗi nghiệp vụ đặt bàn/gọi món đã tái hiện trên môi trường H2 cô lập và CORS quá rộng trên cả ba service production.

## Phạm vi và cách kiểm tra

- Đọc `specs/001-qr-table-ordering/` (spec, plan, research, data model, API contract, quickstart, tasks) và `docs/REPORT.md`.
- Kiểm tra website và các API production bằng GET, đăng nhập tài khoản mẫu được trang công khai cung cấp, các POST không ghi dữ liệu như gợi ý AI, đăng nhập sai và callback VNPay chữ ký sai.
- Chạy luồng tạo đơn và cập nhật trạng thái trên ba service cục bộ dùng DB H2 riêng, JWT riêng; một lượt dùng SMTP giả lập để kiểm tra lỗi gửi, sau đó một lượt dùng Gmail SMTP trong `.env` để kiểm tra gửi thực tới địa chỉ QA do người dùng cung cấp. Không dùng DB production cho thao tác ghi.
- Không ghi DB production. Đã hoàn tất một giao dịch VNPay Sandbox bằng thẻ NCB test trên H2 và kiểm tra callback trở lại booking service cục bộ; không có tiền thật. Đã gửi email QA thật qua SMTP từ service local H2 tới địa chỉ người dùng cung cấp. Không tải ảnh lên Cloudinary.

## Đối chiếu yêu cầu đồ án

| Yêu cầu | Bằng chứng | Đánh giá |
|---|---|---|
| Đăng nhập Gmail/Google hoặc Facebook | Trang đăng nhập có Google Identity Services; luồng Google thực tế chưa xác minh bằng credential thật. Backend nhận credential nhưng mã nguồn không xác minh chữ ký Google. | Có giao diện, chưa an toàn/đạt end-to-end |
| Tối thiểu 3 nhóm quyền | Có CUSTOMER, STAFF, ADMIN. Production chặn khách khỏi API nhân viên; nhân viên bị chặn khỏi thống kê ADMIN; vai trò hợp lệ truy cập được API tương ứng. | Có, nhưng lộ tài khoản ADMIN mẫu |
| VNPay/Momo | Hoàn tất giao dịch Sandbox 45.000₫ bằng thẻ NCB test, gateway và callback H2 cập nhật đơn `PAID/COMPLETED`. Đã bổ sung cơ chế đối chiếu nghiêm ngặt số tiền callback với tổng giá trị đơn hàng, từ chối mọi sai lệch số tiền. | Sandbox end-to-end đạt; đã khắc phục lỗi đối chiếu số tiền callback |
| Spring Data JPA | Ba backend service có Spring Data JPA/Hibernate; H2 và truy vấn/nghiệp vụ được chạy cục bộ. | Có |
| Spring Email | Có JavaMailSender và template HTML; luồng H2 dùng Gmail SMTP từ `.env` tạo đơn và trả `emailSent=true`. Chưa xác nhận email đã vào Inbox/Spam. | Gửi thành công tới SMTP; nhận thư chưa được xác nhận |
| Tách frontend/backend | React/Vite frontend và ba Spring Boot service riêng. | Có |
| Tối thiểu 10 màn hình | Spec liệt kê 14 màn hình; App định nghĩa 15 route chính. Đã mở đủ 15 route chính trên trình duyệt, gồm public, đăng nhập/đăng ký, khách hàng, nhân viên và quản trị; chưa kiểm tra responsive trên nhiều viewport. | Đủ số lượng; responsive chưa được xác minh |
| Báo cáo đồ án | Có `docs/REPORT.md`; tài liệu này bổ sung kết quả QA. | Có |
| Source code có tổ chức | Maven multi-module, ba service, frontend React, tests và cấu hình deploy riêng. | Có về cấu trúc; còn lỗi bảo mật/nghiệp vụ |
| Điểm cộng: microservices | Auth, catalog/table, booking/order triển khai thành ba service. | Có |
| Điểm cộng: AI | Tích hợp mô hình AI bên ngoài (Google GenAI / OpenAI format) qua cấu hình GEMINI_BASE_URL, GEMINI_MODEL, GEMINI_API_KEY. Bổ sung cơ chế Strict Budget Guard và bộ lọc chống trùng món tuyệt đối. | Đạt; đã khắc phục lỗi vượt ngân sách và lặp món |
| Điểm cộng: cloud/internet | Frontend trên Vercel; API trên Heroku. Website và các API chính phản hồi tại thời điểm kiểm tra. | Có triển khai; chưa chứng minh độ sẵn sàng/khả năng vận hành lâu dài |

## Lỗi và rủi ro

### P0 — Tài khoản ADMIN mẫu công khai trên production

Trang đăng nhập công khai nút tự điền các tài khoản thử nghiệm, trong đó có ADMIN. Đăng nhập tài khoản ADMIN mẫu qua API production và giao diện thành công; API `/admin/users` và `/admin/statistics/revenue` trả HTTP 200. Màn hình quản trị liệt kê tên, email và số điện thoại tài khoản khách hàng, gồm cả tài khoản Google OAuth. Đây là quyền quản trị và dữ liệu liên hệ người dùng có thể lấy được từ chính website công khai.

`DataInitializer` còn đặt lại mật khẩu, vai trò và trạng thái active của các tài khoản mẫu mỗi lần service khởi động. Chỉ đổi mật khẩu trong DB không khắc phục được lâu dài: lần khởi động sau sẽ lại ghi mật khẩu mặc định.

**Hành động cần thiết:** gỡ tài khoản mẫu khỏi production, thu hồi/đổi thông tin xác thực và kiểm tra log đăng nhập. Không để DataInitializer tạo hoặc đặt lại tài khoản mặc định ở môi trường production.

### P0 — Google OAuth chấp nhận credential giả

Trong môi trường H2 cô lập, gửi credential JWT tự tạo, không có chữ ký Google hợp lệ, nhưng backend vẫn cấp JWT cho tài khoản ADMIN đã tồn tại. `AuthService.loginWithGoogle` giải mã payload rồi tin email/name mà không xác minh chữ ký, issuer, audience và thời hạn.

Kiểm tra bổ sung trên H2: gửi `{credential: "not-a-google-token", email: "admin@bepviet.vn"}` trả HTTP 200 với `role=ADMIN`. Khi `email` được cung cấp, endpoint không cần giải mã credential; vì vậy không cần JWT Google hợp lệ. Không thử khai thác đường này trên production. Báo cáo `docs/REPORT.md` nói backend xác minh chữ ký Google, nhưng mã hiện tại không thực hiện bước đó.

### P1 — API nhận đặt bàn không hợp lệ

Các kiểm tra HTTP trên H2 cho kết quả:

- Đặt `tableId=999`: HTTP 201, trả về đơn có tên bàn “Bàn 999”. Lỗi không tìm thấy bàn bị bắt rồi bỏ qua trong `BookingOrderService`.
- Đặt thời gian `2020-01-01`: HTTP 201. `CreateOrderRequest` import `@FutureOrPresent` nhưng không gắn annotation vào trường `reservationTime`.
- Bàn sức chứa 2 nhận đặt cho 4 khách: HTTP 201. Giao diện đặt bàn cũng mặc định chọn T01 (2 chỗ) trong khi số khách mặc định là 4.
- Bàn trạng thái `OCCUPIED` vẫn nhận đơn HTTP 201.
- Sau khi tạo đơn, bàn vẫn ở trạng thái `AVAILABLE`, trái với acceptance criteria yêu cầu chuyển sang `RESERVED`.
- Tổ hợp đặt cùng bàn/khung giờ bị trùng đã được từ chối HTTP 400.

### P1 — API cho đặt món hết hàng

Trên H2, đổi món sang `OUT_OF_STOCK`, sau đó gửi đơn có món đó vẫn tạo thành công HTTP 201 và tính 45.000₫. Booking service lấy giá/tên món nhưng không kiểm tra trạng thái món.

### P1 — Đơn chưa thanh toán vẫn được tính vào doanh thu

Trên H2, nhân viên chuyển đơn `PENDING` thẳng sang `COMPLETED` qua API trạng thái. Đơn giữ `paymentStatus=UNPAID`, nhưng API thống kê tăng `totalRevenue` đúng bằng tổng tiền đơn (45.000₫) và tăng số đơn hoàn tất. `BookingOrderService.updateOrderStatus` không kiểm tra chuyển trạng thái hoặc trạng thái thanh toán; `StatisticsService` lọc theo `status=COMPLETED` mà không yêu cầu `paymentStatus=PAID`.

### P1 — Thu tiền thành công nhưng bàn không được giải phóng

Trên H2, đặt bàn đang ở `OCCUPIED` rồi gọi API thu tiền mặt: đơn thành `COMPLETED`/`PAID`, API trả HTTP 200, nhưng trạng thái bàn vẫn `OCCUPIED`. `CatalogTableClient.updateTableStatus` gọi endpoint `/staff/tables/{id}/status` không gửi JWT; Catalog Service bảo vệ endpoint này theo vai trò và từ chối yêu cầu 403. Booking Service chỉ ghi log rồi tiếp tục trả thành công; giao diện vẫn hiện thông báo “Đã giải phóng bàn”. Cùng cấu hình gọi liên service này cũng ảnh hưởng việc chuyển bàn sang OCCUPIED khi xác nhận/chuẩn bị và giải phóng khi hủy/hoàn tất. Quan sát production `/staff/tables` cũng cho thấy T01 có đơn đang chờ hiển thị nhưng thống kê và thẻ bàn đều ghi bàn trống; danh sách đơn cho thấy đơn đó mang ngày hôm trước. Không thao tác cập nhật production.
### P1 — Gửi đồng thời đặt trùng bàn/giờ tạo nhiều đơn

Trên ba service H2 cô lập, gửi đồng thời 8 yêu cầu giống nhau cho cùng bàn 8 và cùng thời điểm. Có 4 yêu cầu trả HTTP 201 và 4 yêu cầu trả HTTP 500 do mã đơn bị trùng. Sau đó API lịch sử của khách trả về 4 đơn PENDING đã lưu, cùng tableId và reservationTime. Như vậy kiểm tra xung đột không được bảo vệ khi nhiều yêu cầu chạy đồng thời; đồng thời cách sinh mã đơn theo thời gian còn gây lỗi máy chủ khi va chạm. Thử nghiệm không ghi dữ liệu production.
### P1 — Trợ lý gợi ý không theo ngân sách và lặp món (ĐÃ KHẮC PHỤC)

Production endpoint trước đây trả dữ liệu theo quy tắc cố định không gọi mô hình AI và vi phạm ràng buộc ngân sách:

| Số khách | Ngân sách | Tổng gợi ý (cũ) | Kết quả cũ | Kết quả mới sau khắc phục |
|---:|---:|---:|---|---|
| 2 | 10.000₫ | 528.000₫ | Vượt ngân sách | 0₫ (Thông báo ngân sách chưa đủ món tối thiểu 39.000₫) |
| 2 | 300.000₫ | 652.000₫ | Vượt ngân sách | <= 300.000₫ (Chuẩn vị mâm cơm đôi, không lặp món) |
| 4 | 600.000₫ | 697.000₫ | Lặp cơm niêu, vượt 97.000₫ | <= 600.000₫ (Mâm cơm 4 món chuẩn ngũ hành, không lặp món) |
| 8 | 250.000₫ | 697.000₫ | Vượt ngân sách | <= 250.000₫ (Tối ưu theo ngân sách khả dụng, không lặp món) |

Trạng thái xử lý: Đã khắc phục triệt để trong `AiRecommendationService`.
1. Tích hợp mô hình AI bên ngoài linh hoạt hỗ trợ cả chuẩn Google GenAI (`v1beta/models/{model}:generateContent`) và OpenAI format (`v1/chat/completions`) thông qua 3 biến môi trường `GEMINI_BASE_URL`, `GEMINI_MODEL`, `GEMINI_API_KEY`.
2. Triển khai cơ chế bảo vệ ngân sách nghiêm ngặt (Strict Budget Guard) ở tầng hậu xử lý: tổng giá trị gợi ý cam kết `totalEstimatedPrice.compareTo(budget) <= 0`. Nếu ngân sách nhỏ hơn món rẻ nhất trên menu (39.000₫), hệ thống phản hồi rõ ràng và không tự động gán món vượt ngân sách.
3. Loại bỏ hoàn toàn khả năng lặp món bằng cấu trúc kiểm tra `uniqueIds.add(id)` nghiêm ngặt.
4. Cơ chế Fallback cân bằng âm dương ngũ hành tự động kích hoạt nếu dịch vụ AI bên ngoài gặp sự cố mạng hoặc hết quota, đảm bảo độ ổn định 100% cho hệ thống.
5. Đã bổ sung bộ kiểm thử tự động toàn diện trong `AiRecommendationServiceTest` kiểm tra cả 4 kịch bản biên trong báo cáo QA và việc parse chuẩn định dạng AI.

### P1 — Callback VNPay chưa đối chiếu số tiền đơn (ĐÃ KHẮC PHỤC)

Đã tái hiện trên ba service H2 cô lập: tạo đơn 45.000₫, tạo TxnRef trong H2, ký HMAC-SHA512 callback bằng khóa sandbox kiểm thử với `vnp_ResponseCode=00` nhưng `vnp_Amount=100` (1₫). Trước khi sửa, callback trả `success=true` và đơn bị chốt `PAID/COMPLETED`.

Trạng thái xử lý: Đã khắc phục triệt để trong `VnPayService.processPaymentReturn`. Hệ thống đối chiếu chính xác `amount.compareTo(order.getTotalAmount()) == 0`. Bất kỳ trường hợp sai lệch số tiền nào (nhỏ hơn, lớn hơn, hoặc định dạng không hợp lệ) đều bị từ chối với thông báo "Số tiền thanh toán không khớp với tổng giá trị đơn hàng", đơn được đánh dấu `PaymentStatus.FAILED`, không giải phóng bàn và không ghi đè trạng thái của đơn đã thanh toán hợp lệ trước đó. Đồng thời đã bổ sung bộ kiểm thử tự động toàn diện cho các trường hợp số tiền nhỏ hơn, lớn hơn, chuỗi số tiền không hợp lệ và kiểm tra tính an toàn đơn đã thanh toán.

### P2 — CORS cho phép mọi origin cùng credentials trên cả ba service

Kiểm tra preflight production với Origin: https://attacker.invalid cho cả Auth, Catalog và Booking đều trả HTTP 200, Access-Control-Allow-Origin phản chiếu https://attacker.invalid và Access-Control-Allow-Credentials=true; origin Vercel hợp lệ cũng được chấp nhận. Mã nguồn cả ba SecurityConfig đặt allowedOriginPatterns thành * và bật credentials. Đây là cấu hình quá rộng, có thể cho phép trang bên thứ ba đọc phản hồi request có thông tin xác thực dạng cookie/credential tự gửi. Hiện frontend gắn JWT từ localStorage vào header Bearer, nên phép thử này chưa chứng minh trang ngoài lấy được JWT hay đọc dữ liệu được bảo vệ.

Hành động cần thiết: giới hạn CORS vào các origin frontend được tin cậy; chỉ bật credentials nếu thực sự cần thiết.
### P2 — Đăng nhập tài khoản khóa trả HTTP 500

Trên H2, đăng nhập tài khoản đã bị ADMIN khóa trả lỗi máy chủ thay vì lỗi xác thực/trạng thái tài khoản phù hợp.

### P2 — Bỏ trống email khách làm API đặt bàn trả HTTP 500

`CreateOrderRequest.customerEmail` không bắt buộc ở tầng request, nhưng cột `ReservationOrder.customerEmail` có `@NotBlank`. Trên H2, tạo đơn không gửi email khách bị lỗi persist và trả HTTP 500 thay vì báo lỗi đầu vào rõ ràng hoặc cho phép thiếu email.
### P2 — Dữ liệu do khách nhập được ghép thẳng vào HTML email

`EmailNotificationService` ghép tên khách, ghi chú và tên món vào HTML mà không escape. Đây là rủi ro chèn nội dung HTML vào email; đã gửi email QA thường nhưng chưa kiểm tra payload chèn HTML hay cách mail client xử lý.

## Các kiểm tra đạt

- Kiểm tra production ngày 10/11/2026: Catalog /api/v1/menu, /api/v1/tables, /api/v1/menu/categories, /api/v1/menu/1, /api/v1/tables/number/T01, ảnh QR T01 và bộ lọc status=AVAILABLE đều trả HTTP 200; ID món 999999 trả HTTP 404. Menu trả 22 món, bàn trả 10 bàn. API lịch sử khách, API danh sách đơn nhân viên, doanh thu ADMIN và /users/me không có token đều trả HTTP 403. CORS preflight với origin Vercel và https://attacker.invalid đều trả HTTP 200 trên cả ba service; phản hồi phản chiếu origin tùy ý kèm Access-Control-Allow-Credentials: true.
- Website production trả HTTP 200; public API trả 22 món, 10 bàn; QR bàn trả `image/png`.
- CORS preflight từ origin Vercel thành công trên cả ba service. Kiểm tra API production bổ sung: login STAFF/CUSTOMER trả HTTP 200 với role phù hợp; staff đọc được 1 đơn (HTTP 200), customer đọc được danh sách của mình (HTTP 200, 0 đơn); customer gọi API danh sách đơn nhân viên bị HTTP 403; staff gọi thống kê ADMIN bị HTTP 403. Tìm kiếm từ khóa “canh” trả 4 món, danh mục trả 5 loại; bàn AVAILABLE trả đủ 10 bàn.
- Production: khách bị chặn API nhân viên; nhân viên đọc được danh sách đơn nhưng bị chặn API thống kê ADMIN; ADMIN đọc được thống kê/người dùng.
- Callback VNPay production với chữ ký sai trả HTTP 200 và `success=false`. Cloudinary Admin API chấp nhận cấu hình `.env` ở yêu cầu GET chỉ đọc.
- Trình duyệt production: menu tải đủ 22 món; lọc danh mục và tăng/giảm số lượng giỏ hàng hoạt động. Sơ đồ bàn tải đủ 10 bàn; lọc tầng và mở modal QR T01 hoạt động. Trang QR T01 hiển thị bàn, trạng thái, thực đơn và giỏ món. Mã bàn sai hiển thị thông báo “Bàn ăn không tồn tại”.
- H2: đăng ký tài khoản mới trả HTTP 201 và đăng nhập trả HTTP 200 với role CUSTOMER; đăng ký trùng, số lượng món bằng 0, mã món không tồn tại và đặt trùng khung giờ bị từ chối. Trên UI production, trợ lý AI trả gợi ý nhưng bộ mặc định 4 khách có tổng 697.000₫, lặp món Cơm niêu; thêm mâm vào giỏ làm việc.
- Luồng nhân viên cục bộ đã chuyển trạng thái đơn và thu tiền mặt; PDF invoice sinh được. Spring Email gửi xác nhận thành công qua Gmail SMTP trên H2 (`emailSent=true`). VNPay Sandbox hoàn tất thanh toán 45.000₫ bằng thẻ test; callback service H2 cập nhật đơn thành `PAID/COMPLETED`. H2 CRUD: ADMIN tạo/sửa/xóa món và bàn thành công; CUSTOMER bị chặn API quản trị với HTTP 403.
- `npm run verify`: 48 kiểm thử backend, 0 lỗi; TypeScript và frontend build thành công. `npm --prefix frontend test`: 3/3 kiểm thử đạt.

## Chưa được xác minh end-to-end

- Đăng nhập Google với credential Google thật; hiện backend chưa xác minh chữ ký token và đang có lỗi P0.
- Đã hoàn tất một giao dịch VNPay Sandbox trên đơn H2 45.000₫: tạo URL bằng cấu hình `.env`, xác minh HMAC-SHA512 độc lập, mở trang `sandbox.vnpayment.vn`, chọn NCB, dùng thẻ/OTP test chính thức và nhận callback tại booking service H2; truy vấn sau callback trả `paymentStatus=PAID`, `status=COMPLETED`. Không có tiền thật hay ghi DB production. `.env` vẫn đặt `VNPAY_RETURN_URL` về localhost frontend, nên callback production qua Internet chưa được xác minh. Callback chữ ký hợp lệ/sai tiền đã mô phỏng trên H2; lỗi sai tiền là P1 phía trên.
- SMTP Gmail đã được kiểm tra qua luồng Spring Email với dữ liệu H2 riêng: tạo đơn 45.000₫ trả `emailSent=true`; SMTP chấp nhận gửi tới `zaikaman123@gmail.com` và các alias QA cùng hộp thư. Chưa thể xác nhận email đã vào Inbox/Spam vì không mở được hộp thư của người dùng.
- Chưa upload ảnh Cloudinary. Lệnh thử upload ảnh qua API cục bộ và xóa asset ngay sau đó bị công cụ thực thi từ chối theo policy trước khi gửi yêu cầu; không tạo asset.
- Kiểm thử responsive nhiều kích thước màn hình và gửi các thao tác tạo/sửa/xóa từ biểu mẫu UI trong môi trường H2. Browser automation hiện bị Work settings chặn (`Local browser use is disabled`); các route chính đã được mở ở lượt trước nhưng chưa kiểm tra đa viewport. Kiểm tra mã tĩnh thấy 163 vị trí dùng breakpoint/utility responsive trong 20 component; đây chưa phải bằng chứng render ở các viewport. PowerShell xác nhận trang Vercel hiện trả HTTP 200. Các thao tác ghi production không được thực hiện.

## Trạng thái workspace

Không sửa mã nguồn và không tạo commit. Nhánh hiện tại là `main`; file báo cáo QA mới `docs/QA_REPORT.md` đang chưa được track. `.env` bị `.gitignore` bỏ qua và không được Git theo dõi. Các service H2 tạm thời đã dừng, các cổng kiểm thử 8081–8083 và 8181–8183 đã đóng. Các kết quả QA không đồng nghĩa hệ thống production đã được sửa hoặc đã an toàn để phát hành.




