package com.restaurant.booking.service;

import com.restaurant.booking.dto.DateRevenueDto;
import com.restaurant.booking.dto.RevenueStatisticsResponse;
import com.restaurant.booking.dto.TopSellingItemDto;
import com.restaurant.booking.entity.OrderStatus;
import com.restaurant.booking.entity.ReservationOrder;
import com.restaurant.booking.repository.OrderItemRepository;
import com.restaurant.booking.repository.ReservationOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service tính toán và tổng hợp số liệu thống kê doanh thu cho Quản trị viên.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StatisticsService {

    private final ReservationOrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd").withZone(VIETNAM_ZONE);
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM").withZone(VIETNAM_ZONE);

    @Transactional(readOnly = true)
    public RevenueStatisticsResponse getRevenueStatistics() {
        List<ReservationOrder> allOrders = orderRepository.findAll();

        List<ReservationOrder> completedOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .toList();

        BigDecimal totalRevenue = completedOrders.stream()
                .map(ReservationOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long completedCount = completedOrders.size();
        long totalCount = allOrders.size();

        // Gom nhóm doanh thu theo ngày
        Map<String, List<ReservationOrder>> ordersByDate = completedOrders.stream()
                .filter(o -> o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(o -> DATE_FORMATTER.format(o.getCreatedAt()), TreeMap::new, Collectors.toList()));

        List<DateRevenueDto> revenueByDate = ordersByDate.entrySet().stream()
                .map(entry -> {
                    BigDecimal dailyRevenue = entry.getValue().stream()
                            .map(ReservationOrder::getTotalAmount)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return DateRevenueDto.builder()
                            .period(entry.getKey())
                            .revenue(dailyRevenue)
                            .orderCount((long) entry.getValue().size())
                            .build();
                })
                .collect(Collectors.toList());

        // Gom nhóm doanh thu theo tháng
        Map<String, List<ReservationOrder>> ordersByMonth = completedOrders.stream()
                .filter(o -> o.getCreatedAt() != null)
                .collect(Collectors.groupingBy(o -> MONTH_FORMATTER.format(o.getCreatedAt()), TreeMap::new, Collectors.toList()));

        List<DateRevenueDto> revenueByMonth = ordersByMonth.entrySet().stream()
                .map(entry -> {
                    BigDecimal monthlyRevenue = entry.getValue().stream()
                            .map(ReservationOrder::getTotalAmount)
                            .filter(Objects::nonNull)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return DateRevenueDto.builder()
                            .period(entry.getKey())
                            .revenue(monthlyRevenue)
                            .orderCount((long) entry.getValue().size())
                            .build();
                })
                .collect(Collectors.toList());

        // Lấy danh sách Top món ăn bán chạy
        List<TopSellingItemDto> topSellingItems = new ArrayList<>();
        try {
            List<Object[]> rawTopItems = orderItemRepository.findTopSellingItems();
            if (rawTopItems != null) {
                for (Object[] row : rawTopItems) {
                    if (row != null && row.length >= 3) {
                        String itemName = row[0] != null ? row[0].toString() : "Chưa xác định";
                        Long quantity = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                        BigDecimal revenue = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;

                        topSellingItems.add(TopSellingItemDto.builder()
                                .name(itemName)
                                .quantity(quantity)
                                .revenue(revenue)
                                .build());
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Lỗi khi truy vấn danh sách món ăn bán chạy: {}", ex.getMessage());
        }

        return RevenueStatisticsResponse.builder()
                .totalRevenue(totalRevenue)
                .completedOrdersCount(completedCount)
                .totalOrdersCount(totalCount)
                .revenueByDate(revenueByDate)
                .revenueByMonth(revenueByMonth)
                .topSellingItems(topSellingItems)
                .build();
    }
}
