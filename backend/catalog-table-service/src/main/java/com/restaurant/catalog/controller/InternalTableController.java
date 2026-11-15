package com.restaurant.catalog.controller;

import com.restaurant.catalog.dto.UpdateTableStatusRequest;
import com.restaurant.catalog.entity.DiningTable;
import com.restaurant.catalog.service.DiningTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller phục vụ cập nhật trạng thái bàn nội bộ giữa các microservices (booking-order-service gọi sang).
 */
@RestController
@RequestMapping("/api/v1/internal/tables")
@RequiredArgsConstructor
@Slf4j
public class InternalTableController {

    private final DiningTableService tableService;

    /**
     * Cập nhật trạng thái bàn ăn nội bộ: AVAILABLE, RESERVED, OCCUPIED.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<DiningTable> updateTableStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateTableStatusRequest request) {
        log.info("Cập nhật trạng thái bàn nội bộ ID {} sang {}", id, request.getStatus());
        DiningTable updated = tableService.updateTableStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}
