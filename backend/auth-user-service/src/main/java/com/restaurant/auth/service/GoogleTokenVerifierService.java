package com.restaurant.auth.service;

import com.restaurant.auth.dto.GoogleUserInfo;

/**
 * Giao diện định nghĩa dịch vụ xác thực Google ID Token với Google OpenID Connect.
 */
public interface GoogleTokenVerifierService {

    /**
     * Xác thực chuỗi ID Token từ Google và trả về thông tin người dùng nếu hợp lệ.
     *
     * @param idTokenString Chuỗi JWT ID Token do Google cấp
     * @return GoogleUserInfo Thông tin người dùng đã được Google xác thực
     */
    GoogleUserInfo verify(String idTokenString);
}
