package com.restaurant.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Service 3: Booking & Order Service (Port 8083)
 * Xử lý đặt bàn trước, gọi món tại bàn, thanh toán VNPAY Sandbox, gửi Email xác nhận và xuất hóa đơn PDF.
 */
@SpringBootApplication
public class BookingOrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookingOrderServiceApplication.class, args);
    }
}
