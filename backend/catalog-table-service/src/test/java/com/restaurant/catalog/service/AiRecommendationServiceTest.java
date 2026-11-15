package com.restaurant.catalog.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.catalog.dto.AiRecommendationRequest;
import com.restaurant.catalog.dto.AiRecommendationResponse;
import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.entity.MenuItemStatus;
import com.restaurant.catalog.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiRecommendationServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AiRecommendationService aiRecommendationService;

    private List<MenuItem> sampleMenu;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(aiRecommendationService, "geminiBaseUrl", "https://cheapkeyai.shop/v1");
        ReflectionTestUtils.setField(aiRecommendationService, "geminiApiKey", "");
        ReflectionTestUtils.setField(aiRecommendationService, "geminiModel", "gemini-2.5-flash");

        sampleMenu = new ArrayList<>();
        sampleMenu.add(MenuItem.builder().id(1L).name("Cơm niêu Bếp Việt cháy giòn").price(new BigDecimal("45000")).category("Món chính & Cơm niêu").status(MenuItemStatus.AVAILABLE).build());
        sampleMenu.add(MenuItem.builder().id(2L).name("Cá Chốt kho tiêu trứ danh").price(new BigDecimal("169000")).category("Món chính & Cơm niêu").status(MenuItemStatus.AVAILABLE).build());
        sampleMenu.add(MenuItem.builder().id(3L).name("Tôm rang trứng muối Bếp Việt").price(new BigDecimal("209000")).category("Món chính & Cơm niêu").status(MenuItemStatus.AVAILABLE).build());
        sampleMenu.add(MenuItem.builder().id(4L).name("Thịt luộc cà pháo mắm tôm").price(new BigDecimal("139000")).category("Món chính & Cơm niêu").status(MenuItemStatus.AVAILABLE).build());
        sampleMenu.add(MenuItem.builder().id(5L).name("Mắm cá nục chưng thịt trứng muối").price(new BigDecimal("89000")).category("Món chính & Cơm niêu").status(MenuItemStatus.AVAILABLE).build());
        sampleMenu.add(MenuItem.builder().id(6L).name("Canh chua cá bớp").price(new BigDecimal("239000")).category("Lẩu & Canh").status(MenuItemStatus.AVAILABLE).build());
        sampleMenu.add(MenuItem.builder().id(7L).name("Canh Khổ qua thác lác").price(new BigDecimal("119000")).category("Lẩu & Canh").status(MenuItemStatus.AVAILABLE).build());
        sampleMenu.add(MenuItem.builder().id(8L).name("Rau đảo Phú Quý xào tỏi").price(new BigDecimal("129000")).category("Rau xào & Ăn kèm").status(MenuItemStatus.AVAILABLE).build());
        sampleMenu.add(MenuItem.builder().id(9L).name("Trà Đào Bếp Việt").price(new BigDecimal("39000")).category("Đồ uống & Tráng miệng").status(MenuItemStatus.AVAILABLE).build());

        lenient().when(menuItemRepository.findByStatus(MenuItemStatus.AVAILABLE)).thenReturn(sampleMenu);
    }

    @Test
    @DisplayName("P1 Regression - Khách 2 người với ngân sách 10.000₫ không bao giờ vượt ngân sách")
    void testBudget10kNeverExceeds() {
        AiRecommendationRequest req = AiRecommendationRequest.builder()
                .partySize(2)
                .budget(new BigDecimal("10000"))
                .build();

        AiRecommendationResponse res = aiRecommendationService.recommendVietnameseMeal(req);

        assertNotNull(res);
        assertTrue(res.getTotalEstimatedPrice().compareTo(new BigDecimal("10000")) <= 0,
                "Tổng tiền phải nhỏ hơn hoặc bằng ngân sách 10.000₫");
        assertTrue(res.getItems().isEmpty(), "Không món nào có giá <= 10.000₫ nên danh sách món phải rỗng");
        assertTrue(res.getDescription().contains("Ngân sách"), "Mô tả phải giải thích rõ về ngân sách");
    }

    @Test
    @DisplayName("P1 Regression - Khách 2 người với ngân sách 300.000₫ không vượt quá 300.000₫")
    void testBudget300kNeverExceeds() {
        AiRecommendationRequest req = AiRecommendationRequest.builder()
                .partySize(2)
                .budget(new BigDecimal("300000"))
                .build();

        AiRecommendationResponse res = aiRecommendationService.recommendVietnameseMeal(req);

        assertNotNull(res);
        assertTrue(res.getTotalEstimatedPrice().compareTo(new BigDecimal("300000")) <= 0,
                "Tổng tiền " + res.getTotalEstimatedPrice() + " phải <= 300.000₫");
        assertFalse(res.getItems().isEmpty(), "Phải gợi ý được món ăn phù hợp");

        // Kiểm tra tính duy nhất của món ăn (không lặp món)
        Set<Long> ids = new HashSet<>();
        for (MenuItem item : res.getItems()) {
            assertTrue(ids.add(item.getId()), "Món ăn ID " + item.getId() + " bị trùng lặp!");
        }
    }

    @Test
    @DisplayName("P1 Regression - Khách 4 người với ngân sách 600.000₫ không lặp món và không vượt ngân sách")
    void testBudget600kNoDuplicatesAndNoOverBudget() {
        AiRecommendationRequest req = AiRecommendationRequest.builder()
                .partySize(4)
                .budget(new BigDecimal("600000"))
                .build();

        AiRecommendationResponse res = aiRecommendationService.recommendVietnameseMeal(req);

        assertNotNull(res);
        assertTrue(res.getTotalEstimatedPrice().compareTo(new BigDecimal("600000")) <= 0,
                "Tổng tiền " + res.getTotalEstimatedPrice() + " phải <= 600.000₫");

        // Kiểm tra không bao giờ lặp món (đặc biệt là lỗi lặp cơm niêu trong báo cáo QA)
        Set<Long> ids = new HashSet<>();
        for (MenuItem item : res.getItems()) {
            assertTrue(ids.add(item.getId()), "Phát hiện món bị lặp: " + item.getName());
        }
    }

    @Test
    @DisplayName("P1 Regression - Khách 8 người với ngân sách 250.000₫ không vượt ngân sách")
    void testBudget250kParty8NeverExceeds() {
        AiRecommendationRequest req = AiRecommendationRequest.builder()
                .partySize(8)
                .budget(new BigDecimal("250000"))
                .build();

        AiRecommendationResponse res = aiRecommendationService.recommendVietnameseMeal(req);

        assertNotNull(res);
        assertTrue(res.getTotalEstimatedPrice().compareTo(new BigDecimal("250000")) <= 0,
                "Tổng tiền " + res.getTotalEstimatedPrice() + " phải <= 250.000₫");
    }

    @Test
    @DisplayName("Strict Guard - Loại bỏ triệt để món trùng lặp và món vượt ngân sách nếu AI trả sai")
    void testGuardRemovesDuplicatesAndExcessBudget() {
        AiRecommendationRequest req = AiRecommendationRequest.builder()
                .partySize(4)
                .budget(new BigDecimal("400000"))
                .build();

        AiRecommendationResponse res = aiRecommendationService.recommendVietnameseMeal(req);

        BigDecimal sumOfPrices = BigDecimal.ZERO;
        Set<Long> itemIds = new HashSet<>();
        for (MenuItem item : res.getItems()) {
            sumOfPrices = sumOfPrices.add(item.getPrice());
            assertTrue(itemIds.add(item.getId()), "Có món trùng lặp trong kết quả: " + item.getName());
        }

        assertEquals(0, sumOfPrices.compareTo(res.getTotalEstimatedPrice()), "Tổng tiền hiển thị phải khớp chính xác tổng giá các món");
        assertTrue(res.getTotalEstimatedPrice().compareTo(new BigDecimal("400000")) <= 0, "Tổng tiền không được vượt ngân sách 400.000₫");
    }

    @Test
    @DisplayName("AI Response Parsing - Parse chính xác phản hồi từ Google GenAI format")
    void testParseGoogleGenAiResponse() {
        String mockResponse = "{\n" +
                "  \"candidates\": [{\n" +
                "    \"content\": {\n" +
                "      \"parts\": [\n" +
                "        {\"thought\": true, \"text\": \"thinking process...\"},\n" +
                "        {\"text\": \"```json\\n{\\\"selectedIds\\\": [1, 5, 7], \\\"comboTitle\\\": \\\"Mâm Cơm Thanh Nhẹ\\\", \\\"description\\\": \\\"Mâm cơm thanh vị\\\", \\\"culinaryPhilosophy\\\": \\\"Ngũ hành cân bằng\\\"}\\n```\"}\n" +
                "      ]\n" +
                "    }\n" +
                "  }]\n" +
                "}";

        Object aiResult = ReflectionTestUtils.invokeMethod(aiRecommendationService, "parseGoogleGenAiResponse", mockResponse);
        assertNotNull(aiResult);
        assertEquals("Mâm Cơm Thanh Nhẹ", ReflectionTestUtils.getField(aiResult, "comboTitle"));
        @SuppressWarnings("unchecked")
        List<Long> ids = (List<Long>) ReflectionTestUtils.getField(aiResult, "selectedIds");
        assertNotNull(ids);
        assertEquals(List.of(1L, 5L, 7L), ids);
    }

    @Test
    @DisplayName("AI Response Parsing - Parse chính xác phản hồi từ OpenAI format")
    void testParseOpenAiResponse() {
        String mockResponse = "{\n" +
                "  \"choices\": [{\n" +
                "    \"message\": {\n" +
                "      \"content\": \"{\\\"selectedIds\\\": [1, 2, 8], \\\"comboTitle\\\": \\\"Mâm Cơm Đậm Đà\\\", \\\"description\\\": \\\"Mâm cơm ngon\\\", \\\"culinaryPhilosophy\\\": \\\"Âm dương hòa hợp\\\"}\"\n" +
                "    }\n" +
                "  }]\n" +
                "}";

        Object aiResult = ReflectionTestUtils.invokeMethod(aiRecommendationService, "parseOpenAiResponse", mockResponse);
        assertNotNull(aiResult);
        assertEquals("Mâm Cơm Đậm Đà", ReflectionTestUtils.getField(aiResult, "comboTitle"));
        @SuppressWarnings("unchecked")
        List<Long> ids = (List<Long>) ReflectionTestUtils.getField(aiResult, "selectedIds");
        assertNotNull(ids);
        assertEquals(List.of(1L, 2L, 8L), ids);
    }
}
