package com.restaurant.catalog.controller;

import com.restaurant.catalog.dto.AiRecommendationRequest;
import com.restaurant.catalog.dto.AiRecommendationResponse;
import com.restaurant.catalog.service.AiRecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller phục vụ Trợ lý AI gợi ý mâm cơm Bếp Việt tối ưu cho thực khách.
 */
@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    /**
     * Gợi ý mâm cơm truyền thống theo số người, ngân sách và sở thích.
     */
    @PostMapping("/ai-recommend")
    public ResponseEntity<AiRecommendationResponse> getMealRecommendation(
            @RequestBody(required = false) AiRecommendationRequest request
    ) {
        AiRecommendationResponse response = aiRecommendationService.recommendVietnameseMeal(request);
        return ResponseEntity.ok(response);
    }
}
