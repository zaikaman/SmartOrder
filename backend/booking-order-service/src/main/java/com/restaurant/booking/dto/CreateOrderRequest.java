package com.restaurant.booking.dto;

import com.restaurant.booking.entity.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrderRequest {

    @NotNull(message = "tableId is required")
    private Long tableId;

    @NotNull(message = "reservationTime is required")
    @FutureOrPresent(message = "reservationTime must be in the present or future")
    private Instant reservationTime;

    @Min(value = 1, message = "partySize must be at least 1")
    private int partySize;

    @jakarta.validation.constraints.Size(max = 120, message = "customerName cannot exceed 120 characters")
    private String customerName;

    @NotBlank(message = "customerEmail is required")
    @Email(message = "customerEmail must be a valid email address")
    @jakarta.validation.constraints.Size(max = 120, message = "customerEmail cannot exceed 120 characters")
    private String customerEmail;

    @jakarta.validation.constraints.Size(max = 20, message = "customerPhone cannot exceed 20 characters")
    private String customerPhone;

    private String note;

    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.VNPAY;

    @Valid
    @Builder.Default
    private List<CreateOrderItemRequest> items = new ArrayList<>();
}
