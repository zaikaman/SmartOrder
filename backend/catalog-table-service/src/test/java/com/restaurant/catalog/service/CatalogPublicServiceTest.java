package com.restaurant.catalog.service;

import com.restaurant.catalog.entity.DiningTable;
import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.entity.MenuItemStatus;
import com.restaurant.catalog.entity.TableStatus;
import com.restaurant.catalog.exception.ResourceNotFoundException;
import com.restaurant.catalog.repository.DiningTableRepository;
import com.restaurant.catalog.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CatalogPublicServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private DiningTableRepository diningTableRepository;

    @Mock
    private QrCodeGeneratorService qrCodeGeneratorService;

    @InjectMocks
    private MenuService menuService;

    @InjectMocks
    private DiningTableService diningTableService;

    private MenuItem sampleItem;
    private DiningTable sampleTable;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(diningTableService, "frontendUrl", "http://localhost:5173");

        sampleItem = MenuItem.builder()
                .id(1L)
                .name("Cơm niêu cá kho tộ")
                .price(new BigDecimal("125000"))
                .category("Món chính & Cơm niêu")
                .description("Cơm cháy đáy niêu giòn ngon")
                .status(MenuItemStatus.AVAILABLE)
                .imageUrl("https://images.unsplash.com/photo-sample")
                .build();

        sampleTable = DiningTable.builder()
                .id(1L)
                .tableNumber("T01")
                .capacity(4)
                .area("Tầng 1")
                .status(TableStatus.AVAILABLE)
                .qrCodeUrl("/table/T01")
                .build();
    }

    @Test
    @DisplayName("MenuService: Lay tat ca mon an co san thanh cong")
    void testGetAllMenuItemsAvailable() {
        when(menuItemRepository.findByStatus(MenuItemStatus.AVAILABLE))
                .thenReturn(List.of(sampleItem));

        List<MenuItem> items = menuService.getAllMenuItems(null, null, null);

        assertNotNull(items);
        assertEquals(1, items.size());
        assertEquals("Cơm niêu cá kho tộ", items.get(0).getName());
        verify(menuItemRepository, times(1)).findByStatus(MenuItemStatus.AVAILABLE);
    }

    @Test
    @DisplayName("MenuService: Loc mon an theo danh muc")
    void testGetMenuItemsByCategory() {
        when(menuItemRepository.findByCategoryAndStatus("Khai vị", MenuItemStatus.AVAILABLE))
                .thenReturn(List.of(sampleItem));

        List<MenuItem> items = menuService.getAllMenuItems("Khai vị", null, null);

        assertNotNull(items);
        assertEquals(1, items.size());
        verify(menuItemRepository, times(1)).findByCategoryAndStatus("Khai vị", MenuItemStatus.AVAILABLE);
    }

    @Test
    @DisplayName("MenuService: Tim mon an theo tu khoa")
    void testGetMenuItemsByKeyword() {
        when(menuItemRepository.findByNameContainingIgnoreCaseAndStatus("cơm", MenuItemStatus.AVAILABLE))
                .thenReturn(List.of(sampleItem));

        List<MenuItem> items = menuService.getAllMenuItems(null, "cơm", null);

        assertNotNull(items);
        assertEquals(1, items.size());
        verify(menuItemRepository, times(1)).findByNameContainingIgnoreCaseAndStatus("cơm", MenuItemStatus.AVAILABLE);
    }

    @Test
    @DisplayName("MenuService: Lay chi tiet mon an theo ID ton tai")
    void testGetMenuItemByIdFound() {
        when(menuItemRepository.findById(1L)).thenReturn(Optional.of(sampleItem));

        MenuItem result = menuService.getMenuItemById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
    }

    @Test
    @DisplayName("MenuService: Nem loi ResourceNotFoundException khi ID mon an khong ton tai")
    void testGetMenuItemByIdNotFound() {
        when(menuItemRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> menuService.getMenuItemById(999L));
    }

    @Test
    @DisplayName("DiningTableService: Lay danh sach ban an theo bo loc")
    void testGetAllTablesWithFilters() {
        DiningTable table2 = DiningTable.builder()
                .id(2L)
                .tableNumber("VIP01")
                .capacity(10)
                .area("Phòng VIP")
                .status(TableStatus.OCCUPIED)
                .build();

        when(diningTableRepository.findAll()).thenReturn(List.of(sampleTable, table2));

        List<DiningTable> availableTables = diningTableService.getAllTables(TableStatus.AVAILABLE, 2, "Tầng 1");

        assertNotNull(availableTables);
        assertEquals(1, availableTables.size());
        assertEquals("T01", availableTables.get(0).getTableNumber());
    }

    @Test
    @DisplayName("DiningTableService: Tim ban theo so ban tableNumber thanh cong")
    void testGetTableByNumberFound() {
        when(diningTableRepository.findByTableNumber("T01")).thenReturn(Optional.of(sampleTable));

        DiningTable table = diningTableService.getTableByNumber("T01");

        assertNotNull(table);
        assertEquals("T01", table.getTableNumber());
    }

    @Test
    @DisplayName("DiningTableService: Sinh anh PNG ma QR cho ban an thanh cong")
    void testGenerateTableQrPngSuccess() {
        when(diningTableRepository.findById(1L)).thenReturn(Optional.of(sampleTable));
        byte[] mockBytes = new byte[]{1, 2, 3, 4};
        when(qrCodeGeneratorService.generateQrCodePng(eq("http://localhost:5173/table/T01"), anyInt(), anyInt()))
                .thenReturn(mockBytes);

        byte[] result = diningTableService.generateTableQrPng(1L, 300, 300);

        assertNotNull(result);
        assertArrayEquals(mockBytes, result);
        verify(qrCodeGeneratorService, times(1)).generateQrCodePng(eq("http://localhost:5173/table/T01"), eq(300), eq(300));
    }
}
