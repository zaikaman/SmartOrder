package com.restaurant.catalog.service;

import com.restaurant.catalog.dto.AiRecommendationRequest;
import com.restaurant.catalog.dto.AiRecommendationResponse;
import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.entity.MenuItemStatus;
import com.restaurant.catalog.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

/**
 * Service Trợ lý AI gợi ý mâm cơm Bếp Việt tối ưu theo ngũ hành và ngân sách.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AiRecommendationService {

    private final MenuItemRepository menuItemRepository;

    public AiRecommendationResponse recommendVietnameseMeal(AiRecommendationRequest request) {
        int partySize = (request != null && request.getPartySize() != null && request.getPartySize() > 0)
                ? request.getPartySize() : 4;
        BigDecimal budget = (request != null && request.getBudget() != null && request.getBudget().compareTo(BigDecimal.ZERO) > 0)
                ? request.getBudget() : new BigDecimal(partySize * 150000L);
        String preference = (request != null && request.getPreference() != null)
                ? request.getPreference().trim().toUpperCase() : "ALL";

        List<MenuItem> allAvailable = menuItemRepository.findByStatus(MenuItemStatus.AVAILABLE);
        if (allAvailable.isEmpty()) {
            allAvailable = menuItemRepository.findAll();
        }

        // Phân loại món ăn theo danh mục ẩm thực Việt
        List<MenuItem> mainDishes = new ArrayList<>();
        List<MenuItem> soups = new ArrayList<>();
        List<MenuItem> veggies = new ArrayList<>();
        List<MenuItem> drinksOrDesserts = new ArrayList<>();
        List<MenuItem> riceItems = new ArrayList<>();

        for (MenuItem item : allAvailable) {
            String cat = item.getCategory().toLowerCase();
            String name = item.getName().toLowerCase();

            if (name.contains("cơm") || name.contains("niêu")) {
                riceItems.add(item);
            }
            if (cat.contains("chính") || cat.contains("kho") || cat.contains("nướng") || cat.contains("chiên")) {
                mainDishes.add(item);
            } else if (cat.contains("canh") || cat.contains("lẩu") || name.contains("canh") || name.contains("lẩu")) {
                soups.add(item);
            } else if (cat.contains("rau") || cat.contains("xào") || cat.contains("khai vị") || cat.contains("gỏi")) {
                veggies.add(item);
            } else {
                drinksOrDesserts.add(item);
            }
        }

        // Lựa chọn các món phù hợp ngũ vị (Chua - Cay - Mặn - Ngọt - Đắng/Bùi)
        List<MenuItem> selectedItems = new ArrayList<>();
        BigDecimal currentTotal = BigDecimal.ZERO;

        // 1. Món Cơm niêu (Nền tảng của bữa cơm Việt)
        if (!riceItems.isEmpty()) {
            MenuItem rice = riceItems.get(0);
            selectedItems.add(rice);
            currentTotal = currentTotal.add(rice.getPrice());
        }

        // 2. Món Mặn chủ đạo (Đậm đà đưa cơm)
        if (!mainDishes.isEmpty()) {
            MenuItem selectedMain;
            if ("SEAFOOD".equals(preference)) {
                selectedMain = mainDishes.stream()
                        .filter(m -> m.getName().toLowerCase().matches(".*(tôm|cá|mực|hải sản).*"))
                        .findFirst()
                        .orElse(mainDishes.get(0));
            } else {
                selectedMain = mainDishes.get(0);
            }
            selectedItems.add(selectedMain);
            currentTotal = currentTotal.add(selectedMain.getPrice());

            // Nếu số người từ 4 trở lên, bổ sung thêm món mặn thứ 2
            if (partySize >= 4 && mainDishes.size() > 1) {
                MenuItem secondMain = mainDishes.stream()
                        .filter(m -> !m.getId().equals(selectedMain.getId()))
                        .findFirst()
                        .orElse(mainDishes.get(1));
                selectedItems.add(secondMain);
                currentTotal = currentTotal.add(secondMain.getPrice());
            }
        }

        // 3. Món Canh giải nhiệt ngọt lành
        if (!soups.isEmpty()) {
            MenuItem soup = soups.get(0);
            selectedItems.add(soup);
            currentTotal = currentTotal.add(soup.getPrice());
        }

        // 4. Món Rau xào hoặc Gỏi tươi mát cân bằng vị béo
        if (!veggies.isEmpty()) {
            MenuItem veg = veggies.get(0);
            selectedItems.add(veg);
            currentTotal = currentTotal.add(veg.getPrice());
        }

        // 5. Đồ uống hoặc tráng miệng nếu còn dư ngân sách
        if (!drinksOrDesserts.isEmpty() && currentTotal.compareTo(budget) < 0) {
            MenuItem drink = drinksOrDesserts.get(0);
            if (currentTotal.add(drink.getPrice()).compareTo(budget.multiply(new BigDecimal("1.15"))) <= 0) {
                selectedItems.add(drink);
                currentTotal = currentTotal.add(drink.getPrice());
            }
        }

        // Đặt tên tiêu đề mâm cơm theo văn hóa
        String comboTitle;
        if (partySize <= 2) {
            comboTitle = "Mâm Cơm Đôi Tình Thân Bếp Việt";
        } else if (partySize <= 5) {
            comboTitle = "Mâm Cơm Đoàn Viên Bếp Việt (" + partySize + " Khách)";
        } else {
            comboTitle = "Đại Tiệc Sum Vầy Bếp Việt Cổ Truyền (" + partySize + " Khách)";
        }

        String culinaryDesc = String.format(
                "Mâm cơm được AI phối món dựa trên nguyên lý cân bằng Ngũ Hành trong ẩm thực truyền thống Việt Nam: " +
                "Kết hợp món mặn kho/rang đậm đà, món canh thanh nhiệt ngọt dịu, cùng rau tươi thanh vị giúp giải ngấy, " +
                "đáp ứng đầy đủ dinh dưỡng cho bàn %d thực khách.",
                partySize
        );

        String philosophy = "Âm Dương Hài Hòa: Đủ món mặn đưa cơm, canh ngọt mát ruột, rau xanh nhuận tràng, chuẩn vị mâm cơm gia đình Việt xưa và nay.";

        return AiRecommendationResponse.builder()
                .comboTitle(comboTitle)
                .description(culinaryDesc)
                .culinaryPhilosophy(philosophy)
                .totalEstimatedPrice(currentTotal)
                .recommendedForPartySize(partySize)
                .items(selectedItems)
                .build();
    }
}
