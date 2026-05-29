/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Bill, Vehicle, Driver, Trip, TripBillItem, User, Customer, CompanyProfile } from './types';

// Seed Initial Data
const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'Công ty Cổ phần May mặc Thành Công',
    phone: '02838445566',
    email: 'contact@thanhconggarment.vn',
    address: '15 Tố Hữu, Nam Từ Liêm, Hà Nội',
    debtLimit: 50000000
  },
  {
    id: 'CUST-002',
    name: 'Công ty TNHH Thiết bị Điện máy Hoà Phát',
    phone: '0908123456',
    email: 'sales@hoaphat-electric.com.vn',
    address: '344 Kinh Dương Vương, Bình Tân, TP Hồ Chí Minh',
    debtLimit: 120000000
  },
  {
    id: 'CUST-003',
    name: 'Hộ kinh doanh Nguyễn Thu Trang (Gia dụng)',
    phone: '0977222333',
    email: 'trangnt.giadung@gmail.com',
    address: 'Hải Thượng Lãn Ông, Quận 5, TP Hồ Chí Minh',
    debtLimit: 20000000
  },
  {
    id: 'CUST-004',
    name: 'Tổng kho Linh kiện điện tử Phong Vũ',
    phone: '19001808',
    email: 'warehouse@phongvu.vn',
    address: 'Khu công nghệ cao Quận 9, TP Thủ Đức',
    debtLimit: 150000000
  },
  {
    id: 'CUST-005',
    name: 'Nhà phân phối sữa dinh dưỡng Vinamilk miền Trung',
    phone: '02363555666',
    email: 'mientrung.vinamilk@gmail.com',
    address: 'Đường số 3, KCN Hoà Khánh, Liên Chiểu, Đà Nẵng',
    debtLimit: 80000000
  }
];

const INITIAL_DRIVERS: Driver[] = [
  { id: 'DRV001', fullName: 'Nguyễn Văn Hùng', phone: '0912345678', idCard: '012345678912', licenseNumber: 'GPLX-12345', status: 'active' },
  { id: 'DRV002', fullName: 'Lê Hoàng Nam', phone: '0987654321', idCard: '023456789012', licenseNumber: 'GPLX-67890', status: 'active' },
  { id: 'DRV003', fullName: 'Trần Minh Đức', phone: '0901234567', idCard: '034567890123', licenseNumber: 'GPLX-11223', status: 'active' },
  { id: 'DRV004', fullName: 'Phạm Thanh Sơn', phone: '0934567890', idCard: '045678901234', licenseNumber: 'GPLX-44556', status: 'active' }
];

const INITIAL_VEHICLES: Vehicle[] = [
  { id: 'VEH-29C-12345', licensePlate: '29C-123.45', type: 'Xe tải 2.5 Tấn', maxWeight: 2500, maxVolume: 12, driverId: 'DRV001', status: 'idle' },
  { id: 'VEH-51D-67890', licensePlate: '51D-678.90', type: 'Xe tải 5.0 Tấn', maxWeight: 5000, maxVolume: 24, driverId: 'DRV002', status: 'idle' },
  { id: 'VEH-30E-11223', licensePlate: '30E-112.23', type: 'Xe tải 8.0 Tấn', maxWeight: 8000, maxVolume: 40, driverId: 'DRV003', status: 'idle' },
  { id: 'VEH-43C-44556', licensePlate: '43C-445.56', type: 'Xe đầu kéo 15 Tấn', maxWeight: 15000, maxVolume: 80, driverId: 'DRV004', status: 'maintenance' }
];

