package com.restaurant.booking.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Provider cung cấp và chuyển tiếp JWT Token để xác thực nội bộ giữa các microservices (Booking -> Catalog).
 */
@Component
@Slf4j
public class InternalTokenProvider {

    @Value("${jwt.secret:DoAnJ2EE_SuperSecretKey_For_Jwt_Authentication_2026_Minimum32Bytes}")
    private String secretKey;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Lấy token từ header Authorization của request hiện tại nếu có (ví dụ: nhân viên đang thao tác),
     * hoặc tự động sinh JWT nội bộ có vai trò ROLE_STAFF để gọi sang Catalog Table Service.
     */
    public String getOrGenerateBearerToken() {
        // 1. Kiểm tra Authorization header từ ServletRequest hiện tại
        try {
            RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
            if (attributes instanceof ServletRequestAttributes servletAttributes) {
                HttpServletRequest request = servletAttributes.getRequest();
                String authHeader = request.getHeader("Authorization");
                if (authHeader != null && authHeader.startsWith("Bearer ") && authHeader.length() > 7) {
                    return authHeader;
                }
            }
        } catch (Exception ex) {
            log.debug("Không thể lấy Authorization header từ RequestContext: {}", ex.getMessage());
        }

        // 2. Tự sinh JWT Token nội bộ có role STAFF dùng chung secret key
        String token = Jwts.builder()
                .subject("system-internal-booking-service")
                .claim("role", "STAFF")
                .claim("userId", 0L)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 3600000)) // Có hiệu lực 1 giờ
                .signWith(getSigningKey())
                .compact();

        return "Bearer " + token;
    }
}
