package com.restaurant.auth.controller;

import com.restaurant.auth.dto.UserDto;
import com.restaurant.auth.entity.UserRole;
import com.restaurant.auth.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller phục vụ quản lý tài khoản người dùng và phân quyền dành riêng cho Quản trị viên (ADMIN).
 */
@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AuthService authService;

    /**
     * Lấy danh sách toàn bộ người dùng trong hệ thống.
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<UserDto> users = authService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    /**
     * Cập nhật vai trò người dùng (CUSTOMER, STAFF, ADMIN).
     */
    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        String roleStr = body.get("role");
        if (roleStr == null || roleStr.isBlank()) {
            throw new IllegalArgumentException("Vai trò không được để trống");
        }
        UserRole role = UserRole.valueOf(roleStr.trim().toUpperCase());
        UserDto updated = authService.updateUserRole(id, role);
        return ResponseEntity.ok(updated);
    }

    /**
     * Khóa hoặc mở khóa tài khoản người dùng.
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body
    ) {
        Boolean active = body.get("active");
        if (active == null) {
            throw new IllegalArgumentException("Trạng thái kích hoạt không được để trống");
        }
        UserDto updated = authService.updateUserStatus(id, active);
        return ResponseEntity.ok(updated);
    }
}
