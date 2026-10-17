package com.restaurant.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token or credential cannot be blank")
    private String credential;

    // Optional client-decoded fallback info (useful for dev/offline testing)
    private String email;
    private String name;
    private String picture;
}
