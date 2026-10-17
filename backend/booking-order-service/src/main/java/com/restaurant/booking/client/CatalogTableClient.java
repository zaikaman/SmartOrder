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
            log.error("Khong the lay thong tin mon an ID {}: {}", menuItemId, ex.getMessage());
            throw new IllegalArgumentException("Khong tim thay mon an ID: " + menuItemId);
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
            throw new IllegalArgumentException("Khong tim thay ban an ID: " + tableId);
        } catch (Exception ex) {
            log.error("Loi khi lay thong tin ban an ID {}: {}", tableId, ex.getMessage());
            // Fallback khi catalog table service chua bat trong moi truong mock/test
            throw new IllegalArgumentException("Khong tim thay ban an ID: " + tableId);
        }
    }
}
