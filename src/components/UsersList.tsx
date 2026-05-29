/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  ShieldAlert, 
  Info,
  Lock,
  Unlock,
  Key
} from 'lucide-react';
import { User } from '../types';

interface UsersListProps {
  users: User[];
  currentUser: User;
  onUpdateUserRole: (id: string, role: User['role']) => void;
  onAddUser: (user: Omit<User, 'id' | 'status'>) => void;
}

export default function UsersList({
  users,
  currentUser,
  onUpdateUserRole,
  onAddUser
}: UsersListProps) {

  // New user popup states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    username: '',
    email: '',
    role: 'operator' as User['role']
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.fullName || !newUser.username || !newUser.email) {
      alert('Vui lòng điền đầy đủ các thông tin người dùng mới!');
      return;
    }

    onAddUser(newUser);

    // Reset Form
    setNewUser({
      fullName: '',
      username: '',
      email: '',
      role: 'operator'
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">Quản Lý Người Dùng & Phân Quyền</h2>
          <p className="text-sm text-slate-500 mt-1">Cấp tài khoản vận hành bến xe, gán vai trò người quản trị, điều phối viên hoặc tổ tài xế.</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-900/10"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm thành viên bến</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Users table list */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-3xs lg:col-span-2">
          <div className="px-6 py-4.5 bg-slate-50/70 border-b border-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold font-sans text-slate-900 text-sm">Danh sách nhân sự hệ thống</h3>
          </div>

          <table className="min-w-full divide-y divide-slate-100 text-xs text-left whitespace-nowrap">
            <thead className="bg-slate-50 font-mono text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b">
              <tr>
                <th className="px-6 py-3.5">Họ tên / Username</th>
                <th className="px-6 py-3.5">Thư điện tử (Email)</th>
                <th className="px-6 py-3.5 text-center">Vai trò vận hành</th>
                <th className="px-6 py-3.5 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => {
                const isMe = u.id === currentUser.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/40">
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{u.fullName}</span>
                        {isMe && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[9px] uppercase font-bold rounded">Tôi</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-mono">@{u.username}</div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-mono font-medium">{u.email}</td>
                    <td className="px-6 py-3.5 text-center">
                      <select
                        value={u.role}
                        disabled={isMe} // Prevents self lockout
                        onChange={(e) => onUpdateUserRole(u.id, e.target.value as User['role'])}
                        className="bg-slate-50 hover:bg-slate-100/50 text-xs font-semibold px-2.5 py-1 border border-slate-200 rounded cursor-pointer disabled:opacity-50"
                      >
                        <option value="admin">Administrator (Quản trị)</option>
                        <option value="operator">Operator (Điều hành viên)</option>
                        <option value="driver">Driver (Tài xế lái xe)</option>
                      </select>
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                        Active
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Roles Policy reference card */}
        <div className="space-y-6">
          
          {/* Security details card */}
          <div className="p-5 bg-slate-900 border border-slate-850 rounded-2xl text-white space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h4 className="font-bold text-white text-sm">Chính sách Phân quyền RLS</h4>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl space-y-1">
                <p className="font-bold text-red-400 font-mono uppercase text-[10px] tracking-wide">Administrator (Admin):</p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Có toàn quyền bến dỡ, gán xe, sửa các mã Bill, đổi trạng thái và nâng cấp vai trò của các nhân sự khác.
                </p>
              </div>

              <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl space-y-1">
                <p className="font-bold text-blue-400 font-mono uppercase text-[10px] tracking-wide">Operator (Điều phố):</p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Được dùng Module <b>Tạo Bill lẻ</b>, <b>Xếp xe vận tải</b>, và <b>Theo dõi dỡ</b>. Bị chặn đổi cấu hình người dùng.
                </p>
              </div>

              <div className="p-3 bg-slate-850 border border-slate-800 rounded-xl space-y-1">
                <p className="font-bold text-emerald-400 font-mono uppercase text-[10px] tracking-wide">Driver (Tài xế lái xe):</p>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Chỉ được truy cập <b>Bảng điều khiển</b>, dùng app di động <b>Xác nhận dỡ hàng giao thành công</b> chặng họ đảm trách.
                </p>
              </div>
            </div>

            <div className="pt-2 text-[10px] font-mono text-slate-500 text-center leading-normal">
              Bảo an hệ thống được thực thi hoàn chỉnh ở lõi Supabase PostgreSQL thông qua lệnh ROW LEVEL SECURITY.
            </div>
          </div>

        </div>

      </div>

      {/* CREATE USER POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in my-8">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Ghi Danh Nhân Sự Bến Xe</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-850 transition"
                >
                  X
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreate} className="p-6 space-y-4">
              
              {/* Full name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Họ và tên thành viên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Lê Thị Mai..."
                  value={newUser.fullName}
                  onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                  className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Username đăng nhập <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="maile_ops"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value.toLowerCase().trim()})}
                  className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Thư điện tử (Email) <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="mai.le@logisystem.vn"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value.trim()})}
                  className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 focus:outline-none font-mono"
                />
              </div>

              {/* Default Role select */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Chọn vai trò hoạt động sơ bộ <span className="text-red-500">*</span></label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                  className="w-full bg-slate-50 text-xs border border-slate-200 rounded-lg px-3 py-2 cursor-pointer font-bold font-sans text-slate-800 focus:outline-none"
                >
                  <option value="admin">Quản trị cấp cao (Admin)</option>
                  <option value="operator">Điều phối viên bến (Operator)</option>
                  <option value="driver">Tài xế / Driver</option>
                </select>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2 px-4 bg-slate-50 hover:bg-slate-100 border text-slate-700 rounded-xl text-xs font-bold font-sans cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-lg shadow-blue-900/15"
                >
                  Tạo tài khoản bến
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
