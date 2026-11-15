package com.restaurant.booking.client;

import com.restaurant.booking.security.InternalTokenProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
@Slf4j
public class CatalogTableClient {

    private final RestClient catalogRestClient;
    private final InternalTokenProvider internalTokenProvider;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuItemInfo {
        private Long id;
        private String name;
        private BigDecimal price;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TableInfo {
        private Long id;
        private String tableNumber;
        private int capacity;
        private String area;
        private String status;
    }

    public MenuItemInfo getMenuItem(Long menuItemId) {
        try {
            return catalogRestClient.get()
                    .uri("/api/v1/menu/{id}", menuItemId)
                    .retrieve()
                    .body(MenuItemInfo.class);
        } catch (Exception ex) {
            log.error("Không thể lấy thông tin món ăn ID {}: {}", menuItemId, ex.getMessage());
            throw new IllegalArgumentException("Không tìm thấy món ăn ID: " + menuItemId);
        }
    }

    public TableInfo getTable(Long tableId) {
        try {
            TableInfo table = catalogRestClient.get()
                    .uri("/api/v1/tables/{id}", tableId)
                    .retrieve()
                    .body(TableInfo.class);
            if (table != null && table.getId() != null) {
                return table;
            }
        } catch (Exception ex) {
            log.warn("Không thể lấy chi tiết bàn ID {} qua /api/v1/tables/{id}: {}. Thử tìm từ danh sách bàn...", tableId, ex.getMessage());
        }

        try {
            TableInfo[] tables = catalogRestClient.get()
                    .uri("/api/v1/tables")
                    .retrieve()
                    .body(TableInfo[].class);
            if (tables != null) {
                for (TableInfo t : tables) {
                    if (t.getId() != null && t.getId().equals(tableId)) {
                        return t;
                    }
                }
            }
        } catch (Exception ex) {
            log.error("Lỗi khi lấy danh sách bàn ăn: {}", ex.getMessage());
        }

        throw new IllegalArgumentException("Không tìm thấy bàn ăn ID: " + tableId);
    }

    public boolean updateTableStatus(Long tableId, String status) {
        if (tableId == null || status == null || status.isBlank()) {
            log.warn("tableId hoặc status không hợp lệ để cập nhật trạng thái bàn: id={}, status={}", tableId, status);
            return false;
        }

        String normalizedStatus = status.trim().toUpperCase();
        String bearerToken = internalTokenProvider != null ? internalTokenProvider.getOrGenerateBearerToken() : null;

        // 1. Thử gọi endpoint nội bộ /api/v1/internal/tables/{id}/status
        try {
            var request = catalogRestClient.patch()
                    .uri("/api/v1/internal/tables/{id}/status", tableId)
                    .body(java.util.Map.of("status", normalizedStatus));

            if (bearerToken != null) {
                request.header("Authorization", bearerToken);
            }
            request.header("X-Internal-Service", "booking-order-service");

            request.retrieve().toBodilessEntity();
            log.info("Cập nhật thành công trạng thái bàn ID {} sang {} (internal)", tableId, normalizedStatus);
            return true;
        } catch (Exception ex) {
            log.warn("Không thể cập nhật trạng thái bàn ID {} qua internal endpoint: {}. Thử qua staff endpoint...", tableId, ex.getMessage());
        }

        // 2. Dự phòng gọi endpoint nhân viên /api/v1/staff/tables/{id}/status kèm Authorization header hợp lệ
        try {
            var request = catalogRestClient.patch()
                    .uri("/api/v1/staff/tables/{id}/status", tableId)
                    .body(java.util.Map.of("status", normalizedStatus));

            if (bearerToken != null) {
                request.header("Authorization", bearerToken);
            }
            request.header("X-Internal-Service", "booking-order-service");

            request.retrieve().toBodilessEntity();
            log.info("Cập nhật thành công trạng thái bàn ID {} sang {} (staff)", tableId, normalizedStatus);
            return true;
        } catch (Exception ex) {
            log.error("Không thể cập nhật trạng thái bàn ID {} qua Catalog Service: {}", tableId, ex.getMessage());
            return false;
        }
    }
}

