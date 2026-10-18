package com.restaurant.booking.entity;

/**
 * Trạng thái đơn đặt bàn / gọi món:
 * PENDING -> CONFIRMED -> PREPARING (Đang nấu) -> SERVED (Đã phục vụ) -> COMPLETED / CANCELLED.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    SERVED,
    COMPLETED,
    CANCELLED
}
