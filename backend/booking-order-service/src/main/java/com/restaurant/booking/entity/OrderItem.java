package com.restaurant.booking.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

/**
 * Thuc the Chi tiet mon an trong don dat ban / don goi mon.
 */
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private ReservationOrder order;

    @NotNull
    @Column(name = "menu_item_id", nullable = false)
    private Long menuItemId;

    @NotBlank
    @Size(max = 150)
    @Column(name = "menu_item_name", nullable = false, length = 150)
    private String menuItemName;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Min(1)
    @Column(nullable = false)
    private int quantity;

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Size(max = 300)
    @Column(length = 300)
    private String note;
}
