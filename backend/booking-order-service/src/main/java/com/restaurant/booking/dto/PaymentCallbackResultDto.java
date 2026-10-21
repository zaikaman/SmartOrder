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
public class PaymentCallbackResultDto {

    private boolean success;
    private String orderCode;
    private String txnRef;
    private BigDecimal amount;
    private String responseCode;
    private String transactionNo;
    private String bankCode;
    private String payDate;
    private String message;
}
