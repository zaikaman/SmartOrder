package com.restaurant.booking.entity;

/**
 * Trang thai don dat ban / goi mon:
 * PENDING -> CONFIRMED -> PREPARING (Dang nau) -> SERVED (Da phuc vu) -> COMPLETED / CANCELLED.
 */
public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PREPARING,
    SERVED,
    COMPLETED,
    CANCELLED
}
