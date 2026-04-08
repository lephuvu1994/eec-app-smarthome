# To-Do: Smart Switch Integration

## 1. Mạch dữ liệu (Data & Server)
- [ ] Bổ sung / Cập nhật Blueprint `switch-1ch.json` -> `switch-4ch.json`:
  - Thêm `attributes`: `power_on_behavior` (off, on, previous). Lưu ý gán `commandKey` như `power_on_behavior_l1`, `power_on_behavior_l2` cho phù hợp số lượng kênh.
  - Thêm `attributes`: `indicator_mode` (none, relay, pos).
  - Thêm `attributes`: `child_lock` (LOCK/UNLOCK, thường là config Global).
  - Thêm `attributes`: `inching_mode` (number - countdown seconds).

## 2. Giao diện Mobile App (new-app)
- [x] **Khởi tạo Domain:** Tạo folder `src/features/devices/types/switch`.
- [ ] **Home Dashboard:**
  - Logic Flat Mode qua `activeEntity` (Tách riêng N công tắc thành N Card).
  - Power / Quick Toggle trên Card.
- [ ] **Detail Screen:**
  - [x] Giao diện dạng Group (Hiển thị tất cả phím bấm công tắc).
  - [ ] Chức năng: Đếm ngược, Lịch trình (mở BottomSheet `DeviceActionBar` chuẩn).
  - [x] Đổi tên nhánh (Long Press to rename Entity).
- [ ] **Settings Screen:**
  - UI Option chọn `Power-on behavior` (Khôi phục trạng thái nguồn).
  - UI Option chọn `Indicator mode` (Đèn báo nền).
  - Switch Toggle cho `Child Lock`.
