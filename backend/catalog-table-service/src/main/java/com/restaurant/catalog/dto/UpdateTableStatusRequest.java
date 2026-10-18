package com.restaurant.catalog.dto;

import com.restaurant.catalog.entity.TableStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Yêu cầu cập nhật trạng thái bàn ăn dành cho nhân viên / hệ thống điều phối.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTableStatusRequest {

    @NotNull(message = "Trạng thái bàn không được để trống")
    private TableStatus status;
}
