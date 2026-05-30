/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getInitialState, 
  saveState, 
  recalculateAllStats, 
  StorageState 
} from './db';
import { 
  Bill, 
  Trip, 
  Vehicle, 
  Driver, 
  TripBillItem, 
  User, 
  TripStatus, 
  DeliveryStatus,
  Customer,
  TripExpense,
  BillTripExpense,
  CompanyProfile,
  formatThousands,
  parseThousands
} from './types';

// Import sub components
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BillsList from './components/BillsList';
import BillDetailModal from './components/BillDetailModal';
import CustomersList from './components/CustomersList';
import TripsList from './components/TripsList';
import XepBillModal from './components/XepBillModal';
import DeliveryTracker from './components/DeliveryTracker';
import VehiclesList from './components/VehiclesList';
import DriversList from './components/DriversList';
import Reports from './components/Reports';
import UsersList from './components/UsersList';
import UserGuide from './components/UserGuide';
import { Menu } from 'lucide-react';

export default function App() {
  // Load State from db.ts (which reads from localStorage)
  const [dbState, setDbState] = useState<StorageState>(() => getInitialState());
  
  // Tab Routing
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  // Sidebar Collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  
  // Selected Detail Overlay Model
  const [selectedBillForDetails, setSelectedBillForDetails] = useState<Bill | null>(null);

  // Track selected trip ID for delivery tracking focus switching
  const [selectedTrackingTripId, setSelectedTrackingTripId] = useState<string>('');

  // Company profile edit modal visibility state
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState<boolean>(false);
  const [tempCompany, setTempCompany] = useState<CompanyProfile | null>(null);

  useEffect(() => {
    if (isCompanyModalOpen) {
      setTempCompany(dbState.companyProfile ? { ...dbState.companyProfile } : {
        name: 'Công ty Cổ phần Vận tải LTL Logistics Việt Nam',
        shortName: 'LTL Logistics',
        phone: '0243.999.888',
        email: 'contact@ltllogistics.vn',
        address: 'Tầng 5, Toà nhà Logistics, Quận Cầu Giấy, Hà Nội',
        taxCode: '0109876543',
        slogan: 'Vận tải LTL - Kết nối muôn phương'
      });
    } else {
      setTempCompany(null);
    }
  }, [isCompanyModalOpen, dbState.companyProfile]);

  const handleUpdateCompanyProfile = (profile: CompanyProfile) => {
    updateDbAndSave(prev => ({
      ...prev,
      companyProfile: profile
    }));
  };

  // Helper function to update state, trigger recalculations, and write to localStorage
  const updateDbAndSave = (updater: (prev: StorageState) => StorageState) => {
    setDbState(prev => {
      const updated = updater(prev);
      const recalculated = recalculateAllStats(updated);
      saveState(recalculated);
      return recalculated;
    });
  };

  // Sync back selectedBillForDetails if its parameters change
  useEffect(() => {
    if (selectedBillForDetails) {
      const updatedBill = dbState.bills.find(b => b.id === selectedBillForDetails.id);
      if (updatedBill) {
        setSelectedBillForDetails(updatedBill);
      }
    }
  }, [dbState.bills, selectedBillForDetails]);

  // ==========================================
  // ACTION HANDLERS
  // ==========================================

  // --- Bill Controllers ---
  const handleCreateBill = (newBillData: Omit<Bill, 'packagesLoaded' | 'packagesRemaining' | 'packagesDelivered' | 'status' | 'createdAt'>) => {
    updateDbAndSave(prev => {
      const newBill: Bill = {
        ...newBillData,
        packagesLoaded: 0,
        packagesRemaining: newBillData.totalPackages,
        packagesDelivered: 0,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      return {
        ...prev,
        bills: [newBill, ...prev.bills]
      };
    });
  };

  const handleDeleteBill = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      bills: prev.bills.filter(b => b.id !== id),
      // Clean loaded items associated
      tripItems: prev.tripItems.filter(item => item.billId !== id)
    }));
  };

  // --- Customer Controllers ---
  const handleCreateCustomer = (newCustomerData: Omit<Customer, 'currentDebt' | 'paidDebt'>) => {
    updateDbAndSave(prev => {
      const newCust: Customer = {
        ...newCustomerData,
        currentDebt: 0,
        paidDebt: 0
      };
      return {
        ...prev,
        customers: [...prev.customers, newCust]
      };
    });
  };

  const handleUpdateBillPaymentStatus = (billId: string, paymentStatus: 'paid' | 'unpaid') => {
    updateDbAndSave(prev => {
      const updatedBills = prev.bills.map(b => {
        if (b.id === billId) {
          return { ...b, paymentStatus };
        }
        return b;
      });
      return {
        ...prev,
        bills: updatedBills
      };
    });
  };

  const handleUpdateBill = (updatedBill: Bill) => {
    updateDbAndSave(prev => {
      const updatedBills = prev.bills.map(b => b.id === updatedBill.id ? updatedBill : b);
      return {
        ...prev,
        bills: updatedBills
      };
    });
  };

  const handleDeleteCustomer = (customerId: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== customerId)
    }));
  };

  // --- Trip Controllers ---
  const handleCreateTrip = (newTripData: Omit<Trip, 'status'>) => {
    updateDbAndSave(prev => {
      const newTrip: Trip = {
        ...newTripData,
        status: 'pending'
      };
      return {
        ...prev,
        trips: [newTrip, ...prev.trips]
      };
    });
  };

  const handleDeleteTrip = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      trips: prev.trips.filter(t => t.id !== id),
      // Clean loaded items associated
      tripItems: prev.tripItems.filter(item => item.tripId !== id)
    }));
  };

  const handleUpdateTripStatus = (tripId: string, status: TripStatus) => {
    updateDbAndSave(prev => {
      // Find trip and update
      const updatedTrips = prev.trips.map(t => {
        if (t.id === tripId) {
          return { ...t, status };
        }
        return t;
      });

      // Update associated vehicle status automatically if trip moves to completed
      // Also updates the loaded items status to shipping if the trip is shipped
      let updatedItems = prev.tripItems;
      if (status === 'shipping') {
        updatedItems = prev.tripItems.map(item => {
          if (item.tripId === tripId && item.deliveryStatus === 'loaded') {
            return { ...item, deliveryStatus: 'shipping' as DeliveryStatus };
          }
          return item;
        });
      }

      return {
        ...prev,
        trips: updatedTrips,
        tripItems: updatedItems
      };
    });
  };

  // --- Load Cargo Planner Controllers ---
  const handleLoadBillToTrip = (
    tripId: string, 
    billId: string, 
    packages: number, 
    weight: number, 
    volume: number
  ) => {
    updateDbAndSave(prev => {
      const newItem: TripBillItem = {
        id: `TBI-${Date.now()}`,
        tripId,
        billId,
        packagesLoaded: packages,
        weightLoaded: weight,
        volumeLoaded: volume,
        deliveryStatus: 'loaded', // wait dispatcher release
        updatedAt: new Date().toISOString()
      };

      return {
        ...prev,
        tripItems: [...prev.tripItems, newItem]
      };
    });
  };

  const handleUnloadBillFromTrip = (itemId: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      tripItems: prev.tripItems.filter(item => item.id !== itemId)
    }));
  };

  // --- Delivery Tracking Confirmers ---
  const handleUpdateDeliveryStatus = (itemId: string, deliveryStatus: DeliveryStatus) => {
    updateDbAndSave(prev => {
      const updatedItems = prev.tripItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            deliveryStatus,
            updatedAt: new Date().toISOString()
          };
        }
        return item;
      });

      return {
        ...prev,
        tripItems: updatedItems
      };
    });
  };

  // --- Vehicle Controllers ---
  const handleCreateVehicle = (newVehData: Omit<Vehicle, 'status'>) => {
    updateDbAndSave(prev => {
      const newVeh: Vehicle = {
        ...newVehData,
        status: 'idle'
      };
      return {
        ...prev,
        vehicles: [...prev.vehicles, newVeh]
      };
    });
  };

  const handleDeleteVehicle = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      vehicles: prev.vehicles.filter(v => v.id !== id)
    }));
  };

  const handleToggleMaintenance = (id: string) => {
    updateDbAndSave(prev => {
      const updatedVehicles = prev.vehicles.map(v => {
        if (v.id === id) {
          const nextStatus: Vehicle['status'] = v.status === 'maintenance' ? 'idle' : 'maintenance';
          return { ...v, status: nextStatus };
        }
        return v;
      });
      return {
        ...prev,
        vehicles: updatedVehicles
      };
    });
  };

  const handleAssignVehicleDriver = (vehicleId: string, driverId: string) => {
    updateDbAndSave(prev => {
      const updatedVehicles = prev.vehicles.map(v => {
        if (v.id === vehicleId) {
          return { ...v, driverId };
        }
        return v;
      });
      return {
        ...prev,
        vehicles: updatedVehicles
      };
    });
  };

  // --- Driver Controllers ---
  const handleCreateDriver = (newDriverData: Omit<Driver, 'id' | 'status'>) => {
    updateDbAndSave(prev => {
      const newDrv: Driver = {
        ...newDriverData,
        id: `DRV-${Math.floor(Math.random() * 900) + 100}`,
        status: 'active'
      };
      return {
        ...prev,
        drivers: [...prev.drivers, newDrv]
      };
    });
  };

  const handleDeleteDriver = (id: string) => {
    updateDbAndSave(prev => ({
      ...prev,
      drivers: prev.drivers.filter(d => d.id !== id)
    }));
  };

  const handleToggleDriverStatus = (id: string) => {
    updateDbAndSave(prev => {
      const updatedDrivers = prev.drivers.map(d => {
        if (d.id === id) {
          const nextStatus: Driver['status'] = d.status === 'active' ? 'inactive' : 'active';
          return { ...d, status: nextStatus };
        }
        return d;
      });
      return {
        ...prev,
        drivers: updatedDrivers
      };
    });
  };

  // --- Expense Controllers ---
  const handleAddTripExpense = (tripId: string, expense: Omit<TripExpense, 'id'>) => {
    updateDbAndSave(prev => {
      const updatedTrips = prev.trips.map(t => {
        if (t.id === tripId) {
          const currentExp = t.expenses || [];
          const newExp: TripExpense = {
            ...expense,
            id: `EXP-${Date.now()}`
          };
          return {
            ...t,
            expenses: [...currentExp, newExp]
          };
        }
        return t;
      });
      return {
        ...prev,
        trips: updatedTrips
      };
    });
  };

  const handleDeleteTripExpense = (tripId: string, expenseId: string) => {
    updateDbAndSave(prev => {
      const updatedTrips = prev.trips.map(t => {
        if (t.id === tripId) {
          const currentExp = t.expenses || [];
          return {
            ...t,
            expenses: currentExp.filter(e => e.id !== expenseId)
          };
        }
        return t;
      });
      return {
        ...prev,
        trips: updatedTrips
      };
    });
  };

  const handleAddBillTripExpense = (tripItemId: string, expense: Omit<BillTripExpense, 'id'>) => {
    updateDbAndSave(prev => {
      const updatedItems = prev.tripItems.map(item => {
        if (item.id === tripItemId) {
          const currentExp = item.deliveryExpenses || [];
          const newExp = {
            ...expense,
            id: `BEXP-${Date.now()}`
          };
          return {
            ...item,
            deliveryExpenses: [...currentExp, newExp]
          };
        }
        return item;
      });
      return {
        ...prev,
        tripItems: updatedItems
      };
    });
  };

  const handleDeleteBillTripExpense = (tripItemId: string, expenseId: string) => {
    updateDbAndSave(prev => {
      const updatedItems = prev.tripItems.map(item => {
        if (item.id === tripItemId) {
          const currentExp = item.deliveryExpenses || [];
          return {
            ...item,
            deliveryExpenses: currentExp.filter(e => e.id !== expenseId)
          };
        }
        return item;
      });
      return {
        ...prev,
        tripItems: updatedItems
      };
    });
  };

  // --- Users, simulator, and role switches controllers ---
  const handleUpdateUserRole = (id: string, role: User['role']) => {
    updateDbAndSave(prev => {
      const updatedUsers = prev.users.map(u => {
        if (u.id === id) {
          return { ...u, role };
        }
        return u;
      });

      // Update current active simulated user as well if matched
      let nextCurrentUser = prev.currentUser;
      if (prev.currentUser.id === id) {
        nextCurrentUser = { ...prev.currentUser, role };
      }

      return {
        ...prev,
        users: updatedUsers,
        currentUser: nextCurrentUser
      };
    });
  };

  const handleAddUser = (newUserData: Omit<User, 'id' | 'status'>) => {
    updateDbAndSave(prev => {
      const newUser: User = {
        ...newUserData,
        id: `USR-${Math.floor(Date.now() / 100000)}`,
        status: 'active'
      };
      return {
        ...prev,
        users: [...prev.users, newUser]
      };
    });
  };

  const handleChangeCurrentUser = (userId: string) => {
    const match = dbState.users.find(u => u.id === userId);
    if (match) {
      updateDbAndSave(prev => ({
        ...prev,
        currentUser: match
      }));
      
      // Auto-route to visual tab if the new simulated role does not have rights to old tab
      const allowedRolesByTab: Record<string, string[]> = {
        dashboard: ['admin', 'operator', 'driver'],
        bills: ['admin', 'operator'],
        trips: ['admin', 'operator', 'driver'],
        'xep-bill': ['admin', 'operator'],
        tracking: ['admin', 'operator', 'driver'],
        vehicles: ['admin', 'operator'],
        drivers: ['admin', 'operator'],
        reports: ['admin', 'operator'],
        users: ['admin'],
        schema: ['admin', 'operator']
      };

      const allowedRoles = allowedRolesByTab[currentTab] || [];
      if (!allowedRoles.includes(match.role)) {
        // Fallback simulated driver straight to tracking tab or dashboard
        if (match.role === 'driver') {
          setCurrentTab('tracking');
        } else {
          setCurrentTab('dashboard');
        }
      }
    }
  };

  // ==========================================
  // RENDER DYNAMIC COMPONENT PANEL BASED ON TAB
  // ==========================================
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <Dashboard
            bills={dbState.bills}
            trips={dbState.trips}
            vehicles={dbState.vehicles}
            drivers={dbState.drivers}
            setCurrentTab={setCurrentTab}
            onSelectBillForDetails={(bill) => setSelectedBillForDetails(bill)}
            companyProfile={dbState.companyProfile}
            onEditCompany={() => setIsCompanyModalOpen(true)}
          />
        );
      
      case 'bills':
        return (
          <BillsList
            bills={dbState.bills}
            customers={dbState.customers}
            onCreateBill={handleCreateBill}
            onUpdateBill={handleUpdateBill}
            onDeleteBill={handleDeleteBill}
            onSelectBillForDetails={(bill) => setSelectedBillForDetails(bill)}
          />
        );

      case 'customers':
        return (
          <CustomersList
            customers={dbState.customers}
            bills={dbState.bills}
            onCreateCustomer={handleCreateCustomer}
            onUpdateBillPaymentStatus={handleUpdateBillPaymentStatus}
            onDeleteCustomer={handleDeleteCustomer}
          />
        );

      case 'trips':
        return (
          <TripsList
            trips={dbState.trips}
            vehicles={dbState.vehicles}
            drivers={dbState.drivers}
            tripItems={dbState.tripItems}
            bills={dbState.bills}
            onCreateTrip={handleCreateTrip}
            onDeleteTrip={handleDeleteTrip}
            onUpdateTripStatus={handleUpdateTripStatus}
            onGoToTab={setCurrentTab}
            onAddTripExpense={handleAddTripExpense}
            onDeleteTripExpense={handleDeleteTripExpense}
            onAddBillTripExpense={handleAddBillTripExpense}
            onDeleteBillTripExpense={handleDeleteBillTripExpense}
            onSelectTrackingTrip={setSelectedTrackingTripId}
          />
        );

      case 'xep-bill':
        return (
          <XepBillModal
            bills={dbState.bills}
            trips={dbState.trips}
            vehicles={dbState.vehicles}
            drivers={dbState.drivers}
            tripItems={dbState.tripItems}
            onLoadBillToTrip={handleLoadBillToTrip}
            onUnloadBillFromTrip={handleUnloadBillFromTrip}
            onCreateTrip={handleCreateTrip}
          />
        );

      case 'tracking':
        return (
          <DeliveryTracker
            trips={dbState.trips}
            vehicles={dbState.vehicles}
            drivers={dbState.drivers}
            tripItems={dbState.tripItems}
            bills={dbState.bills}
            onUpdateDeliveryStatus={handleUpdateDeliveryStatus}
            onAddTripExpense={handleAddTripExpense}
            onDeleteTripExpense={handleDeleteTripExpense}
            onAddBillTripExpense={handleAddBillTripExpense}
            onDeleteBillTripExpense={handleDeleteBillTripExpense}
            selectedTripId={selectedTrackingTripId}
            onSelectTripId={setSelectedTrackingTripId}
          />
        );

      case 'vehicles':
        return (
          <VehiclesList
            vehicles={dbState.vehicles}
            drivers={dbState.drivers}
            trips={dbState.trips}
            tripItems={dbState.tripItems}
            bills={dbState.bills}
            onCreateVehicle={handleCreateVehicle}
            onDeleteVehicle={handleDeleteVehicle}
            onToggleMaintenance={handleToggleMaintenance}
            onAssignDriver={handleAssignVehicleDriver}
          />
        );

      case 'drivers':
        return (
          <DriversList
            drivers={dbState.drivers}
            onCreateDriver={handleCreateDriver}
            onDeleteDriver={handleDeleteDriver}
            onToggleDriverStatus={handleToggleDriverStatus}
          />
        );

      case 'reports':
        return (
          <Reports
            bills={dbState.bills}
            trips={dbState.trips}
            vehicles={dbState.vehicles}
            drivers={dbState.drivers}
            tripItems={dbState.tripItems}
          />
        );

      case 'schema':
        return (
          <Reports
            bills={dbState.bills}
            trips={dbState.trips}
            vehicles={dbState.vehicles}
            drivers={dbState.drivers}
            tripItems={dbState.tripItems}
          />
        );

      case 'users':
        return (
          <UsersList
            users={dbState.users}
            currentUser={dbState.currentUser}
            onUpdateUserRole={handleUpdateUserRole}
            onAddUser={handleAddUser}
          />
        );

      case 'help':
        return <UserGuide />;

      default:
        return (
          <div className="p-8 text-center bg-slate-100 rounded-xl">
            Tab này đang được hoàn thiện. Vui lòng quay lại sau!
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Left Navigation Sidebar */}
      <div className={`transition-all duration-300 overflow-hidden flex h-screen shrink-0 ${isSidebarCollapsed ? 'w-20' : 'w-80'}`}>
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={(tab) => {
            // If tab is schema, we route reports but trigger the code visualizer view inside reports
            if (tab === 'schema') {
              setCurrentTab('reports');
              // Since REPORTS shares schema trigger inside, handled elegantly
            } else {
              setCurrentTab(tab);
            }
          }}
          currentUser={dbState.currentUser}
          onChangeUser={handleChangeCurrentUser}
          allUsers={dbState.users}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          companyProfile={dbState.companyProfile}
          onEditCompany={() => setIsCompanyModalOpen(true)}
        />
      </div>

      {/* Right Main Content Container with scroll boundaries */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Minimalist Header bar */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition cursor-pointer flex items-center justify-center shrink-0"
              title={isSidebarCollapsed ? "Hiện thanh điều hướng" : "Ẩn thanh điều hướng"}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-sans font-bold text-slate-600 uppercase tracking-wider">
                {currentTab === 'dashboard' ? 'Tổng quan Bảng điều khiển' :
                 currentTab === 'bills' ? 'Quản lý Vận đơn lẻ' :
                 currentTab === 'trips' ? 'Chỉ huy Chuyến tải' :
                 currentTab === 'xep-bill' ? 'Điều phối bóc xếp hàng (LTL Planner)' :
                 currentTab === 'tracking' ? 'Xác nhận hạ dỡ hàng' :
                 currentTab === 'vehicles' ? 'Quản lý Đầu xe vận tải' :
                 currentTab === 'drivers' ? 'Quản lý Hồ sơ tài xế' :
                 currentTab === 'help' ? 'Hướng dẫn vận hành hệ thống' :
                 currentTab === 'reports' ? 'Thống kê KPIs & Schema' : 'LogiSaaS ERP'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] text-slate-400 bg-slate-150/50 px-3 py-1 rounded-lg border border-slate-200/50">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>LogisSaaS Enterprise</span>
            </div>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{dbState.currentUser.fullName}</div>
                <div className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">{dbState.currentUser.role}</div>
              </div>
              <div className="h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-sm border border-blue-700/10 uppercase">
                {dbState.currentUser.fullName.split(' ').pop()?.slice(0, 2) || dbState.currentUser.fullName.slice(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner views container */}
        <div className="flex-1 overflow-y-auto p-8 max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </div>

      </main>

      {/* GLOBAL MOUNTED OVERLAYS: Bill detail modal */}
      {selectedBillForDetails && (
        <BillDetailModal
          bill={selectedBillForDetails}
          vehicles={dbState.vehicles}
          drivers={dbState.drivers}
          trips={dbState.trips}
          tripItems={dbState.tripItems}
          onClose={() => setSelectedBillForDetails(null)}
          onGoToTab={(tab) => {
            setCurrentTab(tab);
            setSelectedBillForDetails(null);
          }}
        />
      )}

      {/* GLOBAL MOUNTED OVERLAYS: Company Profile Edit Modal */}
      {isCompanyModalOpen && tempCompany && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-slate-900/50 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-8">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden animate-zoom-in my-8">
              {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-sans font-bold text-lg text-slate-900">Thiết Lập Thông Tin Doanh Nghiệp</h3>
                <p className="text-xs text-slate-500 mt-0.5">Cấu hình hồ sơ, tên thương hiệu và địa chỉ liên lạc hiển thị trên hệ thống LogiSaaS ERP.</p>
              </div>
              <button
                onClick={() => setIsCompanyModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={(e) => {
              e.preventDefault();
              handleUpdateCompanyProfile(tempCompany);
              setIsCompanyModalOpen(false);
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Tên đầy đủ công ty <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Công ty Cổ phần Vận tải ..."
                  value={tempCompany.name}
                  onChange={(e) => setTempCompany({ ...tempCompany, name: e.target.value })}
                  className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-semibold text-slate-850"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 font-bold">Tên thương hiệu / Thẻ hiển thị <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: LTL Logistics"
                    value={tempCompany.shortName}
                    onChange={(e) => setTempCompany({ ...tempCompany, shortName: e.target.value })}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-bold text-slate-850"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Khẩu hiệu / Slogan</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Vận tải LTL - Kết nối muôn phương"
                    value={tempCompany.slogan}
                    onChange={(e) => setTempCompany({ ...tempCompany, slogan: e.target.value })}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 italic text-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 font-bold">Số điện thoại Hotline <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập hotline liên hệ"
                    value={tempCompany.phone}
                    onChange={(e) => setTempCompany({ ...tempCompany, phone: e.target.value })}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono font-bold text-slate-850"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 font-bold">Địa chỉ Email <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={tempCompany.email}
                    onChange={(e) => setTempCompany({ ...tempCompany, email: e.target.value })}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 text-slate-850"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Mã số thuế (MST)</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 0109876543"
                    value={tempCompany.taxCode}
                    onChange={(e) => setTempCompany({ ...tempCompany, taxCode: e.target.value })}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 font-mono text-slate-850 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 font-bold">Trụ sở Công ty <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="Địa chỉ trụ sở công ty"
                    value={tempCompany.address}
                    onChange={(e) => setTempCompany({ ...tempCompany, address: e.target.value })}
                    className="w-full bg-slate-50 focus:bg-white text-xs border border-slate-200 focus:border-blue-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-550 text-slate-855"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCompanyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-750 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-blue-500/10"
                >
                  Lưu thiết lập
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
