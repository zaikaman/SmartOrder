package com.restaurant.booking.controller;

import com.restaurant.booking.dto.RevenueStatisticsResponse;
import com.restaurant.booking.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller phục vụ các API thống kê báo cáo doanh thu dành riêng cho Quản trị viên (ADMIN).
 */
@RestController
@RequestMapping("/api/v1/admin/statistics")
@RequiredArgsConstructor
public class AdminStatisticsController {

    private final StatisticsService statisticsService;

    /**
     * Lấy báo cáo thống kê doanh thu, đơn hàng và top món bán chạy.
     */
    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RevenueStatisticsResponse> getRevenueStatistics() {
        RevenueStatisticsResponse response = statisticsService.getRevenueStatistics();
        return ResponseEntity.ok(response);
    }
}
