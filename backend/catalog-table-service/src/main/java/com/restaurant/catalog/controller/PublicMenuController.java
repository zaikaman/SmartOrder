package com.restaurant.catalog.controller;

import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.entity.MenuItemStatus;
import com.restaurant.catalog.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller phuc vu cac API cong khai xem thuc don cho Khach vang lai.
 */
@RestController
@RequestMapping("/api/v1/menu")
@RequiredArgsConstructor
public class PublicMenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) MenuItemStatus status
    ) {
        List<MenuItem> items = menuService.getAllMenuItems(category, keyword, status);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getMenuItemById(@PathVariable Long id) {
        MenuItem item = menuService.getMenuItemById(id);
        return ResponseEntity.ok(item);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        List<String> categories = menuService.getDistinctCategories();
        return ResponseEntity.ok(categories);
    }
}
