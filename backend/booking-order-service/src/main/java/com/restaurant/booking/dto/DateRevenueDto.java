package com.restaurant.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO dữ liệu doanh thu theo ngày hoặc tháng.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DateRevenueDto {
    private String period; // YYYY-MM-DD hoặc YYYY-MM
    private BigDecimal revenue;
    private Long orderCount;
}
