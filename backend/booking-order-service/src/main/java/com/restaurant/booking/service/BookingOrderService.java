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
        // 1. Kiem tra chong trung lich dat ban tren cung 1 ban trong khoang +/- 2 gio
        Instant startTime = request.getReservationTime().minus(2, ChronoUnit.HOURS);
        Instant endTime = request.getReservationTime().plus(2, ChronoUnit.HOURS);

        boolean hasConflict = orderRepository.existsConflictingReservation(request.getTableId(), startTime, endTime);
        if (hasConflict) {
            throw new IllegalArgumentException("Ban an nay da co khach dat trong khoang thoi gian nay (trung lap trong vong 2 gio). Vui long chon ban khac hoac khung gio khac.");
        }

        // 2. Lay thong tin ban an tu Catalog Table Service
        String tableNumber = "Ban " + request.getTableId();
        try {
            CatalogTableClient.TableInfo tableInfo = catalogTableClient.getTable(request.getTableId());
            if (tableInfo != null && tableInfo.getTableNumber() != null) {
                tableNumber = tableInfo.getTableNumber();
            }
        } catch (Exception ex) {
            log.warn("Khong the lay chi tiet ten ban tu Catalog Service, su dung mac dinh: {}", ex.getMessage());
        }

        // 3. Sinh ma don dat ban doc nhat
        String orderCode = "BV" + System.currentTimeMillis() % 10000000 + String.format("%02d", request.getTableId());

        ReservationOrder order = ReservationOrder.builder()
                .orderCode(orderCode)
                .userId(userId)
                .customerName(request.getCustomerName() != null ? request.getCustomerName() : "Khach hang")
                .customerEmail(request.getCustomerEmail())
                .customerPhone(request.getCustomerPhone() != null ? request.getCustomerPhone() : "Chua cung cap")
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

        // 4. Tinh tien va luu cac OrderItem neu co goi mon kem theo
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

        // 5. Luu don hang vao CSDL
        ReservationOrder savedOrder = orderRepository.save(order);

        // 6. Gui email xac nhan cho khach hang
        try {
            boolean sent = emailNotificationService.sendReservationConfirmationEmail(savedOrder);
            if (sent) {
                savedOrder.setEmailSent(true);
                orderRepository.save(savedOrder);
            }
        } catch (Exception ex) {
            log.warn("Gui email xac nhan khong thanh cong: {}", ex.getMessage());
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
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay don hang ID: " + orderId));

        if (userId != null && !order.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Quyen truy cap don hang bi tu choi");
        }

        return toDto(order);
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
