package com.restaurant.catalog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.catalog.dto.AiRecommendationRequest;
import com.restaurant.catalog.dto.AiRecommendationResponse;
import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.entity.MenuItemStatus;
import com.restaurant.catalog.repository.MenuItemRepository;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service Trợ lý AI gợi ý mâm cơm Bếp Việt tối ưu theo ngũ hành và ngân sách.
 * Tích hợp mô hình AI bên ngoài (Google GenAI / OpenAI format) qua GEMINI_BASE_URL, GEMINI_MODEL, GEMINI_API_KEY.
 * Có cơ chế bảo vệ ngân sách nghiêm ngặt (Strict Budget Guard) và chống lặp món ăn.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class AiRecommendationService {

    private final MenuItemRepository menuItemRepository;
    private final ObjectMapper objectMapper;

    @Value("${gemini.base-url:https://cheapkeyai.shop/v1}")
    private String geminiBaseUrl;

    @Value("${gemini.api-key:}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String geminiModel;

    private static final HttpClient HTTP_CLIENT = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    private static class AiResult {
        @Builder.Default
        private List<Long> selectedIds = new ArrayList<>();
        private String comboTitle;
        private String description;
        private String culinaryPhilosophy;
    }

    public AiRecommendationResponse recommendVietnameseMeal(AiRecommendationRequest request) {
        int partySize = (request != null && request.getPartySize() != null && request.getPartySize() > 0)
                ? request.getPartySize() : 4;
        BigDecimal budget = (request != null && request.getBudget() != null && request.getBudget().compareTo(BigDecimal.ZERO) > 0)
                ? request.getBudget() : new BigDecimal(partySize * 150000L);
        String preference = (request != null && request.getPreference() != null)
                ? request.getPreference().trim().toUpperCase() : "ALL";
        String note = (request != null && request.getNote() != null)
                ? request.getNote().trim() : "";

        List<MenuItem> allAvailable = menuItemRepository.findByStatus(MenuItemStatus.AVAILABLE);
        if (allAvailable.isEmpty()) {
            allAvailable = menuItemRepository.findAll();
        }

        if (allAvailable.isEmpty()) {
            return AiRecommendationResponse.builder()
                    .comboTitle("Thực đơn hiện đang cập nhật")
                    .description("Nhà hàng đang cập nhật món mới. Vui lòng quay lại sau.")
                    .culinaryPhilosophy("Tinh hoa ẩm thực Bếp Việt.")
                    .totalEstimatedPrice(BigDecimal.ZERO)
                    .recommendedForPartySize(partySize)
                    .items(Collections.emptyList())
                    .build();
        }

        // 1. Thử gọi mô hình AI bên ngoài nếu có API Key
        AiResult aiResult = null;
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            aiResult = callAiModel(allAvailable, partySize, budget, preference, note);
        }

        // 2. Nếu AI không khả dụng hoặc gọi thất bại, sử dụng thuật toán quy tắc cân bằng ngũ hành tối ưu
        if (aiResult == null || aiResult.getSelectedIds().isEmpty()) {
            log.info("Sử dụng thuật toán quy tắc cân bằng ngũ hành cho ngân sách {} VNĐ và {} khách", budget, partySize);
            aiResult = generateRuleBasedRecommendation(allAvailable, partySize, budget, preference, note);
        }

        // 3. Thực thi Strict Budget & No Duplicate Guard trên kết quả
        return buildGuardedResponse(aiResult, allAvailable, budget, partySize);
    }

    private AiResult callAiModel(List<MenuItem> items, int partySize, BigDecimal budget, String preference, String note) {
        // Ưu tiên 1: Google GenAI format (tương thích cheapkeyai.shop / Google GenAI SDK)
        AiResult result = callGoogleGenAi(items, partySize, budget, preference, note);
        if (result != null && !result.getSelectedIds().isEmpty()) {
            return result;
        }

        // Ưu tiên 2: OpenAI chat completions format
        result = callOpenAiFormat(items, partySize, budget, preference, note);
        if (result != null && !result.getSelectedIds().isEmpty()) {
            return result;
        }

        return null;
    }

    private String buildPrompt(List<MenuItem> items, int partySize, BigDecimal budget, String preference, String note) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Bạn là bếp trưởng và chuyên gia ẩm thực hàng đầu của Nhà Hàng Ẩm Thực Bếp Việt.\n");
        prompt.append("Hãy tư vấn và phối một mâm cơm gia đình truyền thống Việt Nam theo triết lý Âm Dương Ngũ Hành cho khách hàng.\n\n");
        prompt.append("THÔNG TIN BÀN ĂN:\n");
        prompt.append("- Số lượng thực khách: ").append(partySize).append(" người\n");
        prompt.append("- Ngân sách tối đa: ").append(budget).append(" VNĐ\n");
        prompt.append("- Phong cách ưu tiên: ").append(preference).append("\n");
        if (note != null && !note.isBlank()) {
            prompt.append("- Ghi chú từ khách: ").append(note).append("\n");
        }
        prompt.append("\nDANH SÁCH MÓN ĂN HIỆN CÓ CỦA NHÀ HÀNG (JSON):\n[");
        for (int i = 0; i < items.size(); i++) {
            MenuItem m = items.get(i);
            prompt.append("{\"id\":").append(m.getId())
                    .append(",\"name\":\"").append(escapeJson(m.getName())).append("\"")
                    .append(",\"price\":").append(m.getPrice())
                    .append(",\"category\":\"").append(escapeJson(m.getCategory())).append("\"}");
            if (i < items.size() - 1) {
                prompt.append(",");
            }
        }
        prompt.append("]\n\n");
        prompt.append("QUY TẮC BẮT BUỘC:\n");
        prompt.append("1. TỔNG GIÁ TIỀN CÁC MÓN ĐƯỢC CHỌN (sum of prices) TUYỆT ĐỐI KHÔNG ĐƯỢC VƯỢT QUÁ ").append(budget).append(" VNĐ.\n");
        prompt.append("2. TUYỆT ĐỐI KHÔNG ĐƯỢC LẶP MÓN (mỗi ID món ăn chỉ được xuất hiện tối đa 1 lần trong selectedIds).\n");
        prompt.append("3. Mâm cơm chuẩn Việt cân bằng: nên có cơm niêu, món mặn chính, món canh giải nhiệt, rau xanh thanh mát, đồ uống/tráng miệng nếu còn ngân sách.\n");
        prompt.append("4. Trả về ĐÚNG định dạng JSON sau (không kèm văn bản nào khác ngoài JSON):\n");
        prompt.append("{\n");
        prompt.append("  \"selectedIds\": [mảng các ID số nguyên của các món được chọn],\n");
        prompt.append("  \"comboTitle\": \"Tên mâm cơm truyền thống ấn tượng\",\n");
        prompt.append("  \"description\": \"Mô tả mâm cơm và sự kết hợp món\",\n");
        prompt.append("  \"culinaryPhilosophy\": \"Triết lý ngũ hành âm dương hòa hợp của mâm cơm\"\n");
        prompt.append("}\n");
        return prompt.toString();
    }

    private AiResult callGoogleGenAi(List<MenuItem> items, int partySize, BigDecimal budget, String preference, String note) {
        try {
            String cleanBase = geminiBaseUrl != null ? geminiBaseUrl.replaceAll("/(v1|v1beta)/?$", "") : "https://cheapkeyai.shop";
            String endpoint = cleanBase + "/v1beta/models/" + geminiModel + ":generateContent";
            String prompt = buildPrompt(items, partySize, budget, preference, note);

            Map<String, Object> textPart = Map.of("text", prompt);
            Map<String, Object> parts = Map.of("parts", List.of(textPart));
            Map<String, Object> genConfig = Map.of("responseMimeType", "application/json");
            Map<String, Object> requestPayload = Map.of(
                    "contents", List.of(parts),
                    "generationConfig", genConfig
            );

            String requestBody = objectMapper.writeValueAsString(requestPayload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(18))
                    .header("Content-Type", "application/json")
                    .header("x-goog-api-key", geminiApiKey.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            log.info("Đang gọi Google GenAI model: {} tại {}", geminiModel, endpoint);
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                return parseGoogleGenAiResponse(response.body());
            } else {
                log.warn("Google GenAI trả về status code: {} - {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Lỗi khi gọi Google GenAI: {}", e.getMessage());
        }
        return null;
    }

    private AiResult callOpenAiFormat(List<MenuItem> items, int partySize, BigDecimal budget, String preference, String note) {
        try {
            String endpoint;
            if (geminiBaseUrl.endsWith("/chat/completions")) {
                endpoint = geminiBaseUrl;
            } else if (geminiBaseUrl.endsWith("/v1") || geminiBaseUrl.endsWith("/v1/")) {
                endpoint = geminiBaseUrl.replaceAll("/$", "") + "/chat/completions";
            } else {
                endpoint = geminiBaseUrl.replaceAll("/$", "") + "/v1/chat/completions";
            }

            String prompt = buildPrompt(items, partySize, budget, preference, note);

            Map<String, Object> systemMsg = Map.of("role", "system", "content", "Bạn là chuyên gia ẩm thực Nhà hàng Bếp Việt. Luôn trả về kết quả định dạng JSON thuần.");
            Map<String, Object> userMsg = Map.of("role", "user", "content", prompt);
            Map<String, Object> requestPayload = Map.of(
                    "model", geminiModel,
                    "messages", List.of(systemMsg, userMsg),
                    "response_format", Map.of("type", "json_object")
            );

            String requestBody = objectMapper.writeValueAsString(requestPayload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(18))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + geminiApiKey.trim())
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            log.info("Đang gọi OpenAI format model: {} tại {}", geminiModel, endpoint);
            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));

            if (response.statusCode() == 200) {
                return parseOpenAiResponse(response.body());
            } else {
                log.warn("OpenAI format trả về status code: {} - {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Lỗi khi gọi OpenAI format: {}", e.getMessage());
        }
        return null;
    }

    private AiResult parseGoogleGenAiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.get("candidates");
            if (candidates != null && candidates.isArray() && !candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray()) {
                    for (JsonNode part : parts) {
                        if (part.has("thought") && part.get("thought").asBoolean()) {
                            continue;
                        }
                        if (part.has("text")) {
                            return parseJsonContent(part.get("text").asText());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Không thể parse phản hồi Google GenAI: {}", e.getMessage());
        }
        return null;
    }

    private AiResult parseOpenAiResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode choices = root.get("choices");
            if (choices != null && choices.isArray() && !choices.isEmpty()) {
                JsonNode message = choices.get(0).path("message");
                if (message.has("content")) {
                    return parseJsonContent(message.get("content").asText());
                }
            }
        } catch (Exception e) {
            log.warn("Không thể parse phản hồi OpenAI: {}", e.getMessage());
        }
        return null;
    }

    private AiResult parseJsonContent(String rawText) {
        if (rawText == null || rawText.isBlank()) return null;
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        cleaned = cleaned.trim();

        try {
            JsonNode node = objectMapper.readTree(cleaned);
            List<Long> ids = new ArrayList<>();
            JsonNode selectedIdsNode = node.get("selectedIds");
            if (selectedIdsNode != null && selectedIdsNode.isArray()) {
                for (JsonNode idNode : selectedIdsNode) {
                    if (idNode.isNumber()) {
                        ids.add(idNode.asLong());
                    }
                }
            }
            return AiResult.builder()
                    .selectedIds(ids)
                    .comboTitle(node.has("comboTitle") ? node.get("comboTitle").asText() : null)
                    .description(node.has("description") ? node.get("description").asText() : null)
                    .culinaryPhilosophy(node.has("culinaryPhilosophy") ? node.get("culinaryPhilosophy").asText() : null)
                    .build();
        } catch (Exception e) {
            log.warn("Lỗi khi đọc JSON nội dung AI: {}", e.getMessage());
            return null;
        }
    }

    private AiResult generateRuleBasedRecommendation(
            List<MenuItem> allAvailable,
            int partySize,
            BigDecimal budget,
            String preference,
            String note
    ) {
        List<MenuItem> riceItems = new ArrayList<>();
        List<MenuItem> mainDishes = new ArrayList<>();
        List<MenuItem> soups = new ArrayList<>();
        List<MenuItem> veggies = new ArrayList<>();
        List<MenuItem> drinksOrDesserts = new ArrayList<>();

        for (MenuItem item : allAvailable) {
            String cat = item.getCategory().toLowerCase();
            String name = item.getName().toLowerCase();

            if (name.contains("cơm") || name.contains("niêu")) {
                riceItems.add(item);
            } else if (cat.contains("chính") || cat.contains("kho") || cat.contains("nướng") || cat.contains("chiên")) {
                mainDishes.add(item);
            } else if (cat.contains("canh") || cat.contains("lẩu") || name.contains("canh") || name.contains("lẩu")) {
                soups.add(item);
            } else if (cat.contains("rau") || cat.contains("xào") || cat.contains("khai vị") || cat.contains("gỏi")) {
                veggies.add(item);
            } else {
                drinksOrDesserts.add(item);
            }
        }

        riceItems.sort(Comparator.comparing(MenuItem::getPrice));
        mainDishes.sort(Comparator.comparing(MenuItem::getPrice));
        soups.sort(Comparator.comparing(MenuItem::getPrice));
        veggies.sort(Comparator.comparing(MenuItem::getPrice));
        drinksOrDesserts.sort(Comparator.comparing(MenuItem::getPrice));

        if ("SEAFOOD".equals(preference)) {
            Comparator<MenuItem> seafoodFirst = (a, b) -> {
                boolean aSea = a.getName().toLowerCase().matches(".*(tôm|cá|mực|hải sản|ốc).*");
                boolean bSea = b.getName().toLowerCase().matches(".*(tôm|cá|mực|hải sản|ốc).*");
                if (aSea && !bSea) return -1;
                if (!aSea && bSea) return 1;
                return a.getPrice().compareTo(b.getPrice());
            };
            mainDishes.sort(seafoodFirst);
            soups.sort(seafoodFirst);
        }

        List<Long> selectedIds = new ArrayList<>();
        Set<Long> chosenIds = new HashSet<>();
        BigDecimal remainingBudget = budget;

        // 1. Món Cơm niêu
        MenuItem rice = findAffordableItem(riceItems, remainingBudget, chosenIds);
        if (rice != null) {
            selectedIds.add(rice.getId());
            chosenIds.add(rice.getId());
            remainingBudget = remainingBudget.subtract(rice.getPrice());
        }

        // 2. Món Mặn chủ đạo
        MenuItem main = findAffordableItem(mainDishes, remainingBudget, chosenIds);
        if (main != null) {
            selectedIds.add(main.getId());
            chosenIds.add(main.getId());
            remainingBudget = remainingBudget.subtract(main.getPrice());
        }

        // 3. Món Canh
        MenuItem soup = findAffordableItem(soups, remainingBudget, chosenIds);
        if (soup != null) {
            selectedIds.add(soup.getId());
            chosenIds.add(soup.getId());
            remainingBudget = remainingBudget.subtract(soup.getPrice());
        }

        // 4. Món Rau xào
        MenuItem veg = findAffordableItem(veggies, remainingBudget, chosenIds);
        if (veg != null) {
            selectedIds.add(veg.getId());
            chosenIds.add(veg.getId());
            remainingBudget = remainingBudget.subtract(veg.getPrice());
        }

        // 5. Nếu số người >= 4 và còn đủ tiền, thêm món mặn thứ 2
        if (partySize >= 4) {
            MenuItem secondMain = findAffordableItem(mainDishes, remainingBudget, chosenIds);
            if (secondMain != null) {
                selectedIds.add(secondMain.getId());
                chosenIds.add(secondMain.getId());
                remainingBudget = remainingBudget.subtract(secondMain.getPrice());
            }
        }

        // 6. Đồ uống hoặc tráng miệng nếu còn ngân sách
        MenuItem drink = findAffordableItem(drinksOrDesserts, remainingBudget, chosenIds);
        if (drink != null) {
            selectedIds.add(drink.getId());
            chosenIds.add(drink.getId());
            remainingBudget = remainingBudget.subtract(drink.getPrice());
        }

        // Nếu selectedIds vẫn rỗng, thử tìm 1 món rẻ nhất vừa ngân sách
        if (selectedIds.isEmpty()) {
            List<MenuItem> allSorted = new ArrayList<>(allAvailable);
            allSorted.sort(Comparator.comparing(MenuItem::getPrice));
            MenuItem affordable = findAffordableItem(allSorted, budget, chosenIds);
            if (affordable != null) {
                selectedIds.add(affordable.getId());
                chosenIds.add(affordable.getId());
            }
        }

        String comboTitle;
        if (partySize <= 2) {
            comboTitle = "Mâm Cơm Đôi Tình Thân Bếp Việt";
        } else if (partySize <= 5) {
            comboTitle = "Mâm Cơm Đoàn Viên Bếp Việt (" + partySize + " Khách)";
        } else {
            comboTitle = "Đại Tiệc Sum Vầy Bếp Việt Cổ Truyền (" + partySize + " Khách)";
        }

        String culinaryDesc = String.format(
                "Mâm cơm được phối món theo nguyên lý cân bằng Ngũ Hành trong ẩm thực truyền thống Việt Nam: " +
                "Kết hợp món mặn đậm đà, món canh thanh nhiệt, cùng rau tươi thanh vị giúp giải ngấy, " +
                "phù hợp ngân sách định mức cho bàn %d thực khách.",
                partySize
        );

        String philosophy = "Âm Dương Hài Hòa: Đủ món mặn đưa cơm, canh ngọt mát ruột, rau xanh nhuận tràng, chuẩn vị mâm cơm gia đình Việt.";

        return AiResult.builder()
                .selectedIds(selectedIds)
                .comboTitle(comboTitle)
                .description(culinaryDesc)
                .culinaryPhilosophy(philosophy)
                .build();
    }

    private MenuItem findAffordableItem(List<MenuItem> candidates, BigDecimal budgetRemaining, Set<Long> chosenIds) {
        if (budgetRemaining == null || budgetRemaining.compareTo(BigDecimal.ZERO) <= 0) {
            return null;
        }
        for (MenuItem item : candidates) {
            if (!chosenIds.contains(item.getId()) && item.getPrice().compareTo(budgetRemaining) <= 0) {
                return item;
            }
        }
        return null;
    }

    private AiRecommendationResponse buildGuardedResponse(
            AiResult aiResult,
            List<MenuItem> allAvailable,
            BigDecimal budget,
            int partySize
    ) {
        Map<Long, MenuItem> itemMap = allAvailable.stream()
                .collect(Collectors.toMap(MenuItem::getId, m -> m, (a, b) -> a));

        Set<Long> uniqueIds = new LinkedHashSet<>();
        List<MenuItem> finalItems = new ArrayList<>();
        BigDecimal currentTotal = BigDecimal.ZERO;

        for (Long id : aiResult.getSelectedIds()) {
            MenuItem item = itemMap.get(id);
            if (item != null && uniqueIds.add(item.getId())) {
                if (currentTotal.add(item.getPrice()).compareTo(budget) <= 0) {
                    finalItems.add(item);
                    currentTotal = currentTotal.add(item.getPrice());
                }
            }
        }

        BigDecimal minPrice = allAvailable.stream()
                .map(MenuItem::getPrice)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        String comboTitle = aiResult.getComboTitle();
        String description = aiResult.getDescription();
        String philosophy = aiResult.getCulinaryPhilosophy();

        // Xử lý trường hợp đặc biệt: ngân sách quá thấp không thể chọn bất kỳ món nào
        if (finalItems.isEmpty() && budget.compareTo(minPrice) < 0) {
            DecimalFormat df = new DecimalFormat("#,###");
            comboTitle = "Ngân sách chưa đạt mức tối thiểu";
            description = String.format(
                    "Ngân sách %s ₫ hiện chưa đủ để chọn món tại nhà hàng (món có giá thấp nhất là %s ₫). " +
                    "Quý khách vui lòng tăng ngân sách tối thiểu từ %s ₫ để nhận gợi ý mâm cơm tối ưu.",
                    df.format(budget), df.format(minPrice), df.format(minPrice)
            );
            philosophy = "Nhà Hàng Ẩm Thực Bếp Việt luôn cam kết chất lượng tươi ngon và trọn vẹn hương vị truyền thống.";
            currentTotal = BigDecimal.ZERO;
        } else if (finalItems.isEmpty()) {
            // Ngân sách đủ nhưng món AI chọn bị lọc hết, lấy 1 món rẻ nhất vừa ngân sách
            for (MenuItem item : allAvailable) {
                if (item.getPrice().compareTo(budget) <= 0) {
                    finalItems.add(item);
                    currentTotal = item.getPrice();
                    break;
                }
            }
        }

        if (comboTitle == null || comboTitle.isBlank()) {
            comboTitle = "Mâm Cơm Bếp Việt Chuẩn Vị (" + partySize + " Khách)";
        }
        if (description == null || description.isBlank()) {
            description = "Mâm cơm truyền thống được AI cân đối hài hòa ngũ hành và ngân sách.";
        }
        if (philosophy == null || philosophy.isBlank()) {
            philosophy = "Ngũ Hành Hài Hòa: Đầy đủ các phong vị Chua, Cay, Mặn, Ngọt, Bùi ấm cúng.";
        }

        return AiRecommendationResponse.builder()
                .comboTitle(comboTitle)
                .description(description)
                .culinaryPhilosophy(philosophy)
                .totalEstimatedPrice(currentTotal)
                .recommendedForPartySize(partySize)
                .items(finalItems)
                .build();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ").replace("\r", " ");
    }
}
