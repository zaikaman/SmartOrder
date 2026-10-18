package com.restaurant.booking.service;

import com.restaurant.booking.entity.OrderItem;
import com.restaurant.booking.entity.ReservationOrder;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:bevietrestaurant@gmail.com}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy")
            .withZone(ZoneId.of("Asia/Ho_Chi_Minh"));
    private static final NumberFormat CURRENCY_FORMATTER = NumberFormat.getCurrencyInstance(Locale.forLanguageTag("vi-VN"));

    public boolean sendReservationConfirmationEmail(ReservationOrder order) {
        if (order.getCustomerEmail() == null || order.getCustomerEmail().isBlank()) {
            log.warn("Đơn đặt bàn {} không có email người nhận", order.getOrderCode());
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, "Nhà Hàng Ẩm Thực Bếp Việt");
            helper.setTo(order.getCustomerEmail());
            helper.setSubject("[Bếp Việt] Xác nhận đặt bàn thành công - Mã đơn: " + order.getOrderCode());

            String htmlContent = buildEmailHtml(order);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email xác nhận đặt bàn thành công tới {}", order.getCustomerEmail());
            return true;
        } catch (Exception ex) {
            log.error("Không thể gửi email xác nhận tới {}: {}", order.getCustomerEmail(), ex.getMessage());
            return false;
        }
    }

    private String buildEmailHtml(ReservationOrder order) {
        StringBuilder itemsHtml = new StringBuilder();
        if (order.getItems() != null && !order.getItems().isEmpty()) {
            itemsHtml.append("<div style='margin-top: 15px;'>")
                    .append("<h4 style='color: #8B1E0F; margin-bottom: 8px;'>Danh sách món đã gọi trước:</h4>")
                    .append("<table style='width: 100%; border-collapse: collapse; font-size: 14px;'>")
                    .append("<tr style='background: #FDF4E3; text-align: left;'>")
                    .append("<th style='padding: 8px; border: 1px solid #E5E7EB;'>Món ăn</th>")
                    .append("<th style='padding: 8px; border: 1px solid #E5E7EB;'>Số lượng</th>")
                    .append("<th style='padding: 8px; border: 1px solid #E5E7EB;'>Đơn giá</th>")
                    .append("<th style='padding: 8px; border: 1px solid #E5E7EB;'>Thành tiền</th>")
                    .append("</tr>");

            for (OrderItem item : order.getItems()) {
                itemsHtml.append("<tr>")
                        .append("<td style='padding: 8px; border: 1px solid #E5E7EB;'>").append(item.getMenuItemName()).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #E5E7EB; text-align: center;'>").append(item.getQuantity()).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #E5E7EB;'>").append(CURRENCY_FORMATTER.format(item.getUnitPrice())).append("</td>")
                        .append("<td style='padding: 8px; border: 1px solid #E5E7EB; font-weight: bold;'>").append(CURRENCY_FORMATTER.format(item.getSubtotal())).append("</td>")
                        .append("</tr>");
            }
            itemsHtml.append("</table></div>");
        }

        String formattedTime = DATE_FORMATTER.format(order.getReservationTime());
        String formattedTotal = CURRENCY_FORMATTER.format(order.getTotalAmount());

        return "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #E5E7EB; border-radius: 12px; background: #FFFFFF;'>"
                + "<div style='text-align: center; border-bottom: 2px solid #8B1E0F; padding-bottom: 16px;'>"
                + "<h2 style='color: #8B1E0F; margin: 0;'>NHÀ HÀNG ẨM THỰC BẾP VIỆT</h2>"
                + "<p style='color: #6B7280; font-size: 13px; margin: 4px 0 0 0;'>Cơm niêu truyền thống & Tinh hoa ẩm thực Việt</p>"
                + "</div>"
                + "<div style='padding: 20px 0;'>"
                + "<p>Kính chào quý khách <strong>" + order.getCustomerName() + "</strong>,</p>"
                + "<p>Nhà hàng xin trân trọng thông báo đơn đặt bàn của quý khách đã được ghi nhận thành công với thông tin chi tiết dưới đây:</p>"
                + "<div style='background: #FFFBEB; padding: 16px; border-radius: 8px; margin: 16px 0; border: 1px solid #FDE68A;'>"
                + "<p style='margin: 4px 0;'><strong>Mã đơn đặt bàn:</strong> <span style='color: #8B1E0F; font-weight: bold; font-size: 16px;'>" + order.getOrderCode() + "</span></p>"
                + "<p style='margin: 4px 0;'><strong>Bàn ăn:</strong> " + order.getTableNumber() + "</p>"
                + "<p style='margin: 4px 0;'><strong>Thời gian dùng bữa:</strong> " + formattedTime + "</p>"
                + "<p style='margin: 4px 0;'><strong>Số lượng khách:</strong> " + order.getPartySize() + " người</p>"
                + "<p style='margin: 4px 0;'><strong>Phương thức thanh toán:</strong> " + order.getPaymentMethod().name() + "</p>"
                + "<p style='margin: 4px 0;'><strong>Tổng tiền dự kiến:</strong> <span style='color: #8B1E0F; font-weight: bold;'>" + formattedTotal + "</span></p>"
                + (order.getNote() != null && !order.getNote().isBlank() ? "<p style='margin: 4px 0;'><strong>Ghi chú:</strong> " + order.getNote() + "</p>" : "")
                + "</div>"
                + itemsHtml.toString()
                + "<p style='margin-top: 20px; font-size: 13px; color: #6B7280;'>Nếu quý khách cần hỗ trợ hoặc thay đổi lịch hẹn, vui lòng liên hệ hotline: <strong>0909.123.456</strong>.</p>"
                + "</div>"
                + "<div style='text-align: center; border-top: 1px solid #E5E7EB; padding-top: 16px; font-size: 12px; color: #9CA3AF;'>"
                + "Cảm ơn quý khách đã tin tưởng và lựa chọn Bếp Việt!"
                + "</div>"
                + "</div>";
    }
}
