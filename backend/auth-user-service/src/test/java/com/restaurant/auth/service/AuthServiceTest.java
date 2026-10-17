package com.restaurant.auth.service;

import com.restaurant.auth.dto.AuthResponse;
import com.restaurant.auth.dto.GoogleLoginRequest;
import com.restaurant.auth.dto.LoginRequest;
import com.restaurant.auth.dto.RegisterRequest;
import com.restaurant.auth.entity.User;
import com.restaurant.auth.entity.UserRole;
import com.restaurant.auth.repository.UserRepository;
import com.restaurant.auth.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(1L)
                .username("khachhang01")
                .password("encoded_pass")
                .email("khachhang01@gmail.com")
                .fullName("Nguyen Van An")
                .phone("0901234567")
                .role(UserRole.CUSTOMER)
                .authProvider("LOCAL")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Dang ky tai khoan moi thanh cong")
    void testRegisterSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .username("khachhang01")
                .password("MatKhau123")
                .email("khachhang01@gmail.com")
                .fullName("Nguyen Van An")
                .phone("0901234567")
                .build();

        when(userRepository.existsByUsername("khachhang01")).thenReturn(false);
        when(userRepository.existsByEmail("khachhang01@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("MatKhau123")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt_token_sample");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt_token_sample", response.getAccessToken());
        assertEquals("khachhang01", response.getUser().getUsername());
        assertEquals("khachhang01@gmail.com", response.getUser().getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Dang nhap thanh cong voi thong tin chinh xac")
    void testLoginSuccess() {
        LoginRequest request = LoginRequest.builder()
                .username("khachhang01")
                .password("MatKhau123")
                .build();

        when(userRepository.findByUsername("khachhang01")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("MatKhau123", "encoded_pass")).thenReturn(true);
        when(jwtService.generateToken(sampleUser)).thenReturn("jwt_token_sample");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt_token_sample", response.getAccessToken());
        assertEquals(UserRole.CUSTOMER, response.getUser().getRole());
    }

    @Test
    @DisplayName("Dang nhap that bai khi sai mat khau")
    void testLoginWrongPassword() {
        LoginRequest request = LoginRequest.builder()
                .username("khachhang01")
                .password("MatKhauSai")
                .build();

        when(userRepository.findByUsername("khachhang01")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("MatKhauSai", "encoded_pass")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Dang nhap Google OAuth2 thanh cong cho nguoi dung moi")
    void testGoogleLoginNewUser() {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("mock_google_credential")
                .email("google_user@gmail.com")
                .name("Google User Test")
                .picture("https://google.com/avatar.jpg")
                .build();

        when(userRepository.findByEmail("google_user@gmail.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("random_encoded_pass");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(99L);
            return u;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("google_jwt_token");

        AuthResponse response = authService.loginWithGoogle(request);

        assertNotNull(response);
        assertEquals("google_jwt_token", response.getAccessToken());
        assertEquals("google_user@gmail.com", response.getUser().getEmail());
        assertEquals("GOOGLE", response.getUser().getAuthProvider());
    }
}
