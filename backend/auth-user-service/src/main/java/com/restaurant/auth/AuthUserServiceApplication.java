package com.restaurant.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Service 1: Authentication & User Management Service (Port 8081)
 * Quan ly tai khoan, dang ky, dang nhap va phan quyen nguoi dung.
 */
@SpringBootApplication
public class AuthUserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthUserServiceApplication.class, args);
    }
}
