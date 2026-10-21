package com.restaurant.auth.service;

import com.restaurant.auth.dto.*;
import com.restaurant.auth.entity.User;
import com.restaurant.auth.entity.UserRole;
import com.restaurant.auth.repository.UserRepository;
import com.restaurant.auth.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Tên đăng nhập đã tồn tại trên hệ thống");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Địa chỉ email đã được sử dụng");
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .role(UserRole.CUSTOMER)
                .authProvider("LOCAL")
                .active(true)
                .build();

        user = userRepository.save(user);
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(token)
                .expiresIn(86400)
                .user(toUserDto(user))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác"));

        if (!user.isActive()) {
            throw new IllegalStateException("Tài khoản đã bị khóa hoặc vô hiệu hóa");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Tài khoản hoặc mật khẩu không chính xác");
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(token)
                .expiresIn(86400)
                .user(toUserDto(user))
                .build();
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        String email = request.getEmail();
        String fullName = request.getName();
        String picture = request.getPicture();

        // Nếu request chưa có email/name trực tiếp, tiến hành parse từ JWT credential payload
        if (email == null || email.isBlank()) {
            try {
                String[] parts = request.getCredential().split("\\.");
                if (parts.length >= 2) {
                    byte[] decoded = java.util.Base64.getUrlDecoder().decode(parts[1]);
                    String payloadJson = new String(decoded, java.nio.charset.StandardCharsets.UTF_8);
                    com.fasterxml.jackson.databind.JsonNode rootNode = new com.fasterxml.jackson.databind.ObjectMapper().readTree(payloadJson);
                    if (rootNode.has("email")) {
                        email = rootNode.get("email").asText();
                    }
                    if (rootNode.has("name")) {
                        fullName = rootNode.get("name").asText();
                    }
                    if (rootNode.has("picture")) {
                        picture = rootNode.get("picture").asText();
                    }
                }
            } catch (Exception ex) {
                log.warn("Không thể parse payload từ Google credential: {}", ex.getMessage());
            }
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Không tìm thấy thông tin email từ tài khoản Google");
        }

        final String userEmail = email.trim().toLowerCase();
        final String displayName = (fullName != null && !fullName.isBlank()) ? fullName.trim() : userEmail.split("@")[0];
        final String avatar = picture;

        User user = userRepository.findByEmail(userEmail)
                .map(existingUser -> {
                    // Cập nhật avatar nếu có
                    if (avatar != null && !avatar.isBlank()) {
                        existingUser.setAvatarUrl(avatar);
                    }
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // Tạo mới người dùng từ Google OAuth2
                    String generatedUsername = "gg_" + userEmail.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5);
                    User newUser = User.builder()
                            .username(generatedUsername)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Mật khẩu ngẫu nhiên an toàn
                            .email(userEmail)
                            .fullName(displayName)
                            .role(UserRole.CUSTOMER)
                            .authProvider("GOOGLE")
                            .avatarUrl(avatar)
                            .active(true)
                            .build();
                    return userRepository.save(newUser);
                });

        if (!user.isActive()) {
            throw new IllegalStateException("Tài khoản Google này đã bị khóa");
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .accessToken(token)
                .expiresIn(86400)
                .user(toUserDto(user))
                .build();
    }

    public UserDto getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin người dùng"));
        return toUserDto(user);
    }

    public UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .authProvider(user.getAuthProvider())
                .avatarUrl(user.getAvatarUrl())
                .active(user.isActive())
                .build();
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toUserDto)
                .toList();
    }

    public UserDto updateUserRole(Long id, UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + id));
        user.setRole(role);
        User saved = userRepository.save(user);
        return toUserDto(saved);
    }

    public UserDto updateUserStatus(Long id, boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với ID: " + id));
        user.setActive(active);
        User saved = userRepository.save(user);
        return toUserDto(saved);
    }
}
