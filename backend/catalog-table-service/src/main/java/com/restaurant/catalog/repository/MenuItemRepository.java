package com.restaurant.catalog.repository;

import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.entity.MenuItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository truy van du lieu Mon an trong thuc don.
 */
@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByStatus(MenuItemStatus status);

    List<MenuItem> findByCategory(String category);

    List<MenuItem> findByCategoryAndStatus(String category, MenuItemStatus status);

    @Query("SELECT DISTINCT m.category FROM MenuItem m WHERE m.status = 'AVAILABLE'")
    List<String> findDistinctCategories();

    List<MenuItem> findByNameContainingIgnoreCase(String keyword);

    List<MenuItem> findByNameContainingIgnoreCaseAndStatus(String keyword, MenuItemStatus status);
}
