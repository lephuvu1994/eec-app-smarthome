# Kế hoạch Tích hợp Thiết bị Mới (Device Integration Plan)

Tài liệu này dựa trên tiêu chuẩn kiến trúc được định nghĩa tại `AI_INSTRUCTIONS.md`. Kế hoạch bao phủ việc mở rộng hỗ trợ cho các dòng thiết bị phần cứng mới trên nền tảng Smart Home React Native (new-app).

## 1. Unified Appliances (Nhóm Thiết bị hợp nhất)
Các thiết bị có nhiều chức năng nhưng gộp lại dưới 1 thẻ Dashboard duy nhất (Dùng entity `main`).

- [ ] **Air Conditioner / Climate (Điều hòa nhiệt độ)**
  - Thực thể chính: Code `main` kiểu `climate`. Attributes: Nhiệt độ, fan, mode.
  - Tách UI vào `src/features/devices/types/climate/`.
- [ ] **Robot Vacuum (Robot hút bụi)**
  - Thực thể chính: Code `main` kiểu `vacuum`.
  - Tách UI vào `src/features/devices/types/vacuum/`.
- [ ] **Water Heater (Bình nóng lạnh)**
  - Thực thể chính: Code `main` kiểu `water_heater`.
  - Tách UI vào `src/features/devices/types/water-heater/`.

## 2. Multi-Gang & Modifiers (Nhóm Thiết bị độc lập & Đa kênh)
Các thiết bị hiển thị thành N (Nhiều) thẻ độc lập trên Dashboard, nhưng vẫn quy về 1 Device Setting.

- [ ] **Smart Lights (Đèn thông minh)**
  - Thực thể: Code `light_1`, `light_2`. Attributes: Brightness, Color Temp, RGB.
  - Tách UI vào `src/features/devices/types/light/`.
- [ ] **Smart Curtain (Rèm cửa thông minh)**
  - Thực thể: Code `curtain_1`.
  - Tách UI vào `src/features/devices/types/curtain/`. (Chuẩn hóa State không dùng setState).

## Yêu cầu Tuân thủ Kiến trúc
- Không dùng `useState` cho real-time attributes.
- Kế thừa toàn bộ state từ `useDeviceStore`.
- Update state bằng `useDeviceEvent` + `updateDeviceEntity`.
- Phân biệt Group Mode và Flat Mode theo navigation `entityId`.
