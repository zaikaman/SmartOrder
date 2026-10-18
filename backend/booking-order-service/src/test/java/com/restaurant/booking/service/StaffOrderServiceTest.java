package com.restaurant.booking.service;

import com.restaurant.booking.client.CatalogTableClient;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StaffOrderServiceTest {

    @Mock
    private ReservationOrderRepository orderRepository;

    @Mock
    private CatalogTableClient catalogTableClient;

    @Mock
    private EmailNotificationService emailNotificationService;

    @InjectMocks
    private BookingOrderService bookingOrderService;

    private ReservationOrder mockOrder;

    @BeforeEach
    void setUp() {
        mockOrder = ReservationOrder.builder()
                .id(10L)
                .orderCode("BV2026101801")
                .userId(1L)
                .customerName("Nguyen Van A")
                .tableId(5L)
                .tableNumber("Ban 05")
                .reservationTime(Instant.now().plusSeconds(3600))
                .partySize(4)
                .status(OrderStatus.PENDING)
                .paymentMethod(PaymentMethod.VNPAY)
                .paymentStatus(PaymentStatus.UNPAID)
                .totalAmount(BigDecimal.valueOf(250000))
                .build();
    }

    @Test
    @DisplayName("Nhân viên cập nhật đơn sang PREPARING và cập nhật trạng thái bàn OCCUPIED")
    void testUpdateOrderStatusToPreparing() {
        when(orderRepository.findById(10L)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(ReservationOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderDto result = bookingOrderService.updateOrderStatus(10L, OrderStatus.PREPARING);

        assertNotNull(result);
        assertEquals(OrderStatus.PREPARING, result.getStatus());
        verify(catalogTableClient).updateTableStatus(5L, "OCCUPIED");
        verify(orderRepository).save(mockOrder);
    }

    @Test
    @DisplayName("Nhân viên cập nhật đơn sang COMPLETED và tự động giải phóng bàn về AVAILABLE")
    void testUpdateOrderStatusToCompleted() {
        mockOrder.setStatus(OrderStatus.SERVED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(ReservationOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderDto result = bookingOrderService.updateOrderStatus(10L, OrderStatus.COMPLETED);

        assertNotNull(result);
        assertEquals(OrderStatus.COMPLETED, result.getStatus());
        verify(catalogTableClient).updateTableStatus(5L, "AVAILABLE");
    }

    @Test
    @DisplayName("Nhân viên thu tiền mặt tại quầy cập nhật PAID, COMPLETED và giải phóng bàn")
    void testPayCashSuccess() {
        mockOrder.setStatus(OrderStatus.SERVED);
        when(orderRepository.findById(10L)).thenReturn(Optional.of(mockOrder));
        when(orderRepository.save(any(ReservationOrder.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderDto result = bookingOrderService.payCash(10L);

        assertNotNull(result);
        assertEquals(PaymentMethod.CASH, result.getPaymentMethod());
        assertEquals(PaymentStatus.PAID, result.getPaymentStatus());
        assertEquals(OrderStatus.COMPLETED, result.getStatus());
        verify(catalogTableClient).updateTableStatus(5L, "AVAILABLE");
    }

    @Test
    @DisplayName("Nhân viên lọc danh sách đơn theo trạng thái PREPARING")
    void testGetStaffOrdersWithFilter() {
        mockOrder.setStatus(OrderStatus.PREPARING);
        when(orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.PREPARING))
                .thenReturn(List.of(mockOrder));

        List<OrderDto> orders = bookingOrderService.getStaffOrders(OrderStatus.PREPARING);

        assertNotNull(orders);
        assertEquals(1, orders.size());
        assertEquals(OrderStatus.PREPARING, orders.get(0).getStatus());
    }
}
