package com.restaurant.booking.controller;

import com.restaurant.booking.dto.CreateOrderRequest;
import com.restaurant.booking.dto.OrderDto;
import com.restaurant.booking.service.BookingOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class BookingOrderController {

    private final BookingOrderService bookingOrderService;

    private Long getUserIdFromAuth(Authentication auth) {
        if (auth != null && auth.getCredentials() instanceof Long) {
            return (Long) auth.getCredentials();
        }
        // Nếu không tìm thấy userId trong credentials (ví dụ khi test), trả về 1L fallback
        return 1L;
    }

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            Authentication authentication,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        Long userId = getUserIdFromAuth(authentication);
        OrderDto order = bookingOrderService.createOrder(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderDto>> getMyOrders(Authentication authentication) {
        Long userId = getUserIdFromAuth(authentication);
        List<OrderDto> orders = bookingOrderService.getCustomerOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> getOrderById(
            Authentication authentication,
            @PathVariable Long id
    ) {
        Long userId = getUserIdFromAuth(authentication);
        OrderDto order = bookingOrderService.getOrderById(id, userId);
        return ResponseEntity.ok(order);
    }
}
