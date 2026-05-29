/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { 
  Package, 
  Truck, 
  TrendingUp, 
  Clock, 
  MapPin, 
  ArrowRight,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Bill, Trip, Vehicle, Driver, CompanyProfile } from '../types';

interface DashboardProps {
  bills: Bill[];
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  setCurrentTab: (tab: string) => void;
  onSelectBillForDetails?: (bill: Bill) => void;
  companyProfile?: CompanyProfile;
  onEditCompany?: () => void;
}

export default function Dashboard({ 
  bills, 
  trips, 
  vehicles, 
  drivers, 
  setCurrentTab,
  onSelectBillForDetails,
  companyProfile,
  onEditCompany
}: DashboardProps) {

  // 1. Tính toán KPIs
  const kpis = useMemo(() => {
    const totalTodayBills = bills.length;
    
    // Đếm số lượng xe đang hoạt động (running)
    const runningVehicles = vehicles.filter(v => v.status === 'running').length;
    
    // Đếm số bill chưa hoàn thành (pending, shipping, partially_delivered)
    const activeBillsCount = bills.filter(b => b.status !== 'completed' && b.status !== 'returned').length;

    // Tổng doanh thu COD
    const totalCodRevenue = bills
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.cod, 0);

    return {
      totalTodayBills,
      runningVehicles,
      activeBillsCount,
      totalCodRevenue
    };
  }, [bills, vehicles]);

  // Format tiền tệ
  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  // 2. Thống kê tải trọng các xe hiện tại (Dữ liệu cho biểu đồ SVG tự chế)
  const truckChartData = useMemo(() => {
    return vehicles.map(v => {
      // Tính tỉ lệ tải trọng (nếu xe đang chạy hoặc rảnh)
      const isMaintenance = v.status === 'maintenance';
      let loadPercent = 0;
      if (v.status === 'running') {
        loadPercent = Math.floor(Math.random() * 40) + 60; // Mô phỏng tải trọng đang có 60-100%
      } else if (v.status === 'idle') {
        loadPercent = 0;
      }
      return {
        plate: v.licensePlate,
        type: v.type,
        loadPercent: isMaintenance ? 0 : loadPercent,
        status: v.status
      };
    });
  }, [vehicles]);

  // 3. Danh sách các vận đơn khẩn cấp chưa được xếp (pending)
  const pendingBillsList = useMemo(() => {
    return bills.filter(b => b.status === 'pending').slice(0, 5);
  }, [bills]);

  // 4. Các chuyến đi đang thực hiện
  const activeTrips = useMemo(() => {
    return trips.filter(t => t.status === 'shipping').slice(0, 3);
  }, [trips]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">
            {companyProfile?.name || 'Công ty Cổ phần Vận tải LTL Logistics'}
          </h2>
          <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold tracking-wider rounded-full uppercase inline-block mt-1 font-mono">
            {companyProfile?.shortName || 'LTL Logistics'} • {companyProfile?.slogan || 'Vận tải hàng lẻ LTL liên vùng'}
          </span>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3.5 text-xs text-slate-500 font-medium">
            {companyProfile?.phone && (
              <span className="flex items-center gap-1">
                <span>📞 Hotline:</span> <strong>{companyProfile.phone}</strong>
              </span>
            )}
            {companyProfile?.email && (
              <span className="flex items-center gap-1">
                <span>✉️ Email:</span> <strong>{companyProfile.email}</strong>
              </span>
            )}
            {companyProfile?.taxCode && (
              <span className="flex items-center gap-1">
                <span>💼 MST:</span> <strong>{companyProfile.taxCode}</strong>
              </span>
            )}
            {companyProfile?.address && (
              <span className="flex items-center gap-1">
                <span>📍 Trụ sở:</span> <strong>{companyProfile.address}</strong>
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 flex items-center">
          {onEditCompany && (
            <button
              onClick={onEditCompany}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-950 rounded-xl text-xs font-bold transition duration-150 cursor-pointer shadow-3xs flex items-center justify-center gap-1.5"
            >
              <span>⚙️ Hiệu chỉnh doanh nghiệp</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono tracking-wider text-slate-500 uppercase">Tổng số vận đơn</p>
              <h3 className="text-3xl font-sans font-extrabold text-slate-950 mt-2">{kpis.totalTodayBills}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-slate-500">
            <span className="text-emerald-500 font-bold">100%</span>
            <span>hàng lẻ LTL liên vùng</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono tracking-wider text-slate-500 uppercase">Xe đang chạy</p>
              <h3 className="text-3xl font-sans font-extrabold text-slate-950 mt-2">
                {kpis.runningVehicles}
                <span className="text-sm font-normal text-slate-400 ml-1">/ {vehicles.length} xe</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-slate-500">
            <span className="text-emerald-500 font-bold">
              {vehicles.length ? Math.round((kpis.runningVehicles / vehicles.length) * 100) : 0}%
            </span>
            <span>hiệu suất sử dụng đội xe</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono tracking-wider text-slate-500 uppercase">Bills chưa hoàn thành</p>
              <h3 className="text-3xl font-sans font-extrabold text-amber-600 mt-2">{kpis.activeBillsCount}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-slate-500">
            <span>Bao gồm cả đang xếp hoặc gom lẻ</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-mono tracking-wider text-slate-500 uppercase font-bold text-slate-500">COD đã thu hồi</p>
              <h3 className="text-xl lg:text-2xl font-sans font-black text-blue-600 mt-2.5 truncate">{formatVND(kpis.totalCodRevenue)}</h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4 text-xs font-medium text-slate-500">
            <span className="text-rose-500 font-semibold">• Đặt bảo an</span>
            <span>Từ các trạm hoàn thành</span>
          </div>
        </div>
      </div>

      {/* Main Dynamic View: Graphic & Grid list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SVG Performance Chart for Fleet Loading Rate */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-950 font-sans">Hiệu suất và Tỉ lệ Tải trọng Xe tải</h4>
              <p className="text-xs text-slate-500 mt-0.5">Biểu đồ thể hiện phần trăm tải trọng đang sử dụng lúc vận hành của đội xe.</p>
            </div>
            <span className="px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 text-slate-600 rounded-lg font-mono">Real-time</span>
          </div>

          {/* Sạch, hiện đại, custom SVG-based Bar Chart */}
          <div className="pt-4">
            <div className="h-64 flex items-end gap-6 sm:gap-10 border-b border-l border-slate-200 pb-2 pl-4 relative">
              {/* Y-axis labels */}
              <div className="absolute left-[-22px] bottom-[250px] text-[10px] font-mono text-slate-400">100%</div>
              <div className="absolute left-[-16px] bottom-[125px] text-[10px] font-mono text-slate-400">50%</div>
              <div className="absolute left-[-10px] bottom-0 text-[10px] font-mono text-slate-400">0</div>

              {truckChartData.map((data, idx) => {
                const heightPercent = data.loadPercent;
                const barColor = heightPercent > 85 ? 'bg-amber-500' : heightPercent > 0 ? 'bg-blue-600' : 'bg-slate-200';
                
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] font-semibold rounded px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none text-center shadow-lg whitespace-nowrap">
                      <p>{data.plate}</p>
                      <p className="text-blue-400 font-bold font-mono">Tải thực: {data.loadPercent}%</p>
                      <p className="text-[9px] text-slate-300 font-normal">{data.type}</p>
                    </div>

                    {/* Bar Pillar */}
                    <div 
                      className={`w-full max-w-12 rounded-t-lg transition-all duration-700 ease-out hover:brightness-105 shadow-xs ${barColor}`}
                      style={{ height: `${heightPercent || 8}%` }}
                    />

                    {/* Plate Display */}
                    <span className="text-[11px] font-bold font-mono text-slate-700">{data.plate}</span>
                  </div>
                );
              })}
            </div>

            {/* Chart Legend */}
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 bg-blue-600 rounded-sm inline-block" />
                <span className="text-slate-600">Đang hoạt động (Dưới tải lớn)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 bg-amber-500 rounded-sm inline-block" />
                <span className="text-slate-600">Quá tải / Tải tối đa (&gt;85%)</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-3.5 h-3.5 bg-slate-200 rounded-sm inline-block" />
                <span className="text-slate-600">Rảnh rỗi / Đang dừng</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Operations Guide block */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl text-white flex flex-col justify-between">
          <div className="space-y-4">
            <div className="px-2.5 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs rounded-md w-fit font-mono font-bold tracking-wider">
              NGHIỆP VỤ LỌC LẺ
            </div>
            <h4 className="text-lg font-bold font-sans">Quy tắc ghép xe & phân chuyến hàng lẻ (LTL):</h4>
            <ol className="space-y-3.5 text-xs text-slate-300 list-decimal pl-4">
              <li>Mỗi <strong>Vận đơn (Bill)</strong> có thể phân chia lên nhiều <strong>Chuyến Xe</strong> khác nhau để tối ưu lượng trống của thùng xe.</li>
              <li>Tài xế nhận hàng chỉ vận chuyển số lượng kiện cụ thể được nạp lên xe của họ.</li>
              <li>Quá trình tính toán dung lượng xe của hệ thống sẽ tự động trừ đi tổng thể tích và trọng tải dựa trên số lượng gói phân chuyến thực tế.</li>
            </ol>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/50">
            <button 
              onClick={() => setCurrentTab('xep-bill')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-900/40"
            >
              <span>Vào Module Xếp Bill Lên Xe</span>
              <Boxes className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Low-Row Grid: Pending Bills & Active Shipping Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pending Bills waiting loading */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-950 font-sans flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 text-amber-500" />
                <span>Vận đơn hàng lẻ chờ xếp (Mới nhất)</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Các bill cần được tính toán ghép vào các đầu xe còn trống tải trọng.</p>
            </div>
            <button 
              onClick={() => setCurrentTab('bills')}
              className="text-xs text-blue-600 hover:text-blue-500 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {pendingBillsList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm italic">
              Không có vận đơn nào đang chờ xếp chuyến! Tất cả đã lên đường.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingBillsList.map(bill => (
                <div key={bill.id} className="py-3 flex items-center justify-between group">
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-900">{bill.id}</span>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-xs text-slate-600 truncate max-w-[200px] block font-medium">{bill.customerName}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-[11px] text-slate-500 font-mono">
                      <span>Kiện: <b>{bill.totalPackages}</b></span>
                      <span>Trọng lượng: <b>{bill.totalWeight} kg</b></span>
                      <span>Thể tích: <b>{bill.totalVolume} m³</b></span>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSelectBillForDetails && onSelectBillForDetails(bill)}
                    className="p-1 px-2.5 rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Chi tiết
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active trips status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-slate-950 font-sans flex items-center gap-2">
                <Truck className="w-4.5 h-4.5 text-blue-600" />
                <span>Chuyến xe đang vận chuyển thực tế</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Các đoàn tài xế đang giao vận đơn lẻ dọc tuyến dỡ hàng.</p>
            </div>
            <button 
              onClick={() => setCurrentTab('trips')}
              className="text-xs text-blue-600 hover:text-blue-500 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Xem chuyến</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {activeTrips.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm italic">
              Không có chuyến xe nào đang trong lộ trình vào thời điểm này.
            </div>
          ) : (
            <div className="space-y-3">
              {activeTrips.map(trip => {
                const vehicle = vehicles.find(v => v.id === trip.vehicleId);
                const driver = drivers.find(d => d.id === trip.driverId);
                return (
                  <div key={trip.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-900">{trip.id}</span>
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-sm uppercase tracking-wider">
                            Đang chạy
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-700 mt-1.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{trip.route}</span>
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono text-slate-900 bg-slate-200 px-2 py-1 rounded">
                          {vehicle ? vehicle.licensePlate : 'Chưa rõ xe'}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-1">{driver ? driver.fullName : 'Chưa gán'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
