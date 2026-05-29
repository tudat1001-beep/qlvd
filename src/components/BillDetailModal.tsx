/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  X, 
  MapPin, 
  Receipt, 
  Truck, 
  Calendar, 
  Info, 
  CheckCircle, 
  Compass, 
  User,
  ExternalLink,
  Boxes,
  AlertTriangle
} from 'lucide-react';
import { Bill, Trip, Vehicle, Driver, TripBillItem } from '../types';

interface BillDetailModalProps {
  bill: Bill;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  tripItems: TripBillItem[];
  onClose: () => void;
  onGoToTab: (tab: string) => void;
}

export default function BillDetailModal({
  bill,
  vehicles,
  drivers,
  trips,
  tripItems,
  onClose,
  onGoToTab
}: BillDetailModalProps) {

  // Tìm tất cả các TripBillItem liên quan đến Bill này
  const relativeItems = tripItems.filter(item => item.billId === bill.id);

  // Mở rộng chi tiết chuyến xe và phương tiện
  const loadingHistory = relativeItems.map(item => {
    const trip = trips.find(t => t.id === item.tripId);
    const vehicle = trip ? vehicles.find(v => v.id === trip.vehicleId) : null;
    const driver = trip ? drivers.find(d => d.id === trip.driverId) : null;

    return {
      itemId: item.id,
      tripId: item.tripId,
      packagesLoaded: item.packagesLoaded,
      weightLoaded: item.weightLoaded,
      volumeLoaded: item.volumeLoaded,
      deliveryStatus: item.deliveryStatus,
      updatedAt: item.updatedAt,
      tripRoute: trip ? trip.route : 'Không rõ tuyến',
      tripDeparture: trip ? trip.departureTime : '',
      vehiclePlate: vehicle ? vehicle.licensePlate : 'Chưa rõ xe',
      driverName: driver ? driver.fullName : 'Chưa rõ tài xế',
      deliveryExpenses: item.deliveryExpenses || []
    };
  });

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  const statusConfig = {
    pending: { text: 'Chờ xếp chuyến', bg: 'bg-slate-100 border-slate-200 text-slate-700' },
    shipping: { text: 'Đang vận chuyển', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
    partially_delivered: { text: 'Giao một phần', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
    completed: { text: 'Hoàn thành', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    returned: { text: 'Hoàn hàng', bg: 'bg-rose-50 border-rose-200 text-rose-700' }
  }[bill.status] || { text: 'Chờ xếp', bg: 'bg-stone-100 text-stone-700' };

  const itemStatusConfig = {
    loaded: { text: 'Chờ xuất bến', bg: 'bg-slate-100 text-slate-700' },
    shipping: { text: 'Đang chở đi', bg: 'bg-blue-100 text-blue-700' },
    delivered: { text: 'Giao thành công', bg: 'bg-emerald-100 text-emerald-700' },
    failed: { text: 'Giao thất bại', bg: 'bg-rose-100 text-rose-700' }
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
        <div className="bg-white rounded-2xl max-w-7xl w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in my-8">
          
          {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <span>Chi Tiết Vận Đơn:</span>
                <span className="font-mono text-blue-600 font-extrabold">{bill.id}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Khách hàng: {bill.customerName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Main Info Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Bill Info Card */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Thông tin khách hàng & Giao dỡ</span>
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${statusConfig.bg}`}>
                  {statusConfig.text}
                </span>
              </div>
              
              <div className="space-y-2.5 text-xs">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium font-mono uppercase text-[9px] block">Người nhận</span>
                    <span className="font-bold text-slate-900 text-sm">{bill.customerName}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="text-slate-400 shrink-0 mt-0.5">📦</span>
                  <div>
                    <span className="text-slate-400 font-medium font-mono uppercase text-[9px] block">Tên mặt hàng hóa / Mô tả hàng hóa</span>
                    <span className="font-bold text-blue-700 text-xs sm:text-sm">{bill.goodsName || 'Đơn hàng lẻ chưa đăng ký tên'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium font-mono uppercase text-[9px] block">Số điện thoại</span>
                    <span className="font-semibold text-slate-900 font-mono text-xs">{bill.phone}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-slate-400 font-medium font-mono uppercase text-[9px] block">Địa chỉ đích</span>
                    <span className="font-medium text-slate-800">{bill.deliveryAddress}</span>
                  </div>
                </div>

                {bill.note && (
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 mt-2 flex gap-2">
                    <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase block">Ghi chú</span>
                      <p className="text-slate-600 mt-0.5 italic">{bill.note}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Spec Metrics Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between gap-4">
              <span className="text-[11px] font-mono text-slate-400 font-bold uppercase block">Thông số kỹ thuật</span>
              
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Tổng số kiện:</span>
                  <span className="font-bold text-slate-900">{bill.totalPackages} kiện</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Trọng lượng:</span>
                  <span className="font-bold text-slate-900">{bill.totalWeight} kg</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-500">Thể tích:</span>
                  <span className="font-bold text-slate-900">{bill.totalVolume} m³</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tiền thu hộ:</span>
                  <span className="font-bold text-emerald-600">{formatVND(bill.cod)}</span>
                </div>
              </div>

              {/* Progress visual */}
              <div className="pt-2">
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mb-1">
                  <span>Xếp: {bill.packagesLoaded} kiện</span>
                  <span>Đã giao: {bill.packagesDelivered}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${(bill.packagesDelivered / bill.totalPackages) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${((bill.packagesLoaded - bill.packagesDelivered) / bill.totalPackages) * 100}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Transportation Loading History Log */}
          <div className="space-y-3.5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm sm:text-sm font-sans">Lịch Sử Tách Kiện & Vận Chuyển</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Một bill hàng lẻ có thể chia nhiều lần, đi trên nhiều chuyến khác nhau.</p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onGoToTab('xep-bill');
                }}
                className="py-1 px-2.5 bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-600 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Thêm phân chuyến xe</span>
              </button>
            </div>

            {loadingHistory.length === 0 ? (
              <div className="p-8 bg-slate-50 rounded-xl text-center border border-slate-200/60 flex flex-col items-center justify-center text-slate-500">
                <AlertTriangle className="w-8 h-8 text-amber-500 mb-2 stroke-1.5" />
                <p className="text-xs font-semibold text-slate-700">Chưa được xếp lên chuyến xe nào!</p>
                <p className="text-[10px] text-slate-400 mt-1 max-w-xs leading-normal">
                  Vận đơn này đang ở kho phân mảnh. Hãy sử dụng bảng điều khiển Xếp Vé Xe để bắt đầu gom chuyến.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {loadingHistory.map(item => {
                  const itemConfig = itemStatusConfig[item.deliveryStatus] || itemStatusConfig.loaded;

                  return (
                    <div key={item.itemId} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        
                        {/* Trip Info column */}
                        <div className="space-y-1 sm:max-w-[60%]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-slate-900 bg-slate-200 px-2 py-0.5 rounded">
                              {item.tripId}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.updatedAt ? new Date(item.updatedAt).toLocaleString('vi-VN') : ''}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="truncate">{item.tripRoute}</span>
                          </p>
                          <div className="flex items-center gap-3.5 mt-1 text-[11px] text-slate-500 font-mono">
                            <span className="flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              <span>{item.vehiclePlate}</span>
                            </span>
                            <span>• Tài xế: <b>{item.driverName}</b></span>
                          </div>
                        </div>

                        {/* Cargo Weight capacity and state column */}
                        <div className="flex items-center justify-between sm:text-right gap-4 font-mono shrink-0">
                          <div className="text-left sm:text-right text-xs">
                            <p className="text-slate-800 font-bold">Loaded: {item.packagesLoaded} kiện</p>
                            <p className="text-slate-400 text-[10px] mt-0.5">
                              {item.weightLoaded} kg | {item.volumeLoaded} m³
                            </p>
                          </div>
                          
                          <span className={`px-2 py-1 text-[10px] font-bold rounded-sm uppercase ${
                            item.deliveryStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                            item.deliveryStatus === 'shipping' ? 'bg-blue-100 text-blue-800' :
                            item.deliveryStatus === 'failed' ? 'bg-rose-100 text-rose-800' :
                            'bg-slate-100 text-slate-800'
                          }`}>
                            {itemConfig.text}
                          </span>
                        </div>

                      </div>

                      {/* Specific delivery expenses for this bill on the trip */}
                      {item.deliveryExpenses && item.deliveryExpenses.length > 0 && (
                        <div className="mt-3.5 pt-3 border-t border-slate-200/60 font-sans">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                              💵 Chi phí phát sinh riêng của Bill trên xe:
                            </span>
                            <span className="text-xs font-mono font-bold text-amber-700">
                              Tổng: {formatVND(item.deliveryExpenses.reduce((sum, exp) => sum + exp.amount, 0))}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {item.deliveryExpenses.map((exp) => (
                              <div key={exp.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between shadow-3xs font-mono">
                                <div className="truncate pr-2">
                                  <span className="font-sans font-bold text-slate-700 block">{exp.name}</span>
                                  {exp.note && <span className="text-[9px] text-slate-400 block truncate font-sans">Ghi chú: {exp.note}</span>}
                                </div>
                                <span className="font-bold text-amber-700 shrink-0 text-xs">{formatVND(exp.amount)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-slate-900 hover:bg-slate-850 active:bg-slate-950 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-xl"
          >
            Đóng bảng
          </button>
        </div>

        </div>
      </div>
    </div>
  );
}
