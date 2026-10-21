import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowRight, FileText, ShoppingBag, Home, RefreshCw, CreditCard } from 'lucide-react';
import { bookingApi } from '../../api/client';
import { InvoicePreviewModal } from '../../components/common/InvoicePreviewModal';

interface PaymentResultData {
  success: boolean;
  orderCode?: string;
  txnRef?: string;
  amount?: number;
  responseCode?: string;
  transactionNo?: string;
  bankCode?: string;
  payDate?: string;
  message?: string;
}

export const VnPayReturnPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [result, setResult] = useState<PaymentResultData | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);
  const [targetOrderId, setTargetOrderId] = useState<number | null>(null);

  useEffect(() => {
    const paramsObj: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      paramsObj[key] = val;
    });

    if (Object.keys(paramsObj).length === 0) {
      setResult({
        success: false,
        message: 'Không tìm thấy thông tin tham số trả về từ cổng thanh toán.',
      });
      setLoading(false);
      return;
    }

    // Gửi request xác minh chữ ký và xử lý kết quả callback từ VNPAY
    bookingApi
      .get<PaymentResultData>('/payments/vnpay/return', {
        params: paramsObj,
      })
      .then((res) => {
        setResult(res.data);
        setLoading(false);

        // Lấy thông tin order nếu có để phục vụ xuất hóa đơn PDF
        if (res.data.orderCode) {
          bookingApi.get('/orders/my').then((ordersRes) => {
            const found = ordersRes.data?.find((o: any) => o.orderCode === res.data.orderCode);
            if (found) {
              setTargetOrderId(found.id);
            }
          }).catch(() => {});
        }
      })
      .catch((err) => {
        console.error('Lỗi khi xác thực callback VNPAY:', err);
        setResult({
          success: false,
          message: err.response?.data?.message || 'Có lỗi xảy ra khi xác thực giao dịch với VNPAY.',
        });
        setLoading(false);
      });
  }, [searchParams]);

  const formatCurrency = (val?: number) => {
    if (!val) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatPayDate = (dateStr?: string) => {
    if (!dateStr || dateStr.length < 14) return dateStr || '-';
    // Định dạng yyyyMMddHHmmss -> dd/MM/yyyy HH:mm:ss
    const y = dateStr.slice(0, 4);
    const m = dateStr.slice(4, 6);
    const d = dateStr.slice(6, 8);
    const h = dateStr.slice(8, 10);
    const min = dateStr.slice(10, 12);
    const s = dateStr.slice(12, 14);
    return `${d}/${m}/${y} ${h}:${min}:${s}`;
  };

  return (
    <div className="min-h-[85vh] bg-[#faf7f2] py-12 px-4 sm:px-6 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl border border-[#e8dbce] shadow-xl overflow-hidden animate-fade-in">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#6d492f]/10 flex items-center justify-center text-[#6d492f]">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-[#462c1a]">
              Đang Xác Thực Giao Dịch VNPAY
            </h2>
            <p className="text-sm text-[#7d6756] max-w-sm">
              Hệ thống đang kiểm tra chữ ký số HMAC-SHA512 và xác nhận thanh toán với cổng VNPAY Sandbox...
            </p>
          </div>
        ) : result?.success ? (
          <div className="p-8 sm:p-10 space-y-6">
            {/* Success Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                Giao Dịch Thành Công
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#462c1a]">
                Thanh Toán Đơn Hàng Thành Công
              </h1>
              <p className="text-sm text-[#7d6756]">
                Cảm ơn Quý khách! Đơn hàng của bạn đã được thanh toán và chuyển tiếp đến nhà bếp Bếp Việt.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-[#faf7f2] border border-[#e8dbce] rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center text-xs pb-3 border-b border-[#e8dbce]/70">
                <span className="text-[#7d6756]">Mã đơn hàng:</span>
                <span className="font-bold text-[#462c1a]">{result.orderCode || '-'}</span>
              </div>
              <div className="flex justify-between items-center text-xs pb-3 border-b border-[#e8dbce]/70">
                <span className="text-[#7d6756]">Số tiền thanh toán:</span>
                <span className="font-serif text-base font-bold text-[#b3261e]">
                  {formatCurrency(result.amount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs pb-3 border-b border-[#e8dbce]/70">
                <span className="text-[#7d6756]">Mã tham chiếu GD:</span>
                <span className="font-mono text-[11px] text-[#462c1a]">{result.txnRef || '-'}</span>
              </div>
              {result.transactionNo && (
                <div className="flex justify-between items-center text-xs pb-3 border-b border-[#e8dbce]/70">
                  <span className="text-[#7d6756]">Mã giao dịch VNPAY:</span>
                  <span className="font-mono text-[11px] text-[#462c1a]">{result.transactionNo}</span>
                </div>
              )}
              {result.bankCode && (
                <div className="flex justify-between items-center text-xs pb-3 border-b border-[#e8dbce]/70">
                  <span className="text-[#7d6756]">Ngân hàng thanh toán:</span>
                  <span className="font-bold text-[#462c1a]">{result.bankCode}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#7d6756]">Thời gian giao dịch:</span>
                <span className="text-[#462c1a]">{formatPayDate(result.payDate)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              {targetOrderId && (
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-white border border-[#6d492f] text-[#6d492f] hover:bg-[#6d492f]/5 transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>Xem & Tải Hóa Đơn PDF</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate('/my-orders')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-[#6d492f] text-white hover:bg-[#533722] shadow-sm transition"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Xem Đơn Hàng Của Tôi</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-[#7d6756] hover:text-[#462c1a] transition"
              >
                <Home className="w-4 h-4" />
                <span>Về Trang Chủ Bếp Việt</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-8 sm:p-10 space-y-6">
            {/* Failed Header */}
            <div className="text-center space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm">
                <XCircle className="w-10 h-10" />
              </div>
              <span className="inline-block px-3 py-1 bg-rose-50 text-rose-700 text-xs font-semibold rounded-full border border-rose-200">
                Thanh Toán Không Thành Công
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#462c1a]">
                Giao Dịch Đã Bị Hủy Hoặc Phát Sinh Lỗi
              </h1>
              <p className="text-sm text-[#7d6756]">
                {result?.message || 'Giao dịch thanh toán qua VNPAY không hoàn tất.'}
              </p>
            </div>

            {/* Error Detail */}
            <div className="bg-[#faf7f2] border border-[#e8dbce] rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-[#e8dbce]/70">
                <span className="text-[#7d6756]">Mã tham chiếu đơn:</span>
                <span className="font-mono font-bold text-[#462c1a]">{result?.txnRef || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#7d6756]">Mã phản hồi VNPAY:</span>
                <span className="font-mono font-bold text-rose-600">{result?.responseCode || 'N/A'}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/my-orders')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm bg-[#6d492f] text-white hover:bg-[#533722] shadow-sm transition"
              >
                <CreditCard className="w-4 h-4" />
                <span>Thực Hiện Thanh Toán Lại</span>
              </button>

              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-[#7d6756] hover:text-[#462c1a] transition"
              >
                <Home className="w-4 h-4" />
                <span>Về Trang Chủ Bếp Việt</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modal Hóa Đơn PDF */}
      <InvoicePreviewModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        orderId={targetOrderId}
        orderCode={result?.orderCode || ''}
      />
    </div>
  );
};
