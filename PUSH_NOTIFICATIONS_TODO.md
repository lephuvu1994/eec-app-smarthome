# Push Notifications - Plan & To-Do

Tài liệu này ghi chú lại cấu hình cần thiết để hệ thống Push Notification hoạt động trên môi trường thật (iOS/Android) và tóm tắt lại kiến trúc/kế hoạch phần Push Notification ở cả Server và App.

---

## 1. Cấu hình ứng dụng thật (App Configuration)
*(Dành cho ngày mai khi bạn tiếp tục làm)*

### iOS (APNs - Apple Push Notification service)
1. Truy cập [Apple Developer Portal](https://developer.apple.com/) -> **Keys**
2. Tạo một Key mới, nhớ tick chọn **Apple Push Notifications service (APNs)**.
3. Tải file `.p8` về máy. Lưu ý chỉ tải được 1 lần duy nhất.
4. Mở terminal tại thư mục `eec-app-smarthome`, chạy lệnh: `eas credentials`
5. Chọn nền tảng `iOS` -> `Push Notifications` -> Trả lời các câu hỏi để cấp file `.p8`, `Key ID` và `Team ID` cho EAS của Expo.

### Android (FCM - Firebase Cloud Messaging)
1. Truy cập [Firebase Console](https://console.firebase.google.com/) và tạo hoặc mở project.
2. Thêm **Android App** vào Firebase (sử dụng Package Name nằm trong file `app.config.ts`, ví dụ `com.yourcompany.smarthome`).
3. Tải file `google-services.json` về và đặt ở thư mục gốc của app (`eec-app-smarthome/`).
4. Nếu dùng Expo Legacy: Lấy Cloud Messaging Server Key trong Firebase Console tải lên trang quản lý chứng chỉ của Expo (phần EAS credentials).

### Cập nhật `app.config.ts`
Chỉnh sửa lại cấu hình trong file `app.config.ts`:
```typescript
{
  android: {
    // Thêm đường dẫn file google services:
    googleServicesFile: "./google-services.json",
  },
  plugins: [
    [
      "expo-notifications",
      {
        "icon": "./assets/notification-icon.png", // Bạn cần chuẩn bị 1 file icon (PNG trong suốt, dạng silhouette, trắng đen)
        "color": "#1A73E8" // Màu hiển thị mặc định của icon notification
      }
    ]
  ],
  extra: {
    eas: {
      projectId: "your-expo-project-id" // Chắc chắn project Id đã đúng với Expo Project
    }
  }
}
```

### Build lại native
Do ứng dụng dùng React Native CLI/Prebuild thông qua folder `ios/` và `android/`, sau khi thay đổi config bạn cần sinh lại bộ code native:
```bash
npx expo prebuild --clean
```

---

## 2. Tóm tắt Plan Push Notification (Đã làm & Hiện tại)

### A. Phía Server (`euro-smart-server`) - HOÀN THÀNH
- **Data Model**: Đã thêm cột `push_token` (TEXT) trên DB table `t_session` (và tạo migration).
- **Core API (`UserSessionController`)**: API để device lưu trữ/cập nhật `pushToken` của phiên hiện tại sau khi đăng nhập:
  - App gọi API `PATCH /user-sessions/me/push-token` truyền `{ token: "ExpoPushToken[xxx]" }`.
- **Worker Service (`NotificationProcessor`)**:
  - Tích hợp package `expo-server-sdk`.
  - Có các Helper/Jobs chuyên nghiệp: `sendToUser` (lấy tất cả session của User và push), `sendToHome` (push cho toàn bộ thành viên trong Home), `sendDeviceAlert` (kiểm tra config nhận cảnh báo của thiết bị trước khi push cho owner).
- **IoT Gateway (`MqttInboundService`)**: Cấu hình tự động đẩy cảnh báo (trigger BullMQ jobs) cho thiết bị (VD: Device Offline/Online) đưa job vào `notificationQueue`.
- **Unit Tests**: Coverage `Worker` và `Core API` hiện đã đạt mức qua 95%, mocks setup chặt chẽ.

### B. Phía App (`eec-app-smarthome`) - ĐÃ CODE PHẦN KHUNG
- **Hook `usePushNotifications`**:
  - Tích hợp package `expo-notifications` và `expo-device`.
  - Hàm `requestPushPermissionManually`: Không xin quyền tự động. Khi user chủ động cài đặt hoặc vào một màn hình nhất định thì mới trigger hàm này để pop-up native OS.
  - Lấy token thực (`getExpoPushTokenAsync`) kết nối với `projectId`.
- **Giao diện & API Call**: Có API endpoint (`authService.updatePushToken()`) sẵn sàng.
- **Unit Tests**: Đã mock toàn bộ `expo-server-sdk`, fix lỗi timer và coverage đạt >95% ở mọi màn hình thông qua các file test.

### C. Công việc tiếp theo (To-Do cho ngày mai)
- **Tích hợp vào Giao diện (App)**: 
  1. Trong trang cài đặt Profile hoặc luồng Đăng nhập/Home, thêm nút/thao tác cho phép tính năng "Bật nhận thông báo", gọi hook `requestPushPermissionManually`.
  2. Khi sinh ra được token, gọi `authService.updatePushToken(token)`.
- Thực hiện **[Bước 1] Cấu hình ứng dụng thật** (tạo APNs, FCM json) như đã ghi chú phía trên.
- Tiến hành chạy ứng dụng trên thiết bị vật lý thật (Real Device - iOS hoặc Android) vì máy ảo Simulator của iOS không lấy được Device Push Token của Expo. Đảm bảo nhận notification đẩy về.
