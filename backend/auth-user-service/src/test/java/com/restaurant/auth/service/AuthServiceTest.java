package com.restaurant.auth.service;

import com.restaurant.auth.dto.AuthResponse;
import com.restaurant.auth.dto.GoogleLoginRequest;
import com.restaurant.auth.dto.GoogleUserInfo;
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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private GoogleTokenVerifierService googleTokenVerifierService;

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
                .fullName("Nguyễn Văn An")
                .phone("0901234567")
                .role(UserRole.CUSTOMER)
                .authProvider("LOCAL")
                .active(true)
                .build();
    }

    @Test
    @DisplayName("Đăng ký tài khoản mới thành công")
    void testRegisterSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .username("khachhang02")
                .password("MatKhau123")
                .email("khachhang02@gmail.com")
                .fullName("Trần Thị Bình")
                .phone("0912345678")
                .build();

        when(userRepository.existsByUsername("khachhang02")).thenReturn(false);
        when(userRepository.existsByEmail("khachhang02@gmail.com")).thenReturn(false);
        when(passwordEncoder.encode("MatKhau123")).thenReturn("encoded_pass_02");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(2L);
            return u;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt_token_sample");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("jwt_token_sample", response.getAccessToken());
        assertEquals("khachhang02", response.getUser().getUsername());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi tên đăng nhập đã tồn tại")
    void testRegisterDuplicateUsername() {
        RegisterRequest request = RegisterRequest.builder()
                .username("khachhang01")
                .password("MatKhau123")
                .email("khachhang_moi@gmail.com")
                .fullName("Người Dùng Mới")
                .build();

        when(userRepository.existsByUsername("khachhang01")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi email đã tồn tại")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .username("khachhang_moi")
                .password("MatKhau123")
                .email("khachhang01@gmail.com")
                .fullName("Người Dùng Mới")
                .build();

        when(userRepository.existsByUsername("khachhang_moi")).thenReturn(false);
        when(userRepository.existsByEmail("khachhang01@gmail.com")).thenReturn(true);

        assertThrows(IllegalArgumentException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng nhập thành công với thông tin chính xác")
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
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu")
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
    @DisplayName("Đăng nhập Google OAuth2 thành công cho người dùng mới qua chữ ký Google hợp lệ")
    void testGoogleLoginNewUser() {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("valid_google_signed_jwt")
                .build();

        GoogleUserInfo userInfo = GoogleUserInfo.builder()
                .sub("google-sub-123456")
                .email("google_user@gmail.com")
                .name("Google User Test")
                .picture("https://google.com/avatar.jpg")
                .emailVerified(true)
                .build();

        when(googleTokenVerifierService.verify("valid_google_signed_jwt")).thenReturn(userInfo);
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
        assertEquals(UserRole.CUSTOMER, response.getUser().getRole());
        verify(googleTokenVerifierService).verify("valid_google_signed_jwt");
    }

    @Test
    @DisplayName("Đăng nhập Google OAuth2 thành công cho khách hàng cũ (CUSTOMER) và cập nhật avatar")
    void testGoogleLoginExistingCustomer() {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("valid_google_signed_jwt")
                .build();

        GoogleUserInfo userInfo = GoogleUserInfo.builder()
                .sub("google-sub-123456")
                .email("khachhang01@gmail.com")
                .name("Nguyễn Văn An Mới")
                .picture("https://lh3.googleusercontent.com/new-avatar.jpg")
                .emailVerified(true)
                .build();

        when(googleTokenVerifierService.verify("valid_google_signed_jwt")).thenReturn(userInfo);
        when(userRepository.findByEmail("khachhang01@gmail.com")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(sampleUser)).thenReturn("updated_jwt_token");

        AuthResponse response = authService.loginWithGoogle(request);

        assertNotNull(response);
        assertEquals("updated_jwt_token", response.getAccessToken());
        assertEquals("khachhang01@gmail.com", response.getUser().getEmail());
        assertEquals("https://lh3.googleusercontent.com/new-avatar.jpg", sampleUser.getAvatarUrl());
    }

    @Test
    @DisplayName("Chặn đăng nhập Google OAuth2 vào tài khoản ADMIN nội bộ (Phòng vệ chuyên sâu)")
    void testGoogleLoginRejectedForAdminAccount() {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("valid_google_signed_jwt_for_admin_email")
                .build();

        GoogleUserInfo userInfo = GoogleUserInfo.builder()
                .sub("google-sub-789")
                .email("admin@bepviet.vn")
                .name("Admin Attacker")
                .picture("https://google.com/avatar.jpg")
                .emailVerified(true)
                .build();

        User adminUser = User.builder()
                .id(10L)
                .username("admin")
                .email("admin@bepviet.vn")
                .role(UserRole.ADMIN)
                .authProvider("LOCAL")
                .active(true)
                .build();

        when(googleTokenVerifierService.verify("valid_google_signed_jwt_for_admin_email")).thenReturn(userInfo);
        when(userRepository.findByEmail("admin@bepviet.vn")).thenReturn(Optional.of(adminUser));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authService.loginWithGoogle(request));
        assertTrue(exception.getMessage().contains("Tài khoản quản trị hoặc nhân viên phải đăng nhập bằng tên đăng nhập và mật khẩu nội bộ"));
        verify(jwtService, never()).generateToken(any());
    }

    @Test
    @DisplayName("Chặn đăng nhập Google OAuth2 khi tài khoản đã bị khóa")
    void testGoogleLoginRejectedWhenAccountInactive() {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("valid_google_signed_jwt")
                .build();

        GoogleUserInfo userInfo = GoogleUserInfo.builder()
                .sub("google-sub-locked")
                .email("locked_user@gmail.com")
                .name("Locked User")
                .emailVerified(true)
                .build();

        User lockedUser = User.builder()
                .id(11L)
                .username("locked_user")
                .email("locked_user@gmail.com")
                .role(UserRole.CUSTOMER)
                .authProvider("GOOGLE")
                .active(false)
                .build();

        when(googleTokenVerifierService.verify("valid_google_signed_jwt")).thenReturn(userInfo);
        when(userRepository.findByEmail("locked_user@gmail.com")).thenReturn(Optional.of(lockedUser));
        when(userRepository.save(any(User.class))).thenReturn(lockedUser);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> authService.loginWithGoogle(request));
        assertTrue(exception.getMessage().contains("Tài khoản Google này đã bị khóa"));
    }

    @Test
    @DisplayName("Từ chối khi token Google không hợp lệ hoặc bị giả mạo")
    void testGoogleLoginInvalidToken() {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("fake_unverified_token")
                .build();

        when(googleTokenVerifierService.verify("fake_unverified_token"))
                .thenThrow(new BadCredentialsException("Google ID Token không hợp lệ hoặc đã hết hạn"));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> authService.loginWithGoogle(request));
        assertEquals("Google ID Token không hợp lệ hoặc đã hết hạn", exception.getMessage());
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("Từ chối khi credential bị để trống")
    void testGoogleLoginBlankCredential() {
        GoogleLoginRequest request = GoogleLoginRequest.builder()
                .credential("   ")
                .build();

        assertThrows(BadCredentialsException.class, () -> authService.loginWithGoogle(request));
        verify(googleTokenVerifierService, never()).verify(anyString());
    }
}
