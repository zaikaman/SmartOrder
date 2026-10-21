package com.restaurant.booking.controller;

import com.restaurant.booking.dto.PaymentCallbackResultDto;
import com.restaurant.booking.dto.VnPayCreatePaymentResponse;
import com.restaurant.booking.entity.OrderStatus;
import com.restaurant.booking.entity.PaymentMethod;
import com.restaurant.booking.entity.PaymentStatus;
import com.restaurant.booking.entity.ReservationOrder;
import com.restaurant.booking.repository.ReservationOrderRepository;
import com.restaurant.booking.security.JwtAuthenticationFilter;
import com.restaurant.booking.service.PdfInvoiceService;
import com.restaurant.booking.service.VnPayService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VnPayService vnPayService;

    @MockBean
    private PdfInvoiceService pdfInvoiceService;

    @MockBean
    private ReservationOrderRepository orderRepository;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    private ReservationOrder mockOrder;

    @BeforeEach
    void setUp() {
        mockOrder = ReservationOrder.builder()
                .id(1L)
                .orderCode("BV2026101401")
                .userId(1L)
                .customerName("Nguyen Van A")
                .customerEmail("customer@bepviet.vn")
                .customerPhone("0901234567")
                .tableId(1L)
                .tableNumber("Bàn 01")
                .reservationTime(Instant.now())
                .partySize(2)
                .totalAmount(new BigDecimal("350000.00"))
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.VNPAY)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();
    }

    @Test
    @DisplayName("API tạo URL thanh toán VNPAY trả về mã 200 và paymentUrl hợp lệ")
    @WithMockUser(username = "customer1", roles = "CUSTOMER")
    void testCreatePaymentUrlSuccess() throws Exception {
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));
        when(vnPayService.createPaymentUrl(eq(1L), any())).thenReturn(
                VnPayCreatePaymentResponse.builder()
                        .paymentUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?test=1")
                        .orderCode("BV2026101401")
                        .amount(new BigDecimal("350000.00"))
                        .message("Tạo URL thanh toán VNPAY thành công.")
                        .build()
        );

        String json = """
                {
                    "orderId": 1
                }
                """;

        mockMvc.perform(post("/api/v1/payments/vnpay/create-url")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentUrl").value("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?test=1"))
                .andExpect(jsonPath("$.orderCode").value("BV2026101401"));
    }

    @Test
    @DisplayName("API tiếp nhận callback VNPAY trả về kết quả thanh toán")
    void testHandlePaymentReturnSuccess() throws Exception {
        when(vnPayService.processPaymentReturn(any())).thenReturn(
                PaymentCallbackResultDto.builder()
                        .success(true)
                        .orderCode("BV2026101401")
                        .responseCode("00")
                        .message("Giao dịch thanh toán thành công.")
                        .build()
        );

        mockMvc.perform(get("/api/v1/payments/vnpay/return")
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_TxnRef", "BV2026101401_123")
                        .param("vnp_SecureHash", "hash123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.orderCode").value("BV2026101401"));
    }

    @Test
    @DisplayName("API xuất hóa đơn PDF trả về application/pdf và nội dung nhị phân")
    @WithMockUser(username = "customer1", roles = "CUSTOMER")
    void testGetInvoicePdfSuccess() throws Exception {
        byte[] dummyPdf = "%PDF-1.4 dummy content".getBytes();
        when(orderRepository.findById(1L)).thenReturn(Optional.of(mockOrder));
        when(pdfInvoiceService.generateInvoicePdf(mockOrder)).thenReturn(dummyPdf);

        mockMvc.perform(get("/api/v1/orders/1/invoice.pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", "form-data; name=\"inline\"; filename=\"invoice-BV2026101401.pdf\""))
                .andExpect(content().bytes(dummyPdf));
    }
}
