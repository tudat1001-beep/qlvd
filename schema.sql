-- ====================================================================
-- DATABASE SCHEMA: LTL TRANSPORTATION MANAGEMENT SYSTEM (TMS)
-- Platform: Supabase / PostgreSQL
-- Features: Row-Level Security (RLS), Real-time Triggers, Foreign Keys
-- ====================================================================

-- 1. ROLES DEFINITIONS OR ROLES TABLE
-- In Supabase, you can define custom roles or use user metadata, or define a lookup table:
CREATE TYPE user_role AS ENUM ('admin', 'operator', 'driver');
CREATE TYPE bill_status AS ENUM ('pending', 'shipping', 'partially_delivered', 'completed', 'returned');
CREATE TYPE vehicle_status AS ENUM ('idle', 'running', 'maintenance');
CREATE TYPE trip_status AS ENUM ('pending', 'shipping', 'completed');
CREATE TYPE delivery_status AS ENUM ('loaded', 'shipping', 'delivered', 'failed');

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role DEFAULT 'operator'::user_role,
    status VARCHAR(50) DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. DRIVERS TABLE
CREATE TABLE IF NOT EXISTS public.drivers (
    id VARCHAR(100) PRIMARY KEY, -- Ví dụ: DRV001, DRV002
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    id_card VARCHAR(20) UNIQUE NOT NULL, -- CCCD
    license_number VARCHAR(100) UNIQUE NOT NULL, -- Bằng lái xe
    status VARCHAR(50) DEFAULT 'active' NOT NULL, -- active, inactive
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. VEHICLES TABLE
CREATE TABLE IF NOT EXISTS public.vehicles (
    id VARCHAR(100) PRIMARY KEY, -- Sử dụng biển số dán nhãn (ví dụ: VEH-29C-12345)
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(100) NOT NULL, -- Loại xe (2.5 tấn, 5 tấn, v.v...)
    max_weight NUMERIC(10, 2) NOT NULL, -- kg
    max_volume NUMERIC(10, 2) NOT NULL, -- m3
    driver_id VARCHAR(100) REFERENCES public.drivers(id) ON DELETE SET NULL,
    status vehicle_status DEFAULT 'idle'::vehicle_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. BILLS TABLE
CREATE TABLE IF NOT EXISTS public.bills (
    id VARCHAR(100) PRIMARY KEY, -- Mã Bill (ví dụ: BIL-2026-001)
    customer_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    total_packages INT NOT NULL CHECK (total_packages > 0),
    total_weight NUMERIC(10, 2) NOT NULL CHECK (total_weight > 0), -- kg
    total_volume NUMERIC(10, 2) NOT NULL CHECK (total_volume > 0), -- m3
    cod NUMERIC(15, 2) DEFAULT 0.00 NOT NULL,
    note TEXT,
    status bill_status DEFAULT 'pending'::bill_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id VARCHAR(100) PRIMARY KEY, -- Mã chuyến đi (vĩ dụ: TRP-20260529-01)
    vehicle_id VARCHAR(100) REFERENCES public.vehicles(id) ON DELETE RESTRICT NOT NULL,
    driver_id VARCHAR(100) REFERENCES public.drivers(id) ON DELETE RESTRICT NOT NULL,
    route VARCHAR(255) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status trip_status DEFAULT 'pending'::trip_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TRIP_BILL_ITEMS (Bản trung gian nối giữa Chuyến xe và Bill hàngẻ)
CREATE TABLE IF NOT EXISTS public.trip_bill_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_id VARCHAR(100) REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
    bill_id VARCHAR(100) REFERENCES public.bills(id) ON DELETE CASCADE NOT NULL,
    packages_loaded INT NOT NULL CHECK (packages_loaded > 0),
    weight_loaded NUMERIC(10, 2) NOT NULL CHECK (weight_loaded > 0),
    volume_loaded NUMERIC(10, 2) NOT NULL CHECK (volume_loaded > 0),
    delivery_status delivery_status DEFAULT 'loaded'::delivery_status NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    CONSTRAINT unique_trip_bill UNIQUE (trip_id, bill_id)
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) IN SUPABASE
-- ====================================================================

-- Enable RLS for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_bill_items ENABLE ROW LEVEL SECURITY;

-- Create Policies (Admin has full access, Operator can read/write, Driver can only read)

-- 1) Policy for Users Table
CREATE POLICY "Allow members to read user profiles" ON public.users
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin to manage users" ON public.users
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
    );

-- 2) Policy for Drivers Table
CREATE POLICY "Allow authenticated users to read drivers list" ON public.drivers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow operations staff to manage drivers" ON public.drivers
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
    );

-- 3) Policy for Vehicles Table
CREATE POLICY "Allow authenticated users to read vehicles list" ON public.vehicles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow operations staff to manage vehicles" ON public.vehicles
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
    );

-- 4) Policy for Bills Table
CREATE POLICY "Allow authenticated users to view bills" ON public.bills
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow operations staff to manage bills" ON public.bills
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
    );

-- 5) Policy for Trips Table
CREATE POLICY "Allow authenticated users to view trips" ON public.trips
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow operations staff to manage trips" ON public.trips
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
    );

-- 6) Policy for Trip Bill Items Table
CREATE POLICY "Allow authenticated users to view loaded bill items" ON public.trip_bill_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow operations staff to manage loaded bill items" ON public.trip_bill_items
    FOR ALL TO authenticated USING (
        (SELECT role FROM public.users WHERE id = auth.uid()) IN ('admin', 'operator')
    );

