package com.restaurant.booking.service;

import com.restaurant.booking.client.CatalogTableClient;
import com.restaurant.booking.dto.PaymentCallbackResultDto;
import com.restaurant.booking.dto.VnPayCreatePaymentResponse;
import com.restaurant.booking.entity.OrderStatus;
import com.restaurant.booking.entity.PaymentStatus;
import com.restaurant.booking.entity.ReservationOrder;
import com.restaurant.booking.repository.ReservationOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service xử lý tích hợp Cổng thanh toán VNPAY Sandbox theo chuẩn HMAC-SHA512.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VnPayService {

    private final ReservationOrderRepository orderRepository;
    private final CatalogTableClient catalogTableClient;

    @Value("${vnpay.tmn-code:DEMOV210}")
    private String tmnCode;

    @Value("${vnpay.hash-secret:RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ}")
    private String hashSecret;

    @Value("${vnpay.pay-url:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${vnpay.return-url:http://localhost:5173/payment/vnpay-return}")
    private String returnUrl;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    /**
     * Tạo URL thanh toán VNPAY Sandbox có chữ ký HMAC-SHA512 cho đơn đặt bàn / hóa đơn.
     */
    @Transactional
    public VnPayCreatePaymentResponse createPaymentUrl(Long orderId, String clientIp) {
        ReservationOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + orderId));

        if (order.getTotalAmount() == null || order.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Không thể tạo liên kết thanh toán cho đơn hàng có tổng tiền bằng 0 VND.");
        }

        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalArgumentException("Đơn hàng này đã được thanh toán thành công trước đó.");
        }

        // Tạo mã giao dịch tham chiếu duy nhất (TxnRef)
        String txnRef = order.getOrderCode() + "_" + System.currentTimeMillis();
        order.setVnpTxnRef(txnRef);
        orderRepository.save(order);

        // Số tiền theo đơn vị đồng x 100
        long amountInVndCents = order.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();

        ZonedDateTime now = ZonedDateTime.now(VIETNAM_ZONE);
        String createDate = now.format(DATE_FORMATTER);
        String expireDate = now.plusMinutes(15).format(DATE_FORMATTER);

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", tmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(amountInVndCents));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", txnRef);
        vnpParams.put("vnp_OrderInfo", "Thanh toan don dat ban " + order.getOrderCode());
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", returnUrl);
        vnpParams.put("vnp_IpAddr", (clientIp != null && !clientIp.isBlank()) ? clientIp : "127.0.0.1");
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);

        // Sắp xếp các tham số theo thứ tự bảng chữ cái A-Z
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                String encodedKey = URLEncoder.encode(fieldName, StandardCharsets.US_ASCII);
                String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII);

                hashData.append(encodedKey).append('=').append(encodedValue);
                query.append(encodedKey).append('=').append(encodedValue);

                if (i < fieldNames.size() - 1) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        // Tính toán chữ ký HMAC-SHA512
        String secureHash = hmacSHA512(hashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = payUrl + "?" + query.toString();
        log.info("Khởi tạo URL thanh toán VNPAY thành công cho đơn {}: TxnRef={}", order.getOrderCode(), txnRef);

        return VnPayCreatePaymentResponse.builder()
                .paymentUrl(paymentUrl)
                .orderCode(order.getOrderCode())
                .txnRef(txnRef)
                .amount(order.getTotalAmount())
                .message("Tạo URL thanh toán VNPAY thành công.")
                .build();
    }

    /**
     * Xác thực tính toàn vẹn của dữ liệu trả về từ VNPAY qua chữ ký HMAC-SHA512.
     */
    public boolean verifyCallback(Map<String, String> fields) {
        String vnpSecureHash = fields.get("vnp_SecureHash");
        if (vnpSecureHash == null || vnpSecureHash.isBlank()) {
            log.warn("Không tìm thấy vnp_SecureHash trong tham số callback");
            return false;
        }

        // Lọc các trường vnp_* ngoại trừ vnp_SecureHash và vnp_SecureHashType
        List<String> fieldNames = new ArrayList<>();
        for (String key : fields.keySet()) {
            if (key != null && key.startsWith("vnp_")
                    && !key.equals("vnp_SecureHash")
                    && !key.equals("vnp_SecureHashType")) {
                String val = fields.get(key);
                if (val != null && !val.isEmpty()) {
                    fieldNames.add(key);
                }
            }
        }
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = fields.get(fieldName);
            String encodedKey = URLEncoder.encode(fieldName, StandardCharsets.US_ASCII);
            String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII);

            hashData.append(encodedKey).append('=').append(encodedValue);
            if (i < fieldNames.size() - 1) {
                hashData.append('&');
            }
        }

        String calculatedHash = hmacSHA512(hashSecret, hashData.toString());
        boolean matched = calculatedHash.equalsIgnoreCase(vnpSecureHash);

        if (!matched) {
            log.warn("Chữ ký VNPAY không khớp. Tính toán: {}, VNPAY gửi: {}", calculatedHash, vnpSecureHash);
        }

        return matched;
    }

    /**
     * Xử lý kết quả trả về từ VNPAY callback và cập nhật trạng thái đơn hàng.
     */
    @Transactional
    public PaymentCallbackResultDto processPaymentReturn(Map<String, String> params) {
        boolean isValidSignature = verifyCallback(params);
        if (!isValidSignature) {
            return PaymentCallbackResultDto.builder()
                    .success(false)
                    .message("Xác thực chữ ký HMAC-SHA512 không thành công. Dữ liệu giao dịch có thể đã bị sửa đổi.")
                    .build();
        }

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");
        String bankCode = params.get("vnp_BankCode");
        String payDate = params.get("vnp_PayDate");
        String rawAmount = params.get("vnp_Amount");

        BigDecimal amount = BigDecimal.ZERO;
        if (rawAmount != null && !rawAmount.isBlank()) {
            amount = new BigDecimal(rawAmount).divide(BigDecimal.valueOf(100));
        }

        // Tìm đơn hàng tương ứng theo TxnRef hoặc cắt tiền tố orderCode
        ReservationOrder order = orderRepository.findByVnpTxnRef(txnRef)
                .orElseGet(() -> {
                    if (txnRef != null && txnRef.contains("_")) {
                        String orderCode = txnRef.substring(0, txnRef.indexOf('_'));
                        return orderRepository.findByOrderCode(orderCode).orElse(null);
                    }
                    return null;
                });

        if (order == null) {
            log.error("Không tìm thấy đơn hàng với TxnRef={}", txnRef);
            return PaymentCallbackResultDto.builder()
                    .success(false)
                    .txnRef(txnRef)
                    .responseCode(responseCode)
                    .message("Không tìm thấy đơn hàng tương ứng với mã giao dịch VNPAY.")
                    .build();
        }

        // Đảm bảo tính Idempotency: nếu đơn đã được xác nhận thanh toán trước đó, giữ nguyên trạng thái thành công
        if (order.getPaymentStatus() == PaymentStatus.PAID) {
            log.info("Đơn hàng {} đã được xác nhận thanh toán trước đó (Idempotent callback)", order.getOrderCode());
            return PaymentCallbackResultDto.builder()
                    .success(true)
                    .orderCode(order.getOrderCode())
                    .txnRef(txnRef)
                    .amount(amount)
                    .responseCode("00")
                    .transactionNo(transactionNo)
                    .bankCode(bankCode)
                    .payDate(payDate)
                    .message("Giao dịch đã được ghi nhận thanh toán thành công trước đó.")
                    .build();
        }

        boolean success = "00".equals(responseCode);
        String explanation = getResponseMessage(responseCode);

        if (success) {
            order.setPaymentStatus(PaymentStatus.PAID);
            order.setStatus(OrderStatus.COMPLETED);
            orderRepository.save(order);

            // Tự động giải phóng bàn khi đơn hàng đã hoàn tất thanh toán
            try {
                catalogTableClient.updateTableStatus(order.getTableId(), "AVAILABLE");
            } catch (Exception ex) {
                log.warn("Không thể cập nhật trạng thái bàn sang AVAILABLE sau khi thanh toán VNPAY: {}", ex.getMessage());
            }

            log.info("Thanh toán VNPAY thành công cho đơn {}: Số tiền {} VND", order.getOrderCode(), amount);
        } else {
            order.setPaymentStatus(PaymentStatus.FAILED);
            orderRepository.save(order);
            log.warn("Thanh toán VNPAY thất bại cho đơn {}: responseCode={}, lý do: {}", order.getOrderCode(), responseCode, explanation);
        }

        return PaymentCallbackResultDto.builder()
                .success(success)
                .orderCode(order.getOrderCode())
                .txnRef(txnRef)
                .amount(amount)
                .responseCode(responseCode)
                .transactionNo(transactionNo)
                .bankCode(bankCode)
                .payDate(payDate)
                .message(explanation)
                .build();
    }

    /**
     * Thuật toán băm HMAC-SHA512 theo chuẩn của VNPAY.
     */
    public String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception ex) {
            throw new IllegalStateException("Lỗi khi tính toán HMAC-SHA512", ex);
        }
    }

    /**
     * Chuyển đổi mã phản hồi VNPAY sang thông điệp tiếng Việt thân thiện.
     */
    private String getResponseMessage(String responseCode) {
        if (responseCode == null) return "Mã kết quả không xác định.";
        return switch (responseCode) {
            case "00" -> "Giao dịch thanh toán thành công.";
            case "07" -> "Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, gian lận).";
            case "09" -> "Thẻ hoặc tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.";
            case "10" -> "Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.";
            case "11" -> "Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.";
            case "12" -> "Thẻ hoặc tài khoản của quý khách đang bị khóa.";
            case "13" -> "Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).";
            case "24" -> "Giao dịch không thành công do quý khách đã hủy thanh toán.";
            case "51" -> "Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.";
            case "65" -> "Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.";
            case "75" -> "Ngân hàng thanh toán đang thực hiện bảo trì hệ thống.";
            case "79" -> "Nhập sai mật khẩu thanh toán quá số lần quy định.";
            default -> "Giao dịch không thành công hoặc xảy ra lỗi kỹ thuật (Mã: " + responseCode + ").";
        };
    }
}
