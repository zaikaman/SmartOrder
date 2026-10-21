package com.restaurant.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO phản hồi thống kê tổng quan doanh thu của hệ thống nhà hàng.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatisticsResponse {
    private BigDecimal totalRevenue;
    private Long completedOrdersCount;
    private Long totalOrdersCount;
    private List<DateRevenueDto> revenueByDate;
    private List<DateRevenueDto> revenueByMonth;
    private List<TopSellingItemDto> topSellingItems;
}
