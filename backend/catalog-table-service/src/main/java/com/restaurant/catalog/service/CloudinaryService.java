package com.restaurant.catalog.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

/**
 * Service tích hợp Cloudinary API để tải và quản lý hình ảnh món ăn trực tuyến.
 */
@Service
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final boolean isConfigured;

    public CloudinaryService(
            @Value("${cloudinary.cloud-name:demo}") String cloudName,
            @Value("${cloudinary.api-key:}") String apiKey,
            @Value("${cloudinary.api-secret:}") String apiSecret
    ) {
        if (apiKey != null && !apiKey.isBlank() && apiSecret != null && !apiSecret.isBlank()) {
            this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            this.isConfigured = true;
            log.info("Cloudinary Service đã khởi tạo thành công với Cloud Name: {}", cloudName);
        } else {
            this.cloudinary = null;
            this.isConfigured = false;
            log.warn("Chưa cấu hình CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET. Sẽ kích hoạt cơ chế fallback lưu trữ/URL thay thế.");
        }
    }

    /**
     * Tải tệp hình ảnh lên Cloudinary API.
     *
     * @param file Tệp ảnh multipart tải lên từ client
     * @return Đường dẫn URL ảnh trực tuyến (secure_url)
     */
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Tệp tải lên không được để trống.");
        }

        // Kiểm tra định dạng tệp ảnh cơ bản
        String contentType = file.getContentType();
        if (contentType != null && !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận các tệp định dạng hình ảnh (JPEG, PNG, WEBP).");
        }

        if (isConfigured && cloudinary != null) {
            try {
                String publicId = "menu_" + UUID.randomUUID().toString().substring(0, 8);
                Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                        "folder", "bep-viet/menu",
                        "public_id", publicId,
                        "resource_type", "auto"
                ));
                String secureUrl = (String) uploadResult.get("secure_url");
                log.info("Đã tải ảnh thành công lên Cloudinary: {}", secureUrl);
                return secureUrl;
            } catch (IOException ex) {
                log.error("Lỗi khi tải ảnh lên Cloudinary API: {}", ex.getMessage(), ex);
                throw new RuntimeException("Không thể tải ảnh lên dịch vụ Cloudinary: " + ex.getMessage());
            }
        }

        // Fallback thực tế khi chạy môi trường cục bộ chưa có khóa Cloudinary API
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "food.jpg";
        log.warn("Cloudinary API Key chưa cung cấp. Sử dụng Unsplash Vietnamese Food URL an toàn làm fallback cho '{}'", originalFilename);
        return "https://images.unsplash.com/photo-1503764628056-0c47577a12da?auto=format&fit=crop&w=800&q=80";
    }
}
