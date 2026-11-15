package com.restaurant.auth.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.restaurant.auth.dto.GoogleUserInfo;
import com.restaurant.auth.service.GoogleTokenVerifierService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;

/**
 * Cài đặt xác thực Google ID Token chuẩn Production.
 * Kiểm tra toàn diện: Chữ ký số RSA với chứng chỉ công khai của Google,
 * Audience (client_id), Issuer (accounts.google.com), thời hạn (exp), và trạng thái xác minh email (email_verified).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleTokenVerifierServiceImpl implements GoogleTokenVerifierService {

    private final GoogleIdTokenVerifier verifier;

    @Override
    public GoogleUserInfo verify(String idTokenString) {
        if (idTokenString == null || idTokenString.isBlank()) {
            throw new BadCredentialsException("Google ID token không được để trống");
        }

        try {
            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                log.warn("Xác thực Google ID Token thất bại: token không hợp lệ, sai Audience hoặc đã hết hạn");
                throw new BadCredentialsException("Google ID Token không hợp lệ hoặc đã hết hạn");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            Boolean emailVerified = payload.getEmailVerified();
            if (emailVerified == null || !emailVerified) {
                log.warn("Tài khoản Google chưa xác minh email: {}", payload.getEmail());
                throw new BadCredentialsException("Tài khoản Google chưa xác minh địa chỉ email");
            }

            String email = payload.getEmail();
            if (email == null || email.isBlank()) {
                throw new BadCredentialsException("Google ID Token không chứa thông tin email hợp lệ");
            }

            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");
            String sub = payload.getSubject();

            return GoogleUserInfo.builder()
                    .sub(sub)
                    .email(email.trim().toLowerCase())
                    .name(name != null ? name.trim() : null)
                    .picture(picture)
                    .emailVerified(true)
                    .build();

        } catch (GeneralSecurityException | IOException ex) {
            log.error("Lỗi khi xác thực chữ ký số Google ID Token: {}", ex.getMessage());
            throw new BadCredentialsException("Không thể xác thực Google ID Token với máy chủ Google: " + ex.getMessage(), ex);
        }
    }
}