const INITIAL_BILLS: Bill[] = [
  {
    id: 'BIL-2026-001',
    customerId: 'CUST-001',
    customerName: 'Công ty Cổ phần May mặc Thành Công',
    goodsName: 'Vải cuộn dệt & Quần áo bảo hộ',
    phone: '02838445566',
    deliveryAddress: '15 Tố Hữu, Nam Từ Liêm, Hà Nội',
    totalPackages: 100,
    totalWeight: 1200,
    totalVolume: 8.5,
    cod: 15000000,
    shippingFee: 5400000,
    paymentStatus: 'unpaid',
    note: 'Hàng dễ vỡ, giao tại kho bãi tầng trệt, liên hệ trước 30 phút.',
    status: 'partially_delivered',
    createdAt: '2026-05-25T08:00:00Z',
    packagesLoaded: 70,
    packagesRemaining: 30,
    packagesDelivered: 40
  },
  {
    id: 'BIL-2026-002',
    customerId: 'CUST-002',
    customerName: 'Công ty TNHH Thiết bị Điện máy Hoà Phát',
    goodsName: 'Tủ lanh Inverter & Điều hoà tủ đứng Hoà Phát',
    phone: '0908123456',
    deliveryAddress: '344 Kinh Dương Vương, Bình Tân, TP Hồ Chí Minh',
    totalPackages: 50,
    totalWeight: 1800,
    totalVolume: 15.0,
    cod: 42000000,
    shippingFee: 15500000,
    paymentStatus: 'unpaid',
    note: 'Yêu cầu hỗ trợ hạ hàng bằng xe nâng.',
    status: 'shipping',
    createdAt: '2026-05-26T09:30:00Z',
    packagesLoaded: 50,
    packagesRemaining: 0,
    packagesDelivered: 0
  },
  {
    id: 'BIL-2026-003',
    customerId: 'CUST-003',
    customerName: 'Hộ kinh doanh Nguyễn Thu Trang (Gia dụng)',
    goodsName: 'Nồi chiên không dầu & Đồ nhựa gia dụng Song Long',
    phone: '0977222333',
    deliveryAddress: 'Hải Thượng Lãn Ông, Quận 5, TP Hồ Chí Minh',
    totalPackages: 30,
    totalWeight: 240,
    totalVolume: 1.8,
    cod: 5400000,
    shippingFee: 1800000,
    paymentStatus: 'paid',
    note: 'Giao giờ hành chính, gọi chị Trang nhận hàng.',
    status: 'completed',
    createdAt: '2026-05-27T10:15:00Z',
    packagesLoaded: 30,
    packagesRemaining: 0,
    packagesDelivered: 30
  },
  {
    id: 'BIL-2026-004',
    customerId: 'CUST-004',
    customerName: 'Tổng kho Linh kiện điện tử Phong Vũ',
    goodsName: 'Cáp nguồn Sata, RAM DDR5 & Chip xử lý CPU Intel',
    phone: '19001808',
    deliveryAddress: 'Khu công nghệ cao Quận 9, TP Thủ Đức',
    totalPackages: 80,
    totalWeight: 450,
    totalVolume: 4.2,
    cod: 0,
    shippingFee: 3200000,
    paymentStatus: 'unpaid',
    note: 'Hàng điện tử cao cấp, kiểm đếm kỹ khi nhận hàng.',
    status: 'pending',
    createdAt: '2026-05-28T14:20:00Z',
    packagesLoaded: 0,
    packagesRemaining: 80,
    packagesDelivered: 0
  },
  {
    id: 'BIL-2026-005',
    customerId: 'CUST-005',
    customerName: 'Nhà phân phối sữa dinh dưỡng Vinamilk miền Trung',
    goodsName: 'Sữa tươi tiệt trùng & Sữa bột trẻ em Vinamilk',
    phone: '02363555666',
    deliveryAddress: 'Đường số 3, KCN Hoà Khánh, Liên Chiểu, Đà Nẵng',
    totalPackages: 120,
    totalWeight: 2400,
    totalVolume: 9.6,
    cod: 18500000,
    shippingFee: 8500000,
    paymentStatus: 'unpaid',
    note: 'Sữa thùng đóng kín, xếp dỡ cẩn thận tránh móp méo.',
    status: 'pending',
    createdAt: '2026-05-29T11:00:00Z',
    packagesLoaded: 0,
    packagesRemaining: 120,
    packagesDelivered: 0
  }
];

