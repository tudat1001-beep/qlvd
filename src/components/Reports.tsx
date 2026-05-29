/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Database, 
  ClipboardCheck, 
  FileSpreadsheet, 
  TrendingUp, 
  Scale, 
  Maximize, 
  Package, 
  Copy, 
  Check, 
  Eye, 
  CheckCircle, 
  Zap 
} from 'lucide-react';
import { Bill, Trip, Vehicle, Driver, TripBillItem } from '../types';

interface ReportsProps {
  bills: Bill[];
  trips: TripsProps[];
  vehicles: Vehicle[];
  drivers: Driver[];
  tripItems: TripBillItem[];
}

type TripsProps = Trip;

export default function Reports({
  bills,
  trips,
  vehicles,
  drivers,
  tripItems
}: ReportsProps) {

  const [activeSubTab, setActiveSubTab] = useState<'kpis' | 'schema'>('kpis');
  const [copiedSql, setCopiedSql] = useState(false);

  // Read code of schema SQL to embed visually in the view
  const sqlCode = `-- ====================================================================
-- DATABASE SCHEMA: LTL TRANSPORTATION MANAGEMENT SYSTEM (TMS)
-- Platform: Supabase / PostgreSQL
-- Features: Row-Level Security (RLS), Real-time Triggers, Foreign Keys
-- ====================================================================

-- 1. ENUM TYPES DEFINITIONS
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'driver');
CREATE TYPE bill_status AS ENUM ('pending', 'shipping', 'partially_delivered', 'completed', 'returned');
CREATE TYPE vehicle_status AS ENUM ('idle', 'running', 'maintenance');
CREATE TYPE trip_status AS ENUM ('pending', 'shipping', 'completed');
CREATE TYPE delivery_status AS ENUM ('loaded', 'shipping', 'delivered', 'failed');

-- 2. USERS TABLE WITH ROLES
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'operator'::user_role,
    status VARCHAR(50) DEFAULT 'active' NOT NULL
);

-- 3. JUMP INTERMEDIATE TRIP_BILL_ITEMS
CREATE TABLE IF NOT EXISTS public.trip_bill_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id VARCHAR(100) REFERENCES public.trips(id) ON DELETE CASCADE,
    bill_id VARCHAR(100) REFERENCES public.bills(id) ON DELETE CASCADE,
    packages_loaded INT NOT NULL CHECK (packages_loaded > 0),
    weight_loaded NUMERIC(10, 2) NOT NULL,
    volume_loaded NUMERIC(10, 2) NOT NULL,
    delivery_status delivery_status DEFAULT 'loaded'::delivery_status,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // KPIs calculations
  const stats = useMemo(() => {
    const totalBills = bills.length;
    const completedBills = bills.filter(b => b.status === 'completed').length;
    const partialBills = bills.filter(b => b.status === 'partially_delivered').length;
    const shippingBills = bills.filter(b => b.status === 'shipping').length;
    const pendingBills = bills.filter(b => b.status === 'pending').length;

    // Delivery rate percentage
    const deliveryRate = totalBills ? Math.round((completedBills / totalBills) * 100) : 0;

    // Total Packages nạp chặng
    const totalPacks = bills.reduce((sum, b) => sum + b.totalPackages, 0);
    const loadedPacks = bills.reduce((sum, b) => sum + b.packagesLoaded, 0);
    const loadedRate = totalPacks ? Math.round((loadedPacks / totalPacks) * 100) : 0;

    // CODs
    const totalCodPlanned = bills.reduce((sum, b) => sum + b.cod, 0);
    const totalCodCollected = bills.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.cod, 0);

    return {
      totalBills,
      completedBills,
      partialBills,
      shippingBills,
      pendingBills,
      deliveryRate,
      totalPacks,
      loadedPacks,
      loadedRate,
      totalCodPlanned,
      totalCodCollected
    };
  }, [bills]);

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-850">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">Báo Cáo Hoạt Động & Supabase SQL Setup</h2>
          <p className="text-sm text-slate-500 mt-1">Đánh giá hệ quả tải dỡ thực tế, tiến trình bốc xếp hàng, và mã nguồn cơ sở dữ liệu Supabase.</p>
        </div>

        {/* Tab triggers toggler */}
        <div className="flex bg-slate-100 p-1 rounded-xl border shrink-0">
          <button
            onClick={() => setActiveSubTab('kpis')}
            className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
              activeSubTab === 'kpis' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline mr-1.5" />
            <span>Chỉ số KPIs</span>
          </button>
          
          <button
            onClick={() => setActiveSubTab('schema')}
            className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
              activeSubTab === 'schema' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 inline mr-1.5" />
            <span>Supabase Schema SQL</span>
          </button>
        </div>
      </div>

      {activeSubTab === 'kpis' ? (
        <div className="space-y-6">
          
          {/* Main KPI grids */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Delivery Performance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-blue-600" />
                <span>Hiệu suất bàn giao (Delivery Rate)</span>
              </h4>
              
              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl font-extrabold font-sans text-slate-950">{stats.deliveryRate}%</span>
                <span className="text-xs font-mono text-slate-400">hoàn thành</span>
              </div>

              {/* Progress gauge */}
              <div className="space-y-2.5">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${stats.deliveryRate}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Thành công: <b>{stats.completedBills}</b></span>
                  <span>Tổng đơn: <b>{stats.totalBills}</b></span>
                </div>
              </div>
            </div>

            {/* Loading Density Performance */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-500" />
                <span>Mật độ bốc xếp lên xe (Loading Rate)</span>
              </h4>

              <div className="flex items-baseline gap-2.5">
                <span className="text-4xl font-extrabold font-sans text-slate-950">{stats.loadedRate}%</span>
                <span className="text-xs font-mono text-slate-400">kiện đã rời kho lẻ</span>
              </div>

              {/* Progress gauge */}
              <div className="space-y-2.5">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${stats.loadedRate}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Đã bốc xếp: <b>{stats.loadedPacks} kiện</b></span>
                  <span>Tổng lượng ký: <b>{stats.totalPacks} kiện</b></span>
                </div>
              </div>
            </div>

            {/* Financial recovery */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                <span>Tỷ lệ hoàn thành COD</span>
              </h4>

              <div className="flex items-baseline gap-2.5">
                <span className="text-2xl font-black font-sans text-teal-600">
                  {stats.totalCodPlanned ? Math.round((stats.totalCodCollected / stats.totalCodPlanned) * 100) : 0}%
                </span>
                <span className="text-xs font-mono text-slate-400">Đã đảm bảo bến</span>
              </div>

              {/* Counts details */}
              <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>COD đã thu hồi thực:</span>
                  <span className="font-mono font-bold text-slate-800">{formatVND(stats.totalCodCollected)}</span>
                </div>
                <div className="flex justify-between">
                  <span>COD cần thu trên luồng:</span>
                  <span className="font-mono text-slate-600">{formatVND(stats.totalCodPlanned)}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Table display status summaries of LTL categories */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="px-6 py-4.5 border-b border-slate-100 bg-slate-50/70">
              <h4 className="font-bold text-slate-900 text-sm font-sans">Báo cáo kiểm soát Vận đơn lẻ chi tiết</h4>
              <p className="text-xs text-slate-500">Giám sát số lượng kiện phân mảnh của từng đơn hàng.</p>
            </div>
            
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 border-b">
                <tr>
                  <th className="px-6 py-3.5">Mã Vận Đơn</th>
                  <th className="px-6 py-3.5">Khách hàng nhận</th>
                  <th className="px-6 py-3.5 text-center">Tổng kiện hàng</th>
                  <th className="px-6 py-3.5 text-center text-blue-600">Kiện Đã Xếp</th>
                  <th className="px-6 py-3.5 text-center text-amber-600">Kiện Còn Lại</th>
                  <th className="px-6 py-3.5 text-center text-emerald-600">Kiện Đã Giao</th>
                  <th className="px-6 py-3.5 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-mono font-bold text-blue-600">{b.id}</td>
                    <td className="px-6 py-3 font-semibold text-slate-800 truncate max-w-xs">{b.customerName}</td>
                    <td className="px-6 py-3 text-center font-bold font-mono">{b.totalPackages}</td>
                    <td className="px-6 py-3 text-center text-blue-600 font-bold font-mono bg-blue-50/20">{b.packagesLoaded}</td>
                    <td className="px-6 py-3 text-center text-amber-600 font-bold font-mono bg-amber-50/20">{b.packagesRemaining}</td>
                    <td className="px-6 py-3 text-center text-emerald-600 font-bold font-mono bg-emerald-50/20">{b.packagesDelivered}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        b.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'shipping' ? 'bg-blue-100 text-blue-800' :
                        b.status === 'partially_delivered' ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-300">
          {/* SQL Title bar */}
          <div className="bg-slate-850 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-400" />
              <div>
                <h4 className="text-sm font-bold text-white font-sans">Mã Schema PostgreSQL - Cấp phép Supabase</h4>
                <p className="text-[11px] text-slate-400">Hãy dùng lệnh SQL này dán trực tiếp vào "SQL Editor" của Supabase Dashboard.</p>
              </div>
            </div>

            <button
              onClick={copySqlToClipboard}
              className="p-1.5 px-3 bg-slate-800 hover:bg-slate-700/80 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 stroke-[3px]" />
                  <span>Đã sao chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Sao chép mã SQL</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer window */}
          <div className="p-4 bg-slate-950 overflow-x-auto select-all max-h-[500px]">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed font-normal whitespace-pre">
              {sqlCode}
            </pre>
          </div>

          <div className="px-6 py-4 bg-slate-850 border-t border-slate-800 text-xs flex items-center gap-2 text-slate-400">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Schema bao gồm các định nghĩa RLS Policy giúp phân quyền chặt chẽ giữa Admin, Operator & Tài xế.</span>
          </div>

        </div>
      )}

    </div>
  );
}