-- ====================================================================
-- AUTO CALCULATION FUNCTIONS & TRIGGERS
-- ====================================================================

-- Trigger function to update the status of some tables when changed
CREATE OR REPLACE FUNCTION public.sync_bill_status_on_item_change()
RETURNS TRIGGER AS $$
DECLARE
    v_total_pkg INT;
    v_loaded_pkg INT;
    v_delivered_pkg INT;
    v_new_status bill_status;
BEGIN
    -- Lấy ID của bill liên quan
    IF TG_OP = 'DELETE' THEN
        SELECT total_packages INTO v_total_pkg FROM public.bills WHERE id = OLD.bill_id;
    ELSE
        SELECT total_packages INTO v_total_pkg FROM public.bills WHERE id = NEW.bill_id;
    END IF;

    -- Tính tổng packages đã xếp và đã giao
    IF TG_OP = 'DELETE' THEN
        SELECT COALESCE(SUM(packages_loaded), 0) INTO v_loaded_pkg 
        FROM public.trip_bill_items WHERE bill_id = OLD.bill_id;

        SELECT COALESCE(SUM(packages_loaded), 0) INTO v_delivered_pkg 
        FROM public.trip_bill_items 
        WHERE bill_id = OLD.bill_id AND delivery_status = 'delivered';
    ELSE
        SELECT COALESCE(SUM(packages_loaded), 0) INTO v_loaded_pkg 
        FROM public.trip_bill_items WHERE bill_id = NEW.bill_id;

        SELECT COALESCE(SUM(packages_loaded), 0) INTO v_delivered_pkg 
        FROM public.trip_bill_items 
        WHERE bill_id = NEW.bill_id AND delivery_status = 'delivered';
    END IF;

    -- Quyết định trạng thái
    IF v_delivered_pkg = v_total_pkg THEN
        v_new_status := 'completed'::bill_status;
    ELSIF v_delivered_pkg > 0 THEN
        v_new_status := 'partially_delivered'::bill_status;
    ELSIF v_loaded_pkg > 0 THEN
        v_new_status := 'shipping'::bill_status;
    ELSE
        v_new_status := 'pending'::bill_status;
    END IF;

    -- Cập nhật vào bảng bills
    IF TG_OP = 'DELETE' THEN
        UPDATE public.bills SET status = v_new_status, updated_at = now() WHERE id = OLD.bill_id;
    ELSE
        UPDATE public.bills SET status = v_new_status, updated_at = now() WHERE id = NEW.bill_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Gắn trigger cho bảng trip_bill_items
CREATE TRIGGER after_trip_bill_item_change
AFTER INSERT OR UPDATE OR DELETE ON public.trip_bill_items
FOR EACH ROW EXECUTE FUNCTION public.sync_bill_status_on_item_change();


-- ====================================================================
-- SEED DATA
-- ====================================================================

-- Drivers seed
INSERT INTO public.drivers (id, full_name, phone, id_card, license_number, status) VALUES
('DRV001', 'Nguyễn Văn Hùng', '0912345678', '012345678912', 'GPLX-12345', 'active'),
('DRV002', 'Lê Hoàng Nam', '0987654321', '023456789012', 'GPLX-67890', 'active'),
('DRV003', 'Trần Minh Đức', '0901234567', '034567890123', 'GPLX-11223', 'active'),
('DRV004', 'Phạm Thanh Sơn', '0934567890', '045678901234', 'GPLX-44556', 'active')
ON CONFLICT (id) DO NOTHING;

-- Vehicles seed
INSERT INTO public.vehicles (id, license_plate, type, max_weight, max_volume, driver_id, status) VALUES
('VEH-29C-12345', '29C-123.45', 'Xe tải 2.5 Tấn', 2500.00, 12.00, 'DRV001', 'idle'),
('VEH-51D-67890', '51D-678.90', 'Xe tải 5.0 Tấn', 5000.00, 24.00, 'DRV002', 'idle'),
('VEH-30E-11223', '30E-112.23', 'Xe tải 8.0 Tấn', 8000.00, 40.00, 'DRV003', 'idle'),
('VEH-43C-44556', '43C-445.56', 'Xe đầu kéo 15 Tấn', 15000.00, 80.00, 'DRV004', 'maintenance')
ON CONFLICT (id) DO NOTHING;

-- Bills seed
INSERT INTO public.bills (id, customer_name, phone, delivery_address, total_packages, total_weight, total_volume, cod, note, status) VALUES
('BIL-2026-001', 'Công ty Cổ phần May mặc Thành Công', '02838445566', '15 Tố Hữu, Nam Từ Liêm, Hà Nội', 100, 1200.00, 8.50, 15000000.00, 'Hàng dễ vỡ, giao tại kho bãi tầng trệt, liên hệ trước 30 phút.', 'pending'),
('BIL-2026-002', 'Công ty TNHH Thiết bị Điện máy Hoà Phát', '0908123456', '344 Kinh Dương Vương, Bình Tân, TP Hồ Chí Minh', 50, 1800.00, 15.00, 42000000.00, 'Yêu cầu hỗ trợ hạ hàng bằng xe nâng.', 'pending'),
('BIL-2026-003', 'Hộ kinh doanh Nguyễn Thu Trang (Gia dụng)', '0977222333', 'Hải Thượng Lãn Ông, Quận 5, TP Hồ Chí Minh', 30, 240.00, 1.80, 5400000.00, 'Giao giờ hành chính, gọi chị Trang nhận hàng.', 'pending')
ON CONFLICT (id) DO NOTHING;
