package com.restaurant.booking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VnPayCreatePaymentResponse {

    private String paymentUrl;
    private String orderCode;
    private String txnRef;
    private BigDecimal amount;
    private String message;
}
