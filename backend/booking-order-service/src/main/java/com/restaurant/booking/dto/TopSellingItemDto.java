package com.restaurant.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO dữ liệu món ăn bán chạy nhất.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopSellingItemDto {
    private String name;
    private Long quantity;
    private BigDecimal revenue;
}
