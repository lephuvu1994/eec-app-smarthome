# Smart Home App - To Do List Tính Năng Mới (Mobile)

Tài liệu này dùng để theo dõi, phân tích và lên kế hoạch (To-Do) cho các tính năng hệ thống phía **Mobile App (React Native)**.
👉 **Phía Server**: Chuyển sang theo dõi chi tiết ở kho lưu trữ `euro-smart-server` tại đường dẫn: `../../euro-smart-server/.agents/smarthome_todo.md`

---

## Tính năng 1: Smart Scene (Ngữ cảnh / Tự động hóa)

**Trạng thái phía App**: Đang lên kế hoạch.
(Phía Server: ✅ Core đã triển khai, đang optimize scale).

### 1. Checklist Triển khai (To-Do)

- [ ] Khởi tạo thư mục và Route mới: `src/features/scene` hoặc mở rộng trên trang Smart-Screen hiện thời.
- [ ] Thiết kế UI/UX "Danh sách ngữ cảnh": Hiển thị các Scene cơ bản (Ra khỏi nhà, Về nhà, Đi ngủ...), có nút Kích hoạt nhanh bằng tay.
- [ ] Thiết kế UI/UX "Trình tạo Builder ngữ cảnh": Trải nghiệm kéo-thả hoặc danh sách luồng công việc chọn **IF** (Time, Device changes) và **THEN** (On/Off công tắc, Delay).
- [ ] Tích hợp API và State Management (Zustand + React Query) để đồng bộ thông tin cấu hình lên Server.

---

## Tính năng 2: Device Sharing (Chia sẻ thiết bị)

**Trạng thái phía App**: Đang chờ (Hiện tại chưa có cả UI và API).

### 1. Checklist Triển khai (To-Do)

- [ ] Thiết kế UI trang "Quản lý thành viên/Chia sẻ": Hiển thị danh sách những người đang có quyền truy cập thiết bị.
- [ ] Thiết kế UI trang "Mời thành viên": Nhập ID, Email hoặc quét mã QR của người nhận.
- [ ] Tích hợp API chia sẻ: Gọi các endpoint mới để thực hiện luồng mời và chấp nhận.
- [ ] Xử lý Trạng thái hiển thị (UI logic): Ẩn các nút "Setting" hoặc "Delete" nếu người dùng hiện tại chỉ có quyền Viewer/Editor.

---

## Tính năng 3: Timer & Schedule (Hẹn giờ và Lịch trình)

**Trạng thái phía App**: Đang triển khai UI.
(Phía Server: ✅ Đã triển khai).

### 1. Checklist Triển khai (To-Do)

- [ ] UI thiết lập thời gian (Time picker) cho chức năng hẹn giờ (Countdown/Timer).
- [ ] UI chọn thời gian và ngày lặp lại trong tuần cho chức năng lập lịch (Schedule).

---

## Tính năng 5: Update User Profile (Cập nhật thông tin cá nhân)

**Trạng thái phía App**: Đang triển khai.
(Phía Server: ✅ BE đã có API).

### 1. Checklist Triển khai (To-Do)

- [ ] Thiết kế UI màn hình "Hồ sơ cá nhân" (Profile): Hiển thị thông tin hiện tại và các trường cho phép chỉnh sửa.
- [ ] Tích hợp API Update: Gọi endpoint `PUT /v1/user` khi người dùng nhấn "Lưu".
- [ ] Chức năng đổi Avatar: Tích hợp `expo-image-picker` để chọn ảnh từ thư viện hoặc chụp ảnh mới.
- [ ] Đồng bộ State: Cập nhật thông tin mới vào Zustand store ngay sau khi update thành công để hiển thị đồng bộ trên toàn app.
