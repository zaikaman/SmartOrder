package com.restaurant.catalog.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Trạng thái bàn ăn: AVAILABLE (Trống), RESERVED (Đã đặt trước), OCCUPIED (Đang có khách ngồi).
 */
public enum TableStatus {
    AVAILABLE,
    RESERVED,
    OCCUPIED;

    @JsonCreator
    public static TableStatus fromString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        for (TableStatus status : TableStatus.values()) {
            if (status.name().equalsIgnoreCase(value.trim())) {
                return status;
            }
        }
        throw new IllegalArgumentException("Trạng thái bàn không hợp lệ: " + value);
    }

    @JsonValue
    public String toValue() {
        return this.name();
    }
}
