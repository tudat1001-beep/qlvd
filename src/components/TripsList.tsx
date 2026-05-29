/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  MapPin, 
  Truck, 
  User, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Trash2,
  X,
  Play,
  Check,
  Search,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  ChevronLeft,
  Coins,
  DollarSign,
  Receipt,
  PlusCircle,
  Tag,
  FileText
} from 'lucide-react';
import { Trip, TripStatus, Vehicle, Driver, TripBillItem, Bill, TripExpense, BillTripExpense } from '../types';

interface TripsListProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  tripItems: TripBillItem[];
  bills: Bill[];
  onCreateTrip: (trip: Omit<Trip, 'status'>) => void;
  onDeleteTrip: (id: string) => void;
  onUpdateTripStatus: (id: string, status: TripStatus) => void;
  onGoToTab: (tab: string) => void;
  onAddTripExpense: (tripId: string, expense: Omit<TripExpense, 'id'>) => void;
  onDeleteTripExpense: (tripId: string, expenseId: string) => void;
  onAddBillTripExpense: (tripItemId: string, expense: Omit<BillTripExpense, 'id'>) => void;
  onDeleteBillTripExpense: (tripItemId: string, expenseId: string) => void;
  onSelectTrackingTrip?: (id: string) => void;
}

export default function TripsList({
  trips,
  vehicles,
  drivers,
  tripItems,
  bills,
  onCreateTrip,
  onDeleteTrip,
  onUpdateTripStatus,
  onGoToTab,
  onAddTripExpense,
  onDeleteTripExpense,
  onAddBillTripExpense,
  onDeleteBillTripExpense,
  onSelectTrackingTrip
}: TripsListProps) {

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Expense manager states
  const [selectedTripForExpenses, setSelectedTripForExpenses] = useState<Trip | null>(null);
  const [expenseTab, setExpenseTab] = useState<'trip' | 'bill'>('trip');

  // Input states for Trip Expense
  const [newTripExpense, setNewTripExpense] = useState({
    category: 'fuel' as 'fuel' | 'toll' | 'meal' | 'maintenance' | 'other',
    amount: '',
    description: ''
  });

  // Input states for Bill Trip Expense (mapped by tripItem ID)
  const [newBillExpenses, setNewBillExpenses] = useState<Record<string, { name: string; amount: string }>>({});

  const categoryLabels = {
    fuel: '⛽ Xăng dầu',
    toll: '🛣️ BOT cầu đường',
    meal: '🍱 Bồi dưỡng ăn ca',
    maintenance: '🔧 Sửa chữa phát sinh',
    other: '📝 Chi phí khác'
  };

  // New Trip Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTrip, setNewTrip] = useState({
    id: '',
    vehicleId: '',
    driverId: '',
    route: '',
    departureTime: '',
    estimatedArrivalTime: ''
  });

  // Calculate matching vehicle driver automatically
  const handleVehicleChange = (vehicleId: string) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    setNewTrip(prev => ({
      ...prev,
      vehicleId,
      // If vehicle has assigned driver, set it automatically to assist the user
      driverId: selectedVehicle?.driverId || prev.driverId
    }));
  };

  // Submit new trip
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.id || !newTrip.vehicleId || !newTrip.driverId || !newTrip.route || !newTrip.departureTime || !newTrip.estimatedArrivalTime) {
      alert('Vui lòng điền đầy đủ tất cả các trường dữ liệu bắt buộc!');
      return;
    }

    const formattedId = newTrip.id.toUpperCase().trim();
    if (trips.some(t => t.id === formattedId)) {
      alert('Mã chuyến xe này đã tồn tại!');
      return;
    }

    onCreateTrip({
      ...newTrip,
      id: formattedId
    });

    // Reset Form
    setNewTrip({
      id: '',
      vehicleId: '',
      driverId: '',
      route: '',
      departureTime: '',
      estimatedArrivalTime: ''
    });
    setIsModalOpen(false);
  };

  // Filters logic
  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
      const vehicle = vehicles.find(v => v.id === trip.vehicleId);
      const driver = drivers.find(d => d.id === trip.driverId);

      const matchesSearch = 
        trip.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trip.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (vehicle && vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (driver && driver.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, searchTerm, statusFilter, vehicles, drivers]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / itemsPerPage));
  const paginatedTrips = useMemo(() => {
    return filteredTrips.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredTrips, currentPage]);

  const statusConfig = {
    pending: { text: 'Chờ xuất phát', bg: 'bg-slate-100 border-slate-200 text-slate-700', icon: HelpCircle },
    shipping: { text: 'Đang vận chuyển', bg: 'bg-blue-50 border-blue-200 text-blue-700', icon: PlayCircle },
    completed: { text: 'Đã hoàn thành', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700', icon: CheckCircle2 }
  };

  const formatDateTime = (isoString: string) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString('vi-VN', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">Quản Lý Chuyến Xe Vận Chuyển</h2>
          <p className="text-sm text-slate-500 mt-1">Điều phối xe chở hàng, khởi động vận chuyển và cập nhật trạng thái hoàn thành.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-900/10"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo chuyến xe mới</span>
        </button>
      </div>

      {/* Control Panel / Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-3xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo Mã chuyến, biển số xe, tài xế, tuyến..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200 shrink-0">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">Trạng thái:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Tất cả chuyến xe</option>
            <option value="pending">Chờ xuất phát</option>
            <option value="shipping">Đang vận chuyển</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* Trips Grid list */}
      {paginatedTrips.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm italic">
          Không tìm thấy chuyến đi hàng lẻ nào phù hợp với bộ lọc!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedTrips.map(trip => {
            const vehicle = vehicles.find(v => v.id === trip.vehicleId);
            const driver = drivers.find(d => d.id === trip.driverId);
            const conf = statusConfig[trip.status];
            const StatusIcon = conf.icon;

            return (
              <div key={trip.id} className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden flex flex-col justify-between group hover:border-blue-300 hover:shadow-xs transition-all duration-150">
                
                {/* Upper division */}
                <div 
                  onClick={() => {
                    if (onSelectTrackingTrip) onSelectTrackingTrip(trip.id);
                    onGoToTab('tracking');
                  }}
                  className="p-5 space-y-4 cursor-pointer hover:bg-slate-50/40 transition-colors"
                  title="Bấm để chuyển qua Theo dõi Giao hàng chi tiết"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-blue-600 block">{trip.id}</span>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-blue-500 shrink-0" />
                        <span>{trip.route}</span>
                      </h4>
                    </div>

                    <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-sm flex items-center gap-1 shrink-0 border ${conf.bg}`}>
                      <StatusIcon className="w-3 h-3" />
                      <span>{conf.text}</span>
                    </span>
                  </div>

                  {/* Vehicle & Driver box */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/50 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">Xe phân nhiệm</span>
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-slate-400" />
                        <span>{vehicle ? vehicle.licensePlate : 'N/A'}</span>
                      </p>
                      <span className="text-[10px] text-slate-500 truncate block">{vehicle ? vehicle.type : ''}</span>
                    </div>

                    <div className="space-y-0.5 border-l border-slate-200 pl-3">
                      <span className="text-[10px] font-mono font-semibold text-slate-400 block uppercase">Tài xế lái chính</span>
                      <p className="font-bold text-slate-800 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{driver ? driver.fullName : 'N/A'}</span>
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono block">{driver ? driver.phone : ''}</span>
                    </div>
                  </div>

                  {/* Datetime range */}
                  <div className="space-y-2 text-xs font-mono text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Xuất phát: <b>{formatDateTime(trip.departureTime)}</b></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Dự kiến đến: <b>{formatDateTime(trip.estimatedArrivalTime)}</b></span>
                    </div>
                  </div>

                </div>

                {/* Footer Controls */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  
                  {/* Action dispatchers */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {trip.status === 'pending' && (
                      <button
                        onClick={() => onUpdateTripStatus(trip.id, 'shipping')}
                        className="py-1.5 px-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition duration-100 shadow-xs"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Xuất bến</span>
                      </button>
                    )}

                    {trip.status === 'shipping' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <button
                          onClick={() => onUpdateTripStatus(trip.id, 'completed')}
                          className="py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition duration-100 shadow-xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>Xong</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            if (onSelectTrackingTrip) onSelectTrackingTrip(trip.id);
                            onGoToTab('tracking');
                          }}
                          className="py-1.5 px-2 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg text-[10px] font-semibold cursor-pointer transition"
                        >
                          Theo dõi
                        </button>
                      </div>
                    )}

                    {trip.status === 'completed' && (
                      <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 pr-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Hoàn thành</span>
                      </span>
                    )}

                    {/* Manage Expenses Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTripForExpenses(trip);
                        setExpenseTab('trip');
                      }}
                      className="py-1.5 px-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer hover:border-blue-300 hover:text-blue-600 transition"
                      title="Quản lý chi phí chi tiết"
                    >
                      <Coins className="w-3.5 h-3.5 text-blue-500" />
                      <span>Chi phí ({trip.expenses?.length || 0})</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Bạn chắc chắn muốn xóa chuyến đi ${trip.id}?`)) {
                        onDeleteTrip(trip.id);
                      }
                    }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 border border-transparent hover:border-red-150 cursor-pointer transition"
                    title="Xóa chuyến xe"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 font-mono text-xs">
          <p className="text-slate-500">Hiển thị các chuyến đi trên trang <b>{currentPage} / {totalPages}</b></p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-white border border-slate-200 text-slate-750 hover:bg-slate-100 disabled:opacity-50 cursor-pointer animate-smooth"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-white border border-slate-200 text-slate-750 hover:bg-slate-100 disabled:opacity-50 cursor-pointer animate-smooth"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CREATE TRIP FORM MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-2xl max-w-7xl w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in my-8">
              {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Thiết Lập Chuyến Xe Vận Chuyển Lẻ</h3>
                <p className="text-xs text-slate-500 mt-1">Cơ sở để nạp tải trọng và chia gói đơn lẻ các chặng.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Trip Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mã Chuyến xe (Trip Code) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: TRP-20260529-03"
                    value={newTrip.id}
                    onChange={(e) => setNewTrip({...newTrip, id: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none uppercase font-mono font-bold"
                  />
                </div>

                {/* Route */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Lộ trình / Tuyến đường <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Kho tổng sài gòn -> Đồng nai"
                    value={newTrip.route}
                    onChange={(e) => setNewTrip({...newTrip, route: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Vehicle Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Chọn Xe Tải Vận Hành <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={newTrip.vehicleId}
                    onChange={(e) => handleVehicleChange(e.target.value)}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-bold font-mono text-slate-800"
                  >
                    <option value="">-- Chọn xe tải trống --</option>
                    {vehicles
                      .filter(v => v.status !== 'maintenance')
                      .map(v => (
                        <option key={v.id} value={v.id}>
                          {v.licensePlate} ({v.type})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Driver selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Chọn Tài Xế Lái Chính <span className="text-red-500">*</span></label>
                  <select
                    required
                    value={newTrip.driverId}
                    onChange={(e) => setNewTrip({...newTrip, driverId: e.target.value})}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-bold text-slate-800"
                  >
                    <option value="">-- Chọn tài xế chính --</option>
                    {drivers
                      .filter(d => d.status === 'active')
                      .map(d => (
                        <option key={d.id} value={d.id}>
                          {d.fullName} (Bằng {d.licenseNumber})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {/* Departure Date/time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Thời gian xuất phát <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={newTrip.departureTime}
                    onChange={(e) => setNewTrip({...newTrip, departureTime: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono"
                  />
                </div>

                {/* Arrival date/time */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Dự kiến đến kho đích <span className="text-red-500">*</span></label>
                  <input
                    type="datetime-local"
                    required
                    value={newTrip.estimatedArrivalTime}
                    onChange={(e) => setNewTrip({...newTrip, estimatedArrivalTime: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-lg shadow-blue-900/15"
                >
                  Khởi tạo chuyến
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
      )}

      {/* MANAGE EXPENSES MODAL & BOOKKEEPING */}
      {selectedTripForExpenses && (() => {
        // Find the live record of selected trip to show reactive expense lists
        const activeTrip = trips.find(t => t.id === selectedTripForExpenses.id) || selectedTripForExpenses;
        const currentExpenses = activeTrip.expenses || [];
        const activeTripItems = tripItems.filter(item => item.tripId === activeTrip.id);
        const totalTripCosts = currentExpenses.reduce((sum, e) => sum + e.amount, 0);

        // Sum of all bills specific handling costs on this trip
        const totalBillCosts = activeTripItems.reduce((sum, item) => {
          const itemCosts = item.deliveryExpenses || [];
          return sum + itemCosts.reduce((s, e) => s + e.amount, 0);
        }, 0);

        return (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
              <div className="bg-white rounded-2xl max-w-7xl w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in my-8">
                
                {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Coins className="w-5 h-5 text-blue-600" />
                    <span>Hạch toán Chi phí Chuyến xe: {activeTrip.id}</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Lộ trình: <span className="font-semibold text-slate-800">{activeTrip.route}</span></p>
                </div>
                <button 
                  onClick={() => setSelectedTripForExpenses(null)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Total Summary bar */}
              <div className="bg-blue-50/50 border-b border-blue-100 p-4 px-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng chi phí xe chặng</span>
                    <span className="text-sm font-extrabold text-blue-700 font-mono">{totalTripCosts.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Tổng chi phí phát sinh theo các Bills</span>
                    <span className="text-sm font-extrabold text-emerald-700 font-mono">{totalBillCosts.toLocaleString('vi-VN')} VND</span>
                  </div>
                </div>
              </div>

              {/* Tab Toggles */}
              <div className="flex border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => setExpenseTab('trip')}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
                    expenseTab === 'trip' 
                      ? 'border-blue-600 text-blue-600 bg-blue-50/10' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  1. Chi Phí Theo Xe ({currentExpenses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setExpenseTab('bill')}
                  className={`flex-1 py-3 text-xs font-bold text-center border-b-2 transition ${
                    expenseTab === 'bill' 
                      ? 'border-blue-600 text-blue-600 bg-blue-50/10' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  2. Chi Phí Từng Bill Khi Theo Xe ({activeTripItems.length} Bill xếp)
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6">

                {/* TAB 1: TRIP VEHICLE EXPENSE DETAILS */}
                {expenseTab === 'trip' && (
                  <div className="space-y-5">
                    
                    {/* Add Trip Expense Inline Form */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Nhập chi phí xe vận chuyển phát sinh</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hạng mục</label>
                          <select
                            value={newTripExpense.category}
                            onChange={(e) => setNewTripExpense(prev => ({ ...prev, category: e.target.value as any }))}
                            className="w-full bg-white text-xs border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer font-semibold text-slate-800"
                          >
                            <option value="fuel">GP/Xăng dầu (Nhiên liệu)</option>
                            <option value="toll">Phí BOT / Cầu đường</option>
                            <option value="meal">Bồi dưỡng ăn ca tài xế</option>
                            <option value="maintenance">Bảo dưỡng dọc đường</option>
                            <option value="other">Khoản chi khác</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Số tiền thanh toán (VND)</label>
                          <input
                            type="number"
                            placeholder="Số tiền..."
                            min="0"
                            value={newTripExpense.amount}
                            onChange={(e) => setNewTripExpense(prev => ({ ...prev, amount: e.target.value }))}
                            className="w-full bg-white text-xs border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-none font-mono font-bold text-slate-850"
                          />
                        </div>

                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Ghi chú diễn giải</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Ví dụ: Hoá đơn dầu chặng đi Ninh Bình..."
                            value={newTripExpense.description}
                            onChange={(e) => setNewTripExpense(prev => ({ ...prev, description: e.target.value }))}
                            className="flex-1 bg-white text-xs border border-slate-250 rounded-lg px-2.5 py-1.5 focus:outline-none placeholder:text-slate-400 font-semibold text-slate-800"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!newTripExpense.amount || !newTripExpense.description) {
                                alert('Vui lòng điền số tiền và diễn giải chi phí!');
                                return;
                              }
                              onAddTripExpense(activeTrip.id, {
                                category: newTripExpense.category,
                                amount: Number(newTripExpense.amount),
                                description: newTripExpense.description.trim(),
                                date: new Date().toISOString()
                              });
                              // Clear inputs
                              setNewTripExpense({
                                category: 'fuel',
                                amount: '',
                                description: ''
                              });
                            }}
                            className="p-1.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 cursor-pointer transition shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Thêm</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Table of Trip Expenses */}
                    <div className="space-y-2">
                      <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Danh sách các khoản chi của xe ({currentExpenses.length})</h5>
                      
                      {currentExpenses.length === 0 ? (
                        <div className="text-center p-6 bg-slate-50 rounded-xl text-slate-400 text-xs italic border border-dashed border-slate-200">
                          Chưa ghi nhận chi phí vận tải nào theo xe này.
                        </div>
                      ) : (
                        <div className="border border-slate-150 rounded-xl overflow-hidden divide-y divide-slate-100">
                          {currentExpenses.map((exp) => (
                            <div key={exp.id} className="p-3 bg-white hover:bg-slate-50/50 flex items-center justify-between gap-4 text-xs transition">
                              <div className="space-y-0.5 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] uppercase">
                                    {(categoryLabels as any)[exp.category] || exp.category}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(exp.date).toLocaleDateString('vi-VN')}
                                  </span>
                                </div>
                                <p className="font-bold text-slate-800 truncate">{exp.description}</p>
                              </div>

                              <div className="flex items-center gap-3">
                                <span className="font-mono font-extrabold text-slate-900 text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                                  {exp.amount.toLocaleString('vi-VN')} VND
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm('Xác nhận đặt bút xóa khoản chi phí xe này?')) {
                                      onDeleteTripExpense(activeTrip.id, exp.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-rose-50 rounded transition cursor-pointer"
                                  title="Xóa khoản chi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}

                {/* TAB 2: BILL LEVEL EXPENSES ON TRANSPORT PROCESS */}
                {expenseTab === 'bill' && (
                  <div className="space-y-4">
                    <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-150 text-[11px] font-semibold leading-relaxed">
                      💡 <b>Mục đích:</b> Hạch toán riêng các chi phí đặc thù chặng cho từng Vận đơn đi cùng xe (ví dụ: phí nâng hạ, bốc vác nâng đỡ, phụ phí ship tận kho lẻ). Khách hàng sẽ chịu hoặc đối chiếu các chi phí này khi hoàn thành.
                    </div>

                    {activeTripItems.length === 0 ? (
                      <div className="text-center p-8 bg-slate-50 rounded-xl text-slate-400 text-xs italic border border-dashed border-slate-200">
                        Chưa có Vận đơn (LTL Package) nào được bốc xếp lên Chuyến xe này. Vui lòng sử dụng tính năng "Xếp Bill lên xe" trước!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeTripItems.map((item) => {
                          const billDetail = bills.find(b => b.id === item.billId);
                          const itemExpenses = item.deliveryExpenses || [];
                          const itemForm = newBillExpenses[item.id] || { name: '', amount: '' };

                          const sumItemExp = itemExpenses.reduce((s, e) => s + e.amount, 0);

                          return (
                            <div key={item.id} className="border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden shadow-3xs transition">
                              
                              {/* Left border with item details header */}
                              <div className="p-3.5 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                      {item.billId}
                                    </span>
                                    <span className="text-xs font-bold text-slate-800">
                                      {billDetail ? billDetail.customerName : 'Không rõ Khách hàng nhận'}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-500 font-medium">
                                    <span>Đã xếp: <b className="font-bold text-slate-700">{item.packagesLoaded} kiện</b></span>
                                    <span>•</span>
                                    <span>Nặng: <b className="font-bold text-slate-700">{item.weightLoaded} kg</b></span>
                                    <span>•</span>
                                    <span>Khối: <b className="font-bold text-slate-700">{item.volumeLoaded} m³</b></span>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="text-[10px] text-slate-400 block font-bold uppercase font-sans">Chi phí riêng của Bill</span>
                                  <span className="text-sm font-extrabold text-slate-850 font-mono">
                                    {sumItemExp.toLocaleString('vi-VN')} VND
                                  </span>
                                </div>
                              </div>

                              {/* Inner lists and inputs */}
                              <div className="p-4 bg-white space-y-3.5">
                                
                                {/* Existing Specific Expenses */}
                                {itemExpenses.length > 0 && (
                                  <div className="space-y-1.5">
                                    <h6 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Hạch toán hiện tại:</h6>
                                    <div className="bg-slate-50/50 rounded-lg divide-y divide-slate-100 border border-slate-100 text-xs">
                                      {itemExpenses.map((exp) => (
                                        <div key={exp.id} className="p-2 px-3 flex items-center justify-between gap-4">
                                          <div className="min-w-0 flex-1">
                                            <span className="font-bold text-slate-800">{exp.name}</span>
                                            {exp.note && <p className="text-[10px] text-slate-400 italic font-medium">{exp.note}</p>}
                                          </div>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-150">
                                              {exp.amount.toLocaleString('vi-VN')} VND
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                if (confirm(`Xóa chi phí "${exp.name}" của vận đơn này?`)) {
                                                  onDeleteBillTripExpense(item.id, exp.id);
                                                }
                                              }}
                                              className="p-1 text-slate-400 hover:text-red-500 rounded hover:bg-slate-100 cursor-pointer transition"
                                            >
                                              <X className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Inline Adder for this Bill */}
                                <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-end sm:items-center gap-2 text-xs">
                                  <div className="flex-1 w-full grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      placeholder="Ví dụ: Phí trung chuyển xe ba gác..."
                                      value={itemForm.name}
                                      onChange={(e) => {
                                        setNewBillExpenses(prev => ({
                                          ...prev,
                                          [item.id]: { ...itemForm, name: e.target.value }
                                        }));
                                      }}
                                      className="bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-400 rounded-lg px-2.5 py-1.5 focus:outline-none font-semibold text-slate-800"
                                    />
                                    <input
                                      type="number"
                                      placeholder="Phí VND..."
                                      min="0"
                                      value={itemForm.amount}
                                      onChange={(e) => {
                                        setNewBillExpenses(prev => ({
                                          ...prev,
                                          [item.id]: { ...itemForm, amount: e.target.value }
                                        }));
                                      }}
                                      className="bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-400 rounded-lg px-2.5 py-1.5 focus:outline-none font-mono font-bold text-slate-850"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!itemForm.name || !itemForm.amount) {
                                        alert('Vui lòng nhập đầy đủ tên phí và số tiền!');
                                        return;
                                      }
                                      onAddBillTripExpense(item.id, {
                                        name: itemForm.name.trim(),
                                        amount: Number(itemForm.amount),
                                        note: `Phát sinh trên chuyến xe ${activeTrip.id}`
                                      });
                                      // Clear item form
                                      setNewBillExpenses(prev => ({
                                        ...prev,
                                        [item.id]: { name: '', amount: '' }
                                      }));
                                    }}
                                    className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer transition shrink-0"
                                  >
                                    <PlusCircle className="w-3.5 h-3.5" />
                                    <span>Áp chi phí</span>
                                  </button>
                                </div>

                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}

                  </div>
                )}

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedTripForExpenses(null)}
                  className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition"
                >
                  Xong & Đóng lại
                </button>
              </div>

            </div>
          </div>
        </div>
        );
      })()}

    </div>
  );
}
