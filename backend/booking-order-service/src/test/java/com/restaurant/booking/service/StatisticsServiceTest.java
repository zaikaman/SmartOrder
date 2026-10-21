package com.restaurant.booking.service;

import com.restaurant.booking.dto.RevenueStatisticsResponse;
import com.restaurant.booking.entity.OrderStatus;
import com.restaurant.booking.entity.PaymentMethod;
import com.restaurant.booking.entity.PaymentStatus;
import com.restaurant.booking.entity.ReservationOrder;
import com.restaurant.booking.repository.OrderItemRepository;
import com.restaurant.booking.repository.ReservationOrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatisticsServiceTest {

    @Mock
    private ReservationOrderRepository orderRepository;

    @Mock
    private OrderItemRepository orderItemRepository;

    @InjectMocks
    private StatisticsService statisticsService;

    @Test
    @DisplayName("Tính toán chính xác tổng doanh thu, số đơn hoàn thành và nhóm theo thời gian")
    void testGetRevenueStatisticsSuccess() {
        Instant now = Instant.parse("2026-10-15T10:00:00Z");

        ReservationOrder order1 = ReservationOrder.builder()
                .id(1L)
                .orderCode("ORD-001")
                .totalAmount(new BigDecimal("350000"))
                .status(OrderStatus.COMPLETED)
                .paymentStatus(PaymentStatus.PAID)
                .paymentMethod(PaymentMethod.VNPAY)
                .createdAt(now)
                .build();

        ReservationOrder order2 = ReservationOrder.builder()
                .id(2L)
                .orderCode("ORD-002")
                .totalAmount(new BigDecimal("250000"))
                .status(OrderStatus.COMPLETED)
                .paymentStatus(PaymentStatus.PAID)
                .paymentMethod(PaymentMethod.CASH)
                .createdAt(now)
                .build();

        ReservationOrder order3 = ReservationOrder.builder()
                .id(3L)
                .orderCode("ORD-003")
                .totalAmount(new BigDecimal("150000"))
                .status(OrderStatus.CANCELLED)
                .paymentStatus(PaymentStatus.FAILED)
                .paymentMethod(PaymentMethod.VNPAY)
                .createdAt(now)
                .build();

        when(orderRepository.findAll()).thenReturn(List.of(order1, order2, order3));

        List<Object[]> rawTopSelling = new ArrayList<>();
        rawTopSelling.add(new Object[]{"Phở Bò Tái Lăn", 15L, new BigDecimal("1350000")});
        rawTopSelling.add(new Object[]{"Bún Chả Hà Nội", 10L, new BigDecimal("850000")});

        when(orderItemRepository.findTopSellingItems()).thenReturn(rawTopSelling);

        RevenueStatisticsResponse response = statisticsService.getRevenueStatistics();

        assertNotNull(response);
        assertEquals(new BigDecimal("600000"), response.getTotalRevenue());
        assertEquals(2L, response.getCompletedOrdersCount());
        assertEquals(3L, response.getTotalOrdersCount());

        assertFalse(response.getRevenueByDate().isEmpty());
        assertEquals(new BigDecimal("600000"), response.getRevenueByDate().get(0).getRevenue());

        assertFalse(response.getRevenueByMonth().isEmpty());
        assertEquals(new BigDecimal("600000"), response.getRevenueByMonth().get(0).getRevenue());

        assertEquals(2, response.getTopSellingItems().size());
        assertEquals("Phở Bò Tái Lăn", response.getTopSellingItems().get(0).getName());
        assertEquals(15L, response.getTopSellingItems().get(0).getQuantity());
        assertEquals(new BigDecimal("1350000"), response.getTopSellingItems().get(0).getRevenue());
    }

    @Test
    @DisplayName("Tính toán doanh thu khi chưa có đơn hàng nào hoàn thành")
    void testGetRevenueStatisticsEmpty() {
        when(orderRepository.findAll()).thenReturn(List.of());
        when(orderItemRepository.findTopSellingItems()).thenReturn(List.of());

        RevenueStatisticsResponse response = statisticsService.getRevenueStatistics();

        assertNotNull(response);
        assertEquals(BigDecimal.ZERO, response.getTotalRevenue());
        assertEquals(0L, response.getCompletedOrdersCount());
        assertEquals(0L, response.getTotalOrdersCount());
        assertTrue(response.getRevenueByDate().isEmpty());
        assertTrue(response.getRevenueByMonth().isEmpty());
        assertTrue(response.getTopSellingItems().isEmpty());
    }
}
