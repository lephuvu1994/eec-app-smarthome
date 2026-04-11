# Smart Scene (Kịch bản / Tự động hóa) — Implementation Plan

**Trạng thái**: 🚧 Đang triển khai — Phase 1 & 2 hoàn tất. Phase 3 đang hoàn thiện UI/UX.

**Hướng đi**: Kết hợp **Tuya UX** (Tất cả hiển thị trên List + Action Sheets tiện lợi, dời việc đặt tên vào khâu lưu). 

## Mô tả tổng quan

Tính năng "Kịch bản" cho phép người dùng nhóm nhiều hành động điều khiển thiết bị lại và tự động hóa chúng theo lịch, vị trí hoặc trạng thái cảm biến (If-Then). Phân 2 loại:
- **Chạy tay (Tap-to-Run):** triggers = [] — bấm nút là chạy ngay.
- **Tự động hóa (Automation):** có trigger(s) — server tự kích khi điều kiện thỏa.

---

## Phase 1 — Server: Schema + DTOs + Anti-Loop Engine ✅ DONE

- **Database Migration**: Thêm fields (icon, color, roomId, sortOrder), Update Action DTO delayMs. 
- **Action Executor**: `handleRunScene`, `handleSceneDeviceActions`, `handleCheckDeviceStateTriggers`.
- **Anti-Loop Engine (v2: HA + Tuya hybrid)**: State Transition Filter, Rate Limit (`minIntervalSeconds`), Chain Depth Guard (max 5 hops).
- **delayMs execution**: BullMQ delayed jobs.

---

## Phase 2 — App: Kết nối API & SortOrder ✅ DONE

- [x] **API Services**: Cập nhật Model (Thêm `icon`, `color`, `roomId`, `minIntervalSeconds`, `sortOrder`). Tạo endpoints và hooks (`useCreateScene`, `useUpdateScene`, `useDeleteScene`, `useReorderScenes`).
- [x] **Phân loại hiển thị**: Map data từ API lên các tab "Tap-to-run" (manual) và "Automation". 
- [x] **Kéo thả / Reorder (Optimistic Updates)**: Triển khai flow dời vị trí kịch bản, update ngay trên App (cache) và gọi ngầm lệnh PATCH `/scenes/reorder` lên Server.
- [x] Filter kịch bản theo `roomId`.

---

## Phase 3 — App: Scene Builder UI & Flow (Tuya Style) 🚧 IN PROGRESS

- [x] **Cấu trúc Route `(scene)`**: Chuyển tất cả hub, builder, device-selector vào nhóm route riêng.
- [x] **Store (Zustand)**: `scene-builder-store.ts` quản lý toàn bộ Action, Trigger, Setting hiển thị cục bộ. Bỏ Tanstack Form rườm rà.
- [x] **Scene Trigger Hub (`hub.tsx`)**: Đã gộp bảng, bỏ section thừa, nút "Nâng cao" to nổi bật.
- [x] **Scene Builder Screen (`builder.tsx`)**: 
  - Khung liệt kê Actions hỗ trợ Drag & Drop sắp xếp (`reorderActions`).
  - Lược bỏ TextField Name, chèn nút Lưu hiển thị tuỳ chọn Tuya-style `SaveSceneSheet` cuối luồng.
  - Cấu hình hiển thị: "Hiển thị trên Màn hình chính", "Gắn vào phòng".
- [x] **Device Selector (`device-selector.tsx`)**: Màn hình gọi hook device, list toàn bộ thiết bị. Móc tạm tự add switch khi click.
- [ ] **Device Action Config Sheet**: *[ĐANG CHỜ]* Xử lý bottom sheet lúc thao tác chọn Thiết bị cụ thể. Hiện thị danh sách công tắc / biến số của thiết bị & chọn giá trị (Bật/Tắt).

---

## Phase 4 — App: Scene Actions & Triggers Cấp Cao (Advance) ⏳ TODO

- [ ] **Config Actions (Ngoài Device)**:
  - Form chọn Delay (Chờ báo thức / Đếm ngược mili-giây).
  - Form Gửi thông báo Push.
  - Chọn khởi động Scene khác.
- [ ] **Config Triggers (Automation)**:
  - Form tạo Lịch trình (Schedule) - Cron expression.
  - Form chọn Cảm biến (Device State Change).
  - Khởi tạo Notification Action DTO tương ứng trên Backend.
- [ ] **Edit Mode**: Đẩy scene đang có lên `scene-builder-store` để cập nhật trạng thái "Sửa" thay vì tạo mới.
- [ ] **Scene Details**: Màn hình xem tóm tắt thông tin hoạt động, Enable/Disable scene nhanh.
- [ ] Xoá Scene (`useDeleteScene`).

---

## Thứ tự ưu tiên & Tiến độ

| # | Task | Môi trường | Status |
|---|------|------------|--------|
| 1 | DB migration & Server Engine | Server | ✅ DONE |
| 2 | Kéo api, Sort order Optimistic | Fullstack | ✅ DONE |
| 3 | Xây dựng Routing & Builder Flow (Hub/Store) | App | ✅ DONE |
| 4 | Fix UI/UX Multi-language (Vi-En) Builder | App | ✅ DONE |
| 5 | Hoàn thiện Device Config & Entity Selector | App | 🚧 DOING |
| 6 | Bổ sung Trigger Schedule, Device State | App | ⏳ NEXT |
| 7 | Edit Mode + Delete Mode | App | ⏳ TODO |
