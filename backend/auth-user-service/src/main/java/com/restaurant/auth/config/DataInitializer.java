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
 * Nap san 3 tai khoan mac dinh (admin, staff, customer) khi khoi dong he thong.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initUserIfNotExists("admin", "Admin@123", "admin@bepviet.vn", "Quan Tri Vien Bep Viet", "0901000001", UserRole.ADMIN);
        initUserIfNotExists("staff", "Staff@123", "staff@bepviet.vn", "Nhan Vien Phuc Vu", "0901000002", UserRole.STAFF);
        initUserIfNotExists("customer", "Customer@123", "customer@gmail.com", "Nguyen Van An", "0901000003", UserRole.CUSTOMER);
    }

    private void initUserIfNotExists(String username, String password, String email, String fullName, String phone, UserRole role) {
        if (!userRepository.existsByUsername(username)) {
            User user = User.builder()
                    .username(username)
                    .password(passwordEncoder.encode(password))
                    .email(email)
                    .fullName(fullName)
                    .phone(phone)
                    .role(role)
                    .active(true)
                    .build();
            userRepository.save(user);
            log.info("Khoi tao tai khoan mac dinh: {} voi vai tro: {}", username, role);
        }
    }
}
