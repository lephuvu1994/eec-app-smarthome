# To-Do: Smart Light Integration

## 1. Mạch dữ liệu (Data & Server)
- [ ] Bổ sung / Chỉnh sửa Blueprint `dimmer-light.json` (RGB):
  - Đổi modelCode thành `LIGHT_RGBCW` và đổi tên file thành `light-rgbcw.json`.
  - Thêm `attributes`: `power_on_behavior` và `do_not_disturb`.
  - Giữ nguyên / chuẩn hóa các trường color (`color_hs`, `color_rgb`, `effect`).
  - Thêm `attributes`: `color_temp` (2700-6500K).
  - Thêm `attributes`: `color` (JSON object h,s,v).
  - Thêm `attributes`: `effect` (night, reading, working...).

## 2. Giao diện Mobile App (new-app)
- [x] **Khởi tạo Domain:** Tạo folder `src/features/devices/types/light`.
- [ ] **Home Dashboard:**
  - [x] Logic Group Mode (Thiết bị hợp nhất, entity `main`).
  - [x] Quick Toggle On/Off.
  - [ ] Vuốt thanh trượt Mini-slider để chỉnh sáng trực tiếp bằng `onSlidingComplete` gọi Mqtt.
- [ ] **Detail Screen:**
  - [x] Tab 1: Ánh sáng trắng (White CCT) - Giao diện Color Wheel từ Vàng sang Trắng + Độ sáng.
  - [x] Tab 2: Màu sắc (RGB) - Giao diện Color Wheel Vô cực (HSV).
  - [x] Chức năng Automation: Đếm ngược, Lịch trình.
- [ ] **Settings Screen:**
  - Chế độ Mờ dần (Fade in/out Transition timer).
  - Rhythm / Music Sync (tùy chọn UI nếu có API).
