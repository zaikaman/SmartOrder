package com.restaurant.booking.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * Thuc the Dat ban va Hoa don goi mon trong he thong Nha Hang Am Thuc Bep Viet.
 */
@Entity
@Table(name = "reservation_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 40)
    @Column(name = "order_code", nullable = false, unique = true, length = 40)
    private String orderCode;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotBlank
    @Size(max = 120)
    @Column(name = "customer_name", nullable = false, length = 120)
    private String customerName;

    @NotBlank
    @Size(max = 120)
    @Column(name = "customer_email", nullable = false, length = 120)
    private String customerEmail;

    @NotBlank
    @Size(max = 20)
    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @NotNull
    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @NotBlank
    @Size(max = 30)
    @Column(name = "table_number", nullable = false, length = 30)
    private String tableNumber;

    @NotNull
    @Column(name = "reservation_time", nullable = false)
    private Instant reservationTime;

    @Min(1)
    @Column(name = "party_size", nullable = false)
    private int partySize;

    @NotNull
    @DecimalMin("0.0")
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.VNPAY;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Column(name = "vnp_txn_ref", length = 64)
    private String vnpTxnRef;

    @Column(name = "email_sent", nullable = false)
    @Builder.Default
    private boolean emailSent = false;

    @Size(max = 500)
    @Column(length = 500)
    private String note;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}
