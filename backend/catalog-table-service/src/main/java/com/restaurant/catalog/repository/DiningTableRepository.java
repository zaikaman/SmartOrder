package com.restaurant.catalog.repository;

import com.restaurant.catalog.entity.DiningTable;
import com.restaurant.catalog.entity.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository truy vấn dữ liệu Bàn ăn.
 */
@Repository
public interface DiningTableRepository extends JpaRepository<DiningTable, Long> {

    Optional<DiningTable> findByTableNumber(String tableNumber);

    boolean existsByTableNumber(String tableNumber);

    List<DiningTable> findByStatus(TableStatus status);

    List<DiningTable> findByArea(String area);

    List<DiningTable> findByStatusAndCapacityGreaterThanEqual(TableStatus status, int capacity);
}
