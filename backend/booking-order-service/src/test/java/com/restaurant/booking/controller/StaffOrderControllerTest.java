package com.restaurant.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.booking.dto.OrderDto;
import com.restaurant.booking.dto.UpdateOrderStatusRequest;
import com.restaurant.booking.entity.OrderStatus;
import com.restaurant.booking.entity.PaymentMethod;
import com.restaurant.booking.entity.PaymentStatus;
import com.restaurant.booking.security.JwtAuthenticationFilter;
import com.restaurant.booking.service.BookingOrderService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(StaffOrderController.class)
@AutoConfigureMockMvc(addFilters = false)
class StaffOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingOrderService bookingOrderService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("Staff lấy danh sách toàn bộ đơn hàng thành công")
    @WithMockUser(username = "staff1", roles = "STAFF")
    void testGetOrdersSuccess() throws Exception {
        OrderDto order1 = OrderDto.builder()
                .id(1L)
                .orderCode("BV001")
                .tableNumber("Ban 01")
                .status(OrderStatus.PENDING)
                .totalAmount(BigDecimal.valueOf(180000))
                .build();

        when(bookingOrderService.getStaffOrders(null)).thenReturn(List.of(order1));

        mockMvc.perform(get("/api/v1/staff/orders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderCode").value("BV001"))
                .andExpect(jsonPath("$[0].tableNumber").value("Ban 01"));
    }

    @Test
    @DisplayName("Staff cập nhật trạng thái đơn sang PREPARING (Đang nấu)")
    @WithMockUser(username = "staff1", roles = "STAFF")
    void testUpdateOrderStatus() throws Exception {
        UpdateOrderStatusRequest request = UpdateOrderStatusRequest.builder()
                .status(OrderStatus.PREPARING)
                .build();

        OrderDto updated = OrderDto.builder()
                .id(1L)
                .orderCode("BV001")
                .status(OrderStatus.PREPARING)
                .build();

        when(bookingOrderService.updateOrderStatus(eq(1L), eq(OrderStatus.PREPARING))).thenReturn(updated);

        mockMvc.perform(patch("/api/v1/staff/orders/1/status")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PREPARING"));
    }

    @Test
    @DisplayName("Staff xác nhận thu tiền mặt tại quầy chuyển sang COMPLETED")
    @WithMockUser(username = "staff1", roles = "STAFF")
    void testPayCash() throws Exception {
        OrderDto paidOrder = OrderDto.builder()
                .id(1L)
                .orderCode("BV001")
                .paymentMethod(PaymentMethod.CASH)
                .paymentStatus(PaymentStatus.PAID)
                .status(OrderStatus.COMPLETED)
                .build();

        when(bookingOrderService.payCash(1L)).thenReturn(paidOrder);

        mockMvc.perform(post("/api/v1/staff/orders/1/pay-cash")
                        .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paymentMethod").value("CASH"))
                .andExpect(jsonPath("$.paymentStatus").value("PAID"))
                .andExpect(jsonPath("$.status").value("COMPLETED"));
    }
}
