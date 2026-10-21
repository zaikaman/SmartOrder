package com.restaurant.catalog.service;

import com.restaurant.catalog.dto.MenuItemRequest;
import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.entity.MenuItemStatus;
import com.restaurant.catalog.exception.ResourceNotFoundException;
import com.restaurant.catalog.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service xử lý nghiệp vụ Thực đơn (Menu Item) cho Catalog Service.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class MenuService {

    private final MenuItemRepository menuItemRepository;

    public List<MenuItem> getAllMenuItems(String category, String keyword, MenuItemStatus status) {
        MenuItemStatus targetStatus = (status != null) ? status : MenuItemStatus.AVAILABLE;

        if (keyword != null && !keyword.isBlank()) {
            return menuItemRepository.findByNameContainingIgnoreCaseAndStatus(keyword.trim(), targetStatus);
        }

        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category.trim())) {
            return menuItemRepository.findByCategoryAndStatus(category.trim(), targetStatus);
        }

        return menuItemRepository.findByStatus(targetStatus);
    }

    public List<MenuItem> getAllMenuItemsAdmin(String category, String keyword) {
        if (keyword != null && !keyword.isBlank()) {
            return menuItemRepository.findAll().stream()
                    .filter(m -> m.getName().toLowerCase().contains(keyword.trim().toLowerCase()))
                    .filter(m -> category == null || category.isBlank() || "ALL".equalsIgnoreCase(category) || m.getCategory().equalsIgnoreCase(category.trim()))
                    .toList();
        }

        if (category != null && !category.isBlank() && !"ALL".equalsIgnoreCase(category.trim())) {
            return menuItemRepository.findAll().stream()
                    .filter(m -> m.getCategory().equalsIgnoreCase(category.trim()))
                    .toList();
        }

        return menuItemRepository.findAll();
    }

    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy món ăn với mã ID: " + id));
    }

    public List<String> getDistinctCategories() {
        return menuItemRepository.findDistinctCategories();
    }

    @Transactional
    public MenuItem createMenuItem(MenuItemRequest request) {
        MenuItem menuItem = MenuItem.builder()
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : "")
                .price(request.getPrice())
                .category(request.getCategory().trim())
                .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank() ? request.getImageUrl().trim() : "")
                .status(request.getStatus() != null ? request.getStatus() : MenuItemStatus.AVAILABLE)
                .build();

        MenuItem saved = menuItemRepository.save(menuItem);
        log.info("Đã tạo mới món ăn: ID={}, Tên='{}'", saved.getId(), saved.getName());
        return saved;
    }

    @Transactional
    public MenuItem updateMenuItem(Long id, MenuItemRequest request) {
        MenuItem menuItem = getMenuItemById(id);

        menuItem.setName(request.getName().trim());
        menuItem.setDescription(request.getDescription() != null ? request.getDescription().trim() : "");
        menuItem.setPrice(request.getPrice());
        menuItem.setCategory(request.getCategory().trim());
        if (request.getImageUrl() != null) {
            menuItem.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getStatus() != null) {
            menuItem.setStatus(request.getStatus());
        }

        MenuItem updated = menuItemRepository.save(menuItem);
        log.info("Đã cập nhật món ăn: ID={}, Tên='{}'", updated.getId(), updated.getName());
        return updated;
    }

    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem menuItem = getMenuItemById(id);
        menuItemRepository.delete(menuItem);
        log.info("Đã xóa món ăn thành công: ID={}", id);
    }
}
