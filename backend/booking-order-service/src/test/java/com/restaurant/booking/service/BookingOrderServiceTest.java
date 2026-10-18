package com.restaurant.booking.service;

import com.restaurant.booking.client.CatalogTableClient;
import com.restaurant.booking.dto.CreateOrderItemRequest;
import com.restaurant.booking.dto.CreateOrderRequest;
import com.restaurant.booking.dto.OrderDto;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingOrderServiceTest {

    @Mock
    private ReservationOrderRepository orderRepository;

    @Mock
    private CatalogTableClient catalogTableClient;

    @Mock
    private EmailNotificationService emailNotificationService;

    @InjectMocks
    private BookingOrderService bookingOrderService;

    private Instant testTime;

    @BeforeEach
    void setUp() {
        testTime = Instant.now().plus(1, ChronoUnit.DAYS);
    }

    @Test
    @DisplayName("Tạo đơn đặt bàn kèm gọi món thành công và tính đúng tổng tiền")
    void testCreateOrderSuccess() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .tableId(2L)
                .reservationTime(testTime)
                .partySize(4)
                .customerName("Nguyễn Văn A")
                .customerEmail("vana@gmail.com")
                .customerPhone("0987654321")
                .paymentMethod(PaymentMethod.VNPAY)
                .items(List.of(
                        CreateOrderItemRequest.builder()
                                .menuItemId(10L)
                                .quantity(2)
                                .build(),
                        CreateOrderItemRequest.builder()
                                .menuItemId(20L)
                                .quantity(1)
                                .build()
                ))
                .build();

        when(orderRepository.existsConflictingReservation(eq(2L), any(Instant.class), any(Instant.class)))
                .thenReturn(false);

        when(catalogTableClient.getTable(2L)).thenReturn(CatalogTableClient.TableInfo.builder()
                .id(2L)
                .tableNumber("Ban 02")
                .capacity(4)
                .build());

        when(catalogTableClient.getMenuItem(10L)).thenReturn(CatalogTableClient.MenuItemInfo.builder()
                .id(10L)
                .name("Cơm niêu cá kho tộ")
                .price(BigDecimal.valueOf(120000))
                .build());

        when(catalogTableClient.getMenuItem(20L)).thenReturn(CatalogTableClient.MenuItemInfo.builder()
                .id(20L)
                .name("Canh cua mồng tơi")
                .price(BigDecimal.valueOf(60000))
                .build());

        when(orderRepository.save(any(ReservationOrder.class))).thenAnswer(invocation -> {
            ReservationOrder o = invocation.getArgument(0);
            o.setId(100L);
            return o;
        });

        when(emailNotificationService.sendReservationConfirmationEmail(any(ReservationOrder.class))).thenReturn(true);

        OrderDto result = bookingOrderService.createOrder(1L, request);

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("Ban 02", result.getTableNumber());
        // 120.000 * 2 + 60.000 * 1 = 300.000
        assertEquals(BigDecimal.valueOf(300000), result.getTotalAmount());
        assertEquals(2, result.getItems().size());
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals(PaymentStatus.UNPAID, result.getPaymentStatus());
        verify(emailNotificationService).sendReservationConfirmationEmail(any(ReservationOrder.class));
    }

    @Test
    @DisplayName("Báo lỗi khi bàn đã bị đặt trùng trong khoảng 2 giờ")
    void testCreateOrderConflictThrowsException() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .tableId(2L)
                .reservationTime(testTime)
                .partySize(4)
                .build();

        when(orderRepository.existsConflictingReservation(eq(2L), any(Instant.class), any(Instant.class)))
                .thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bookingOrderService.createOrder(1L, request));

        assertTrue(ex.getMessage().contains("đã có khách đặt"));
        verify(orderRepository, never()).save(any(ReservationOrder.class));
    }
}
