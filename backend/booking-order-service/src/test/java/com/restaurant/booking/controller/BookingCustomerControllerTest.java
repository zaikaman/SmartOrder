package com.restaurant.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.booking.dto.CreateOrderRequest;
import com.restaurant.booking.dto.OrderDto;
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
import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingOrderController.class)
@AutoConfigureMockMvc(addFilters = false)
class BookingCustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingOrderService bookingOrderService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("API POST /api/v1/orders tao don dat ban thanh cong")
    @WithMockUser(username = "customer1", roles = "CUSTOMER")
    void testCreateOrder() throws Exception {
        CreateOrderRequest request = CreateOrderRequest.builder()
                .tableId(1L)
                .reservationTime(Instant.now().plusSeconds(3600))
                .partySize(2)
                .customerName("Nguyen Van B")
                .customerEmail("vanb@gmail.com")
                .paymentMethod(PaymentMethod.VNPAY)
                .build();

        OrderDto mockDto = OrderDto.builder()
                .id(1L)
                .orderCode("BV2026101701")
                .tableNumber("Ban 01")
                .totalAmount(BigDecimal.valueOf(150000))
                .status(OrderStatus.PENDING)
                .paymentStatus(PaymentStatus.UNPAID)
                .build();

        when(bookingOrderService.createOrder(anyLong(), any(CreateOrderRequest.class))).thenReturn(mockDto);

        mockMvc.perform(post("/api/v1/orders")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderCode").value("BV2026101701"))
                .andExpect(jsonPath("$.tableNumber").value("Ban 01"));
    }

    @Test
    @DisplayName("API GET /api/v1/orders/my tra ve danh sach lich su don")
    @WithMockUser(username = "customer1", roles = "CUSTOMER")
    void testGetMyOrders() throws Exception {
        OrderDto mockDto = OrderDto.builder()
                .id(1L)
                .orderCode("BV2026101701")
                .tableNumber("Ban 01")
                .build();

        when(bookingOrderService.getCustomerOrders(anyLong())).thenReturn(List.of(mockDto));

        mockMvc.perform(get("/api/v1/orders/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].orderCode").value("BV2026101701"));
    }
}
