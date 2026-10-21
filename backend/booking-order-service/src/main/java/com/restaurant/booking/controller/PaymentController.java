package com.restaurant.booking.controller;

import com.restaurant.booking.dto.PaymentCallbackResultDto;
import com.restaurant.booking.dto.VnPayCreatePaymentRequest;
import com.restaurant.booking.dto.VnPayCreatePaymentResponse;
import com.restaurant.booking.entity.ReservationOrder;
import com.restaurant.booking.repository.ReservationOrderRepository;
import com.restaurant.booking.service.PdfInvoiceService;
import com.restaurant.booking.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller xử lý thanh toán trực tuyến qua cổng VNPAY Sandbox và kết xuất hóa đơn PDF.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VnPayService vnPayService;
    private final PdfInvoiceService pdfInvoiceService;
    private final ReservationOrderRepository orderRepository;

    private Long getUserIdFromAuth(Authentication auth) {
        if (auth != null && auth.getCredentials() instanceof Long) {
            return (Long) auth.getCredentials();
        }
        return 1L;
    }

    private boolean isStaffOrAdmin(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> "ROLE_STAFF".equals(a.getAuthority()) || "ROLE_ADMIN".equals(a.getAuthority()));
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }

    /**
     * Tạo liên kết thanh toán VNPAY Sandbox có chữ ký số HMAC-SHA512.
     */
    @PostMapping("/api/v1/payments/vnpay/create-url")
    public ResponseEntity<VnPayCreatePaymentResponse> createPaymentUrl(
            Authentication authentication,
            @Valid @RequestBody VnPayCreatePaymentRequest request,
            HttpServletRequest servletRequest
    ) {
        Long userId = getUserIdFromAuth(authentication);
        boolean privileged = isStaffOrAdmin(authentication);

        ReservationOrder order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + request.getOrderId()));

        // Nếu là khách hàng bình thường thì chỉ được thanh toán cho đơn của chính mình
        if (!privileged && !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền thanh toán cho đơn hàng này.");
        }

        String ip = request.getIpAddress();
        if (ip == null || ip.isBlank()) {
            ip = getClientIp(servletRequest);
        }

        VnPayCreatePaymentResponse response = vnPayService.createPaymentUrl(request.getOrderId(), ip);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint tiếp nhận kết quả thanh toán từ VNPAY (cho phép truy cập công khai).
     */
    @GetMapping("/api/v1/payments/vnpay/return")
    public ResponseEntity<PaymentCallbackResultDto> handlePaymentReturn(@RequestParam Map<String, String> allParams) {
        log.info("Nhận callback phản hồi từ cổng thanh toán VNPAY: TxnRef={}", allParams.get("vnp_TxnRef"));
        PaymentCallbackResultDto result = vnPayService.processPaymentReturn(allParams);
        return ResponseEntity.ok(result);
    }

    /**
     * Kết xuất và tải hóa đơn điện tử PDF tiếng Việt có dấu cho đơn hàng.
     */
    @GetMapping({"/api/v1/orders/{id}/invoice.pdf", "/api/v1/payments/orders/{id}/invoice.pdf"})
    public ResponseEntity<byte[]> getInvoicePdf(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromAuth(authentication);
        boolean privileged = isStaffOrAdmin(authentication);

        ReservationOrder order = orderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng với ID: " + id));

        if (!privileged && !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Bạn không có quyền xem hóa đơn của đơn hàng này.");
        }

        byte[] pdfContent = pdfInvoiceService.generateInvoicePdf(order);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "invoice-" + order.getOrderCode() + ".pdf");
        headers.setContentLength(pdfContent.length);

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfContent);
    }
}