const INITIAL_TRIPS: Trip[] = [
  {
    id: 'TRP-20260528-01',
    vehicleId: 'VEH-29C-12345',
    driverId: 'DRV001',
    route: 'Kho tổng HN -> Nam Từ Liêm -> Cầu Giấy',
    departureTime: '2026-05-28T04:00:00Z',
    estimatedArrivalTime: '2026-05-28T10:00:00Z',
    status: 'completed',
    expenses: [
      { id: 'EXP-001', category: 'fuel', amount: 850000, description: 'Đổ dầu Diesel chặng HN', date: '2026-05-28T04:15:00Z' },
      { id: 'EXP-002', category: 'toll', amount: 120000, description: 'Trạm BOT Pháp Vân - Cầu Giẽ', date: '2026-05-28T05:00:00Z' },
      { id: 'EXP-003', category: 'meal', amount: 150000, description: 'Bồi dưỡng ăn ca tài xế chính', date: '2026-05-28T10:30:00Z' }
    ]
  },
  {
    id: 'TRP-20260529-01',
    vehicleId: 'VEH-51D-67890',
    driverId: 'DRV002',
    route: 'Nhà ga Sóng Thần -> Bình Tân -> Quận 5',
    departureTime: '2026-05-29T02:00:00Z',
    estimatedArrivalTime: '2026-05-29T08:00:00Z',
    status: 'shipping',
    expenses: [
      { id: 'EXP-004', category: 'fuel', amount: 1250000, description: 'Nạp nhiên liệu bổ sung', date: '2026-05-29T02:30:00Z' },
      { id: 'EXP-005', category: 'toll', amount: 160000, description: 'BOT Xa lộ Hà Nội khứ hồi', date: '2026-05-29T03:15:00Z' }
    ]
  },
  {
    id: 'TRP-20260529-02',
    vehicleId: 'VEH-30E-11223',
    driverId: 'DRV003',
    route: 'Tổng kho Miền Bắc -> KCN Hoà Khánh Đà Nẵng',
    departureTime: '2026-05-30T01:00:00Z',
    estimatedArrivalTime: '2026-05-31T06:00:00Z',
    status: 'pending',
    expenses: []
  }
];

const INITIAL_TRIP_ITEMS: TripBillItem[] = [
  // Chuyến 1 (Đã hoàn thành) chở 40 kiện BIL-001 (Đã giao thành công 40 kiện)
  {
    id: 'TBI-001',
    tripId: 'TRP-20260528-01',
    billId: 'BIL-2026-001',
    packagesLoaded: 40,
    weightLoaded: 480,
    volumeLoaded: 3.4,
    deliveryStatus: 'delivered',
    updatedAt: '2026-05-28T09:12:00Z',
    deliveryExpenses: [
      { id: 'BEXP-001', name: 'Bốc dỡ thủ công tầng hầm', amount: 200000, note: 'Xe hạ hầm bốc tay trọn gói' }
    ]
  },
  // Chuyến 1 (Đã hoàn thành) chở 30 kiện BIL-003 (Đã giao thành công 30 kiện)
  {
    id: 'TBI-002',
    tripId: 'TRP-20260528-01',
    billId: 'BIL-2026-003',
    packagesLoaded: 30,
    weightLoaded: 240,
    volumeLoaded: 1.8,
    deliveryStatus: 'delivered',
    updatedAt: '2026-05-28T08:45:00Z',
    deliveryExpenses: []
  },
  
  // Chuyến 2 (Đang vận chuyển) chở thêm 30 kiện BIL-001 (Đang trên đường đi - shipping)
  {
    id: 'TBI-003',
    tripId: 'TRP-20260529-01',
    billId: 'BIL-2026-001',
    packagesLoaded: 30,
    weightLoaded: 360,
    volumeLoaded: 2.55,
    deliveryStatus: 'shipping',
    updatedAt: '2026-05-29T02:00:00Z',
    deliveryExpenses: []
  },
  // Chuyến 2 (Đang vận chuyển) chở 50 kiện BIL-002 (Đang trên đường đi - shipping)
  {
    id: 'TBI-004',
    tripId: 'TRP-20260529-01',
    billId: 'BIL-2026-002',
    packagesLoaded: 50,
    weightLoaded: 1800,
    volumeLoaded: 15.0,
    deliveryStatus: 'shipping',
    updatedAt: '2026-05-29T02:00:00Z',
    deliveryExpenses: [
      { id: 'BEXP-002', name: 'Phí dịch xe nâng cẩu hạ máy', amount: 500000, note: 'Yêu cầu của KH khi xếp dỡ thiết bị lớn' }
    ]
  }
];

const INITIAL_USERS: User[] = [
  { id: 'USR001', fullName: 'Bùi Thế Hoàng', username: 'hoangbuisystem', email: 'bangiay1001@gmail.com', role: 'admin', status: 'active' },
  { id: 'USR002', fullName: 'Phạm Minh Tú', username: 'tupm_ops', email: 'tu.pham@logisystem.vn', role: 'operator', status: 'active' },
  { id: 'USR003', fullName: 'Nguyễn Văn Hùng (Tài xế)', username: 'hung_driver', email: 'hung.nguyen@logisystem.vn', role: 'driver', status: 'active' }
];

export const INITIAL_COMPANY: CompanyProfile = {
  name: 'Công ty Cổ phần Vận tải LTL Logistics Việt Nam',
  shortName: 'LTL Logistics',
  phone: '0243.999.888',
  email: 'contact@ltllogistics.vn',
  address: 'Tầng 5, Toà nhà Logistics, Quận Cầu Giấy, Hà Nội',
  taxCode: '0109876543',
  slogan: 'Vận tải LTL - Kết nối muôn phương'
};

