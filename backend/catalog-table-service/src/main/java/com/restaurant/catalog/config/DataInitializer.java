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
                    // 1. Món chính & Cơm niêu
                    MenuItem.builder()
                            .name("Cơm niêu Bếp Việt cháy giòn")
                            .price(new BigDecimal("45000"))
                            .category("Món chính & Cơm niêu")
                            .description("Cơm nấu niêu đất hạt dẻo thơm, đáy niêu cháy vàng ươm giòn rụm chấm cùng niêu cá kho hoặc kho quẹt.")
                            .imageUrl("https://comnieubepviet.com/thumbs/1366x660x1/upload/photo/33497263034737386295485954008816338658405330n-78940.jpeg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Cá Chốt kho tiêu trứ danh")
                            .price(new BigDecimal("169000"))
                            .category("Món chính & Cơm niêu")
                            .description("Cá chốt béo ngậy kho tiêu cay nồng đặc sản độc nhất chỉ có tại Cơm Niêu Bếp Việt.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/4318877543925966803532242640667737108045506n-5650.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Tôm rang trứng muối Bếp Việt")
                            .price(new BigDecimal("209000"))
                            .category("Món chính & Cơm niêu")
                            .description("Tôm sú tươi giòn sốt trứng muối bùi béo phủ vàng ươm đậm đà hương vị biển.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/menu-21-tom-rang-trung-muoi-5429.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Thịt luộc cà pháo mắm tôm")
                            .price(new BigDecimal("139000"))
                            .category("Món chính & Cơm niêu")
                            .description("Thịt ba chỉ luộc mềm ngọt chấm cà pháo giòn tan và chén mắm tôm đánh sủi bọt thơm lừng.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/thit-luoc-ca-phao-139k-1712.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Cá Bớp kho tộ")
                            .price(new BigDecimal("229000"))
                            .category("Món chính & Cơm niêu")
                            .description("Cá bớp tươi thịt trắng ngọt kho tộ đậm đà kẹo nước hàng, rắc hành hoa và tiêu xay thơm nức.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/5-7774.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Bò lúc lắc khoai tây chiên")
                            .price(new BigDecimal("199000"))
                            .category("Món chính & Cơm niêu")
                            .description("Thịt bò mềm mọng thái quân cờ xào lửa lớn cùng ớt chuông, hành tây và khoai tây chiên giòn.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/6-7308.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Tôm rim nước dừa")
                            .price(new BigDecimal("209000"))
                            .category("Món chính & Cơm niêu")
                            .description("Tôm tươi rim nước dừa xiêm ngọt thanh óng ánh màu hổ phách bùi béo thơm ngậy.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/bepviet1959-copy-1862.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Mắm cá nục chưng thịt trứng muối")
                            .price(new BigDecimal("89000"))
                            .category("Món chính & Cơm niêu")
                            .description("Mắm cá nục xứ biển chưng cùng thịt nạc dăm băm nhuyễn và lòng đỏ trứng muối bùi béo đưa cơm.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/bepviet1923-copy-3766.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Gà Tre nướng muối ớt")
                            .price(new BigDecimal("399000"))
                            .category("Món chính & Cơm niêu")
                            .description("Gà tre thả vườn thịt săn chắc tẩm ướp muối ớt nướng da vàng giòn, chấm muối tiêu chanh ớt.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/img5357-7226.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Miến xào hải sản")
                            .price(new BigDecimal("219000"))
                            .category("Món chính & Cơm niêu")
                            .description("Sợi miến dai trong xào cùng tôm mực tươi ngọt, nấm hương và rau củ giòn ngọt.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/3-1875.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),

                    // 2. Khai vị
                    MenuItem.builder()
                            .name("Gỏi cá mai Phan Thiết")
                            .price(new BigDecimal("199000"))
                            .category("Khai vị")
                            .description("Cá mai tươi rút xương bóp giấm thính gạo, ăn kèm rau rừng bánh tráng và nước chấm mè đậu phộng độc quyền.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/11-5669.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Cánh gà chiên nước mắm")
                            .price(new BigDecimal("159000"))
                            .category("Khai vị")
                            .description("Cánh gà chiên vàng rụm đảo đều sốt nước mắm nhỉ Phan Thiết thơm lừng ngậy bùi.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/7-8434.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Gỏi ốc giác vàng sốt cay")
                            .price(new BigDecimal("299000"))
                            .category("Khai vị")
                            .description("Ốc giác vàng giòn sần sật trộn đu đủ, rau răm và nước sốt chua cay đặc biệt Bếp Việt.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/10-4640.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Chả ram tôm đất Bếp Việt")
                            .price(new BigDecimal("129000"))
                            .category("Khai vị")
                            .description("Cuốn chả ram giòn rụm bên trong là tôm đất ngọt thanh chấm tương ớt hoặc mắm chua ngọt.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/bepviet22372-copy-3020.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Chả cá hóa long")
                            .price(new BigDecimal("329000"))
                            .category("Khai vị")
                            .description("Đặc sản chả cá quết mịn dai thơm nướng lá chuối ăn kèm rau thì là và nước chấm riêng biệt.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/hinh-vuong-8222.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),

                    // 3. Lẩu & Canh
                    MenuItem.builder()
                            .name("Canh chua cá bớp")
                            .price(new BigDecimal("239000"))
                            .category("Lẩu & Canh")
                            .description("Khúc cá bớp tươi béo nấu cùng măng chua, cà chua, đậu bắp và nước cốt me thanh mát giải nhiệt.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/bepviet1816-copy-6145.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Canh Khổ qua thác lác")
                            .price(new BigDecimal("119000"))
                            .category("Lẩu & Canh")
                            .description("Khổ qua tươi bào mỏng nấu chả cá thác lác dẻo dai nước dùng ngọt thanh đậm đà.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/canh-kho-qua-5243.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Canh cua rau đay mồng tơi")
                            .price(new BigDecimal("129000"))
                            .category("Lẩu & Canh")
                            .description("Canh cua đồng thơm phức nấu rau đay mồng tơi mướp hương ăn kèm dĩa cà pháo giòn rụm.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/bepviet2297-copy-7228.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Canh gà lá giang")
                            .price(new BigDecimal("179000"))
                            .category("Lẩu & Canh")
                            .description("Thịt gà ta nấu lá giang chua dịu đặc trưng Nam Bộ, rắc ngò gai ớt cay ấm nồng.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/bepviet2082-copy-5453.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),

                    // 4. Rau xào & Ăn kèm
                    MenuItem.builder()
                            .name("Rau đảo Phú Quý xào tỏi")
                            .price(new BigDecimal("129000"))
                            .category("Rau xào & Ăn kèm")
                            .description("Rau đặc sản đảo ngọc Phú Quý giòn ngọt tự nhiên phi thơm cùng tép tỏi thơm ngát.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/rau-dao-pq-xao-toi-129k-2680.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),
                    MenuItem.builder()
                            .name("Cà tím sốt thịt bằm")
                            .price(new BigDecimal("129000"))
                            .category("Rau xào & Ăn kèm")
                            .description("Cà tím nướng mềm ngậy sốt cùng thịt bằm mỡ hành và nước mắm chua ngọt thơm lừng.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/bepviet2305-copy-5369.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build(),

                    // 5. Đồ uống & Tráng miệng
                    MenuItem.builder()
                            .name("Trà Đào Bếp Việt")
                            .price(new BigDecimal("39000"))
                            .category("Đồ uống & Tráng miệng")
                            .description("Trà đào thanh mát với miếng đào giòn ngọt sảng khoái sau bữa cơm niêu ấm cúng.")
                            .imageUrl("https://comnieubepviet.com/thumbs/675x600x1/upload/product/bepviet23059-copy-1215.jpg")
                            .status(MenuItemStatus.AVAILABLE)
                            .build()
            );

            menuRepository.saveAll(defaultItems);
            log.info("Khoi tao thanh cong {} mon an thuc don cho Nha Hang Bep Viet", defaultItems.size());
        }
    }
}
