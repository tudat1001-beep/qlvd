/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Truck, 
  Trash2, 
  AlertTriangle, 
  User, 
  Wrench, 
  Check, 
  Scale, 
  Maximize, 
  Search,
  X,
  Gauge,
  History,
  Coins,
  Calendar,
  TrendingUp,
  BarChart3,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Vehicle, VehicleStatus, Driver, Trip, TripBillItem, Bill } from '../types';

interface VehiclesListProps {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  tripItems: TripBillItem[];
  bills: Bill[];
  onCreateVehicle: (vehicle: Omit<Vehicle, 'status'>) => void;
  onDeleteVehicle: (id: string) => void;
  onToggleMaintenance: (id: string) => void;
  onAssignDriver: (vehicleId: string, driverId: string) => void;
}

export default function VehiclesList({
  vehicles,
  drivers,
  trips,
  tripItems,
  bills,
  onCreateVehicle,
  onDeleteVehicle,
  onToggleMaintenance,
  onAssignDriver
}: VehiclesListProps) {

  // Search, Add panel states
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null);
  const [newVehicle, setNewVehicle] = useState({
    id: '',
    licensePlate: '',
    type: 'Xe tải 2.5 Tấn',
    maxWeight: 2500,
    maxVolume: 12,
    driverId: ''
  });

  const handleOpenCreateModal = () => {
    const getNextVehicleId = () => {
      const ids = vehicles.map(v => v.id);
      let maxNum = 4; // corresponding to VEH-01 to VEH-04
      ids.forEach(id => {
        const match = id.match(/VEH-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      return `VEH-${String(nextNum).padStart(2, '0')}`;
    };

    setNewVehicle({
      id: getNextVehicleId(),
      licensePlate: '',
      type: 'Xe tải 2.5 Tấn',
      maxWeight: 2500,
      maxVolume: 12,
      driverId: ''
    });
    setIsModalOpen(true);
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const driverName = drivers.find(d => d.id === v.driverId)?.fullName || '';
    return (
      v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driverName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.id || !newVehicle.licensePlate) {
      alert('Vui lòng điền đủ thông tin: Mã xe & Biển số xe!');
      return;
    }

    const formattedId = newVehicle.id.toUpperCase().trim();
    const formattedPlate = newVehicle.licensePlate.toUpperCase().trim();

    if (vehicles.some(v => v.id === formattedId)) {
      alert('Mã xe tải này đã tồn tại trong hệ thống!');
      return;
    }

    onCreateVehicle({
      id: formattedId,
      licensePlate: formattedPlate,
      type: newVehicle.type,
      maxWeight: newVehicle.maxWeight,
      maxVolume: newVehicle.maxVolume,
      driverId: newVehicle.driverId
    });

    // Reset Form
    setNewVehicle({
      id: '',
      licensePlate: '',
      type: 'Xe tải 2.5 Tấn',
      maxWeight: 2500,
      maxVolume: 12,
      driverId: ''
    });
    setIsModalOpen(false);
  };

  const statusConfig = {
    idle: { text: 'Rảnh rỗi', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    running: { text: 'Đang chạy', bg: 'bg-blue-50 border-blue-200 text-blue-700' },
    maintenance: { text: 'Bảo dưỡng', bg: 'bg-amber-50 border-amber-200 text-amber-700' }
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">Quản Lý Đội Xe Vận Tải</h2>
          <p className="text-sm text-slate-500 mt-1">Thông số hoạt tải thô, thể tích chứa, theo dõi bảo trì và gán đội tài xế phục trách.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-900/10"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm xe mới</span>
        </button>
      </div>

      {/* Toolbar filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-3xs">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm biển số xe, loại xe, tài xế chính..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans transition-all"
          />
        </div>
      </div>

      {/* Grid view of Vehicles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map(vehicle => {
          const config = statusConfig[vehicle.status] || statusConfig.idle;
          const assignedDriver = drivers.find(d => d.id === vehicle.driverId);

          return (
            <div key={vehicle.id} className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden flex flex-col justify-between hover:border-blue-300 transition-all duration-150 group">
              <div className="p-5 space-y-4">
                
                {/* Plate and Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <Truck className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm font-mono tracking-tight">{vehicle.licensePlate}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{vehicle.type}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded border ${config.bg}`}>
                    {config.text}
                  </span>
                </div>

                {/* Technical specs block */}
                <div className="grid grid-cols-2 gap-3.5 p-3 bg-slate-50 rounded-xl border border-slate-200/50 text-xs">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Nặng tối đa</span>
                      <span className="font-bold text-slate-800 font-mono">{vehicle.maxWeight.toLocaleString('vi-VN')} kg</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                    <Maximize className="w-4 h-4 text-slate-400" />
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block uppercase">Khối tối đa</span>
                      <span className="font-bold text-slate-800 font-mono">{vehicle.maxVolume} m³</span>
                    </div>
                  </div>
                </div>

                {/* Driver information */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="font-medium flex items-center gap-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Lái xe đảm nhiệm:</span>
                  </span>
                  
                  {assignedDriver ? (
                    <span className="font-bold text-slate-900">{assignedDriver.fullName}</span>
                  ) : (
                    <span className="text-slate-400 italic">Chưa giao thác</span>
                  )}
                </div>

              </div>

              {/* Action operations in footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2.5">
                
                <div className="flex items-center gap-2">
                  {/* Maintenance toggle buttons */}
                  <button
                    onClick={() => onToggleMaintenance(vehicle.id)}
                    className={`p-1.5 px-2.5 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer border transition-all shrink-0 ${
                      vehicle.status === 'maintenance'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>{vehicle.status === 'maintenance' ? 'Bảo dưỡng xong' : 'Bảo dưỡng'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedVehicleDetails(vehicle)}
                    className="p-1.5 px-3 bg-white hover:bg-slate-150 border border-slate-200 text-blue-650 hover:text-blue-500 rounded-lg text-[10px] sm:text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <History className="w-3.5 h-3.5 text-blue-500" />
                    <span>Chi tiết & Lịch sử</span>
                  </button>
                </div>

                {/* Delete vehicle */}
                <button
                  onClick={() => {
                    if (confirm(`Bạn loại bỏ hoàn toàn xe ${vehicle.licensePlate} khỏi danh mục đầu xe?`)) {
                      onDeleteVehicle(vehicle.id);
                    }
                  }}
                  disabled={vehicle.status === 'running'}
                  className="p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-500 border border-transparent disabled:opacity-50 disabled:hover:bg-transparent cursor-pointer"
                  title="Xoá thông tin xe"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE VEHICLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-2xl max-w-7xl w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in my-8">
              
              {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Ghi Nhận Đầu Xe Vận Tải Mới</h3>
                <p className="text-xs text-slate-500 mt-1">Ghi danh xe chặng bổ sung, tải trọng kỹ thuật thô m3 và khối kg.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              
              {/* Vehicle ID (Auto generated sequential & editable) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mã số xe tải (Có thể chỉnh sửa) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: VEH-05"
                  value={newVehicle.id}
                  onChange={(e) => setNewVehicle({...newVehicle, id: e.target.value.toUpperCase().trim()})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none uppercase font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* License Plate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 font-semibold">Biển số xe kiểm soát <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: 29C-555.22"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none uppercase font-mono font-bold"
                  />
                </div>

                {/* Vehicle model Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Loại tải / Thùng xe <span className="text-red-500">*</span></label>
                  <select
                    value={newVehicle.type}
                    onChange={(e) => setNewVehicle({...newVehicle, type: e.target.value})}
                    className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 cursor-pointer font-semibold text-slate-800"
                  >
                    <option value="Xe tải 2.5 Tấn">Xe tải 2.5 Tấn</option>
                    <option value="Xe tải 5.0 Tấn">Xe tải 5.0 Tấn</option>
                    <option value="Xe tải 8.0 Tấn">Xe tải 8.0 Tấn</option>
                    <option value="Xe đầu kéo 15 Tấn">Xe đầu kéo 15 Tấn</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Max load weight */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tải trọng tối đa (kg) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newVehicle.maxWeight}
                    onChange={(e) => setNewVehicle({...newVehicle, maxWeight: Math.max(1, Number(e.target.value))})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono font-bold"
                  />
                </div>

                {/* Max volume cargo box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Thể tích lớn nhất (m³) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newVehicle.maxVolume}
                    onChange={(e) => setNewVehicle({...newVehicle, maxVolume: Math.max(1, Number(e.target.value))})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* Driver select assign */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tài xế mặc định đảm trách</label>
                <select
                  value={newVehicle.driverId}
                  onChange={(e) => setNewVehicle({...newVehicle, driverId: e.target.value})}
                  className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-semibold text-slate-800 cursor-pointer"
                >
                  <option value="">-- Chưa bốc giao tài xế mặc định --</option>
                  {drivers
                    .filter(d => d.status === 'active')
                    .map(d => (
                      <option key={d.id} value={d.id}>
                        {d.fullName}
                      </option>
                    ))}
                </select>
              </div>

              {/* Form Action buttons */}
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
                  Xác nhận lưu xe
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
      )}

      {/* DETAILED VEHICLE INFORMATION & TRIP OPERATION HISTORY MODAL */}
      {selectedVehicleDetails && (() => {
        const vehicle = selectedVehicleDetails;
        const matchedDriver = drivers.find(d => d.id === vehicle.driverId);
        
        // Filter trips run by this vehicle
        const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id);
        const totalTripsCount = vehicleTrips.length;

        // Retrieve items and calculate packages
        const tripIds = vehicleTrips.map(t => t.id);
        const matchedItems = tripItems.filter(item => tripIds.includes(item.tripId));
        const totalPackagesCarried = matchedItems.reduce((sum, item) => sum + item.packagesLoaded, 0);

        // Compute aggregate operating costs
        let fuelSum = 0;
        let tollSum = 0;
        let mealSum = 0;
        let maintSum = 0;
        let otherSum = 0;

        vehicleTrips.forEach(t => {
          (t.expenses || []).forEach(exp => {
            if (exp.category === 'fuel') fuelSum += exp.amount;
            else if (exp.category === 'toll') tollSum += exp.amount;
            else if (exp.category === 'meal') mealSum += exp.amount;
            else if (exp.category === 'maintenance') maintSum += exp.amount;
            else otherSum += exp.amount;
          });
        });

        const totalExpenseAccumulated = fuelSum + tollSum + mealSum + maintSum + otherSum;

        return (
          <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
            <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
              <div className="bg-white rounded-2xl max-w-7xl w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in text-slate-800 my-8">
                
                {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base">Hồ sơ & Lịch sử xe tải: {vehicle.licensePlate}</h3>
                    <p className="text-xs text-slate-500 mt-1">{vehicle.type}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedVehicleDetails(null)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-6">

                {/* Technical specs card */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Tải trọng thô</span>
                    <span className="font-mono font-extrabold text-slate-850 text-sm">{vehicle.maxWeight.toLocaleString('vi-VN')} kg</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Thể lượng khoang</span>
                    <span className="font-mono font-extrabold text-slate-850 text-sm">{vehicle.maxVolume} m³</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Tài lái phụ trách</span>
                    <select
                      value={vehicle.driverId}
                      onChange={(e) => {
                        onAssignDriver(vehicle.id, e.target.value);
                        setSelectedVehicleDetails({
                          ...vehicle,
                          driverId: e.target.value
                        });
                      }}
                      className="w-full bg-slate-100/80 hover:bg-slate-200 text-xs font-bold text-slate-900 border border-slate-200 rounded px-2 py-1 focus:outline-none transition cursor-pointer"
                    >
                      <option value="">Chưa giao phó</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.fullName} ({d.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Operating Stats Block */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span>Chỉ số hoạt động lũy kế</span>
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="p-3.5 bg-blue-50/50 border border-blue-105 rounded-xl text-center">
                      <span className="text-xs font-bold text-slate-400 block uppercase">Đã chạy</span>
                      <span className="text-xl font-black text-blue-700 font-mono mt-0.5 block">{totalTripsCount} chuyến</span>
                    </div>

                    <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-center">
                      <span className="text-xs font-bold text-slate-400 block uppercase">Kiện đã chở</span>
                      <span className="text-xl font-black text-emerald-700 font-mono mt-0.5 block">{totalPackagesCarried} kiện</span>
                    </div>

                    <div className="p-3.5 bg-amber-50/50 border border-amber-100 rounded-xl text-center col-span-2">
                      <span className="text-xs font-bold text-slate-400 block uppercase">Tổng chi phí vận tải</span>
                      <span className="text-xl font-black text-amber-700 font-mono mt-0.5 block">{totalExpenseAccumulated.toLocaleString('vi-VN')} VND</span>
                    </div>
                  </div>
                </div>

                {/* Financial breakdown chart */}
                {totalExpenseAccumulated > 0 && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-150">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-1.5">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        <span>Phân bổ chi phí của xe</span>
                      </h4>
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-bold">Thống kê thực chi</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {/* Fuel cost */}
                      {fuelSum > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-slate-700">⛽ Nhiên liệu (Xăng dầu)</span>
                            <span className="font-bold font-mono text-slate-800">{fuelSum.toLocaleString('vi-VN')} VND ({Math.round(fuelSum/totalExpenseAccumulated*100)}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${fuelSum/totalExpenseAccumulated*100}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Toll cost */}
                      {tollSum > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-slate-700">🛣️ Phí BOT / Cầu đường</span>
                            <span className="font-bold font-mono text-slate-800">{tollSum.toLocaleString('vi-VN')} VND ({Math.round(tollSum/totalExpenseAccumulated*100)}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full rounded-full" style={{ width: `${tollSum/totalExpenseAccumulated*100}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Meals etc */}
                      {mealSum > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-slate-700">🍱 Bồi dưỡng ăn ca tài xế</span>
                            <span className="font-bold font-mono text-slate-800">{mealSum.toLocaleString('vi-VN')} VND ({Math.round(mealSum/totalExpenseAccumulated*100)}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${mealSum/totalExpenseAccumulated*100}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Maintenance etc */}
                      {maintSum > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-slate-700">🔧 Bảo dưỡng đột xuất</span>
                            <span className="font-bold font-mono text-slate-800">{maintSum.toLocaleString('vi-VN')} VND ({Math.round(maintSum/totalExpenseAccumulated*100)}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full rounded-full" style={{ width: `${maintSum/totalExpenseAccumulated*100}%` }}></div>
                          </div>
                        </div>
                      )}

                      {/* Others */}
                      {otherSum > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="font-semibold text-slate-700">📝 Chi phí dọc đường khác</span>
                            <span className="font-bold font-mono text-slate-800">{otherSum.toLocaleString('vi-VN')} VND ({Math.round(otherSum/totalExpenseAccumulated*100)}%)</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className="bg-slate-500 h-full rounded-full" style={{ width: `${otherSum/totalExpenseAccumulated*100}%` }}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TRIP OPERATION HISTORIES PROGRESSION LIST */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-purple-600" />
                    <span>Lịch trình & lộ trình di chuyển ({vehicleTrips.length} chuyến)</span>
                  </h4>

                  {vehicleTrips.length === 0 ? (
                    <div className="text-center p-6 bg-slate-50 rounded-xl text-slate-400 text-xs italic border border-dashed border-slate-200">
                      Đầu xe tải này chưa từng thực hiện lưu hành chuyến xe nào trong lịch sử hệ thống.
                    </div>
                  ) : (
                    <div className="border border-slate-250 rounded-xl overflow-hidden divide-y divide-slate-100">
                      {vehicleTrips.map((trip) => {
                        const tripItemsCount = tripItems.filter(item => item.tripId === trip.id).length;
                        const tripExpensesSum = (trip.expenses || []).reduce((s, e) => s + e.amount, 0);

                        return (
                          <div key={trip.id} className="p-3 bg-white hover:bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-1 py-0.5 rounded border border-blue-100">
                                  {trip.id}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {new Date(trip.departureTime).toLocaleDateString('vi-VN')}
                                </span>
                                <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                                  trip.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 
                                  trip.status === 'shipping' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {trip.status === 'completed' ? 'Đã hoàn thành' : trip.status === 'shipping' ? 'Đang chạy' : 'Chờ chạy'}
                                </span>
                              </div>
                              <p className="font-bold text-slate-850">{trip.route}</p>
                              <p className="text-[10px] text-slate-400">
                                Mang theo: {tripItemsCount} Bill hàng lẻ lẻ • Tổng chi phí chặng xe: <strong>{tripExpensesSum.toLocaleString('vi-VN')} VND</strong>
                              </p>
                            </div>

                            <div className="text-left sm:text-right shrink-0">
                              <span className="text-[10px] text-slate-400 block font-bold uppercase">Tổng phí chặng</span>
                              <strong className="text-slate-850 font-mono text-sm">{tripExpensesSum.toLocaleString('vi-VN')} VND</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedVehicleDetails(null)}
                  className="py-2 px-5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-xs"
                >
                  Đóng hồ sơ xe
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
