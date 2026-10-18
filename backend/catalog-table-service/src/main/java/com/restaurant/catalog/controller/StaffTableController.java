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
 * Controller phục vụ nhân viên quản lý và cập nhật trạng thái bàn ăn thời gian thực.
 */
@RestController
@RequestMapping("/api/v1/staff/tables")
@RequiredArgsConstructor
@Slf4j
public class StaffTableController {

    private final DiningTableService tableService;

    /**
     * Cập nhật trạng thái bàn ăn: AVAILABLE, RESERVED, OCCUPIED.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<DiningTable> updateTableStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateTableStatusRequest request) {
        log.info("Nhân viên cập nhật trạng thái bàn ID {} sang {}", id, request.getStatus());
        DiningTable updated = tableService.updateTableStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }
}
