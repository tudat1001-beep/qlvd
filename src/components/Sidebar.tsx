/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Route, 
  Truck, 
  User, 
  Users, 
  BarChart3, 
  Boxes, 
  MapPin, 
  Database,
  Shield,
  TruckIcon,
  Coins,
  ChevronLeft,
  ChevronRight,
  Settings
} from 'lucide-react';
import { User as UserType, CompanyProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: UserType;
  onChangeUser: (userId: string) => void;
  allUsers: UserType[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  companyProfile?: CompanyProfile;
  onEditCompany?: () => void;
}

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  currentUser, 
  onChangeUser, 
  allUsers,
  isCollapsed = false,
  onToggleCollapse,
  companyProfile,
  onEditCompany
}: SidebarProps) {
  
  const menuItems = [
    { id: 'dashboard', name: 'Bảng điều khiển', icon: LayoutDashboard, roles: ['admin', 'operator', 'driver'] },
    { id: 'bills', name: 'Quản lý Bills (Hàng lẻ)', icon: Package, roles: ['admin', 'operator'] },
    { id: 'customers', name: 'Khách hàng & Công nợ', icon: Coins, roles: ['admin', 'operator'], badge: 'Mới' },
    { id: 'trips', name: 'Chuyến xe vận chuyển', icon: Route, roles: ['admin', 'operator', 'driver'] },
    { id: 'xep-bill', name: 'Xếp Bill lên xe', icon: Boxes, roles: ['admin', 'operator'], badge: 'Chính' },
    { id: 'tracking', name: 'Theo dõi giao hàng', icon: MapPin, roles: ['admin', 'operator', 'driver'] },
    { id: 'vehicles', name: 'Đội xe vận tải', icon: Truck, roles: ['admin', 'operator'] },
    { id: 'drivers', name: 'Hồ sơ tài xế', icon: User, roles: ['admin', 'operator'] },
    { id: 'reports', name: 'Báo cáo & Thống kê', icon: BarChart3, roles: ['admin', 'operator'] },
    { id: 'users', name: 'Người dùng & Phân quyền', icon: Users, roles: ['admin'] },
    { id: 'schema', name: 'Supabase SQL Schema', icon: Database, roles: ['admin', 'operator'] }
  ];

  return (
    <aside className={`transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80'} bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0 h-screen overflow-y-auto`}>
      {/* Brand Header */}
      {isCollapsed ? (
        <div className="p-4 py-6 border-b border-slate-800 flex flex-col items-center gap-4 justify-center">
          <div className="p-2 bg-blue-600 rounded-lg text-white">
            <TruckIcon className="w-5 h-5 animate-pulse" />
          </div>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition cursor-pointer flex items-center justify-center shrink-0 border border-slate-700 hover:border-slate-650"
              title="Hiện thanh điều hướng"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="p-6 border-b border-slate-800 flex items-center justify-between gap-2 group/brand">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 bg-blue-600 rounded-lg text-white shrink-0">
              <TruckIcon className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <h1 className="font-sans font-bold text-base leading-tight tracking-tight text-white truncate" title={companyProfile?.name || 'LTL Logistics'}>
                {companyProfile?.shortName || 'LTL Logistics'}
              </h1>
              <span className="text-[10px] font-mono text-slate-400 block mt-0.5 truncate" title={companyProfile?.slogan}>
                {companyProfile?.slogan || 'TMS SaaS Platform v1.2'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onEditCompany && (
              <button
                onClick={onEditCompany}
                className="p-1 text-slate-500 hover:text-white hover:bg-slate-800 rounded transition duration-150 cursor-pointer"
                title="Chỉnh sửa thông tin doanh nghiệp"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition cursor-pointer flex items-center justify-center shrink-0 border border-slate-700 hover:border-slate-650"
                title="Ẩn thanh điều hướng"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active User Switcher (Simulation of SaaS Roles) */}
      {isCollapsed ? (
        <div className="p-2 mx-2.5 my-4 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col items-center gap-2" title={`${currentUser.fullName} (${currentUser.role})`}>
          <div className="p-2 bg-slate-700 rounded-lg text-blue-400">
            <Shield className="w-4 h-4" />
          </div>
          <div className="w-full border-t border-slate-700/60 pt-2 flex flex-col items-center">
            <span className="text-[9px] text-emerald-400 font-mono font-bold">ON</span>
          </div>
        </div>
      ) : (
        <div className="p-4 mx-4 my-4 bg-slate-800/60 rounded-xl border border-slate-700/50">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-slate-700 rounded-lg text-blue-400 mt-0.5">
              <Shield className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium">Đang đăng nhập:</p>
              <h4 className="text-sm font-semibold truncate text-slate-200 mt-0.5">{currentUser.fullName}</h4>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded tracking-wider ${
                  currentUser.role === 'admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                  currentUser.role === 'operator' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {currentUser.role}
                </span>
                <span className="text-xs text-emerald-400 font-mono">• Online</span>
              </div>
            </div>
          </div>

          {/* Quick Simulator User Switcher */}
          <div className="mt-3 pt-3 border-t border-slate-700/60">
            <label className="block text-[11px] font-mono text-slate-500 uppercase mb-1">Mô phỏng vai trò khác:</label>
            <select 
              value={currentUser.id} 
              onChange={(e) => onChangeUser(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.fullName} ({u.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Navigation List */}
      <nav className={`flex-1 ${isCollapsed ? 'px-2' : 'px-3'} space-y-1`}>
        {menuItems.map((item) => {
          // Check role permission
          if (!item.roles.includes(currentUser.role)) return null;

          const IconComponent = item.icon;
          const isActive = currentTab === item.id;

          if (isCollapsed) {
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                title={item.name + (item.badge ? ` (${item.badge})` : '')}
                className={`w-full flex items-center justify-center p-3 rounded-lg text-sm font-medium transition-all duration-150 group relative ${
                  isActive 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <IconComponent className={`w-5 h-5 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                {item.badge && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
                )}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-150 group ${
                isActive 
                  ? 'bg-blue-600 text-white font-semibold' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <IconComponent className={`w-4.5 h-4.5 shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'
                }`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                  isActive ? 'bg-blue-700 text-blue-100' : 'bg-blue-500/10 text-blue-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      {isCollapsed ? (
        <div className="p-4 border-t border-slate-800 text-center text-[10px] font-mono text-slate-500">
          <span>LTL</span>
        </div>
      ) : (
        <div className="p-4 border-t border-slate-800 text-center text-[11px] font-mono text-slate-500">
          <p>© 2026 LTL-Enterprise</p>
          <p className="mt-1">Fullstack SaaS Admin Panel</p>
        </div>
      )}
    </aside>
  );
}
