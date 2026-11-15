package com.restaurant.auth.service.impl;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.restaurant.auth.dto.GoogleUserInfo;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;

import java.io.IOException;
import java.security.GeneralSecurityException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GoogleTokenVerifierServiceImplTest {

    @Mock
    private GoogleIdTokenVerifier verifier;

    private GoogleTokenVerifierServiceImpl verifierService;

    @BeforeEach
    void setUp() {
        verifierService = new GoogleTokenVerifierServiceImpl(verifier);
    }

    @Test
    @DisplayName("Xác thực thành công khi Google ID Token có chữ ký hợp lệ và email đã xác minh")
    void testVerifyValidTokenSuccess() throws Exception {
        String tokenString = "valid.google.jwt";
        GoogleIdToken idToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("customer@gmail.com");
        payload.setEmailVerified(true);
        payload.setSubject("google-sub-id-001");
        payload.set("name", "Customer Name");
        payload.set("picture", "https://avatar.google.com/pic.jpg");

        when(verifier.verify(tokenString)).thenReturn(idToken);
        when(idToken.getPayload()).thenReturn(payload);

        GoogleUserInfo userInfo = verifierService.verify(tokenString);

        assertNotNull(userInfo);
        assertEquals("customer@gmail.com", userInfo.getEmail());
        assertTrue(userInfo.isEmailVerified());
        assertEquals("Customer Name", userInfo.getName());
        assertEquals("https://avatar.google.com/pic.jpg", userInfo.getPicture());
        assertEquals("google-sub-id-001", userInfo.getSub());
    }

    @Test
    @DisplayName("Từ chối khi token là null hoặc rỗng")
    void testVerifyBlankTokenThrowsException() {
        assertThrows(BadCredentialsException.class, () -> verifierService.verify(null));
        assertThrows(BadCredentialsException.class, () -> verifierService.verify("   "));
    }

    @Test
    @DisplayName("Từ chối khi GoogleIdTokenVerifier trả về null (sai chữ ký, sai audience hoặc hết hạn)")
    void testVerifyInvalidTokenReturnsNullThrowsException() throws Exception {
        when(verifier.verify("invalid.token")).thenReturn(null);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> verifierService.verify("invalid.token"));
        assertTrue(exception.getMessage().contains("không hợp lệ hoặc đã hết hạn"));
    }

    @Test
    @DisplayName("Từ chối khi tài khoản Google chưa được xác minh địa chỉ email")
    void testVerifyUnverifiedEmailThrowsException() throws Exception {
        String tokenString = "unverified.email.token";
        GoogleIdToken idToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmail("unverified@gmail.com");
        payload.setEmailVerified(false);

        when(verifier.verify(tokenString)).thenReturn(idToken);
        when(idToken.getPayload()).thenReturn(payload);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> verifierService.verify(tokenString));
        assertTrue(exception.getMessage().contains("chưa xác minh địa chỉ email"));
    }

    @Test
    @DisplayName("Từ chối khi token thiếu email")
    void testVerifyMissingEmailThrowsException() throws Exception {
        String tokenString = "no.email.token";
        GoogleIdToken idToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = new GoogleIdToken.Payload();
        payload.setEmailVerified(true);
        payload.setEmail(null);

        when(verifier.verify(tokenString)).thenReturn(idToken);
        when(idToken.getPayload()).thenReturn(payload);

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> verifierService.verify(tokenString));
        assertTrue(exception.getMessage().contains("không chứa thông tin email hợp lệ"));
    }

    @Test
    @DisplayName("Bắt lỗi GeneralSecurityException và chuyển thành BadCredentialsException")
    void testVerifySecurityExceptionThrowsBadCredentialsException() throws Exception {
        when(verifier.verify("corrupt.token")).thenThrow(new GeneralSecurityException("Invalid key"));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> verifierService.verify("corrupt.token"));
        assertTrue(exception.getMessage().contains("Không thể xác thực Google ID Token với máy chủ Google"));
    }

    @Test
    @DisplayName("Bắt lỗi IOException và chuyển thành BadCredentialsException")
    void testVerifyIOExceptionThrowsBadCredentialsException() throws Exception {
        when(verifier.verify("network.error.token")).thenThrow(new IOException("Connection timed out"));

        BadCredentialsException exception = assertThrows(BadCredentialsException.class,
                () -> verifierService.verify("network.error.token"));
        assertTrue(exception.getMessage().contains("Không thể xác thực Google ID Token với máy chủ Google"));
    }
}
