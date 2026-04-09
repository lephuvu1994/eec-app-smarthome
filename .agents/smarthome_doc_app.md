# Tài liệu Hệ thống: Smart Home Mobile App (new-app)

## 1. Tổng quan
Ứng dụng di động quản lý nhà thông minh (Smart Home) phát triển dựa trên nền tảng Obytes React Native Template. Ứng dụng hỗ trợ kết nối, cấu hình và điều khiển các thiết bị trong nhà thông qua REST API và giao thức thời gian thực MQTT.

## 2. Công nghệ Cốt lõi
- **Framework & Runtime**: React Native 0.81.5 chạy với công cụ phát triển tĩnh Expo SDK 54.
- **Ngôn ngữ lập trình**: TypeScript.
- **Routing**: Expo Router 6 (Luồng điều hướng theo cấu trúc thư mục).
- **UI/Styling**: TailwindCSS được tích hợp bởi NativeWind/Uniwind. Các thành phần kết dính hệ thống giao diện nằm phần lớn trong cấu hình global.css.
- **State Management**:
  - **Zustand**: Quản lý global states cho phần cứng (home, config, notification, device, auth).
  - **React Query**: Tự động cache, fetch dữ liệu từ REST API.
- **Form Validation**: TanStack Form kết hợp Zod.
- **Local Storage**: MMKV (Database Key-value bộ nhớ cục bộ đồng bộ siêu tốc lượng nhỏ).
- **Kết nối/Real-time**:
  - Chạy HTTP API request đến core-api.
  - Chạy MQTT Client (`src/lib/mqtt`) để nhận bản tin báo cáo thay đổi thiết bị và gửi lệnh điều khiển mượt mà.
- **Quản lý Media/Image**:
  - Tích hợp **Cloudinary REST API** thuần tư qua `src/lib/api/cloudinary/cloudinary.service.ts` để tối ưu hóa ảnh và tải lên ảnh đại diện mà không gắn SDK thừa thải. 
  - Ảnh được băm mã chữ ký (SHA1, HMAC) bảo mật cùng Expo Crypto.
  - Sử dụng `expo-image-picker` để lấy ảnh từ Thư viện và Camera.
- **BLE & Local Control**:
  - Giao tiếp Bluetooth Low Energy (BLE) qua `react-native-ble-manager`.
  - Hỗ trợ gửi lệnh điều khiển trực tiếp (Local Control) qua sóng Bluetooth cho các rơ-le / công tắc khi hệ thống Internet hoặc cloud Server gặp sự cố (bằng cách giao tiếp với uuid characteristics và mã hóa gói tin AES).
  - Background scanning BLE thiết bị ở chế độ im lặng (Silent Permissions) qua `useBleNearby`.

## 3. Cấu trúc thư mục (Code Structure)
Dự án sử dụng Feature-Driven Development.

```text
src/
├── app/              # Expo Router (Các màn hình mobile, tablet chính)
├── components/       # Các Component View tái sử dụng.
│   ├── ui            # Base UI (Button, Input, Icon...)
│   ├── layout        # Bố cục màn hình
│   └── base          # Scene, Timeline, Header phức hợp
├── constants/        # Tệp lưu hằng số dùng chung
├── features/         # Logic gộp theo Domain cụ thể:
│   ├── auth          # Tích hợp xác thực Access Token định tuyến đăng nhập
│   ├── devices       # Thêm mới thiết bị, giao diện quản lý Device
│   ├── home-screen   # Dashboard nhà thông minh trung tâm
│   ├── room          # Tùy biến vị trí trong phòng
│   ├── smart-screen  # Bảng control panel nhanh
│   ├── scan-qr       # Nhận diện module quét mã kết nối
│   └── settings-screen  # Cài đặt (ví dụ: thông báo)
├── stores/           # Zustand slices (HomeStore, ConfigStore...)
├── hooks/            # Reusable custom hooks phục vụ logic UI
├── lib/              # Modules API call, Config, Authentication core, i18n
├── translations/     # Resource cho đa ngôn ngữ (en.json, vi.json)
└── docs/             # Tài liệu UI guidelines nội bộ
```

## 4. Các Tính năng Trọng tâm (Features)
- **Timer & Schedule (Hẹn giờ và Lịch trình)**: Hỗ trợ người dùng đóng/mở công tắc, điều khiển rèm qua giao diện Bottom Sheet chọn giờ, tích hợp Action Bar thông minh hỗ trợ Single Device hoặc Group Devices. Quản lý trạng thái realtime cập nhật React Query theo API mới nhất.
- **Timeline & History**: Tính năng nhật ký sử dụng hiển thị bằng Timeline và phân loại cụ thể Nguồn sự kiện (Từ công tắc vật lý, MQTT, Automation).
- **Offline / Local Control**: Xử lý fallback rẽ nhánh lệnh. Khi Online, gửi qua Server → MQTT; Khi Offline mạng trễ, chuyển mode BLE Local Control để đảm bảo tính an toàn liên tục.
- **Automation / Scene**: (Đang dần hoàn thiện) - Chuỗi thiết lập If/Then phức hợp cho ngôi nhà thông minh.
- **Chia sẻ thiết bị (Device Sharing)**: Thiết lập phân quyền điều khiển (Editor / Viewer) cho các thành viên qua Username hoặc thông qua **Universal Linking / Deep Link** cấp phép 1 lần.

## 5. Đặc điểm và Quy định Project (Rules & Fixes)
1. **Kiểm soát Package**: Bắt buộc sử dụng `yarn` (tránh xung đột sinh bộ đệm từ pnpm/npm).
2. **Thiết lập thư viện CLI**: Ứng dụng đã thêm thủ công `@expo/cli` (phiên bản 54.0.22) trong `devDependencies` nhằm bypass lỗi tiền biên dịch (prebuild) nội bộ.
3. **Patch Packages**: Do hệ thống thay đổi Gradle structure trên template Android từ Expo SDK mới (thay thế function cũ bằng `autolinkLibrariesWithApp`), nên plugin module như `react-native-vlc-media-player` đã được fix cứng bằng bộ đệm thông qua `patch-package`. **Quy định**: Phải cập nhật lại regex nếu nâng cấp thư viện này.
4. **Fix lỗi Cache hệ thống Metro**: Áp dụng command tổ hợp xóa bộ nhớ Haste Map, Watchman, `.cache` khi có biến động Native module gây đứng project.
