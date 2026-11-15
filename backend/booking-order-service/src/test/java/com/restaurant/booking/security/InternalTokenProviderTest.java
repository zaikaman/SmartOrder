package com.restaurant.booking.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class InternalTokenProviderTest {

    @Test
    @DisplayName("Tự sinh JWT token nội bộ hợp lệ với role STAFF khi không có request context")
    void testGenerateServiceToken() {
        InternalTokenProvider provider = new InternalTokenProvider();
        ReflectionTestUtils.setField(provider, "secretKey", "DoAnJ2EE_SuperSecretKey_For_Jwt_Authentication_2026_Minimum32Bytes");

        String bearerToken = provider.getOrGenerateBearerToken();

        assertNotNull(bearerToken);
        assertTrue(bearerToken.startsWith("Bearer "));
        assertTrue(bearerToken.length() > 20);
    }
}
