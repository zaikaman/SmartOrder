package com.restaurant.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Service 2: Catalog & Dining Table Service (Port 8082)
 * Quan ly thuc don am thuc Viet Nam, ban an, ma QR va tai anh Cloudinary.
 */
@SpringBootApplication
public class CatalogTableServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CatalogTableServiceApplication.class, args);
    }
}
