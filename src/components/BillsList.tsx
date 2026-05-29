/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  MoreVertical, 
  CheckCircle, 
  Eye,
  AlertCircle,
  Truck,
  ArrowUpDown,
  X,
  FileSpreadsheet,
  Edit2
} from 'lucide-react';
import { Bill, BillStatus, Customer, formatThousands, parseThousands } from '../types';

interface BillsListProps {
  bills: Bill[];
  customers: Customer[];
  onCreateBill: (bill: Omit<Bill, 'packagesLoaded' | 'packagesRemaining' | 'packagesDelivered' | 'status' | 'createdAt'>) => void;
  onUpdateBill: (bill: Bill) => void;
  onDeleteBill: (id: string) => void;
  onSelectBillForDetails: (bill: Bill) => void;
}

export default function BillsList({ 
  bills, 
  customers,
  onCreateBill, 
  onUpdateBill,
  onDeleteBill, 
  onSelectBillForDetails 
}: BillsListProps) {
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all'); // all, today, this_week
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Create Bill Form Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newBill, setNewBill] = useState({
    id: '',
    customerId: '',
    customerName: '',
    goodsName: '',
    phone: '',
    deliveryAddress: '',
    totalPackages: 10,
    totalWeight: 105,
    totalVolume: 1,
    cod: 0,
    shippingFee: 250000,
    paymentStatus: 'unpaid' as 'unpaid' | 'paid',
    note: ''
  });

  // Editing state for managing and modifying an existing bill inline or in a modal
  const [editingBill, setEditingBill] = useState<Bill | null>(null);

  // Search & select states for editing customer partners
  const [editCustomerSearchQuery, setEditCustomerSearchQuery] = useState('');
  const [showEditCustomerDropdown, setShowEditCustomerDropdown] = useState(false);

  // Handler to open create modal with auto-increment ID prefilled
  const handleOpenCreateModal = () => {
    const getNextBillId = () => {
      const ids = bills.map(b => b.id);
      let maxNum = 5; // Default for 5 initial bills
      ids.forEach(id => {
        const match = id.match(/BIL-2026-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      });
      const nextNum = maxNum + 1;
      return `BIL-2026-${String(nextNum).padStart(3, '0')}`;
    };

    setNewBill({
      id: getNextBillId(),
      customerId: '',
      customerName: '',
      goodsName: '',
      phone: '',
      deliveryAddress: '',
      totalPackages: 10,
      totalWeight: 100,
      totalVolume: 1,
      cod: 0,
      shippingFee: 250000,
      paymentStatus: 'unpaid' as 'unpaid' | 'paid',
      note: ''
    });
    setCustomerSearchQuery('');
    setShowCustomerDropdown(false);
    setIsCreateModalOpen(true);
  };

  // Export Excel Simulation State
  const [showExportToast, setShowExportToast] = useState(false);

  // Search & select states for customer partners
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  // Filtered list of customers for matching search
  const searchedCustomers = useMemo(() => {
    return customers.filter(c => 
      c.id.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      c.phone.includes(customerSearchQuery)
    );
  }, [customers, customerSearchQuery]);

  // Filtered list of customers for matching edit search
  const searchedEditCustomers = useMemo(() => {
    return customers.filter(c => 
      c.id.toLowerCase().includes(editCustomerSearchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(editCustomerSearchQuery.toLowerCase()) ||
      c.phone.includes(editCustomerSearchQuery)
    );
  }, [customers, editCustomerSearchQuery]);

  // Filter & Search Logic
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      // 1. Search Term matching (ID, name, phone, address)
      const matchesSearch = 
        bill.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.phone.includes(searchTerm) ||
        bill.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Status Filter matching
      const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;

      // 3. Date Filter matching
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const createDate = new Date(bill.createdAt);
        const today = new Date();
        
        if (dateFilter === 'today') {
          // Compare day-month-year
          matchesDate = 
            createDate.getDate() === today.getDate() &&
            createDate.getMonth() === today.getMonth() &&
            createDate.getFullYear() === today.getFullYear();
        } else if (dateFilter === 'this_week') {
          // Within 7 days
          const diffTime = Math.abs(today.getTime() - createDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          matchesDate = diffDays <= 7;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bills, searchTerm, statusFilter, dateFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredBills.length / itemsPerPage));
  const paginatedBills = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBills.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBills, currentPage]);

  // Reset page when switching search or filters
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleDateFilter = (timePeriod: string) => {
    setDateFilter(timePeriod);
    setCurrentPage(1);
  };

  // Submit Handler
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.id || !newBill.customerName || !newBill.phone || !newBill.deliveryAddress || !newBill.goodsName) {
      alert('Vui lòng điền đầy đủ các thông tin bắt buộc: Mã Bill, Khách hàng, Tên hàng, SĐT, Địa chỉ!');
      return;
    }

    // Auto capitalize bill code
    const formattedId = newBill.id.toUpperCase().trim();
    if (bills.some(b => b.id === formattedId)) {
      alert('Mã vận đơn (Bill ID) này đã tồn tại trong cơ sở dữ liệu!');
      return;
    }

    onCreateBill({
      ...newBill,
      id: formattedId
    });

    // Reset form and close
    setNewBill({
      id: '',
      customerId: '',
      customerName: '',
      goodsName: '',
      phone: '',
      deliveryAddress: '',
      totalPackages: 10,
      totalWeight: 100,
      totalVolume: 1,
      cod: 0,
      shippingFee: 250000,
      paymentStatus: 'unpaid' as 'unpaid' | 'paid',
      note: ''
    });
    setCustomerSearchQuery('');
    setShowCustomerDropdown(false);
    setIsCreateModalOpen(false);
  };

  // Simulation of Downloading Excel Spreadsheet (.csv representation)
  const handleExportCSV = () => {
    const headers = 'Ma Bill,Khach Hang,Ten Mat Hang,SDT,Dia Chi,Tong So Kien,Da Xep,Con Lai,Da Giao,COD,Trang Thai\n';
    const rows = filteredBills.map(b => {
      const statusLabels: Record<BillStatus, string> = {
        pending: 'Cho xep',
        shipping: 'Dang van chuyen',
        partially_delivered: 'Giao mot phan',
        completed: 'Hoan thanh',
        returned: 'Hoan hang'
      };
      
      const cleanAddress = b.deliveryAddress.replace(/,/g, ' -');
      const cleanCustomer = b.customerName.replace(/,/g, ' ');
      const cleanGoodsName = b.goodsName ? b.goodsName.replace(/,/g, ' ') : '';
      
      return `${b.id},${cleanCustomer},${cleanGoodsName},${b.phone},${cleanAddress},${b.totalPackages},${b.packagesLoaded},${b.packagesRemaining},${b.packagesDelivered},${b.cod},${statusLabels[b.status]}`;
    }).join('\n');

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + encodeURIComponent(headers + rows);
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', 'LTL_Bill_Report_2026.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setShowExportToast(true);
    setTimeout(() => {
      setShowExportToast(false);
    }, 3000);
  };

  // Helper Labels & Colors mapping
  const statusConfig: Record<BillStatus, { text: string, bg: string, textCol: string }> = {
    pending: { text: 'Chờ xếp chuyến', bg: 'bg-slate-100 border-slate-200', textCol: 'text-slate-700' },
    shipping: { text: 'Đang vận chuyển', bg: 'bg-blue-50 border-blue-200', textCol: 'text-blue-700' },
    partially_delivered: { text: 'Giao một phần', bg: 'bg-amber-50 border-amber-200', textCol: 'text-amber-700' },
    completed: { text: 'Hoàn thành', bg: 'bg-emerald-50 border-emerald-200', textCol: 'text-emerald-700' },
    returned: { text: 'Hoàn hàng', bg: 'bg-rose-50 border-rose-200', textCol: 'text-rose-700' }
  };

  const formatVND = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      
      {/* Toast Notification Simulation */}
      {showExportToast && (
        <div className="absolute top-0 right-0 z-50 bg-slate-900 text-white rounded-xl shadow-xl p-4 flex items-center gap-3 border border-slate-700 max-w-sm animate-slide-in">
          <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h5 className="font-semibold text-xs">Xuất file CSV thành công</h5>
            <p className="text-[10px] text-slate-400 mt-0.5">Một bảng tổng hợp {filteredBills.length} vận đơn đã được tải về.</p>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold tracking-tight text-slate-900">Quản Lý Vận Đơn (Hàng Lẻ LTL)</h2>
          <p className="text-sm text-slate-500 mt-1">Ghi nhận thông tin bill, theo dõi số kiện đã tải, kiện còn lại và tỉ lệ dỡ giao.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="p-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Xuất báo cáo</span>
          </button>
          
          <button
            onClick={handleOpenCreateModal}
            className="p-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-md shadow-blue-900/10"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo vận đơn lẻ</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-3xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Tìm theo Mã Bill, khách hàng, số điện thoại, địa chỉ lẻ..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-slate-50 hover:bg-slate-100 focus:bg-white text-sm text-slate-900 placeholder:text-slate-400 rounded-xl pl-9 pr-4 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans transition-all"
          />
        </div>

        {/* State and Date Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Status filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase shrink-0">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xếp chuyến</option>
              <option value="shipping">Đang vận chuyển</option>
              <option value="partially_delivered">Giao một phần</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="returned">Hoàn trả hàng</option>
            </select>
          </div>

          {/* Date filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-mono text-slate-400 font-bold uppercase shrink-0">Lập đơn:</span>
            <select
              value={dateFilter}
              onChange={(e) => handleDateFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Tất cả thời gian</option>
              <option value="today">Hôm nay</option>
              <option value="this_week">Trong tuần qua</option>
            </select>
          </div>

        </div>
      </div>

      {/* Main Bills Table Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="min-w-full overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/70 font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-2.5">Mã Bill</th>
                <th className="px-4 py-2.5">Khách hàng | Tên hàng | SĐT</th>
                <th className="px-4 py-2.5">Địa chỉ dỡ hàng</th>
                <th className="px-4 py-2.5 text-center">Tiến độ Kiện (Tải/Tổng)</th>
                <th className="px-4 py-2.5 text-right">Trọng lượng / Thể tích</th>
                <th className="px-4 py-2.5 text-right">Cước phí & COD</th>
                <th className="px-4 py-2.5 text-center">Trạng thái</th>
                <th className="px-4 py-2.5 text-center">Thao tác</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100">
              {paginatedBills.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm italic">
                    Không tìm thấy vận đơn hàng lẻ nào phù hợp với điều kiện lọc!
                  </td>
                </tr>
              ) : (
                paginatedBills.map((bill) => {
                  const percentLeft = bill.totalPackages > 0 
                    ? Math.round((bill.packagesLoaded / bill.totalPackages) * 100) 
                    : 0;
                  const percentDelivered = bill.totalPackages > 0
                    ? Math.round((bill.packagesDelivered / bill.totalPackages) * 100)
                    : 0;

                  const config = statusConfig[bill.status] || statusConfig.pending;

                  return (
                    <tr 
                      key={bill.id} 
                      onClick={() => {
                        setEditCustomerSearchQuery(bill.customerName);
                        setEditingBill(bill);
                      }}
                      className="hover:bg-blue-50/30 transition-colors cursor-pointer group"
                      title="Nhấp để chỉnh sửa nhanh thông tin Bill này"
                    >
                      {/* Mã Bill */}
                      <td className="px-4 py-2 font-mono font-bold text-blue-600 text-xs">
                        <div className="flex items-center gap-1">
                          <Edit2 className="w-2.5 h-2.5 text-slate-300 opacity-0 group-hover:opacity-105 transition-opacity" />
                          <span>{bill.id}</span>
                        </div>
                      </td>

                      {/* Khách hàng / SDT / Tên hàng -> EXACT 1 LINE HEIGHT */}
                      <td className="px-4 py-2 max-w-[320px] truncate">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-semibold text-slate-900 shrink-0">{bill.customerName}</span>
                          <span className="text-slate-300 shrink-0">|</span>
                          <span className="text-blue-700 bg-blue-50/70 border border-blue-100 rounded px-1.5 py-0.5 text-[10px] font-bold shrink-0 truncate max-w-[120px]" title={bill.goodsName}>
                            📦 {bill.goodsName || 'Chưa ghi tên'}
                          </span>
                          <span className="text-slate-300 shrink-0">|</span>
                          <span className="text-slate-500 font-mono text-[11px] shrink-0">{bill.phone}</span>
                        </div>
                      </td>

                      {/* Địa chỉ giao */}
                      <td className="px-4 py-2 max-w-xs truncate text-slate-600 text-xs font-medium">
                        {bill.deliveryAddress}
                      </td>

                      {/* Progress bar and counts */}
                      <td className="px-4 py-2 text-center text-xs">
                        <div className="inline-block min-w-36 text-left">
                          <div className="flex items-center justify-between text-[11px] font-mono leading-none mb-1 text-slate-500">
                            <span>Xếp: <b>{bill.packagesLoaded}</b>/{bill.totalPackages}</span>
                            <span>Giao: <b className="text-emerald-600">{bill.packagesDelivered}</b></span>
                          </div>
                          
                          {/* Visual compound progress bar */}
                          <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex relative">
                            {/* Delivered Packages Segment (Green) */}
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{ width: `${percentDelivered}%` }}
                            />
                            {/* Remaining Loaded Packages (Blue) */}
                            <div 
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${Math.max(0, percentLeft - percentDelivered)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Weight and Vol */}
                      <td className="px-4 py-2 text-right text-xs font-mono text-slate-700">
                        <b>{bill.totalWeight}</b> kg <span className="text-slate-300">/</span> <b>{bill.totalVolume}</b> m³
                      </td>

                      {/* Shipping Fee and COD consolidated column */}
                      <td className="px-4 py-2 text-right text-xs font-mono">
                        <div className="flex items-center justify-end gap-1.5">
                          <span className="font-bold text-slate-900">{formatVND(bill.shippingFee || 0)}</span>
                          {bill.paymentStatus === 'paid' ? (
                            <span className="text-[9px] font-sans font-bold bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded border border-emerald-150 shrink-0">
                              Đã thu
                            </span>
                          ) : (
                            <span className="text-[9px] font-sans font-bold bg-yellow-50 text-yellow-750 px-1 py-0.2 rounded border border-yellow-250 shrink-0">
                              Nợ
                            </span>
                          )}
                          {bill.cod > 0 && (
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1 py-0.2 rounded border border-amber-200 shrink-0" title={`Tiền thu hộ COD: ${formatVND(bill.cod)}`}>
                              COD: {formatVND(bill.cod)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2 text-center shrink-0">
                        <span className={`inline-flex px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border ${config.bg} ${config.textCol}`}>
                          {config.text}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectBillForDetails(bill)}
                            className="p-1 px-2 rounded bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 hover:text-blue-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Chi tiết chuyến</span>
                          </button>
                          
                          <button
                            onClick={() => {
                              if (confirm(`Bạn chắc chắn muốn xóa vận đơn ${bill.id}?`)) {
                                onDeleteBill(bill.id);
                              }
                            }}
                            className="p-1.5 rounded bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200 hover:border-red-200 transition cursor-pointer"
                            title="Xóa Bill"
                          >
                            <Trash2 className="w-3 h-3" />
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

        {/* Dynamic Pagination Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4 font-mono text-xs">
          <p className="text-slate-500">
            Hiển thị <b>{(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredBills.length)}</b> trong tổng số <b>{filteredBills.length}</b> vận đơn.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-800 font-bold">Trang {currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CREATE BILL FORM MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-2xl max-w-7xl w-full border border-slate-200 shadow-2xl relative overflow-hidden animate-zoom-in my-8">
              {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-lg sm:text-lg">Tạo Mới Vận Đơn Hàng Lẻ (LTL)</h3>
                <p className="text-xs text-slate-500 mt-1">Thông tin chi tiết về hàng lẻ sẽ hỗ trợ chia kiện và tính toán tự động sau này.</p>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-50 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 scrollbar-thin">
              
              {/* Step 0: Choose frequent client */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center justify-between">
                  <span>Khách hàng đối tác thường xuyên (Cấp công nợ)</span>
                  {newBill.customerId && (
                    <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150 font-bold uppercase animate-fade-in">
                      Đã áp dụng Công nợ {newBill.customerId}
                    </span>
                  )}
                </label>
                
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm nhanh đối tác bằng Mã KH, Tên, Số điện thoại... (Để trống nếu là khách lẻ)"
                    value={customerSearchQuery}
                    onFocus={() => setShowCustomerDropdown(true)}
                    onChange={(e) => {
                      setCustomerSearchQuery(e.target.value);
                      setShowCustomerDropdown(true);
                    }}
                    className="w-full bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-blue-550 font-semibold text-slate-800"
                  />
                  {customerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerSearchQuery('');
                        setShowCustomerDropdown(false);
                        setNewBill(prev => ({
                          ...prev,
                          customerId: '',
                          customerName: '',
                          phone: '',
                          deliveryAddress: ''
                        }));
                      }}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title="Xóa lựa chọn"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown list */}
                {showCustomerDropdown && (
                  <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-xl divide-y divide-slate-100 animate-slide-in">
                    <div className="p-1.5 px-3 bg-slate-50 text-[10px] text-slate-400 flex items-center justify-between font-bold">
                      <span>DANH SÁCH ĐỐI TÁC ({searchedCustomers.length})</span>
                      <button 
                        type="button" 
                        onClick={() => setShowCustomerDropdown(false)}
                        className="text-slate-500 hover:text-slate-700 cursor-pointer text-[11px]"
                      >
                        Đóng ×
                      </button>
                    </div>
                    <div 
                      onClick={() => {
                        setNewBill(prev => ({
                          ...prev,
                          customerId: '',
                          customerName: '',
                          phone: '',
                          deliveryAddress: ''
                        }));
                        setCustomerSearchQuery('');
                        setShowCustomerDropdown(false);
                      }}
                      className="p-2.5 hover:bg-slate-50 cursor-pointer text-xs font-bold text-blue-600"
                    >
                      -- Khách lẻ vãng lai / Nhập tay thủ công --
                    </div>
                    {searchedCustomers.length === 0 ? (
                      <div className="p-2.5 text-xs text-slate-400 italic">
                        Không tìm thấy đối tác nào phù hợp
                      </div>
                    ) : (
                      searchedCustomers.map((c) => (
                        <div
                          key={c.id}
                          onClick={() => {
                            setNewBill(prev => ({
                              ...prev,
                              customerId: c.id,
                              customerName: c.name,
                              phone: c.phone,
                              deliveryAddress: c.address
                            }));
                            setCustomerSearchQuery(`[${c.id}] ${c.name}`);
                            setShowCustomerDropdown(false);
                          }}
                          className="p-2.5 hover:bg-blue-50/50 cursor-pointer text-xs flex items-center justify-between transition-colors"
                        >
                          <div className="truncate pr-2">
                            <span className="font-mono font-bold text-blue-600">[{c.id}]</span>{' '}
                            <span className="font-bold text-slate-800">{c.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono font-semibold shrink-0">SĐT: {c.phone}</span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Bill ID */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mã Vận Đơn (Mã Bill) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: BIL-2026-006"
                    value={newBill.id}
                    onChange={(e) => setNewBill({...newBill, id: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 placeholder-slate-400 uppercase font-mono font-bold"
                  />
                </div>

                {/* Customer CustomerName */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 font-bold text-slate-800">Tên khách hàng nhận <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Công ty TNHH dệt may..."
                    value={newBill.customerName}
                    onChange={(e) => setNewBill({...newBill, customerName: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-bold"
                  />
                </div>
              </div>

              {/* Goods Description */}
              <div>
                <label className="block text-xs font-bold text-slate-750 uppercase mb-1.5">Tên loại hàng hoá / Chi tiết mặt hàng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thiết bị điện công nghiệp, Vải dệt cuộn, Thiết bị gia dụng..."
                  value={newBill.goodsName}
                  onChange={(e) => setNewBill({...newBill, goodsName: e.target.value})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-semibold text-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 font-bold text-slate-800">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="0912xxxxxx"
                    value={newBill.phone}
                    onChange={(e) => setNewBill({...newBill, phone: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold"
                  />
                </div>

                {/* COD amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tiền thu hộ COD (VND)</label>
                  <input
                    type="text"
                    placeholder="Đăng ký COD nếu có"
                    value={formatThousands(newBill.cod)}
                    onChange={(e) => setNewBill({...newBill, cod: parseThousands(e.target.value)})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-550 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold text-slate-850"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 font-bold text-slate-800">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Nhập số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố..."
                  value={newBill.deliveryAddress}
                  onChange={(e) => setNewBill({...newBill, deliveryAddress: e.target.value})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-505 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550"
                />
              </div>

              {/* Cước phí & trạng thái cước */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Cước phí vận chuyển (VND) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formatThousands(newBill.shippingFee)}
                    onChange={(e) => setNewBill({...newBill, shippingFee: parseThousands(e.target.value)})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-550 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold text-slate-850"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Trạng thái thanh toán cước</label>
                  <select
                    value={newBill.paymentStatus}
                    onChange={(e) => setNewBill({...newBill, paymentStatus: e.target.value as 'unpaid' | 'paid'})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-bold"
                  >
                    <option value="unpaid">Ghi sổ nợ (Công nợ KH)</option>
                    <option value="paid">Đã thanh toán trước</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                {/* Total Packets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tổng Số Kiện <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBill.totalPackages}
                    onChange={(e) => setNewBill({...newBill, totalPackages: Math.max(1, Number(e.target.value))})}
                    className="w-full bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold"
                  />
                </div>

                {/* Total Weight */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Khối Lượng (kg) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBill.totalWeight}
                    onChange={(e) => setNewBill({...newBill, totalWeight: Math.max(1, Number(e.target.value))})}
                    className="w-full bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold"
                  />
                </div>

                {/* Total Volume */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Thể Tích (m³) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={newBill.totalVolume}
                    onChange={(e) => setNewBill({...newBill, totalVolume: Math.max(0.01, Number(e.target.value))})}
                    className="w-full bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Ghi chú vận chuyển</label>
                <textarea
                  placeholder="Yêu cầu giờ bốc dỡ, người liên hệ giao xe dọn bãi..."
                  rows={2}
                  value={newBill.note}
                  onChange={(e) => setNewBill({...newBill, note: e.target.value})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550"
                />
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
                  Xác nhận tạo đơn
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
      )}

      {/* Edit Bill Modal */}
      {editingBill && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-2xl max-w-7xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-8 animate-zoom-in">
              {/* Modal Header */}
            <div className="bg-slate-900 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-blue-400" />
                  Chỉnh Sửa Vận Đơn: {editingBill.id}
                </h3>
                <p className="text-xs text-slate-400 mt-1">Cập nhật nhanh thông tin cước phí, hàng hóa và đối tác vận tải</p>
              </div>
              <button 
                onClick={() => setEditingBill(null)}
                className="p-1 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editingBill.id || !editingBill.customerName || !editingBill.phone || !editingBill.deliveryAddress || !editingBill.goodsName) {
                alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
                return;
              }
              onUpdateBill(editingBill);
              setEditingBill(null);
            }} className="p-6 space-y-4">
              
              {/* Editable Bill ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mã số Bill (Có thể chỉnh sửa)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: BIL-2026-001"
                  value={editingBill.id}
                  onChange={(e) => setEditingBill({...editingBill, id: e.target.value.toUpperCase().trim()})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold"
                />
              </div>

              {/* Customer search selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 relative">
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Khách hàng yêu cầu <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Tìm kiếm hoặc tự nhập tên khách hàng mới..."
                    value={editCustomerSearchQuery}
                    onChange={(e) => {
                      setEditCustomerSearchQuery(e.target.value);
                      setEditingBill({
                        ...editingBill,
                        customerName: e.target.value
                      });
                      setShowEditCustomerDropdown(true);
                    }}
                    onFocus={() => setShowEditCustomerDropdown(true)}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550"
                  />
                  {showEditCustomerDropdown && searchedEditCustomers.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto z-50">
                      {searchedEditCustomers.map(cust => (
                        <div
                          key={cust.id}
                          onClick={() => {
                            setEditingBill({
                              ...editingBill,
                              customerId: cust.id,
                              customerName: cust.name,
                              phone: cust.phone,
                              deliveryAddress: cust.address
                            });
                            setEditCustomerSearchQuery(cust.name);
                            setShowEditCustomerDropdown(false);
                          }}
                          className="px-3 py-2 hover:bg-slate-50 text-xs cursor-pointer flex justify-between border-b border-slate-100 last:border-b-0"
                        >
                          <span className="font-semibold text-slate-800">{cust.name}</span>
                          <span className="font-mono text-slate-400 text-[10px]">{cust.id} | {cust.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {showEditCustomerDropdown && (
                    <div className="absolute right-2 top-8 flex items-center">
                      <button 
                        type="button" 
                        onClick={() => setShowEditCustomerDropdown(false)}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Đóng
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tên hàng hóa <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Mặt hàng"
                    value={editingBill.goodsName || ''}
                    onChange={(e) => setEditingBill({...editingBill, goodsName: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550"
                  />
                </div>
              </div>

              {/* Phone and COD */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Số điện thoại liên hệ <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editingBill.phone}
                    onChange={(e) => setEditingBill({...editingBill, phone: e.target.value})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tiền thu hộ COD (VND)</label>
                  <input
                    type="text"
                    placeholder="Ghi nhận COD nếu có"
                    value={formatThousands(editingBill.cod)}
                    onChange={(e) => setEditingBill({...editingBill, cod: parseThousands(e.target.value)})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold text-slate-850"
                  />
                </div>
              </div>

              {/* Delivery Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5 font-semibold text-slate-800">Địa chỉ giao hàng <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  value={editingBill.deliveryAddress}
                  onChange={(e) => setEditingBill({...editingBill, deliveryAddress: e.target.value})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550"
                />
              </div>

              {/* Cước phí & trạng thái cước */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Cước phí vận chuyển (VND) <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formatThousands(editingBill.shippingFee)}
                    onChange={(e) => setEditingBill({...editingBill, shippingFee: parseThousands(e.target.value)})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold text-slate-850"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Trạng thái thanh toán cước</label>
                  <select
                    value={editingBill.paymentStatus}
                    onChange={(e) => setEditingBill({...editingBill, paymentStatus: e.target.value as 'unpaid' | 'paid'})}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-bold"
                  >
                    <option value="unpaid">Ghi sổ nợ (Công nợ KH)</option>
                    <option value="paid">Đã thanh toán trước</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                {/* Total Packets */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tổng Số Kiện <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingBill.totalPackages}
                    onChange={(e) => setEditingBill({...editingBill, totalPackages: Math.max(1, Number(e.target.value))})}
                    className="w-full bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold"
                  />
                </div>

                {/* Total Weight */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Khối Lượng (kg) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingBill.totalWeight}
                    onChange={(e) => setEditingBill({...editingBill, totalWeight: Math.max(1, Number(e.target.value))})}
                    className="w-full bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold"
                  />
                </div>

                {/* Total Volume */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Thể Tích (m³) <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    value={editingBill.totalVolume}
                    onChange={(e) => setEditingBill({...editingBill, totalVolume: Math.max(0.01, Number(e.target.value))})}
                    className="w-full bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Ghi chú vận chuyển</label>
                <textarea
                  placeholder="Yêu cầu bốc dỡ hàng..."
                  rows={2}
                  value={editingBill.note}
                  onChange={(e) => setEditingBill({...editingBill, note: e.target.value})}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550"
                />
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBill(null)}
                  className="py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition"
                >
                  Huỷ bỏ
                </button>
                
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-lg shadow-blue-900/15"
                >
                  Ghi nhận cập nhật
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
