package com.restaurant.booking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

import java.time.Instant;

/**
 * Entity dùng để quản lý khóa bi quan (Pessimistic Lock) chống race condition
 * khi nhiều yêu cầu đặt cùng một bàn gửi đến đồng thời.
 */
@Entity
@Table(name = "table_reservation_locks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TableReservationLock {

    @Id
    @Column(name = "table_id")
    private Long tableId;

    @Column(name = "updated_at")
    private Instant updatedAt;
}
