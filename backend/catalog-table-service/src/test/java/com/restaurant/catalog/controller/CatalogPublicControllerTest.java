package com.restaurant.catalog.controller;

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
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CatalogPublicControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private DiningTableRepository diningTableRepository;

    private Long savedItemId;
    private Long savedTableId;

    @BeforeEach
    void setUp() {
        menuItemRepository.deleteAll();
        diningTableRepository.deleteAll();

        MenuItem item = MenuItem.builder()
                .name("Tôm rang trứng muối Bếp Việt")
                .price(new BigDecimal("165000"))
                .category("Món chính & Cơm niêu")
                .description("Tôm sú tươi rang trứng muối bùi béo đậm đà.")
                .imageUrl("https://comnieubepviet.com/upload/product/menu-21-tom-rang-trung-muoi-5429.jpg")
                .status(MenuItemStatus.AVAILABLE)
                .build();
        savedItemId = menuItemRepository.save(item).getId();

        DiningTable table = DiningTable.builder()
                .tableNumber("T10")
                .capacity(4)
                .area("Tầng 1")
                .status(TableStatus.AVAILABLE)
                .qrCodeUrl("/table/T10")
                .build();
        savedTableId = diningTableRepository.save(table).getId();
    }

    @Test
    @DisplayName("GET /api/v1/menu: Anonymous truy van menu thanh cong")
    void testGetPublicMenu() throws Exception {
        mockMvc.perform(get("/api/v1/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].name", is("Tôm rang trứng muối Bếp Việt")));
    }

    @Test
    @DisplayName("GET /api/v1/menu/{id}: Anonymous xem chi tiet mon an")
    void testGetMenuItemById() throws Exception {
        mockMvc.perform(get("/api/v1/menu/" + savedItemId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(savedItemId.intValue())))
                .andExpect(jsonPath("$.name", is("Tôm rang trứng muối Bếp Việt")));
    }

    @Test
    @DisplayName("GET /api/v1/menu/categories: Lay danh sach danh muc mon an")
    void testGetMenuCategories() throws Exception {
        mockMvc.perform(get("/api/v1/menu/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasItem("Món chính & Cơm niêu")));
    }

    @Test
    @DisplayName("GET /api/v1/tables: Anonymous xem danh sach ban an")
    void testGetPublicTables() throws Exception {
        mockMvc.perform(get("/api/v1/tables"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$[0].tableNumber", is("T10")));
    }

    @Test
    @DisplayName("GET /api/v1/tables/number/{tableNumber}: Quet ma QR tim ban T10")
    void testGetTableByNumber() throws Exception {
        mockMvc.perform(get("/api/v1/tables/number/T10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tableNumber", is("T10")))
                .andExpect(jsonPath("$.capacity", is(4)));
    }

    @Test
    @DisplayName("GET /api/v1/tables/{id}/qr-image: Xuat anh PNG ma QR ban an")
    void testGetTableQrImage() throws Exception {
        mockMvc.perform(get("/api/v1/tables/" + savedTableId + "/qr-image"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(header().string("Content-Disposition", containsString("table-" + savedTableId + "-qr.png")));
    }
}
