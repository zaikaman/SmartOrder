package com.restaurant.booking.service;

import com.restaurant.booking.entity.OrderItem;
import com.restaurant.booking.entity.OrderStatus;
import com.restaurant.booking.entity.PaymentMethod;
import com.restaurant.booking.entity.PaymentStatus;
import com.restaurant.booking.entity.ReservationOrder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class PdfInvoiceServiceTest {

    private PdfInvoiceService pdfInvoiceService;
    private ReservationOrder mockOrder;

    @BeforeEach
    void setUp() {
        pdfInvoiceService = new PdfInvoiceService();

        mockOrder = ReservationOrder.builder()
                .id(10L)
                .orderCode("BV2026101410")
                .userId(1L)
                .customerName("Trần Thị Hoa")
                .customerEmail("hoatran@gmail.com")
                .customerPhone("0987654321")
                .tableId(5L)
                .tableNumber("Bàn VIP 01")
                .reservationTime(Instant.now())
                .partySize(6)
                .totalAmount(new BigDecimal("680000.00"))
                .status(OrderStatus.COMPLETED)
                .paymentMethod(PaymentMethod.VNPAY)
                .paymentStatus(PaymentStatus.PAID)
                .vnpTxnRef("BV2026101410_1729000000")
                .note("Yêu cầu phục vụ đồ ăn nóng sốt")
                .items(new ArrayList<>())
                .build();

        OrderItem item1 = OrderItem.builder()
                .id(1L)
                .order(mockOrder)
                .menuItemId(1L)
                .menuItemName("Cơm Niêu Cá Kho Tộ")
                .unitPrice(new BigDecimal("120000.00"))
                .quantity(2)
                .subtotal(new BigDecimal("240000.00"))
                .note("Nhiều nước sốt")
                .build();

        OrderItem item2 = OrderItem.builder()
                .id(2L)
                .order(mockOrder)
                .menuItemId(2L)
                .menuItemName("Canh Cua Rau Đay Cà Pháo")
                .unitPrice(new BigDecimal("80000.00"))
                .quantity(1)
                .subtotal(new BigDecimal("80000.00"))
                .note("")
                .build();

        mockOrder.getItems().add(item1);
        mockOrder.getItems().add(item2);
    }

    @Test
    @DisplayName("Kết xuất hóa đơn PDF thành công trả về mảng byte hợp lệ với định dạng chuẩn PDF")
    void testGenerateInvoicePdfSuccess() {
        byte[] pdfBytes = pdfInvoiceService.generateInvoicePdf(mockOrder);

        assertThat(pdfBytes).isNotNull();
        assertThat(pdfBytes.length).isGreaterThan(500);

        // Kiểm tra PDF magic bytes "%PDF-"
        String header = new String(pdfBytes, 0, Math.min(pdfBytes.length, 10), StandardCharsets.US_ASCII);
        assertThat(header).startsWith("%PDF-");
    }

    @Test
    @DisplayName("Kết xuất hóa đơn PDF cho đơn không có món ăn kèm theo vẫn thành công")
    void testGenerateInvoicePdfWithoutItems() {
        mockOrder.setItems(List.of());
        mockOrder.setTotalAmount(BigDecimal.ZERO);

        byte[] pdfBytes = pdfInvoiceService.generateInvoicePdf(mockOrder);

        assertThat(pdfBytes).isNotNull();
        assertThat(pdfBytes.length).isGreaterThan(500);
        String header = new String(pdfBytes, 0, 5, StandardCharsets.US_ASCII);
        assertThat(header).isEqualTo("%PDF-");
    }

    @Test
    @DisplayName("Ném ngoại lệ IllegalArgumentException khi đơn hàng truyền vào là null")
    void testGenerateInvoicePdfNullOrderThrowsException() {
        assertThatThrownBy(() -> pdfInvoiceService.generateInvoicePdf(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("null");
    }
}
