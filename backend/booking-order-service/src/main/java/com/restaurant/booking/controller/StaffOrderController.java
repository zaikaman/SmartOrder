package com.restaurant.booking.controller;

import com.restaurant.booking.dto.OrderDto;
import com.restaurant.booking.dto.UpdateOrderStatusRequest;
import com.restaurant.booking.entity.OrderStatus;
import com.restaurant.booking.service.BookingOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller phục vụ nhân viên và bếp quản lý, điều phối đơn hàng và thanh toán tại quầy.
 */
@RestController
@RequestMapping("/api/v1/staff/orders")
@RequiredArgsConstructor
@Slf4j
public class StaffOrderController {

    private final BookingOrderService bookingOrderService;

    /**
     * Lấy danh sách đơn hàng cho nhân viên / bếp (có thể lọc theo trạng thái).
     */
    @GetMapping
    public ResponseEntity<List<OrderDto>> getOrders(
            @RequestParam(required = false) OrderStatus status) {
        log.info("Nhân viên lấy danh sách đơn hàng với lọc status: {}", status);
        List<OrderDto> orders = bookingOrderService.getStaffOrders(status);
        return ResponseEntity.ok(orders);
    }

    /**
     * Cập nhật trạng thái đơn hàng: CONFIRMED, PREPARING, SERVED, COMPLETED, CANCELLED.
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDto> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateOrderStatusRequest request) {
        log.info("Nhân viên cập nhật trạng thái đơn ID {} sang {}", id, request.getStatus());
        OrderDto updated = bookingOrderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    /**
     * Nhân viên xác nhận thu tiền mặt tại quầy.
     */
    @PostMapping("/{id}/pay-cash")
    public ResponseEntity<OrderDto> payCash(@PathVariable Long id) {
        log.info("Nhân viên xác nhận thu tiền mặt tại quầy cho đơn ID {}", id);
        OrderDto updated = bookingOrderService.payCash(id);
        return ResponseEntity.ok(updated);
    }
}
