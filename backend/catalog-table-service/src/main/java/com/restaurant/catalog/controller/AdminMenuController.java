package com.restaurant.catalog.controller;

import com.restaurant.catalog.dto.MenuItemRequest;
import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.service.CloudinaryService;
import com.restaurant.catalog.service.MenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Controller quản trị thực đơn và tải ảnh Cloudinary dành cho Quản trị viên (ADMIN).
 */
@RestController
@RequestMapping("/api/v1/admin/menu")
@RequiredArgsConstructor
public class AdminMenuController {

    private final MenuService menuService;
    private final CloudinaryService cloudinaryService;

    /**
     * Lấy danh sách toàn bộ món ăn cho trang quản trị.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<MenuItem>> getAllMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword
    ) {
        List<MenuItem> items = menuService.getAllMenuItemsAdmin(category, keyword);
        return ResponseEntity.ok(items);
    }

    /**
     * Tải tệp hình ảnh món ăn lên Cloudinary API.
     */
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, String>> uploadMenuImage(@RequestParam("file") MultipartFile file) {
        String imageUrl = cloudinaryService.uploadImage(file);
        return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
    }

    /**
     * Thêm món ăn mới vào thực đơn nhà hàng.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> createMenuItem(@Valid @RequestBody MenuItemRequest request) {
        MenuItem created = menuService.createMenuItem(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Cập nhật thông tin chi tiết của món ăn.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MenuItem> updateMenuItem(
            @PathVariable Long id,
            @Valid @RequestBody MenuItemRequest request
    ) {
        MenuItem updated = menuService.updateMenuItem(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Xóa món ăn khỏi thực đơn.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteMenuItem(@PathVariable Long id) {
        menuService.deleteMenuItem(id);
        return ResponseEntity.ok(Map.of("message", "Đã xóa món ăn thành công với mã ID: " + id));
    }
}
