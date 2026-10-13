package com.restaurant.catalog.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

/**
 * Thuc the Ban an trong Nha Hang Am Thuc Bep Viet.
 */
@Entity
@Table(name = "dining_tables")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiningTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 30)
    @Column(name = "table_number", nullable = false, unique = true, length = 30)
    private String tableNumber;

    @Min(1)
    @Column(nullable = false)
    private int capacity;

    @NotBlank
    @Size(max = 60)
    @Column(nullable = false, length = 60)
    @Builder.Default
    private String area = "Tầng 1";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TableStatus status = TableStatus.AVAILABLE;

    @Column(name = "qr_code_url", length = 500)
    private String qrCodeUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
