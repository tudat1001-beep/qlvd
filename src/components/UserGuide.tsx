/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HelpCircle, BookOpen, Lightbulb, CheckCircle, Info } from 'lucide-react';
import Markdown from 'react-markdown';

const guideContent = `
# Hướng Dẫn Sử Dụng Hệ Thống Quản Lý Vận Tải (LTL Logistics)

Chào mừng bạn đến với hệ thống quản lý vận tải chuyên dụng cho hàng lẻ (LTL). Dưới đây là lộ trình chi tiết các bước để vận hành một đơn hàng từ khi tiếp nhận đến khi giao hàng thành công.

---

## 🟢 QUY TRÌNH VẬN HÀNH 5 BƯỚC

### Bước 1: Thiết lập dữ liệu nền (Chỉ làm lần đầu)
Trước khi bắt đầu, hãy đảm bảo bạn đã nhập đầy đủ các thông tin:
1.  **Khách hàng:** Vào mục "Khách hàng" để thêm người gửi/người nhận thường xuyên.
2.  **Đội xe:** Thêm thông tin xe (Biển số, trọng tải) vào mục "Xe".
3.  **Tài xế:** Thêm danh sách tài xế và số điện thoại liên lạc.

### Bước 2: Tiếp nhận đơn hàng (Tạo Bill)
1.  Vào mục **"Vận đơn (Bills)"** -> Nhấn nút **"Thêm vận đơn"**.
2.  Nhập thông tin: Tên hàng, Số kiện, Khối lượng (kg), Thể tích (m3).
3.  Chọn Khách hàng gửi và Khách hàng nhận.
4.  Nhập **Cước phí** và tiền **Thu hộ (COD)** nếu có.
5.  *Sau khi lưu, Bill sẽ ở trạng thái "Chờ xếp xe".*

### Bước 3: Điều xe & Xếp hàng (Tạo Chuyến)
Đây là bước quan trọng nhất của hệ thống LTL:
1.  Vào mục **"Chuyến xe (Trips)"** -> Nhấn **"Tạo chuyến mới"**.
2.  Chọn Xe và Tài xế thực hiện chuyến đi.
3.  Tại danh sách chuyến xe, nhấn vào nút **"Xếp hàng"** (Biểu tượng hộp quà) của chuyến vừa tạo.
4.  Hệ thống hiển thị danh sách các Bill đang chờ. Nhấn **"Xếp vào xe"** cho Bill bạn muốn:
    *   Nếu một xe không chở hết, bạn có thể nhập số kiện ít hơn tổng số kiện của Bill (Ví dụ: Bill 10 kiện, xếp lên xe này 4 kiện). 
    *   Hệ thống sẽ tự động tách số kiện còn lại (6 kiện) để bạn xếp vào các chuyến xe khác sau này.
5.  Sau khi xếp xong, nhấn **"Bắt đầu hành trình"** để chuyển trạng thái chuyến xe sang "Đang chạy".

### Bước 4: Theo dõi & Giao hàng
1.  Người điều hành theo dõi danh sách tại mục **"Theo dõi giao hàng"**.
2.  Khi tài xế giao hàng xong tại điểm dừng, nhấn vào biểu tượng **"Cập nhật giao hàng"**.
3.  Nhập số lượng kiện thực tế đã giao thành công.
    *   Vận đơn sẽ tự động chuyển sang màu xanh (Hoàn thành) khi tất cả các kiện trên mọi chuyến xe đã được giao đủ.

### Bước 5: Quyết toán & Chi phí
1.  Khi xe về bãi, vào mục **"Quản lý chi phí"** của chuyến xe đó.
2.  Nhập các khoản chi thực tế: Xăng dầu, Cầu đường, Công an...
3.  Hệ thống sẽ tự tính **Lợi nhuận ròng** = (Tổng cước các Bill trên xe) - (Tổng chi phí).
4.  Vào mục Bill để cập nhật trạng thái **"Đã thanh toán"** khi nhận được tiền từ khách hàng.

---

## 💡 CÁC MẸO SỬ DỤNG HIỆU QUẢ
-   **Tìm kiếm nhanh:** Sử dụng ô tìm kiếm ở đầu mỗi trang để lọc vận đơn theo Mã Bill hoặc Tên khách hàng.
-   **Theo dõi công nợ:** Tại trang "Khách hàng", bạn có thể xem ai đang nợ cước nhiều nhất để ưu tiên thu hồi.
-   **Kiểm tra tải trọng:** Khi xếp hàng, hãy để ý tổng trọng lượng/thể tích ở chân trang để tránh xếp quá tải cho xe.
`;

export default function UserGuide() {
  return (
    <div className="animate-fade-in space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">Hướng dẫn sử dụng hệ thống</h2>
          <p className="text-slate-500 text-sm mt-1">Lộ trình 5 bước để vận hành hệ thống logistics chuyên nghiệp.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 italic text-xs font-medium">
          <Info className="w-4 h-4" />
          <span>Vui lòng đọc kỹ để tránh nhầm lẫn khi tách Bill.</span>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-3xs overflow-hidden">
        <div className="p-8 md:p-12 prose prose-slate max-w-none prose-headings:font-sans prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-2xl">
          <div className="markdown-body">
            <Markdown>{guideContent}</Markdown>
          </div>
        </div>
      </div>

      {/* Quick Access Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
          <div className="p-2 bg-emerald-500 text-white rounded-lg w-fit mb-4">
            <CheckCircle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-emerald-900 text-sm mb-2">Đúng Quy Trình</h4>
          <p className="text-emerald-700 text-xs leading-relaxed">Luôn đảm bảo tạo Bill trước khi tạo chuyến để hệ thống tự động bóc tách số liệu.</p>
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
          <div className="p-2 bg-blue-500 text-white rounded-lg w-fit mb-4">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-blue-900 text-sm mb-2">Tài Liệu Đầy Đủ</h4>
          <p className="text-blue-700 text-xs leading-relaxed">Mọi tính năng đều được mã hóa theo nghiệp vụ vận tải thực tế tại Việt Nam.</p>
        </div>

        <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
          <div className="p-2 bg-amber-500 text-white rounded-lg w-fit mb-4">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-amber-900 text-sm mb-2">Tối Ưu Vận Hành</h4>
          <p className="text-amber-700 text-xs leading-relaxed">Sử dụng chức năng Tách Bill (Split) để linh hoạt ghép hàng cho nhiều xe.</p>
        </div>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
          <div className="p-2 bg-slate-900 text-white rounded-lg w-fit mb-4">
            <HelpCircle className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-900 text-sm mb-2">Hỗ Trợ Kỹ Thuật</h4>
          <p className="text-slate-600 text-xs leading-relaxed">Liên hệ quản trị viên cấp cao nếu gặp lỗi trong quá trình đồng bộ dữ liệu.</p>
        </div>
      </div>
    </div>
  );
}
