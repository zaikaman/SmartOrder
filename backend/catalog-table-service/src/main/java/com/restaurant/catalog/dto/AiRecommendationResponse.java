package com.restaurant.catalog.dto;

import com.restaurant.catalog.entity.MenuItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO phản hồi gợi ý mâm cơm Bếp Việt từ Trợ lý AI.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiRecommendationResponse {

    private String comboTitle;
    private String description;
    private String culinaryPhilosophy;
    private BigDecimal totalEstimatedPrice;
    private Integer recommendedForPartySize;
    private List<MenuItem> items;
}
