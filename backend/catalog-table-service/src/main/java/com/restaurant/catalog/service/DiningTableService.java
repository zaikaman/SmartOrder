package com.restaurant.catalog.service;

import com.restaurant.catalog.entity.DiningTable;
import com.restaurant.catalog.entity.TableStatus;
import com.restaurant.catalog.exception.ResourceNotFoundException;
import com.restaurant.catalog.repository.DiningTableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý nghiệp vụ Bàn ăn (Dining Table) và sinh mã QR cho Catalog Service.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DiningTableService {

    private final DiningTableRepository tableRepository;
    private final QrCodeGeneratorService qrCodeGeneratorService;

    @Value("${app.frontend-base-url:${app.frontend-url:http://localhost:5173}}")
    private String frontendUrl;

    public List<DiningTable> getAllTables(TableStatus status, Integer minCapacity, String area) {
        List<DiningTable> tables = tableRepository.findAll();

        return tables.stream()
                .filter(t -> status == null || t.getStatus() == status)
                .filter(t -> minCapacity == null || t.getCapacity() >= minCapacity)
                .filter(t -> area == null || area.isBlank() || t.getArea().equalsIgnoreCase(area.trim()))
                .collect(Collectors.toList());
    }

    public DiningTable getTableById(Long id) {
        return tableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn ăn với mã ID: " + id));
    }

    public DiningTable getTableByNumber(String tableNumber) {
        return tableRepository.findByTableNumber(tableNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn ăn với số bàn: " + tableNumber));
    }

    public byte[] generateTableQrPng(Long tableId, int width, int height) {
        DiningTable table = getTableById(tableId);
        String targetUrl = frontendUrl + "/table/" + table.getTableNumber();
        log.info("Đang sinh mã QR cho bàn {} với URL: {}", table.getTableNumber(), targetUrl);
        return qrCodeGeneratorService.generateQrCodePng(targetUrl, width, height);
    }

    @Transactional
    public DiningTable updateTableStatus(Long id, TableStatus status) {
        DiningTable table = getTableById(id);
        table.setStatus(status);
        log.info("Cập nhật trạng thái bàn {} (ID: {}) thành {}", table.getTableNumber(), id, status);
        return tableRepository.save(table);
    }
}

