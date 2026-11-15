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
import com.restaurant.booking.repository.TableReservationLockRepository;
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
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingOrderServiceTest {

    @Mock
    private ReservationOrderRepository orderRepository;

    @Mock
    private TableReservationLockRepository lockRepository;

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
                .status("AVAILABLE")
                .build());

        when(catalogTableClient.getMenuItem(10L)).thenReturn(CatalogTableClient.MenuItemInfo.builder()
                .id(10L)
                .name("Cơm niêu cá kho tộ")
                .price(BigDecimal.valueOf(120000))
                .status("AVAILABLE")
                .build());

        when(catalogTableClient.getMenuItem(20L)).thenReturn(CatalogTableClient.MenuItemInfo.builder()
                .id(20L)
                .name("Canh cua mồng tơi")
                .price(BigDecimal.valueOf(60000))
                .status("AVAILABLE")
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
        assertEquals(BigDecimal.valueOf(300000), result.getTotalAmount());
        assertEquals(2, result.getItems().size());
        assertEquals(OrderStatus.PENDING, result.getStatus());
        assertEquals(PaymentStatus.UNPAID, result.getPaymentStatus());
        verify(emailNotificationService).sendReservationConfirmationEmail(any(ReservationOrder.class));
        verify(catalogTableClient).updateTableStatus(2L, "RESERVED");
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

    @Test
    @DisplayName("Báo lỗi khi bàn ăn không tồn tại trong hệ thống")
    void testCreateOrderTableNotFound() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .tableId(999L)
                .reservationTime(testTime)
                .partySize(2)
                .build();

        when(orderRepository.existsConflictingReservation(eq(999L), any(Instant.class), any(Instant.class)))
                .thenReturn(false);
        when(catalogTableClient.getTable(999L))
                .thenThrow(new IllegalArgumentException("Không tìm thấy bàn ăn ID: 999"));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bookingOrderService.createOrder(1L, request));

        assertTrue(ex.getMessage().contains("Không tìm thấy bàn ăn ID: 999"));
        verify(orderRepository, never()).save(any(ReservationOrder.class));
    }

    @Test
    @DisplayName("Báo lỗi khi số lượng khách vượt quá sức chứa bàn")
    void testCreateOrderCapacityExceeded() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .tableId(1L)
                .reservationTime(testTime)
                .partySize(6)
                .build();

        when(orderRepository.existsConflictingReservation(eq(1L), any(Instant.class), any(Instant.class)))
                .thenReturn(false);
        when(catalogTableClient.getTable(1L)).thenReturn(CatalogTableClient.TableInfo.builder()
                .id(1L)
                .tableNumber("T01")
                .capacity(2)
                .status("AVAILABLE")
                .build());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bookingOrderService.createOrder(1L, request));

        assertTrue(ex.getMessage().contains("sức chứa tối đa"));
        verify(orderRepository, never()).save(any(ReservationOrder.class));
    }

    @Test
    @DisplayName("Báo lỗi khi bàn đang có khách ngồi OCCUPIED")
    void testCreateOrderTableOccupied() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .tableId(1L)
                .reservationTime(testTime)
                .partySize(2)
                .build();

        when(orderRepository.existsConflictingReservation(eq(1L), any(Instant.class), any(Instant.class)))
                .thenReturn(false);
        when(catalogTableClient.getTable(1L)).thenReturn(CatalogTableClient.TableInfo.builder()
                .id(1L)
                .tableNumber("T01")
                .capacity(2)
                .status("OCCUPIED")
                .build());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bookingOrderService.createOrder(1L, request));

        assertTrue(ex.getMessage().contains("hiện đang có khách ngồi (OCCUPIED)"));
        verify(orderRepository, never()).save(any(ReservationOrder.class));
    }

    @Test
    @DisplayName("Báo lỗi khi gọi món có trạng thái hết hàng OUT_OF_STOCK")
    void testCreateOrderItemOutOfStock() {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .tableId(1L)
                .reservationTime(testTime)
                .partySize(2)
                .items(List.of(
                        CreateOrderItemRequest.builder()
                                .menuItemId(10L)
                                .quantity(1)
                                .build()
                ))
                .build();

        when(orderRepository.existsConflictingReservation(eq(1L), any(Instant.class), any(Instant.class)))
                .thenReturn(false);
        when(catalogTableClient.getTable(1L)).thenReturn(CatalogTableClient.TableInfo.builder()
                .id(1L)
                .tableNumber("T01")
                .capacity(2)
                .status("AVAILABLE")
                .build());
        when(catalogTableClient.getMenuItem(10L)).thenReturn(CatalogTableClient.MenuItemInfo.builder()
                .id(10L)
                .name("Cơm niêu cá kho")
                .price(BigDecimal.valueOf(120000))
                .status("OUT_OF_STOCK")
                .build());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bookingOrderService.createOrder(1L, request));

        assertTrue(ex.getMessage().contains("đã hết món"));
        verify(orderRepository, never()).save(any(ReservationOrder.class));
    }
}
