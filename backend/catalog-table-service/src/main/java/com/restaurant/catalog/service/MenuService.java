package com.restaurant.catalog.service;

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
 * Service xu ly nghiep vu Thuc don (Menu Item) cho Catalog Service.
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

    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khong tim thay mon an voi ma ID: " + id));
    }

    public List<String> getDistinctCategories() {
        return menuItemRepository.findDistinctCategories();
    }
}
