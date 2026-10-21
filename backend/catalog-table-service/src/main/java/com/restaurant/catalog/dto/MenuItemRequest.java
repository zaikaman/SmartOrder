package com.restaurant.catalog.dto;

import com.restaurant.catalog.entity.MenuItemStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO yêu cầu thêm hoặc cập nhật món ăn trong thực đơn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemRequest {

    @NotBlank(message = "Tên món ăn không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá món ăn không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Giá món ăn phải lớn hơn 0")
    private BigDecimal price;

    @NotBlank(message = "Danh mục món ăn không được để trống")
    private String category;

    private String imageUrl;

    private MenuItemStatus status;
}
