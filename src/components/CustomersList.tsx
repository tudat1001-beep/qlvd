/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  DollarSign, 
  ShieldAlert, 
  CheckCircle2, 
  X, 
  Info, 
  Phone, 
  MapPin, 
  Mail, 
  FileText, 
  Coins, 
  TrendingUp, 
  CheckSquare, 
  AlertTriangle 
} from 'lucide-react';
import { Customer, Bill } from '../types';

interface CustomersListProps {
  customers: Customer[];
  bills: Bill[];
  onCreateCustomer: (customerData: Omit<Customer, 'currentDebt' | 'paidDebt'>) => void;
  onUpdateBillPaymentStatus: (billId: string, paymentStatus: 'paid' | 'unpaid') => void;
  onDeleteCustomer: (id: string) => void;
}

export default function CustomersList({
  customers,
  bills,
  onCreateCustomer,
  onUpdateBillPaymentStatus,
  onDeleteCustomer
}: CustomersListProps) {
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Form states for creating a new Customer
  const [newCust, setNewCust] = useState({
    id: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    debtLimit: 50000000
  });

  const handleOpenCreateModal = () => {
    const getNextCustomerId = () => {
      const ids = customers.map(c => c.id);
      let maxNum = 5; // Corresponding to initial customers e.g. CUST-01 to CUST-04
      ids.forEach(id => {
        const match = id.match(/CUST-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      return `CUST-${String(nextNum).padStart(2, '0')}`;
    };

    setNewCust({
      id: getNextCustomerId(),
      name: '',
      phone: '',
      email: '',
      address: '',
      debtLimit: 50000000
    });
    setIsCreateModalOpen(true);
  };

  // Calculate high-level financial health stats
  const stats = useMemo(() => {
    const totalOut = customers.reduce((sum, c) => sum + (c.currentDebt || 0), 0);
    const totalPaid = customers.reduce((sum, c) => sum + (c.paidDebt || 0), 0);
    const totalLimit = customers.reduce((sum, c) => sum + (c.debtLimit || 0), 0);
    const overLimitCount = customers.filter(c => (c.currentDebt || 0) > c.debtLimit).length;

    return {
      totalOutstanding: totalOut,
      totalCollected: totalPaid,
      totalLimitAllocated: totalLimit,
      overLimitCustomers: overLimitCount
    };
  }, [customers]);

  // Filter customers based on search
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.address.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  // Selected customer details
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // Unpaid bills and paid bills belonging to the selected customer
  const selectedCustomerBills = useMemo(() => {
    if (!selectedCustomerId && !selectedCustomer) return [];
    return bills.filter(b => 
      b.customerId === selectedCustomerId || 
      (selectedCustomer && b.customerName === selectedCustomer.name)
    );
  }, [bills, selectedCustomerId, selectedCustomer]);

  // Handle Create Customer submit
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCust.id || !newCust.name || !newCust.phone || !newCust.address) {
      alert('Vui lòng điền đầy đủ thông tin mã, tên, SĐT và địa chỉ của Khách hàng!');
      return;
    }

    const formattedId = newCust.id.toUpperCase().trim();
    if (customers.some(c => c.id === formattedId)) {
      alert('Mã khách hàng này đã tồn tại trong hệ thống!');
      return;
    }

    onCreateCustomer({
      ...newCust,
      id: formattedId
    });

    // Reset and close
    setNewCust({
      id: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      debtLimit: 50000000
    });
    setIsCreateModalOpen(false);
  };

  const formatVND = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">Quản Lý Khách Hàng & Công Nợ</h2>
          <p className="text-sm text-slate-500 mt-1">
            Thiết lập hồ sơ đối tác thường niên, thiết đặt hạn mức tín dụng và theo dõi chi tiết công nợ vận chuyển (LTL Ledger).
          </p>
        </div>
        
        <button
          onClick={handleOpenCreateModal}
          className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-900/10"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm khách hàng đối tác</span>
        </button>
      </div>

      {/* KPI Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* KPI 1: Total Receivables */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-rose-50 rounded-xl text-rose-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-450 block tracking-wider">Tổng dư nợ chưa thu</span>
            <div className="text-lg font-extrabold font-mono text-rose-600 mt-0.5">
              {formatVND(stats.totalOutstanding)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Phải thu hồi cước vận tải</span>
          </div>
        </div>

        {/* KPI 2: Total Recovered */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-450 block tracking-wider">Tổng cước đã đối soát</span>
            <div className="text-lg font-extrabold font-mono text-emerald-600 mt-0.5">
              {formatVND(stats.totalCollected)}
            </div>
            <span className="text-[10px] text-slate-405 block mt-1">Đã tất toán chuyển khoản</span>
          </div>
        </div>

        {/* KPI 3: Over-limit Alarm count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 rounded-xl text-amber-600">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-450 block tracking-wider">Cảnh báo vượt hạn mức</span>
            <div className="text-lg font-extrabold font-mono text-amber-700 mt-0.5">
              {stats.overLimitCustomers} khách hàng
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Yêu cầu thu hồi hoặc siết dỡ</span>
          </div>
        </div>

        {/* KPI 4: Total Credit Line Granted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-slate-450 block tracking-wider font-mono">Hạn mức tín dụng cấp</span>
            <div className="text-lg font-extrabold font-mono text-slate-900 mt-0.5">
              {formatVND(stats.totalLimitAllocated)}
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">Tổng bảo lãnh tín chấp hàng</span>
          </div>
        </div>

      </div>

      {/* Toolbar Search */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-3xs">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-450">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm đối tác thường xuyên bằng Mã KH, Tên đối tác doanh nghiệp, số điện thoại, địa chỉ nhà máy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 rounded-xl pl-9 pr-4 py-2.5 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans transition-all"
          />
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Customers list table (8 cols) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden lg:col-span-7">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-400 uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Mã KH</th>
                  <th className="px-5 py-3.5">Đối tác thường xuyên</th>
                  <th className="px-5 py-3.5 text-right">Dư nợ cước / Hạn mức</th>
                  <th className="px-5 py-3.5 text-right font-mono">Đã thu</th>
                  <th className="px-5 py-3.5 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400 text-xs italic">
                      Chưa có hoặc không tìm thấy đối tác thường xuyên nào khớp bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const currentDebt = cust.currentDebt || 0;
                    const isOverLimit = currentDebt > cust.debtLimit;
                    const percentGauge = Math.min(100, Math.round((currentDebt / cust.debtLimit) * 100));
                    const isSelected = selectedCustomerId === cust.id;

                    return (
                      <tr 
                        key={cust.id} 
                        onClick={() => setSelectedCustomerId(cust.id === selectedCustomerId ? null : cust.id)}
                        className={`hover:bg-slate-50/50 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/40 border-l-2 border-blue-600' : ''
                        }`}
                      >
                        {/* ID */}
                        <td className="px-5 py-4 font-mono font-bold text-slate-800">
                          {cust.id}
                        </td>
                        
                        {/* Company Detail */}
                        <td className="px-5 py-4 max-w-[180px] truncate">
                          <div className="font-bold text-slate-950 truncate">{cust.name}</div>
                          <div className="text-slate-500 font-mono text-[10px] mt-0.5 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{cust.phone}</span>
                          </div>
                        </td>

                        {/* Debt Progress & limit */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5 font-mono text-xs">
                              {isOverLimit && (
                                <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-red-100 text-red-700 animate-pulse">
                                  Vượt ngưỡng!
                                </span>
                              )}
                              <span className={`font-bold ${isOverLimit ? 'text-red-650' : 'text-slate-800'}`}>
                                {formatVND(currentDebt)}
                              </span>
                              <span className="text-slate-400 text-[10px]">/ {formatVND(cust.debtLimit)}</span>
                            </div>

                            {/* visual progress gauge */}
                            <div className="w-32 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  isOverLimit ? 'bg-red-500 animate-pulse' :
                                  percentGauge > 75 ? 'bg-amber-500' : 'bg-blue-500'
                                }`}
                                style={{ width: `${percentGauge}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Paid Debt */}
                        <td className="px-5 py-4 text-right font-mono text-emerald-650 font-bold">
                          {formatVND(cust.paidDebt || 0)}
                        </td>

                        {/* Action buttons */}
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedCustomerId(cust.id === selectedCustomerId ? null : cust.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-bold text-[10px] border border-slate-200/60 rounded-md transition"
                            >
                              Sử dụng Sổ nợ
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Bạn chắc chắn muốn xóa hồ sơ khách hàng thường xuyên ${cust.name}? Các nợ cước của họ vẫn tính theo cước lẻ.`)) {
                                  onDeleteCustomer(cust.id);
                                  if (selectedCustomerId === cust.id) setSelectedCustomerId(null);
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-red-600 transition"
                              title="Xóa hồ sơ"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Receivable Ledger & Settlement controls (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Detail card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-5">
            {!selectedCustomerId ? (
              <div className="py-12 text-center space-y-3">
                <Users className="w-12 h-12 text-slate-305 mx-auto" />
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Chưa có Khách hàng nào được chọn</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Bấm trực tiếp vào hàng bất cứ đối tác thường xuyên nào để xem chi tiết danh bạ, hạn mức tín dụng và thực hiện thu nợ cước vận đơn.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Partner Contact Header Card */}
                <div className="pb-4 border-b border-slate-150">
                  <span className="text-[10px] font-mono text-blue-600 font-bold uppercase block tracking-wider">Hồ sơ công nợ chi tiết</span>
                  <h3 className="font-bold text-slate-900 mt-1">{selectedCustomer?.name}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {selectedCustomer?.id}</p>
                  
                  {/* Miniature contact lines */}
                  <div className="mt-3.5 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold font-mono">{selectedCustomer?.phone}</span>
                    </div>
                    {selectedCustomer?.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{selectedCustomer?.email}</span>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 leading-tight">{selectedCustomer?.address}</span>
                    </div>
                  </div>
                </div>

                {/* Sub Debt Indicators */}
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50/70 rounded-xl border border-slate-150">
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-bold block">Định mức tối đa</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">
                      {selectedCustomer ? formatVND(selectedCustomer.debtLimit) : '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-450 uppercase font-bold block">Nợ chưa thu hồi</span>
                    <span className={`font-mono font-bold text-xs ${
                      (selectedCustomer?.currentDebt || 0) > (selectedCustomer?.debtLimit || 0) ? 'text-red-650' : 'text-slate-850'
                    }`}>
                      {selectedCustomer ? formatVND(selectedCustomer.currentDebt || 0) : '0'}
                    </span>
                  </div>
                </div>

                {/* Bill lists ledger for this customer */}
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span>Sổ cái Vận đơn ({selectedCustomerBills.length} Bill cước)</span>
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono">Đối soát cước</span>
                  </div>

                  {selectedCustomerBills.length === 0 ? (
                    <div className="p-6 text-center text-slate-450 text-xs italic bg-slate-50/50 border border-slate-150 rounded-xl">
                      Khách hàng này chưa phát sinh vận đơn cước phí xe trong tháng.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                      {selectedCustomerBills.map((b) => {
                        const isPaid = b.paymentStatus === 'paid';
                        return (
                          <div 
                            key={b.id} 
                            className={`p-3 rounded-xl border transition flex items-center justify-between gap-3 text-xs ${
                              isPaid 
                                ? 'bg-emerald-50/30 hover:bg-emerald-55/40 border-emerald-150' 
                                : 'bg-red-50/30 hover:bg-red-55/40 border-red-150'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold font-mono text-blue-600">{b.id}</span>
                                <span className={`px-1.5 py-0.5 text-[8px] font-extrabold uppercase rounded ${
                                  isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {isPaid ? 'Đã thu' : 'Nợ cước'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 font-mono mt-1">
                                {b.totalPackages} kiện • {b.totalWeight}kg • COD: {formatVND(b.cod)}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={b.deliveryAddress}>
                                Địa điểm: {b.deliveryAddress}
                              </p>
                            </div>

                            <div className="text-right shrink-0 space-y-1.5">
                              <span className="font-mono font-bold text-slate-900 block">{formatVND(b.shippingFee)}</span>
                              
                              <button
                                onClick={() => onUpdateBillPaymentStatus(b.id, isPaid ? 'unpaid' : 'paid')}
                                className={`px-2 py-1 font-bold text-[9px] rounded-md border flex items-center gap-1 cursor-pointer transition ${
                                  isPaid 
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100/80 border-amber-200' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-700/10'
                                }`}
                              >
                                {isPaid ? 'Báo Nợ' : 'Thiết thu'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedCustomer && (selectedCustomer.currentDebt || 0) > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <button
                        onClick={() => {
                          if (confirm(`Tất toán nhanh toàn bộ ${selectedCustomerBills.filter(b => b.paymentStatus === 'unpaid').length} vận đơn chưa trả cước của khách hàng ${selectedCustomer.name}?`)) {
                            selectedCustomerBills
                              .filter(b => b.paymentStatus === 'unpaid')
                              .forEach(b => onUpdateBillPaymentStatus(b.id, 'paid'));
                          }
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-505 active:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 transition shadow-md shadow-emerald-900/10"
                      >
                        <CheckSquare className="w-4 h-4" />
                        <span>Đối soát & Tất toán toàn bộ cước</span>
                      </button>
                    </div>
                  )}

                </div>

              </div>
            )}
          </div>

          {/* Guidelines on LTL Credit Risk */}
          <div className="p-5 bg-blue-50 border border-blue-150 rounded-2xl space-y-2 text-xs">
            <h5 className="font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-blue-600" />
              <span>Chính sách rủi ro tín dụng Gom xe</span>
            </h5>
            <ul className="list-disc pl-5 text-[11px] text-slate-650 leading-relaxed space-y-1">
              <li>Mỗi đại lý gom LTL được cấp một bảo lãnh hạn mức dựa trên uy tín hành chính.</li>
              <li>Nếu dư nợ cước vượt 100% hạn mức, hệ sinh thái sẽ gắn cờ cảnh báo rực đỏ "Vượt ngưỡng" trên sổ sách.</li>
              <li>Nhân viên điều độ có quyền hoãn xếp kiện hàng mới lên xe đến khi đối soát hoàn tất.</li>
            </ul>
          </div>

        </div>

      </div>

      {/* CREATE CUSTOMER FORM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in my-8">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Hồ sơ Đối tác Thường xuyên</h3>
                  <p className="text-xs text-slate-500 mt-1">Lập thông tin doanh nghiệp, đại lý gom lẻ để tự động quản lý công nợ cước xe.</p>
                </div>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              
              {/* ID & Name */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mã khách hàng <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: CUST-006"
                    value={newCust.id}
                    onChange={(e) => setNewCust({...newCust, id: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-400 uppercase font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tên doanh nghiệp / Đối tác <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Công ty CP Đại lý Logistics..."
                    value={newCust.name}
                    onChange={(e) => setNewCust({...newCust, name: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Điện thoại di động <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="0911xxxxxx"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({...newCust, phone: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Email nhận hóa đơn</label>
                  <input
                    type="email"
                    placeholder="finance@partner.vn"
                    value={newCust.email}
                    onChange={(e) => setNewCust({...newCust, email: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Địa chỉ trụ sở / Kho bãi <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, đường, khu công nghiệp..."
                  value={newCust.address}
                  onChange={(e) => setNewCust({...newCust, address: e.target.value})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Debt Limit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Hạn mức công nợ (VND) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="1000000"
                  step="1000000"
                  value={newCust.debtLimit}
                  onChange={(e) => setNewCust({...newCust, debtLimit: Number(e.target.value)})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">Default: 50.000.000 đ. Ngưỡng báo động dư nợ cước của khách.</span>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  Huỷ bỏ
                </button>
                
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-lg shadow-blue-900/15"
                >
                  Ghi nhận hồ sơ
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
