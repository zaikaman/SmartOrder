import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Download, Printer, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { bookingApi } from '../../api/client';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
  orderCode: string;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({
  isOpen,
  onClose,
  orderId,
  orderCode,
}) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Khoa scroll man hinh va lang nghe phim Escape khi modal mo
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !orderId) {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
        setPdfBlobUrl(null);
      }
      setError(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    bookingApi
      .get(`/orders/${orderId}/invoice.pdf`, {
        responseType: 'blob',
      })
      .then((res) => {
        if (!isMounted) return;
        const blob = new Blob([res.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setPdfBlobUrl(url);
        setLoading(false);
      })
      .catch(async (err) => {
        if (!isMounted) return;
        console.error('Lỗi khi tải hóa đơn PDF:', err);
        let errorMsg = 'Không thể tải tệp hóa đơn PDF. Xin vui lòng thử lại sau.';
        if (err.response?.data instanceof Blob) {
          try {
            const text = await err.response.data.text();
            const parsed = JSON.parse(text);
            if (parsed.message) errorMsg = parsed.message;
          } catch {
            // Không phải json
          }
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }
        setError(errorMsg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [isOpen, orderId]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!pdfBlobUrl) return;
    const a = document.createElement('a');
    a.href = pdfBlobUrl;
    a.download = `HoaDon_BepViet_${orderCode || orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrint = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-10 bg-[#faf7f2] border border-[#e8dbce] rounded-3xl w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#e8dbce] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6d492f]/10 flex items-center justify-center text-[#6d492f]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#462c1a]">
                Hóa Đơn Điện Tử Đơn #{orderCode || orderId}
              </h2>
              <p className="text-xs text-[#7d6756]">
                Nhà Hàng Ẩm Thực Bếp Việt - Kết xuất định dạng PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {pdfBlobUrl && !loading && !error && (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#6d492f] bg-[#6d492f]/10 hover:bg-[#6d492f]/20 rounded-lg transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>In hóa đơn</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#6d492f] hover:bg-[#533722] rounded-lg shadow-sm transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải PDF</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#7d6756] hover:text-[#462c1a] hover:bg-black/5 rounded-lg transition ml-2"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-[#ede6dc]/30 p-4 overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#faf7f2]/80 backdrop-blur-sm z-10">
              <RefreshCw className="w-8 h-8 text-[#6d492f] animate-spin mb-3" />
              <p className="text-sm font-medium text-[#462c1a]">Đang tạo và tải tệp hóa đơn PDF...</p>
              <p className="text-xs text-[#7d6756] mt-1">Xin vui lòng chờ trong giây lát</p>
            </div>
          )}

          {error && !loading && (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#462c1a] mb-1">Không thể tải hóa đơn</h3>
              <p className="text-xs text-[#7d6756] max-w-md mb-4">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  bookingApi
                    .get(`/orders/${orderId}/invoice.pdf`, { responseType: 'blob' })
                    .then((res) => {
                      const blob = new Blob([res.data], { type: 'application/pdf' });
                      setPdfBlobUrl(URL.createObjectURL(blob));
                      setLoading(false);
                    })
                    .catch((e) => {
                      setError(e.response?.data?.message || 'Không thể tải tệp hóa đơn.');
                      setLoading(false);
                    });
                }}
                className="px-4 py-2 bg-[#6d492f] text-white rounded-xl text-xs font-bold hover:bg-[#533722] transition"
              >
                Thử lại
              </button>
            </div>
          )}

          {pdfBlobUrl && !loading && !error && (
            <iframe
              ref={iframeRef}
              src={pdfBlobUrl}
              title={`Hóa đơn ${orderCode}`}
              className="w-full h-full rounded-xl border border-[#e8dbce] bg-white shadow-inner"
            />
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
