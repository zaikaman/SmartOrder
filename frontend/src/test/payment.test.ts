import { describe, it, expect } from 'vitest';

describe('VNPAY Payment and Invoice Tests', () => {
  it('định dạng tiền tệ VND chính xác theo chuẩn Việt Nam', () => {
    const amount = 250000;
    const formatted = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    expect(formatted).toContain('250.000');
  });

  it('xử lý chuỗi ngày giờ giao dịch VNPAY dạng yyyyMMddHHmmss', () => {
    const rawDate = '20261014183045';
    const y = rawDate.slice(0, 4);
    const m = rawDate.slice(4, 6);
    const d = rawDate.slice(6, 8);
    const h = rawDate.slice(8, 10);
    const min = rawDate.slice(10, 12);
    const s = rawDate.slice(12, 14);

    const formatted = `${d}/${m}/${y} ${h}:${min}:${s}`;
    expect(formatted).toBe('14/10/2026 18:30:45');
  });

  it('kiểm tra trạng thái thanh toán từ mã phản hồi VNPAY', () => {
    const isSuccess = (code: string) => code === '00';
    expect(isSuccess('00')).toBe(true);
    expect(isSuccess('24')).toBe(false);
    expect(isSuccess('51')).toBe(false);
  });
});
