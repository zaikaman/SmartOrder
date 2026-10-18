package com.restaurant.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Service 1: Authentication & User Management Service (Port 8081)
 * Quản lý tài khoản, đăng ký, đăng nhập và phân quyền người dùng.
 */
@SpringBootApplication
public class AuthUserServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthUserServiceApplication.class, args);
    }
}
