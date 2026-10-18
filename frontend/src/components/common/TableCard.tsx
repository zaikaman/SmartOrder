import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, QrCode, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { DiningTable, TableStatus } from '../../types';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';

interface TableCardProps {
  table: DiningTable;
}

export const TableCard: React.FC<TableCardProps> = ({ table }) => {
  const [showQrModal, setShowQrModal] = useState(false);
  const { user } = useAuthStore();
  const { setTable } = useCartStore();

  const isStaffOrAdmin = user?.role === 'STAFF' || user?.role === 'ADMIN';

  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return {
          label: 'Bàn trống',
          classes: 'bg-[#2d5a27]/10 text-[#2d5a27] border-[#2d5a27]/30',
          icon: CheckCircle2,
        };
      case 'OCCUPIED':
        return {
          label: 'Đang có khách',
          classes: 'bg-[#b84a28]/10 text-[#b84a28] border-[#b84a28]/30',
          icon: AlertCircle,
        };
      case 'RESERVED':
        return {
          label: 'Đã đặt trước',
          classes: 'bg-[#c85a17]/10 text-[#c85a17] border-[#c85a17]/30',
          icon: Clock,
        };
      default:
        return {
          label: status,
          classes: 'bg-stone-100 text-stone-700 border-stone-200',
          icon: CheckCircle2,
        };
    }
  };

  const statusBadge = getStatusBadge(table.status);
  const StatusIcon = statusBadge.icon;
  const isAvailable = table.status === 'AVAILABLE';

  const qrImageUrl = `/api/v1/tables/${table.id}/qr-image?width=300&height=300`;

  return (
    <>
      <div className={`rounded-xl border p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
        isAvailable ? 'bg-[#faf7f2] border-[#e8dbce]' : 'bg-[#f7f4ef]/80 border-[#ded3c5]'
      }`}>
        <div>
          {/* Header: Table Number & Status */}
          <div className="flex items-center justify-between pb-3 border-b border-[#e8dbce]/70">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold text-[#462c1a]">
                Bàn {table.tableNumber}
              </span>
            </div>
            <span
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusBadge.classes}`}
            >
              <StatusIcon className="w-3 h-3" />
              {statusBadge.label}
            </span>
          </div>

          {/* Details */}
          <div className="py-4 space-y-2 text-sm text-[#6d4f43]">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#8c6d60]" />
              <span>Sức chứa: <strong className="text-[#462c1a]">{table.capacity} khách</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8c6d60]" />
              <span>Khu vực: <strong className="text-[#462c1a]">{table.area}</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons based on Business Logic */}
        <div className="pt-3 border-t border-[#e8dbce]/70 flex items-center gap-2">
          {/* Staff/Admin QR Download button */}
          {isStaffOrAdmin && (
            <button
              onClick={() => setShowQrModal(true)}
              className="p-2 rounded-lg bg-[#f3ece3] hover:bg-[#e8dcce] text-[#6d492f] border border-[#d7bda0]/70 transition-colors"
              title="Quản lý/In mã QR bàn (Dành cho nhân viên)"
            >
              <QrCode className="w-4 h-4" />
            </button>
          )}

          {isAvailable ? (
            <Link
              to={`/booking?tableId=${table.id}`}
              onClick={() => setTable(table.id, table.tableNumber)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-3 rounded-lg bg-[#6d492f] hover:bg-[#533722] text-[#faf7f2] transition-colors shadow-sm"
            >
              <span>Đặt bàn này</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : isStaffOrAdmin ? (
            <Link
              to={`/table/${table.tableNumber}`}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-3 rounded-lg bg-[#533722] hover:bg-[#3f2615] text-[#faf7f2] transition-colors shadow-sm"
              title="Nhân viên điều phối hoặc gọi món tại bàn"
            >
              <span>Vào POS Bàn {table.tableNumber}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : table.status === 'OCCUPIED' ? (
            <div
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-lg bg-stone-100 text-stone-500 border border-stone-200 cursor-not-allowed select-none"
              title="Bàn đang có khách dùng bữa tại quán, không thể đặt hoặc gọi món từ xa."
            >
              <AlertCircle className="w-3.5 h-3.5 text-[#b84a28]" />
              <span>Đang có khách ngồi</span>
            </div>
          ) : (
            <div
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 px-3 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed select-none"
              title="Bàn đã có khách giữ chỗ trước cho khung giờ này."
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Đã có khách đặt</span>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal Preview (Only accessible for Staff/Admin or via QR button) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#faf7f2] border-2 border-[#d7bda0] rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#462c1a]">
              Tem Mã QR Bàn {table.tableNumber}
            </h3>
            <p className="text-xs text-[#7d6756]">
              Tem QR dùng để in ấn và dán trực tiếp lên mặt bàn ăn tại nhà hàng.
            </p>
            <div className="bg-white p-4 rounded-xl border border-[#e8dbce] inline-block shadow-inner">
              <img
                src={qrImageUrl}
                alt={`Mã QR Bàn ${table.tableNumber}`}
                className="w-56 h-56 mx-auto object-contain"
              />
            </div>
            <p className="text-xs text-[#8c6d60] font-mono">
              /table/{table.tableNumber}
            </p>
            <div className="flex gap-2 justify-center pt-2">
              <a
                href={qrImageUrl}
                download={`QR-Ban-${table.tableNumber}.png`}
                className="text-xs font-semibold px-4 py-2 bg-[#2d5a27] text-white rounded-lg hover:bg-[#23471f] transition-colors"
              >
                Tải ảnh in ấn
              </a>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-xs font-semibold px-4 py-2 bg-[#f3ece3] text-[#462c1a] border border-[#d7bda0] rounded-lg hover:bg-[#e8dcce] transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
