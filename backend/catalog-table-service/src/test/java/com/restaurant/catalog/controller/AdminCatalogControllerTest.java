package com.restaurant.catalog.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.restaurant.catalog.dto.AiRecommendationRequest;
import com.restaurant.catalog.dto.DiningTableRequest;
import com.restaurant.catalog.dto.MenuItemRequest;
import com.restaurant.catalog.entity.DiningTable;
import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.entity.MenuItemStatus;
import com.restaurant.catalog.entity.TableStatus;
import com.restaurant.catalog.repository.DiningTableRepository;
import com.restaurant.catalog.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private DiningTableRepository diningTableRepository;

    @BeforeEach
    void setUp() {
        menuItemRepository.deleteAll();
        diningTableRepository.deleteAll();

        MenuItem item = MenuItem.builder()
                .name("Cá Lóc Kho Tộ")
                .price(new BigDecimal("120000"))
                .category("Món chính & Cơm niêu")
                .description("Cá lóc đồng kho tộ kẹo nước hàng đậm đà.")
                .imageUrl("https://example.com/caloc.jpg")
                .status(MenuItemStatus.AVAILABLE)
                .build();
        menuItemRepository.save(item);

        DiningTable table = DiningTable.builder()
                .tableNumber("VIP09")
                .capacity(6)
                .area("Phòng VIP")
                .status(TableStatus.AVAILABLE)
                .qrCodeUrl("/table/VIP09")
                .build();
        diningTableRepository.save(table);
    }

    @Test
    @DisplayName("GET /api/v1/admin/menu không có xác thực bị từ chối truy cập (401 hoặc 403)")
    void testGetAdminMenuUnauthorized() throws Exception {
        mockMvc.perform(get("/api/v1/admin/menu"))
                .andExpect(status().is4xxClientError());
    }

    @Test
    @WithMockUser(username = "customer1", roles = {"CUSTOMER"})
    @DisplayName("GET /api/v1/admin/menu với vai trò CUSTOMER bị từ chối 403 Forbidden")
    void testGetAdminMenuForbiddenForCustomer() throws Exception {
        mockMvc.perform(get("/api/v1/admin/menu"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin1", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/menu với vai trò ADMIN truy xuất thành công danh sách món")
    void testGetAdminMenuSuccess() throws Exception {
        mockMvc.perform(get("/api/v1/admin/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name", is("Cá Lóc Kho Tộ")));
    }

    @Test
    @WithMockUser(username = "admin1", roles = {"ADMIN"})
    @DisplayName("POST /api/v1/admin/menu với vai trò ADMIN tạo mới món ăn thành công")
    void testCreateMenuItemSuccess() throws Exception {
        MenuItemRequest request = MenuItemRequest.builder()
                .name("Canh Cua Rau Đay")
                .description("Canh cua đồng mùng tơi rau đay ăn kèm cà pháo giòn")
                .price(new BigDecimal("95000"))
                .category("Món Canh")
                .imageUrl("https://example.com/canhcua.jpg")
                .status(MenuItemStatus.AVAILABLE)
                .build();

        mockMvc.perform(post("/api/v1/admin/menu")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name", is("Canh Cua Rau Đay")))
                .andExpect(jsonPath("$.price", is(95000)));
    }

    @Test
    @WithMockUser(username = "admin1", roles = {"ADMIN"})
    @DisplayName("POST /api/v1/admin/tables với vai trò ADMIN tạo mới bàn ăn thành công")
    void testCreateTableSuccess() throws Exception {
        DiningTableRequest request = DiningTableRequest.builder()
                .tableNumber("T99")
                .capacity(4)
                .area("Sân Vườn")
                .status(TableStatus.AVAILABLE)
                .build();

        mockMvc.perform(post("/api/v1/admin/tables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tableNumber", is("T99")))
                .andExpect(jsonPath("$.qrCodeUrl", is("/table/T99")));
    }

    @Test
    @DisplayName("POST /api/v1/menu/ai-recommend cho phép Anonymous gọi gợi ý mâm cơm Bếp Việt thành công")
    void testAiRecommendMenuSuccess() throws Exception {
        AiRecommendationRequest request = AiRecommendationRequest.builder()
                .partySize(4)
                .budget(new BigDecimal("600000"))
                .preference("ALL")
                .build();

        mockMvc.perform(post("/api/v1/menu/ai-recommend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.comboTitle").isNotEmpty())
                .andExpect(jsonPath("$.items").isArray());
    }
}
