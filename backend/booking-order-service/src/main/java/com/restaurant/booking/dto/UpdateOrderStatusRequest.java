package com.restaurant.booking.dto;

import com.restaurant.booking.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Yêu cầu cập nhật trạng thái đơn hàng dành cho nhân viên / bếp.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOrderStatusRequest {

    @NotNull(message = "Trạng thái đơn hàng không được để trống")
    private OrderStatus status;
}
