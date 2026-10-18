package com.restaurant.booking.service;

import com.restaurant.booking.client.CatalogTableClient;
import com.restaurant.booking.dto.*;
import com.restaurant.booking.entity.*;
import com.restaurant.booking.repository.ReservationOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingOrderService {

    private final ReservationOrderRepository orderRepository;
    private final CatalogTableClient catalogTableClient;
    private final EmailNotificationService emailNotificationService;

    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        // 1. Kiểm tra chống trùng lịch đặt bàn trên cùng 1 bàn trong khoảng +/- 2 giờ
        Instant startTime = request.getReservationTime().minus(2, ChronoUnit.HOURS);
        Instant endTime = request.getReservationTime().plus(2, ChronoUnit.HOURS);

        boolean hasConflict = orderRepository.existsConflictingReservation(request.getTableId(), startTime, endTime);
        if (hasConflict) {
            throw new IllegalArgumentException("Bàn ăn này đã có khách đặt trong khoảng thời gian này (trùng lặp trong vòng 2 giờ). Vui lòng chọn bàn khác hoặc khung giờ khác.");
        }

        // 2. Lấy thông tin bàn ăn từ Catalog Table Service
        String tableNumber = "Bàn " + request.getTableId();
        try {
            CatalogTableClient.TableInfo tableInfo = catalogTableClient.getTable(request.getTableId());
            if (tableInfo != null && tableInfo.getTableNumber() != null) {
                tableNumber = tableInfo.getTableNumber();
            }
        } catch (Exception ex) {
            log.warn("Không thể lấy chi tiết tên bàn từ Catalog Service, sử dụng mặc định: {}", ex.getMessage());
        }

        // 3. Sinh mã đơn đặt bàn độc nhất
        String orderCode = "BV" + System.currentTimeMillis() % 10000000 + String.format("%02d", request.getTableId());

        ReservationOrder order = ReservationOrder.builder()
                .orderCode(orderCode)
                .userId(userId)
                .customerName(request.getCustomerName() != null ? request.getCustomerName() : "Khách hàng")
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : "Chưa cung cấp")
                .tableId(request.getTableId())
                .tableNumber(tableNumber)
                .reservationTime(request.getReservationTime())
                .partySize(request.getPartySize())
                .status(OrderStatus.PENDING)
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.VNPAY)
                .paymentStatus(PaymentStatus.UNPAID)
                .note(request.getNote())
                .totalAmount(BigDecimal.ZERO)
                .emailSent(false)
                .build();

        // 4. Tính tiền và lưu các OrderItem nếu có gọi món kèm theo
        BigDecimal total = BigDecimal.ZERO;
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            for (CreateOrderItemRequest itemReq : request.getItems()) {
                CatalogTableClient.MenuItemInfo menuInfo = catalogTableClient.getMenuItem(itemReq.getMenuItemId());
                BigDecimal unitPrice = menuInfo.getPrice();
                BigDecimal subtotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                total = total.add(subtotal);

                OrderItem orderItem = OrderItem.builder()
                        .menuItemId(itemReq.getMenuItemId())
                        .menuItemName(menuInfo.getName())
                        .unitPrice(unitPrice)
                        .quantity(itemReq.getQuantity())
                        .subtotal(subtotal)
                        .note(itemReq.getNote())
                        .build();

                order.addItem(orderItem);
            }
        }
        order.setTotalAmount(total);

        // 5. Lưu đơn hàng vào CSDL
        ReservationOrder savedOrder = orderRepository.save(order);

        // 6. Gửi email xác nhận cho khách hàng
        try {
            boolean sent = emailNotificationService.sendReservationConfirmationEmail(savedOrder);
            if (sent) {
                savedOrder.setEmailSent(true);
                orderRepository.save(savedOrder);
            }
        } catch (Exception ex) {
            log.warn("Gửi email xác nhận không thành công: {}", ex.getMessage());
        }

        return toDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getCustomerOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderDto getOrderById(Long orderId, Long userId) {
        ReservationOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng ID: " + orderId));

        if (userId != null && !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Quyền truy cập đơn hàng bị từ chối");
        }

        return toDto(order);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> getStaffOrders(OrderStatus status) {
        List<ReservationOrder> orders;
        if (status != null) {
            orders = orderRepository.findByStatusOrderByCreatedAtDesc(status);
        } else {
            orders = orderRepository.findAll(org.springframework.data.domain.Sort.by(
                    org.springframework.data.domain.Sort.Direction.DESC, "createdAt"));
        }
        return orders.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public OrderDto updateOrderStatus(Long orderId, OrderStatus newStatus) {
        ReservationOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng ID: " + orderId));

        OrderStatus oldStatus = order.getStatus();
        order.setStatus(newStatus);
        log.info("Nhân viên cập nhật đơn {} từ {} sang {}", order.getOrderCode(), oldStatus, newStatus);

        // Tự động cập nhật trạng thái bàn sang Catalog Service
        if (newStatus == OrderStatus.COMPLETED || newStatus == OrderStatus.CANCELLED) {
            catalogTableClient.updateTableStatus(order.getTableId(), "AVAILABLE");
        } else if (newStatus == OrderStatus.CONFIRMED || newStatus == OrderStatus.PREPARING) {
            catalogTableClient.updateTableStatus(order.getTableId(), "OCCUPIED");
        }

        ReservationOrder updated = orderRepository.save(order);
        return toDto(updated);
    }

    @Transactional
    public OrderDto payCash(Long orderId) {
        ReservationOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng ID: " + orderId));

        order.setPaymentMethod(PaymentMethod.CASH);
        order.setPaymentStatus(PaymentStatus.PAID);
        order.setStatus(OrderStatus.COMPLETED);
        log.info("Nhân viên xác nhận thanh toán tiền mặt cho đơn {}", order.getOrderCode());

        // Giải phóng bàn khi đã thanh toán xong và hoàn tất
        catalogTableClient.updateTableStatus(order.getTableId(), "AVAILABLE");

        ReservationOrder updated = orderRepository.save(order);
        return toDto(updated);
    }


    public OrderDto toDto(ReservationOrder order) {
        List<OrderItemDto> itemDtos = null;
        if (order.getItems() != null) {
            itemDtos = order.getItems().stream().map(item -> OrderItemDto.builder()
                    .id(item.getId())
                    .menuItemId(item.getMenuItemId())
                    .menuItemName(item.getMenuItemName())
                    .unitPrice(item.getUnitPrice())
                    .quantity(item.getQuantity())
                    .subtotal(item.getSubtotal())
                    .note(item.getNote())
                    .build()).collect(Collectors.toList());
        }

        return OrderDto.builder()
                .id(order.getId())
                .orderCode(order.getOrderCode())
                .userId(order.getUserId())
                .customerName(order.getCustomerName())
                .customerEmail(order.getCustomerEmail())
                .customerPhone(order.getCustomerPhone())
                .tableId(order.getTableId())
                .tableNumber(order.getTableNumber())
                .reservationTime(order.getReservationTime())
                .partySize(order.getPartySize())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .vnpTxnRef(order.getVnpTxnRef())
                .emailSent(order.isEmailSent())
                .note(order.getNote())
                .items(itemDtos)
                .createdAt(order.getCreatedAt())
                .build();
    }
}
