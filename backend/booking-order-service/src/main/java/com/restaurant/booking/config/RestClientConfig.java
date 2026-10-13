package com.restaurant.booking.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

/**
 * Cau hinh RestClient goi noi bo sang Catalog & Table Service (Port 8082).
 */
@Configuration
public class RestClientConfig {

    @Value("${services.catalog.url:http://localhost:8082}")
    private String catalogServiceUrl;

    @Bean
    public RestClient catalogRestClient() {
        return RestClient.builder()
                .baseUrl(catalogServiceUrl)
                .build();
    }
}
