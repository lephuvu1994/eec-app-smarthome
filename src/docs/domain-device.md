# Kiến Trúc Domain: User - Home - Device (Chuẩn Tuya / Smart Life)

Dựa trên cấu trúc `Prisma Schema` hiện tại của bạn, kiến trúc hệ thống đang đi theo **Mô hình Hybrid của Tuya Smart**, không phải mô hình khép kín của Apple HomeKit.

Đây là một thiết kế **rất tốt và linh hoạt**, giải quyết được tất cả các bài toán: Nhiều nhà, Chia sẻ thiết bị lẻ, và Chia sẻ cả nhà.

Dưới đây là giải phẫu Logic / Business Flow để bạn không bị rối:

## 1. Bản chất Sở Hữu (Ownership)
- **Thiết Bị (Device)** là tài sản cá nhân. Nó luôn phải có một người chủ sở hữu duy nhất: `Device.ownerId = User.id`.
  - Người Master này có toàn quyền: Xóa thiết bị, Reset, Đổi tên, Cập nhật Firmware.
- **Nhà (Home)** là một khái niệm không gian logic (Logical Boundary).
  - User có thể tạo ra nhiều Nhà (Nhà Hà Nội, Nhà Quê, Văn Phòng).

## 2. Bản chất Gán Ghép (Placement)
Mặc dù thiết bị thuộc về User, nhưng về mặt không gian vật lý, thiết bị đó phải được đặt ở đâu đó.
- Trường hợp 1: User gán thiết bị vào **Nhà Hà Nội** -> `Device.homeId = HomeHN`.
- Trường hợp 2: User đem thiết bị về **Nhà Quê** -> User chỉ việc đổi `Device.homeId = HomeQue`. Thiết bị vẫn là của User đó, chỉ đổi vị trí.
- Trường hợp 3: User vừa mua thiết bị về, chưa kịp tạo nhà -> `Device.homeId = null`. (Thiết bị nằm ở mục "Phòng Thiết Bị Chờ" / Unassigned).

## 3. Bản chất Chia Sẻ (Sharing)
Cấu trúc DB của bạn hiện tại cho phép 2 kiểu chia sẻ cực kỳ mạnh mẽ:

### Kiểu A: Chia sẻ Nhà (Home Sharing - Giống HomeKit)
- Bạn (Chủ nhà) mời Vợ vào làm thành viên của **Nhà Hà Nội** (Record: `HomeMember`).
- **Hệ quả:** Vợ bạn sẽ tự động thấy TẤT CẢ các thiết bị đang có `homeId = Nhà Hà Nội`.
- Khi bạn mua 1 cái Bóng Đèn mới và gán vào Nhà Hà Nội, vợ bạn lập tức điều khiển được luôn mà bạn không cần phải Share lại từ đầu.

### Kiểu B: Chia sẻ Thiết bị Lẻ (Single Device Sharing - Hàng độc quyền của Tuya)
- Bạn có một cái Camera giám sát ở cửa, thuộc Nhà Hà Nội. Bạn không muốn Hàng Xóm biết trong nhà bạn có bao nhiêu phòng hay đèn đóm ra sao, bạn CHỈ muốn cho Hàng Xóm xem cái Camera.
- Bạn chia sẻ riêng cái Camera cho Hàng Xóm (Record: `DeviceShare -> deviceId, userId`).
- **Hệ quả:** Hàng Xóm mở app lên, họ sẽ thấy cái Camera này nằm lơ lửng ở mục **Thiết Bị Được Chia Sẻ**, họ hoàn toàn không biết cấu trúc "Nhà Hà Nội" của bạn trông như thế nào.

---

## 4. Flow hiển thị trên React Native (Cách App nên hoạt động)
Để UI/UX không bị rối cho người dùng cuối (User), App của bạn phải code theo nguyên tắc **"Home Context" (Bối cảnh Nhà)**:

1. **Top Bar luôn có một cái Dropdown chọn "Nhà Hiện Tại":**
   - App phải luôn có 1 biến global state (Zustand) là `currentHomeId`.
   - Mọi API gọi thiết bị, phòng, tầng đều phải filter theo `homeId` này: `useHomeDevices(currentHomeId)`.

2. **Nếu User chọn "Nhà Hà Nội":**
   - App chỉ vẽ ra Cấu trúc (Tầng/Phòng) của Nhà Hà Nội.
   - App chỉ vẽ ra Các Thiết Bị có `homeId = Nhà Hà Nội`. Dù User đó là Chủ sở hữu hay là Vợ (được share nhà), UI cư xử y hệt nhau.

3. **Mục Quản lý Thiết Bị Độc Lập (All Devices):**
   - Sẽ có một màn hình riêng trong Setting (hoặc All Devices Tab) gọi API lấy TẤT CẢ thiết bị theo `ownerId = User.id` hoặc `sharedUsers = User.id` (Không quan tâm `homeId`).
   - Màn hình này dùng để: Xem lại toàn bộ tài sản, Gom nhóm thiết bị chưa có nhà vào phòng, hoặc Quản lý quyền chia sẻ lẻ tẻ.

## Tổng Kết
Sự "rối" của bạn đến từ việc nhập nhằng giữa **Tài sản (Ownership)** và **Vị trí (Placement)**.
Hãy nhớ câu thần chú này: **Thiết bị là Tài sản của User, nhưng nó Tồn tại trong Không gian của Home.**

Giữ nguyên cấu trúc Prisma Schema hiện tại của bạn, nó đã hoàn hảo cho hệ thống Scale lớn. Trên tầng React Native, bạn chỉ cần ép User vào từng bối cảnh `Home` (thông qua `home-data-store`) là mọi thứ sẽ cực kỳ clear!
