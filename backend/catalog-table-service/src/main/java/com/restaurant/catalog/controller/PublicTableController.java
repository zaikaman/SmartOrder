package com.restaurant.catalog.controller;

import com.restaurant.catalog.entity.DiningTable;
import com.restaurant.catalog.entity.TableStatus;
import com.restaurant.catalog.service.DiningTableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller phục vụ các API công khai tra cứu bàn ăn và xuất mã QR bàn.
 */
@RestController
@RequestMapping("/api/v1/tables")
@RequiredArgsConstructor
public class PublicTableController {

    private final DiningTableService tableService;

    @GetMapping
    public ResponseEntity<List<DiningTable>> getAllTables(
            @RequestParam(required = false) TableStatus status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String area
    ) {
        List<DiningTable> tables = tableService.getAllTables(status, minCapacity, area);
        return ResponseEntity.ok(tables);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DiningTable> getTableById(@PathVariable Long id) {
        DiningTable table = tableService.getTableById(id);
        return ResponseEntity.ok(table);
    }

    @GetMapping("/number/{tableNumber}")
    public ResponseEntity<DiningTable> getTableByNumber(@PathVariable String tableNumber) {
        DiningTable table = tableService.getTableByNumber(tableNumber);
        return ResponseEntity.ok(table);
    }

    @GetMapping(value = "/{id}/qr-image", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getTableQrImage(
            @PathVariable Long id,
            @RequestParam(defaultValue = "350") int width,
            @RequestParam(defaultValue = "350") int height
    ) {
        byte[] qrPng = tableService.generateTableQrPng(id, width, height);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"table-" + id + "-qr.png\"")
                .contentType(MediaType.IMAGE_PNG)
                .body(qrPng);
    }
}
