package com.restaurant.booking.repository;

import com.restaurant.booking.entity.OrderStatus;
import com.restaurant.booking.entity.PaymentStatus;
import com.restaurant.booking.entity.ReservationOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Repository truy van du lieu Don dat ban va Hoa don goi mon.
 */
@Repository
public interface ReservationOrderRepository extends JpaRepository<ReservationOrder, Long> {

    Optional<ReservationOrder> findByOrderCode(String orderCode);

    Optional<ReservationOrder> findByVnpTxnRef(String vnpTxnRef);

    List<ReservationOrder> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<ReservationOrder> findByTableIdAndStatusIn(Long tableId, List<OrderStatus> statuses);

    /**
     * Kiem tra chong trung lich dat ban tren cung 1 ban trong khoang thoi gian (+/- 2 gio).
     */
    @Query("SELECT COUNT(r) > 0 FROM ReservationOrder r " +
           "WHERE r.tableId = :tableId " +
           "AND r.status NOT IN ('CANCELLED', 'COMPLETED') " +
           "AND r.reservationTime BETWEEN :startTime AND :endTime")
    boolean existsConflictingReservation(
            @Param("tableId") Long tableId,
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime
    );

    List<ReservationOrder> findByStatusOrderByCreatedAtDesc(OrderStatus status);

    List<ReservationOrder> findByPaymentStatusOrderByCreatedAtDesc(PaymentStatus paymentStatus);

    @Query("SELECT r FROM ReservationOrder r WHERE r.createdAt BETWEEN :startTime AND :endTime AND r.paymentStatus = 'PAID'")
    List<ReservationOrder> findPaidOrdersBetween(
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime
    );
}
