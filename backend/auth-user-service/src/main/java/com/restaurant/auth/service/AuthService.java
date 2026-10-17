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
            throw new IllegalArgumentException("Ten dang nhap da ton tai tren he thong");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Dia chi email da duoc su dung");
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
                .orElseThrow(() -> new IllegalArgumentException("Tai khoan hoac mat khau khong chinh xac"));

        if (!user.isActive()) {
            throw new IllegalStateException("Tai khoan da bi khoa hoac vo hieu hoa");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Tai khoan hoac mat khau khong chinh xac");
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

        // Neu request chua co email/name truc tiep, tien hanh parse tu JWT credential payload
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
                log.warn("Khong the parse payload tu Google credential: {}", ex.getMessage());
            }
        }

        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Khong tim thay thong tin email tu tai khoan Google");
        }

        final String userEmail = email.trim().toLowerCase();
        final String displayName = (fullName != null && !fullName.isBlank()) ? fullName.trim() : userEmail.split("@")[0];
        final String avatar = picture;

        User user = userRepository.findByEmail(userEmail)
                .map(existingUser -> {
                    // Cap nhat avatar neu co
                    if (avatar != null && !avatar.isBlank()) {
                        existingUser.setAvatarUrl(avatar);
                    }
                    return userRepository.save(existingUser);
                })
                .orElseGet(() -> {
                    // Tao moi nguoi dung tu Google OAuth2
                    String generatedUsername = "gg_" + userEmail.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 5);
                    User newUser = User.builder()
                            .username(generatedUsername)
                            .password(passwordEncoder.encode(UUID.randomUUID().toString())) // Mat khau ngau nhien an toan
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
            throw new IllegalStateException("Tai khoan Google nay da bi khoa");
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
                .orElseThrow(() -> new IllegalArgumentException("Khong tim thay thong tin nguoi dung"));
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
}
