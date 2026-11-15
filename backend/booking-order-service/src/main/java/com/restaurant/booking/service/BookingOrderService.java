package com.restaurant.booking.service;

import com.restaurant.booking.client.CatalogTableClient;
import com.restaurant.booking.dto.*;
import com.restaurant.booking.entity.*;
import com.restaurant.booking.repository.ReservationOrderRepository;
import com.restaurant.booking.repository.TableReservationLockRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingOrderService {

    private final ReservationOrderRepository orderRepository;
    private final TableReservationLockRepository lockRepository;
    private final CatalogTableClient catalogTableClient;
    private final EmailNotificationService emailNotificationService;

    private final ConcurrentHashMap<Long, Object> tableMutexes = new ConcurrentHashMap<>();

    @Transactional
    public OrderDto createOrder(Long userId, CreateOrderRequest request) {
        if (request.getReservationTime() == null) {
            throw new IllegalArgumentException("Thời gian đặt bàn không được để trống.");
        }
        if (request.getReservationTime().isBefore(Instant.now().minus(Duration.ofMinutes(5)))) {
            throw new IllegalArgumentException("Thời gian đặt bàn phải từ thời điểm hiện tại trở đi.");
        }

        // Đồng bộ đa luồng trên cùng 1 bàn để ngăn chặn race condition khi gửi đồng thời
        Object mutex = tableMutexes.computeIfAbsent(request.getTableId(), k -> new Object());
        synchronized (mutex) {
            // Khóa bi quan ở tầng CSDL
            acquireTableLock(request.getTableId());

            // 1. Kiểm tra chống trùng lịch đặt bàn trên cùng 1 bàn trong khoảng +/- 2 giờ
            Instant startTime = request.getReservationTime().minus(2, ChronoUnit.HOURS);
            Instant endTime = request.getReservationTime().plus(2, ChronoUnit.HOURS);

            boolean hasConflict = orderRepository.existsConflictingReservation(request.getTableId(), startTime, endTime);
            if (hasConflict) {
                throw new IllegalArgumentException("Bàn ăn này đã có khách đặt trong khoảng thời gian này (trùng lặp trong vòng 2 giờ). Vui lòng chọn bàn khác hoặc khung giờ khác.");
            }

            // 2. Lấy thông tin bàn ăn từ Catalog Table Service và kiểm tra tính hợp lệ
            CatalogTableClient.TableInfo tableInfo;
            try {
                tableInfo = catalogTableClient.getTable(request.getTableId());
            } catch (Exception ex) {
                log.error("Không thể lấy thông tin bàn ăn ID {}: {}", request.getTableId(), ex.getMessage());
                throw new IllegalArgumentException("Không tìm thấy bàn ăn ID: " + request.getTableId());
            }

            if (tableInfo == null) {
                throw new IllegalArgumentException("Không tìm thấy bàn ăn ID: " + request.getTableId());
            }

            String tableNumber = (tableInfo.getTableNumber() != null && !tableInfo.getTableNumber().isBlank())
                    ? tableInfo.getTableNumber()
                    : "Bàn " + request.getTableId();

            // Kiểm tra sức chứa của bàn
            if (tableInfo.getCapacity() > 0 && request.getPartySize() > tableInfo.getCapacity()) {
                throw new IllegalArgumentException("Bàn " + tableNumber + " có sức chứa tối đa " + tableInfo.getCapacity()
                        + " người, không đủ cho đoàn " + request.getPartySize() + " khách.");
            }

            // Kiểm tra trạng thái của bàn
            if ("OCCUPIED".equalsIgnoreCase(tableInfo.getStatus())) {
                throw new IllegalArgumentException("Bàn " + tableNumber + " hiện đang có khách ngồi (OCCUPIED). Vui lòng chọn bàn khác.");
            }

            // 3. Sinh mã đơn đặt bàn độc nhất không bao giờ trùng lặp
            String uniqueSuffix = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
            String orderCode = "BV" + DateTimeFormatter.ofPattern("yyMMdd").withZone(ZoneId.of("Asia/Ho_Chi_Minh")).format(Instant.now()) + uniqueSuffix;

            String resolvedCustomerName = (request.getCustomerName() != null && !request.getCustomerName().trim().isEmpty())
                    ? request.getCustomerName().trim()
                    : "Khách hàng";
            String resolvedCustomerPhone = (request.getCustomerPhone() != null && !request.getCustomerPhone().trim().isEmpty())
                    ? request.getCustomerPhone().trim()
                    : "Chưa cung cấp";

            ReservationOrder order = ReservationOrder.builder()
                    .orderCode(orderCode)
                    .userId(userId)
                    .customerName(resolvedCustomerName)
                    .customerEmail(request.getCustomerEmail() != null ? request.getCustomerEmail().trim() : "")
                    .customerPhone(resolvedCustomerPhone)
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
                    if (menuInfo == null) {
                        throw new IllegalArgumentException("Không tìm thấy món ăn ID: " + itemReq.getMenuItemId());
                    }

                    // Kiểm tra trạng thái món ăn có còn phục vụ hay không
                    if (menuInfo.getStatus() == null || !"AVAILABLE".equalsIgnoreCase(menuInfo.getStatus())) {
                        String statusMsg = (menuInfo.getStatus() != null && "OUT_OF_STOCK".equalsIgnoreCase(menuInfo.getStatus()))
                                ? "đã hết món"
                                : "ngừng phục vụ";
                        throw new IllegalArgumentException("Món ăn '" + menuInfo.getName() + "' hiện " + statusMsg + ". Vui lòng chọn món khác.");
                    }

                    BigDecimal unitPrice = menuInfo.getPrice() != null ? menuInfo.getPrice() : BigDecimal.ZERO;
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

            // Cập nhật trạng thái bàn sang RESERVED
            try {
                catalogTableClient.updateTableStatus(savedOrder.getTableId(), "RESERVED");
            } catch (Exception ex) {
                log.warn("Không thể cập nhật trạng thái bàn sang RESERVED: {}", ex.getMessage());
            }

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
    }

    private void acquireTableLock(Long tableId) {
        if (lockRepository == null) return;
        try {
            Optional<TableReservationLock> lockOpt = lockRepository.findWithLockByTableId(tableId);
            if (lockOpt.isPresent()) {
                TableReservationLock lock = lockOpt.get();
                lock.setUpdatedAt(Instant.now());
                lockRepository.saveAndFlush(lock);
            } else {
                try {
                    lockRepository.saveAndFlush(TableReservationLock.builder()
                            .tableId(tableId)
                            .updatedAt(Instant.now())
                            .build());
                } catch (Exception ex) {
                    lockRepository.findWithLockByTableId(tableId);
                }
            }
        } catch (Exception ex) {
            log.warn("Không thể thiết lập khóa bi quan bàn ID {}: {}", tableId, ex.getMessage());
        }
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

        if (oldStatus == OrderStatus.COMPLETED || oldStatus == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Đơn hàng đã kết thúc (" + oldStatus + "), không thể thay đổi trạng thái.");
        }

        if (newStatus == OrderStatus.COMPLETED && order.getPaymentStatus() != PaymentStatus.PAID) {
            throw new IllegalStateException("Không thể hoàn tất đơn hàng khi chưa thanh toán (PaymentStatus phải là PAID). Vui lòng xác nhận thanh toán tiền mặt hoặc VNPay trước.");
        }

        if (!isValidStatusTransition(oldStatus, newStatus)) {
            throw new IllegalStateException("Không thể chuyển trạng thái đơn hàng từ " + oldStatus + " sang " + newStatus);
        }

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

    private boolean isValidStatusTransition(OrderStatus from, OrderStatus to) {
        if (from == to) return true;
        if (to == OrderStatus.CANCELLED) return true;
        return switch (from) {
            case PENDING -> to == OrderStatus.CONFIRMED;
            case CONFIRMED -> to == OrderStatus.PREPARING;
            case PREPARING -> to == OrderStatus.SERVED;
            case SERVED -> to == OrderStatus.COMPLETED;
            default -> false;
        };
    }

    @Transactional
    public OrderDto payCash(Long orderId) {
        ReservationOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng ID: " + orderId));

        if (order.getStatus() == OrderStatus.COMPLETED && order.getPaymentStatus() == PaymentStatus.PAID) {
            throw new IllegalStateException("Đơn hàng đã được thanh toán và hoàn tất trước đó.");
        }
        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new IllegalStateException("Đơn hàng đã bị hủy, không thể thanh toán tiền mặt.");
        }

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
