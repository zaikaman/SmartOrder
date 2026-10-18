package com.restaurant.booking.client;

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
            TableInfo[] tables = catalogRestClient.get()
                    .uri("/api/v1/tables")
                    .retrieve()
                    .body(TableInfo[].class);
            if (tables != null) {
                for (TableInfo t : tables) {
                    if (t.getId().equals(tableId)) {
                        return t;
                    }
                }
            }
            throw new IllegalArgumentException("Không tìm thấy bàn ăn ID: " + tableId);
        } catch (Exception ex) {
            log.error("Lỗi khi lấy thông tin bàn ăn ID {}: {}", tableId, ex.getMessage());
            // Fallback khi catalog table service chưa bật trong môi trường mock/test
            throw new IllegalArgumentException("Không tìm thấy bàn ăn ID: " + tableId);
        }
    }

    public void updateTableStatus(Long tableId, String status) {
        try {
            catalogRestClient.patch()
                    .uri("/api/v1/staff/tables/{id}/status", tableId)
                    .body(java.util.Map.of("status", status))
                    .retrieve()
                    .toBodilessEntity();
            log.info("Cập nhật thành công trạng thái bàn ID {} sang {}", tableId, status);
        } catch (Exception ex) {
            log.warn("Không thể cập nhật trạng thái bàn ID {} qua Catalog Service: {}", tableId, ex.getMessage());
        }
    }
}

