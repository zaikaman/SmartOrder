package com.restaurant.booking.repository;

import com.restaurant.booking.entity.TableReservationLock;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository truy vấn và khóa bản ghi table_reservation_locks với PESSIMISTIC_WRITE.
 */
@Repository
public interface TableReservationLockRepository extends JpaRepository<TableReservationLock, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT l FROM TableReservationLock l WHERE l.tableId = :tableId")
    Optional<TableReservationLock> findWithLockByTableId(@Param("tableId") Long tableId);
}
