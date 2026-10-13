package com.restaurant.catalog.config;

import com.restaurant.catalog.entity.DiningTable;
import com.restaurant.catalog.entity.MenuItem;
import com.restaurant.catalog.entity.MenuItemStatus;
import com.restaurant.catalog.entity.TableStatus;
import com.restaurant.catalog.repository.DiningTableRepository;
import com.restaurant.catalog.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;

/**
 * Nap san 10 ban an va thuc don am thuc Viet Nam cho Nha Hang Am Thuc Bep Viet.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final DiningTableRepository tableRepository;
    private final MenuItemRepository menuRepository;

    @Override
    public void run(String... args) {
        initTables();
        initMenuItems();
    }

    private void initTables() {
        if (tableRepository.count() == 0) {
            List<DiningTable> defaultTables = List.of(
                    // Khu vuc Tang 1 (Gian chinh)
                    DiningTable.builder().tableNumber("T01").capacity(2).area("Tầng 1").status(TableStatus.AVAILABLE).qrCodeUrl("/table/T01").build(),
                    DiningTable.builder().tableNumber("T02").capacity(4).area("Tầng 1").status(TableStatus.AVAILABLE).qrCodeUrl("/table/T02").build(),
                    DiningTable.builder().tableNumber("T03").capacity(4).area("Tầng 1").status(TableStatus.AVAILABLE).qrCodeUrl("/table/T03").build(),
                    DiningTable.builder().tableNumber("T04").capacity(6).area("Tầng 1").status(TableStatus.AVAILABLE).qrCodeUrl("/table/T04").build(),
                    DiningTable.builder().tableNumber("T05").capacity(4).area("Tầng 1").status(TableStatus.AVAILABLE).qrCodeUrl("/table/T05").build(),

                    // Khu vuc Tang 2 (Ban cong gia dinh)
                    DiningTable.builder().tableNumber("T06").capacity(6).area("Tầng 2").status(TableStatus.AVAILABLE).qrCodeUrl("/table/T06").build(),
                    DiningTable.builder().tableNumber("T07").capacity(8).area("Tầng 2").status(TableStatus.AVAILABLE).qrCodeUrl("/table/T07").build(),
                    DiningTable.builder().tableNumber("T08").capacity(8).area("Tầng 2").status(TableStatus.AVAILABLE).qrCodeUrl("/table/T08").build(),

                    // Khu vuc Phong VIP (Tiep khach & Tiec rieng)
                    DiningTable.builder().tableNumber("VIP01").capacity(10).area("Phòng VIP").status(TableStatus.AVAILABLE).qrCodeUrl("/table/VIP01").build(),
                    DiningTable.builder().tableNumber("VIP02").capacity(12).area("Phòng VIP").status(TableStatus.AVAILABLE).qrCodeUrl("/table/VIP02").build()
            );

            tableRepository.saveAll(defaultTables);
            log.info("Khoi tao thanh cong {} ban an cho Nha Hang Bep Viet", defaultTables.size());
        }
    }

    private void initMenuItems() {
        if (menuRepository.count() == 0) {
            List<MenuItem> defaultItems = List.of(
                    // 1. Khai vi
                    MenuItem.builder()
                            .name("Nem rán truyền thống Hà Nội")
                            .price(new BigDecimal("85000"))
                            .category("Khai vị")
                            .description("Nem rán giòn rụm nhân thịt, miến, mộc nhĩ nấm hương ăn kèm nước mắm chua ngọt và rau sống.")
                            .imageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Gỏi củ hũ dừa tôm thịt")
                            .price(new BigDecimal("115000"))
                            .category("Khai vị")
                            .description("Củ hũ dừa giòn ngọt trộn tôm sú tươi, thịt ba chỉ, rau răm, lạc rang và bánh phồng tôm giòn rụm.")
                            .imageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Chả ốc Tây Hồ lá lốt")
                            .price(new BigDecimal("125000"))
                            .category("Khai vị")
                            .description("Ốc nhồi giòn sần sật băm nhuyễn cuộn lá lốt nướng thơm lừng, chấm mắm gừng ớt cay nồng.")
                            .imageUrl("https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),

                    // 2. Mon chinh & Com nieu
                    MenuItem.builder()
                            .name("Cơm niêu cá bống kho tộ")
                            .price(new BigDecimal("145000"))
                            .category("Món chính & Cơm niêu")
                            .description("Cơm cháy đáy niêu giòn rụm dùng kèm cá bống kho tộ kẹo nước hàng đậm đà hương vị miền quê.")
                            .imageUrl("https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Sườn non rang muối Hong Kong")
                            .price(new BigDecimal("135000"))
                            .category("Món chính & Cơm niêu")
                            .description("Sườn non giòn bì ngấm đều lớp bột muối mịn thơm phức mùi sả ớt.")
                            .imageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Thịt ba chỉ rang cháy cạnh")
                            .price(new BigDecimal("110000"))
                            .category("Món chính & Cơm niêu")
                            .description("Thịt ba chỉ thơm bùi thái lát mỏng rang cháy cạnh thơm dậy mùi hành tím và nước mắm cốt.")
                            .imageUrl("https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Bò xào bông cải xanh sốt tiêu đen")
                            .price(new BigDecimal("155000"))
                            .category("Món chính & Cơm niêu")
                            .description("Thịt bò mềm ngậy xào cùng bông cải xanh giòn ngọt và sốt tiêu đen Phú Quốc đậm đà.")
                            .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),

                    // 3. Lau & Canh
                    MenuItem.builder()
                            .name("Lẩu riêu cua bắp bò sườn sụn")
                            .price(new BigDecimal("380000"))
                            .category("Lẩu & Canh")
                            .description("Nồi lẩu riêu cua đồng chua thanh vị dấm bỗng, nhúng kèm bắp bò tươi, sườn sụn non và mẹt rau sống tươi mát.")
                            .imageUrl("https://images.unsplash.com/photo-1547592180-85f173990554?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Canh chua cá lóc Nam Bộ")
                            .price(new BigDecimal("120000"))
                            .category("Lẩu & Canh")
                            .description("Cá lóc đồng nấu cùng bạc hà, đậu bắp, dứa, cà chua và giá đỗ với nước cốt me chua ngọt thanh tao.")
                            .imageUrl("https://images.unsplash.com/photo-1547592180-85f173990554?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Canh cua mồng tơi mướp hương cà pháo")
                            .price(new BigDecimal("85000"))
                            .category("Lẩu & Canh")
                            .description("Món canh cua thanh mát ngày hè ăn kèm bát cà pháo muối giòn tan và dĩa mắm tôm nguyên chất.")
                            .imageUrl("https://images.unsplash.com/photo-1547592180-85f173990554?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),

                    // 4. Rau xao & An kem
                    MenuItem.builder()
                            .name("Rau muống xào tỏi Lý Sơn")
                            .price(new BigDecimal("55000"))
                            .category("Rau xào & Ăn kèm")
                            .description("Rau muống xanh mướt giòn sần sật phi thơm cùng tỏi cô đơn Lý Sơn dậy mùi hấp dẫn.")
                            .imageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Bông bí luộc chấm kho quẹt Nam Bộ")
                            .price(new BigDecimal("75000"))
                            .category("Rau xào & Ăn kèm")
                            .description("Bông bí tươi luộc vừa chín tới giữ trọn độ ngọt tự nhiên chấm cùng niêu kho quẹt tôm thịt tóp mỡ.")
                            .imageUrl("https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),

                    // 5. Do uong & Trang mieng
                    MenuItem.builder()
                            .name("Trà hoa cúc mật ong rừng")
                            .price(new BigDecimal("45000"))
                            .category("Đồ uống & Tráng miệng")
                            .description("Trà hoa cúc thanh nhiệt ủ ấm cùng mật ong rừng nguyên chất, thơm thảo mộc dịu nhẹ.")
                            .imageUrl("https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Nước sấu ngâm gừng phố cổ")
                            .price(new BigDecimal("35000"))
                            .category("Đồ uống & Tráng miệng")
                            .description("Thức uống đặc sản Hà thành giải khát tuyệt hảo, vị chua ngọt thanh mát xen lẫn vị ấm nồng của gừng.")
                            .imageUrl("https://images.unsplash.com/photo-1556881286-fc6915169721?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Chè hạt sen long nhãn Hưng Yên")
                            .price(new BigDecimal("45000"))
                            .category("Đồ uống & Tráng miệng")
                            .description("Hạt sen bùi béo lồng trong cùi nhãn ngọt giòn nấu cùng đường phèn thanh mát.")
                            .imageUrl("https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600")
                            .status(MenuItemStatus.AVAILABLE)
                            .build()
            );

            menuRepository.saveAll(defaultItems);
            log.info("Khoi tao thanh cong {} mon an thuc don cho Nha Hang Bep Viet", defaultItems.size());
        }
    }
}
