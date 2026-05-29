/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BillStatus = 'pending' | 'shipping' | 'partially_delivered' | 'completed' | 'returned';

export interface Customer {
  id: string; // Mã Khách Hàng (ví dụ: KH-001)
  name: string; // Tên Khách Hàng / Công ty
  phone: string;
  email: string;
  address: string;
  debtLimit: number; // Hạn mức công nợ tối đa (VND)
  currentDebt?: number; // Công nợ thực tế hiện tại (Sẽ tự động recalculate)
  paidDebt?: number; // Tổng nợ đã thu (Sẽ tự động recalculate)
}

export interface Bill {
  id: string; // Mã Bill
  customerId?: string; // Mã Khách hàng thường xuyên (Nếu có)
  customerName: string;
  goodsName: string; // Tên hàng hóa / Loại hàng hóa
  phone: string;
  deliveryAddress: string;
  totalPackages: number; // Tổng số kiện
  totalWeight: number; // Tổng trọng lượng (kg)
  totalVolume: number; // Tổng thể tích (m³)
  cod: number; // COD (VND)
  shippingFee: number; // Cước phí vận tải (VND)
  paymentStatus: 'unpaid' | 'paid'; // Trạng thái thanh toán cước
  note: string;
  status: BillStatus;
  createdAt: string;
  
  // Tự động tính hoặc cập nhật dựa trên loaded items
  packagesLoaded: number; // Đã xếp bao nhiêu kiện
  packagesRemaining: number; // Còn lại bao nhiêu kiện (total - loaded)
  packagesDelivered: number; // Đã giao bao nhiêu kiện
}

export type VehicleStatus = 'idle' | 'running' | 'maintenance';

export interface Vehicle {
  id: string; // ID / Biển số xe
  licensePlate: string;
  type: string; // Loại xe (Ví dụ: Xe tải 2 tấn, 5 tấn, 10 tấn)
  maxWeight: number; // Tải trọng tối đa (kg)
  maxVolume: number; // Thể tích tối đa (m3)
  driverId: string; // ID của tài xế phụ trách (có thể rỗng)
  status: VehicleStatus;
}

export interface Driver {
  id: string;
  fullName: string;
  phone: string;
  idCard: string; // CCCD
  licenseNumber: string; // Số bằng lái
  status: 'active' | 'inactive';
}

export type TripStatus = 'pending' | 'shipping' | 'completed';

export interface TripExpense {
  id: string;
  category: 'fuel' | 'toll' | 'meal' | 'maintenance' | 'other';
  amount: number;
  description: string;
  date: string;
}

export interface Trip {
  id: string; // Mã chuyến (Ví dụ: TRIP2026052901)
  vehicleId: string;
  driverId: string;
  route: string; // Tuyến đường
  departureTime: string; // Giờ xuất phát
  estimatedArrivalTime: string; // Giờ đến dự kiến
  status: TripStatus;
  expenses?: TripExpense[]; // Chi phí vận chuyển theo chuyến xe
}

export type DeliveryStatus = 'loaded' | 'shipping' | 'delivered' | 'failed';

export interface BillTripExpense {
  id: string;
  name: string;
  amount: number;
  note?: string;
}

export interface TripBillItem {
  id: string; // Primary key của bảng trung gian
  tripId: string;
  billId: string;
  packagesLoaded: number; // Số kiện xếp trong chuyến này
  weightLoaded: number; // Trọng lượng thực tế trong chuyến này (kg)
  volumeLoaded: number; // Thể tích thực tế trong chuyến này (m3)
  deliveryStatus: DeliveryStatus; // Trạng thái giao hàng của phần này
  updatedAt: string;
  deliveryExpenses?: BillTripExpense[]; // Chi phí chi tiết của bill này khi đi theo xe
}

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'driver';
  status: 'active' | 'suspended';
}

export interface CompanyProfile {
  name: string;
  shortName: string;
  phone: string;
  email: string;
  address: string;
  taxCode: string;
  slogan: string;
}

// Helpers for formatted input handling with thousands separates (dots) in real-time
export function formatThousands(val: number | string | undefined | null): string {
  if (val === undefined || val === null || val === '') return '';
  // Strip non-digits except decimals if needed, but for currency we only need integers
  const clean = String(val).replace(/\D/g, '');
  if (!clean) return '';
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseThousands(str: string | undefined | null): number {
  if (!str) return 0;
  const clean = String(str).replace(/\D/g, '');
  return clean ? parseInt(clean, 10) : 0;
}

