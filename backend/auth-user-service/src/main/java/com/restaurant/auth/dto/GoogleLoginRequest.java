package com.restaurant.auth.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO yêu cầu đăng nhập bằng Google ID Token (Google OpenID Connect).
 * Backend chỉ tiếp nhận chuỗi credential được ký bởi Google và kiểm tra chữ ký số trực tiếp.
 * Mọi thông tin giả lập từ phía client bị loại bỏ hoàn toàn.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token hoặc credential không được để trống")
    private String credential;
}
