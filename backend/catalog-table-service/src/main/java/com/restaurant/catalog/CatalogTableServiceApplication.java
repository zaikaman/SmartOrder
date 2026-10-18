package com.restaurant.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Service 2: Catalog & Dining Table Service (Port 8082)
 * Quản lý thực đơn ẩm thực Việt Nam, bàn ăn, mã QR và tải ảnh Cloudinary.
 */
@SpringBootApplication
public class CatalogTableServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CatalogTableServiceApplication.class, args);
    }
}
