package com.restaurant.booking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Service 3: Booking & Order Service (Port 8083)
 * Xu ly dat ban truoc, goi mon tai ban, thanh toan VNPAY Sandbox, gui Email xac nhan va xuat hoa don PDF.
 */
@SpringBootApplication
public class BookingOrderServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BookingOrderServiceApplication.class, args);
    }
}
