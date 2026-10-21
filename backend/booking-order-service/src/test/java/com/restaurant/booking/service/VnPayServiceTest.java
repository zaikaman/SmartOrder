package com.restaurant.booking.service;

import com.restaurant.booking.client.CatalogTableClient;
import com.restaurant.booking.dto.PaymentCallbackResultDto;
import com.restaurant.booking.dto.VnPayCreatePaymentResponse;
import com.restaurant.booking.entity.OrderStatus;
import com.restaurant.booking.entity.PaymentMethod;
import com.restaurant.booking.entity.PaymentStatus;
import com.restaurant.booking.entity.ReservationOrder;
import com.restaurant.booking.repository.ReservationOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VnPayServiceTest {

    @Mock
    private ReservationOrderRepository orderRepository;

    @Mock
    private CatalogTableClient catalogTableClient;

    @InjectMocks
    private VnPayService vnPayService;

    private ReservationOrder mockOrder;
    private final String secretKey = "TEST_SECRET_KEY_FOR_HMAC_SHA512_TESTING_123456";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(vnPayService, "tmnCode", "DEMOV210");
        ReflectionTestUtils.setField(vnPayService, "hashSecret", secretKey);
        ReflectionTestUtils.setField(vnPayService, "payUrl", "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        ReflectionTestUtils.setField(vnPayService, "returnUrl", "http://localhost:5173/payment/vnpay-return");

        mockOrder = ReservationOrder.builder()
                .id(1L)
                .orderCode("BV2026101401")
                .userId(1L)
                .customerName("Nguyen Van A")
                .customerEmail("customer@bepviet.vn")
                .customerPhone("0901234567")
                .tableId(2L)
                .tableNumber("Bàn 02")
                .reservationTime(Instant.now())
                .partySize(4)
                .totalAmount(new BigDecimal("250000.00"))
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.VNPAY)
                .paymentStatus(PaymentStatus.UNPAID)
                .items(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Tạo URL thanh toán VNPAY thành công và chứa đầy đủ tham số cùng chữ ký")
    void testCreatePaymentUrlSuccess() {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(ReservationOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VnPayCreatePaymentResponse response = vnPayService.createPaymentUrl(1L, "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getPaymentUrl()).contains("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        assertThat(response.getPaymentUrl()).contains("vnp_TmnCode=DEMOV210");
        assertThat(response.getPaymentUrl()).contains("vnp_Amount=25000000"); // 250,000 VND * 100
        assertThat(response.getPaymentUrl()).contains("vnp_SecureHash=");
        assertThat(response.getOrderCode()).isEqualTo("BV2026101401");
        assertThat(response.getAmount()).isEqualByComparingTo(new BigDecimal("250000.00"));

        verify(orderRepository).save(mockOrder);
        assertThat(mockOrder.getVnpTxnRef()).isNotNull();
    }

    @Test
    @DisplayName("Tạo URL thanh toán ném ngoại lệ khi đơn hàng có tổng tiền bằng 0")
    void testCreatePaymentUrlWithZeroAmount() {
        mockOrder.setTotalAmount(BigDecimal.ZERO);
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));

        assertThatThrownBy(() -> vnPayService.createPaymentUrl(1L, "127.0.0.1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("tổng tiền bằng 0");
    }

    @Test
    @DisplayName("Kiểm tra chữ ký HMAC-SHA512 hợp lệ khi nhận callback")
    void testVerifyCallbackValidSignature() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "25000000");
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_OrderInfo", "Thanh toan don dat ban BV2026101401");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TmnCode", "DEMOV210");
        params.put("vnp_TxnRef", "BV2026101401_12345");

        // Tạo chữ ký mẫu với cùng secret key
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < keys.size(); i++) {
            String k = keys.get(i);
            String v = params.get(k);
            sb.append(URLEncoder.encode(k, StandardCharsets.US_ASCII))
              .append('=')
              .append(URLEncoder.encode(v, StandardCharsets.US_ASCII));
            if (i < keys.size() - 1) sb.append('&');
        }
        String validHash = vnPayService.hmacSHA512(secretKey, sb.toString());
        params.put("vnp_SecureHash", validHash);

        boolean isValid = vnPayService.verifyCallback(params);
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Kiểm tra chữ ký HMAC-SHA512 sai lệch trả về false")
    void testVerifyCallbackInvalidSignature() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "25000000");
        params.put("vnp_TxnRef", "BV2026101401_12345");
        params.put("vnp_SecureHash", "invalid_hash_value_12345");

        boolean isValid = vnPayService.verifyCallback(params);
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Xử lý kết quả trả về VNPAY thành công cập nhật đơn sang PAID và giải phóng bàn")
    void testProcessPaymentReturnSuccess() {
        String txnRef = "BV2026101401_99999";
        mockOrder.setVnpTxnRef(txnRef);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "25000000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TransactionNo", "14859234");
        params.put("vnp_TxnRef", txnRef);

        // Tính chữ ký hợp lệ
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < keys.size(); i++) {
            String k = keys.get(i);
            String v = params.get(k);
            sb.append(URLEncoder.encode(k, StandardCharsets.US_ASCII))
              .append('=')
              .append(URLEncoder.encode(v, StandardCharsets.US_ASCII));
            if (i < keys.size() - 1) sb.append('&');
        }
        params.put("vnp_SecureHash", vnPayService.hmacSHA512(secretKey, sb.toString()));

        when(orderRepository.findByVnpTxnRef(txnRef)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(ReservationOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentCallbackResultDto result = vnPayService.processPaymentReturn(params);

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getOrderCode()).isEqualTo("BV2026101401");
        assertThat(mockOrder.getPaymentStatus()).isEqualTo(PaymentStatus.PAID);
        assertThat(mockOrder.getStatus()).isEqualTo(OrderStatus.COMPLETED);

        // Đảm bảo cập nhật giải phóng bàn AVAILABLE
        verify(catalogTableClient).updateTableStatus(2L, "AVAILABLE");
    }
}
