package com.restaurant.booking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Cấu hình RestClient gọi nội bộ sang Catalog & Table Service (Cổng 8082).
 */
@Configuration
public class RestClientConfig {

    @Value("${services.catalog.url:http://localhost:8082}")
    private String catalogServiceUrl;

    @Bean
    public RestClient catalogRestClient() {
        String cleanUrl = catalogServiceUrl != null ? catalogServiceUrl.replaceAll("/+$", "") : "http://localhost:8082";
        return RestClient.builder()
                .baseUrl(cleanUrl)
                .build();
    }
}
