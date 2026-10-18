package com.restaurant.auth.config;

import com.restaurant.auth.entity.User;
import com.restaurant.auth.entity.UserRole;
import com.restaurant.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Nạp sẵn 3 tài khoản mặc định (admin, staff, customer) khi khởi động hệ thống.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // Tài khoản theo gợi ý trực quan trên giao diện đăng nhập (123456)
        initOrUpdateUser("admin", "123456", "admin@bepviet.vn", "Quản Trị Viên Bếp Việt", "0901000001", UserRole.ADMIN);
        initOrUpdateUser("staff01", "123456", "staff01@bepviet.vn", "Nhân Viên Phục Vụ 01", "0901000002", UserRole.STAFF);
        initOrUpdateUser("staff", "123456", "staff@bepviet.vn", "Nhân Viên Phục Vụ", "0901000003", UserRole.STAFF);
        initOrUpdateUser("khachhang", "123456", "khachhang@gmail.com", "Nguyễn Văn An", "0901000004", UserRole.CUSTOMER);
        initOrUpdateUser("customer", "123456", "customer@gmail.com", "Khách Hàng Thân Thiết", "0901000005", UserRole.CUSTOMER);
    }

    private void initOrUpdateUser(String username, String password, String email, String fullName, String phone, UserRole role) {
        User user = userRepository.findByUsername(username).orElse(null);
        if (user == null) {
            user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .email(email)
                    .fullName(fullName)
                    .phone(phone)
                    .role(role)
                    .active(true)
                    .build();
            userRepository.save(user);
            log.info("Khởi tạo tài khoản mặc định: {} với vai trò: {}", username, role);
        } else {
            user.setPassword(passwordEncoder.encode(password));
            user.setRole(role);
            user.setActive(true);
            userRepository.save(user);
            log.info("Cập nhật mật khẩu cho tài khoản: {}", username);
        }
    }
}