export interface StorageState {
  bills: Bill[];
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  tripItems: TripBillItem[];
  customers: Customer[];
  users: User[];
  currentUser: User;
  companyProfile: CompanyProfile;
}

const STORAGE_KEY = 'ltl_tms_db';

export function getInitialState(): StorageState {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      // Migrate existing state if customers is missing
      if (!parsed.customers) {
        parsed.customers = INITIAL_CUSTOMERS;
      }
      if (!parsed.companyProfile) {
        parsed.companyProfile = INITIAL_COMPANY;
      }
      return parsed;
    } catch (e) {
      console.error('Failed to parse database state. Reinitializing...', e);
    }
  }

  const defaultState: StorageState = {
    bills: INITIAL_BILLS,
    vehicles: INITIAL_VEHICLES,
    drivers: INITIAL_DRIVERS,
    trips: INITIAL_TRIPS,
    tripItems: INITIAL_TRIP_ITEMS,
    customers: INITIAL_CUSTOMERS,
    users: INITIAL_USERS,
    currentUser: INITIAL_USERS[0], // default to the workspace user / admin
    companyProfile: INITIAL_COMPANY
  };

  saveState(defaultState);
  return defaultState;
}

export function saveState(state: StorageState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Chức năng Đồng bộ hoá / Cập nhật lại Trạng thái Tự Động của Bill và Xe dựa trên các Chuyến và Xếp
export function recalculateAllStats(state: StorageState): StorageState {
  // Sync customers if empty
  const customers = state.customers || INITIAL_CUSTOMERS;

  const updatedBills = state.bills.map(bill => {
    // Tìm các mặt hàng phân tuyến liên quan đến bill này
    const items = state.tripItems.filter(item => item.billId === bill.id);
    
    // Tính tổng số kiện đã xếp
    const packagesLoaded = items.reduce((sum, item) => sum + item.packagesLoaded, 0);
    const packagesRemaining = Math.max(0, bill.totalPackages - packagesLoaded);
    
    // Tính tổng số kiện đã giao thành công
    const packagesDelivered = items
      .filter(item => item.deliveryStatus === 'delivered')
      .reduce((sum, item) => sum + item.packagesLoaded, 0);

    // Xác định trạng thái của Bill tự động
    let status: Bill['status'] = 'pending'; // Chờ xếp
    
    if (packagesDelivered === bill.totalPackages) {
      status = 'completed'; // Hoàn thành
    } else if (packagesDelivered > 0) {
      status = 'partially_delivered'; // Giao một phần
    } else if (packagesLoaded > 0) {
      // Đang vận chuyển nếu có bất kỳ item nào đang ở trạng thái shipping hoặc loaded
      status = 'shipping';
    }

    // Default shipping fee or fallback
    const shippingFee = bill.shippingFee || (bill.totalPackages * 25000);
    const paymentStatus = bill.paymentStatus || 'unpaid';

    return {
      ...bill,
      packagesLoaded,
      packagesRemaining,
      packagesDelivered,
      status,
      shippingFee,
      paymentStatus
    };
  });

  // Calculate customer debt stats dynamically
  const updatedCustomers = customers.map(cust => {
    const custBills = updatedBills.filter(b => b.customerId === cust.id || b.customerName === cust.name);
    
    const unpaidDebt = custBills
      .filter(b => b.paymentStatus === 'unpaid')
      .reduce((sum, b) => sum + b.shippingFee, 0);
      
    const paidDebt = custBills
      .filter(b => b.paymentStatus === 'paid')
      .reduce((sum, b) => sum + b.shippingFee, 0);

    return {
      ...cust,
      currentDebt: unpaidDebt,
      paidDebt: paidDebt
    };
  });

  // Đồng bộ trạng thái xe
  const updatedVehicles = state.vehicles.map(vehicle => {
    // Xem xe có chuyến xe nào đang trong trạng thái 'shipping' không
    const hasActiveTrip = state.trips.some(
      trip => trip.vehicleId === vehicle.id && trip.status === 'shipping'
    );

    let status = vehicle.status;
    if (status !== 'maintenance') {
      status = hasActiveTrip ? 'running' : 'idle';
    }

    return {
      ...vehicle,
      status
    };
  });

  return {
    ...state,
    bills: updatedBills,
    vehicles: updatedVehicles,
    customers: updatedCustomers
  };
}
