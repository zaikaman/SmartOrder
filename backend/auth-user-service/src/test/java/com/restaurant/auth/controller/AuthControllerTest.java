package com.restaurant.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.auth.dto.AuthResponse;
import com.restaurant.auth.dto.GoogleLoginRequest;
import com.restaurant.auth.dto.UserDto;
import com.restaurant.auth.entity.UserRole;
import com.restaurant.auth.exception.GlobalExceptionHandler;
import com.restaurant.auth.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AuthService authService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        AuthController authController = new AuthController(authService);
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/v1/auth/google thành công trả về 200 OK và JWT Token")
    void testLoginWithGoogleSuccess() throws Exception {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("valid.jwt.credential")
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("jwt_google_access_token")
                .expiresIn(86400)
                .user(UserDto.builder()
                        .id(1L)
                        .username("gg_user")
                        .email("user@gmail.com")
                        .role(UserRole.CUSTOMER)
                        .authProvider("GOOGLE")
                        .active(true)
                        .build())
                .build();

        when(authService.loginWithGoogle(any(GoogleLoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("jwt_google_access_token"))
                .andExpect(jsonPath("$.user.email").value("user@gmail.com"))
                .andExpect(jsonPath("$.user.authProvider").value("GOOGLE"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/google với credential rỗng trả về 400 Bad Request")
    void testLoginWithGoogleBlankCredential() throws Exception {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("")
                .build();

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Error"))
                .andExpect(jsonPath("$.messages.credential").exists());
    }

    @Test
    @DisplayName("POST /api/v1/auth/google với token giả mạo trả về 401 Unauthorized")
    void testLoginWithGoogleInvalidTokenReturns401() throws Exception {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("fake.invalid.credential")
                .build();

        when(authService.loginWithGoogle(any(GoogleLoginRequest.class)))
                .thenThrow(new BadCredentialsException("Google ID Token không hợp lệ hoặc đã hết hạn"));

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Google ID Token không hợp lệ hoặc đã hết hạn"));
    }

    @Test
    @DisplayName("POST /api/v1/auth/google với tài khoản bị khóa trả về 403 Forbidden")
    void testLoginWithGoogleLockedAccountReturns403() throws Exception {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("valid.token.for.locked.user")
                .build();

        when(authService.loginWithGoogle(any(GoogleLoginRequest.class)))
                .thenThrow(new IllegalStateException("Tài khoản Google này đã bị khóa"));

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("Tài khoản Google này đã bị khóa"));
    }
}
