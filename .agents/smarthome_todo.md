# Smart Home - To Do List Tính Năng Mới

Tài liệu này dùng để theo dõi, phân tích và lên kế hoạch (To-Do) cho các tính năng hệ thống chuẩn bị phát triển, giúp duy trì ngữ cảnh cho AI và team.

---

## Tính năng 1: Smart Scene (Kịch bản / Tự động hóa)

**Trạng thái**: 🚧 Đang triển khai — Skeleton có sẵn, cần hoàn thiện Engine + UI Builder.

📄 **Chi tiết → [Thư mục Scene](./scene/)**

**Tóm tắt việc cần làm:**
- **Server:** DB migration (icon/color/roomId) + Action Executor (`RUN_SCENE` Processor) + DEVICE_STATE trigger evaluation
- **App:** Kết nối API thay mock → Scene Builder UI (3 bước: Trigger → Actions → Customize) → Scene Detail/Edit screen

---




## Tính năng 2: Device Sharing (Chia sẻ thiết bị)


**Trạng thái**: ✅ Đã hoàn thành (Mức cơ bản cả UI và API).

### 1. Mô tả tổng quan

Tính năng cho phép chủ sở hữu thiết bị (Owner) có thể chia sẻ quyền điều khiển và quản lý thiết bị cho các thành viên khác trong gia đình hoặc khách. Hệ thống cần đảm bảo tính phân quyền (Admin, Editor, Viewer) và bảo mật khi thu hồi quyền truy cập.

### 2. Checklist Triển khai (To-Do)

**A. Phía Server (Backend: core-api)**

- [x] Phát triển API tạo lời mời chia sẻ (Share Invitation): (Đã làm API add trực tiếp qua email/phone).
- [x] Phát triển API chấp nhận chia sẻ: Tự động lưu thẳng vào bảng `DeviceShare` V1.
- [x] Quản lý phân quyền (Permissions): Xây dựng logic kiểm tra quyền (Guard/Interceptor) để đảm bảo Viewer không thể đổi tên thiết bị hay Editor không thể xóa thiết bị.
- [x] Logic thu hồi (Revoke): Chủ sở hữu có thể ngắt kết nối bất kỳ người dùng nào đang được chia sẻ.
- [x] Notification: Gửi thông báo cho người nhận khi có lời mời mới và thông báo cho chủ sở hữu khi có thay đổi.

**B1. Khởi tạo Deep Link / Mã QR (Tính năng mở rộng - Đang tiến hành)**

- [x] Thiết lập Expo Linking / App Scheme để hứng link `smarthome://share?token=...`.
- [x] Xây dựng Hook `useDeepLink` ở Root Component để capture token và điều hướng/popup accept.
- [x] Giao diện **Quét QR Code / Mời qua Link**: Mở rộng `create-share-modal.tsx` thêm tab quét và lấy link chia sẻ.
- [x] Cửa sổ `AcceptShareModal`: Popup hiển thị tóm tắt thông tin thư mời ("X muốn chia sẻ Y") với 2 nút Đồng ý/Từ chối.

**B2. Phía Mobile App (App: new-app)**

- [x] Thiết kế UI trang "Quản lý thành viên/Chia sẻ": Hiển thị danh sách những người đang có quyền truy cập thiết bị.
- [x] Thiết kế UI trang "Mời thành viên": Nhập ID, Email hoặc quét mã QR của người nhận. (Phần Bottom Sheet Modal cho App).
- [x] Tích hợp API chia sẻ: Gọi các endpoint mới để thực hiện luồng cấp quyền.
- [x] Xử lý Trạng thái hiển thị (UI logic): Ẩn chức năng "Chia sẻ thiết bị" đối với User thuộc nhóm Share.

### 3. Những câu hỏi Mở / Thảo luận kiến trúc (Open Issues)

- Cơ chế mời qua cái gì là tối ưu nhất? (Email link, QR Code quét trực tiếp, hay nhập số điện thoại ID người dùng).
- Có giới hạn số lượng người được chia sẻ trên một thiết bị không?
- Khi chủ sở hữu xóa thiết bị (Unbind), tất cả các liên kết chia sẻ có tự động bị xóa sạch không? (Dự kiến là có).

---

## Tính năng 3: Timer & Schedule (Hẹn giờ và Lịch trình)

**Trạng thái**: ✅ Đã hoàn thành UI App (Backend cũng đã có).

### 1. Mô tả tổng quan

Cho phép người dùng đặt lịch bật/tắt thiết bị theo thời gian cố định, đếm ngược hoặc lặp lại theo các ngày trong tuần.

### 2. Checklist Triển khai (To-Do)

**A. Phía Server (Backend: worker-service)**

- [x] Xây dựng bảng `DeviceTimer` và `DeviceSchedule`.
- [x] Tích hợp BullMQ để quản lý các Jobs đếm ngược (Countdown).
- [x] Xây dựng Scheduler (Cron) để quét và thực thi các lịch trình lặp lại hàng ngày/hàng tuần.

**B. Phía Mobile App (eec-app-smarthome)**

- [x] UI thiết lập thời gian (Time picker) qua BottomSheet (CountdownEditorSheet / ScheduleEditorSheet).
- [x] UI chọn ngày lặp lại trong tuần tự thay đổi giao diện.
- [x] Thiết lập Redux/Zustand Store + React Query Mutate API cho Timers và Schedules.
- [x] DeviceActionBar phân luồng linh hoạt (Group Devices / Single Device).

---

## Tính năng 5: Update User Profile (Cập nhật thông tin cá nhân)

**Trạng thái**: ✅ Đã hoàn thành.

### 1. Mô tả tổng quan
Cho phép người dùng thay đổi thông tin định danh cá nhân như Tên (First Name), Họ (Last Name) và ảnh đại diện (Avatar). Đây là bước cơ bản để cá nhân hóa trải nghiệm người dùng trong hệ thống nhà thông minh.

### 2. Checklist Triển khai (To-Do)

**A. Phía Server (Backend: core-api)**
- [x] Phát triển API Endpoint `PUT /v1/user`: Cập nhật thông tin `firstName`, `lastName`, `avatar`.
- [x] Tích hợp xử lý Upload ảnh Avatar: Sử dụng S3 hoặc Local Storage để lưu trữ ảnh thực tế thay vì chỉ lưu chuỗi string. (Đã sử dụng Cloudinary Upload trực tiếp từ App).
- [x] Validation nâng cao: Kiểm tra độ dài, ký tự đặc biệt cho tên người dùng.

**B. Phía Mobile App (App: new-app)**
- [x] Thiết kế UI màn hình "Hồ sơ cá nhân" (Profile): Hiển thị thông tin hiện tại và các trường cho phép chỉnh sửa.
- [x] Tích hợp API Update: Gọi endpoint `PUT /v1/user` khi người dùng nhấn "Lưu".
- [x] Chức năng đổi Avatar: Tích hợp `expo-image-picker` để chọn ảnh từ thư viện hoặc chụp ảnh mới. (Đã thêm Alert chọn Camera / Library).
- [x] Đồng bộ State: Cập nhật thông tin mới vào Zustand store ngay sau khi update thành công để hiển thị đồng bộ trên toàn app.

### 3. Những câu hỏi Mở / Thảo luận kiến trúc (Open Issues)
- Có nên cho phép đổi Số điện thoại / Email tại đây không? (Thường cần qua luồng OTP riêng để đảm bảo bảo mật).
- Kích thước ảnh tối đa cho Avatar là bao nhiêu để tối ưu dung lượng lưu trữ?
