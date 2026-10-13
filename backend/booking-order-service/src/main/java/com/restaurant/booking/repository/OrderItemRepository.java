package com.restaurant.booking.repository;

import com.restaurant.booking.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository truy van Chi tiet mon an trong hoa don.
 */
@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT oi.menuItemName, SUM(oi.quantity), SUM(oi.subtotal) " +
           "FROM OrderItem oi JOIN oi.order o " +
           "WHERE o.status = 'COMPLETED' " +
           "GROUP BY oi.menuItemName " +
           "ORDER BY SUM(oi.quantity) DESC")
    List<Object[]> findTopSellingItems();
}
