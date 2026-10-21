package com.restaurant.catalog.dto;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO yêu cầu gợi ý thực đơn mâm cơm Bếp Việt từ Trợ lý AI.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRecommendationRequest {

    @Min(value = 1, message = "Số người ăn phải tối thiểu 1 người")
    private Integer partySize;

    private BigDecimal budget;

    private String preference; // TRADITIONAL, SEAFOOD, LIGHT, COZY, ALL

    private String note;
}
