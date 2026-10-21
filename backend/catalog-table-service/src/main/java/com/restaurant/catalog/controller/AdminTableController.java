package com.restaurant.catalog.controller;

import com.restaurant.catalog.dto.DiningTableRequest;
import com.restaurant.catalog.entity.DiningTable;
import com.restaurant.catalog.service.DiningTableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller quản trị danh mục bàn ăn và mã QR dành cho Quản trị viên (ADMIN).
 */
@RestController
@RequestMapping("/api/v1/admin/tables")
@RequiredArgsConstructor
public class AdminTableController {

    private final DiningTableService tableService;

    /**
     * Thêm bàn ăn mới vào sơ đồ nhà hàng.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiningTable> createTable(@Valid @RequestBody DiningTableRequest request) {
        DiningTable created = tableService.createTable(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Cập nhật thông tin bàn ăn (số bàn, sức chứa, khu vực, trạng thái).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DiningTable> updateTable(
            @PathVariable Long id,
            @Valid @RequestBody DiningTableRequest request
    ) {
        DiningTable updated = tableService.updateTable(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Xóa bàn ăn khỏi hệ thống.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteTable(@PathVariable Long id) {
        tableService.deleteTable(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa bàn ăn thành công với mã ID: " + id));
    }
}
