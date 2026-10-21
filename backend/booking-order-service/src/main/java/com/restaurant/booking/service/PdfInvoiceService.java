package com.restaurant.booking.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import com.restaurant.booking.entity.OrderItem;
import com.restaurant.booking.entity.PaymentStatus;
import com.restaurant.booking.entity.ReservationOrder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.text.DecimalFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service kết xuất hóa đơn thanh toán điện tử định dạng PDF hỗ trợ tiếng Việt có dấu.
 */
@Service
@Slf4j
public class PdfInvoiceService {

    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,###");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));

    private BaseFont getVietnameseBaseFont() {
        try {
            // 1. Ưu tiên nạp font từ classpath (resources/fonts/arial.ttf)
            ClassPathResource fontResource = new ClassPathResource("fonts/arial.ttf");
            if (fontResource.exists()) {
                try (InputStream is = fontResource.getInputStream()) {
                    byte[] fontBytes = is.readAllBytes();
                    return BaseFont.createFont("arial.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, fontBytes, null);
                }
            }

            // 2. Dự phòng nạp font hệ thống Windows
            return BaseFont.createFont("C:/Windows/Fonts/arial.ttf", BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
        } catch (Exception ex) {
            log.warn("Không thể nạp TrueType font tiếng Việt, dùng Helvetica fallback: {}", ex.getMessage());
            try {
                return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
            } catch (Exception e) {
                throw new IllegalStateException("Lỗi khởi tạo BaseFont", e);
            }
        }
    }

    /**
     * Tạo tệp PDF hóa đơn cho đơn đặt bàn / gọi món.
     */
    public byte[] generateInvoicePdf(ReservationOrder order) {
        if (order == null) {
            throw new IllegalArgumentException("Đơn hàng không được null khi kết xuất hóa đơn PDF");
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 40, 40);
            PdfWriter.getInstance(document, out);
            document.open();

            BaseFont baseFont = getVietnameseBaseFont();
            Font titleFont = new Font(baseFont, 18, Font.BOLD, new Color(70, 44, 26)); // Màu nâu Bếp Việt
            Font subTitleFont = new Font(baseFont, 10, Font.NORMAL, new Color(125, 103, 86));
            Font sectionTitleFont = new Font(baseFont, 12, Font.BOLD, new Color(109, 73, 47));
            Font normalFont = new Font(baseFont, 10, Font.NORMAL, Color.BLACK);
            Font boldFont = new Font(baseFont, 10, Font.BOLD, Color.BLACK);
            Font headerTableFont = new Font(baseFont, 10, Font.BOLD, Color.WHITE);
            Font totalFont = new Font(baseFont, 13, Font.BOLD, new Color(179, 38, 30));

            // 1. Thông tin tiêu đề Nhà Hàng
            Paragraph brandName = new Paragraph("NHÀ HÀNG ẨM THỰC BẾP VIỆT", titleFont);
            brandName.setAlignment(Element.ALIGN_CENTER);
            document.add(brandName);

            Paragraph restaurantInfo = new Paragraph(
                    "Địa chỉ: 123 Đường Ẩm Thực, Quận 1, TP. Hồ Chí Minh | Hotline: 1900 6868\n" +
                    "Website: https://bepviet-restaurant.vn | Giờ mở cửa: 10:00 - 22:30 hàng ngày\n",
                    subTitleFont
            );
            restaurantInfo.setAlignment(Element.ALIGN_CENTER);
            restaurantInfo.setSpacingAfter(15);
            document.add(restaurantInfo);

            // Đường kẻ ngang phân cách
            Paragraph invoiceHeading = new Paragraph("HÓA ĐƠN THANH TOÁN (INVOICE)", sectionTitleFont);
            invoiceHeading.setAlignment(Element.ALIGN_CENTER);
            invoiceHeading.setSpacingAfter(12);
            document.add(invoiceHeading);

            // 2. Bảng thông tin đơn hàng và khách hàng
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{50f, 50f});
            infoTable.setSpacingAfter(15);

            addInfoRow(infoTable, "Mã đơn hàng:", order.getOrderCode(), "Số bàn:", order.getTableNumber(), boldFont, normalFont);
            addInfoRow(infoTable, "Khách hàng:", order.getCustomerName(), "Số khách:", order.getPartySize() + " người", boldFont, normalFont);
            addInfoRow(infoTable, "Số điện thoại:", order.getCustomerPhone(), "Giờ đặt bàn:",
                    order.getReservationTime() != null ? TIME_FORMATTER.format(order.getReservationTime()) : "-", boldFont, normalFont);
            addInfoRow(infoTable, "Email:", order.getCustomerEmail(), "Phương thức TT:",
                    order.getPaymentMethod() != null ? order.getPaymentMethod().name() : "VNPAY", boldFont, normalFont);

            String paymentStatusText = (order.getPaymentStatus() == PaymentStatus.PAID)
                    ? "ĐÃ THANH TOÁN" : "CHƯA THANH TOÁN";
            addInfoRow(infoTable, "Trạng thái TT:", paymentStatusText, "Mã GD VNPAY:",
                    order.getVnpTxnRef() != null ? order.getVnpTxnRef() : "-", boldFont, normalFont);

            document.add(infoTable);

            // 3. Bảng danh sách món ăn đã gọi
            Paragraph itemsHeading = new Paragraph("CHI TIẾT MÓN ĂN & THỰC ĐƠN", sectionTitleFont);
            itemsHeading.setSpacingAfter(8);
            document.add(itemsHeading);

            PdfPTable itemTable = new PdfPTable(6);
            itemTable.setWidthPercentage(100);
            itemTable.setWidths(new float[]{8f, 37f, 15f, 10f, 15f, 15f});
            itemTable.setSpacingAfter(15);

            // Header bảng món ăn
            Color headerBg = new Color(109, 73, 47);
            addTableHeader(itemTable, "STT", headerTableFont, headerBg, Element.ALIGN_CENTER);
            addTableHeader(itemTable, "Tên món ăn", headerTableFont, headerBg, Element.ALIGN_LEFT);
            addTableHeader(itemTable, "Đơn giá", headerTableFont, headerBg, Element.ALIGN_RIGHT);
            addTableHeader(itemTable, "SL", headerTableFont, headerBg, Element.ALIGN_CENTER);
            addTableHeader(itemTable, "Ghi chú", headerTableFont, headerBg, Element.ALIGN_LEFT);
            addTableHeader(itemTable, "Thành tiền", headerTableFont, headerBg, Element.ALIGN_RIGHT);

            List<OrderItem> items = order.getItems();
            if (items != null && !items.isEmpty()) {
                int index = 1;
                Color altBg = new Color(250, 247, 242);
                for (OrderItem item : items) {
                    Color rowBg = (index % 2 == 0) ? altBg : Color.WHITE;
                    addTableCell(itemTable, String.valueOf(index++), normalFont, rowBg, Element.ALIGN_CENTER);
                    addTableCell(itemTable, item.getMenuItemName(), boldFont, rowBg, Element.ALIGN_LEFT);
                    addTableCell(itemTable, CURRENCY_FORMAT.format(item.getUnitPrice()) + " đ", normalFont, rowBg, Element.ALIGN_RIGHT);
                    addTableCell(itemTable, String.valueOf(item.getQuantity()), normalFont, rowBg, Element.ALIGN_CENTER);
                    addTableCell(itemTable, item.getNote() != null ? item.getNote() : "-", normalFont, rowBg, Element.ALIGN_LEFT);
                    addTableCell(itemTable, CURRENCY_FORMAT.format(item.getSubtotal()) + " đ", boldFont, rowBg, Element.ALIGN_RIGHT);
                }
            } else {
                PdfPCell emptyCell = new PdfPCell(new Phrase("Chưa có món ăn gọi kèm trong đơn này.", normalFont));
                emptyCell.setColspan(6);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                emptyCell.setPadding(10);
                itemTable.addCell(emptyCell);
            }

            document.add(itemTable);

            // 4. Tổng tiền thanh toán
            BigDecimal totalAmount = order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO;
            PdfPTable summaryTable = new PdfPTable(2);
            summaryTable.setWidthPercentage(100);
            summaryTable.setWidths(new float[]{65f, 35f});
            summaryTable.setSpacingAfter(20);

            PdfPCell noteCell = new PdfPCell(new Phrase(
                    order.getNote() != null && !order.getNote().isBlank()
                            ? "Ghi chú đơn: " + order.getNote() : "", normalFont));
            noteCell.setBorder(Rectangle.NO_BORDER);
            noteCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            summaryTable.addCell(noteCell);

            PdfPCell totalCell = new PdfPCell(new Phrase("TỔNG TIỀN: " + CURRENCY_FORMAT.format(totalAmount) + " VND", totalFont));
            totalCell.setBorder(Rectangle.NO_BORDER);
            totalCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            totalCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
            summaryTable.addCell(totalCell);

            document.add(summaryTable);

            // 5. Lời cảm ơn và Footer
            Paragraph footer = new Paragraph(
                    "Cảm ơn Quý khách đã tin tưởng và ủng hộ Nhà Hàng Ẩm Thực Bếp Việt!\n" +
                    "Kính chúc Quý khách có những trải nghiệm ẩm thực ấm cúng và ngon miệng.\n" +
                    "(Hóa đơn điện tử khởi tạo tự động từ hệ thống quản lý Bếp Việt)",
                    subTitleFont
            );
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return out.toByteArray();
        } catch (Exception ex) {
            log.error("Lỗi khi kết xuất hóa đơn PDF cho đơn {}: {}", order.getOrderCode(), ex.getMessage(), ex);
            throw new IllegalStateException("Không thể kết xuất tệp hóa đơn PDF: " + ex.getMessage(), ex);
        }
    }

    private void addInfoRow(PdfPTable table, String label1, String value1, String label2, String value2,
                            Font boldFont, Font normalFont) {
        Phrase phrase1 = new Phrase();
        phrase1.add(new Chunk(label1 + " ", boldFont));
        phrase1.add(new Chunk(value1 != null ? value1 : "-", normalFont));
        PdfPCell cell1 = new PdfPCell(phrase1);
        cell1.setBorder(Rectangle.NO_BORDER);
        cell1.setPadding(3);
        table.addCell(cell1);

        Phrase phrase2 = new Phrase();
        phrase2.add(new Chunk(label2 + " ", boldFont));
        phrase2.add(new Chunk(value2 != null ? value2 : "-", normalFont));
        PdfPCell cell2 = new PdfPCell(phrase2);
        cell2.setBorder(Rectangle.NO_BORDER);
        cell2.setPadding(3);
        table.addCell(cell2);
    }

    private void addTableHeader(PdfPTable table, String text, Font font, Color bgColor, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text, Font font, Color bgColor, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bgColor);
        cell.setHorizontalAlignment(alignment);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        cell.setPadding(5);
        table.addCell(cell);
    }
}
