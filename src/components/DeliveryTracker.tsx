/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Truck, 
  Map, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Compass, 
  ChevronRight, 
  Check, 
  X,
  Receipt,
  Search,
  Activity
} from 'lucide-react';
import { Trip, Vehicle, Driver, TripBillItem, Bill, DeliveryStatus, TripExpense, BillTripExpense } from '../types';

interface DeliveryTrackerProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  tripItems: TripBillItem[];
  bills: Bill[];
  onUpdateDeliveryStatus: (itemId: string, status: DeliveryStatus) => void;
  // Expense handlers
  onAddTripExpense?: (tripId: string, expense: Omit<TripExpense, 'id'>) => void;
  onDeleteTripExpense?: (tripId: string, expenseId: string) => void;
  onAddBillTripExpense?: (tripItemId: string, expense: Omit<BillTripExpense, 'id'>) => void;
  onDeleteBillTripExpense?: (tripItemId: string, expenseId: string) => void;
  // Deep navigation prop
  selectedTripId?: string;
  onSelectTripId?: (tripId: string) => void;
}

export default function DeliveryTracker({
  trips,
  vehicles,
  drivers,
  tripItems,
  bills,
  onUpdateDeliveryStatus,
  onAddTripExpense,
  onDeleteTripExpense,
  onAddBillTripExpense,
  onDeleteBillTripExpense,
  selectedTripId: propSelectedTripId,
  onSelectTripId
}: DeliveryTrackerProps) {

  // Selected state - sync with prop and handle fallback
  const [internalTripId, setInternalTripId] = useState<string>('');
  
  const selectedTripId = propSelectedTripId || internalTripId;
  const setSelectedTripId = onSelectTripId || setInternalTripId;
  
  const [searchQuery, setSearchQuery] = useState('');

  // Active trips list (shipping or pending)
  const availableTripsForTracking = useMemo(() => {
    return trips.filter(t => t.status !== 'pending'); // Show shipping & completed trips
  }, [trips]);

  // Set default trip if empty and exists
  React.useEffect(() => {
    if (!selectedTripId && availableTripsForTracking.length > 0) {
      setSelectedTripId(availableTripsForTracking[0].id);
    }
  }, [availableTripsForTracking, selectedTripId]);

  // Selected Trip detail
  const selectedTrip = useMemo(() => {
    return trips.find(t => t.id === selectedTripId) || null;
  }, [trips, selectedTripId]);

  const selectedVehicle = useMemo(() => {
    if (!selectedTrip) return null;
    return vehicles.find(v => v.id === selectedTrip.vehicleId) || null;
  }, [vehicles, selectedTrip]);

  const selectedDriver = useMemo(() => {
    if (!selectedTrip) return null;
    return drivers.find(d => d.id === selectedTrip.driverId) || null;
  }, [drivers, selectedTrip]);

  // Loaded cargo items details for this trip
  const currentTripCargo = useMemo(() => {
    if (!selectedTripId) return [];
    
    return tripItems
      .filter(item => item.tripId === selectedTripId)
      .map(item => {
        const bill = bills.find(b => b.id === item.billId);
        return {
          itemId: item.id,
          billId: item.billId,
          customerName: bill ? bill.customerName : 'N/A',
          deliveryAddress: bill ? bill.deliveryAddress : 'N/A',
          phone: bill ? bill.phone : 'N/A',
          cod: bill ? bill.cod : 0,
          packagesLoaded: item.packagesLoaded,
          weightLoaded: item.weightLoaded,
          volumeLoaded: item.volumeLoaded,
          deliveryStatus: item.deliveryStatus,
          billTotalPackages: bill ? bill.totalPackages : 0,
          billPackagesDelivered: bill ? bill.packagesDelivered : 0,
          deliveryExpenses: item.deliveryExpenses || []
        };
      })
      .filter(item => {
        return (
          item.billId.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.deliveryAddress.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
  }, [tripItems, selectedTripId, bills, searchQuery]);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">Theo Dõi & Xác Nhận Giao Hàng</h2>
        <p className="text-sm text-slate-500 mt-1">Cơ chế bàn giao dỡ hàng của tài xế xe chặng. Cập nhật tiến độ giao các kiện hàng lẻ thực tế.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left selector and tracking map card */}
        <div className="space-y-6">
          
          {/* Trip Selector */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Chọn chuyến vận hành cần theo dõi</span>
            
            <div className="space-y-2">
              <select
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100 text-xs border border-slate-200 rounded-xl px-3 py-2.5 font-bold font-mono text-slate-800 cursor-pointer focus:outline-none"
              >
                {availableTripsForTracking.length === 0 ? (
                  <option value="">-- Chưa có chuyến xe chạy chặng --</option>
                ) : (
                  availableTripsForTracking.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.id} - Lộ trình: {t.route}
                    </option>
                  ))
                )}
              </select>
            </div>

            {selectedTrip && (
              <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Hành trình:</span>
                  <span className="font-bold text-slate-900">{selectedTrip.route}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Biển số tải:</span>
                  <span className="font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">
                    {selectedVehicle?.licensePlate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Tài xế lái chính:</span>
                  <span className="font-bold text-slate-900">{selectedDriver?.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Trạng thái chuyến:</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                    selectedTrip.status === 'shipping' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedTrip.status === 'shipping' ? 'Đang vận chuyển' : 'Đã hoàn thành'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Routing Vector Mock Map */}
          <div className="bg-slate-950 text-white p-5 rounded-2xl space-y-4 shadow-xl overflow-hidden relative min-h-64 flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider block z-10">Bản đồ luồng phân chuyến LTL</span>
            
            {/* Minimalist vector illustration of shipping nodes */}
            <div className="relative h-28 my-auto flex items-center justify-between px-6 z-10">
              {/* Route lines */}
              <div className="absolute top-[52px] left-8 right-8 h-1 bg-gradient-to-r from-blue-600 via-amber-500 to-emerald-500 rounded-full" />
              
              {/* Node 1 */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 border-2 border-blue-500 flex items-center justify-center font-bold text-xs">HN</div>
                <span className="text-[10px] text-slate-400 font-mono">Nhận kho lẻ</span>
              </div>

              {/* Node 2 - Middle cargo separation */}
              <div className="flex flex-col items-center gap-1 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center font-mono font-bold text-[10px]">LTL</div>
                <span className="text-[9px] text-amber-400 font-mono font-semibold">Tách chặng</span>
              </div>

              {/* Node 3 */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-emerald-600/20 border-2 border-emerald-500 flex items-center justify-center font-bold text-xs">SG</div>
                <span className="text-[10px] text-slate-400 font-mono">Kho phân phối</span>
              </div>
            </div>

            <div className="z-10 flex items-center gap-2 text-xs text-slate-400 border-t border-slate-900/60 pt-3">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cơ sở định đếm vĩ độ GPS từ thiết bị xe tải.</span>
            </div>
            
            {/* background circle lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full z-0 pointer-events-none" />
          </div>

          {/* QUẢN LÝ CHI PHÍ VẬN HÀNH CHUYẾN XE */}
          {selectedTrip && onAddTripExpense && onDeleteTripExpense && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h4 className="text-xs font-mono text-slate-500 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="w-4 h-4 text-amber-500" />
                  <span>Chi phí chuyến xe ({selectedTrip.expenses?.length || 0})</span>
                </h4>
                <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  Tổng: {formatVND((selectedTrip.expenses || []).reduce((sum, e) => sum + e.amount, 0))}
                </span>
              </div>

              {/* List inside */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(!selectedTrip.expenses || selectedTrip.expenses.length === 0) ? (
                  <p className="text-xs text-slate-400 italic text-center py-4">Chưa ghi nhận chi phí vận hành nào</p>
                ) : (
                  selectedTrip.expenses.map(exp => (
                    <div key={exp.id} className="p-2 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between gap-2 text-xs">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase rounded-sm border ${
                            exp.category === 'fuel' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            exp.category === 'toll' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                            exp.category === 'meal' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            'bg-slate-50 text-slate-600 border-slate-100'
                          }`}>
                            {exp.category === 'fuel' ? 'Xăng dầu' :
                             exp.category === 'toll' ? 'Cầu đường' :
                             exp.category === 'meal' ? 'Ăn uống' : 'Khác'}
                          </span>
                          <span className="font-mono font-bold text-slate-800">{formatVND(exp.amount)}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{exp.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDeleteTripExpense(selectedTrip.id, exp.id)}
                        className="text-slate-400 hover:text-red-600 font-bold px-1.5 hover:bg-red-50 rounded transition cursor-pointer text-sm"
                        title="Xoá chi phí"
                      >
                        ×
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Add Form */}
              <form onSubmit={(e) => {
                e.preventDefault();
                const target = e.target as HTMLFormElement;
                const category = (target.elements.namedItem('category') as HTMLSelectElement).value as any;
                const amount = parseFloat((target.elements.namedItem('amount') as HTMLInputElement).value);
                const description = (target.elements.namedItem('description') as HTMLInputElement).value;
                if (!amount || amount <= 0 || !description) {
                  return;
                }
                onAddTripExpense(selectedTrip.id, {
                  category,
                  amount,
                  description,
                  date: new Date().toISOString()
                });
                target.reset();
              }} className="space-y-2 pt-3 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-2">
                  <select
                    name="category"
                    required
                    className="bg-slate-50 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold cursor-pointer focus:bg-white focus:outline-none"
                  >
                    <option value="fuel">Xăng dầu</option>
                    <option value="toll">Cầu đường</option>
                    <option value="meal">Ăn uống/Nghỉ</option>
                    <option value="other">Chi phí khác</option>
                  </select>
                  <input
                    type="number"
                    name="amount"
                    required
                    placeholder="Số tiền (VND)"
                    className="bg-slate-50 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold focus:bg-white focus:outline-none placeholder-slate-400"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="description"
                    required
                    placeholder="Nội dung ví dụ: Phí cầu Hải Phòng..."
                    className="bg-slate-50 text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium flex-1 focus:bg-white focus:outline-none placeholder-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-lg text-xs cursor-pointer transition shadow-sm"
                  >
                    Thêm
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* Right Cargo list where Drivers do unloading update */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold font-sans text-slate-900 text-sm sm:text-base flex items-center gap-1.5">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Hoạt động dỡ hàng tại điểm đích</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Xác minh chất lượng và cập nhật trạng thái kiện lúc tài xế dỡ giao hàng.</p>
            </div>

            {/* Quick inside search */}
            <div className="relative shrink-0 max-w-sm">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Tìm mã Bill liên đới..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {currentTripCargo.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs italic bg-slate-50 border rounded-xl">
                Không tìm thấy kiện hàng nào của chuyến đi {selectedTripId} để tác vụ hoặc phù hợp tìm kiếm!
              </div>
            ) : (
              currentTripCargo.map(item => {
                const isCompletedStatus = item.deliveryStatus === 'delivered';
                const isFailedStatus = item.deliveryStatus === 'failed';

                return (
                  <div key={item.itemId} className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-350 hover:shadow-2xs transition-all space-y-3">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        {/* Bill reference code */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-blue-600">{item.billId}</span>
                          <span className="text-xs text-slate-400">|</span>
                          <span className="text-xs font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-xs">{item.customerName}</span>
                        </div>

                        {/* Cargo size details loaded of this bill on this trip only */}
                        <div className="flex flex-wrap items-center gap-3.5 mt-1 text-[11px] text-slate-500 font-mono">
                          <span>Số kiện giao chuyến này: <b className="text-slate-800">{item.packagesLoaded} kiện</b></span>
                          <span>Trọng lượng: <b className="text-slate-800">{item.weightLoaded} kg</b></span>
                          <span>Thể tích: <b className="text-slate-800">{item.volumeLoaded} m³</b></span>
                        </div>
                      </div>

                      {/* Status indicator badges */}
                      <div>
                        {isCompletedStatus ? (
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded-sm border border-emerald-200 flex items-center gap-1.5 shadow-3xs">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Giao thành công</span>
                          </span>
                        ) : isFailedStatus ? (
                          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-[10px] font-bold uppercase rounded-sm border border-rose-200 flex items-center gap-1.5 shadow-3xs">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Giao thất bại</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-bold uppercase rounded-sm border border-amber-200 flex items-center gap-1.5 font-mono">
                            <Activity className="w-3.5 h-3.5 animate-pulse" />
                            <span>Đang vận chuyển</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Address block and action button */}
                    <div className="p-3 bg-white border border-slate-200/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <p className="text-slate-600 font-medium flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                          <span>{item.deliveryAddress}</span>
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          SĐT: {item.phone} {item.cod > 0 ? `| COD cần thu: ${formatVND(item.cod)}` : ''}
                        </p>
                      </div>

                      {/* Deliver Confirm triggers */}
                      {item.deliveryStatus === 'shipping' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => onUpdateDeliveryStatus(item.itemId, 'failed')}
                            className="p-1 px-3 bg-white hover:bg-rose-50 border border-slate-200 text-rose-600 hover:text-rose-700 hover:border-rose-200 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-3xs"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Thất bại</span>
                          </button>
                          
                          <button
                            onClick={() => onUpdateDeliveryStatus(item.itemId, 'delivered')}
                            className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition shadow-md shadow-emerald-900/10"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3px]" />
                            <span>Đã giao đạt</span>
                          </button>
                        </div>
                      )}

                      {/* Undo changes triggers */}
                      {item.deliveryStatus !== 'shipping' && (
                        <button
                          onClick={() => onUpdateDeliveryStatus(item.itemId, 'shipping')}
                          className="px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-150 rounded text-[10px] border border-transparent hover:border-slate-350 cursor-pointer transition"
                        >
                          Thiết lập lại trạng thái
                        </button>
                      )}

                    </div>

                    {/* CHI PHÍ PHÁT SINH RIÊNG BIỆT CỦA KIỆN HÀNG LẺ (Bốc vác, trung chuyển,...) */}
                    {onAddBillTripExpense && onDeleteBillTripExpense && (
                      <div className="pt-3 border-t border-slate-200/60 space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] text-slate-450 uppercase font-bold flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-blue-500" />
                            <span>Chi phí bốc hàng của Bill ({item.deliveryExpenses?.length || 0})</span>
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-800">
                            Tổng: {formatVND((item.deliveryExpenses || []).reduce((sum, e) => sum + e.amount, 0))}
                          </span>
                        </div>

                        {/* List items */}
                        {item.deliveryExpenses && item.deliveryExpenses.length > 0 && (
                          <div className="space-y-1.5 bg-white p-2.5 rounded-xl border border-slate-200/70">
                            {item.deliveryExpenses.map(exp => (
                              <div key={exp.id} className="flex items-center justify-between text-[11px] hover:bg-slate-50 p-1 rounded-md">
                                <span className="text-slate-600 font-semibold flex items-center gap-1">
                                  <span>{exp.name}</span>
                                  {exp.note && <span className="text-slate-400 font-normal">({exp.note})</span>}
                                </span>
                                <div className="flex items-center gap-1.5 font-mono">
                                  <span className="font-bold text-slate-900">{formatVND(exp.amount)}</span>
                                  <button
                                    type="button"
                                    onClick={() => onDeleteBillTripExpense(item.itemId, exp.id)}
                                    className="text-slate-400 hover:text-red-600 font-extrabold text-sm px-1 cursor-pointer transition"
                                    title="Xoá chi phí phát sinh"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Quick cargo/bill expense form */}
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const target = e.target as HTMLFormElement;
                          const name = (target.elements.namedItem('expenseName') as HTMLInputElement).value;
                          const amount = parseFloat((target.elements.namedItem('expenseAmount') as HTMLInputElement).value);
                          const note = (target.elements.namedItem('expenseNote') as HTMLInputElement).value;
                          if (!name || isNaN(amount) || amount <= 0) {
                            return;
                          }
                          onAddBillTripExpense(item.itemId, {
                            name,
                            amount,
                            note: note || undefined
                          });
                          target.reset();
                        }} className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            name="expenseName"
                            required
                            placeholder="Tên chi phí (Bốc xếp, Nâng hạ, Lưu kho...)"
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-semibold flex-1 min-w-[130px] focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                          />
                          <input
                            type="number"
                            name="expenseAmount"
                            required
                            placeholder="Số tiền (VND)"
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-semibold w-24 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                          />
                          <input
                            type="text"
                            name="expenseNote"
                            placeholder="Ghi chú thêm"
                            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[10px] font-semibold w-24 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400"
                          />
                          <button
                            type="submit"
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-[10px] font-bold rounded-lg cursor-pointer transition shadow-xs"
                          >
                            + Thêm
                          </button>
                        </form>
                      </div>
                    )}

                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
