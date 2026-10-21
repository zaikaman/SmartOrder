package com.restaurant.booking.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VnPayCreatePaymentRequest {

    @NotNull(message = "Mã định danh đơn hàng không được để trống")
    private Long orderId;

    private String ipAddress;
}
