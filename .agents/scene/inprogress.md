# Phase 3 — App: Scene Builder UI & Flow (Tuya Style) 🚧 IN PROGRESS

- [x] **Cấu trúc Route `(scene)`**: Chuyển tất cả hub, builder, device-selector vào nhóm route riêng.
- [x] **Store (Zustand)**: `scene-builder-store.ts` quản lý toàn bộ Action, Trigger, Setting hiển thị cục bộ. Bỏ Tanstack Form rườm rà.
- [x] **Scene Trigger Hub (`hub.tsx`)**: Đã gộp bảng, bỏ section thừa, nút "Nâng cao" to nổi bật.
- [x] **Scene Builder Screen (`builder.tsx`)**: 
  - Khung liệt kê Actions hỗ trợ Drag & Drop sắp xếp (`reorderActions`).
  - Lược bỏ TextField Name, chèn nút Lưu hiển thị tuỳ chọn Tuya-style `SaveSceneSheet` cuối luồng.
  - Cấu hình hiển thị: "Hiển thị trên Màn hình chính", "Gắn vào phòng".
- [x] **Device Selector (`device-selector.tsx`)**: Màn hình gọi hook device, list toàn bộ thiết bị. Móc tạm tự add switch khi click.
- [ ] **Device Action Config Sheet**: *[ĐANG CHỜ]* Xử lý bottom sheet lúc thao tác chọn Thiết bị cụ thể. Hiện thị danh sách công tắc / biến số của thiết bị & chọn giá trị (Bật/Tắt).
