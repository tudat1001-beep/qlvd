/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Boxes, 
  MapPin, 
  Truck, 
  Scale, 
  Warehouse, 
  CheckCircle, 
  AlertTriangle, 
  MinusCircle, 
  ArrowRight,
  Info,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  User,
  ExternalLink,
  Plus,
  X
} from 'lucide-react';
import { Bill, Trip, Vehicle, Driver, TripBillItem } from '../types';

interface XepBillModalProps {
  bills: Bill[];
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  tripItems: TripBillItem[];
  onLoadBillToTrip: (
    tripId: string, 
    billId: string, 
    packages: number, 
    weight: number, 
    volume: number
  ) => void;
  onUnloadBillFromTrip: (itemId: string) => void;
  onCreateTrip?: (tripData: Omit<Trip, 'status'>) => void;
}

export default function XepBillModal({
  bills,
  trips,
  vehicles,
  drivers,
  tripItems,
  onLoadBillToTrip,
  onUnloadBillFromTrip,
  onCreateTrip
}: XepBillModalProps) {

  // Selected Trip state
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  
  // Quick Create Trip state
  const [showQuickCreateTrip, setShowQuickCreateTrip] = useState(false);
  const [quickTrip, setQuickTrip] = useState({
    id: '',
    vehicleId: '',
    driverId: '',
    route: '',
    departureTime: '',
    estimatedArrivalTime: ''
  });

  const generateNextTripId = () => {
    const today = new Date();
    const yyyymmdd = today.toISOString().slice(0, 10).replace(/[^0-9]/g, '');
    const prefix = `TRP-${yyyymmdd}-`;
    const ids = trips.map(t => t.id).filter(id => id.startsWith(prefix));
    let maxNum = 0;
    ids.forEach(id => {
      const suffix = id.replace(prefix, '');
      const num = parseInt(suffix, 10);
      if (!isNaN(num) && num > maxNum) maxNum = num;
    });
    const nextNum = maxNum + 1;
    return `${prefix}${String(nextNum).padStart(2, '0')}`;
  };
  
  // Active selection of single bill on the left for split adjustment
  const [activeBillId, setActiveBillId] = useState<string>('');
  
  // Manual loader input states
  const [packagesToLoad, setPackagesToLoad] = useState<number>(0);
  const [weightToLoad, setWeightToLoad] = useState<number>(0);
  const [volumeToLoad, setVolumeToLoad] = useState<number>(0);

  // Active trips list (Only trips that are NOT fully completed)
  const activeTrips = useMemo(() => {
    return trips.filter(t => t.status !== 'completed');
  }, [trips]);

  // Selected Trip Details
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

  // Calculate cargo weight and volume currently loaded in THIS TRIP
  const tripLoadedStats = useMemo(() => {
    if (!selectedTripId) return { count: 0, weight: 0, volume: 0 };
    const items = tripItems.filter(item => item.tripId === selectedTripId);
    
    return {
      count: items.reduce((sum, item) => sum + item.packagesLoaded, 0),
      weight: items.reduce((sum, item) => sum + item.weightLoaded, 0),
      volume: items.reduce((sum, item) => sum + item.volumeLoaded, 0)
    };
  }, [tripItems, selectedTripId]);

  // Available Bills queue (Not completed, has remaining packages > 0)
  const availableBills = useMemo(() => {
    return bills.filter(b => b.status !== 'completed' && b.packagesRemaining > 0);
  }, [bills]);

  // Active selected Bill loaded details
  const activeBill = useMemo(() => {
    return bills.find(b => b.id === activeBillId) || null;
  }, [bills, activeBillId]);

  // List of cargo items currently planned for the select trip (Right list)
  const tripLoadedDetailsList = useMemo(() => {
    if (!selectedTripId) return [];
    return tripItems
      .filter(item => item.tripId === selectedTripId)
      .map(item => {
        const bill = bills.find(b => b.id === item.billId);
        return {
          itemId: item.id,
          billId: item.billId,
          customerName: bill ? bill.customerName : 'N/A',
          totalPackages: bill ? bill.totalPackages : 0,
          packagesLoaded: item.packagesLoaded,
          weightLoaded: item.weightLoaded,
          volumeLoaded: item.volumeLoaded,
          deliveryStatus: item.deliveryStatus
        };
      });
  }, [tripItems, selectedTripId, bills]);

  // Auto proportion calculator
  const handleActiveBillSelect = (billId: string) => {
    setActiveBillId(billId);
    const bill = bills.find(b => b.id === billId);
    if (bill) {
      const remaining = bill.packagesRemaining;
      setPackagesToLoad(remaining);
      
      const ratio = remaining / bill.totalPackages;
      setWeightToLoad(Math.round(bill.totalWeight * ratio));
      setVolumeToLoad(Math.round((bill.totalVolume * ratio) * 100) / 100);
    } else {
      setPackagesToLoad(0);
      setWeightToLoad(0);
      setVolumeToLoad(0);
    }
  };

  // Proportion updates when changing package load slider count
  const handlePackagesToLoadChange = (numPkg: number) => {
    setPackagesToLoad(numPkg);
    if (!activeBill || numPkg <= 0) {
      setWeightToLoad(0);
      setVolumeToLoad(0);
      return;
    }

    const ratio = numPkg / activeBill.totalPackages;
    const suggestedWeight = Math.round(activeBill.totalWeight * ratio);
    const suggestedVolume = Math.round((activeBill.totalVolume * ratio) * 100) / 100;

    setWeightToLoad(suggestedWeight);
    setVolumeToLoad(suggestedVolume);
  };

  // Safety Overloading Guard alert
  const safetyGauges = useMemo(() => {
    if (!selectedTrip || !selectedVehicle || !activeBill) {
      return { hasError: false, messages: [], curWeightPct: 0, curVolPct: 0 };
    }

    const msgs: string[] = [];
    const prospectiveWeight = tripLoadedStats.weight + weightToLoad;
    const prospectiveVolume = tripLoadedStats.volume + volumeToLoad;

    const wLimit = selectedVehicle.maxWeight;
    const vLimit = selectedVehicle.maxVolume;

    const weightPct = Math.round((prospectiveWeight / wLimit) * 100);
    const volPct = Math.round((prospectiveVolume / vLimit) * 100);

    if (packagesToLoad > activeBill.packagesRemaining) {
      msgs.push(`Số kiện xếp (${packagesToLoad}) vượt quá số lượng hàng còn chờ gom lẻ (${activeBill.packagesRemaining} kiện) của Bill!`);
    }

    if (prospectiveWeight > wLimit) {
      msgs.push(`Vượt tải trọng tối đa xe! Cần xếp nạp: ${prospectiveWeight} kg, thùng xe chỉ chịu được tối đa ${wLimit} kg (Vượt quá ${prospectiveWeight - wLimit} kg).`);
    }

    if (prospectiveVolume > vLimit) {
      msgs.push(`Vượt thể tích chứa xe! Quy hoạch: ${prospectiveVolume.toFixed(2)} m³, thùng xe chỉ rộng ${vLimit} m³ (Thiếu hụt ${(prospectiveVolume - vLimit).toFixed(2)} m³).`);
    }

    return {
      hasError: msgs.length > 0,
      messages: msgs,
      curWeightPct: weightPct,
      curVolPct: volPct
    };
  }, [selectedTrip, selectedVehicle, activeBill, packagesToLoad, weightToLoad, volumeToLoad, tripLoadedStats]);

  // Submit load action
  const handleConfirmLoadBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTripId || !activeBillId || packagesToLoad <= 0 || weightToLoad <= 0 || volumeToLoad <= 0) {
      alert('Vui lòng chọn chuyến xe, nhấp chọn Bill ở cột bên trái và điền thông số vận chuyển hợp lệ!');
      return;
    }

    if (safetyGauges.hasError) {
      alert('Không thể bốc hàng: Phát hiện vi phạm an toàn tải trọng hoặc sức dọn chứa của xe!');
      return;
    }

    // Guard duplicate
    if (tripItems.some(item => item.tripId === selectedTripId && item.billId === activeBillId)) {
      alert('Mã vận đơn này đã được xếp vào chuyến này rồi! Bạn có thể nâng số kiện xếp hoặc gỡ hàng ra để bốc lại.');
      return;
    }

    onLoadBillToTrip(selectedTripId, activeBillId, packagesToLoad, weightToLoad, volumeToLoad);

    // Reset selection indicators
    setActiveBillId('');
    setPackagesToLoad(0);
    setWeightToLoad(0);
    setVolumeToLoad(0);
  };

  const formatVND = (v: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Visual Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">Điều Phối & Xếp Bill Lên Xe (LTL Load Planner)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Gom nhiều lô hàng lẻ lên cùng một đầu xe tải. Giao diện song song: Vận đơn chờ xếp ở bên trái, sổ hàng đã chọn xếp ở bên phải.
          </p>
        </div>
      </div>

      {/* Select active Trip / Vehicles */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] font-mono font-bold uppercase text-slate-400">Chuyến xe tải đang quy hoạch lắp đặt</label>
              <select
                value={selectedTripId}
                onChange={(e) => {
                  setSelectedTripId(e.target.value);
                  setActiveBillId(''); // Clear selection to avoid cross validity issues
                }}
                className="mt-1 bg-transparent border-none text-sm font-bold text-slate-900 focus:outline-none cursor-pointer focus:ring-0 w-full max-w-lg truncate"
              >
                <option value="">-- Click vào đây để CHỌN/TAY ĐỔI chuyến xe tải --</option>
                {activeTrips.map(t => {
                  const vehicle = vehicles.find(v => v.id === t.vehicleId);
                  return (
                    <option key={t.id} value={t.id} className="font-mono text-slate-850">
                      Chuyến: {t.id} || Xe: {vehicle?.licensePlate} ({vehicle?.type}) || Tuyến: {t.route}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {onCreateTrip && (
            <button
              onClick={() => {
                const nextId = generateNextTripId();
                const now = new Date();
                const nowStr = now.toISOString().slice(0, 16);
                const eta = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hrs
                const etaStr = eta.toISOString().slice(0, 16);
                
                setQuickTrip({
                  id: nextId,
                  vehicleId: vehicles[0]?.id || '',
                  driverId: vehicles[0]?.driverId || drivers[0]?.id || '',
                  route: 'Hà Nội - Hải Phòng',
                  departureTime: nowStr,
                  estimatedArrivalTime: etaStr
                });
                setShowQuickCreateTrip(true);
              }}
              className="p-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm hover:shadow shrink-0 justify-center h-10 self-center"
              title="Tạo chuyến mới nhanh chóng"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Thêm Chuyến</span>
            </button>
          )}
        </div>

        {selectedTrip && (
          <div className="flex items-center gap-4 text-xs font-mono border-t md:border-t-0 md:border-l border-slate-200 pt-3 md:pt-0 md:pl-5 text-right shrink-0">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Lái chính chủ trì</span>
              <span className="text-slate-800 font-bold">{selectedDriver?.fullName || 'Chưa gán tài xế'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Lộ trình xe chạy</span>
              <span className="text-slate-800 font-bold max-w-xs truncate block">{selectedTrip.route}</span>
            </div>
          </div>
        )}
      </div>

      {/* RENDER PLANNER CASEWORK */}
      {!selectedTripId ? (
        
        /* EMPTY STATE / ONBOARDING WORKFLOW FOR CREATING TRIPS */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-3xl mx-auto space-y-6 shadow-3xs">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Boxes className="w-10 h-10 animate-bounce" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-lg">Chưa chọn hoặc chưa sẵn sàng Chuyến Xe điều động</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Quy trình xếp gom lẻ LTL yêu cầu Bạn tạo hồ sơ Xe tải và thiết kế các Chuyến xe hoạt động trước. Sau khi thiết kế xong, hãy quay lại đây để phân bổ gom các Bill lẻ.
            </p>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl max-w-lg mx-auto text-left text-xs space-y-3">
            <h5 className="font-bold font-sans text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Tiến trình 3 bước bóc xếp dỡ tiêu chuẩn:</span>
            </h5>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-600 font-medium">
              <li>
                Hãy chắc chắn đã Đăng ký đầu xe trong danh mục <b className="text-blue-600">Đội xe vận tải</b>.
              </li>
              <li>
                Lập mã chuyến xe hoạt động (Biển số xe + lộ trình dự kiến) ở trang <b className="text-blue-600">Chuyến xe vận chuyển</b>.
              </li>
              <li>
                Chọn Chuyến Xe đó cuối cùng ở hộp chọn phía trên, bảnh điều khiển bóc xếp phân chia tải trọng sẽ mở ra.
              </li>
            </ol>
          </div>

          <div className="pt-2">
            <p className="text-xs text-slate-400 italic">
              * Hệ điều hành tự động khóa chặt an toàn tải để tránh rủi ro xe vượt quá quy định đường sắt thủy hay cầu đường bộ Việt Nam.
            </p>
          </div>
        </div>

      ) : (

        /* ACTUAL TWIN PANEL WORKSPACE */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMN 1 (LEFT SIDE - LEFT PANE / 5 COLS): AVAILABLE BILLS LIST & DETAILS */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col max-h-[750px]">
            
            {/* Header left panel */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="font-bold font-sans text-slate-950 text-xs sm:text-xs tracking-wide uppercase">
                  1. VẬN ĐƠN CHỜ GOM LÊN XE ({availableBills.length})
                </h3>
              </div>
              <span className="text-[10px] bg-amber-100 text-amber-700 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                Chờ bốc
              </span>
            </div>

            {/* List scroll container */}
            <div className="p-3.5 space-y-3 overflow-y-auto flex-1 bg-slate-50/20">
              {availableBills.length === 0 ? (
                <div className="py-16 text-center text-slate-405 text-xs italic space-y-2">
                  <Warehouse className="w-10 h-10 text-slate-300 mx-auto" />
                  <p>Không còn vận đơn lẻ nào đang đợi bốc xếp bãi!</p>
                </div>
              ) : (
                availableBills.map((b) => {
                  const isSelected = activeBillId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleActiveBillSelect(b.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-150 relative overflow-hidden group ${
                        isSelected 
                          ? 'bg-blue-50/80 border-blue-400 ring-1 ring-blue-455' 
                          : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {/* Active tag indicator */}
                      {isSelected && (
                        <div className="absolute top-0 right-0 bg-blue-650 text-white p-1 rounded-bl-xl text-[9px] font-bold flex items-center">
                          Đang chọn
                        </div>
                      )}

                      {/* Detail headings */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-blue-650 group-hover:underline">
                            {b.id}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">|</span>
                          <span className="text-[10px] text-slate-400 font-mono">Lập đơn: {new Date(b.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-650 truncate max-w-[280px]">
                            {b.customerName}
                          </h4>
                          <div className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100/50 rounded px-1.5 py-0.5 inline-block shrink-0 mt-0.5 max-w-[280px] truncate font-semibold">
                            📦 Hàng: {b.goodsName || 'Đơn hàng lẻ chưa ghi tên'}
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono block mt-1 max-w-[280px] truncate">
                            Giao: {b.deliveryAddress}
                          </span>
                        </div>

                        {/* Cargo weight / volumes metrics footer */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <div>
                            Chờ xếp: <b className="text-amber-600">{b.packagesRemaining}</b> / {b.totalPackages} kiện
                          </div>
                          <div className="text-right">
                            {b.totalWeight} kg • {b.totalVolume} m³
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* MIDDLE COLUMN (INTERACTIVE LOADING MODIFIER CONTROL / 3.5 COLS) */}
          <div className="lg:col-span-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs space-y-5">
            <div className="pb-3 border-b border-slate-150">
              <h4 className="font-extrabold text-slate-950 font-sans text-xs sm:text-xs flex items-center gap-1.5 uppercase">
                <Boxes className="w-4 h-4 text-blue-600" />
                <span>2. BỘ ĐIỀU PHỐI TẢI TRỌNG</span>
              </h4>
            </div>

            {!activeBillId ? (
              <div className="py-12 text-center text-slate-400 text-xs italic space-y-2">
                <Info className="w-10 h-10 text-slate-350 mx-auto" />
                <p className="max-w-[200px] mx-auto">Chọn một Vận Đơn ở cột bên trái để thiết lập khối lượng kiện bốc lên thùng xe.</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmLoadBill} className="space-y-4">
                
                {/* Visual bill short indicator */}
                <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs space-y-1">
                  <div className="font-bold text-slate-900 font-mono text-xs">{activeBill?.id}</div>
                  <div className="text-slate-800 font-bold block truncate max-w-full">{activeBill?.customerName}</div>
                  <div className="text-[11px] text-blue-800 font-bold block truncate max-w-full">📦 Hàng: {activeBill?.goodsName || 'Đơn hàng chưa ghi tên'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Còn lưu kho bãi: <b>{activeBill?.packagesRemaining} kiện</b> ({activeBill?.totalWeight}kg, {activeBill?.totalVolume}m³)
                  </div>
                </div>

                {/* Loading control sliders / input fields */}
                <div className="space-y-3.5 pt-1">
                  
                  {/* Slider packages */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700">Kiện hàng đem xếp:</span>
                      <span className="font-mono font-bold text-blue-650 bg-blue-50/80 border border-blue-100 px-2 py-0.5 rounded">
                        {packagesToLoad} / {activeBill?.packagesRemaining} kiện
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max={activeBill?.packagesRemaining || 1}
                      value={packagesToLoad}
                      onChange={(e) => handlePackagesToLoadChange(Number(e.target.value))}
                      className="w-full h-1 bg-slate-100 accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Manual numerical corrections weight / volume */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Nặng gom (kg)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={weightToLoad || ''}
                        onChange={(e) => setWeightToLoad(Math.max(1, Number(e.target.value)))}
                        className="w-full bg-slate-50 text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase text-slate-500">Thể tích (m³)</label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0.01"
                        value={volumeToLoad || ''}
                        onChange={(e) => setVolumeToLoad(Math.max(0.01, Number(e.target.value)))}
                        className="w-full bg-slate-50 text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Dynamic calculation auto recommendation badge helper */}
                  <p className="text-[9px] text-slate-450 leading-tight flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span>Hệ thống tự cân đối gợi ý dựa trên tỉ trọng trung bình của kiện hàng lẻ.</span>
                  </p>

                </div>

                {/* CAPACITY GAUGES VISUALIZATION PRE-SUBMIT */}
                <div className="space-y-3.5 pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block tracking-wide">
                    Quy hoạch khoang chứa của xe
                  </span>

                  {/* Gauge weight */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-slate-500">
                      <span>Tải trọng thùng xe:</span>
                      <span className="font-semibold text-slate-800">
                        {tripLoadedStats.weight + weightToLoad} kg / {selectedVehicle?.maxWeight} kg
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          (tripLoadedStats.weight + weightToLoad) > (selectedVehicle?.maxWeight || 0) ? 'bg-red-500 animate-pulse' :
                          (tripLoadedStats.weight + weightToLoad) > (selectedVehicle?.maxWeight || 0) * 0.85 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, ((tripLoadedStats.weight + weightToLoad) / (selectedVehicle?.maxWeight || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Gauge volume */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between font-mono text-[10px] text-slate-500">
                      <span>Diện tích lấp đầy:</span>
                      <span className="font-semibold text-slate-800">
                        {(tripLoadedStats.volume + volumeToLoad).toFixed(2)} m³ / {selectedVehicle?.maxVolume} m³
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          (tripLoadedStats.volume + volumeToLoad) > (selectedVehicle?.maxVolume || 0) ? 'bg-red-500 animate-pulse' :
                          (tripLoadedStats.volume + volumeToLoad) > (selectedVehicle?.maxVolume || 0) * 0.85 ? 'bg-amber-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(100, ((tripLoadedStats.volume + volumeToLoad) / (selectedVehicle?.maxVolume || 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* OVERLOAD SAFETY ALERT BANNER */}
                {safetyGauges.hasError && (
                  <div className="p-3 bg-red-50 border border-red-150 rounded-xl text-red-950 font-medium space-y-1 text-[10px]">
                    <div className="flex items-center gap-1.5 font-bold text-red-750">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-650" />
                      <span>Cảnh báo An toàn Vận chuyển</span>
                    </div>
                    {safetyGauges.messages.map((m, idx) => (
                      <p key={idx} className="leading-snug">-{m}</p>
                    ))}
                  </div>
                )}

                {/* CONFIRM BUTTON */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={safetyGauges.hasError || packagesToLoad <= 0}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-505 active:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition shadow-md shadow-blue-900/10"
                  >
                    <span>Đưa gom lên xe tải</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            )}
          </div>

          {/* COLUMN 2 (RIGHT SIDE - RIGHT PANE / 4.5 COLS): BILLED ITEMS ALREADY LOADED */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col max-h-[750px]">
            
            {/* Header right panel */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="font-bold font-sans text-slate-1500 text-xs sm:text-xs tracking-wide uppercase">
                  3. SỔ HÀNG ĐÃ XẾP LÊN XE ({tripLoadedDetailsList.length})
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                Thùng xe
              </span>
            </div>

            {/* List scroll container */}
            <div className="p-4 space-y-3.5 overflow-y-auto flex-1 bg-slate-50/10 divide-y divide-slate-100">
              {tripLoadedDetailsList.length === 0 ? (
                <div className="py-20 text-center text-slate-400 text-xs italic space-y-2">
                  <Truck className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="max-w-[180px] mx-auto">Thùng xe rỗng! Sử dụng Bảng điều phối ở giữa để dán bóc xếp hàng lẻ lên chuyến.</p>
                </div>
              ) : (
                tripLoadedDetailsList.map((item, index) => (
                  <div key={item.itemId} className={`pt-3.5 ${index === 0 ? 'pt-0' : ''}`}>
                    <div className="flex items-start justify-between gap-3 text-xs">
                      
                      <div className="space-y-1 min-w-0">
                        {/* Title Code */}
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900">{item.billId}</span>
                          <span className="px-1.5 py-0.5 bg-blue-1050/10 text-blue-600 font-semibold font-mono text-[9px] rounded">
                            Chuyến chở {item.packagesLoaded} kiện
                          </span>
                        </div>
                        
                        {/* Customer */}
                        <h5 className="font-semibold text-slate-750 truncate max-w-[200px]" title={item.customerName}>
                          {item.customerName}
                        </h5>
                        
                        {/* Metrics weights/volume */}
                        <div className="text-[10px] font-mono text-slate-500 space-y-0.5">
                          <p>Nặng phân dọn: <b>{item.weightLoaded} kg</b></p>
                          <p>Thể tích dọn: <b>{item.volumeLoaded} m³</b></p>
                        </div>
                      </div>

                      {/* Drop action button with highly explicit 'Gỡ xuống' prompt */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn hạ gỡ ${item.packagesLoaded} kiện của Vận đơn ${item.billId} khỏi chuyến xe này không? Hàng lẻ sau khi gỡ sẽ lập tức được trả về danh sách chờ bốc xếp.`)) {
                            onUnloadBillFromTrip(item.itemId);
                          }
                        }}
                        className="p-1.5 px-3 border border-red-200 hover:border-red-500 rounded-xl text-red-650 hover:bg-red-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shrink-0 hover:shadow-sm"
                        title="Hạ gỡ xuống khỏi xe tải"
                      >
                        <MinusCircle className="w-4 h-4 text-red-500" />
                        <span>Gỡ xuống</span>
                      </button>

                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right footer: Total metrics summation on vehicle */}
            {tripLoadedDetailsList.length > 0 && (
              <div className="p-4 bg-slate-90 bg-slate-900 text-white shrink-0 font-mono text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span>TỔNG SỐ LÔ GHẾP:</span>
                  <span className="font-bold text-white">{tripLoadedDetailsList.length} Bill độc lập</span>
                </div>
                <div className="flex justify-between">
                  <span>TỔNG KIỆN HÀNG XẾP:</span>
                  <span className="font-bold text-white">{tripLoadedStats.count} kiện</span>
                </div>
                <div className="flex justify-between text-yellow-450 border-t border-slate-800 pt-1.5 mt-1">
                  <span>DUNG TẢI SUẤT SỬ DỤNG:</span>
                  <span className="font-bold text-blue-400">
                    {Math.round((tripLoadedStats.weight / (selectedVehicle?.maxWeight || 1)) * 100)}% trọng / {Math.round((tripLoadedStats.volume / (selectedVehicle?.maxVolume || 1)) * 150) / 1.5}% tích
                  </span>
                </div>
              </div>
            )}

          </div>

        </div>

      )}
      
      {/* Quick Create Trip Modal */}
      {showQuickCreateTrip && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-8 animate-zoom-in">
              {/* Header */}
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Thêm Chuyến Xe Vận Chuyển Mới
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Khai hành lộ trình mới, gán đầu xe & tài xế</p>
              </div>
              <button 
                type="button"
                onClick={() => setShowQuickCreateTrip(false)}
                className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!quickTrip.id || !quickTrip.vehicleId || !quickTrip.driverId || !quickTrip.route) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
              }
              if (onCreateTrip) {
                onCreateTrip({
                  id: quickTrip.id,
                  vehicleId: quickTrip.vehicleId,
                  driverId: quickTrip.driverId,
                  route: quickTrip.route,
                  departureTime: quickTrip.departureTime,
                  estimatedArrivalTime: quickTrip.estimatedArrivalTime
                });
                setSelectedTripId(quickTrip.id); // Auto select the newly created trip!
              }
              setShowQuickCreateTrip(false);
            }} className="p-6 space-y-4 text-left">
              
              {/* Trip ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mã Chuyến Xe (Có thể chỉnh sửa) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={quickTrip.id}
                  onChange={(e) => setQuickTrip({...quickTrip, id: e.target.value.toUpperCase().trim()})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none font-mono font-bold"
                />
              </div>

              {/* Route */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Lộ Trình / Tuyến Đường Xe Chạy <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hà Nội - Hải Phòng - Quảng Ninh"
                  value={quickTrip.route}
                  onChange={(e) => setQuickTrip({...quickTrip, route: e.target.value})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none placeholder-slate-400 font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Đầu xe phụ trách <span className="text-red-500">*</span></label>
                  <select
                    value={quickTrip.vehicleId}
                    onChange={(e) => {
                      const veh = vehicles.find(v => v.id === e.target.value);
                      setQuickTrip({
                        ...quickTrip,
                        vehicleId: e.target.value,
                        driverId: veh?.driverId || quickTrip.driverId
                      });
                    }}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-bold"
                  >
                    <option value="">-- Chọn xe --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.licensePlate} ({v.type})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driver Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tài xế lái chính <span className="text-red-500">*</span></label>
                  <select
                    value={quickTrip.driverId}
                    onChange={(e) => setQuickTrip({...quickTrip, driverId: e.target.value})}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-bold"
                  >
                    <option value="">-- Chọn tài xế --</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.id})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Departure Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Thời gian xuất phát dự kiến</label>
                  <input
                    type="datetime-local"
                    value={quickTrip.departureTime}
                    onChange={(e) => setQuickTrip({...quickTrip, departureTime: e.target.value})}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono font-semibold"
                  />
                </div>

                {/* Arrival Time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Thời gian hạ dở kết thúc dự kiến</label>
                  <input
                    type="datetime-local"
                    value={quickTrip.estimatedArrivalTime}
                    onChange={(e) => setQuickTrip({...quickTrip, estimatedArrivalTime: e.target.value})}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono font-semibold"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowQuickCreateTrip(false)}
                  className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-emerald-605 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-lg shadow-emerald-900/15"
                >
                  Ghi nhận tạo Chuyến
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
      )}
      
    </div>
  );
}
