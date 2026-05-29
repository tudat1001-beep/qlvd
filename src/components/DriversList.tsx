/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  User, 
  Phone, 
  CreditCard, 
  Award, 
  Trash2, 
  CheckCircle, 
  X, 
  Search,
  Check,
  UserX
} from 'lucide-react';
import { Driver } from '../types';

interface DriversListProps {
  drivers: Driver[];
  onCreateDriver: (driver: Omit<Driver, 'id' | 'status'>) => void;
  onDeleteDriver: (id: string) => void;
  onToggleDriverStatus: (id: string) => void;
}

export default function DriversList({
  drivers,
  onCreateDriver,
  onDeleteDriver,
  onToggleDriverStatus
}: DriversListProps) {

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newDriver, setNewDriver] = useState({
    fullName: '',
    phone: '',
    idCard: '',
    licenseNumber: ''
  });

  const filteredDrivers = drivers.filter(d => (
    d.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.phone.includes(searchTerm) ||
    d.idCard.includes(searchTerm) ||
    d.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDriver.fullName || !newDriver.phone || !newDriver.idCard || !newDriver.licenseNumber) {
      alert('Vui lòng điền đầy đủ các thông tin của tài xế!');
      return;
    }

    onCreateDriver(newDriver);

    // Reset Form
    setNewDriver({
      fullName: '',
      phone: '',
      idCard: '',
      licenseNumber: ''
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">Quản Lý Hồ Sơ Tài Xế</h2>
          <p className="text-sm text-slate-500 mt-1">Thông tin liên hệ, số căn cước CCCD, hạng giấy phép bằng lái và định mức sẵng sàng của tổ tài xế.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-900/10"
        >
          <Plus className="w-4 h-4" />
          <span>Bổ nhiệm tài xế</span>
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
            placeholder="Tìm theo họ tên, SĐT, số CCCD, bằng lái..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans transition-all"
          />
        </div>
      </div>

      {/* List display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDrivers.map(drv => {
          return (
            <div key={drv.id} className="bg-white border border-slate-200 rounded-2xl shadow-3xs overflow-hidden flex flex-col justify-between hover:border-blue-300 transition-all duration-150 group">
              <div className="p-5 space-y-4">
                
                {/* Header info */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                      <User className="w-5 h-5 shrink-0" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{drv.fullName}</h4>
                      <p className="text-[10px] text-slate-400 font-mono font-bold">{drv.id}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded border ${
                    drv.status === 'active' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-slate-105 border-slate-200 text-slate-400'
                  }`}>
                    {drv.status === 'active' ? 'Đang chạy' : 'Mất tín hiệu'}
                  </span>
                </div>

                {/* Sub details lists */}
                <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span className="font-mono">{drv.phone}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-slate-400" />
                    <span>CCCD: <b className="font-mono text-slate-800">{drv.idCard}</b></span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>Bằng lái: <b className="font-mono text-slate-800">{drv.licenseNumber}</b></span>
                  </div>
                </div>

              </div>

              {/* Operations Footer */}
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                <button
                  onClick={() => onToggleDriverStatus(drv.id)}
                  className={`p-1.5 px-3 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                    drv.status === 'active'
                      ? 'bg-slate-100 hover:bg-slate-205 text-slate-600 border-slate-200'
                      : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                  }`}
                >
                  {drv.status === 'active' ? (
                    <>
                      <UserX className="w-3.5 h-3.5" />
                      <span>Đánh dấu Nghỉ phép</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[3px]" />
                      <span>Kích hoạt Sẵn sàng</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Bạn chắc chắn muốn loại tài xế ${drv.fullName} khỏi bãi quản lý?`)) {
                      onDeleteDriver(drv.id);
                    }
                  }}
                  className="p-1 px-2 hover:bg-red-50 text-slate-400 hover:text-red-500 border border-transparent rounded cursor-pointer transition"
                  title="Xoá tài xế"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE DRIVER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in my-8">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">Đăng Ký Tài Xế Logi-Truck</h3>
                  <p className="text-xs text-slate-500 mt-1">Thông tin định danh bắt buộc để dán lên các bộ máy check-in của bến.</p>
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
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Họ và tên tài xế <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyen Van A..."
                    value={newDriver.fullName}
                    onChange={(e) => setNewDriver({...newDriver, fullName: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-bold"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">SĐT liên hệ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="09xxxxxxxx"
                    value={newDriver.phone}
                    onChange={(e) => setNewDriver({...newDriver, phone: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ID Card (CCCD) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 font-bold">Số Căn cước công dân (CCCD) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="0912xxxxxxxx"
                    value={newDriver.idCard}
                    onChange={(e) => setNewDriver({...newDriver, idCard: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono"
                  />
                </div>

                {/* License number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 font-bold">Giấy phép Số bằng lái lái <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="GPLX-xxxxx"
                    value={newDriver.licenseNumber}
                    onChange={(e) => setNewDriver({...newDriver, licenseNumber: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono font-bold"
                  />
                </div>
              </div>

              {/* Form Actions */}
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
                  Lưu hồ sơ tài xế
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
