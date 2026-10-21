package com.restaurant.catalog.dto;

import com.restaurant.catalog.entity.TableStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO yêu cầu thêm hoặc cập nhật thông tin bàn ăn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiningTableRequest {

    @NotBlank(message = "Số hiệu bàn không được để trống")
    private String tableNumber;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa bàn phải tối thiểu 1 người")
    private Integer capacity;

    @NotBlank(message = "Khu vực bàn không được để trống")
    private String area;

    private TableStatus status;
}
