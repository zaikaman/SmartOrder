package com.restaurant.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDto {

    private Long id;
    private Long menuItemId;
    private String menuItemName;
    private BigDecimal unitPrice;
    private int quantity;
    private BigDecimal subtotal;
    private String note;
}
